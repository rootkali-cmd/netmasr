import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { moderateContent } from "@/lib/moderation";
import { createCommentSchema } from "@/lib/validation";
import { generateAnonymousId, generateTripcode, hashIP } from "@/lib/utils";
import { checkRateLimit, RATE_LIMITS, RATE_LIMIT_RESPONSE } from "@/lib/rate-limit";
import { headers } from "next/headers";

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
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { content, postId, parentId, tripcode } = parsed.data;

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
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}
