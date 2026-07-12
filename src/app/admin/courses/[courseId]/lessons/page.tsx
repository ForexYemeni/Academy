import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { LessonsManager } from "@/components/admin/lessons-manager";

export const dynamic = "force-dynamic";

export default async function LessonsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
  if (!course) notFound();

  return <LessonsManager courseId={courseId} initialLessons={course.lessons} />;
}
