"use server";

import { db } from "@/lib/db";
import { requireAdmin, requireModeratorOrAdmin } from "@/lib/auth";
import { hashPassword, normalizeYemeniPhone } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ===== COURSES =====

export type CourseInput = {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  coverImage?: string | null;
  price: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  status: "DRAFT" | "PUBLISHED" | "HIDDEN";
  isFeatured: boolean;
  order: number;
  categoryId?: string | null;
};

export async function createCourseAction(input: CourseInput) {
  await requireAdmin();
  const course = await db.course.create({
    data: {
      titleAr: input.titleAr,
      titleEn: input.titleEn,
      descriptionAr: input.descriptionAr,
      descriptionEn: input.descriptionEn,
      coverImage: input.coverImage || null,
      price: Number(input.price) || 0,
      level: input.level,
      status: input.status,
      isFeatured: input.isFeatured,
      order: Number(input.order) || 0,
      categoryId: input.categoryId || null,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/courses");
  return { ok: true, id: course.id };
}

export async function updateCourseAction(id: string, input: Partial<CourseInput>) {
  await requireAdmin();
  await db.course.update({
    where: { id },
    data: {
      ...(input.titleAr !== undefined && { titleAr: input.titleAr }),
      ...(input.titleEn !== undefined && { titleEn: input.titleEn }),
      ...(input.descriptionAr !== undefined && { descriptionAr: input.descriptionAr }),
      ...(input.descriptionEn !== undefined && { descriptionEn: input.descriptionEn }),
      ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
      ...(input.price !== undefined && { price: Number(input.price) }),
      ...(input.level !== undefined && { level: input.level }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
      ...(input.order !== undefined && { order: Number(input.order) }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId || null }),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/courses");
  revalidatePath(`/courses/${id}`);
  return { ok: true };
}

export async function deleteCourseAction(id: string) {
  await requireAdmin();
  await db.course.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/courses");
  return { ok: true };
}

export async function toggleCourseVisibilityAction(id: string) {
  await requireAdmin();
  const c = await db.course.findUnique({ where: { id } });
  if (!c) return { ok: false };
  const next = c.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN";
  await db.course.update({ where: { id }, data: { status: next } });
  revalidatePath("/");
  revalidatePath("/admin/courses");
  return { ok: true };
}

export async function toggleCourseFeaturedAction(id: string) {
  await requireAdmin();
  const c = await db.course.findUnique({ where: { id } });
  if (!c) return { ok: false };
  await db.course.update({ where: { id }, data: { isFeatured: !c.isFeatured } });
  revalidatePath("/");
  revalidatePath("/admin/courses");
  return { ok: true };
}

export async function reorderCoursesAction(orderedIds: string[]) {
  await requireAdmin();
  await Promise.all(
    orderedIds.map((id, idx) =>
      db.course.update({ where: { id }, data: { order: idx } })
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/courses");
  return { ok: true };
}

// ===== LESSONS =====

export type LessonInput = {
  courseId: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  audioData?: string | null; // base64
  audioSize?: number;
  duration?: number;
  pdfFiles?: string[] | null;
  attachments?: string[] | null;
  order: number;
  isFree?: boolean;
};

export async function createLessonAction(input: LessonInput) {
  await requireModeratorOrAdmin();
  const lesson = await db.lesson.create({
    data: {
      courseId: input.courseId,
      titleAr: input.titleAr,
      titleEn: input.titleEn,
      descriptionAr: input.descriptionAr || null,
      descriptionEn: input.descriptionEn || null,
      audioData: input.audioData || null,
      audioSize: Number(input.audioSize) || 0,
      duration: Number(input.duration) || 0,
      pdfFiles: input.pdfFiles ? JSON.stringify(input.pdfFiles) : null,
      attachments: input.attachments ? JSON.stringify(input.attachments) : null,
      order: Number(input.order) || 0,
      isFree: !!input.isFree,
    },
  });

  // Update course total duration
  await db.course.update({
    where: { id: input.courseId },
    data: {
      totalDuration: {
        increment: Number(input.duration) || 0,
      },
    },
  });

  // Notify enrolled students
  const enrollments = await db.enrollment.findMany({
    where: { courseId: input.courseId },
    select: { userId: true },
  });
  const course = await db.course.findUnique({ where: { id: input.courseId } });
  if (course) {
    await db.notification.createMany({
      data: enrollments.map((e) => ({
        userId: e.userId,
        type: "NEW_LESSON",
        titleAr: `درس جديد: ${lesson.titleAr}`,
        titleEn: `New lesson: ${lesson.titleEn}`,
        bodyAr: course.titleAr,
        bodyEn: course.titleEn,
        link: `/student/courses/${input.courseId}`,
      })),
    });
  }

  revalidatePath(`/admin/courses/${input.courseId}/lessons`);
  revalidatePath(`/courses/${input.courseId}`);
  return { ok: true, id: lesson.id };
}

export async function updateLessonAction(id: string, input: Partial<LessonInput>) {
  await requireModeratorOrAdmin();
  const existing = await db.lesson.findUnique({ where: { id } });
  if (!existing) return { ok: false };

  const oldDuration = existing.duration;
  const newDuration = input.duration !== undefined ? Number(input.duration) : oldDuration;

  await db.lesson.update({
    where: { id },
    data: {
      ...(input.titleAr !== undefined && { titleAr: input.titleAr }),
      ...(input.titleEn !== undefined && { titleEn: input.titleEn }),
      ...(input.descriptionAr !== undefined && { descriptionAr: input.descriptionAr }),
      ...(input.descriptionEn !== undefined && { descriptionEn: input.descriptionEn }),
      ...(input.audioData !== undefined && { audioData: input.audioData }),
      ...(input.audioSize !== undefined && { audioSize: Number(input.audioSize) }),
      ...(input.duration !== undefined && { duration: newDuration }),
      ...(input.pdfFiles !== undefined && {
        pdfFiles: input.pdfFiles ? JSON.stringify(input.pdfFiles) : null,
      }),
      ...(input.attachments !== undefined && {
        attachments: input.attachments ? JSON.stringify(input.attachments) : null,
      }),
      ...(input.order !== undefined && { order: Number(input.order) }),
      ...(input.isFree !== undefined && { isFree: !!input.isFree }),
    },
  });

  // Update course total duration if changed
  if (newDuration !== oldDuration) {
    await db.course.update({
      where: { id: existing.courseId },
      data: { totalDuration: { increment: newDuration - oldDuration } },
    });
  }

  revalidatePath(`/admin/courses/${existing.courseId}/lessons`);
  revalidatePath(`/courses/${existing.courseId}`);
  return { ok: true };
}

export async function deleteLessonAction(id: string) {
  await requireModeratorOrAdmin();
  const lesson = await db.lesson.findUnique({ where: { id } });
  if (!lesson) return { ok: false };
  await db.lesson.delete({ where: { id } });
  await db.course.update({
    where: { id: lesson.courseId },
    data: { totalDuration: { decrement: lesson.duration } },
  });
  revalidatePath(`/admin/courses/${lesson.courseId}/lessons`);
  revalidatePath(`/courses/${lesson.courseId}`);
  return { ok: true };
}

// ===== PAYMENTS =====

export async function approvePaymentAction(id: string, rejectReason?: string) {
  await requireModeratorOrAdmin();
  const payment = await db.payment.findUnique({
    where: { id },
    include: { course: true },
  });
  if (!payment) return { ok: false, error: "Payment not found" };

  if (rejectReason) {
    // Reject
    await db.payment.update({
      where: { id },
      data: { status: "REJECTED", rejectReason },
    });
    await db.notification.create({
      userId: payment.userId,
      type: "PAYMENT_REJECTED",
      titleAr: "تم رفض دفعتك",
      titleEn: "Your payment was rejected",
      bodyAr: rejectReason,
      bodyEn: rejectReason,
      link: `/student/payments`,
    });
  } else {
    // Approve
    await db.payment.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    // Create subscription
    const plan = payment.planId
      ? await db.subscriptionPlan.findUnique({ where: { id: payment.planId } })
      : null;
    const months = plan?.monthsCount || 1;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const subscription = await db.subscription.create({
      data: {
        userId: payment.userId,
        courseId: payment.courseId,
        planId: payment.planId || (await getDefaultPlanId()).id,
        startDate: new Date(),
        endDate,
        isActive: true,
        paymentId: payment.id,
      },
    });

    // Create or update enrollment
    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
    });
    if (existing) {
      await db.enrollment.update({
        where: { id: existing.id },
        data: { subscriptionId: subscription.id, expiresAt: endDate },
      });
    } else {
      await db.enrollment.create({
        data: {
          userId: payment.userId,
          courseId: payment.courseId,
          subscriptionId: subscription.id,
          expiresAt: endDate,
        },
      });
    }

    // Update payment link
    await db.payment.update({ where: { id }, data: { subscriptionId: subscription.id } });

    // Reward referrer if exists
    const user = await db.user.findUnique({ where: { id: payment.userId } });
    if (user?.referredById) {
      await db.user.update({
        where: { id: user.referredById },
        data: { referralRewards: { increment: payment.finalAmount * 0.1 } },
      });
    }

    await db.notification.create({
      userId: payment.userId,
      type: "PAYMENT_APPROVED",
      titleAr: "تم قبول دفعتك وفتح الدورة",
      titleEn: "Payment approved, course unlocked",
      bodyAr: payment.course.titleAr,
      bodyEn: payment.course.titleEn,
      link: `/student/courses/${payment.courseId}`,
    });
  }
  revalidatePath("/admin/payments");
  revalidatePath("/student/payments");
  return { ok: true };
}

export async function suspendPaymentAction(id: string, reason?: string) {
  await requireModeratorOrAdmin();
  await db.payment.update({
    where: { id },
    data: { status: "SUSPENDED", rejectReason: reason || null },
  });
  revalidatePath("/admin/payments");
  return { ok: true };
}

async function getDefaultPlanId() {
  let plan = await db.subscriptionPlan.findFirst({
    where: { duration: "ONE_MONTH" },
  });
  if (!plan) {
    plan = await db.subscriptionPlan.create({
      data: {
        nameAr: "شهر",
        nameEn: "1 Month",
        duration: "ONE_MONTH",
        monthsCount: 1,
        price: 0,
      },
    });
  }
  return plan;
}

// ===== WALLETS =====

export async function upsertWalletAction(input: {
  method: "JAWALI" | "JIB" | "ONE_CASH" | "CASH";
  nameAr: string;
  nameEn: string;
  number: string;
  qrCode?: string | null;
  image?: string | null;
  instructionsAr?: string;
  instructionsEn?: string;
  isActive: boolean;
}) {
  await requireAdmin();
  await db.wallet.upsert({
    where: { method: input.method },
    create: {
      method: input.method,
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      number: input.number,
      qrCode: input.qrCode || null,
      image: input.image || null,
      instructionsAr: input.instructionsAr || null,
      instructionsEn: input.instructionsEn || null,
      isActive: input.isActive,
    },
    update: {
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      number: input.number,
      qrCode: input.qrCode || null,
      image: input.image || null,
      instructionsAr: input.instructionsAr || null,
      instructionsEn: input.instructionsEn || null,
      isActive: input.isActive,
    },
  });
  revalidatePath("/admin/wallets");
  return { ok: true };
}

// ===== SUBSCRIPTION PLANS =====

export async function createPlanAction(input: {
  nameAr: string;
  nameEn: string;
  duration: "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS" | "ONE_YEAR";
  price: number;
  isActive: boolean;
}) {
  await requireAdmin();
  const monthsCount =
    input.duration === "ONE_MONTH"
      ? 1
      : input.duration === "THREE_MONTHS"
      ? 3
      : input.duration === "SIX_MONTHS"
      ? 6
      : 12;
  await db.subscriptionPlan.create({
    data: {
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      duration: input.duration,
      monthsCount,
      price: Number(input.price) || 0,
      isActive: input.isActive,
    },
  });
  revalidatePath("/admin/plans");
  return { ok: true };
}

export async function updatePlanAction(id: string, input: Partial<{
  nameAr: string;
  nameEn: string;
  price: number;
  isActive: boolean;
}>) {
  await requireAdmin();
  await db.subscriptionPlan.update({
    where: { id },
    data: {
      ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
      ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
      ...(input.price !== undefined && { price: Number(input.price) }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
  revalidatePath("/admin/plans");
  return { ok: true };
}

export async function deletePlanAction(id: string) {
  await requireAdmin();
  await db.subscriptionPlan.delete({ where: { id } });
  revalidatePath("/admin/plans");
  return { ok: true };
}

// ===== COUPONS =====

export async function createCouponAction(input: {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  maxUses: number;
  expiresAt?: string | null;
  courseId?: string | null;
  isActive: boolean;
}) {
  await requireAdmin();
  await db.coupon.create({
    data: {
      code: input.code.toUpperCase(),
      type: input.type,
      value: Number(input.value) || 0,
      maxUses: Number(input.maxUses) || 0,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      courseId: input.courseId || null,
      isActive: input.isActive,
    },
  });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCouponAction(id: string) {
  await requireAdmin();
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

// ===== ANNOUNCEMENTS =====

export async function createAnnouncementAction(input: {
  type: "NEWS" | "UPDATE" | "ALERT";
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
}) {
  const user = await requireModeratorOrAdmin();
  const ann = await db.announcement.create({
    data: {
      type: input.type,
      titleAr: input.titleAr,
      titleEn: input.titleEn,
      bodyAr: input.bodyAr,
      bodyEn: input.bodyEn,
      createdBy: user.id,
    },
  });
  // Notify all students
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true },
  });
  await db.notification.createMany({
    data: students.map((s) => ({
      userId: s.id,
      type: "NEW_ANNOUNCEMENT",
      titleAr: input.titleAr,
      titleEn: input.titleEn,
      bodyAr: input.bodyAr.slice(0, 200),
      bodyEn: input.bodyEn.slice(0, 200),
      link: "/student/announcements",
    })),
  });
  revalidatePath("/admin/announcements");
  return { ok: true };
}

export async function deleteAnnouncementAction(id: string) {
  await requireModeratorOrAdmin();
  await db.announcement.delete({ where: { id } });
  revalidatePath("/admin/announcements");
  return { ok: true };
}

// ===== MODERATORS =====

export async function createModeratorAction(input: {
  userId: string;
  canManageCourses: boolean;
  canManagePayments: boolean;
  canManageStudents: boolean;
  canManageCommunity: boolean;
  canManageAnnouncements: boolean;
  canManageSettings: boolean;
}) {
  await requireAdmin();
  // Promote user role
  await db.user.update({ where: { id: input.userId }, data: { role: "MODERATOR" } });
  await db.moderator.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      ...input,
    },
    update: { ...input },
  });
  revalidatePath("/admin/moderators");
  return { ok: true };
}

export async function deleteModeratorAction(id: string) {
  await requireAdmin();
  const mod = await db.moderator.findUnique({ where: { id } });
  if (mod) {
    await db.user.update({ where: { id: mod.userId }, data: { role: "STUDENT" } });
    await db.moderator.delete({ where: { id } });
  }
  revalidatePath("/admin/moderators");
  return { ok: true };
}

// ===== SETTINGS =====

export async function updateSettingsAction(input: Record<string, any>) {
  await requireAdmin();
  const existing = await db.settings.findFirst();
  if (existing) {
    await db.settings.update({
      where: { id: existing.id },
      data: { ...input },
    });
  } else {
    await db.settings.create({
      data: { ...input },
    });
  }
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true };
}

// ===== TESTIMONIALS =====

export async function createTestimonialAction(input: {
  nameAr: string;
  nameEn: string;
  roleAr?: string;
  roleEn?: string;
  contentAr: string;
  contentEn: string;
  rating: number;
  avatar?: string | null;
  isActive: boolean;
}) {
  await requireAdmin();
  await db.testimonial.create({ data: input });
  revalidatePath("/");
  return { ok: true };
}

export async function deleteTestimonialAction(id: string) {
  await requireAdmin();
  await db.testimonial.delete({ where: { id } });
  revalidatePath("/");
  return { ok: true };
}

// ===== FAQ =====

export async function createFAQAction(input: {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  order: number;
}) {
  await requireAdmin();
  await db.fAQ.create({ data: { ...input, isActive: true } });
  revalidatePath("/");
  return { ok: true };
}

export async function deleteFAQAction(id: string) {
  await requireAdmin();
  await db.fAQ.delete({ where: { id } });
  revalidatePath("/");
  return { ok: true };
}

// ===== COMMUNITY =====

export async function pinPostAction(id: string) {
  await requireModeratorOrAdmin();
  const post = await db.communityPost.findUnique({ where: { id } });
  if (!post) return { ok: false };
  await db.communityPost.update({ where: { id }, data: { isPinned: !post.isPinned } });
  revalidatePath(`/admin/community`);
  return { ok: true };
}

export async function deletePostAction(id: string) {
  await requireModeratorOrAdmin();
  await db.communityPost.delete({ where: { id } });
  revalidatePath(`/admin/community`);
  return { ok: true };
}

// ===== USER MANAGEMENT (Admin creates new student account) =====

export type CreateUserResult = { ok: true; id: string } | { ok: false; error: string };

export async function createUserAction(input: {
  fullName: string;
  phone: string;
  password: string;
  role?: "STUDENT" | "MODERATOR";
}): Promise<CreateUserResult> {
  await requireAdmin();

  const fullName = (input.fullName || "").trim();
  const phoneRaw = (input.phone || "").trim();
  const password = (input.password || "").trim();
  const role = input.role || "STUDENT";

  if (!fullName || fullName.length < 3) return { ok: false, error: "auth.name.min" };
  if (!password || password.length < 6) return { ok: false, error: "auth.password.min" };
  const phone = normalizeYemeniPhone(phoneRaw);
  if (!phone) return { ok: false, error: "auth.phone.hint" };

  const exists = await db.user.findUnique({ where: { phone } });
  if (exists) return { ok: false, error: "auth.phone.exists" };

  const user = await db.user.create({
    data: {
      fullName,
      phone,
      passwordHash: hashPassword(password),
      role,
    },
  });

  // If created as moderator, also create moderator record (with no permissions initially)
  if (role === "MODERATOR") {
    await db.moderator.create({
      data: {
        userId: user.id,
        canManageCourses: false,
        canManagePayments: false,
        canManageStudents: false,
        canManageCommunity: false,
        canManageAnnouncements: false,
        canManageSettings: false,
      },
    });
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/moderators");
  return { ok: true, id: user.id };
}

export async function deleteUserAction(id: string) {
  await requireAdmin();
  // Prevent admin from deleting themselves
  const currentUser = await requireAdmin();
  if (currentUser.id === id) {
    return { ok: false, error: "Cannot delete yourself" };
  }
  await db.user.delete({ where: { id } });
  revalidatePath("/admin/students");
  revalidatePath("/admin/moderators");
  return { ok: true };
}
