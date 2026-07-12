"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type Enrollment = {
  id: string;
  course: {
    id: string;
    titleAr: string;
    titleEn: string;
    coverImage: string | null;
  };
};

export function CommunityClient({ enrollments }: { enrollments: Enrollment[] }) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">{t("community.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "ar" ? "اختر دورة للدخول إلى مجتمعها" : "Pick a course to enter its community"}
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="glass rounded-2xl p-12 text-center">
          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground mb-4">
            {locale === "ar" ? "لا توجد دورات مشترك بها" : "No enrolled courses"}
          </p>
          <Button asChild className="rounded-full">
            <Link href="/#latest">{t("hero.cta.explore")}</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {enrollments.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/student/courses/${e.course.id}/community`}>
                <Card className="glass card-lux rounded-2xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center overflow-hidden shrink-0">
                    {e.course.coverImage ? (
                      <img src={e.course.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm truncate">
                      {locale === "ar" ? e.course.titleAr : e.course.titleEn}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {locale === "ar" ? "ادخل المجتمع" : "Enter community"}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground rtl:rotate-180" />
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
