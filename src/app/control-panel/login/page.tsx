"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [twoFARequired, setTwoFARequired] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  async function handleLogin(e: React.FormEvent) {
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
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.require2FA) {
          setSessionToken(data.sessionToken);
          setTwoFARequired(true);
        } else {
          toast.success("تم تسجيل الدخول");
          router.push("/control-panel/dashboard");
        }
      } else {
        toast.error(data.error || "خطأ في تسجيل الدخول");
      }
    } catch {
      toast.error("حدث خطأ");
    }
    setLoading(false);
  }

  async function handle2FA(e: React.FormEvent) {
    e.preventDefault();
    if (twoFAToken.length !== 6) {
      toast.error("الرمز يجب أن يكون 6 أرقام");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: twoFAToken, sessionToken }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("تم التحقق");
        router.push("/control-panel/dashboard");
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

        {!twoFARequired ? (
          <form onSubmit={handleLogin} className="space-y-4">
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
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "..." : "تسجيل الدخول"}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FA} className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              الرجاء إدخال رمز التحقق الثنائي
            </div>
            <div>
              <label className="label">رمز 2FA</label>
              <input
                type="text"
                value={twoFAToken}
                onChange={(e) => setTwoFAToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="input-field text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading || twoFAToken.length !== 6} className="btn btn-primary w-full">
              {loading ? "..." : "تحقق"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
