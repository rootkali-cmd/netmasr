import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { hashPassword, verifyPassword } from "@/lib/hash";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    username: session.admin.username,
    role: session.admin.role,
    totpEnabled: session.admin.totpEnabled,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { currentPassword, newUsername, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json({ error: "كلمة المرور الحالية مطلوبة" }, { status: 400 });
    }

    const valid = await verifyPassword(currentPassword, session.admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 401 });
    }

    const updateData: Record<string, unknown> = {};

    if (newUsername) {
      if (newUsername.length < 3) {
        return NextResponse.json({ error: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" }, { status: 400 });
      }
      const existing = await prisma.admin.findUnique({ where: { username: newUsername } });
      if (existing && existing.id !== session.admin.id) {
        return NextResponse.json({ error: "اسم المستخدم موجود بالفعل" }, { status: 400 });
      }
      updateData.username = newUsername;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "لا توجد تغييرات" }, { status: 400 });
    }

    const updated = await prisma.admin.update({
      where: { id: session.admin.id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: { adminId: session.admin.id, action: "update_credentials", details: "تم تغيير بيانات تسجيل الدخول" },
    });

    return NextResponse.json({
      success: true,
      username: updated.username,
      message: "تم تحديث البيانات بنجاح",
    });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}