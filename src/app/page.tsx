import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatsCounter from "@/components/StatsCounter";
import OfficialPollCard from "@/components/OfficialPollCard";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, SITE_NAME_AR, SLOGAN, SHORT_DESC } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [postsCount, commentsCount, userPollsCount, officialPolls, recentPosts, trendingPosts, topPosts] = await Promise.all([
    prisma.post.count({ where: { status: "approved" } }),
    prisma.comment.count({ where: { status: "approved" } }),
    prisma.userPoll.count({ where: { status: "approved" } }),
    prisma.officialPoll.findMany({
      where: { isActive: true },
      include: { options: { orderBy: { order: "asc" } } },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.post.findMany({
      where: { status: "approved", isHiddenFromTrending: false },
      include: { category: true, _count: { select: { comments: true } } },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 10,
    }),
    prisma.post.findMany({
      where: { status: "approved", isHiddenFromTrending: false, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      include: { category: true, _count: { select: { comments: true } } },
      orderBy: { trendingScore: "desc" },
      take: 5,
    }),
    prisma.post.findMany({
      where: { status: "approved" },
      include: { category: true, _count: { select: { comments: true } } },
      orderBy: [{ upvotes: "desc" }],
      take: 5,
    }),
  ]);

  const totalOfficialVotes = officialPolls.reduce((sum, p) => sum + p.totalVotes, 0);

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-16">
          <div className="container-main text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{SLOGAN}</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">{SHORT_DESC}</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/posts/new" className="btn bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-3 text-base">
                اكتب رأيك
              </Link>
              <Link href="/polls" className="btn bg-blue-500 text-white hover:bg-blue-400 font-bold px-8 py-3 text-base">
                شارك في الاستفتاءات الرسمية
              </Link>
            </div>
          </div>
        </section>

        <section className="container-main -mt-8 relative z-10">
          <StatsCounter
            postsCount={postsCount}
            commentsCount={commentsCount}
            userPollsCount={userPollsCount}
            officialPollVotes={totalOfficialVotes}
          />
        </section>

        <section className="container-main py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {trendingPosts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">🔥 الرائج الآن</h2>
                    <Link href="/posts?sort=trending" className="text-sm text-blue-600 hover:text-blue-800 no-underline">
                      عرض الكل ←
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {trendingPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={{ ...post, commentCount: post._count.comments }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">أحدث المشاركات</h2>
                  <Link href="/posts" className="text-sm text-blue-600 hover:text-blue-800 no-underline">
                    عرض الكل ←
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={{ ...post, commentCount: post._count.comments }}
                    />
                  ))}
                  {recentPosts.length === 0 && (
                    <p className="text-center text-gray-400 py-8">لا توجد مشاركات بعد. كن أول من يكتب!</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">الاستفتاءات الرسمية</h2>
                <div className="space-y-4">
                  {officialPolls.map((poll) => (
                    <OfficialPollCard key={poll.id} poll={poll} />
                  ))}
                  {officialPolls.length === 0 && (
                    <p className="text-center text-gray-400 py-8">لا توجد استفتاءات حاليًا</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">الأكثر تفاعلًا</h2>
                <div className="space-y-3">
                  {topPosts.map((post, i) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block card hover:border-blue-200 no-underline"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-blue-600 min-w-[32px] text-center">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</div>
                          <div className="text-xs text-gray-400">
                            {post._count.comments} تعليق · {post.upvotes - post.downvotes} صوت
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-100 py-12">
          <div className="container-main text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">صوتك جزء من الحل</h2>
            <p className="text-gray-600 max-w-xl mx-auto mb-6">
              كل مشاركة وكل تصويت هو خطوة نحو فهم أعمق لمشاكل الإنترنت في مصر. شارك برأيك بدون تسجيل ولا بيانات شخصية.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap text-sm text-gray-500">
              <span>بدون تسجيل</span>
              <span>•</span>
              <span>بدون صور</span>
              <span>•</span>
              <span>بدون سياسة</span>
              <span>•</span>
              <span>بدون بيانات شخصية</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}