import { db } from "@/lib/db";
import { NotificationsList } from "@/components/shared/notifications-list";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const notifications = await db.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return <NotificationsList notifications={notifications} showMarkAll />;
}
