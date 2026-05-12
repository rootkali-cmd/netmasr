"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";
import { CATEGORIES } from "@/lib/constants";

interface Category { id: string; name: string; slug: string; description: string | null; sortOrder: number; _count: { posts: number } }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.status === 401) { window.location.href = "/control-panel/login"; return; }
      const data = await res.json();
      setCategories(data.categories || []);
    } catch { toast.error("حدث خطأ"); }
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">جاري التحميل...</div>;

  return (
    <AdminLayout session={{ admin: { username: "admin", role: "owner" } }}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">الأقسام</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-3 text-gray-500 font-medium">الاسم</th>
              <th className="text-right py-3 px-3 text-gray-500 font-medium">الرابط</th>
              <th className="text-right py-3 px-3 text-gray-500 font-medium">الوصف</th>
              <th className="text-center py-3 px-3 text-gray-500 font-medium">المشاركات</th>
              <th className="text-center py-3 px-3 text-gray-500 font-medium">الترتيب</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 font-medium text-gray-900">{cat.name}</td>
                <td className="py-3 px-3 font-mono text-gray-500 text-xs">{cat.slug}</td>
                <td className="py-3 px-3 text-gray-500 text-xs">{cat.description || "-"}</td>
                <td className="py-3 px-3 text-center text-gray-500">{cat._count.posts}</td>
                <td className="py-3 px-3 text-center text-gray-500">{cat.sortOrder}</td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-8">لا توجد أقسام</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
