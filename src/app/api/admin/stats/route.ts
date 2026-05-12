import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalPosts, pendingPosts, totalComments, totalPolls, totalReports, totalOfficialPolls, totalOfficialVotes, recentAuditLogs] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "pending" } }),
    prisma.comment.count(),
    prisma.userPoll.count(),
    prisma.report.count({ where: { isResolved: false } }),
    prisma.officialPoll.count(),
    prisma.officialPoll.aggregate({ _sum: { totalVotes: true } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({
    totalPosts,
    pendingPosts,
    totalComments,
    totalPolls,
    totalReports,
    totalOfficialPolls,
    totalOfficialVotes: totalOfficialVotes._sum.totalVotes || 0,
    recentAuditLogs,
  });
}
