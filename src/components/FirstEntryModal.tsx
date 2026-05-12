"use client";

export default function FirstEntryModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🛡️</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">قبل دخول NetMasr.org</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              NetMasr.org منصة مجتمعية غير ربحية للنقاش حول مشاكل الإنترنت ومستقبله في مصر. للحفاظ على المنصة آمنة ومحترمة، يجب الالتزام بالقواعد التالية.
            </p>
          </div>

          <ol className="space-y-3 mb-6 text-right list-decimal list-inside marker:text-red-500 marker:text-base">
            <li className="text-sm text-red-700">ممنوع تمامًا أي محتوى سياسي أو نقاشات سياسية.</li>
            <li className="text-sm text-red-700">ممنوع أي محتوى إباحي أو خادش.</li>
            <li className="text-sm text-red-700">ممنوع التحريض على العنف أو الكراهية أو الإيذاء.</li>
            <li className="text-sm text-red-700">ممنوع السب والقذف والإهانات الشخصية.</li>
            <li className="text-sm text-red-700">ممنوع التشهير بأشخاص أو موظفين أو نشر أسمائهم.</li>
            <li className="text-sm text-red-700">ممنوع نشر أرقام تليفونات أو عناوين أو بيانات شخصية.</li>
            <li className="text-sm text-red-700">ممنوع نشر صور أو ملفات من المستخدمين.</li>
            <li className="text-sm text-red-700">ممنوع أي محتوى متعلق بالاختراق أو سرقة الخدمات أو تجاوز الأنظمة.</li>
            <li className="text-sm text-red-700">ممنوع نشر روابط مشبوهة أو دعائية.</li>
            <li className="text-sm text-red-700">ممنوع النصب أو جمع أموال أو الإعلان عن خدمات غير موثقة.</li>
            <li className="text-sm text-red-700">ممنوع انتحال اسم الموقع أو استخدام علامة التوثيق.</li>
            <li className="text-sm text-red-700">ممنوع أي محتوى يخالف القانون.</li>
          </ol>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800 leading-relaxed">
              أي مخالفة سيتم حذفها فورًا، وقد يتم حظر الجهاز أو الشبكة مؤقتًا من النشر. المنصة مخصصة فقط لمناقشة مشاكل الإنترنت، الاقتراحات، الحلول، والتصويتات المجتمعية.
            </p>
          </div>

          <button
            onClick={onAccept}
            className="w-full btn btn-primary text-lg py-3"
          >
            أوافق وأدخل
          </button>
        </div>
      </div>
    </div>
  );
}
