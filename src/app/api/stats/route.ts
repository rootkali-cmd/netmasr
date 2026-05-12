import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [postsCount, commentsCount, userPollsCount, officialPolls] = await Promise.all([
    prisma.post.count({ where: { status: "approved" } }),
    prisma.comment.count({ where: { status: "approved" } }),
    prisma.userPoll.count({ where: { status: "approved" } }),
    prisma.officialPoll.findMany({ where: { isActive: true }, select: { totalVotes: true } }),
  ]);

  const totalOfficialVotes = officialPolls.reduce((sum, p) => sum + p.totalVotes, 0);

  return NextResponse.json({
    postsCount,
    commentsCount,
    userPollsCount,
    officialPollVotes: totalOfficialVotes,
  });
}
