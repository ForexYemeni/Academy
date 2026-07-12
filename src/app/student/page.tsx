import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentOverview } from "@/components/student/overview";

export const dynamic = "force-dynamic";

export default async function StudentHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/admin");

  const [enrollments, announcements, notifications] = await Promise.all([
    db.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            coverImage: true,
            level: true,
            _count: { select: { lessons: true } },
            lessons: {
              orderBy: { order: "asc" },
              take: 1,
              select: { id: true, titleAr: true, titleEn: true },
            },
          },
        },
      },
      orderBy: { lastActiveAt: "desc" },
    }),
    db.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    db.notification.findMany({
      where: { userId: user.id, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <StudentOverview
      user={{
        name: user.fullName,
        avatar: user.avatar,
        referralCode: user.referralCode,
        referralRewards: user.referralRewards,
      }}
      enrollments={enrollments}
      announcements={announcements}
      notifications={notifications}
    />
  );
}
