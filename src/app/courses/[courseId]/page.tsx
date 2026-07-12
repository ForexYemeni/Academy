import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { CourseDetailClient } from "@/components/student/course-detail-client";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await getCurrentUser().catch(() => null);

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      _count: { select: { lessons: true, enrollments: true } },
      lessons: {
        where: { order: 0 },
        take: 1,
      },
    },
  });
  if (!course) notFound();

  // If student already enrolled, redirect to player
  if (user?.role === "STUDENT") {
    const enrolled = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (enrolled) {
      const firstLesson = await db.lesson.findFirst({
        where: { courseId },
        orderBy: { order: "asc" },
      });
      redirect(`/student/courses/${courseId}/lessons/${enrolled.lastLessonId || firstLesson?.id || ""}`);
    }
  }

  const plans = await db.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { monthsCount: "asc" },
  });

  return (
    <CourseDetailClient
      course={course}
      plans={plans}
      lessonsCount={course._count.lessons}
      studentsCount={course._count.enrollments}
      isAuthenticated={!!user}
    />
  );
}
