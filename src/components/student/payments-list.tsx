"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

type Payment = {
  id: string;
  amount: number;
  finalAmount: number;
  method: string;
  status: string;
  rejectReason: string | null;
  createdAt: Date;
  course: { id: string; titleAr: string; titleEn: string };
  plan: { nameAr: string; nameEn: string } | null;
};

export function StudentPaymentsList({ payments }: { payments: Payment[] }) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">{t("payments.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {payments.length} {locale === "ar" ? "عملية دفع" : "payments"}
        </p>
      </div>

      {payments.length === 0 ? (
        <Card className="glass rounded-2xl p-12 text-center">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground mb-4">
            {locale === "ar" ? "لا توجد مدفوعات بعد" : "No payments yet"}
          </p>
          <Button asChild className="rounded-full">
            <Link href="/#latest">{t("hero.cta.explore")}</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="glass card-lux rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center shrink-0">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">
                    {locale === "ar" ? p.course.titleAr : p.course.titleEn}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px]">
                      {t(`wallet.${p.method}`)}
                    </Badge>
                    {p.plan && (
                      <span className="text-xs text-muted-foreground">
                        {locale === "ar" ? p.plan.nameAr : p.plan.nameEn}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(p.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}
                  </p>
                  {p.status === "REJECTED" && p.rejectReason && (
                    <p className="text-xs text-destructive mt-1">
                      {p.rejectReason}
                    </p>
                  )}
                </div>
                <div className="text-end shrink-0">
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
                {p.status === "APPROVED" && (
                  <Button asChild size="sm" variant="ghost" className="rounded-full shrink-0">
                    <Link href={`/student/courses/${p.course.id}`}>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
