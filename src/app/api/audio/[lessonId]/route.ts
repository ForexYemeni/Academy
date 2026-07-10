import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/audio/[lessonId] — stream audio for a lesson (with Range support)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, audioData: true, audioUrl: true, isFree: true, courseId: true },
  });
  if (!lesson) return new NextResponse("Not found", { status: 404 });

  // Free lessons are accessible to all; otherwise require enrollment or admin
  if (!lesson.isFree) {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    if (user.role === "STUDENT") {
      const enrolled = await db.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: lesson.courseId } },
      });
      if (!enrolled) return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // External URL: redirect
  if (lesson.audioUrl) {
    return NextResponse.redirect(lesson.audioUrl);
  }

  if (!lesson.audioData) {
    return new NextResponse("No audio", { status: 404 });
  }

  // audioData is base64-encoded MP3/WebM blob
  const buffer = Buffer.from(lesson.audioData, "base64");

  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      const start = m[1] ? parseInt(m[1], 10) : 0;
      const end = m[2] ? parseInt(m[2], 10) : buffer.length - 1;
      const chunk = buffer.subarray(start, end + 1);
      return new NextResponse(chunk as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${buffer.length}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunk.length),
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  }

  return new NextResponse(buffer as any, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buffer.length),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
