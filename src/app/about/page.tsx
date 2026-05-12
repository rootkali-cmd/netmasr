import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_NAME_AR, SLOGAN } from "@/lib/constants";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container-main py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">عن المشروع</h1>

          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">ما هو {SITE_NAME_AR}؟</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {SITE_NAME} منصة مجتمعية غير ربحية تهدف إلى جمع آراء المصريين حول مشاكل الإنترنت في مصر،
              ودعم النقاش المجتمعي حول فكرة وجود إنترنت أفضل، غير محدود، عادل، وسريع.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-bold text-lg text-center">{SLOGAN}</p>
            </div>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">ماذا نقدم؟</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>منصة للنقاش المجتمعي حول مشاكل الإنترنت</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>استفتاءات مجتمعية لقياس الرأي العام</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>تصويتات المستخدمين حول مواضيع محددة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>مساحة آمنة ومحترمة للتعبير عن الآراء</span>
              </li>
            </ul>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">ماذا لا نقدم؟</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✕</span>
                <span>لا نقدم خدمة إنترنت حاليًا</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✕</span>
                <span>لا نجمع تبرعات أو أموال</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✕</span>
                <span>لا نبيع أي منتج أو خدمة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✕</span>
                <span>لا نطلب بيانات شخصية</span>
              </li>
            </ul>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">هدفنا</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              هدفنا الأساسي هو جمع رأي المجتمع المصري حول مشاكل الإنترنت والاستماع للمقترحات والحلول.
              هذه المنصة هي خطوة أولى نحو فهم أعمق لاحتياجات المستخدمين.
            </p>
            <p className="text-gray-600 leading-relaxed">
              في المستقبل، إذا تم اتخاذ أي خطوة نحو إنشاء كيان أو شركة إنترنت، فسيتم ذلك وفقًا
              للقوانين والتراخيص المطلوبة وبكل شفافية.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-3">لماذا {SITE_NAME_AR}؟</h2>
            <p className="text-gray-600 leading-relaxed">
              لأن الإنترنت في مصر يستحق نقاشًا أذكى. نؤمن أن صوت المستخدم العادي مهم،
              وأن كل تصويت هو رقم في صورة أكبر. المنصة مفتوحة للجميع، بدون تسجيل، بدون صور،
              بدون سياسة، وبدون بيانات شخصية.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
