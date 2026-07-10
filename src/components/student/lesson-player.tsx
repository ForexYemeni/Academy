"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ListChecks,
  MessageCircle,
  Lock,
  Play,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/audio/audio-player";
import { useI18n } from "@/lib/i18n";

type Course = {
  id: string;
  titleAr: string;
  titleEn: string;
  lessons: { id: string; titleAr: string; titleEn: string; duration: number; isFree: boolean; order: number }[];
};

type Lesson = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  duration: number;
  isFree: boolean;
  audioData: string | null;
  audioUrl: string | null;
  pdfFiles: string | null;
  attachments: string | null;
  order: number;
};

export function LessonPlayer({
  course,
  lesson,
  initialPosition,
}: {
  course: Course;
  lesson: Lesson;
  initialPosition: number;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [showList, setShowList] = useState(false);

  const currentIndex = course.lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < course.lessons.length - 1
      ? course.lessons[currentIndex + 1]
      : null;

  const hasAudio = lesson.audioData || lesson.audioUrl;
  const audioSrc = lesson.audioUrl || `/api/audio/${lesson.id}`;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/student/courses">
            <ArrowRight className="w-4 h-4 me-2 rtl:rotate-180" />
            {t("student.myCourses")}
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground truncate">
          {locale === "ar" ? course.titleAr : course.titleEn}
        </span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass card-lux rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <Badge variant="outline" className="text-[10px] mb-2">
                #{lesson.order + 1}
              </Badge>
              <h1 className="font-display font-bold text-xl leading-tight">
                {locale === "ar" ? lesson.titleAr : lesson.titleEn}
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full shrink-0"
              onClick={() => setShowList(!showList)}
            >
              <ListChecks className="w-4 h-4 me-2" />
              {course.lessons.length}
            </Button>
          </div>
          {(locale === "ar" ? lesson.descriptionAr : lesson.descriptionEn) && (
            <p className="text-sm text-muted-foreground">
              {locale === "ar" ? lesson.descriptionAr : lesson.descriptionEn}
            </p>
          )}
        </Card>
      </motion.div>

      {/* Player */}
      {hasAudio ? (
        <AudioPlayer
          src={audioSrc}
          lessonId={lesson.id}
          title={locale === "ar" ? lesson.titleAr : lesson.titleEn}
          initialPosition={initialPosition}
          onNext={nextLesson ? () => router.push(`/student/courses/${course.id}/lessons/${nextLesson.id}`) : undefined}
          onPrev={prevLesson ? () => router.push(`/student/courses/${course.id}/lessons/${prevLesson.id}`) : undefined}
        />
      ) : (
        <Card className="glass rounded-2xl p-8 text-center text-muted-foreground">
          {locale === "ar" ? "لا يوجد تسجيل صوتي لهذا الدرس بعد" : "No audio recording for this lesson yet"}
        </Card>
      )}

      {/* PDFs / Attachments */}
      {(lesson.pdfFiles || lesson.attachments) && (
        <Card className="glass card-lux rounded-2xl p-4">
          <h3 className="font-semibold text-sm mb-3">{locale === "ar" ? "المرفقات" : "Attachments"}</h3>
          <div className="space-y-2">
            {(() => {
              if (!lesson.pdfFiles) return null;
              try {
                const files = JSON.parse(lesson.pdfFiles) as string[];
                return files.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 glass rounded-xl hover:bg-accent/5 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm flex-1 truncate">
                      {locale === "ar" ? `ملف PDF ${i + 1}` : `PDF File ${i + 1}`}
                    </span>
                  </a>
                ));
              } catch {
                return null;
              }
            })()}
          </div>
        </Card>
      )}

      {/* Lessons list */}
      {showList && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="glass card-lux rounded-2xl p-2">
            <div className="space-y-1 max-h-80 overflow-y-auto scroll-lux">
              {course.lessons.map((l) => {
                const active = l.id === lesson.id;
                return (
                  <Link
                    key={l.id}
                    href={`/student/courses/${course.id}/lessons/${l.id}`}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${active ? "bg-primary/10" : "hover:bg-accent/5"}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center text-xs font-bold shrink-0">
                      {l.order + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {locale === "ar" ? l.titleAr : l.titleEn}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.floor(l.duration / 60)}:{String(l.duration % 60).padStart(2, "0")}
                      </div>
                    </div>
                    {active ? (
                      <Play className="w-4 h-4 text-primary" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground/40" />
                    )}
                  </Link>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-2">
        <Button
          asChild
          variant="outline"
          className="rounded-full"
          disabled={!prevLesson}
        >
          <Link href={prevLesson ? `/student/courses/${course.id}/lessons/${prevLesson.id}` : "#"}>
            <ArrowRight className="w-4 h-4 me-2 rtl:rotate-0" />
            {t("common.previous")}
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/student/courses/${course.id}/community`}>
            <MessageCircle className="w-4 h-4 me-2" />
            {t("community.title")}
          </Link>
        </Button>
        <Button
          asChild
          className="rounded-full"
          disabled={!nextLesson}
        >
          <Link href={nextLesson ? `/student/courses/${course.id}/lessons/${nextLesson.id}` : "#"}>
            {t("common.next")}
            <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
