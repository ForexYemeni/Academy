"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Wallet,
  Users,
  MessageCircle,
  Megaphone,
  Ticket,
  UserCog,
  Settings,
  Headphones,
  Menu,
  X,
  LogOut,
  CreditCard,
  Bell,
  Moon,
  Sun,
  Languages,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useI18n, type Locale } from "@/lib/i18n";
import { logoutAction } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

type Moderator = {
  canManageCourses: boolean;
  canManagePayments: boolean;
  canManageStudents: boolean;
  canManageCommunity: boolean;
  canManageAnnouncements: boolean;
  canManageSettings: boolean;
} | null;

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; role: "ADMIN" | "MODERATOR"; avatar?: string | null; moderator: Moderator };
  children: React.ReactNode;
}) {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin = user.role === "ADMIN";
  const mod = user.moderator;

  const navItems = [
    { href: "/admin", label: t("dash.title"), icon: LayoutDashboard, show: true },
    { href: "/admin/courses", label: t("courses.admin.title"), icon: BookOpen, show: isAdmin || mod?.canManageCourses },
    { href: "/admin/payments", label: t("payments.title"), icon: Wallet, show: isAdmin || mod?.canManagePayments },
    { href: "/admin/wallets", label: t("payments.methods"), icon: CreditCard, show: isAdmin || mod?.canManagePayments },
    { href: "/admin/plans", label: t("sub.selectPlan"), icon: Sparkles, show: isAdmin || mod?.canManagePayments },
    { href: "/admin/students", label: t("dash.students"), icon: Users, show: isAdmin || mod?.canManageStudents },
    { href: "/admin/community", label: t("community.title"), icon: MessageCircle, show: isAdmin || mod?.canManageCommunity },
    { href: "/admin/announcements", label: t("ann.title"), icon: Megaphone, show: isAdmin || mod?.canManageAnnouncements },
    { href: "/admin/coupons", label: t("coupons.title"), icon: Ticket, show: isAdmin },
    { href: "/admin/moderators", label: t("mod.title"), icon: UserCog, show: isAdmin },
    { href: "/admin/settings", label: t("settings.title"), icon: Settings, show: isAdmin || mod?.canManageSettings },
  ].filter((n) => n.show);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 start-0 w-64 flex-col bg-sidebar border-e border-sidebar-border">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shadow-glow">
            <Headphones className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="leading-none">
            <div className="font-display font-bold text-sm text-gradient">{t("brand.name")}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Admin Console</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scroll-lux">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4", active && "text-primary")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/30">
            <Avatar className="w-9 h-9 border-2 border-primary/30">
              {user.avatar ? <img src={user.avatar} alt={user.name} /> : null}
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <Badge variant="outline" className="text-[10px] mt-0.5">
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 glass-strong border-b border-border/40">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="rounded-full">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center">
                <Headphones className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-sm text-gradient">{t("brand.name")}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Languages className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocale("ar" as Locale)} className={locale === "ar" ? "bg-primary/10" : ""}>
                  العربية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale("en" as Locale)} className={locale === "en" ? "bg-primary/10" : ""}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: locale === "ar" ? 320 : -320 }}
              animate={{ x: 0 }}
              exit={{ x: locale === "ar" ? 320 : -320 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed inset-y-0 start-0 z-50 w-72 bg-sidebar border-e border-sidebar-border flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center">
                    <Headphones className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-display font-bold text-sm text-gradient">{t("brand.name")}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scroll-lux">
                {navItems.map((item) => {
                  const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-sidebar-border">
                <form action={logoutAction}>
                  <Button type="submit" variant="ghost" className="w-full justify-start rounded-xl">
                    <LogOut className="w-4 h-4 me-2 rtl:rotate-180" />
                    {t("nav.logout")}
                  </Button>
                </form>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:ps-64">
        {/* Topbar (desktop) */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 items-center justify-between gap-4 px-6 glass-strong border-b border-border/40">
          <div>
            <h2 className="font-semibold text-lg">
              {navItems.find((n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label ?? t("dash.title")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="rounded-full relative">
              <Link href="/admin/notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-chart-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Languages className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocale("ar" as Locale)} className={locale === "ar" ? "bg-primary/10" : ""}>
                  العربية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale("en" as Locale)} className={locale === "en" ? "bg-primary/10" : ""}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0.5 h-9 w-9">
                  <Avatar className="w-8 h-8 border-2 border-primary/30">
                    {user.avatar ? <img src={user.avatar} alt={user.name} /> : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary-foreground text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <Badge variant="outline" className="text-[10px] mt-1 w-fit">{user.role}</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Headphones className="w-4 h-4 me-2" />
                    {t("nav.home")}
                  </Link>
                </DropdownMenuItem>
                <form action={logoutAction}>
                  <button type="submit" className="w-full">
                    <DropdownMenuItem>
                      <LogOut className="w-4 h-4 me-2 rtl:rotate-180" />
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
