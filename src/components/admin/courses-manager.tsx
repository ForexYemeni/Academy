"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  ArrowRight,
  BookOpen,
  Loader2,
  X,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import {
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
  toggleCourseVisibilityAction,
  toggleCourseFeaturedAction,
  reorderCoursesAction,
} from "@/lib/admin-actions";
import { toast } from "sonner";
import type { Course } from "@prisma/client";

type CourseWithCounts = Course & {
  _count: { lessons: number; enrollments: number };
  category?: { nameAr: string; nameEn: string } | null;
};

export function CoursesManager({
  initialCourses,
  categories,
}: {
  initialCourses: CourseWithCounts[];
  categories: { id: string; nameAr: string; nameEn: string }[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CourseWithCounts | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CourseWithCounts | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = courses.filter((c) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return c.titleAr.toLowerCase().includes(q) || c.titleEn.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.search")}
            className="ps-9 rounded-xl"
          />
        </div>
        <Button onClick={() => setCreating(true)} className="rounded-xl shadow-glow">
          <Plus className="w-4 h-4 me-2" />
          {t("courses.admin.new")}
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card className="glass card-lux rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Drag handle + cover */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="hidden sm:grid place-items-center text-muted-foreground/40">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center shrink-0 overflow-hidden">
                    {c.coverImage ? (
                      <img src={c.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">
                        {locale === "ar" ? c.titleAr : c.titleEn}
                      </h3>
                      {c.isFeatured && (
                        <Badge className="text-[10px] bg-chart-4 text-black hover:bg-chart-4 gap-1">
                          <Star className="w-3 h-3" />
                          {t("course.featured")}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {t(`level.${c.level}`)}
                      </Badge>
                      <Badge
                        variant={
                          c.status === "PUBLISHED" ? "default" :
                          c.status === "HIDDEN" ? "secondary" : "outline"
                        }
                        className="text-[10px]"
                      >
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {locale === "ar" ? c.descriptionAr : c.descriptionEn}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span>{c._count.lessons} {t("course.lessons")}</span>
                      <span>{c._count.enrollments} {t("course.students")}</span>
                      <span className="font-semibold text-primary">{c.price.toLocaleString()} YER</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="rounded-lg h-9 w-9 p-0"
                    title={t("lessons.title")}
                  >
                    <a href={`/admin/courses/${c.id}/lessons`}>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-lg h-9 w-9 p-0"
                    title={c.isFeatured ? t("courses.admin.unfeature") : t("courses.admin.feature")}
                    onClick={() => {
                      startTransition(async () => {
                        await toggleCourseFeaturedAction(c.id);
                        setCourses((prev) => prev.map((x) => x.id === c.id ? { ...x, isFeatured: !x.isFeatured } : x));
                        toast.success(t("common.save"));
                        router.refresh();
                      });
                    }}
                  >
                    <Star className={`w-4 h-4 ${c.isFeatured ? "fill-chart-4 text-chart-4" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-lg h-9 w-9 p-0"
                    title={c.status === "HIDDEN" ? t("courses.admin.show") : t("courses.admin.hide")}
                    onClick={() => {
                      startTransition(async () => {
                        await toggleCourseVisibilityAction(c.id);
                        setCourses((prev) => prev.map((x) => x.id === c.id ? { ...x, status: x.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN" } : x));
                        toast.success(t("common.save"));
                        router.refresh();
                      });
                    }}
                  >
                    {c.status === "HIDDEN" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-lg h-9 w-9 p-0"
                    title={t("common.edit")}
                    onClick={() => setEditing(c)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-lg h-9 w-9 p-0 text-destructive hover:text-destructive"
                    title={t("common.delete")}
                    onClick={() => setDeleting(c)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("common.noData")}
          </div>
        )}
      </div>

      {/* Create/Edit dialog */}
      <CourseFormDialog
        open={creating || !!editing}
        course={editing}
        categories={categories}
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

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "ar"
                ? `هل أنت متأكد من حذف "${deleting?.titleAr}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${deleting?.titleEn}"? This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleting) return;
                startTransition(async () => {
                  await deleteCourseAction(deleting.id);
                  setCourses((prev) => prev.filter((c) => c.id !== deleting.id));
                  setDeleting(null);
                  toast.success(t("common.delete"));
                  router.refresh();
                });
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

function CourseFormDialog({
  open,
  course,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  course: CourseWithCounts | null;
  categories: { id: string; nameAr: string; nameEn: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, locale } = useI18n();
  const [pending, startTransition] = useTransition();
  const [coverImage, setCoverImage] = useState<string | null>(course?.coverImage || null);

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error(locale === "ar" ? "حجم الصورة كبير جداً (1.5MB كحد أقصى)" : "Image too large (max 1.5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const input = {
      titleAr: formData.get("titleAr") as string,
      titleEn: formData.get("titleEn") as string,
      descriptionAr: formData.get("descriptionAr") as string,
      descriptionEn: formData.get("descriptionEn") as string,
      coverImage,
      price: parseFloat(formData.get("price") as string) || 0,
      level: formData.get("level") as any,
      status: formData.get("status") as any,
      isFeatured: formData.get("isFeatured") === "on",
      order: parseInt(formData.get("order") as string) || 0,
      categoryId: (formData.get("categoryId") as string) || null,
    };
    startTransition(async () => {
      try {
        if (course) {
          await updateCourseAction(course.id, input);
        } else {
          await createCourseAction(input);
        }
        toast.success(t("common.save"));
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
            {course ? t("common.edit") : t("courses.admin.new")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("courses.admin.title_ar")}</Label>
              <Input name="titleAr" required defaultValue={course?.titleAr} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("courses.admin.title_en")}</Label>
              <Input name="titleEn" required defaultValue={course?.titleEn} dir="ltr" className="rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("courses.admin.desc_ar")}</Label>
              <Textarea name="descriptionAr" required defaultValue={course?.descriptionAr} className="rounded-xl min-h-20" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("courses.admin.desc_en")}</Label>
              <Textarea name="descriptionEn" required defaultValue={course?.descriptionEn} dir="ltr" className="rounded-xl min-h-20" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label>{t("courses.admin.price")}</Label>
              <Input name="price" type="number" step="0.01" defaultValue={course?.price ?? 0} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("courses.admin.order")}</Label>
              <Input name="order" type="number" defaultValue={course?.order ?? 0} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("courses.admin.level")}</Label>
              <Select name="level" defaultValue={course?.level ?? "BEGINNER"}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">{t("level.BEGINNER")}</SelectItem>
                  <SelectItem value="INTERMEDIATE">{t("level.INTERMEDIATE")}</SelectItem>
                  <SelectItem value="ADVANCED">{t("level.ADVANCED")}</SelectItem>
                  <SelectItem value="EXPERT">{t("level.EXPERT")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("courses.admin.status")}</Label>
              <Select name="status" defaultValue={course?.status ?? "DRAFT"}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="HIDDEN">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("courses.admin.category")}</Label>
              <Select name="categoryId" defaultValue={course?.categoryId ?? ""}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={t("common.all")} /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {locale === "ar" ? cat.nameAr : cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("courses.admin.cover")}</Label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-xl p-2.5 text-center text-xs text-muted-foreground hover:border-primary transition-colors">
                    {coverImage ? "✓ " + (locale === "ar" ? "تم الاختيار" : "Selected") : (locale === "ar" ? "اختر صورة" : "Choose image")}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={onImage} />
                </label>
                {coverImage && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCoverImage(null)} className="rounded-lg">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="isFeatured" name="isFeatured" defaultChecked={course?.isFeatured} />
            <Label htmlFor="isFeatured" className="cursor-pointer">{t("courses.admin.feature")}</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={pending} className="rounded-xl">
              {pending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
