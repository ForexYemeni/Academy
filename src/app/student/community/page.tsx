import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CommunityClient } from "@/components/student/community-client";

export const dynamic = "force-dynamic";

export default async function StudentCommunityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/admin");

  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        select: { id: true, titleAr: true, titleEn: true, coverImage: true },
      },
    },
  });

  return <CommunityClient enrollments={enrollments} />;
}
