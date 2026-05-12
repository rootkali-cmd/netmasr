import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { verifyPassword } from "@/lib/hash";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "كلمة المرور مطلوبة لتأكيد إلغاء المصادقة الثنائية" }, { status: 400 });
    }

    const valid = await verifyPassword(password, session.admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }

    await prisma.admin.update({
      where: { id: session.admin.id },
      data: { totpSecret: null, totpEnabled: false },
    });

    await prisma.auditLog.create({
      data: { adminId: session.admin.id, action: "disable_2fa", details: "تم إلغاء المصادقة الثنائية" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}