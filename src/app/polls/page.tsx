import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OfficialPollCard from "@/components/OfficialPollCard";
import VerifiedBadge from "@/components/VerifiedBadge";
import { prisma } from "@/lib/prisma";
import PollsClient from "./PollsClient";

export const dynamic = "force-dynamic";

export default async function PollsPage() {
  const officialPolls = await prisma.officialPoll.findMany({
    where: { isActive: true },
    include: { options: { orderBy: { order: "asc" } } },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  const userPolls = await prisma.userPoll.findMany({
    where: { status: "approved" },
    include: {
      options: { orderBy: { order: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const totalVotes = officialPolls.reduce((sum, p) => sum + p.totalVotes, 0);

  return (
    <>
      <Header />
      <main className="container-main py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الاستفتاءات</h1>
            <p className="text-sm text-gray-500 mt-1">إجمالي الأصوات على الاستفتاءات الرسمية: {totalVotes.toLocaleString("ar-EG")}</p>
          </div>
          <Link href="/polls/new" className="btn btn-primary">
            + إنشاء تصويت
          </Link>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <VerifiedBadge showLabel={false} size="md" />
          <span>استفتاءات رسمية</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {officialPolls.map((poll) => (
            <OfficialPollCard key={poll.id} poll={poll} />
          ))}
          {officialPolls.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              لا توجد استفتاءات رسمية حاليًا
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">تصويتات المستخدمين</h2>
        <PollsClient initialPolls={JSON.parse(JSON.stringify(userPolls))} />
      </main>
      <Footer />
    </>
  );
}
