"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Headphones,
  Gift,
  Copy,
  Play,
  Bell,
  Megaphone,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

type Enrollment = {
  id: string;
  progress: number;
  completedLessons: number;
  totalListenSeconds: number;
  expiresAt: Date | null;
  lastLessonId: string | null;
  course: {
    id: string;
    titleAr: string;
    titleEn: string;
    coverImage: string | null;
    level: string;
    _count: { lessons: number };
    lessons: { id: string; titleAr: string; titleEn: string }[];
  };
};

function formatDuration(sec: number) {
  if (!sec) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function StudentOverview({
  user,
  enrollments,
  announcements,
  notifications,
}: {
  user: { name: string; avatar: string | null; referralCode: string; referralRewards: number };
  enrollments: Enrollment[];
  announcements: any[];
  notifications: any[];
}) {
  const { t, locale } = useI18n();

  const totalListen = enrollments.reduce((s, e) => s + e.totalListenSeconds, 0);
  const avgProgress =
    enrollments.length > 0
      ? enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length
      : 0;

  const stats = [
    { label: t("student.myCourses"), value: enrollments.length, icon: BookOpen, color: "from-violet-500/20 to-fuchsia-500/20", iconColor: "text-violet-400" },
    { label: t("student.progress"), value: `${Math.round(avgProgress)}%`, icon: TrendingUp, color: "from-cyan-500/20 to-blue-500/20", iconColor: "text-cyan-400" },
    { label: t("student.listenTime"), value: formatDuration(totalListen), icon: Headphones, color: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400" },
    { label: t("student.referralRewards"), value: user.referralRewards.toFixed(0), icon: Gift, color: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass card-lux rounded-2xl p-6 surface-mesh"
      >
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-primary/30">
            {user.avatar ? <img src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">{t("student.welcome")}</p>
            <h2 className="font-display font-bold text-xl text-gradient">{user.name}</h2>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass card-lux rounded-2xl">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} grid place-items-center mb-3`}>
                  <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                </div>
                <div className="text-2xl font-display font-bold text-gradient">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Continue listening */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">{t("student.continueListening")}</h3>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/student/courses">{t("common.viewAll")}</Link>
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <Card className="glass rounded-2xl p-8 text-center">
            <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {locale === "ar" ? "لم تشترك في أي دورة بعد" : "You haven't subscribed to any course yet"}
            </p>
            <Button asChild className="rounded-full">
              <Link href="/#latest">
                <Sparkles className="w-4 h-4 me-2" />
                {t("hero.cta.explore")}
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {enrollments.slice(0, 4).map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass card-lux rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center shrink-0 overflow-hidden">
                    {e.course.coverImage ? (
                      <img src={e.course.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm truncate">
                      {locale === "ar" ? e.course.titleAr : e.course.titleEn}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={e.progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{Math.round(e.progress)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {e.completedLessons}/{e.course._count.lessons} {t("course.lessons")}
                      {e.lastLessonId && (() => {
                        const lastLesson = e.course.lessons.find((l) => l.id === e.lastLessonId);
                        if (!lastLesson) return null;
                        return (
                          <>
                            <span className="mx-1">·</span>
                            <span className="truncate">
                              {locale === "ar" ? lastLesson.titleAr : lastLesson.titleEn}
                            </span>
                          </>
                        );
                      })()}
                    </p>
                  </div>
                  <Button asChild size="sm" className="rounded-full shrink-0">
                    <Link href={`/student/courses/${e.course.id}/lessons/${e.lastLessonId || e.course.lessons[0]?.id || ""}`}>
                      <Play className="w-4 h-4" />
                    </Link>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Announcements + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass card-lux rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="w-4 h-4 text-amber-400" />
              {t("ann.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[10px] ${a.type === "ALERT" ? "bg-amber-500/15 text-amber-400" : a.type === "UPDATE" ? "bg-violet-500/15 text-violet-400" : "bg-cyan-500/15 text-cyan-400"}`}>
                      {t(`ann.${a.type}`)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en")}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm">{locale === "ar" ? a.titleAr : a.titleEn}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {locale === "ar" ? a.bodyAr : a.bodyEn}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass card-lux rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="w-4 h-4 text-primary" />
              {t("notif.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("notif.noNotifs")}</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "#"}
                  className="block glass rounded-xl p-3 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                    <h4 className="font-semibold text-sm flex-1">
                      {locale === "ar" ? n.titleAr : n.titleEn}
                    </h4>
                  </div>
                  {n.bodyAr && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {locale === "ar" ? n.bodyAr : n.bodyEn}
                    </p>
                  )}
                </Link>
              ))
            )}
            <Button asChild variant="ghost" size="sm" className="w-full rounded-full mt-2">
              <Link href="/student/notifications">{t("common.viewAll")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Referral CTA */}
      <Card className="glass card-lux rounded-2xl overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary to-accent p-6 text-white">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5" />
                <h3 className="font-display font-bold text-lg">
                  {locale === "ar" ? "ادعُ أصدقاءك واربح" : "Invite friends & earn"}
                </h3>
              </div>
              <p className="text-sm text-white/80">
                {locale === "ar"
                  ? "احصل على 10% من كل اشتراك جديد عبر رابطك"
                  : "Get 10% of every new subscription via your link"}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-xl p-2">
              <code className="text-xs font-mono">{user.referralCode}</code>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-lg"
                onClick={() => {
                  const link = `${window.location.origin}/register?ref=${user.referralCode}`;
                  navigator.clipboard.writeText(link);
                  toast.success(t("student.copied"));
                }}
              >
                <Copy className="w-3.5 h-3.5 me-1.5" />
                {t("student.copyLink")}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
