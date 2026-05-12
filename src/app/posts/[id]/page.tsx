import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostDetailClient from "./PostDetailClient";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
      comments: {
        include: { replies: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post || post.status === "rejected") {
    notFound();
  }

  await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <>
      <Header />
      <PostDetailClient post={JSON.parse(JSON.stringify(post))} />
      <Footer />
    </>
  );
}
