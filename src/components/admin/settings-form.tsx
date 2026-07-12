"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { updateSettingsAction } from "@/lib/admin-actions";
import { toast } from "sonner";

export function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const input: Record<string, any> = {};
    for (const [k, v] of f.entries()) {
      if (typeof v === "string") {
        if (v === "on") input[k] = true;
        else input[k] = v;
      }
    }
    // Booleans from switches
    ["registrationEnabled", "communityEnabled", "notificationsEnabled"].forEach((k) => {
      input[k] = f.get(k) === "on";
    });
    startTransition(async () => {
      await updateSettingsAction(input);
      toast.success(t("settings.saved"));
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <Tabs defaultValue="platform">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="platform">{t("settings.platform")}</TabsTrigger>
          <TabsTrigger value="brand">{t("settings.brand")}</TabsTrigger>
          <TabsTrigger value="community">{t("settings.community")}</TabsTrigger>
          <TabsTrigger value="privacy">{t("settings.privacy")}</TabsTrigger>
          <TabsTrigger value="terms">{t("settings.terms")}</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="mt-4">
          <Card className="glass card-lux rounded-2xl">
            <CardHeader><CardTitle className="text-base">{t("settings.platform")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{locale === "ar" ? "اسم المنصة (عربي)" : "Platform Name (Ar)"}</Label>
                  <Input name="platformNameAr" defaultValue={initialSettings.platformNameAr} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === "ar" ? "اسم المنصة (إنجليزي)" : "Platform Name (En)"}</Label>
                  <Input name="platformNameEn" defaultValue={initialSettings.platformNameEn} dir="ltr" className="rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{locale === "ar" ? "الوصف (عربي)" : "Description (Ar)"}</Label>
                  <Textarea name="descriptionAr" defaultValue={initialSettings.descriptionAr ?? ""} className="rounded-xl min-h-20" />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === "ar" ? "الوصف (إنجليزي)" : "Description (En)"}</Label>
                  <Textarea name="descriptionEn" defaultValue={initialSettings.descriptionEn ?? ""} dir="ltr" className="rounded-xl min-h-20" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>{locale === "ar" ? "البريد" : "Email"}</Label>
                  <Input name="contactEmail" type="email" defaultValue={initialSettings.contactEmail ?? ""} dir="ltr" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === "ar" ? "الهاتف" : "Phone"}</Label>
                  <Input name="contactPhone" defaultValue={initialSettings.contactPhone ?? ""} dir="ltr" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === "ar" ? "العنوان" : "Address"}</Label>
                  <Input name="contactAddress" defaultValue={initialSettings.contactAddress ?? ""} className="rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{locale === "ar" ? "العملة" : "Currency"}</Label>
                  <Input name="currency" defaultValue={initialSettings.currency ?? "YER"} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === "ar" ? "اللون الأساسي" : "Primary Color"}</Label>
                  <Input name="primaryColor" type="color" defaultValue={initialSettings.primaryColor ?? "#7C3AED"} className="rounded-xl h-10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{locale === "ar" ? "رسالة الترحيب (عربي)" : "Welcome (Ar)"}</Label>
                  <Textarea name="welcomeMessageAr" defaultValue={initialSettings.welcomeMessageAr ?? ""} className="rounded-xl min-h-16" />
                </div>
                <div className="space-y-1.5">
                  <Label>{locale === "ar" ? "رسالة الترحيب (إنجليزي)" : "Welcome (En)"}</Label>
                  <Textarea name="welcomeMessageEn" defaultValue={initialSettings.welcomeMessageEn ?? ""} dir="ltr" className="rounded-xl min-h-16" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Switch id="registrationEnabled" name="registrationEnabled" defaultChecked={initialSettings.registrationEnabled} />
                  <Label htmlFor="registrationEnabled" className="text-sm cursor-pointer">{locale === "ar" ? "تفعيل التسجيل" : "Enable Registration"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="communityEnabled" name="communityEnabled" defaultChecked={initialSettings.communityEnabled} />
                  <Label htmlFor="communityEnabled" className="text-sm cursor-pointer">{locale === "ar" ? "تفعيل المجتمع" : "Enable Community"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="notificationsEnabled" name="notificationsEnabled" defaultChecked={initialSettings.notificationsEnabled} />
                  <Label htmlFor="notificationsEnabled" className="text-sm cursor-pointer">{locale === "ar" ? "تفعيل الإشعارات" : "Enable Notifications"}</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand" className="mt-4">
          <Card className="glass card-lux rounded-2xl">
            <CardHeader><CardTitle className="text-base">{t("settings.brand")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "الشعار (URL)" : "Logo (URL)"}</Label>
                <Input name="logo" defaultValue={initialSettings.logo ?? ""} dir="ltr" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "الأيقونة (URL)" : "Favicon (URL)"}</Label>
                <Input name="favicon" defaultValue={initialSettings.favicon ?? ""} dir="ltr" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "اللون الثانوي" : "Accent Color"}</Label>
                <Input name="accentColor" type="color" defaultValue={initialSettings.accentColor ?? "#06B6D4"} className="rounded-xl h-10" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="mt-4">
          <Card className="glass card-lux rounded-2xl">
            <CardHeader><CardTitle className="text-base">{t("settings.community")}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Switch id="communityEnabled2" name="communityEnabled" defaultChecked={initialSettings.communityEnabled} />
                <Label htmlFor="communityEnabled2" className="text-sm cursor-pointer">
                  {locale === "ar" ? "السماح بنشر المنشورات والتعليقات" : "Allow posts and comments"}
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-4">
          <Card className="glass card-lux rounded-2xl">
            <CardHeader><CardTitle className="text-base">{t("settings.privacy")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "سياسة الخصوصية (عربي)" : "Privacy Policy (Ar)"}</Label>
                <Textarea name="privacyAr" defaultValue={initialSettings.privacyAr ?? ""} className="rounded-xl min-h-40" />
              </div>
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "سياسة الخصوصية (إنجليزي)" : "Privacy Policy (En)"}</Label>
                <Textarea name="privacyEn" defaultValue={initialSettings.privacyEn ?? ""} dir="ltr" className="rounded-xl min-h-40" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="mt-4">
          <Card className="glass card-lux rounded-2xl">
            <CardHeader><CardTitle className="text-base">{t("settings.terms")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "الشروط والأحكام (عربي)" : "Terms (Ar)"}</Label>
                <Textarea name="termsAr" defaultValue={initialSettings.termsAr ?? ""} className="rounded-xl min-h-40" />
              </div>
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "الشروط والأحكام (إنجليزي)" : "Terms (En)"}</Label>
                <Textarea name="termsEn" defaultValue={initialSettings.termsEn ?? ""} dir="ltr" className="rounded-xl min-h-40" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={pending} size="lg" className="rounded-xl shadow-glow">
          {pending ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Save className="w-4 h-4 me-2" />}
          {t("settings.save")}
        </Button>
      </div>
    </form>
  );
}
