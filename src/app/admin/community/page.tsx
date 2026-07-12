import { db } from "@/lib/db";
import { AdminCommunityList } from "@/components/admin/admin-community-list";

export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  const posts = await db.communityPost.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { fullName: true, avatar: true } },
      course: { select: { titleAr: true, titleEn: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });
  return <AdminCommunityList posts={posts} />;
}
