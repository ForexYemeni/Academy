"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Headphones, ArrowRight, User, Phone, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      referralCode: typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("ref")
        : null,
    };

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? payload
        : { phone: payload.phone, password: payload.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error);
        toast.error(t(data.error));
        return;
      }

      toast.success(t("auth.success"));

      // Redirect based on role
      const role = data.user?.role;
      if (role === "ADMIN" || role === "MODERATOR") {
        router.push("/admin");
      } else {
        router.push(isRegister ? "/student" : "/student");
      }
      router.refresh();
    } catch (err: any) {
      setError("Server error");
      toast.error("Server error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 surface-aurora -z-10" />
      <div className="absolute top-0 -start-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 -end-32 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -z-10" />

      <div className="flex-1 grid place-items-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center shadow-glow">
              <Headphones className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-gradient">
              {t("brand.name")}
            </span>
          </Link>

          <div className="glass-strong rounded-3xl p-6 sm:p-8 card-lux">
            <div className="text-center mb-6">
              <h1 className="font-display font-bold text-2xl sm:text-3xl">
                {isRegister ? t("auth.register.title") : t("auth.login.title")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isRegister
                  ? t("auth.register.subtitle")
                  : t("auth.login.subtitle")}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                  <div className="relative">
                    <User className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      autoComplete="name"
                      required
                      minLength={3}
                      className="ps-9 rounded-xl"
                      placeholder={t("auth.fullName")}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    dir="ltr"
                    className="ps-9 rounded-xl text-start"
                    placeholder="+9677XXXXXXXX"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t("auth.phone.hint")}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    required
                    minLength={6}
                    className="ps-9 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-destructive bg-destructive/10 rounded-lg p-2.5">
                  {t(error)}
                </div>
              )}

              <Button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl h-11 shadow-glow"
              >
                {pending ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    {isRegister ? t("auth.registering") : t("auth.logging.in")}
                  </>
                ) : (
                  <>
                    {isRegister ? t("nav.register") : t("nav.login")}
                    <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isRegister ? t("auth.haveAccount") : t("auth.noAccount")}{" "}
              <Link
                href={isRegister ? "/login" : "/register"}
                className="text-primary font-medium hover:underline"
              >
                {isRegister ? t("nav.login") : t("nav.register")}
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← {t("common.back")}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
