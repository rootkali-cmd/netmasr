"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate, truncate } from "@/lib/utils";
import VerifiedBadge from "./VerifiedBadge";
import ShareButton from "./ShareButton";
import ReactionButton from "./ReactionButton";
import toast from "react-hot-toast";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    anonymousId: string;
    tripcode: string | null;
    upvotes: number;
    downvotes: number;
    commentCount: number;
    createdAt: Date;
    isOfficial: boolean;
    isPinned: boolean;
    category: { name: string; slug: string };
  };
}

export default function PostCard({ post }: PostCardProps) {
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

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 min-w-[48px]">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
            {post.anonymousId.slice(-2)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-gray-900">
              مجهول #{post.anonymousId}
            </span>
            {post.tripcode && (
              <span className="tripcode-text">!{post.tripcode}</span>
            )}
            {post.isOfficial && <VerifiedBadge />}
            {post.isPinned && (
              <span className="badge badge-yellow">مثبت</span>
            )}
          </div>

          <Link href={`/posts/${post.id}`} className="no-underline">
            <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
          </Link>

          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {truncate(post.content, 200)}
          </p>

          <div className="flex items-center gap-1.5 md:gap-2 text-xs text-gray-400 mb-3 flex-wrap">
            <span>{formatDate(post.createdAt)}</span>
            <span className="hidden xs:inline">·</span>
            <Link
              href={`/posts?category=${post.category.slug}`}
              className="text-gray-400 hover:text-blue-600 no-underline"
            >
              {post.category.name}
            </Link>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap border-t border-gray-100 pt-2">
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

            <Link
              href={`/posts/${post.id}`}
              className="flex items-center gap-1.5 rounded-lg transition-colors px-3 py-1.5 text-sm text-gray-500 hover:text-blue-600 hover:bg-gray-50 no-underline"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-semibold">{post.commentCount}</span>
            </Link>

            <ShareButton postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}