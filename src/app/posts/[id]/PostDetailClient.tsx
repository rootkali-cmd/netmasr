"use client";

import { useState } from "react";
import Link from "next/link";
import CommentThread from "@/components/CommentThread";
import ReportButton from "@/components/ReportButton";
import ShareButton from "@/components/ShareButton";
import ReactionButton from "@/components/ReactionButton";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface CommentType {
  id: string;
  content: string;
  anonymousId: string;
  tripcode: string | null;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  parentId: string | null;
  replies: CommentType[];
}

interface PostDetail {
  id: string;
  title: string;
  content: string;
  anonymousId: string;
  tripcode: string | null;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  isOfficial: boolean;
  isClosed: boolean;
  isPinned: boolean;
  officialBadge: string | null;
  createdAt: Date;
  category: { name: string; slug: string };
  comments: CommentType[];
}

interface PostDetailClientProps {
  post: PostDetail;
}

export default function PostDetailClient({ post }: PostDetailClientProps) {
  const [comments, setComments] = useState<CommentType[]>(post.comments);
  const [voteStatus, setVoteStatus] = useState<"none" | "up" | "down">("none");
  const [votes, setVotes] = useState({ up: post.upvotes, down: post.downvotes });

  async function handleVote(type: "up" | "down") {
    if (voteStatus === type) return;
    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: type }),
      });
      if (res.ok) {
        if (voteStatus === "none") {
          if (type === "up") setVotes((v) => ({ ...v, up: v.up + 1 }));
          else setVotes((v) => ({ ...v, down: v.down + 1 }));
        } else if (voteStatus === "up" && type === "down") {
          setVotes((v) => ({ ...v, up: v.up - 1, down: v.down + 1 }));
        } else if (voteStatus === "down" && type === "up") {
          setVotes((v) => ({ ...v, up: v.up + 1, down: v.down - 1 }));
        }
        setVoteStatus(type);
      } else {
        const data = await res.json();
        toast.error(data.error || "حدث خطأ");
      }
    } catch {
      toast.error("حدث خطأ");
    }
  }

  async function handleReply(parentId: string | null, content: string, tripcode: string) {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, parentId, content, tripcode }),
      });
      const data = await res.json();
      if (res.ok) {
        if (parentId) {
          const addReply = (cmts: CommentType[]): CommentType[] =>
            cmts.map((c) => {
              if (c.id === parentId) {
                return { ...c, replies: [...(c.replies || []), data.comment] };
              }
              if (c.replies) return { ...c, replies: addReply(c.replies) };
              return c;
            });
          setComments(addReply(comments));
        } else {
          setComments([...comments, data.comment]);
        }
        toast.success("تم نشر التعليق");
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch {
      toast.error("حدث خطأ");
    }
  }

  function scrollToComments() {
    const el = document.getElementById("comments-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="container-main py-8">
      <div className="max-w-3xl mx-auto">
        <div className="card mb-6">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Link href={`/posts?category=${post.category.slug}`} className="text-xs text-blue-600 hover:text-blue-800 no-underline">
              {post.category.name}
            </Link>
            {post.isPinned && <span className="badge badge-yellow">مثبت</span>}
            {post.isClosed && <span className="badge badge-red">مغلق</span>}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-900">مجهول #{post.anonymousId}</span>
            {post.tripcode && <span className="tripcode-text">!{post.tripcode}</span>}
            <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
            {post.content}
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap border-t border-gray-100 pt-3">
            <ReactionButton
              score={votes.up - votes.down}
              voteStatus={voteStatus}
              onVote={handleVote}
            />

            <button
              onClick={() => handleVote("down")}
              className={`flex items-center gap-1.5 rounded-lg transition-colors px-3 py-1.5 text-sm ${
                voteStatus === "down" ? "bg-red-50 text-red-600" : "text-gray-500 hover:text-red-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill={voteStatus === "down" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </button>

            <button
              onClick={scrollToComments}
              className="flex items-center gap-1.5 rounded-lg transition-colors px-3 py-1.5 text-sm text-gray-500 hover:text-blue-600 hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-semibold">{comments.length}</span>
            </button>

            <ShareButton postId={post.id} />

            <span className="px-1 text-gray-300 select-none">|</span>

            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.viewCount}
            </span>

            <ReportButton postId={post.id} />
          </div>
        </div>

        <div className="card" id="comments-section">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            التعليقات ({comments.length})
          </h2>
          <CommentThread
            comments={comments}
            postId={post.id}
            isClosed={post.isClosed}
            onReply={handleReply}
          />
        </div>
      </div>
    </main>
  );
}