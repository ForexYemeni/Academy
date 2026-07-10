import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CourseCommunityClient } from "@/components/student/course-community-client";

export const dynamic = "force-dynamic";

export default async function CourseCommunityPage({
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
    select: { id: true, titleAr: true, titleEn: true, coverImage: true },
  });
  if (!course) notFound();

  const enrolled = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });
  if (!enrolled) redirect(`/courses/${courseId}`);

  const posts = await db.communityPost.findMany({
    where: { courseId },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { id: true, fullName: true, avatar: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        take: 3,
        include: {
          user: { select: { id: true, fullName: true, avatar: true } },
          replies: {
            include: { user: { select: { id: true, fullName: true, avatar: true } } },
          },
          likes: { where: { userId: user.id }, select: { id: true } },
        },
      },
      likes: {
        where: { userId: user.id },
        select: { id: true },
      },
    },
  });

  return (
    <CourseCommunityClient
      course={course}
      posts={posts as any}
      currentUserId={user.id}
    />
  );
}
