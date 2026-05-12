"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";
import { ADMIN_PANEL_PATH } from "@/lib/admin-url";

interface AdminSession {
  admin: { username: string; role: string };
}

interface AdminInfo {
  username: string;
  role: string;
  totpEnabled: boolean;
}

export default function SettingsClient({ session }: { session: AdminSession }) {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFAQrCode, setTwoFAQrCode] = useState("");
  const [twoFAToken, setTwoFAToken] = useState("");
  const [disablePassword, setDisablePassword] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setAdminInfo(data);
        setNewUsername(data.username);
      })
      .catch(() => toast.error("فشل تحميل الإعدادات"))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpdateCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    if (!currentPassword) {
      toast.error("كلمة المرور الحالية مطلوبة");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = { currentPassword };
      if (newUsername && newUsername !== adminInfo?.username) body.newUsername = newUsername;
      if (newPassword) body.newPassword = newPassword;

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setAdminInfo((prev) => (prev ? { ...prev, username: data.username } : prev));
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch {
      toast.error("حدث خطأ");
    }
    setSaving(false);
  }

  async function handleSetup2FA() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/2fa/setup");
      const data = await res.json();
      if (res.ok) {
        setTwoFASecret(data.secret);
        setTwoFAQrCode(data.qrCode);
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch {
      toast.error("حدث خطأ");
    }
    setSaving(false);
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    if (twoFAToken.length !== 6) {
      toast.error("الرمز يجب أن يكون 6 أرقام");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: twoFASecret, token: twoFAToken }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("تم تفعيل المصادقة الثنائية بنجاح");
        setAdminInfo((prev) => (prev ? { ...prev, totpEnabled: true } : prev));
        setTwoFASecret("");
        setTwoFAQrCode("");
        setTwoFAToken("");
      } else {
        toast.error(data.error || "رمز غير صالح");
      }
    } catch {
      toast.error("حدث خطأ");
    }
    setSaving(false);
  }

  async function handleDisable2FA(e: React.FormEvent) {
    e.preventDefault();
    if (!disablePassword) {
      toast.error("كلمة المرور مطلوبة");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("تم إلغاء المصادقة الثنائية");
        setAdminInfo((prev) => (prev ? { ...prev, totpEnabled: false } : prev));
        setDisablePassword("");
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch {
      toast.error("حدث خطأ");
    }
    setSaving(false);
  }

  async function handleLogoutAll() {
    if (!confirm("هل أنت متأكد من تسجيل الخروج من كل الجلسات؟")) return;
    setSaving(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("تم تسجيل الخروج");
      window.location.href = `/${ADMIN_PANEL_PATH}/login`;
    } catch {
      toast.error("حدث خطأ");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <AdminLayout session={session}>
        <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout session={session}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">الإعدادات</h1>

      <div className="space-y-6 max-w-2xl">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">تغيير بيانات الدخول</h2>
          <form onSubmit={handleUpdateCredentials} className="space-y-4">
            <div>
              <label className="label">اسم المستخدم الجديد</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="input-field"
                placeholder="اسم مستخدم قوي"
                minLength={3}
              />
            </div>
            <div>
              <label className="label">كلمة المرور الجديدة (اتركها فارغة إن لم ترد التغيير)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="كلمة مرور قوية (8 أحرف على الأقل)"
                minLength={8}
              />
            </div>
            {newPassword && (
              <div>
                <label className="label">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input-field ${confirmPassword && newPassword !== confirmPassword ? "border-red-500" : ""}`}
                  placeholder="أعد كتابة كلمة المرور الجديدة"
                />
              </div>
            )}
            <div>
              <label className="label">كلمة المرور الحالية <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field"
                placeholder="أدخل كلمة المرور الحالية للتأكيد"
                required
              />
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "..." : "حفظ التغييرات"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">المصادقة الثنائية (2FA)</h2>
          {adminInfo?.totpEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <div className="font-medium text-green-800">المصادقة الثنائية مفعلة</div>
                  <div className="text-sm text-green-600">حسابك محمي برمز TOTP</div>
                </div>
              </div>
              <form onSubmit={handleDisable2FA} className="space-y-3 border-t border-gray-100 pt-4">
                <label className="label">أدخل كلمة المرور لإلغاء المصادقة الثنائية</label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="input-field"
                  placeholder="كلمة المرور الحالية"
                />
                <button type="submit" disabled={saving || !disablePassword} className="btn btn-danger">
                  {saving ? "..." : "إلغاء المصادقة الثنائية"}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                المصادقة الثنائية تضيف طبقة حماية إضافية لحسابك. بعد التفعيل، ستُطلب منك إدخال رمز من تطبيق المصادقة (Google Authenticator، Authy، إلخ) عند كل تسجيل دخول.
              </p>
              {!twoFAQrCode ? (
                <button onClick={handleSetup2FA} disabled={saving} className="btn btn-primary">
                  {saving ? "..." : "تفعيل المصادقة الثنائية"}
                </button>
              ) : (
                <form onSubmit={handleVerify2FA} className="space-y-4">
                  <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img src={twoFAQrCode} alt="QR Code for 2FA" className="w-48 h-48" />
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">أو أدخل هذا المفتاح يدويًا:</div>
                      <code className="text-xs bg-gray-200 px-2 py-1 rounded break-all">{twoFASecret}</code>
                    </div>
                  </div>
                  <div>
                    <label className="label">أدخل الرقم من تطبيق المصادقة</label>
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
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving || twoFAToken.length !== 6} className="btn btn-primary">
                      {saving ? "..." : "تفعيل"}
                    </button>
                    <button type="button" onClick={() => { setTwoFAQrCode(""); setTwoFASecret(""); }} className="btn btn-outline">
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">دورية الفحص التلقائي (Patrol Scanner)</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              إعادة فحص المحتوى القديم (participations, تعليقات, تصويتات) بعد إضافة كلمات محظورة جديدة.
            </p>
            <button onClick={async () => {
              setSaving(true);
              try {
                const res = await fetch("/api/admin/patrol", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
                const data = await res.json();
                toast.success(`تم الفحص: ${data.scanned} محتوى، ${data.actions} إجراء`);
              } catch { toast.error("حدث خطأ"); }
              setSaving(false);
            }} disabled={saving} className="btn btn-primary">
              {saving ? "..." : "تشغيل دورية فحص الآن"}
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">الأمان</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">تسجيل الخروج من كل الجلسات</div>
                <div className="text-sm text-gray-500">سيتم تسجيل خروجك من جميع الأجهزة</div>
              </div>
              <button onClick={handleLogoutAll} disabled={saving} className="btn btn-danger btn-sm">
                {saving ? "..." : "تسجيل الخروج"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}