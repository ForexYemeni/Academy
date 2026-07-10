"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  BookOpen,
  Mic,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { useI18n } from "@/lib/i18n";

type Stats = {
  studentsCount: number;
  subscribersCount: number;
  coursesCount: number;
  recordingsCount: number;
  revenue: number;
  pendingPaymentsCount: number;
  recentStudents: { id: string; fullName: string; phone: string; createdAt: string; avatar?: string | null }[];
  recentPayments: {
    id: string;
    finalAmount: number;
    status: string;
    createdAt: string;
    user: { fullName: string; phone: string; avatar?: string | null };
    course: { titleAr: string; titleEn: string };
  }[];
  recentCourses: {
    id: string;
    titleAr: string;
    titleEn: string;
    price: number;
    status: string;
    isFeatured: boolean;
    _count: { enrollments: number; lessons: number };
  }[];
  dailyData: { date: string; count: number; revenue: number }[];
  monthlyData: { month: string; count: number; revenue: number }[];
  yearlyData: { year: string; count: number; revenue: number }[];
};

export function DashboardClient() {
  const { t, locale } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    { key: "students", value: stats.studentsCount, icon: Users, color: "from-violet-500/20 to-fuchsia-500/20", iconColor: "text-violet-400" },
    { key: "subscribers", value: stats.subscribersCount, icon: GraduationCap, color: "from-cyan-500/20 to-blue-500/20", iconColor: "text-cyan-400" },
    { key: "courses", value: stats.coursesCount, icon: BookOpen, color: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400" },
    { key: "recordings", value: stats.recordingsCount, icon: Mic, color: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400" },
    { key: "revenue", value: `${stats.revenue.toLocaleString()} YER`, icon: DollarSign, color: "from-lime-500/20 to-green-500/20", iconColor: "text-lime-400" },
    { key: "pendingPayments", value: stats.pendingPaymentsCount, icon: Clock, color: "from-pink-500/20 to-rose-500/20", iconColor: "text-pink-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass card-lux rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t(`dash.${c.key}`)}
                </CardTitle>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center`}>
                  <c.icon className={`w-4 h-4 ${c.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-display font-bold text-gradient">
                  {c.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily */}
        <Card className="glass card-lux rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t("dash.dailyChart")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.dailyData}>
                <defs>
                  <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#dailyGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly */}
        <Card className="glass card-lux rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-accent" />
              {t("dash.monthlyChart")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Yearly */}
        <Card className="glass card-lux rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-chart-4" />
              {t("dash.yearlyChart")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats.yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-4)"
                  strokeWidth={3}
                  dot={{ fill: "var(--chart-4)", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent students */}
        <Card className="glass card-lux rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">{t("dash.recentStudents")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
            ) : (
              stats.recentStudents.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    {s.avatar ? <img src={s.avatar} alt={s.fullName} /> : null}
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/30 to-accent/30">
                      {s.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{s.fullName}</div>
                    <div className="text-xs text-muted-foreground" dir="ltr">{s.phone}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en")}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent payments */}
        <Card className="glass card-lux rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">{t("dash.recentPayments")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
            ) : (
              stats.recentPayments.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    {p.user.avatar ? <img src={p.user.avatar} alt={p.user.fullName} /> : null}
                    <AvatarFallback className="text-xs bg-gradient-to-br from-amber-400/30 to-orange-400/30">
                      {p.user.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{p.user.fullName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {locale === "ar" ? p.course.titleAr : p.course.titleEn}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-sm font-semibold">{p.finalAmount.toLocaleString()}</div>
                    <Badge
                      variant={
                        p.status === "APPROVED" ? "default" :
                        p.status === "REJECTED" ? "destructive" :
                        p.status === "SUSPENDED" ? "secondary" : "outline"
                      }
                      className="text-[10px]"
                    >
                      {t(`payments.${p.status.toLowerCase()}`)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent courses */}
        <Card className="glass card-lux rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">{t("dash.recentCourses")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
            ) : (
              stats.recentCourses.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center shrink-0">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {locale === "ar" ? c.titleAr : c.titleEn}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c._count.lessons} {t("course.lessons")} · {c._count.enrollments} {t("course.students")}
                    </div>
                  </div>
                  {c.isFeatured && (
                    <Badge className="text-[10px] bg-chart-4 text-black hover:bg-chart-4">★</Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
