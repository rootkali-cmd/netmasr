import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل").max(200, "العنوان طويل جدًا"),
  content: z.string().min(10, "المحتوى يجب أن يكون 10 أحرف على الأقل").max(10000, "المحتوى طويل جدًا"),
  categorySlug: z.string().min(1, "يجب اختيار تصنيف"),
  tripcode: z.string().max(100).optional().default(""),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "التعليق لا يمكن أن يكون فارغًا").max(5000, "التعليق طويل جدًا"),
  postId: z.string().min(1),
  parentId: z.string().optional(),
  tripcode: z.string().max(100).optional().default(""),
});

export const createUserPollSchema = z.object({
  question: z.string().min(5, "السؤال يجب أن يكون 5 أحرف على الأقل").max(300, "السؤال طويل جدًا"),
  description: z.string().max(2000).optional().default(""),
  options: z
    .array(z.string().min(1, "الخيار لا يمكن أن يكون فارغًا").max(200))
    .min(2, "يجب إضافة خيارين على الأقل")
    .max(6, "يمكن إضافة 6 خيارات كحد أقصى"),
  categorySlug: z.string().min(1, "يجب اختيار تصنيف"),
  tripcode: z.string().max(100).optional().default(""),
});

export const createOfficialPollSchema = z.object({
  title: z.string().min(5).max(300),
  description: z.string().max(2000).optional().default(""),
  options: z
    .array(z.string().min(1).max(200))
    .min(2, "يجب إضافة خيارين على الأقل")
    .max(10),
  isPinned: z.boolean().optional().default(false),
});

export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const verify2FASchema = z.object({
  token: z.string().length(6, "الرمز يجب أن يكون 6 أرقام"),
  sessionToken: z.string().min(1),
});

export const reportSchema = z.object({
  postId: z.string().optional(),
  commentId: z.string().optional(),
  reason: z.string().min(10, "الرجاء كتابة سبب الإبلاغ").max(500),
});

export const contactSchema = z.object({
  name: z.string().min(1).max(100).optional().default(""),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  message: z.string().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل").max(2000),
});
