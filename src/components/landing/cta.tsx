"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export function CTASection() {
  const { t, locale } = useI18n();

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden card-lux"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px, 60px 60px",
            }}
          />
          <div className="relative px-6 py-16 sm:px-12 sm:py-20 text-center text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-medium mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              {locale === "ar" ? "ابدأ رحلتك اليوم" : "Start your journey today"}
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight max-w-3xl mx-auto leading-tight">
              {locale === "ar"
                ? "انضم لآلاف الطلاب الذين يتعلّمون بالاستماع"
                : "Join thousands of students learning by ear"}
            </h2>
            <p className="mt-4 text-white/80 max-w-xl mx-auto">
              {locale === "ar"
                ? "أنشئ حسابك مجاناً واستمع لأول درس خلال دقيقة واحدة"
                : "Create your free account and listen to your first lesson in one minute"}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full text-base h-12 px-8 bg-white text-primary hover:bg-white/90"
              >
                <Link href="/register">
                  {t("hero.cta.join")}
                  <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full text-base h-12 px-8 bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
