import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="container-main py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">سياسة الخصوصية</h1>

          <div className="card mb-6">
            <p className="text-gray-600 leading-relaxed mb-4">
              في {SITE_NAME}، خصوصيتك مهمة جدًا بالنسبة لنا. صممنا المنصة من البداية لتقليل
              جمع البيانات الشخصية إلى أقصى حد ممكن.
            </p>
          </div>

          <div className="card mb-6">
            <h2 className="text-lg font-bold text-green-700 mb-3">ما لا نجمعه أبدًا</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>لا نطلب اسمًا حقيقيًا</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>لا نطلب بريدًا إلكترونيًا</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>لا نطلب رقم هاتف</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>لا نطلب عنوان أو أي بيانات تعريف شخصية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>لا نبيع بيانات المستخدمين</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>لا نستخدم بيانات لأغراض إعلانية</span>
              </li>
            </ul>
          </div>

          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">ما قد نستخدمه</h2>
            <p className="text-gray-600 text-sm mb-3">
              قد نستخدم بعض البيانات التقنية المحدودة لحماية المنصة من السبام والتلاعب:
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• عنوان IP (يتم تحويله إلى hash غير قابل للعكس ولا يُخزن النص الأصلي)</li>
              <li>• cookies تقنية لتذكر موافقتك على القواعد</li>
              <li>• معلومات محدودة عن المتصفح لمنع التصويت المزدوج</li>
              <li>• rate limiting لحماية المنصة من الهجمات</li>
            </ul>
          </div>

          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">ملفات تعريف الارتباط (Cookies)</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              لا نخزن موافقة دائمة على القواعد. قد نستخدم تخزينًا مؤقتًا داخل الجلسة فقط لإخفاء نافذة القواعد بعد الضغط على زر أوافق وأدخل أثناء نفس الزيارة. لا نستخدم cookies للتتبع الإعلاني أو جمع البيانات. يمكنك مسحها في أي وقت من إعدادات المتصفح.
            </p>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-3">جهات خارجية</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              قد نستخدم خدمات خارجية مثل Cloudflare لحماية الموقع وتحسين الأداء. هذه الخدمات
              قد تصل إلى بعض البيانات التقنية المحدودة (مثل عنوان IP) لأغراض أمنية وتشغيلية فقط.
              لا نستخدم خدمات إعلانية أو تحليلات تجمع بيانات شخصية.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
