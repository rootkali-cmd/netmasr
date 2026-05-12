"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface ShareButtonProps {
  postId: string;
}

export default function ShareButton({ postId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/posts/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("تم نسخ الرابط");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("فشل نسخ الرابط");
    }
  }

  return (
    <button
      onClick={handleShare}
      className="text-xs text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
      title="نسخ رابط المشاركة"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      {copied ? "تم النسخ ✓" : "نسخ الرابط"}
    </button>
  );
}