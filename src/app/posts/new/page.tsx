"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [tripcode, setTripcode] = useState("");
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

  const titleBanned = hasBanned(title);
  const contentBanned = hasBanned(content);
  const blocked = titleBanned || contentBanned;
  const captchaRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (blocked) {
      toast.error("يحتوي النص على كلمات ممنوعة. الرجاء إزالتها قبل النشر.");
      return;
    }
    if (title.length < 5) {
      toast.error("العنوان يجب أن يكون 5 أحرف على الأقل");
      return;
    }
    if (content.length < 10) {
      toast.error("المحتوى يجب أن يكون 10 أحرف على الأقل");
      return;
    }
    if (!categoryId) {
      toast.error("يجب اختيار تصنيف");
      return;
    }
    if (captchaRequired && !captchaToken) {
      toast.error("يرجى إكمال التحقق الأمني");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, categorySlug, tripcode, hcaptchaToken: captchaToken }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("تم نشر الموضوع بنجاح");
        router.push(`/posts/${data.id}`);
      } else {
        toast.error(data.error || "حدث خطأ");
        setCaptchaToken("");
        setCaptchaKey((k) => k + 1);
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">موضوع جديد</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">العنوان</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`input-field ${titleBanned ? "border-red-500 ring-red-500/20" : ""}`}
                placeholder="عنوان الموضوع..."
                maxLength={200}
              />
              {title && (
                <div className="mt-2 text-sm leading-relaxed" dir="auto">
                  {highlight(title)}
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
              <label className="label">المحتوى</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`input-field ${contentBanned ? "border-red-500 ring-red-500/20" : ""}`}
                placeholder="اكتب محتوى موضوعك هنا..."
                rows={8}
                maxLength={10000}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">{content.length}/10000</span>
                {blocked && (
                  <span className="text-xs text-red-600 font-bold">يحتوي على كلمات ممنوعة</span>
                )}
              </div>
              {content && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
                  {highlight(content)}
                </div>
              )}
            </div>

            <div>
              <label className="label">tripcode (اختياري)</label>
              <input
                type="password"
                value={tripcode}
                onChange={(e) => setTripcode(e.target.value)}
                className="input-field"
                placeholder="كلمة سر اختيارية لإثبات هويتك في النقاش"
                maxLength={100}
              />
              <p className="text-xs text-gray-400 mt-1">
                كلمة سر اختيارية تظهر بجانب اسمك كمُعرّف ثابت بدون تسجيل حساب
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              بالنشر، أنت توافق على{' '}
              <Link href="/rules" className="text-blue-600 hover:text-blue-800">
                قواعد NetMasr.org
              </Link>
              . ممنوع المحتوى السياسي أو الإباحي أو المسيء.
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
              {submitting ? "جاري النشر..." : blocked ? "ممنوع النشر — يوجد كلمات ممنوعة" : "نشر الموضوع"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
