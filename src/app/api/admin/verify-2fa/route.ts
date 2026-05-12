import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify2FASchema } from "@/lib/validation";
import { getPending2FA, deletePending2FA } from "@/lib/pending-2fa";
import speakeasy from "speakeasy";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verify2FASchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { token, sessionToken } = parsed.data;

    const pending = getPending2FA(sessionToken);
    if (!pending) {
      return NextResponse.json({ error: "جلسة التحقق منتهية أو غير صالحة. الرجاء تسجيل الدخول مرة أخرى." }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({ where: { id: pending.adminId } });
    if (!admin || !admin.totpSecret) {
      deletePending2FA(sessionToken);
      return NextResponse.json({ error: "لم يتم إعداد المصادقة الثنائية. الرجاء تسجيل الدخول مرة أخرى." }, { status: 401 });
    }

    const verified = speakeasy.totp.verify({
      secret: admin.totpSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return NextResponse.json({ error: "رمز التحقق غير صالح. حاول مرة أخرى." }, { status: 401 });
    }

    deletePending2FA(sessionToken);

    const authToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.adminSession.create({
      data: { adminId: admin.id, token: authToken, expiresAt },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}