"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TurnstileWidget from "@/components/TurnstileWidget";
import { useBannedWords } from "@/hooks/useBannedWords";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewPollPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [tripcode, setTripcode] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState(false);
  const { highlight, hasBanned, loading: bannedLoading } = useBannedWords();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: unknown) => {
        const cats = data as Category[];
        if (cats && cats.length > 0) {
          setCategories(cats);
        } else {
          setCatsError(true);
        }
      })
      .catch(() => setCatsError(true))
      .finally(() => setCatsLoading(false));
  }, []);

  function handleCategoryChange(id: string) {
    setCategoryId(id);
    const cat = categories.find((c) => c.id === id);
    setCategorySlug(cat?.slug || "");
  }

  const questionBanned = hasBanned(question);
  const descBanned = hasBanned(description);
  const optionsBanned = options.some((o) => hasBanned(o));
  const blocked = questionBanned || descBanned || optionsBanned;
  const captchaRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  function addOption() {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  }

  function removeOption(i: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, idx) => idx !== i));
    }
  }

  function updateOption(i: number, value: string) {
    const newOptions = [...options];
    newOptions[i] = value;
    setOptions(newOptions);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (blocked) {
      toast.error("يحتوي النص على كلمات ممنوعة");
      return;
    }
    if (question.length < 5) {
      toast.error("السؤال يجب أن يكون 5 أحرف على الأقل");
      return;
    }
    if (!categoryId) {
      toast.error("يجب اختيار تصنيف");
      return;
    }
    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast.error("يجب إضافة خيارين على الأقل");
      return;
    }
    if (captchaRequired && !captchaToken) {
      toast.error("يرجى إكمال التحقق الأمني");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question, description, options: validOptions, categorySlug, tripcode,
          hcaptchaToken: captchaToken,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("تم إنشاء التصويت بنجاح");
        router.push("/polls");
      } else {
        toast.error(data.error || "حدث خطأ");
        setCaptchaToken("");
        setCaptchaKey((k) => k + 1);
      }
    } catch {
      toast.error("حدث خطأ");
      setCaptchaToken("");
      setCaptchaKey((k) => k + 1);
    }
    setSubmitting(false);
  }

  return (
    <>
      <Header />
      <main className="container-main py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إنشاء تصويت جديد</h1>
          <p className="text-sm text-gray-500 mb-6">سيظهر التصويت باسم &quot;تصويت من مستخدم مجهول&quot;</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">سؤال التصويت</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={`input-field ${questionBanned ? "border-red-500 ring-red-500/20" : ""}`}
                placeholder="مثال: هل توافق على...?"
                maxLength={300}
              />
              {question && (
                <div className="mt-2 text-sm leading-relaxed" dir="auto">
                  {highlight(question)}
                </div>
              )}
            </div>

            <div>
              <label className="label">التصنيف</label>
              {catsLoading ? (
                <div className="input-field text-gray-400">جاري تحميل التصنيفات...</div>
              ) : catsError ? (
                <div className="text-red-600 text-sm">تعذر تحميل التصنيفات. حاول مرة أخرى.</div>
              ) : categories.length === 0 ? (
                <div className="text-gray-500 text-sm">لا توجد تصنيفات متاحة حاليًا.</div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="input-field"
                >
                  <option value="">اختر تصنيفًا</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="label">وصف (اختياري)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`input-field ${descBanned ? "border-red-500 ring-red-500/20" : ""}`}
                placeholder="شرح إضافي للتصويت..."
                rows={3}
                maxLength={2000}
              />
              {description && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
                  {highlight(description)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">الخيارات</label>
                {options.length < 6 && (
                  <button type="button" onClick={addOption} className="text-sm text-blue-600 hover:text-blue-800">
                    + إضافة خيار
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {options.map((opt, i) => {
                  const optBanned = hasBanned(opt);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        className={`input-field flex-1 ${optBanned ? "border-red-500 ring-red-500/20" : ""}`}
                        placeholder={`خيار ${i + 1}`}
                        maxLength={200}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1">يمكنك إضافة من 2 إلى 6 خيارات</p>
              {blocked && (
                <p className="text-xs text-red-600 font-bold mt-1">يحتوي على كلمات ممنوعة</p>
              )}
            </div>

            <div>
              <label className="label">tripcode (اختياري)</label>
              <input
                type="password"
                value={tripcode}
                onChange={(e) => setTripcode(e.target.value)}
                className="input-field"
                placeholder="كلمة سر اختيارية"
                maxLength={100}
              />
            </div>

            <div className="flex justify-center py-2">
              <TurnstileWidget key={captchaKey} onVerify={setCaptchaToken} />
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                blocked ||
                bannedLoading ||
                !categoryId ||
                catsLoading ||
                catsError ||
                (captchaRequired && !captchaToken)
              }
              className={`btn w-full ${blocked ? "bg-red-500 hover:bg-red-600" : "btn-primary"}`}
            >
              {submitting ? "..." : blocked ? "ممنوع النشر — يوجد كلمات ممنوعة" : "إنشاء التصويت"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
