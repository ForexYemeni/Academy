"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { upsertWalletAction } from "@/lib/admin-actions";
import { toast } from "sonner";
import type { Wallet } from "@prisma/client";

const methods = ["JAWALI", "JIB", "ONE_CASH", "CASH"] as const;

export function WalletsManager({ wallets }: { wallets: Wallet[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const byMethod = (m: string) => wallets.find((w) => w.method === m);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {methods.map((method) => {
        const wallet = byMethod(method);
        return (
          <WalletForm
            key={method}
            method={method}
            wallet={wallet}
            onSave={(input) => {
              startTransition(async () => {
                await upsertWalletAction(input);
                toast.success(t("settings.saved"));
                router.refresh();
              });
            }}
            pending={pending}
          />
        );
      })}
    </div>
  );
}

function WalletForm({
  method,
  wallet,
  onSave,
  pending,
}: {
  method: typeof methods[number];
  wallet?: Wallet;
  onSave: (input: any) => void;
  pending: boolean;
}) {
  const { t, locale } = useI18n();
  const [qrCode, setQrCode] = useState<string | null>(wallet?.qrCode || null);
  const [image, setImage] = useState<string | null>(wallet?.image || null);

  async function readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  return (
    <Card className="glass card-lux rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{t(`wallet.${method}`)}</h3>
          <p className="text-xs text-muted-foreground">
            {locale === "ar" ? "إعدادات المحفظة" : "Wallet settings"}
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSave({
            method,
            nameAr: f.get("nameAr") as string,
            nameEn: f.get("nameEn") as string,
            number: f.get("number") as string,
            qrCode,
            image,
            instructionsAr: (f.get("instructionsAr") as string) || "",
            instructionsEn: (f.get("instructionsEn") as string) || "",
            isActive: f.get("isActive") === "on",
          });
        }}
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">{locale === "ar" ? "الاسم (عربي)" : "Name (Ar)"}</Label>
            <Input name="nameAr" defaultValue={wallet?.nameAr || t(`wallet.${method}`)} className="rounded-lg" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{locale === "ar" ? "الاسم (إنجليزي)" : "Name (En)"}</Label>
            <Input name="nameEn" defaultValue={wallet?.nameEn || method} dir="ltr" className="rounded-lg" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{locale === "ar" ? "رقم المحفظة" : "Wallet Number"}</Label>
          <Input name="number" defaultValue={wallet?.number || ""} dir="ltr" className="rounded-lg" placeholder="7XXXXXXXX" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">QR Code</Label>
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-2 text-center text-xs text-muted-foreground hover:border-primary transition-colors">
                {qrCode ? "✓ ✓" : (locale === "ar" ? "رفع QR" : "Upload QR")}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setQrCode(await readFile(file));
                }}
              />
            </label>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{locale === "ar" ? "صورة المحفظة" : "Wallet Image"}</Label>
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-2 text-center text-xs text-muted-foreground hover:border-primary transition-colors">
                {image ? "✓ ✓" : (locale === "ar" ? "رفع صورة" : "Upload Image")}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setImage(await readFile(file));
                }}
              />
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">{locale === "ar" ? "تعليمات (عربي)" : "Instructions (Ar)"}</Label>
            <Textarea name="instructionsAr" defaultValue={wallet?.instructionsAr || ""} className="rounded-lg min-h-16 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{locale === "ar" ? "تعليمات (إنجليزي)" : "Instructions (En)"}</Label>
            <Textarea name="instructionsEn" defaultValue={wallet?.instructionsEn || ""} dir="ltr" className="rounded-lg min-h-16 text-xs" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch id={`active-${method}`} name="isActive" defaultChecked={wallet?.isActive ?? true} />
          <Label htmlFor={`active-${method}`} className="text-xs cursor-pointer">{locale === "ar" ? "مفعّلة" : "Active"}</Label>
        </div>
        <Button type="submit" disabled={pending} className="w-full rounded-xl">
          {pending ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Save className="w-4 h-4 me-2" />}
          {t("common.save")}
        </Button>
      </form>
    </Card>
  );
}
