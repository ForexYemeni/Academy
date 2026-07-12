"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Play,
  Users,
  BookOpen,
  Star,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { Course } from "@prisma/client";

type CourseWithCounts = Course & {
  _count: { lessons: number; enrollments: number };
};

function formatDuration(sec: number) {
  if (!sec) return "0";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function CoursesSection({
  id,
  titleKey,
  courses,
}: {
  id: string;
  titleKey: string;
  courses: CourseWithCounts[];
}) {
  const { t, locale } = useI18n();

  return (
    <section id={id} className="py-16 sm:py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10 gap-4"
        >
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl tracking-tight">
              {t(titleKey)}
            </h2>
            <div className="mt-2 h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full" />
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/courses">
              {t("common.viewAll")}
              <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
            </Link>
          </Button>
        </motion.div>

        {courses.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("common.noData")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {courses.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link href={`/courses/${c.id}`} className="block group">
                  <Card className="overflow-hidden glass card-lux rounded-2xl border-border/40 h-full">
                    {/* Cover */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/15 to-accent/15">
                      {c.coverImage ? (
                         
                        <img
                          src={c.coverImage}
                          alt={locale === "ar" ? c.titleAr : c.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center">
                          <div className="w-14 h-14 rounded-full bg-primary/20 grid place-items-center backdrop-blur">
                            <Play className="w-6 h-6 text-primary-foreground ms-1" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {c.isFeatured && (
                        <Badge className="absolute top-3 start-3 gap-1 bg-chart-4 text-black hover:bg-chart-4">
                          <Star className="w-3 h-3" />
                          {t("course.featured")}
                        </Badge>
                      )}
                      <Badge className="absolute bottom-3 end-3 bg-black/50 backdrop-blur text-white border-0">
                        {t(`level.${c.level}`)}
                      </Badge>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {locale === "ar" ? c.titleAr : c.titleEn}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {locale === "ar" ? c.descriptionAr : c.descriptionEn}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {c._count.lessons} {t("course.lessons")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {c._count.enrollments}
                        </span>
                        {c.totalDuration > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDuration(c.totalDuration)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <span className="font-display font-bold text-lg text-gradient">
                          {c.price.toLocaleString()} {t("settings.currency") === "settings.currency" ? "YER" : ""}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full h-8 px-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          {t("course.viewMore")}
                          <ArrowRight className="w-3.5 h-3.5 ms-1 rtl:rotate-180" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
