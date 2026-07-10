import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MyCoursesClient } from "@/components/student/my-courses-client";

export const dynamic = "force-dynamic";

export default async function MyCoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/admin");

  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          _count: { select: { lessons: true } },
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, titleAr: true, titleEn: true, duration: true, isFree: true },
          },
        },
      },
      lastLesson: { select: { id: true } },
    },
    orderBy: { lastActiveAt: "desc" },
  });

  return <MyCoursesClient enrollments={enrollments} />;
}
