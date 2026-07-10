"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { FAQ } from "@prisma/client";
import Link from "next/link";

export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  const { t, locale } = useI18n();

  const defaultFaqs: { q: string; a: string }[] =
    locale === "ar"
      ? [
          {
            q: "كيف أشترك في دورة؟",
            a: "بعد إنشاء حساب، اختر الدورة ثم الباقة المناسبة، ادفع عبر إحدى وسائل الدفع المتاحة، ارفع إثبات التحويل، وسيتم تفعيل اشتراكك خلال دقائق بعد موافقة الإدارة.",
          },
          {
            q: "هل التسجيل صوتي فقط أم فيديو؟",
            a: "المنصة صوتية بالكامل لضمان سرعة التحميل وتقليل استهلاك البيانات. لكن كل درس قد يحتوي على ملفات PDF ومرفقات إضافية.",
          },
          {
            q: "هل يمكنني استكمال الاستماع لاحقاً؟",
            a: "نعم، يحفظ المشغل تلقائياً آخر نقطة استماع ويعرضها لك عند العودة لنفس الدرس على أي جهاز.",
          },
          {
            q: "ما هي وسائل الدفع المتاحة؟",
            a: "ندعم جوالي، جيب، ون كاش، وكاش. تختار الإدارة وسيلة الدفع وتظهر لك تعليمات التحويل مع QR Code ورقم المحفظة.",
          },
          {
            q: "هل يوجد نظام إحالات؟",
            a: "نعم، كل طالب يحصل على رابط إحالة خاص. عند تسجيل صديق جديد واشتراكه في دورة، تحصل على مكافأة تسجّل في ملفك.",
          },
          {
            q: "هل التطبيق متوافق مع الهواتف؟",
            a: "نعم، المنصة مصممة بمنهجية Mobile First ويمكن تثبيتها كـ PWA على شاشتك الرئيسية لتجربة تطبيق أصلية.",
          },
        ]
      : [
          {
            q: "How do I subscribe to a course?",
            a: "After creating an account, pick a course and plan, pay via one of the available methods, upload proof of transfer, and your subscription will be activated within minutes after admin approval.",
          },
          {
            q: "Is the content audio only or video?",
            a: "The platform is fully audio-based for fast loading and low data usage. Each lesson may include PDF files and additional attachments.",
          },
          {
            q: "Can I resume listening later?",
            a: "Yes, the player automatically saves your last position and shows it when you return on any device.",
          },
          {
            q: "What payment methods are supported?",
            a: "We support Jawali, Jib, One Cash, and Cash. Admins configure each wallet with QR code, number, and instructions.",
          },
          {
            q: "Is there a referral system?",
            a: "Yes, each student gets a unique referral link. When a friend signs up and subscribes, you earn a reward credited to your profile.",
          },
          {
            q: "Is it mobile-friendly?",
            a: "Yes, the platform is Mobile-First and installable as a PWA on your home screen for a native app experience.",
          },
        ];

  const items =
    faqs.length > 0
      ? faqs.map((f) => ({
          q: locale === "ar" ? f.questionAr : f.questionEn,
          a: locale === "ar" ? f.answerAr : f.answerEn,
        }))
      : defaultFaqs;

  return (
    <section id="faq" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight">
            {t("section.faq")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {locale === "ar"
              ? "كل ما تحتاج معرفته قبل البدء"
              : "Everything you need to know before you start"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-4 sm:p-6 card-lux"
        >
          <Accordion type="single" collapsible className="w-full space-y-2">
            {items.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-0 rounded-2xl bg-card/30 px-4 data-[state=open]:bg-card/60 transition-colors"
              >
                <AccordionTrigger className="text-start font-semibold hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <div className="text-center mt-8">
          <Button asChild variant="outline" className="rounded-full glass">
            <Link href="/register">{t("faq.contact")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
