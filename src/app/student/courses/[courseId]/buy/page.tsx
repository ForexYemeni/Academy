import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { BuyCourseClient } from "@/components/student/buy-course-client";

export const dynamic = "force-dynamic";

export default async function BuyCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/admin");

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { _count: { select: { lessons: true } } },
  });
  if (!course) notFound();

  const [plans, wallets, existingEnrollment] = await Promise.all([
    db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { monthsCount: "asc" },
    }),
    db.wallet.findMany({ where: { isActive: true } }),
    db.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    }),
  ]);

  if (existingEnrollment) {
    redirect(`/student/courses/${courseId}/lessons/${existingEnrollment.lastLessonId || ""}`);
  }

  return (
    <BuyCourseClient course={course} plans={plans} wallets={wallets} courseLessonsCount={course._count.lessons} />
  );
}
