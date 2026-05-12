import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { normalizeForModeration } from "@/lib/normalize";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const words = await prisma.bannedWord.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ words });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { term, category, action, matchType, severity } = body;

    if (!term || term.trim().length < 1) {
      return NextResponse.json({ error: "الكلمة مطلوبة" }, { status: 400 });
    }

    const normalized = normalizeForModeration(term);
    if (!normalized) {
      return NextResponse.json({ error: "الكلمة غير صالحة بعد التنظيف" }, { status: 400 });
    }

    const existing = await prisma.bannedWord.findUnique({ where: { term: term.trim().toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "الكلمة موجودة بالفعل" }, { status: 400 });
    }

    const word = await prisma.bannedWord.create({
      data: {
        term: term.trim().toLowerCase(),
        normalizedTerm: normalized,
        category: category || "OTHER",
        action: action || "REVIEW",
        matchType: matchType || "CONTAINS",
        severity: severity || "MEDIUM",
      },
    });

    return NextResponse.json({ word });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, term, category, action, matchType, severity, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (term !== undefined) {
      updateData.term = term.trim().toLowerCase();
      updateData.normalizedTerm = normalizeForModeration(term);
    }
    if (category !== undefined) updateData.category = category;
    if (action !== undefined) updateData.action = action;
    if (matchType !== undefined) updateData.matchType = matchType;
    if (severity !== undefined) updateData.severity = severity;
    if (isActive !== undefined) updateData.isActive = isActive;

    const word = await prisma.bannedWord.update({ where: { id }, data: updateData });
    return NextResponse.json({ word });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    await prisma.bannedWord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}