"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Heart,
  Wallet,
  Bell,
  User,
  Settings,
  Headphones,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Languages,
  Gift,
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

export function StudentShell({
  user,
  children,
}: {
  user: {
    id: string;
    name: string;
    phone: string;
    avatar?: string | null;
    referralCode: string;
    referralRewards: number;
    preferredLang: string;
  };
  children: React.ReactNode;
}) {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/student", label: t("student.welcome"), icon: Home },
    { href: "/student/courses", label: t("student.myCourses"), icon: BookOpen },
    { href: "/student/community", label: t("community.title"), icon: Heart },
    { href: "/student/payments", label: t("payments.title"), icon: Wallet },
    { href: "/student/notifications", label: t("notif.title"), icon: Bell },
    { href: "/student/referral", label: t("student.referralLink"), icon: Gift },
    { href: "/student/profile", label: t("nav.profile"), icon: User },
    { href: "/student/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border/40 pb-safe">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-medium transition-colors",
                  active ? "text-primary bg-primary/10" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="truncate max-w-full">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Top bar (mobile + desktop) */}
      <header className="sticky top-0 z-30 glass-strong border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={() => setOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shadow-glow">
                <Headphones className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-sm text-gradient hidden sm:inline">{t("brand.name")}</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="rounded-full relative">
              <Link href="/student/notifications">
                <Bell className="w-5 h-5" />
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
                    <span className="text-xs text-muted-foreground" dir="ltr">{user.phone}</span>
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
                <span className="font-display font-bold text-sm text-gradient">{t("brand.name")}</span>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scroll-lux">
                {navItems.map((item) => {
                  const active = pathname === item.href;
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 start-0 w-64 flex-col bg-sidebar border-e border-sidebar-border pt-16">
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scroll-lux">
          {navItems.map((item) => {
            const active = pathname === item.href;
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
      </aside>

      <div className="lg:ps-64">
        <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}
