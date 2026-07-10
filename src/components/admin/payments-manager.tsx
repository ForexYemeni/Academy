"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X, Pause, Search, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { approvePaymentAction, suspendPaymentAction } from "@/lib/admin-actions";
import { toast } from "sonner";

type Payment = {
  id: string;
  amount: number;
  finalAmount: number;
  discount: number;
  method: string;
  status: string;
  transferImage: string | null;
  operationNo: string | null;
  notes: string | null;
  rejectReason: string | null;
  couponCode: string | null;
  createdAt: Date;
  user: { id: string; fullName: string; phone: string; avatar: string | null };
  course: { id: string; titleAr: string; titleEn: string };
  plan: { nameAr: string; nameEn: string; monthsCount: number } | null;
};

const methodColors: Record<string, string> = {
  JAWALI: "bg-violet-500/15 text-violet-400",
  JIB: "bg-cyan-500/15 text-cyan-400",
  ONE_CASH: "bg-amber-500/15 text-amber-400",
  CASH: "bg-emerald-500/15 text-emerald-400",
};

export function PaymentsManager({ payments }: { payments: Payment[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [rejecting, setRejecting] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewing, setViewing] = useState<Payment | null>(null);

  const filtered = payments.filter((p) => {
    const q = query.toLowerCase().trim();
    const matchesQ = !q || p.user.fullName.toLowerCase().includes(q) || p.user.phone.includes(q) || (p.operationNo || "").includes(q);
    const matchesF = filter === "ALL" || p.status === filter;
    return matchesQ && matchesF;
  });

  const filters = ["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.search")}
            className="ps-9 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className="rounded-full whitespace-nowrap"
              onClick={() => setFilter(f)}
            >
              {f === "ALL" ? t("common.all") : t(`payments.${f.toLowerCase()}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <Card className="glass card-lux rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar className="w-10 h-10 shrink-0">
                {p.user.avatar ? <img src={p.user.avatar} alt="" /> : null}
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-xs">
                  {p.user.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm truncate">{p.user.fullName}</h3>
                  <Badge className={`text-[10px] ${methodColors[p.method] || ""}`}>
                    {t(`wallet.${p.method}`)}
                  </Badge>
                  {p.couponCode && (
                    <Badge variant="outline" className="text-[10px]">
                      {p.couponCode} (-{p.discount.toLocaleString()})
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {locale === "ar" ? p.course.titleAr : p.course.titleEn}
                  {p.plan && ` · ${locale === "ar" ? p.plan.nameAr : p.plan.nameEn}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">
                  {p.user.phone} · {new Date(p.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-end">
                  <div className="font-display font-bold text-lg text-gradient">
                    {p.finalAmount.toLocaleString()}
                  </div>
                  <Badge
                    variant={
                      p.status === "APPROVED" ? "default" :
                      p.status === "REJECTED" ? "destructive" :
                      p.status === "SUSPENDED" ? "secondary" : "outline"
                    }
                    className="text-[10px]"
                  >
                    {t(`payments.${p.status.toLowerCase()}`)}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1">
                  {p.transferImage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg h-8 px-2"
                      onClick={() => setViewing(p)}
                    >
                      <ImageIcon className="w-3.5 h-3.5 me-1" />
                      {locale === "ar" ? "إثبات" : "Proof"}
                    </Button>
                  )}
                  {p.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        className="rounded-lg h-8 bg-emerald-600 hover:bg-emerald-700"
                        disabled={pending}
                        onClick={() => {
                          startTransition(async () => {
                            await approvePaymentAction(p.id);
                            toast.success(t("payments.approved"));
                            router.refresh();
                          });
                        }}
                      >
                        <Check className="w-3.5 h-3.5 me-1" />
                        {t("payments.accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-lg h-8"
                        disabled={pending}
                        onClick={() => {
                          setRejecting(p);
                          setRejectReason("");
                        }}
                      >
                        <X className="w-3.5 h-3.5 me-1" />
                        {t("payments.reject")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("common.noData")}
          </div>
        )}
      </div>

      {/* Reject dialog */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("payments.rejectReason")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>{t("payments.rejectReason")}</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="rounded-xl min-h-24"
              placeholder={locale === "ar" ? "اكتب سبب الرفض..." : "Write rejection reason..."}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejecting(null)}>{t("common.cancel")}</Button>
            <Button
              variant="destructive"
              disabled={pending || !rejectReason.trim()}
              onClick={() => {
                if (!rejecting) return;
                startTransition(async () => {
                  await approvePaymentAction(rejecting.id, rejectReason.trim());
                  toast.success(t("payments.rejected"));
                  setRejecting(null);
                  router.refresh();
                });
              }}
            >
              {pending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {t("payments.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image viewer */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{locale === "ar" ? "إثبات الدفع" : "Payment Proof"}</DialogTitle>
          </DialogHeader>
          {viewing?.transferImage && (
             
            <img src={viewing.transferImage} alt="proof" className="w-full rounded-xl" />
          )}
          {viewing?.operationNo && (
            <div className="text-sm">
              <span className="text-muted-foreground">{t("payments.operationNo")}: </span>
              <span className="font-mono">{viewing.operationNo}</span>
            </div>
          )}
          {viewing?.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">{t("payments.notes")}: </span>
              <span>{viewing.notes}</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
