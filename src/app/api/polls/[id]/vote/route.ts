import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashIP, generateVoterId } from "@/lib/utils";
import { checkRateLimit, RATE_LIMITS, RATE_LIMIT_RESPONSE } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: pollId } = await params;
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
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json({ error: "يجب اختيار خيار" }, { status: 400 });
    }

    const poll = await prisma.userPoll.findUnique({ where: { id: pollId } });
    if (!poll) {
      return NextResponse.json({ error: "التصويت غير موجود" }, { status: 404 });
    }

    const option = await prisma.userPollOption.findFirst({
      where: { id: optionId, pollId },
    });
    if (!option) {
      return NextResponse.json({ error: "الخيار غير موجود" }, { status: 400 });
    }

    const existingVote = await prisma.userPollVote.findUnique({
      where: { pollId_voterId: { pollId, voterId } },
    });

    if (existingVote) {
      return NextResponse.json({ error: "لقد صوت بالفعل" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.userPollVote.create({
        data: { pollId, optionId, ipHash, voterId },
      }),
      prisma.userPollOption.update({
        where: { id: optionId },
        data: { votes: { increment: 1 } },
      }),
      prisma.userPoll.update({
        where: { id: pollId },
        data: { totalVotes: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}
