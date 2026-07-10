"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Play, Clock, Trophy, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";

type Enrollment = {
  id: string;
  progress: number;
  completedLessons: number;
  totalListenSeconds: number;
  expiresAt: Date | null;
  course: {
    id: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    coverImage: string | null;
    level: string;
    totalDuration: number;
    _count: { lessons: number };
    lessons: { id: string; titleAr: string; titleEn: string; duration: number; isFree: boolean }[];
  };
  lastLesson: { id: string } | null;
};

function formatDuration(sec: number) {
  if (!sec) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function MyCoursesClient({ enrollments }: { enrollments: Enrollment[] }) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">{t("student.myCourses")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {enrollments.length} {locale === "ar" ? "دورة مشترك بها" : "enrolled courses"}
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="glass rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground mb-4">
            {locale === "ar" ? "لم تشترك في أي دورة بعد" : "No enrolled courses yet"}
          </p>
          <Button asChild className="rounded-full">
            <Link href="/#latest">{t("hero.cta.explore")}</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {enrollments.map((e, i) => {
            const nextLessonId = e.lastLesson?.id || e.course.lessons[0]?.id || "";
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass card-lux rounded-2xl overflow-hidden h-full">
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/15 to-accent/15 overflow-hidden">
                    {e.course.coverImage ? (
                      <img src={e.course.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center">
                        <BookOpen className="w-10 h-10 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-3 start-3 bg-black/50 backdrop-blur text-white border-0">
                      {t(`level.${e.course.level}`)}
                    </Badge>
                    {e.progress === 100 && (
                      <Badge className="absolute top-3 end-3 bg-emerald-500 text-white">
                        <Trophy className="w-3 h-3 me-1" />
                        {locale === "ar" ? "مكتملة" : "Completed"}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold leading-snug line-clamp-2">
                      {locale === "ar" ? e.course.titleAr : e.course.titleEn}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Progress value={e.progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{Math.round(e.progress)}%</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{e.completedLessons}/{e.course._count.lessons} {t("course.lessons")}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(e.course.totalDuration)}
                      </span>
                    </div>
                    <Button asChild className="w-full rounded-xl" size="sm">
                      <Link href={`/student/courses/${e.course.id}/lessons/${nextLessonId}`}>
                        <Play className="w-4 h-4 me-2" />
                        {e.progress > 0 ? t("student.continueListening") : t("player.play")}
                        <ArrowRight className="w-4 h-4 ms-auto rtl:rotate-180" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
