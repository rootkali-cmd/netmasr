"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import ReportButton from "./ReportButton";
import { useBannedWords } from "@/hooks/useBannedWords";
import toast from "react-hot-toast";

interface Comment {
  id: string;
  content: string;
  anonymousId: string;
  tripcode: string | null;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  parentId: string | null;
  replies: Comment[];
}

interface CommentThreadProps {
  comments: Comment[];
  postId: string;
  isClosed: boolean;
  onReply: (parentId: string | null, content: string, tripcode: string) => Promise<void>;
}

function SingleComment({ comment, postId, isClosed, onReply, depth = 0 }: {
  comment: Comment;
  postId: string;
  isClosed: boolean;
  onReply: (parentId: string | null, content: string, tripcode: string) => Promise<void>;
  depth: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyTripcode, setReplyTripcode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { highlight, hasBanned } = useBannedWords();

  const replyBanned = hasBanned(replyContent);

  async function handleReply() {
    if (!replyContent.trim()) return;
    if (replyBanned) {
      toast.error("يحتوي النص على كلمات ممنوعة. الرجاء إزالتها قبل النشر.");
      return;
    }
    setSubmitting(true);
    await onReply(comment.id, replyContent, replyTripcode);
    setReplyContent("");
    setShowReply(false);
    setSubmitting(false);
  }

  return (
    <div className={`${depth > 0 ? "mr-6 pr-4 border-r-2 border-gray-100" : ""}`}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">
            مجهول #{comment.anonymousId}
          </span>
          {comment.tripcode && (
            <span className="tripcode-text">!{comment.tripcode}</span>
          )}
          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
          <span className="text-xs text-gray-300">#{comment.id.slice(-4)}</span>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {comment.content.split(/(>>\d+)/g).map((part, i) => {
            if (part.startsWith(">>")) {
              return (
                <a key={i} href={`#comment-${part.slice(2)}`} className="text-blue-600 hover:text-blue-800 no-underline">
                  {part}
                </a>
              );
            }
            return part;
          })}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-400">+{comment.upvotes - comment.downvotes}</span>
          {!isClosed && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              رد
            </button>
          )}
          <ReportButton commentId={comment.id} />
        </div>

        {showReply && (
          <div className="mt-3 mr-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="اكتب ردك..."
              className={`input-field text-sm ${replyBanned ? "border-red-500 ring-red-500/20" : ""}`}
              rows={3}
            />
            {replyContent && (
              <div className="mt-2 text-sm leading-relaxed" dir="auto">
                {highlight(replyContent)}
              </div>
            )}
            {replyBanned && (
              <p className="text-xs text-red-600 font-bold mt-1">يحتوي على كلمات ممنوعة</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={replyTripcode}
                onChange={(e) => setReplyTripcode(e.target.value)}
                placeholder="tripcode (اختياري)"
                className="input-field text-sm flex-1"
                maxLength={100}
              />
              <button onClick={handleReply} disabled={submitting || !replyContent.trim() || replyBanned} className="btn btn-primary btn-sm">
                {submitting ? "..." : "رد"}
              </button>
            </div>
          </div>
        )}
      </div>

      {comment.replies?.map((reply) => (
        <SingleComment
          key={reply.id}
          comment={reply}
          postId={postId}
          isClosed={isClosed}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function CommentThread({ comments, postId, isClosed, onReply }: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");
  const [tripcode, setTripcode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { highlight, hasBanned } = useBannedWords();

  const commentBanned = hasBanned(newComment);
  const topLevelComments = comments.filter((c) => !c.parentId);

  async function handleNewComment() {
    if (!newComment.trim()) return;
    if (commentBanned) {
      toast.error("يحتوي النص على كلمات ممنوعة. الرجاء إزالتها قبل النشر.");
      return;
    }
    setSubmitting(true);
    await onReply(null, newComment, tripcode);
    setNewComment("");
    setSubmitting(false);
  }

  return (
    <div>
      {!isClosed && (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقك..."
            className={`input-field ${commentBanned ? "border-red-500 ring-red-500/20" : ""}`}
            rows={4}
          />
          {newComment && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
              {highlight(newComment)}
            </div>
          )}
          {commentBanned && (
            <p className="text-xs text-red-600 font-bold mt-1">يحتوي على كلمات ممنوعة</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={tripcode}
              onChange={(e) => setTripcode(e.target.value)}
              placeholder="tripcode (اختياري)"
              className="input-field text-sm flex-1"
              maxLength={100}
            />
            <button onClick={handleNewComment} disabled={submitting || !newComment.trim() || commentBanned} className="btn btn-primary">
              {submitting ? "..." : "نشر تعليق"}
            </button>
          </div>
        </div>
      )}

      {isClosed && (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500 mb-6">
          هذا الموضوع مغلق للتعليقات.
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {topLevelComments.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">
            لا توجد تعليقات بعد. كن أول من يعلق!
          </p>
        )}
        {topLevelComments.map((comment) => (
          <SingleComment
            key={comment.id}
            comment={comment}
            postId={postId}
            isClosed={isClosed}
            onReply={onReply}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}