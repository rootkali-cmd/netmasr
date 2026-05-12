"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";

interface AdminSession {
  admin: { username: string; role: string };
}

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  isPinned: boolean;
  isClosed: boolean;
  isOfficial: boolean;
  createdAt: string;
  anonymousId: string;
  category: { name: string };
  _count: { comments: number; reports: number };
}

export default function AdminPostsPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/admin/posts");
      if (res.status === 401) {
        window.location.href = "/control-panel/login";
        return;
      }
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      toast.error("حدث خطأ");
    }
    setLoading(false);
  }

  async function handleAction(id: string, action: string) {
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      if (res.ok) {
        toast.success(`تم ${action}`);
        fetchPosts();
      } else {
        toast.error("حدث خطأ");
      }
    } catch {
      toast.error("حدث خطأ");
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">جاري التحميل...</div>;
  }

  // We need to check session - for simplicity we'll render content
  // In production, use proper session management
  return (
    <AdminLayout session={session || { admin: { username: "admin", role: "owner" } }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المشاركات</h1>
        <span className="text-sm text-gray-500">{posts.length} مشاركة</span>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-3 text-gray-500 font-medium">العنوان</th>
              <th className="text-right py-3 px-3 text-gray-500 font-medium">القسم</th>
              <th className="text-center py-3 px-3 text-gray-500 font-medium">الحالة</th>
              <th className="text-center py-3 px-3 text-gray-500 font-medium">التعليقات</th>
              <th className="text-center py-3 px-3 text-gray-500 font-medium">بلاغات</th>
              <th className="text-center py-3 px-3 text-gray-500 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3">
                  <div className="font-medium text-gray-900 truncate max-w-[250px]">{post.title}</div>
                  <div className="text-xs text-gray-400">#{post.anonymousId}</div>
                </td>
                <td className="py-3 px-3 text-gray-500">{post.category.name}</td>
                <td className="py-3 px-3 text-center">
                  <span className={`badge ${
                    post.status === "approved" ? "badge-green" :
                    post.status === "pending" ? "badge-yellow" : "badge-red"
                  }`}>
                    {post.status === "approved" ? "مقبول" : post.status === "pending" ? "معلق" : "مرفوض"}
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-gray-500">{post._count.comments}</td>
                <td className="py-3 px-3 text-center">
                  {post._count.reports > 0 ? (
                    <span className="badge badge-red">{post._count.reports}</span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {post.status === "pending" && (
                      <button onClick={() => handleAction(post.id, "approve")} className="btn btn-success btn-sm text-xs">قبول</button>
                    )}
                    {post.status !== "rejected" && (
                      <button onClick={() => handleAction(post.id, "reject")} className="btn btn-danger btn-sm text-xs">رفض</button>
                    )}
                    <button onClick={() => handleAction(post.id, post.isPinned ? "unpin" : "pin")} className="btn btn-outline btn-sm text-xs">
                      {post.isPinned ? "إلغاء التثبيت" : "تثبيت"}
                    </button>
                    <button onClick={() => handleAction(post.id, post.isClosed ? "open" : "close")} className="btn btn-outline btn-sm text-xs">
                      {post.isClosed ? "فتح" : "إغلاق"}
                    </button>
                    <button onClick={() => handleAction(post.id, "delete")} className="btn btn-danger btn-sm text-xs">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">لا توجد مشاركات</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
