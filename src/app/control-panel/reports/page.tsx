"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";
import { ADMIN_PANEL_PATH } from "@/lib/admin-url";

interface Report {
  id: string;
  reason: string;
  isResolved: boolean;
  createdAt: string;
  post: { id: string; title: string; isClosed: boolean } | null;
  comment: { id: string; content: string } | null;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await fetch("/api/admin/reports");
      if (res.status === 401 || res.status === 404) { window.location.href = `/${ADMIN_PANEL_PATH}/login`; return; }
      const data = await res.json();
      setReports(data.reports || []);
    } catch { toast.error("حدث خطأ"); }
    setLoading(false);
  }

  async function handleAction(reportId: string, action: string) {
    setActionLoading(reportId);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reportId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "تم بنجاح");
        fetchReports();
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch {
      toast.error("حدث خطأ");
    }
    setActionLoading(null);
  }

  async function handleDelete(reportId: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المحتوى؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    await handleAction(reportId, "delete");
  }

  async function handleSuspend(reportId: string) {
    if (!confirm("هل تريد حظر هذا المحتوى مؤقتًا؟ يمكنك التراجع لاحقًا.")) return;
    await handleAction(reportId, "suspend");
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">جاري التحميل...</div>;

  const unresolved = reports.filter(r => !r.isResolved);
  const resolved = reports.filter(r => r.isResolved);

  return (
    <AdminLayout session={{ admin: { username: "admin", role: "owner" } }}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">البلاغات</h1>
      <p className="text-sm text-gray-500 mb-4">{unresolved.length} بلاغ غير محلول</p>

      <div className="space-y-3">
        {unresolved.map((r) => (
          <div key={r.id} className="card border-red-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 mb-1">{r.reason}</p>
                <p className="text-xs text-gray-500">
                  {r.post ? `مشاركة: ${r.post.title}` : r.comment ? `تعليق: ${r.comment.content.slice(0, 100)}${r.comment.content.length > 100 ? "..." : ""}` : "غير معروف"}
                </p>
                <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleString("ar-EG")}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleSuspend(r.id)}
                  disabled={actionLoading === r.id}
                  className="btn btn-warning btn-sm"
                  style={{ backgroundColor: "#f59e0b", color: "white" }}
                >
                  {actionLoading === r.id ? "..." : "حظر مؤقت"}
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={actionLoading === r.id}
                  className="btn btn-danger btn-sm"
                >
                  {actionLoading === r.id ? "..." : "حذف"}
                </button>
                <button
                  onClick={() => handleAction(r.id, "resolve")}
                  disabled={actionLoading === r.id}
                  className="btn btn-success btn-sm"
                >
                  {actionLoading === r.id ? "..." : "حل"}
                </button>
              </div>
            </div>
          </div>
        ))}
        {unresolved.length === 0 && <p className="text-center text-green-600 py-8">لا توجد بلاغات غير محلولة ✓</p>}

        {resolved.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">تم حلها</h2>
            {resolved.map((r) => (
              <div key={r.id} className="card bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{r.reason}</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString("ar-EG")}</p>
                  </div>
                  <span className="badge badge-green">تم الحل</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
