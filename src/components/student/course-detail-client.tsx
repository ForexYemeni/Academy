"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Users,
  Clock,
  Check,
  Play,
  Star,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import type { Course, SubscriptionPlan } from "@prisma/client";

function formatDuration(sec: number) {
  if (!sec) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function CourseDetailClient({
  course,
  plans,
  lessonsCount,
  studentsCount,
  isAuthenticated,
}: {
  course: Course;
  plans: SubscriptionPlan[];
  lessonsCount: number;
  studentsCount: number;
  isAuthenticated: boolean;
}) {
  const { t, locale } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Hero */}
        <div className="relative overflow-hidden pt-12 pb-16">
          <div className="absolute inset-0 surface-aurora -z-10" />
          <div className="container mx-auto px-4 sm:px-6">
            <Link href="/#latest" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              {t("common.back")}
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{t(`level.${course.level}`)}</Badge>
                  {course.isFeatured && (
                    <Badge className="bg-chart-4 text-black">
                      <Star className="w-3 h-3 me-1" />
                      {t("course.featured")}
                    </Badge>
                  )}
                </div>
                <h1 className="font-display font-bold text-3xl sm:text-5xl leading-tight">
                  <span className="text-gradient">
                    {locale === "ar" ? course.titleAr : course.titleEn}
                  </span>
                </h1>
                <p className="mt-4 text-muted-foreground text-base sm:text-lg">
                  {locale === "ar" ? course.descriptionAr : course.descriptionEn}
                </p>

                <div className="flex items-center gap-5 mt-6 text-sm">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>{lessonsCount} {t("course.lessons")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{studentsCount} {t("course.students")}</span>
                  </div>
                  {course.totalDuration > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{formatDuration(course.totalDuration)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full shadow-glow"
                  >
                    <Link href={isAuthenticated ? `/student/courses/${course.id}/buy` : `/register?redirect=/student/courses/${course.id}/buy`}>
                      {t("course.buy")}
                      <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                    </Link>
                  </Button>
                  <div>
                    <div className="text-xs text-muted-foreground">{t("course.price")}</div>
                    <div className="font-display font-bold text-2xl text-gradient">
                      {course.price.toLocaleString()} YER
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass-strong card-lux rounded-3xl overflow-hidden aspect-video grid place-items-center">
                  {course.coverImage ? (
                    <img src={course.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-primary/20 grid place-items-center backdrop-blur">
                        <Play className="w-8 h-8 text-primary-foreground ms-1" />
                      </div>
                      <div className="absolute inset-0 rounded-full pulse-ring" />
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="container mx-auto px-4 sm:px-6 pb-16">
          <h2 className="font-display font-bold text-2xl mb-6">{t("sub.selectPlan")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`glass card-lux rounded-2xl p-5 ${i === 0 ? "ring-2 ring-primary" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">
                      {locale === "ar" ? p.nameAr : p.nameEn}
                    </h3>
                    {i === 0 && <Badge className="text-[10px]">{locale === "ar" ? "الأكثر شيوعاً" : "Popular"}</Badge>}
                  </div>
                  <div className="font-display font-bold text-3xl text-gradient mb-1">
                    {p.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mb-4">YER</div>
                  <Button asChild variant="outline" className="w-full rounded-xl">
                    <Link href={isAuthenticated ? `/student/courses/${course.id}/buy?plan=${p.id}` : `/register`}>
                      {t("payments.buy")}
                    </Link>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
