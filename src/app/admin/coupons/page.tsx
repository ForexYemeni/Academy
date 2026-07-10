import { db } from "@/lib/db";
import { CouponsManager } from "@/components/admin/coupons-manager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { course: { select: { titleAr: true, titleEn: true } } },
  });
  return <CouponsManager coupons={coupons} />;
}
