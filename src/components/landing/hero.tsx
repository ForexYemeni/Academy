"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export function LandingHero({ settings }: { settings: any }) {
  const { t, locale } = useI18n();
  const name = settings
    ? locale === "ar"
      ? settings.platformNameAr
      : settings.platformNameEn
    : t("brand.name");

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
      {/* Aurora background */}
      <div className="absolute inset-0 surface-aurora -z-10" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -start-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -end-32 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-chart-4" />
            <span>{locale === "ar" ? "منصة تعليم صوتي 2026" : "Audio Learning Platform 2026"}</span>
            <span className="w-1 h-1 rounded-full bg-chart-4" />
            <span className="text-muted-foreground">PWA · RTL · Dark</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl leading-[1.1] tracking-tight"
          >
            <span className="text-gradient">{t("hero.title")}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="rounded-full text-base h-12 px-7 shadow-glow group">
              <Link href="/register">
                {t("hero.cta.join")}
                <ArrowRight className="w-4 h-4 ms-2 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full text-base h-12 px-7 glass">
              <Link href="#latest">
                <Play className="w-4 h-4 me-2" />
                {t("hero.cta.explore")}
              </Link>
            </Button>
          </motion.div>

          {/* Floating equalizer / waveform */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 flex items-end justify-center gap-1 sm:gap-1.5 h-20 max-w-full overflow-hidden"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.span
                key={i}
                className="w-1 sm:w-1.5 lg:w-2 rounded-full bg-gradient-to-t from-primary to-accent"
                style={{ height: "100%" }}
                animate={{
                  scaleY: [0.2, 0.4 + Math.random() * 0.6, 0.3, 0.7, 0.2],
                }}
                transition={{
                  duration: 1.4 + (i % 5) * 0.18,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.04,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
