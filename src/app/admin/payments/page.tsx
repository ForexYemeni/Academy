import { db } from "@/lib/db";
import { PaymentsManager } from "@/components/admin/payments-manager";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, fullName: true, phone: true, avatar: true } },
      course: { select: { id: true, titleAr: true, titleEn: true } },
      plan: { select: { nameAr: true, nameEn: true, monthsCount: true } },
    },
  });

  return <PaymentsManager payments={payments} />;
}
