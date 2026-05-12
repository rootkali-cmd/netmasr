import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { comments: true, reports: true } },
    },
    take: 100,
  });

  return NextResponse.json({ posts });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, action, value } = body;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const validActions = ["approve", "reject", "pin", "unpin", "close", "open", "delete"];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    switch (action) {
      case "approve":
        await prisma.post.update({ where: { id }, data: { status: "approved" } });
        break;
      case "reject":
        await prisma.post.update({ where: { id }, data: { status: "rejected" } });
        break;
      case "pin":
        await prisma.post.update({ where: { id }, data: { isPinned: true } });
        break;
      case "unpin":
        await prisma.post.update({ where: { id }, data: { isPinned: false } });
        break;
      case "close":
        await prisma.post.update({ where: { id }, data: { isClosed: true } });
        break;
      case "open":
        await prisma.post.update({ where: { id }, data: { isClosed: false } });
        break;
      case "delete":
        await prisma.post.delete({ where: { id } });
        break;
    }

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: `post_${action}`,
        details: `Post ${id}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
