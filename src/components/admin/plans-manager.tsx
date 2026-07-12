"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Clock } from "lucide-react";
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
import {
  createPlanAction,
  updatePlanAction,
  deletePlanAction,
} from "@/lib/admin-actions";
import { toast } from "sonner";

type Plan = {
  id: string;
  nameAr: string;
  nameEn: string;
  duration: string;
  monthsCount: number;
  price: number;
  isActive: boolean;
  _count: { subscriptions: number };
};

const durations = [
  { value: "ONE_MONTH", months: 1, labelAr: "شهر", labelEn: "1 Month" },
  { value: "THREE_MONTHS", months: 3, labelAr: "ثلاثة أشهر", labelEn: "3 Months" },
  { value: "SIX_MONTHS", months: 6, labelAr: "ستة أشهر", labelEn: "6 Months" },
  { value: "ONE_YEAR", months: 12, labelAr: "سنة", labelEn: "1 Year" },
];

export function PlansManager({ plans }: { plans: Plan[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {locale === "ar" ? "باقات الاشتراك المتاحة للدورات" : "Subscription plans available for courses"}
        </p>
        <Button onClick={() => setCreating(true)} className="rounded-xl shadow-glow">
          <Plus className="w-4 h-4 me-2" />
          {t("sub.selectPlan")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => (
          <Card key={p.id} className="glass card-lux rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <Badge variant={p.isActive ? "default" : "secondary"} className="text-[10px]">
                {p.isActive ? (locale === "ar" ? "مفعّل" : "Active") : (locale === "ar" ? "موقوف" : "Inactive")}
              </Badge>
            </div>
            <h3 className="font-semibold">{locale === "ar" ? p.nameAr : p.nameEn}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {p.monthsCount} {locale === "ar" ? "أشهر" : "months"} · {p._count.subscriptions} {locale === "ar" ? "اشتراك" : "subs"}
            </p>
            <div className="font-display font-bold text-2xl text-gradient mb-3">
              {p.price.toLocaleString()} {locale === "ar" ? "ر.ي" : "YER"}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`active-${p.id}`}
                defaultChecked={p.isActive}
                onCheckedChange={(v) => {
                  startTransition(async () => {
                    await updatePlanAction(p.id, { isActive: v });
                    router.refresh();
                  });
                }}
              />
              <Label htmlFor={`active-${p.id}`} className="text-xs cursor-pointer">
                {locale === "ar" ? "تفعيل" : "Activate"}
              </Label>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg h-8 ms-auto text-destructive hover:text-destructive"
                onClick={() => {
                  if (!confirm(locale === "ar" ? "حذف الباقة؟" : "Delete plan?")) return;
                  startTransition(async () => {
                    await deletePlanAction(p.id);
                    toast.success(t("common.delete"));
                    router.refresh();
                  });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("sub.selectPlan")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              startTransition(async () => {
                await createPlanAction({
                  nameAr: f.get("nameAr") as string,
                  nameEn: f.get("nameEn") as string,
                  duration: f.get("duration") as any,
                  price: parseFloat(f.get("price") as string),
                  isActive: f.get("isActive") === "on",
                });
                toast.success(t("common.save"));
                setCreating(false);
                router.refresh();
              });
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{locale === "ar" ? "الاسم (عربي)" : "Name (Ar)"}</Label>
                <Input name="nameAr" required className="rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{locale === "ar" ? "الاسم (إنجليزي)" : "Name (En)"}</Label>
                <Input name="nameEn" required dir="ltr" className="rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{locale === "ar" ? "المدة" : "Duration"}</Label>
                <Select name="duration" defaultValue="ONE_MONTH">
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {locale === "ar" ? d.labelAr : d.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{locale === "ar" ? "السعر" : "Price"}</Label>
                <Input name="price" type="number" step="0.01" required className="rounded-lg" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isActive" name="isActive" defaultChecked />
              <Label htmlFor="isActive" className="text-xs cursor-pointer">
                {locale === "ar" ? "تفعيل" : "Active"}
              </Label>
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
