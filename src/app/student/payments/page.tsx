import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentPaymentsList } from "@/components/student/payments-list";

export const dynamic = "force-dynamic";

export default async function StudentPaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/admin");

  const payments = await db.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { id: true, titleAr: true, titleEn: true } },
      plan: { select: { nameAr: true, nameEn: true } },
    },
  });

  return <StudentPaymentsList payments={payments} />;
}
