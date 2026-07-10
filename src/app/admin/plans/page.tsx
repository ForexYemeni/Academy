import { db } from "@/lib/db";
import { PlansManager } from "@/components/admin/plans-manager";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await db.subscriptionPlan.findMany({
    orderBy: { monthsCount: "asc" },
    include: { _count: { select: { subscriptions: true } } },
  });
  return <PlansManager plans={plans} />;
}
