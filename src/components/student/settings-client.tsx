"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Loader2, Save, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n, type Locale } from "@/lib/i18n";
import { toast } from "sonner";

export function StudentSettings() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">{t("nav.settings")}</h1>
      </div>

      <Card className="glass card-lux rounded-2xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          {t("common.language")}
        </h3>
        <div className="flex items-center gap-3">
          <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
            <SelectTrigger className="rounded-xl w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {locale === "ar" ? "اللغة الحالية" : "Current language"}
          </span>
        </div>
      </Card>

      <Card className="glass card-lux rounded-2xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          {theme === "dark" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
          {t("common.theme")}
        </h3>
        <div className="flex items-center gap-3">
          <Switch
            id="theme"
            checked={theme === "dark"}
            onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
          />
          <Label htmlFor="theme" className="cursor-pointer">
            {theme === "dark" ? t("common.dark") : t("common.light")}
          </Label>
        </div>
      </Card>

      <Card className="glass card-lux rounded-2xl p-5">
        <h3 className="font-semibold mb-4">{locale === "ar" ? "حول التطبيق" : "About"}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{locale === "ar" ? "الإصدار" : "Version"}</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{locale === "ar" ? "الإطار" : "Framework"}</span>
            <span className="font-mono">Next.js 16</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{locale === "ar" ? "قاعدة البيانات" : "Database"}</span>
            <span className="font-mono">Prisma + SQLite</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
