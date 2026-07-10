import { db } from "@/lib/db";
import { ModeratorsManager } from "@/components/admin/moderators-manager";

export const dynamic = "force-dynamic";

export default async function AdminModeratorsPage() {
  const [moderators, students] = await Promise.all([
    db.moderator.findMany({
      include: { user: { select: { id: true, fullName: true, phone: true, avatar: true } } },
    }),
    db.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, fullName: true, phone: true },
      orderBy: { fullName: "asc" },
    }),
  ]);
  return <ModeratorsManager moderators={moderators} students={students} />;
}
