"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Phone, Save, Loader2, Lock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { updateProfileAction, changePasswordAction } from "@/lib/auth-actions";
import { toast } from "sonner";

export function ProfileClient({
  user,
}: {
  user: {
    id: string;
    fullName: string;
    phone: string;
    avatar: string | null;
    preferredLang: string;
    createdAt: Date;
    referralCode: string;
  };
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [avatar, setAvatar] = useState<string | null>(user.avatar);

  async function readImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">{t("nav.profile")}</h1>
      </div>

      <Card className="glass card-lux rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/30">
            {avatar ? <img src={avatar} alt="" /> : null}
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary-foreground text-xl">
              {user.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-display font-bold text-lg">{user.fullName}</h2>
            <p className="text-sm text-muted-foreground" dir="ltr">{user.phone}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(user.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en")}
            </p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1">{t("nav.profile")}</TabsTrigger>
          <TabsTrigger value="password" className="flex-1">{t("auth.password")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="glass card-lux rounded-2xl p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                f.append("avatar", avatar || "");
                startTransition(async () => {
                  await updateProfileAction(f);
                  toast.success(t("settings.saved"));
                  router.refresh();
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label>{t("auth.fullName")}</Label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                  <Input name="fullName" defaultValue={user.fullName} className="ps-9 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("auth.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                  <Input value={user.phone} disabled dir="ltr" className="ps-9 rounded-xl text-start text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {locale === "ar" ? "لا يمكن تغيير رقم الهاتف" : "Phone number cannot be changed"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "الصورة" : "Avatar"}</Label>
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center text-xs text-muted-foreground hover:border-primary transition-colors">
                    {avatar ? (locale === "ar" ? "✓ تم الاختيار" : "✓ Selected") : (locale === "ar" ? "اختر صورة" : "Choose image")}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 1024 * 1024) {
                          toast.error(locale === "ar" ? "حجم الصورة كبير (1MB كحد أقصى)" : "Image too large (max 1MB)");
                          return;
                        }
                        setAvatar(await readImage(file));
                      }
                    }}
                  />
                </label>
              </div>
              <Button type="submit" disabled={pending} className="rounded-xl">
                {pending ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Save className="w-4 h-4 me-2" />}
                {t("common.save")}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-4">
          <Card className="glass card-lux rounded-2xl p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                startTransition(async () => {
                  const r = await changePasswordAction(f);
                  if (r.ok) {
                    toast.success(t("settings.saved"));
                    e.currentTarget.reset();
                  } else {
                    toast.error(t(r.error));
                  }
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "كلمة المرور الحالية" : "Current password"}</Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                  <Input name="current" type="password" required className="ps-9 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "كلمة المرور الجديدة" : "New password"}</Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                  <Input name="next" type="password" required minLength={6} className="ps-9 rounded-xl" />
                </div>
              </div>
              <Button type="submit" disabled={pending} className="rounded-xl">
                {pending ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Save className="w-4 h-4 me-2" />}
                {t("common.save")}
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
