import { db } from "@/lib/db";
import { StudentsList } from "@/components/admin/students-list";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, payments: true } },
      enrollments: {
        take: 1,
        orderBy: { updatedAt: "desc" },
        select: { progress: true, lastActiveAt: true, totalListenSeconds: true },
      },
    },
  });
  return <StudentsList students={students} />;
}
