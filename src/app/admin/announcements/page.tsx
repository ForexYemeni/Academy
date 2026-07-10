import { db } from "@/lib/db";
import { AnnouncementsManager } from "@/components/admin/announcements-manager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdByUser: { select: { fullName: true } } },
  });
  return <AnnouncementsManager announcements={announcements} />;
}
