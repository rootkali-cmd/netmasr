import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { moderateContent } from "@/lib/moderation";
import { createPostSchema } from "@/lib/validation";
import { generateAnonymousId, generateTripcode, hashIP } from "@/lib/utils";
import { checkRateLimit, RATE_LIMITS, RATE_LIMIT_RESPONSE } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { verifyTurnstile } from "@/lib/captcha";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "latest";

  const where: Record<string, unknown> = { status: "approved" };
  if (category) {
    where.category = { slug: category };
  }

  const orderBy: Record<string, string>[] =
    sort === "top"
      ? [{ upvotes: "desc" }]
      : [{ isPinned: "desc" }, { createdAt: "desc" }];

  const posts = await prisma.post.findMany({
    where,
    include: {
      category: true,
      _count: { select: { comments: true } },
    },
    orderBy,
    take: 50,
  });

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const ipHash = hashIP(ip);

  const rateKey = `post:${ipHash}`;
  if (!checkRateLimit(rateKey, RATE_LIMITS.post)) {
    return NextResponse.json(RATE_LIMIT_RESPONSE, { status: 429 });
  }

  try {
    const body = await req.json();
    const { hcaptchaToken, ...data } = body;
    const parsed = createPostSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    if (!(await verifyTurnstile(hcaptchaToken || ""))) {
      return NextResponse.json({ error: "فشل التحقق الأمني. حاول مرة أخرى." }, { status: 400 });
    }

    const { title, content, categorySlug, tripcode } = parsed.data;

    const category = await prisma.category.findFirst({
      where: { slug: categorySlug, isActive: true },
    });
    if (!category) {
      return NextResponse.json({ error: "التصنيف غير موجود أو غير متاح." }, { status: 400 });
    }

    const moderationResult = await moderateContent(title + " " + content);
    if (moderationResult.status === "rejected") {
      return NextResponse.json({ error: moderationResult.reason || "تم رفض المحتوى لأنه يخالف قواعد NetMasr.org" }, { status: 400 });
    }

    const anonymousId = generateAnonymousId();
    const tripcodeHash = tripcode ? generateTripcode(tripcode) : null;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        categoryId: category.id,
        anonymousId,
        tripcode: tripcodeHash,
        status: moderationResult.status,
        ipHash,
      },
    });

    return NextResponse.json({ id: post.id, status: post.status });
  } catch {
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}
