import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validation";
import { checkRateLimit, RATE_LIMITS, RATE_LIMIT_RESPONSE } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { verifyTurnstile } from "@/lib/captcha";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const ipHash = ip.slice(0, 32);

  const rateKey = `report:${ipHash}`;
  if (!checkRateLimit(rateKey, RATE_LIMITS.report)) {
    return NextResponse.json(RATE_LIMIT_RESPONSE, { status: 429 });
  }

  try {
    const body = await req.json();
    const { hcaptchaToken, ...data } = body;
    const parsed = reportSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    if (!(await verifyTurnstile(hcaptchaToken || ""))) {
      return NextResponse.json({ error: "فشل التحقق الأمني. حاول مرة أخرى." }, { status: 400 });
    }

    const { postId, commentId, reason } = parsed.data;

    if (!postId && !commentId) {
      return NextResponse.json({ error: "يجب تحديد المحتوى المبلغ عنه" }, { status: 400 });
    }

    await prisma.report.create({
      data: {
        postId: postId || null,
        commentId: commentId || null,
        reason,
        reporterIp: ipHash,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
