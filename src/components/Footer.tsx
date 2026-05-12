import Link from "next/link";
import { SITE_NAME, SITE_NAME_AR } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container-main py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-extrabold text-gray-900 text-lg mb-2">{SITE_NAME_AR}</div>
            <p className="text-sm text-gray-500 leading-relaxed">
              منصة مجتمعية غير ربحية تجمع صوت المصريين من أجل إنترنت أفضل، عادل، وغير محدود.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-3">روابط سريعة</h3>
            <div className="flex flex-col gap-2">
              <Link href="/posts" className="text-sm text-gray-500 hover:text-blue-600 no-underline">المشاركات</Link>
              <Link href="/polls" className="text-sm text-gray-500 hover:text-blue-600 no-underline">الاستفتاءات الرسمية</Link>
              <Link href="/posts/new" className="text-sm text-gray-500 hover:text-blue-600 no-underline">اكتب رأيك</Link>
              <Link href="/rules" className="text-sm text-gray-500 hover:text-blue-600 no-underline">القواعد</Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-3">عن المنصة</h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-gray-500 hover:text-blue-600 no-underline">عن المشروع</Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600 no-underline">الخصوصية</Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-blue-600 no-underline">تواصل معنا</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-8 pt-6 text-center text-xs text-gray-400">
          {SITE_NAME} &copy; {new Date().getFullYear()} — منصة مجتمعية غير ربحية. جميع المشاركات تعبر عن رأي أصحابها.
        </div>
      </div>
    </footer>
  );
}
