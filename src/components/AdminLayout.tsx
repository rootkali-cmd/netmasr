"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

interface AdminSession {
  admin: { username: string; role: string };
}

export default function AdminLayout({ children, session }: { children: React.ReactNode; session: AdminSession }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "الرئيسية", href: "/control-panel/dashboard", icon: "📊" },
    { label: "المشاركات", href: "/control-panel/posts", icon: "📝" },
    { label: "التعليقات", href: "/control-panel/comments", icon: "💬" },
    { label: "الاستفتاءات الرسمية", href: "/control-panel/polls", icon: "📋" },
    { label: "البلاغات", href: "/control-panel/reports", icon: "🚩" },
    { label: "الكلمات المحظورة", href: "/control-panel/banned-words", icon: "🔇" },
    { label: "سجل المراجعة", href: "/control-panel/moderation-logs", icon: "📜" },
    { label: "الأقسام", href: "/control-panel/categories", icon: "📁" },
    { label: "الإعدادات", href: "/control-panel/settings", icon: "⚙️" },
  ];

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/control-panel/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={`bg-gray-900 text-white w-64 flex-shrink-0 fixed h-full z-30 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-auto`}>
        <div className="p-4 border-b border-gray-700">
          <div className="font-bold text-lg">NetMasr.org</div>
          <div className="text-xs text-gray-400">لوحة الإدارة</div>
        </div>
        <nav className="p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 no-underline transition-colors ${
                pathname === item.href ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="border-t border-gray-700 mt-4 pt-4 px-3">
            <div className="text-xs text-gray-400 mb-2">
              {session.admin.username} ({session.admin.role})
            </div>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 w-full text-right">
              تسجيل الخروج
            </button>
            <Link href="/" className="block text-sm text-blue-400 hover:text-blue-300 mt-1 no-underline">
              العودة للموقع
            </Link>
          </div>
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 md:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="mr-3 font-bold text-gray-900">لوحة الإدارة</span>
        </header>

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
