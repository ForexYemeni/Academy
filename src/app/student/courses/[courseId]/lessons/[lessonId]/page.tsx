import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { LessonPlayer } from "@/components/student/lesson-player";

export const dynamic = "force-dynamic";

export default async function LessonPlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/admin");

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, titleAr: true, titleEn: true, duration: true, isFree: true, order: true },
      },
    },
  });
  if (!course) notFound();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      audioProgress: {
        where: { userId: user.id },
        select: { currentTime: true, completed: true },
      },
    },
  });
  if (!lesson) notFound();

  // Verify enrollment (or free lesson or admin)
  const enrolled = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });
  if (!lesson.isFree && !enrolled && user.role === "STUDENT") {
    redirect(`/courses/${courseId}`);
  }

  return (
    <LessonPlayer
      course={course}
      lesson={lesson as any}
      initialPosition={lesson.audioProgress[0]?.currentTime || 0}
    />
  );
}
