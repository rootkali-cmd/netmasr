import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.admin.totpEnabled) {
    return NextResponse.json({ error: "المصادقة الثنائية مفعلة بالفعل" }, { status: 400 });
  }

  const secret = speakeasy.generateSecret({
    length: 20,
    name: `NetMasr.org:${session.admin.username}`,
    issuer: "NetMasr.org",
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url || "");

  return NextResponse.json({
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
    qrCode,
  });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { secret, token } = body;

    if (!secret || !token) {
      return NextResponse.json({ error: "البيانات مطلوبة" }, { status: 400 });
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return NextResponse.json({ error: "رمز التحقق غير صالح. تأكد من إدخال الرقم الصحيح من تطبيق المصادقة." }, { status: 400 });
    }

    await prisma.admin.update({
      where: { id: session.admin.id },
      data: { totpSecret: secret, totpEnabled: true },
    });

    await prisma.auditLog.create({
      data: { adminId: session.admin.id, action: "enable_2fa", details: "تم تفعيل المصادقة الثنائية" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}