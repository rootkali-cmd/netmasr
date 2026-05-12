"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";
import { ADMIN_PANEL_PATH } from "@/lib/admin-url";

interface AdminSession { admin: { username: string; role: string } }

interface Comment {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  anonymousId: string;
  post: { id: string; title: string };
  _count: { reports: number };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    try {
      const res = await fetch("/api/admin/comments");
      if (res.status === 401 || res.status === 404) { window.location.href = `/${ADMIN_PANEL_PATH}/login`; return; }
      const data = await res.json();
      setComments(data.comments || []);
    } catch { toast.error("حدث خطأ"); }
    setLoading(false);
  }

  async function handleAction(id: string, action: string) {
    try {
      const res = await fetch("/api/admin/comments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
      if (res.ok) { toast.success(`تم ${action}`); fetchComments(); }
      else { toast.error("حدث خطأ"); }
    } catch { toast.error("حدث خطأ"); }
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">جاري التحميل...</div>;

  return (
    <AdminLayout session={{ admin: { username: "admin", role: "owner" } }}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">إدارة التعليقات</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-3 text-gray-500 font-medium">المحتوى</th>
              <th className="text-right py-3 px-3 text-gray-500 font-medium">الموضوع</th>
              <th className="text-center py-3 px-3 text-gray-500 font-medium">الحالة</th>
              <th className="text-center py-3 px-3 text-gray-500 font-medium">بلاغات</th>
              <th className="text-center py-3 px-3 text-gray-500 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3">
                  <div className="truncate max-w-[300px] text-gray-900">{c.content}</div>
                  <div className="text-xs text-gray-400">#{c.anonymousId}</div>
                </td>
                <td className="py-3 px-3 text-gray-500 truncate max-w-[150px]">{c.post.title}</td>
                <td className="py-3 px-3 text-center">
                  <span className={`badge ${c.status === "approved" ? "badge-green" : c.status === "pending" ? "badge-yellow" : "badge-red"}`}>
                    {c.status === "approved" ? "مقبول" : c.status === "pending" ? "معلق" : "مرفوض"}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">{c._count.reports > 0 ? <span className="badge badge-red">{c._count.reports}</span> : <span className="text-gray-400">0</span>}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center justify-center gap-1">
                    {c.status === "pending" && <button onClick={() => handleAction(c.id, "approve")} className="btn btn-success btn-sm text-xs">قبول</button>}
                    {c.status !== "rejected" && <button onClick={() => handleAction(c.id, "reject")} className="btn btn-danger btn-sm text-xs">رفض</button>}
                    <button onClick={() => handleAction(c.id, "delete")} className="btn btn-danger btn-sm text-xs">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {comments.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-8">لا توجد تعليقات</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
