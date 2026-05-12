import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { id: true, title: true } },
      _count: { select: { reports: true } },
    },
    take: 100,
  });

  return NextResponse.json({ comments });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, action } = body;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    switch (action) {
      case "approve":
        await prisma.comment.update({ where: { id }, data: { status: "approved" } });
        break;
      case "reject":
        await prisma.comment.update({ where: { id }, data: { status: "rejected" } });
        break;
      case "delete":
        await prisma.comment.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: `comment_${action}`,
        details: `Comment ${id}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
