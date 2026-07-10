"use client";

import Link from "next/link";
import { useState } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Moon,
  Sun,
  Languages,
  Headphones,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, type Locale } from "@/lib/i18n";

export function SiteHeader({
  isAuthenticated,
  role,
}: {
  isAuthenticated: boolean;
  role?: "ADMIN" | "MODERATOR" | "STUDENT";
}) {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const mounted = useMounted();

  const dashHref =
    role === "ADMIN" || role === "MODERATOR" ? "/admin" : "/student";

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shadow-glow">
                <Headphones className="w-5 h-5 text-primary-foreground" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-chart-4 animate-pulse" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-base text-gradient">
                  {t("brand.name")}
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:block">
                  {t("brand.tagline")}
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/#courses">{t("nav.courses")}</NavLink>
              <NavLink href="/#features">{t("features.title")}</NavLink>
              <NavLink href="/#testimonials">{t("section.testimonials")}</NavLink>
              <NavLink href="/#faq">{t("section.faq")}</NavLink>
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Language */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Languages className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setLocale("ar" as Locale)}
                    className={locale === "ar" ? "bg-primary/10" : ""}
                  >
                    العربية
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocale("en" as Locale)}
                    className={locale === "en" ? "bg-primary/10" : ""}
                  >
                    English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {mounted && theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {isAuthenticated ? (
                <Button asChild size="sm" className="rounded-full">
                  <Link href={dashHref}>
                    <LayoutDashboard className="h-4 w-4 me-2" />
                    {t("nav.dashboard")}
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex rounded-full"
                  >
                    <Link href="/login">
                      <LogIn className="h-4 w-4 me-2" />
                      {t("nav.login")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full shadow-glow"
                  >
                    <Link href="/register">
                      <UserPlus className="h-4 w-4 me-2" />
                      {t("nav.register")}
                    </Link>
                  </Button>
                </>
              )}

              {/* Mobile menu */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass-strong border-b border-border/40"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              <MobileLink href="/#courses" onClick={() => setOpen(false)}>
                {t("nav.courses")}
              </MobileLink>
              <MobileLink href="/#features" onClick={() => setOpen(false)}>
                {t("features.title")}
              </MobileLink>
              <MobileLink href="/#testimonials" onClick={() => setOpen(false)}>
                {t("section.testimonials")}
              </MobileLink>
              <MobileLink href="/#faq" onClick={() => setOpen(false)}>
                {t("section.faq")}
              </MobileLink>
              {!isAuthenticated && (
                <Button asChild variant="outline" className="mt-2 rounded-full">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 me-2" />
                    {t("nav.login")}
                  </Link>
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-full transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-3 py-3 text-base font-medium rounded-xl hover:bg-accent/10 transition-colors"
    >
      {children}
    </Link>
  );
}
