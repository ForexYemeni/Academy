"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pin, Trash2, MessageCircle, Heart, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n";
import { pinPostAction, deletePostAction } from "@/lib/admin-actions";
import { toast } from "sonner";

type Post = {
  id: string;
  contentAr: string | null;
  contentEn: string | null;
  isPinned: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  user: { fullName: string; avatar: string | null };
  course: { titleAr: string; titleEn: string };
  _count: { comments: number; likes: number };
};

export function AdminCommunityList({ posts }: { posts: Post[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <Card key={p.id} className="glass card-lux rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              {p.user.avatar ? <img src={p.user.avatar} alt="" /> : null}
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-xs">
                {p.user.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">{p.user.fullName}</h3>
                <Badge variant="outline" className="text-[10px]">
                  {locale === "ar" ? p.course.titleAr : p.course.titleEn}
                </Badge>
                {p.isPinned && (
                  <Badge className="text-[10px] bg-amber-500 text-white">
                    <Pin className="w-3 h-3 me-1" />
                    {locale === "ar" ? "مثبّت" : "Pinned"}
                  </Badge>
                )}
              </div>
              <p className="text-sm mt-1.5">
                {locale === "ar" ? p.contentAr : p.contentEn}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {p._count.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> {p._count.comments}
                </span>
                <span>{new Date(p.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg h-8 w-8 p-0"
                onClick={() => {
                  startTransition(async () => {
                    await pinPostAction(p.id);
                    toast.success(t("common.save"));
                    router.refresh();
                  });
                }}
              >
                {p.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => {
                  if (!confirm(locale === "ar" ? "حذف المنشور؟" : "Delete post?")) return;
                  startTransition(async () => {
                    await deletePostAction(p.id);
                    toast.success(t("common.delete"));
                    router.refresh();
                  });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
      {posts.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
          {t("common.noData")}
        </div>
      )}
    </div>
  );
}
