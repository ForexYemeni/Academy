"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, UserPlus, Trash2, Loader2, User, Phone, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
import { useI18n } from "@/lib/i18n";
import { createUserAction, deleteUserAction } from "@/lib/admin-actions";
import { toast } from "sonner";

type Student = {
  id: string;
  fullName: string;
  phone: string;
  avatar: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
  _count: { enrollments: number; payments: number };
  enrollments: { progress: number; lastActiveAt: Date | null; totalListenSeconds: number }[];
};

function formatDuration(sec: number) {
  if (!sec) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function StudentsList({ students }: { students: Student[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<Student | null>(null);

  const filtered = students.filter((s) => {
    const q = query.toLowerCase().trim();
    return !q || s.fullName.toLowerCase().includes(q) || s.phone.includes(q);
  });

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await createUserAction({
        fullName: (f.get("fullName") as string) || "",
        phone: (f.get("phone") as string) || "",
        password: (f.get("password") as string) || "",
        role: (f.get("role") as "STUDENT" | "MODERATOR") || "STUDENT",
      });
      if (!r.ok) {
        toast.error(t(r.error));
        return;
      }
      toast.success(locale === "ar" ? "تم إنشاء الحساب بنجاح" : "Account created successfully");
      setCreating(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
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
        <Button onClick={() => setCreating(true)} className="rounded-xl shadow-glow shrink-0">
          <UserPlus className="w-4 h-4 me-2" />
          {locale === "ar" ? "إضافة مستخدم" : "Add User"}
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map((s) => (
          <Card key={s.id} className="glass card-lux rounded-2xl p-4 flex items-center gap-4">
            <Avatar className="w-11 h-11">
              {s.avatar ? <img src={s.avatar} alt="" /> : null}
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary-foreground">
                {s.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{s.fullName}</h3>
              <p className="text-xs text-muted-foreground" dir="ltr">{s.phone}</p>
              <p className="text-xs text-muted-foreground">
                {locale === "ar" ? "انضم: " : "Joined: "}
                {new Date(s.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en")}
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1.5 min-w-40">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {s._count.enrollments} {t("course.students")}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {s._count.payments} {t("payments.title")}
                </Badge>
              </div>
              {s.enrollments[0] && (
                <div className="w-full">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{t("student.progress")}</span>
                    <span>{Math.round(s.enrollments[0].progress)}%</span>
                  </div>
                  <Progress value={s.enrollments[0].progress} className="h-1.5" />
                </div>
              )}
            </div>
            <div className="text-end shrink-0">
              <div className="text-xs text-muted-foreground">{t("student.listenTime")}</div>
              <div className="text-sm font-semibold">
                {formatDuration(s.enrollments[0]?.totalListenSeconds || 0)}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-lg h-8 w-8 p-0 text-destructive hover:text-destructive"
              title={locale === "ar" ? "حذف المستخدم" : "Delete user"}
              onClick={() => setDeleting(s)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("common.noData")}
          </div>
        )}
      </div>

      {/* Create user dialog */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              {locale === "ar" ? "إنشاء حساب مستخدم جديد" : "Create New User Account"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("auth.fullName")}</Label>
              <div className="relative">
                <User className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                <Input
                  name="fullName"
                  required
                  minLength={3}
                  className="ps-9 rounded-xl"
                  placeholder={locale === "ar" ? "اكتب الاسم الكامل" : "Enter full name"}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("auth.phone")}</Label>
              <div className="relative">
                <Phone className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                <Input
                  name="phone"
                  type="tel"
                  required
                  dir="ltr"
                  className="ps-9 rounded-xl text-start"
                  placeholder="+9677XXXXXXXX"
                />
              </div>
              <p className="text-xs text-muted-foreground">{t("auth.phone.hint")}</p>
            </div>
            <div className="space-y-1.5">
              <Label>{t("auth.password")}</Label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                <Input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="ps-9 rounded-xl"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-muted-foreground">{t("auth.password.min")}</p>
            </div>
            <div className="space-y-1.5">
              <Label>{t("common.role")}</Label>
              <Select name="role" defaultValue="STUDENT">
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">{locale === "ar" ? "طالب" : "Student"}</SelectItem>
                  <SelectItem value="MODERATOR">{locale === "ar" ? "مشرف" : "Moderator"}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1">
                <ShieldAlert className="w-3 h-3 mt-0.5 text-amber-400 shrink-0" />
                {locale === "ar"
                  ? "إذا اخترت مشرف، يمكنك تعيين الصلاحيات لاحقاً من صفحة إدارة المشرفين."
                  : "If you choose moderator, you can assign permissions later from the Moderators page."}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={pending} className="rounded-xl">
                {pending ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <UserPlus className="w-4 h-4 me-2" />}
                {locale === "ar" ? "إنشاء الحساب" : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{locale === "ar" ? "حذف المستخدم" : "Delete User"}</AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "ar"
                ? `هل أنت متأكد من حذف "${deleting?.fullName}"؟ سيتم حذف جميع بياناته نهائياً ولا يمكن التراجع.`
                : `Are you sure you want to delete "${deleting?.fullName}"? All their data will be permanently removed and cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={pending}
              onClick={() => {
                if (!deleting) return;
                startTransition(async () => {
                  const r = await deleteUserAction(deleting.id);
                  if (!r.ok) {
                    toast.error(r.error || (locale === "ar" ? "تعذّر الحذف" : "Failed to delete"));
                    return;
                  }
                  toast.success(locale === "ar" ? "تم حذف المستخدم" : "User deleted");
                  setDeleting(null);
                  router.refresh();
                });
              }}
            >
              {pending ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : null}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
