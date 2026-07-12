import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/student/profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/admin");

  const userData = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      fullName: true,
      phone: true,
      avatar: true,
      preferredLang: true,
      createdAt: true,
      referralCode: true,
    },
  });
  if (!userData) redirect("/login");

  return <ProfileClient user={userData} />;
}
