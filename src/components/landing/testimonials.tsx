"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n";
import type { Testimonial } from "@prisma/client";

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const { t, locale } = useI18n();

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 surface-mesh -z-10" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight">
            {t("section.testimonials")}
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            {locale === "ar"
              ? "آراء حقيقية من طلابنا حول العالم"
              : "Real feedback from our students worldwide"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((tst, i) => (
            <motion.div
              key={tst.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <Card className="glass card-lux rounded-2xl p-6 h-full relative overflow-hidden">
                <Quote className="absolute top-4 end-4 w-10 h-10 text-primary/10" />
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s < tst.rating
                          ? "fill-chart-4 text-chart-4"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-5">
                  &ldquo;{locale === "ar" ? tst.contentAr : tst.contentEn}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-11 h-11 border-2 border-primary/30">
                    {tst.avatar ? (
                       
                      <img src={tst.avatar} alt={tst.nameEn} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
                      {(locale === "ar" ? tst.nameAr : tst.nameEn).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">
                      {locale === "ar" ? tst.nameAr : tst.nameEn}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {locale === "ar" ? tst.roleAr : tst.roleEn}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
