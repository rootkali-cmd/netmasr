"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";
import { ADMIN_PANEL_PATH } from "@/lib/admin-url";

interface BannedWordItem {
  id: string;
  term: string;
  category: string;
  action: string;
  matchType: string;
  severity: string;
  isActive: boolean;
  detectionCount: number;
  createdAt: string;
}

const CATEGORIES = ["INSULT", "POLITICS", "ADULT", "HACKING", "PERSONAL_DATA", "SPAM", "LINKS", "OTHER"];
const ACTIONS = ["BLOCK", "REVIEW", "AUTO_REMOVE"];
const MATCH_TYPES = ["EXACT_WORD", "CONTAINS", "REGEX"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH"];

export default function AdminBannedWordsPage() {
  const [words, setWords] = useState<BannedWordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BannedWordItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({ term: "", category: "OTHER", action: "REVIEW", matchType: "CONTAINS", severity: "MEDIUM" });

  useEffect(() => { fetchWords(); }, []);

  async function fetchWords() {
    try {
      const res = await fetch("/api/admin/banned-words");
      if (res.status === 401 || res.status === 404) {
        window.location.href = `/${ADMIN_PANEL_PATH}/login`;
        return;
      }
      const data = await res.json();
      setWords(data.words || []);
    } catch { toast.error("حدث خطأ"); }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.term.trim()) { toast.error("الكلمة مطلوبة"); return; }
    try {
      if (editing) {
        const res = await fetch("/api/admin/banned-words", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        if (res.ok) { toast.success("تم التعديل"); setShowForm(false); setEditing(null); fetchWords(); }
        else { const d = await res.json(); toast.error(d.error || "حدث خطأ"); }
      } else {
        const res = await fetch("/api/admin/banned-words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) { toast.success("تمت الإضافة"); setShowForm(false); fetchWords(); resetForm(); }
        else { const d = await res.json(); toast.error(d.error || "حدث خطأ"); }
      }
    } catch { toast.error("حدث خطأ"); }
  }

  async function handleToggle(word: BannedWordItem) {
    try {
      await fetch("/api/admin/banned-words", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: word.id, isActive: !word.isActive }),
      });
      fetchWords();
    } catch { toast.error("حدث خطأ"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الكلمة؟")) return;
    try {
      await fetch(`/api/admin/banned-words?id=${id}`, { method: "DELETE" });
      toast.success("تم الحذف");
      fetchWords();
    } catch { toast.error("حدث خطأ"); }
  }

  function editWord(word: BannedWordItem) {
    setEditing(word);
    setForm({ term: word.term, category: word.category, action: word.action, matchType: word.matchType, severity: word.severity });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ term: "", category: "OTHER", action: "REVIEW", matchType: "CONTAINS", severity: "MEDIUM" });
    setEditing(null);
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">جاري التحميل...</div>;

  return (
    <AdminLayout session={{ admin: { username: "admin", role: "owner" } }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الكلمات المحظورة</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary btn-sm">
          + إضافة كلمة
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 border-blue-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? "تعديل كلمة" : "إضافة كلمة جديدة"}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">الكلمة</label>
              <input type="text" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} className="input-field" placeholder="أدخل الكلمة..." required />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label">التصنيف</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">الإجراء</label>
                <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} className="input-field">
                  {ACTIONS.map((a) => <option key={a} value={a}>{a === "BLOCK" ? "منع" : a === "REVIEW" ? "مراجعة" : "حذف تلقائي"}</option>)}
                </select>
              </div>
              <div>
                <label className="label">نوع المطابقة</label>
                <select value={form.matchType} onChange={(e) => setForm({ ...form, matchType: e.target.value })} className="input-field">
                  {MATCH_TYPES.map((m) => <option key={m} value={m}>{m === "EXACT_WORD" ? "كلمة كاملة" : m === "CONTAINS" ? "يحتوي على" : "REGEX"}</option>)}
                </select>
              </div>
              <div>
                <label className="label">الخطورة</label>
                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="input-field">
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s === "LOW" ? "منخفضة" : s === "MEDIUM" ? "متوسطة" : "عالية"}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">{editing ? "حفظ التعديل" : "إضافة"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn btn-outline">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {words.length === 0 ? (
          <p className="text-center text-gray-400 py-8">لا توجد كلمات محظورة. أضف أول كلمة الآن.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-right">
                  <th className="py-2 px-3 text-gray-500 font-medium">الكلمة</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">التصنيف</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">الإجراء</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">المطابقة</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">الخطورة</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">الاكتشافات</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">الحالة</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {words.map((w) => (
                  <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-900">{w.term}</td>
                    <td className="py-2 px-3"><span className="badge badge-blue">{w.category}</span></td>
                    <td className="py-2 px-3">
                      <span className={`badge ${w.action === "BLOCK" ? "badge-red" : w.action === "REVIEW" ? "badge-yellow" : "badge-red"}`}>
                        {w.action === "BLOCK" ? "منع" : w.action === "REVIEW" ? "مراجعة" : "حذف تلقائي"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{w.matchType}</td>
                    <td className="py-2 px-3">
                      <span className={`badge ${w.severity === "HIGH" ? "badge-red" : w.severity === "MEDIUM" ? "badge-yellow" : "badge-blue"}`}>{w.severity}</span>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{w.detectionCount}</td>
                    <td className="py-2 px-3">
                      <button onClick={() => handleToggle(w)} className={`badge ${w.isActive ? "badge-green cursor-pointer" : "badge-red cursor-pointer"}`}>
                        {w.isActive ? "مفعل" : "معطل"}
                      </button>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <button onClick={() => editWord(w)} className="text-blue-600 hover:text-blue-800 text-xs">تعديل</button>
                        <button onClick={() => handleDelete(w.id)} className="text-red-600 hover:text-red-800 text-xs">حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
