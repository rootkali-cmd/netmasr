"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.length < 10) {
      toast.error("الرسالة يجب أن تكون 10 أحرف على الأقل");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        toast.success("تم إرسال رسالتك بنجاح");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        const data = await res.json();
        toast.error(data.error || "حدث خطأ");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
    }
    setSubmitting(false);
  }

  return (
    <>
      <Header />
      <main className="container-main py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تواصل معنا</h1>
          <p className="text-gray-500 mb-6">
            للإبلاغ عن مشكلة أو اقتراح تحسين، يمكنك استخدام النموذج أدناه أو مراسلتنا على:
            <br />
            <span className="text-blue-600 font-mono">contact@netmasr.org</span>
          </p>

          <form onSubmit={handleSubmit} className="card space-y-5">
            <div>
              <label className="label">الاسم (اختياري)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="اسمك..."
                maxLength={100}
              />
            </div>

            <div>
              <label className="label">البريد الإلكتروني (اختياري)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="بريدك الإلكتروني للرد..."
              />
            </div>

            <div>
              <label className="label">الرسالة</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field"
                placeholder="اكتب رسالتك..."
                rows={6}
                maxLength={2000}
                required
              />
              <div className="text-xs text-gray-400 mt-1">{message.length}/2000</div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary w-full">
              {submitting ? "..." : "إرسال"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
