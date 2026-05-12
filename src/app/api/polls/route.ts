import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserPollSchema } from "@/lib/validation";
import { moderateContent } from "@/lib/moderation";
import { generateAnonymousId, generateTripcode, hashIP } from "@/lib/utils";
import { checkRateLimit, RATE_LIMITS, RATE_LIMIT_RESPONSE } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { verifyTurnstile } from "@/lib/captcha";

export async function GET() {
  const polls = await prisma.userPoll.findMany({
    where: { status: "approved" },
    include: {
      options: { orderBy: { order: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ polls });
}

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const ipHash = hashIP(ip);

  const rateKey = `poll:${ipHash}`;
  if (!checkRateLimit(rateKey, { windowMs: 10 * 60 * 1000, maxRequests: 2 })) {
    return NextResponse.json(RATE_LIMIT_RESPONSE, { status: 429 });
  }

  try {
    const body = await req.json();
    const { hcaptchaToken, ...data } = body;
    const parsed = createUserPollSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    if (!(await verifyTurnstile(hcaptchaToken || ""))) {
      return NextResponse.json({ error: "فشل التحقق الأمني. حاول مرة أخرى." }, { status: 400 });
    }

    const { question, description, options, categorySlug, tripcode } = parsed.data;

    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 400 });
    }

    const moderationResult = await moderateContent(question + " " + (description || ""));
    if (moderationResult.status === "rejected") {
      return NextResponse.json({ error: "تم رفض المحتوى لأنه يخالف القواعد" }, { status: 400 });
    }

    const anonymousId = generateAnonymousId();
    const tripcodeHash = tripcode ? generateTripcode(tripcode) : null;

    const poll = await prisma.userPoll.create({
      data: {
        question,
        description: description || null,
        categoryId: category.id,
        anonymousId,
        tripcode: tripcodeHash,
        status: moderationResult.status,
        ipHash,
        options: {
          create: options.map((text, i) => ({ text, order: i })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json({ id: poll.id });
  } catch {
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}
