import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/stats — dashboard statistics
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    studentsCount,
    subscribersCount,
    coursesCount,
    recordingsCount,
    revenueAgg,
    pendingPaymentsCount,
    recentStudents,
    recentPayments,
    recentCourses,
    dailyData,
    monthlyData,
    yearlyData,
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.enrollment.count(),
    db.course.count(),
    db.lesson.count(),
    db.payment.aggregate({
      where: { status: "APPROVED" },
      _sum: { finalAmount: true },
    }),
    db.payment.count({ where: { status: "PENDING" } }),
    db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, phone: true, createdAt: true, avatar: true },
    }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { fullName: true, phone: true, avatar: true } },
        course: { select: { titleAr: true, titleEn: true } },
      },
    }),
    db.course.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        price: true,
        status: true,
        isFeatured: true,
        _count: { select: { enrollments: true, lessons: true } },
      },
    }),
    // last 14 days
    getDailyStats(),
    // last 12 months
    getMonthlyStats(),
    // last 5 years
    getYearlyStats(),
  ]);

  return NextResponse.json({
    studentsCount,
    subscribersCount,
    coursesCount,
    recordingsCount,
    revenue: revenueAgg._sum.finalAmount || 0,
    pendingPaymentsCount,
    recentStudents,
    recentPayments,
    recentCourses,
    dailyData,
    monthlyData,
    yearlyData,
  });
}

async function getDailyStats() {
  const out: { date: string; count: number; revenue: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const [payAgg, userCount] = await Promise.all([
      db.payment.aggregate({
        where: {
          status: "APPROVED",
          createdAt: { gte: day, lt: next },
        },
        _sum: { finalAmount: true },
        _count: true,
      }),
      db.user.count({
        where: {
          role: "STUDENT",
          createdAt: { gte: day, lt: next },
        },
      }),
    ]);
    out.push({
      date: day.toISOString().slice(0, 10),
      count: payAgg._count + userCount,
      revenue: payAgg._sum.finalAmount || 0,
    });
  }
  return out;
}

async function getMonthlyStats() {
  const out: { month: string; count: number; revenue: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const [payAgg, userCount] = await Promise.all([
      db.payment.aggregate({
        where: { status: "APPROVED", createdAt: { gte: monthStart, lt: monthEnd } },
        _sum: { finalAmount: true },
        _count: true,
      }),
      db.user.count({
        where: { role: "STUDENT", createdAt: { gte: monthStart, lt: monthEnd } },
      }),
    ]);
    out.push({
      month: monthStart.toLocaleString("en", { month: "short" }),
      count: payAgg._count + userCount,
      revenue: payAgg._sum.finalAmount || 0,
    });
  }
  return out;
}

async function getYearlyStats() {
  const out: { year: string; count: number; revenue: number }[] = [];
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const yearStart = new Date(now.getFullYear() - i, 0, 1);
    const yearEnd = new Date(now.getFullYear() - i + 1, 0, 1);
    const [payAgg, userCount] = await Promise.all([
      db.payment.aggregate({
        where: { status: "APPROVED", createdAt: { gte: yearStart, lt: yearEnd } },
        _sum: { finalAmount: true },
        _count: true,
      }),
      db.user.count({
        where: { role: "STUDENT", createdAt: { gte: yearStart, lt: yearEnd } },
      }),
    ]);
    out.push({
      year: String(yearStart.getFullYear()),
      count: payAgg._count + userCount,
      revenue: payAgg._sum.finalAmount || 0,
    });
  }
  return out;
}
