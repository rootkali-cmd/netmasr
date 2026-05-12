import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { createOfficialPollSchema } from "@/lib/validation";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const polls = await prisma.officialPoll.findMany({
    include: { options: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ polls });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createOfficialPollSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { title, description, options, isPinned } = parsed.data;

    const poll = await prisma.officialPoll.create({
      data: {
        title,
        description: description || null,
        isPinned,
        options: {
          create: options.map((text, i) => ({ text, order: i })),
        },
      },
      include: { options: true },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: "create_official_poll",
        details: `Official poll: ${title}`,
      },
    });

    return NextResponse.json(poll);
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, action } = body;

    switch (action) {
      case "toggle_pin":
        const poll = await prisma.officialPoll.findUnique({ where: { id } });
        if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });
        await prisma.officialPoll.update({ where: { id }, data: { isPinned: !poll.isPinned } });
        break;
      case "toggle_active":
        const poll2 = await prisma.officialPoll.findUnique({ where: { id } });
        if (!poll2) return NextResponse.json({ error: "Not found" }, { status: 404 });
        await prisma.officialPoll.update({ where: { id }, data: { isActive: !poll2.isActive } });
        break;
      case "delete":
        await prisma.officialPoll.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: `official_poll_${action}`,
        details: `Poll ${id}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
