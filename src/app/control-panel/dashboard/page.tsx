import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminLayout from "@/components/AdminLayout";
import { prisma } from "@/lib/prisma";
import { ADMIN_PANEL_PATH } from "@/lib/admin-url";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect(`/${ADMIN_PANEL_PATH}/login`);
  }

  const [totalPosts, pendingPosts, totalComments, totalPolls, totalReports, totalOfficialPolls] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "pending" } }),
    prisma.comment.count(),
    prisma.userPoll.count(),
    prisma.report.count({ where: { isResolved: false } }),
    prisma.officialPoll.count(),
  ]);

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const stats = [
    { label: "إجمالي المشاركات", value: totalPosts, color: "text-blue-600" },
    { label: "مشاركات معلقة", value: pendingPosts, color: "text-yellow-600" },
    { label: "إجمالي التعليقات", value: totalComments, color: "text-green-600" },
    { label: "بلاغات غير محلولة", value: totalReports, color: "text-red-600" },
    { label: "تصويتات المستخدمين", value: totalPolls, color: "text-purple-600" },
    { label: "استفتاءات رسمية", value: totalOfficialPolls, color: "text-blue-600" },
  ];

  return (
    <AdminLayout session={session}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">لوحة التحكم</h1>
      <p className="text-sm text-gray-500 mb-8">
        مرحبًا {session.admin.username} ({session.admin.role})
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="text-2xl font-extrabold mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">آخر النشاطات</h2>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-2 px-3 text-gray-500 font-medium">الإجراء</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">التفاصيل</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-800">{log.action}</td>
                  <td className="py-2 px-3 text-gray-500">{log.details || "-"}</td>
                  <td className="py-2 px-3 text-gray-400 text-xs">
                    {new Date(log.createdAt).toLocaleString("ar-EG")}
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-8">
                    لا توجد نشاطات بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
