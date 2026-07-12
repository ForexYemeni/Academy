"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Heart, MessageCircle, DollarSign, BookOpen, Megaphone, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/student-actions";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string | null;
  bodyEn: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
};

const icons: Record<string, any> = {
  NEW_LESSON: BookOpen,
  PAYMENT_APPROVED: DollarSign,
  PAYMENT_REJECTED: DollarSign,
  NEW_COURSE: BookOpen,
  NEW_ANNOUNCEMENT: Megaphone,
  NEW_COMMENT: MessageCircle,
  NEW_REPLY: Reply,
  NEW_LIKE: Heart,
};

const colors: Record<string, string> = {
  NEW_LESSON: "bg-violet-500/15 text-violet-400",
  PAYMENT_APPROVED: "bg-emerald-500/15 text-emerald-400",
  PAYMENT_REJECTED: "bg-rose-500/15 text-rose-400",
  NEW_COURSE: "bg-cyan-500/15 text-cyan-400",
  NEW_ANNOUNCEMENT: "bg-amber-500/15 text-amber-400",
  NEW_COMMENT: "bg-blue-500/15 text-blue-400",
  NEW_REPLY: "bg-indigo-500/15 text-indigo-400",
  NEW_LIKE: "bg-pink-500/15 text-pink-400",
};

export function NotificationsList({
  notifications,
  showMarkAll = false,
}: {
  notifications: Notification[];
  showMarkAll?: boolean;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      {showMarkAll && unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unreadCount} {locale === "ar" ? "إشعار غير مقروء" : "unread"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await markAllNotificationsReadAction();
                toast.success(t("notif.markAllRead"));
                router.refresh();
              });
            }}
          >
            <CheckCheck className="w-4 h-4 me-2" />
            {t("notif.markAllRead")}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => {
          const Icon = icons[n.type] || Bell;
          const color = colors[n.type] || "bg-muted text-muted-foreground";
          return (
            <Card
              key={n.id}
              className={`glass card-lux rounded-2xl p-4 transition-opacity ${n.isRead ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${color} grid place-items-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">
                      {locale === "ar" ? n.titleAr : n.titleEn}
                    </h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  {n.bodyAr && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {locale === "ar" ? n.bodyAr : n.bodyEn}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {n.link && (
                    <Button asChild size="sm" variant="ghost" className="rounded-lg h-8">
                      <Link href={n.link}>
                        {locale === "ar" ? "عرض" : "View"}
                      </Link>
                    </Button>
                  )}
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg h-8"
                      onClick={() => {
                        startTransition(async () => {
                          await markNotificationReadAction(n.id);
                          router.refresh();
                        });
                      }}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {notifications.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            {t("notif.noNotifs")}
          </div>
        )}
      </div>
    </div>
  );
}

import { toast } from "sonner";
