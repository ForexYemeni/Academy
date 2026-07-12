"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Megaphone, Loader2 } from "lucide-react";
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
import { useI18n } from "@/lib/i18n";
import { createAnnouncementAction, deleteAnnouncementAction } from "@/lib/admin-actions";
import { toast } from "sonner";

type Announcement = {
  id: string;
  type: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  createdAt: Date;
  createdByUser: { fullName: string };
};

const typeColors: Record<string, string> = {
  NEWS: "bg-cyan-500/15 text-cyan-400",
  UPDATE: "bg-violet-500/15 text-violet-400",
  ALERT: "bg-amber-500/15 text-amber-400",
};

export function AnnouncementsManager({ announcements }: { announcements: Announcement[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {locale === "ar" ? "انشر الأخبار والتحديثات والتنبيهات لجميع الطلاب" : "Publish news, updates, and alerts to all students"}
        </p>
        <Button onClick={() => setCreating(true)} className="rounded-xl shadow-glow">
          <Plus className="w-4 h-4 me-2" />
          {t("ann.new")}
        </Button>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <Card key={a.id} className="glass card-lux rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center shrink-0">
                <Megaphone className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm">
                    {locale === "ar" ? a.titleAr : a.titleEn}
                  </h3>
                  <Badge className={`text-[10px] ${typeColors[a.type]}`}>
                    {t(`ann.${a.type}`)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {locale === "ar" ? a.bodyAr : a.bodyEn}
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {a.createdByUser.fullName} · {new Date(a.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => {
                  if (!confirm(locale === "ar" ? "حذف الإعلان؟" : "Delete announcement?")) return;
                  startTransition(async () => {
                    await deleteAnnouncementAction(a.id);
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
        {announcements.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("common.noData")}
          </div>
        )}
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("ann.new")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              startTransition(async () => {
                await createAnnouncementAction({
                  type: f.get("type") as any,
                  titleAr: f.get("titleAr") as string,
                  titleEn: f.get("titleEn") as string,
                  bodyAr: f.get("bodyAr") as string,
                  bodyEn: f.get("bodyEn") as string,
                });
                toast.success(t("common.save"));
                setCreating(false);
                router.refresh();
              });
            }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label>{t("ann.type")}</Label>
              <Select name="type" defaultValue="NEWS">
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEWS">{t("ann.NEWS")}</SelectItem>
                  <SelectItem value="UPDATE">{t("ann.UPDATE")}</SelectItem>
                  <SelectItem value="ALERT">{t("ann.ALERT")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "العنوان (عربي)" : "Title (Ar)"}</Label>
                <Input name="titleAr" required className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "العنوان (إنجليزي)" : "Title (En)"}</Label>
                <Input name="titleEn" required dir="ltr" className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "المحتوى (عربي)" : "Body (Ar)"}</Label>
                <Textarea name="bodyAr" required className="rounded-xl min-h-32" />
              </div>
              <div className="space-y-1.5">
                <Label>{locale === "ar" ? "المحتوى (إنجليزي)" : "Body (En)"}</Label>
                <Textarea name="bodyEn" required dir="ltr" className="rounded-xl min-h-32" />
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
