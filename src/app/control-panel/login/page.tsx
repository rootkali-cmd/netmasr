"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import TurnstileWidget from "@/components/TurnstileWidget";
import { ADMIN_PANEL_PATH } from "@/lib/admin-url";

type Step = "credentials" | "totp";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      toast.error("الرجاء إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captchaToken }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.require2FA) {
          setSessionToken(data.sessionToken);
          setStep("totp");
          toast.success("الرجاء إدخال رمز التحقق الثنائي");
        } else {
          toast.success("تم تسجيل الدخول");
          router.push(`/${ADMIN_PANEL_PATH}/dashboard`);
        }
      } else {
        toast.error(data.error || "بيانات الدخول غير صحيحة.");
        setCaptchaToken("");
      }
    } catch {
      toast.error("حدث خطأ");
    }
    setLoading(false);
  }

  async function handleTotp(e: React.FormEvent) {
    e.preventDefault();
    if (!totpToken || totpToken.length !== 6) {
      toast.error("الرمز يجب أن يكون 6 أرقام");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: totpToken, sessionToken }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("تم التحقق");
        router.push(`/${ADMIN_PANEL_PATH}/dashboard`);
      } else {
        toast.error(data.error || "رمز غير صالح");
      }
    } catch {
      toast.error("حدث خطأ");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-extrabold">ن</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h1>
          <p className="text-sm text-gray-500 mt-1">NetMasr.org Control Panel</p>
        </div>

        {step === "credentials" ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label className="label">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="admin"
                autoFocus
              />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <TurnstileWidget onVerify={(token) => setCaptchaToken(token)} />
            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="btn btn-primary w-full"
            >
              {loading ? "..." : "تسجيل الدخول"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTotp} className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              الرجاء إدخال رمز التحقق الثنائي
            </div>
            <div>
              <label className="label">رمز 2FA</label>
              <input
                type="text"
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="input-field text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading || totpToken.length !== 6} className="btn btn-primary w-full">
              {loading ? "..." : "تحقق"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
