"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";

interface ModLog {
  id: string;
  contentType: string;
  contentId: string;
  matchedTerm: string | null;
  actionTaken: string;
  scanType: string;
  status: string | null;
  createdAt: string;
}

export default function AdminModerationLogsPage() {
  const [logs, setLogs] = useState<ModLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  async function fetchLogs() {
    try {
      const res = await fetch("/api/admin/moderation-logs");
      if (res.status === 401) { window.location.href = "/control-panel/login"; return; }
      const data = await res.json();
      setLogs(data.logs || []);
    } catch { toast.error("حدث خطأ"); }
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">جاري التحميل...</div>;

  return (
    <AdminLayout session={{ admin: { username: "admin", role: "owner" } }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">سجل المراجعة</h1>
        <button onClick={fetchLogs} className="btn btn-outline btn-sm">تحديث</button>
      </div>

      <div className="card">
        {logs.length === 0 ? (
          <p className="text-center text-gray-400 py-8">لا توجد سجلات مراجعة بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-right">
                  <th className="py-2 px-3 text-gray-500 font-medium">النوع</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">المعرف</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">الكلمة المطابقة</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">الإجراء</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">نوع الفحص</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">الحالة</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-900">{log.contentType}</td>
                    <td className="py-2 px-3 font-mono text-xs text-gray-500">{log.contentId.slice(0, 12)}...</td>
                    <td className="py-2 px-3">
                      {log.matchedTerm && <span className="rounded bg-red-100 px-1 font-bold text-red-700">{log.matchedTerm}</span>}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`badge ${log.actionTaken.includes("block") || log.actionTaken.includes("removed") ? "badge-red" : log.actionTaken.includes("review") ? "badge-yellow" : "badge-green"}`}>
                        {log.actionTaken}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{log.scanType}</td>
                    <td className="py-2 px-3 text-gray-600">{log.status || "-"}</td>
                    <td className="py-2 px-3 text-xs text-gray-400">{new Date(log.createdAt).toLocaleString("ar-EG")}</td>
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