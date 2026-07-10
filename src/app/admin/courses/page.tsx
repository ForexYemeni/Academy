import { db } from "@/lib/db";
import { CoursesManager } from "@/components/admin/courses-manager";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const [courses, categories] = await Promise.all([
    db.course.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { lessons: true, enrollments: true } },
        category: true,
      },
    }),
    db.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  return <CoursesManager initialCourses={courses} categories={categories} />;
}
