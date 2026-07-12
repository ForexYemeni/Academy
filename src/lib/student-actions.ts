"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ===== PAYMENT SUBMISSION =====

export async function submitPaymentAction(input: {
  courseId: string;
  planId: string;
  method: "JAWALI" | "JIB" | "ONE_CASH" | "CASH";
  amount: number;
  transferImage?: string | null;
  operationNo?: string;
  notes?: string;
  couponCode?: string;
  discount: number;
  finalAmount: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const payment = await db.payment.create({
    data: {
      userId: user.id,
      courseId: input.courseId,
      planId: input.planId,
      amount: Number(input.amount),
      method: input.method,
      status: "PENDING",
      transferImage: input.transferImage || null,
      operationNo: input.operationNo || null,
      notes: input.notes || null,
      couponCode: input.couponCode || null,
      discount: Number(input.discount) || 0,
      finalAmount: Number(input.finalAmount),
    },
  });

  // Increment coupon usage if used
  if (input.couponCode) {
    await db.coupon.updateMany({
      where: { code: input.couponCode.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  }

  revalidatePath("/student/payments");
  revalidatePath("/admin/payments");
  return { ok: true, id: payment.id };
}

// ===== AUDIO PROGRESS =====

export async function saveAudioProgressAction(input: {
  lessonId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  await db.audioProgress.upsert({
    where: {
      userId_lessonId: { userId: user.id, lessonId: input.lessonId },
    },
    create: {
      userId: user.id,
      lessonId: input.lessonId,
      currentTime: Number(input.currentTime),
      duration: Number(input.duration),
      completed: input.completed,
      lastPlayedAt: new Date(),
    },
    update: {
      currentTime: Number(input.currentTime),
      duration: Number(input.duration),
      completed: input.completed,
      lastPlayedAt: new Date(),
    },
  });

  // Update enrollment total listen time + last lesson
  const lesson = await db.lesson.findUnique({
    where: { id: input.lessonId },
    select: { courseId: true },
  });
  if (lesson) {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: lesson.courseId } },
    });
    if (enrollment) {
      // Count completed lessons
      const completedCount = await db.audioProgress.count({
        where: {
          userId: user.id,
          lesson: { courseId: lesson.courseId },
          completed: true,
        },
      });
      const totalLessons = await db.lesson.count({
        where: { courseId: lesson.courseId },
      });
      const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
      await db.enrollment.update({
        where: { id: enrollment.id },
        data: {
          completedLessons: completedCount,
          progress: Math.min(100, progress),
          lastLessonId: input.lessonId,
          lastActiveAt: new Date(),
        },
      });
    }
  }

  return { ok: true };
}

// ===== COMMUNITY =====

export async function createPostAction(input: {
  courseId: string;
  contentAr?: string;
  contentEn?: string;
  images?: string[];
  files?: string[];
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  // Verify enrollment
  const enrolled = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: input.courseId } },
  });
  if (!enrolled && user.role === "STUDENT") throw new Error("FORBIDDEN");

  const post = await db.communityPost.create({
    data: {
      courseId: input.courseId,
      userId: user.id,
      contentAr: input.contentAr || null,
      contentEn: input.contentEn || null,
      images: input.images ? JSON.stringify(input.images) : null,
      files: input.files ? JSON.stringify(input.files) : null,
    },
  });
  revalidatePath(`/student/courses/${input.courseId}/community`);
  return { ok: true, id: post.id };
}

