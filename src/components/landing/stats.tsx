"use client";

import { motion } from "framer-motion";
import { Users, Headphones, GraduationCap, Award } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const stats = [
  { icon: Users, value: "12K+", labelAr: "طالب نشط", labelEn: "Active Students" },
  { icon: Headphones, value: "850+", labelAr: "ساعة صوتية", labelEn: "Audio Hours" },
  { icon: GraduationCap, value: "120+", labelAr: "دورة احترافية", labelEn: "Pro Courses" },
  { icon: Award, value: "4.9★", labelAr: "تقييم الطلاب", labelEn: "Student Rating" },
];

export function StatsStrip() {
  const { locale } = useI18n();
  return (
    <section className="py-8 border-y border-border/40 bg-card/20 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-4 sm:p-5 flex items-center gap-3 card-lux"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center shrink-0">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-xl sm:text-2xl text-gradient leading-none">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {locale === "ar" ? s.labelAr : s.labelEn}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
