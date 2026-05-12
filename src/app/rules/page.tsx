import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RULES_DATA, SITE_NAME } from "@/lib/constants";

export default function RulesPage() {
  return (
    <>
      <Header />
      <main className="container-main py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">قواعد المنصة</h1>

          <div className="card mb-6">
            <p className="text-gray-600 leading-relaxed">
              {SITE_NAME} منصة مجتمعية غير ربحية تهدف إلى جمع آراء المصريين حول مشاكل الإنترنت في مصر. للحفاظ على المنصة آمنة ومحترمة، يرجى الالتزام بالقواعد التالية.
            </p>
          </div>

          <div className="card mb-6">
<h2 className="text-lg font-bold text-red-700 mb-4">ممنوع تمامًا</h2>
             <ol className="space-y-3 marker:text-red-500 list-decimal pl-5">
               {RULES_DATA.bannedItems.map((item, i) => (
                 <li key={i} className="text-sm text-red-700">{item}</li>
               ))}
             </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h2 className="font-bold text-yellow-800 mb-2">تنبيه مهم</h2>
            <p className="text-yellow-700 text-sm leading-relaxed">{RULES_DATA.warning}</p>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">سياسة الحذف والحظر</h2>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li>• يتم حذف أي محتوى مخالف فور اكتشافه.</li>
              <li>• المخالف قد يتم حظره مؤقتًا من النشر.</li>
              <li>• المخالفات المتكررة تؤدي إلى حظر أطول.</li>
              <li>• يمكن للمستخدمين الإبلاغ عن محتوى مخالف عبر زر &quot;إبلاغ&quot;.</li>
              <li>• إدارة الموقع وحدها المسؤولة عن قرارات الحذف والحظر.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
