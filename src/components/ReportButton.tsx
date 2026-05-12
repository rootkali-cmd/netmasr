"use client";

import { useState } from "react";
import TurnstileWidget from "./TurnstileWidget";
import toast from "react-hot-toast";

interface ReportButtonProps {
  postId?: string;
  commentId?: string;
}

export default function ReportButton({ postId, commentId }: ReportButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);

  const captchaRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim() || reason.length < 10) {
      toast.error("الرجاء كتابة سبب الإبلاغ (10 أحرف على الأقل)");
      return;
    }
    if (captchaRequired && !captchaToken) {
      toast.error("يرجى إكمال التحقق الأمني");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, commentId, reason, hcaptchaToken: captchaToken }),
      });
      if (res.ok) {
        toast.success("تم الإبلاغ بنجاح");
        setShowForm(false);
        setReason("");
      } else {
        const data = await res.json();
        toast.error(data.error || "حدث خطأ");
        setCaptchaToken("");
        setCaptchaKey((k) => k + 1);
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
      setCaptchaToken("");
      setCaptchaKey((k) => k + 1);
    }
    setSubmitting(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-xs text-gray-400 hover:text-red-600 transition-colors"
      >
        إبلاغ
      </button>

      {showForm && (
        <div className="absolute left-0 top-6 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-72">
          <form onSubmit={handleSubmit}>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="سبب الإبلاغ..."
              className="input-field text-sm mb-2"
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-center mb-2">
              <TurnstileWidget key={captchaKey} onVerify={setCaptchaToken} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting || (captchaRequired && !captchaToken)} className="btn btn-danger btn-sm flex-1">
                {submitting ? "..." : "إرسال"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
