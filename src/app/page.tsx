import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LandingHero } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features";
import { CoursesSection } from "@/components/landing/courses-section";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { FAQSection } from "@/components/landing/faq";
import { CTASection } from "@/components/landing/cta";
import { StatsStrip } from "@/components/landing/stats";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser().catch(() => null);

  const [latestCourses, popularCourses, testimonials, faqs, settings] =
    await Promise.all([
      db.course.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { _count: { select: { lessons: true, enrollments: true } } },
      }),
      db.course.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { enrollments: { _count: "desc" } },
        take: 8,
        include: { _count: { select: { lessons: true, enrollments: true } } },
      }),
      db.testimonial.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        take: 6,
      }),
      db.fAQ.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        take: 8,
      }),
      db.settings.findFirst(),
    ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        isAuthenticated={!!user}
        role={user?.role as "ADMIN" | "MODERATOR" | "STUDENT" | undefined}
      />
      <main className="flex-1">
        <LandingHero settings={settings} />
        <StatsStrip />
        <FeaturesSection />
        <CoursesSection
          id="latest"
          titleKey="section.latest"
          courses={latestCourses}
        />
        <CoursesSection
          id="popular"
          titleKey="section.popular"
          courses={popularCourses}
        />
        <TestimonialsSection testimonials={testimonials} />
        <FAQSection faqs={faqs} />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
