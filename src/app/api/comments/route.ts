import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { moderateContent } from "@/lib/moderation";
import { createCommentSchema } from "@/lib/validation";
import { generateAnonymousId, generateTripcode, hashIP } from "@/lib/utils";
import { checkRateLimit, RATE_LIMITS, RATE_LIMIT_RESPONSE } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { verifyTurnstile } from "@/lib/captcha";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const ipHash = hashIP(ip);

  const rateKey = `comment:${ipHash}`;
  if (!checkRateLimit(rateKey, RATE_LIMITS.comment)) {
    return NextResponse.json(RATE_LIMIT_RESPONSE, { status: 429 });
  }

  try {
    const body = await req.json();
    const normalized = {
      content: typeof body.content === "string" ? body.content.trim() : null,
      postId: typeof body.postId === "string" ? body.postId.trim() : null,
      parentId: typeof body.parentId === "string" ? body.parentId.trim() || undefined : undefined,
      tripcode: typeof body.tripcode === "string" ? body.tripcode.trim() || undefined : undefined,
      captchaToken: typeof body.captchaToken === "string" ? body.captchaToken.trim() || undefined : undefined,
    };

    const parsed = createCommentSchema.safeParse(normalized);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      if (firstError.path.includes("content")) {
        return NextResponse.json({ error: "التعليق لا يمكن أن يكون فارغًا." }, { status: 400 });
      }
      if (firstError.path.includes("postId")) {
        return NextResponse.json({ error: "تعذر نشر التعليق. حاول مرة أخرى." }, { status: 400 });
      }
      return NextResponse.json({ error: "تعذر نشر التعليق. حاول مرة أخرى." }, { status: 400 });
    }

    const { content, postId, parentId, tripcode, captchaToken } = parsed.data;

    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!captchaToken) {
        return NextResponse.json({ error: "فشل التحقق الأمني. حاول مرة أخرى." }, { status: 400 });
      }
      const turnstileValid = await verifyTurnstile(captchaToken, ip);
      if (!turnstileValid) {
        return NextResponse.json({ error: "فشل التحقق الأمني. حاول مرة أخرى." }, { status: 400 });
      }
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "الموضوع غير موجود" }, { status: 404 });
    }
    if (post.isClosed) {
      return NextResponse.json({ error: "الموضوع مغلق للتعليقات" }, { status: 400 });
    }

    const moderationResult = await moderateContent(content);
    if (moderationResult.status === "rejected") {
      return NextResponse.json({ error: moderationResult.reason || "تم رفض المحتوى" }, { status: 400 });
    }

    const anonymousId = generateAnonymousId();
    const tripcodeHash = tripcode ? generateTripcode(tripcode) : null;

    const comment = await prisma.comment.create({
      data: {
        postId,
        parentId: parentId || null,
        content,
        anonymousId,
        tripcode: tripcodeHash,
        status: moderationResult.status,
        ipHash,
      },
    });

    return NextResponse.json({
      comment: {
        ...comment,
        replies: [],
      },
    });
  } catch {
    return NextResponse.json({ error: "تعذر نشر التعليق. حاول مرة أخرى." }, { status: 500 });
  }
}
