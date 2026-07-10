"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, UserCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useI18n } from "@/lib/i18n";
import { createModeratorAction, deleteModeratorAction } from "@/lib/admin-actions";
import { toast } from "sonner";

type Moderator = {
  id: string;
  userId: string;
  canManageCourses: boolean;
  canManagePayments: boolean;
  canManageStudents: boolean;
  canManageCommunity: boolean;
  canManageAnnouncements: boolean;
  canManageSettings: boolean;
  user: { id: string; fullName: string; phone: string; avatar: string | null };
};

export function ModeratorsManager({
  moderators,
  students,
}: {
  moderators: Moderator[];
  students: { id: string; fullName: string; phone: string }[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const perms: { key: keyof Omit<Moderator, "id" | "userId" | "user">; label: string }[] = [
    { key: "canManageCourses", label: t("mod.courses") },
    { key: "canManagePayments", label: t("mod.payments") },
    { key: "canManageStudents", label: t("mod.students") },
    { key: "canManageCommunity", label: t("mod.community") },
    { key: "canManageAnnouncements", label: t("mod.announcements") },
    { key: "canManageSettings", label: t("mod.settings") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {locale === "ar" ? "إدارة المشرفين بصلاحيات دقيقة" : "Manage moderators with granular permissions"}
        </p>
        <Button onClick={() => setCreating(true)} className="rounded-xl shadow-glow">
          <Plus className="w-4 h-4 me-2" />
          {t("mod.new")}
        </Button>
      </div>

      <div className="space-y-3">
        {moderators.map((m) => (
          <Card key={m.id} className="glass card-lux rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-11 h-11">
                {m.user.avatar ? <img src={m.user.avatar} alt="" /> : null}
                <AvatarFallback className="bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30">
                  {m.user.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm">{m.user.fullName}</h3>
                <p className="text-xs text-muted-foreground" dir="ltr">{m.user.phone}</p>
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {perms.filter((p) => m[p.key]).map((p) => (
                    <Badge key={p.key} variant="outline" className="text-[10px]">
                      {p.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => {
                  if (!confirm(locale === "ar" ? "إزالة صلاحيات المشرف؟" : "Remove moderator?")) return;
                  startTransition(async () => {
                    await deleteModeratorAction(m.id);
                    toast.success(t("common.delete"));
                    router.refresh();
                  });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {moderators.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("common.noData")}
          </div>
        )}
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("mod.new")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedUserId) {
                toast.error(locale === "ar" ? "اختر طالباً" : "Select a student");
                return;
              }
              const f = new FormData(e.currentTarget);
              startTransition(async () => {
                await createModeratorAction({
                  userId: selectedUserId,
                  canManageCourses: f.get("canManageCourses") === "on",
                  canManagePayments: f.get("canManagePayments") === "on",
                  canManageStudents: f.get("canManageStudents") === "on",
                  canManageCommunity: f.get("canManageCommunity") === "on",
                  canManageAnnouncements: f.get("canManageAnnouncements") === "on",
                  canManageSettings: f.get("canManageSettings") === "on",
                });
                toast.success(t("common.save"));
                setCreating(false);
                setSelectedUserId("");
                router.refresh();
              });
            }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label>{locale === "ar" ? "اختر الطالب" : "Select student"}</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={locale === "ar" ? "اختر..." : "Select..."} /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName} — {s.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("mod.permissions")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {perms.map((p) => (
                  <div key={p.key} className="flex items-center gap-2 glass rounded-lg p-2.5">
                    <Switch id={p.key} name={p.key} />
                    <Label htmlFor={p.key} className="text-xs cursor-pointer">{p.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreating(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={pending} className="rounded-xl">
                {pending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
