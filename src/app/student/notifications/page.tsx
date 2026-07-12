import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationsList } from "@/components/shared/notifications-list";

export const dynamic = "force-dynamic";

export default async function StudentNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/admin");

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return <NotificationsList notifications={notifications} showMarkAll />;
}
