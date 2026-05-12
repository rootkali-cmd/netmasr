import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashIP, generateVoterId } from "@/lib/utils";
import { checkRateLimit, RATE_LIMITS, RATE_LIMIT_RESPONSE } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const ua = headersList.get("user-agent") || "unknown";
  const ipHash = hashIP(ip);
  const voterId = generateVoterId(ipHash, ua);

  const rateKey = `vote:${ipHash}`;
  if (!checkRateLimit(rateKey, RATE_LIMITS.vote)) {
    return NextResponse.json(RATE_LIMIT_RESPONSE, { status: 429 });
  }

  try {
    const body = await req.json();
    const { voteType } = body;

    if (!["up", "down"].includes(voteType)) {
      return NextResponse.json({ error: "نوع التصويت غير صالح" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "الموضوع غير موجود" }, { status: 404 });
    }

    const existingVote = await prisma.postVote.findUnique({
      where: { postId_voterId: { postId: id, voterId } },
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await prisma.$transaction([
          prisma.postVote.delete({ where: { id: existingVote.id } }),
          prisma.post.update({
            where: { id },
            data: {
              ...(voteType === "up" ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } }),
            },
          }),
        ]);
        return NextResponse.json({ success: true, removed: true });
      }

      await prisma.$transaction([
        prisma.postVote.update({
          where: { id: existingVote.id },
          data: { voteType },
        }),
        prisma.post.update({
          where: { id },
          data: {
            ...(voteType === "up"
              ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
              : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } }),
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.postVote.create({
          data: { postId: id, voteType, ipHash, voterId },
        }),
        prisma.post.update({
          where: { id },
          data: {
            ...(voteType === "up" ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } }),
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}
