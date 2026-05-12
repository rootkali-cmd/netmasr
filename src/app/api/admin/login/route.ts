import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/hash";
import { checkRateLimit, RATE_LIMITS, RATE_LIMIT_RESPONSE } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { setPending2FA } from "@/lib/pending-2fa";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  const rateKey = `admin-login:${ip}`;
  if (!checkRateLimit(rateKey, RATE_LIMITS.adminLogin)) {
    return NextResponse.json(RATE_LIMIT_RESPONSE, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { username, password } = parsed.data;

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    await prisma.auditLog.create({
      data: { adminId: admin.id, action: "login", ip },
    });

    if (admin.totpEnabled) {
      const sessionToken = crypto.randomBytes(32).toString("hex");
      setPending2FA(sessionToken, admin.id);
      return NextResponse.json({ require2FA: true, sessionToken });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.adminSession.create({
      data: { adminId: admin.id, token, expiresAt },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
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