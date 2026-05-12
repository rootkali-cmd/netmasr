import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await prisma.report.findMany({
    orderBy: [{ isResolved: "asc" }, { createdAt: "desc" }],
    include: {
      post: { select: { id: true, title: true, isClosed: true } },
      comment: { select: { id: true, content: true } },
    },
    take: 100,
  });

  return NextResponse.json({ reports });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, action } = body;

    const report = await prisma.report.findUnique({
      where: { id },
      include: { post: true, comment: true },
    });
    if (!report) {
      return NextResponse.json({ error: "البلاغ غير موجود" }, { status: 404 });
    }

    if (action === "resolve") {
      await prisma.report.update({
        where: { id },
        data: { isResolved: true, resolvedBy: session.admin.username },
      });
      await prisma.auditLog.create({
        data: { adminId: session.adminId, action: "resolve_report", details: `تم حل البلاغ ${id}` },
      });
      return NextResponse.json({ success: true, message: "تم حل البلاغ" });
    }

    if (action === "suspend") {
      if (report.postId) {
        await prisma.post.update({ where: { id: report.postId }, data: { status: "pending" } });
      }
      if (report.commentId) {
        await prisma.comment.update({ where: { id: report.commentId }, data: { status: "pending" } });
      }
      await prisma.report.update({
        where: { id },
        data: { isResolved: true, resolvedBy: session.admin.username },
      });
      await prisma.auditLog.create({
        data: { adminId: session.adminId, action: "suspend_content", details: `تم حظر المحتوى ${report.postId || report.commentId}` },
      });
      return NextResponse.json({ success: true, message: "تم حظر المحتوى مؤقتًا" });
    }

    if (action === "delete") {
      if (report.postId) {
        await prisma.comment.deleteMany({ where: { postId: report.postId } });
        await prisma.postVote.deleteMany({ where: { postId: report.postId } });
        await prisma.post.delete({ where: { id: report.postId } });
      }
      if (report.commentId) {
        await prisma.report.deleteMany({ where: { commentId: report.commentId } });
        await prisma.comment.delete({ where: { id: report.commentId } });
      }
      await prisma.report.delete({ where: { id } });
      await prisma.auditLog.create({
        data: { adminId: session.adminId, action: "delete_content", details: `تم حذف المحتوى ${report.postId || report.commentId}` },
      });
      return NextResponse.json({ success: true, message: "تم حذف المحتوى" });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}