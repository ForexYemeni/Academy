import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReferralClient } from "@/components/student/referral-client";

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/admin");

  const referrals = await db.user.findMany({
    where: { referredById: user.id },
    select: {
      id: true,
      fullName: true,
      avatar: true,
      createdAt: true,
      enrollments: { where: { userId: { not: undefined } }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Count only referrals that subscribed (have at least one payment)
  const referralsWithSubs = await Promise.all(
    referrals.map(async (r) => ({
      ...r,
      hasSubscription: (await db.payment.count({
        where: { userId: r.id, status: "APPROVED" },
      })) > 0,
    }))
  );

  return (
    <ReferralClient
      referralCode={user.referralCode}
      referralRewards={user.referralRewards}
      referrals={referralsWithSubs}
    />
  );
}
