import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PostsPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const sort = params.sort || "latest";

  const where: Record<string, unknown> = { status: "approved" };
  if (categorySlug) {
    const cat = CATEGORIES.find((c) => c.slug === categorySlug);
    if (cat) {
      where.category = { slug: categorySlug };
    }
  }

  const orderBy: Record<string, string>[] =
    sort === "top" ? [{ upvotes: "desc" as const }] : [{ isPinned: "desc" as const }, { createdAt: "desc" as const }];

  const posts = await prisma.post.findMany({
    where,
    include: {
      category: true,
      _count: { select: { comments: true } },
    },
    orderBy,
    take: 50,
  });

  return (
    <>
      <Header />
      <main className="container-main py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">المشاركات</h1>
          <Link href="/posts/new" className="btn btn-primary">
            + موضوع جديد
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Link
            href="/posts"
            className={`px-3 py-1.5 text-sm rounded-full no-underline transition-colors ${
              !categorySlug ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            الكل
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/posts?category=${cat.slug}`}
              className={`px-3 py-1.5 text-sm rounded-full no-underline transition-colors ${
                categorySlug === cat.slug ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">ترتيب:</span>
          <Link
            href={`/posts${categorySlug ? `?category=${categorySlug}&` : "?"}sort=latest`}
            className={`px-2 py-1 text-xs rounded no-underline ${
              sort === "latest" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-blue-600"
            }`}
          >
            الأحدث
          </Link>
          <Link
            href={`/posts${categorySlug ? `?category=${categorySlug}&` : "?"}sort=top`}
            className={`px-2 py-1 text-xs rounded no-underline ${
              sort === "top" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-blue-600"
            }`}
          >
            الأكثر تفاعلًا
          </Link>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                commentCount: post._count.comments,
              }}
            />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500 mb-4">لا توجد مشاركات في هذا القسم</p>
              <Link href="/posts/new" className="btn btn-primary">
                اكتب أول مشاركة
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
