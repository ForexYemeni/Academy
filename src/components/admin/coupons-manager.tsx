"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Ticket, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { createCouponAction, deleteCouponAction } from "@/lib/admin-actions";
import { toast } from "sonner";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  maxUses: number;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  course: { titleAr: string; titleEn: string } | null;
};

export function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {locale === "ar" ? "كوبونات خصم للدورات" : "Discount coupons for courses"}
        </p>
        <Button onClick={() => setCreating(true)} className="rounded-xl shadow-glow">
          <Plus className="w-4 h-4 me-2" />
          {t("coupons.new")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <Card key={c.id} className="glass card-lux rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 end-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center">
                  <Ticket className="w-5 h-5 text-primary" />
                </div>
                <Badge variant={c.isActive ? "default" : "secondary"} className="text-[10px]">
                  {c.isActive ? (locale === "ar" ? "مفعّل" : "Active") : (locale === "ar" ? "موقوف" : "Inactive")}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <code className="font-mono font-bold text-lg text-gradient">{c.code}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-lg h-7 w-7 p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(c.code);
                    toast.success(t("student.copied"));
                  }}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {c.type === "PERCENT" ? `${c.value}%` : `${c.value} YER`} {t(`coupons.${c.type}`)}
              </p>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="text-muted-foreground">{t("coupons.used")}</div>
                  <div className="font-semibold">{c.usedCount}/{c.maxUses || "∞"}</div>
                </div>
                <div className="text-end">
                  <div className="text-muted-foreground">{t("coupons.expires")}</div>
                  <div className="font-semibold">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString(locale === "ar" ? "ar" : "en") : "∞"}
                  </div>
                </div>
              </div>
              {c.course && (
                <p className="text-xs text-muted-foreground mt-2 truncate">
                  {locale === "ar" ? c.course.titleAr : c.course.titleEn}
                </p>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="w-full mt-3 rounded-lg text-destructive hover:text-destructive"
                onClick={() => {
                  if (!confirm(locale === "ar" ? "حذف الكوبون؟" : "Delete coupon?")) return;
                  startTransition(async () => {
                    await deleteCouponAction(c.id);
                    toast.success(t("common.delete"));
                    router.refresh();
                  });
                }}
              >
                <Trash2 className="w-4 h-4 me-2" />
                {t("common.delete")}
              </Button>
            </div>
          </Card>
        ))}
        {coupons.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground col-span-full">
            {t("common.noData")}
          </div>
        )}
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("coupons.new")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              startTransition(async () => {
                await createCouponAction({
                  code: f.get("code") as string,
                  type: f.get("type") as any,
                  value: parseFloat(f.get("value") as string),
                  maxUses: parseInt(f.get("maxUses") as string) || 0,
                  expiresAt: (f.get("expiresAt") as string) || null,
                  courseId: null,
                  isActive: f.get("isActive") === "on",
                });
                toast.success(t("common.save"));
                setCreating(false);
                router.refresh();
              });
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("coupons.code")}</Label>
                <Input name="code" required className="rounded-xl uppercase" placeholder="SUMMER25" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("coupons.type")}</Label>
                <Select name="type" defaultValue="PERCENT">
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">{t("coupons.PERCENT")}</SelectItem>
                    <SelectItem value="FIXED">{t("coupons.FIXED")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("coupons.value")}</Label>
                <Input name="value" type="number" step="0.01" required className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("coupons.maxUses")}</Label>
                <Input name="maxUses" type="number" defaultValue={0} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("coupons.expires")}</Label>
              <Input name="expiresAt" type="date" className="rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isActive" name="isActive" defaultChecked />
              <Label htmlFor="isActive" className="text-xs cursor-pointer">{locale === "ar" ? "تفعيل" : "Active"}</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreating(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={pending} className="rounded-xl">
                {pending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
