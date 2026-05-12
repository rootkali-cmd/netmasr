"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";
import { ADMIN_PANEL_PATH } from "@/lib/admin-url";

interface PollOption { id: string; text: string; votes: number; order: number }
interface OfficialPoll { id: string; title: string; description: string | null; totalVotes: number; isPinned: boolean; isActive: boolean; createdAt: string; options: PollOption[] }

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<OfficialPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchPolls(); }, []);

  async function fetchPolls() {
    try {
      const res = await fetch("/api/admin/polls");
      if (res.status === 401 || res.status === 404) { window.location.href = `/${ADMIN_PANEL_PATH}/login`; return; }
      const data = await res.json();
      setPolls(data.polls || []);
    } catch { toast.error("حدث خطأ"); }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) { toast.error("يجب إضافة خيارين على الأقل"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/polls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description, options: validOptions, isPinned }) });
      if (res.ok) { toast.success("تم إنشاء الاستفتاء"); setShowCreate(false); setTitle(""); setDescription(""); setOptions(["", ""]); setIsPinned(false); fetchPolls(); }
      else { const d = await res.json(); toast.error(d.error || "حدث خطأ"); }
    } catch { toast.error("حدث خطأ"); }
    setSubmitting(false);
  }

  async function handleAction(id: string, action: string) {
    try {
      const res = await fetch("/api/admin/polls", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
      if (res.ok) { toast.success(`تم`); fetchPolls(); }
    } catch { toast.error("حدث خطأ"); }
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">جاري التحميل...</div>;

  return (
    <AdminLayout session={{ admin: { username: "admin", role: "owner" } }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الاستفتاءات الرسمية</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
          {showCreate ? "إلغاء" : "+ إنشاء استفتاء"}
        </button>
      </div>

      {showCreate && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold mb-4">استفتاء رسمي جديد</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">العنوان</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" maxLength={300} />
            </div>
            <div>
              <label className="label">الوصف (اختياري)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" rows={3} maxLength={2000} />
            </div>
            <div>
              <label className="label">الخيارات</label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="text" value={opt} onChange={(e) => { const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts); }} className="input-field" placeholder={`خيار ${i + 1}`} />
                  {options.length > 2 && <button type="button" onClick={() => setOptions(options.filter((_, idx) => idx !== i))} className="text-red-500">✕</button>}
                </div>
              ))}
              {options.length < 10 && <button type="button" onClick={() => setOptions([...options, ""])} className="text-sm text-blue-600">+ إضافة خيار</button>}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="accent-blue-600" />
              <span className="text-sm">تثبيت في الصفحة الرئيسية</span>
            </label>
            <button type="submit" disabled={submitting} className="btn btn-primary w-full">{submitting ? "..." : "نشر الاستفتاء"}</button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {polls.map((poll) => (
          <div key={poll.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{poll.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{poll.totalVotes} صوت</span>
                  <span className={`badge ${poll.isActive ? "badge-green" : "badge-red"}`}>{poll.isActive ? "نشط" : "غير نشط"}</span>
                  {poll.isPinned && <span className="badge badge-yellow">مثبت</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleAction(poll.id, "toggle_pin")} className="btn btn-outline btn-sm text-xs">{poll.isPinned ? "إلغاء التثبيت" : "تثبيت"}</button>
                <button onClick={() => handleAction(poll.id, "toggle_active")} className="btn btn-outline btn-sm text-xs">{poll.isActive ? "تعطيل" : "تفعيل"}</button>
                <button onClick={() => handleAction(poll.id, "delete")} className="btn btn-danger btn-sm text-xs">حذف</button>
              </div>
            </div>
          </div>
        ))}
        {polls.length === 0 && <div className="text-center text-gray-400 py-8">لا توجد استفتاءات</div>}
      </div>
    </AdminLayout>
  );
}
