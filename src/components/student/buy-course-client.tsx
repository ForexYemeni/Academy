"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  Loader2,
  CreditCard,
  Upload,
  Tag,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { submitPaymentAction, validateCouponAction } from "@/lib/student-actions";
import { toast } from "sonner";
import type { Course, SubscriptionPlan, Wallet } from "@prisma/client";

export function BuyCourseClient({
  course,
  plans,
  wallets,
  courseLessonsCount,
}: {
  course: Course;
  plans: SubscriptionPlan[];
  wallets: Wallet[];
  courseLessonsCount: number;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || "");
  const [method, setMethod] = useState<"JAWALI" | "JIB" | "ONE_CASH" | "CASH">(
    wallets[0]?.method || "JAWALI"
  );
  const [transferImage, setTransferImage] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(course.price);
  const [validating, setValidating] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const baseAmount = selectedPlan?.price ?? course.price;
  const selectedWallet = wallets.find((w) => w.method === method);

  async function readImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setValidating(true);
    try {
      const r = await validateCouponAction(couponCode.trim(), course.id, baseAmount);
      if (!r.ok) {
        toast.error(t(`coupons.${r.error}`));
        setDiscount(0);
        setFinalAmount(baseAmount);
        return;
      }
      setDiscount(r.discount!);
      setFinalAmount(r.finalAmount!);
      toast.success(t("coupons.applied"));
    } finally {
      setValidating(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedPlanId) {
      toast.error(locale === "ar" ? "اختر باقة" : "Select a plan");
      return;
    }
    if (!transferImage) {
      toast.error(locale === "ar" ? "ارفع إثبات الدفع" : "Upload payment proof");
      return;
    }
    startTransition(async () => {
      try {
        const r = await submitPaymentAction({
          courseId: course.id,
          planId: selectedPlanId,
          method,
          amount: baseAmount,
          transferImage,
          operationNo: (e.currentTarget.elements.namedItem("operationNo") as HTMLInputElement)?.value || "",
          notes: (e.currentTarget.elements.namedItem("notes") as HTMLTextAreaElement)?.value || "",
          couponCode: couponCode.trim() || undefined,
          discount,
          finalAmount,
        });
        if (r.ok) {
          toast.success(locale === "ar" ? "تم إرسال طلبك" : "Request submitted");
          router.push("/student/payments");
          router.refresh();
        }
      } catch (err: any) {
        toast.error(err.message || "Error");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <a href="/#latest">
            <ArrowRight className="w-4 h-4 me-2 rtl:rotate-180" />
            {t("common.back")}
          </a>
        </Button>
      </div>

      {/* Course summary */}
      <Card className="glass card-lux rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center overflow-hidden shrink-0">
            {course.coverImage ? (
              <img src={course.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-7 h-7 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-lg leading-tight">
              {locale === "ar" ? course.titleAr : course.titleEn}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {courseLessonsCount} {t("course.lessons")} · {t(`level.${course.level}`)}
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Plans */}
        <Card className="glass card-lux rounded-2xl p-5">
          <h3 className="font-semibold mb-3">{t("sub.selectPlan")}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPlanId(p.id);
                  setDiscount(0);
                  setFinalAmount(p.price);
                }}
                className={`text-start p-4 rounded-xl border-2 transition-all ${
                  selectedPlanId === p.id
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">
                    {locale === "ar" ? p.nameAr : p.nameEn}
                  </span>
                  {selectedPlanId === p.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="font-display font-bold text-xl text-gradient">
                  {p.price.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {p.monthsCount} {locale === "ar" ? "أشهر" : "months"}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Payment methods */}
        <Card className="glass card-lux rounded-2xl p-5">
          <h3 className="font-semibold mb-3">{t("payments.methods")}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {wallets.map((w) => (
              <button
                key={w.method}
                type="button"
                onClick={() => setMethod(w.method)}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  method === w.method
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">
                  {locale === "ar" ? w.nameAr : w.nameEn}
                </span>
                <span className="text-[10px] text-muted-foreground" dir="ltr">
                  {w.number}
                </span>
              </button>
            ))}
          </div>

          {selectedWallet && (
            <div className="glass rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                {selectedWallet.qrCode && (
                  <img
                    src={selectedWallet.qrCode}
                    alt="QR"
                    className="w-24 h-24 rounded-lg bg-white p-1"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <div>
                    <span className="text-xs text-muted-foreground">{locale === "ar" ? "الاسم: " : "Name: "}</span>
                    <span className="text-sm font-medium">
                      {locale === "ar" ? selectedWallet.nameAr : selectedWallet.nameEn}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{locale === "ar" ? "الرقم: " : "Number: "}</span>
                    <code className="text-sm font-mono" dir="ltr">{selectedWallet.number}</code>
                  </div>
                </div>
              </div>
              {selectedWallet.instructionsAr && (
                <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
                  {locale === "ar" ? selectedWallet.instructionsAr : selectedWallet.instructionsEn}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Coupon */}
        <Card className="glass card-lux rounded-2xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" />
            {t("coupons.title")}
          </h3>
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder={t("coupons.code")}
              className="rounded-xl uppercase"
            />
            <Button type="button" variant="outline" className="rounded-xl" onClick={applyCoupon} disabled={validating}>
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : t("coupons.apply")}
            </Button>
          </div>
        </Card>

        {/* Proof upload */}
        <Card className="glass card-lux rounded-2xl p-5">
          <h3 className="font-semibold mb-3">{t("payments.proof")}</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t("payments.upload")}</Label>
              <label className="block cursor-pointer mt-1">
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors">
                  {transferImage ? (
                    <img src={transferImage} alt="" className="max-h-40 mx-auto rounded-lg" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {locale === "ar" ? "اضغط لرفع الصورة" : "Click to upload"}
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error(locale === "ar" ? "حجم الصورة كبير جداً (2MB كحد أقصى)" : "Image too large (max 2MB)");
                        return;
                      }
                      setTransferImage(await readImage(file));
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <Label className="text-xs">{t("payments.operationNo")}</Label>
              <Input name="operationNo" dir="ltr" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label className="text-xs">{t("payments.notes")}</Label>
              <Textarea name="notes" className="rounded-xl mt-1 min-h-16" />
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="glass card-lux rounded-2xl p-5">
          <h3 className="font-semibold mb-3">{t("common.total")}</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("payments.amount")}</span>
              <span className="font-medium">{baseAmount.toLocaleString()} YER</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-500">
                <span>{t("coupons.title")}</span>
                <span>-{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-border/40">
              <span className="font-semibold">{t("common.total")}</span>
              <span className="font-display font-bold text-2xl text-gradient">
                {finalAmount.toLocaleString()} YER
              </span>
            </div>
          </div>
          <Button type="submit" disabled={pending} className="w-full mt-4 rounded-xl shadow-glow" size="lg">
            {pending ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Check className="w-4 h-4 me-2" />}
            {t("payments.submit")}
          </Button>
        </Card>
      </form>
    </div>
  );
}
