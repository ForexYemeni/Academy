"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Play,
  Mic,
  ArrowRight,
  GripVertical,
  Loader2,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { useI18n } from "@/lib/i18n";
import {
  createLessonAction,
  updateLessonAction,
  deleteLessonAction,
} from "@/lib/admin-actions";
import { toast } from "sonner";
import type { Lesson } from "@prisma/client";

export function LessonsManager({
  courseId,
  initialLessons,
}: {
  courseId: string;
  initialLessons: Lesson[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [lessons, setLessons] = useState(initialLessons);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Lesson | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <a href="/admin/courses">
              <ArrowRight className="w-4 h-4 me-2 rtl:rotate-180" />
              {t("courses.admin.title")}
            </a>
          </Button>
        </div>
        <Button onClick={() => setCreating(true)} className="rounded-xl shadow-glow">
          <Plus className="w-4 h-4 me-2" />
          {t("lessons.new")}
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {lessons.map((l, i) => (
            <motion.div
              key={l.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card className="glass card-lux rounded-2xl p-4 flex items-center gap-3">
                <div className="hidden sm:grid place-items-center text-muted-foreground/40">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center shrink-0">
                  {l.audioData || l.audioUrl ? (
                    <Play className="w-4 h-4 text-primary ms-0.5" />
                  ) : (
                    <Mic className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm truncate">
                      {locale === "ar" ? l.titleAr : l.titleEn}
                    </h4>
                    {l.isFree && (
                      <Badge className="text-[10px] bg-emerald-500 text-white hover:bg-emerald-500">Free</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">#{l.order}</Badge>
                  </div>
                  {l.descriptionAr && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {locale === "ar" ? l.descriptionAr : l.descriptionEn}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(l.duration / 60)}:{String(l.duration % 60).padStart(2, "0")}
                    </span>
                    {l.pdfFiles && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        PDF
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-lg h-9 w-9 p-0"
                    onClick={() => setEditing(l)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-lg h-9 w-9 p-0 text-destructive hover:text-destructive"
                    onClick={() => setDeleting(l)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {lessons.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {locale === "ar" ? "لا توجد دروس بعد. أنشئ أول درس!" : "No lessons yet. Create your first one!"}
          </div>
        )}
      </div>

      <LessonFormDialog
        open={creating || !!editing}
        lesson={editing}
        courseId={courseId}
        nextOrder={lessons.length}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => {
          setCreating(false);
          setEditing(null);
          router.refresh();
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "ar" ? "هل أنت متأكد من حذف هذا الدرس؟" : "Are you sure you want to delete this lesson?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleting) return;
                deleteLessonAction(deleting.id)
                  .then(() => {
                    setLessons((prev) => prev.filter((l) => l.id !== deleting.id));
                    setDeleting(null);
                    toast.success(t("common.delete"));
                    router.refresh();
                  })
                  .catch((e) => toast.error(e.message));
              }}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LessonFormDialog({
  open,
  lesson,
  courseId,
  nextOrder,
  onClose,
  onSaved,
}: {
  open: boolean;
  lesson: Lesson | null;
  courseId: string;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, locale } = useI18n();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState("info");
  const [audioData, setAudioData] = useState<{
    audioBase64: string;
    duration: number;
    size: number;
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const input = {
      courseId,
      titleAr: formData.get("titleAr") as string,
      titleEn: formData.get("titleEn") as string,
      descriptionAr: (formData.get("descriptionAr") as string) || "",
      descriptionEn: (formData.get("descriptionEn") as string) || "",
      order: parseInt(formData.get("order") as string) || 0,
      isFree: formData.get("isFree") === "on",
      ...(audioData
        ? {
            audioData: audioData.audioBase64,
            duration: audioData.duration,
            audioSize: audioData.size,
          }
        : {}),
    };
    startTransition(async () => {
      try {
        if (lesson) {
          await updateLessonAction(lesson.id, input);
        } else {
          await createLessonAction(input);
        }
        toast.success(t("common.save"));
        setAudioData(null);
        onSaved();
      } catch (err: any) {
        toast.error(err.message || "Error");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scroll-lux">
        <DialogHeader>
          <DialogTitle>
            {lesson ? t("common.edit") : t("lessons.new")}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">{locale === "ar" ? "معلومات" : "Info"}</TabsTrigger>
            <TabsTrigger value="audio" className="flex-1">{locale === "ar" ? "تسجيل" : "Record"}</TabsTrigger>
          </TabsList>
          <TabsContent value="audio">
            <AudioRecorder
              onSave={async (data) => {
                setAudioData(data);
                toast.success(locale === "ar" ? "تم حفظ التسجيل" : "Recording saved");
                setTab("info");
              }}
            />
          </TabsContent>
          <TabsContent value="info">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("courses.admin.title_ar")}</Label>
                  <Input name="titleAr" required defaultValue={lesson?.titleAr} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("courses.admin.title_en")}</Label>
                  <Input name="titleEn" required defaultValue={lesson?.titleEn} dir="ltr" className="rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("courses.admin.desc_ar")}</Label>
                  <Textarea name="descriptionAr" defaultValue={lesson?.descriptionAr ?? ""} className="rounded-xl min-h-20" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("courses.admin.desc_en")}</Label>
                  <Textarea name="descriptionEn" defaultValue={lesson?.descriptionEn ?? ""} dir="ltr" className="rounded-xl min-h-20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("lessons.order")}</Label>
                  <Input name="order" type="number" defaultValue={lesson?.order ?? nextOrder} className="rounded-xl" />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <Switch id="isFree" name="isFree" defaultChecked={lesson?.isFree} />
                  <Label htmlFor="isFree" className="cursor-pointer">
                    {locale === "ar" ? "درس مجاني" : "Free lesson"}
                  </Label>
                </div>
              </div>

              {audioData && (
                <div className="text-xs bg-emerald-500/10 text-emerald-500 rounded-lg p-2.5">
                  {locale === "ar"
                    ? `تم تسجيل ${Math.floor(audioData.duration / 60)}:${String(audioData.duration % 60).padStart(2, "0")} — ${(audioData.size / 1024 / 1024).toFixed(2)} MB`
                    : `Recorded ${Math.floor(audioData.duration / 60)}:${String(audioData.duration % 60).padStart(2, "0")} — ${(audioData.size / 1024 / 1024).toFixed(2)} MB`}
                </div>
              )}
              {(lesson?.audioData || lesson?.audioUrl) && !audioData && (
                <div className="text-xs bg-primary/10 text-primary rounded-lg p-2.5">
                  {locale === "ar" ? "✓ يوجد تسجيل صوتي محفوظ" : "✓ Existing audio recording"}
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>{t("common.cancel")}</Button>
                <Button type="submit" disabled={pending} className="rounded-xl">
                  {pending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
