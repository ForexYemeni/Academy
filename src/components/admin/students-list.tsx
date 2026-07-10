"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";

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
  const [query, setQuery] = useState("");

  const filtered = students.filter((s) => {
    const q = query.toLowerCase().trim();
    return !q || s.fullName.toLowerCase().includes(q) || s.phone.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("common.search")}
          className="ps-9 rounded-xl"
        />
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
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("common.noData")}
          </div>
        )}
      </div>
    </div>
  );
}