export async function createCommentAction(input: {
  postId: string;
  contentAr?: string;
  contentEn?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const comment = await db.communityComment.create({
    data: {
      postId: input.postId,
      userId: user.id,
      contentAr: input.contentAr || null,
      contentEn: input.contentEn || null,
    },
  });

  // Increment post comment count
  await db.communityPost.update({
    where: { id: input.postId },
    data: { commentsCount: { increment: 1 } },
  });

  // Notify post author
  const post = await db.communityPost.findUnique({
    where: { id: input.postId },
    select: { userId: true, courseId: true },
  });
  if (post && post.userId !== user.id) {
    await db.notification.create({
      userId: post.userId,
      type: "NEW_COMMENT",
      titleAr: "تعليق جديد على منشورك",
      titleEn: "New comment on your post",
      bodyAr: input.contentAr?.slice(0, 100) || null,
      bodyEn: input.contentEn?.slice(0, 100) || null,
      link: `/student/courses/${post.courseId}/community`,
    });
  }

  revalidatePath(`/student/courses/${post?.courseId}/community`);
  return { ok: true, id: comment.id };
}

export async function createReplyAction(input: {
  commentId: string;
  contentAr?: string;
  contentEn?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const reply = await db.communityReply.create({
    data: {
      commentId: input.commentId,
      userId: user.id,
      contentAr: input.contentAr || null,
      contentEn: input.contentEn || null,
    },
  });

  // Notify comment author
  const comment = await db.communityComment.findUnique({
    where: { id: input.commentId },
    include: { post: { select: { courseId: true } } },
  });
  if (comment && comment.userId !== user.id) {
    await db.notification.create({
      userId: comment.userId,
      type: "NEW_REPLY",
      titleAr: "رد جديد على تعليقك",
      titleEn: "New reply to your comment",
      bodyAr: input.contentAr?.slice(0, 100) || null,
      bodyEn: input.contentEn?.slice(0, 100) || null,
      link: `/student/courses/${comment.post.courseId}/community`,
    });
  }

  revalidatePath(`/student/courses/${comment?.post.courseId}/community`);
  return { ok: true, id: reply.id };
}

export async function toggleLikeAction(input: { postId?: string; commentId?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  if (input.postId) {
    const existing = await db.communityLike.findUnique({
      where: { userId_postId: { userId: user.id, postId: input.postId } },
    });
    if (existing) {
      await db.communityLike.delete({ where: { id: existing.id } });
      await db.communityPost.update({
        where: { id: input.postId },
        data: { likesCount: { decrement: 1 } },
      });
    } else {
      await db.communityLike.create({
        data: { userId: user.id, postId: input.postId },
      });
      await db.communityPost.update({
        where: { id: input.postId },
        data: { likesCount: { increment: 1 } },
      });
    }
  } else if (input.commentId) {
    const existing = await db.communityLike.findUnique({
      where: { userId_commentId: { userId: user.id, commentId: input.commentId } },
    });
    if (existing) {
      await db.communityLike.delete({ where: { id: existing.id } });
      await db.communityComment.update({
        where: { id: input.commentId },
        data: { likesCount: { decrement: 1 } },
      });
    } else {
      await db.communityLike.create({
        data: { userId: user.id, commentId: input.commentId },
      });
      await db.communityComment.update({
        where: { id: input.commentId },
        data: { likesCount: { increment: 1 } },
      });
    }
  }
  return { ok: true };
}

// ===== COUPON VALIDATION =====

export async function validateCouponAction(code: string, courseId: string, amount: number) {
  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!coupon || !coupon.isActive) return { ok: false, error: "invalid" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { ok: false, error: "expired" };
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return { ok: false, error: "exhausted" };
  if (coupon.courseId && coupon.courseId !== courseId) return { ok: false, error: "invalid" };

  const discount = coupon.type === "PERCENT" ? (amount * coupon.value) / 100 : coupon.value;
  const finalAmount = Math.max(0, amount - discount);
  return { ok: true, discount, finalAmount, coupon };
}

// ===== NOTIFICATIONS =====

export async function markNotificationReadAction(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  await db.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  });
  revalidatePath("/student/notifications");
  return { ok: true };
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  await db.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/student/notifications");
  return { ok: true };
}

// ===== DELETE OWN POST =====

export async function deleteOwnPostAction(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const post = await db.communityPost.findUnique({ where: { id } });
  if (!post || (post.userId !== user.id && user.role === "STUDENT"))
    throw new Error("FORBIDDEN");
  await db.communityPost.delete({ where: { id } });
  revalidatePath(`/student/courses/${post.courseId}/community`);
  return { ok: true };
}
