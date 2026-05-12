export const SITE_NAME = "NetMasr.org";
export const SITE_NAME_AR = "نت مصر";
export const SLOGAN = "النت مش رفاهية… النت حق.";
export const SHORT_DESC = "منصة مجتمعية غير ربحية تجمع صوت المصريين من أجل إنترنت أفضل، عادل، وغير محدود.";
export const SITE_DESC = "NetMasr.org منصة مفتوحة للمصريين للتعبير عن مشاكل الإنترنت، اقتراح حلول، والتصويت على مطالب واضحة لمستقبل إنترنت أفضل في مصر. بدون تسجيل، بدون صور للمستخدمين، بدون سياسة، وبدون بيانات شخصية.";

export const CATEGORIES = [
  { name: "مشاكل الإنترنت", slug: "internet-problems", description: "مشاكلك مع الإنترنت في مصر" },
  { name: "اقتراحات وحلول", slug: "suggestions", description: "اقتراحاتك وحلولك لمشاكل الإنترنت" },
  { name: "حلم شركة إنترنت مستقلة", slug: "independent-company", description: "نقاشات حول فكرة شركة إنترنت مستقلة" },
  { name: "تجارب المستخدمين", slug: "user-experiences", description: "تجاربك مع خدمات الإنترنت في مصر" },
  { name: "أسئلة تقنية", slug: "tech-questions", description: "أسئلة تقنية حول الإنترنت والشبكات" },
  { name: "تصويتات المستخدمين", slug: "user-polls", description: "تصويتات ينشئها المستخدمون" },
  { name: "نقاش عام عن الإنترنت", slug: "general", description: "نقاش عام حول الإنترنت في مصر" },
];

export const DEFAULT_BANNED_WORDS = [
  { term: "سيسي", category: "POLITICS", action: "BLOCK", matchType: "EXACT_WORD", severity: "HIGH", normalizedTerm: "سيسي" },
  { term: "السيسي", category: "POLITICS", action: "BLOCK", matchType: "EXACT_WORD", severity: "HIGH", normalizedTerm: "السيسي" },
  { term: "مرسي", category: "POLITICS", action: "BLOCK", matchType: "EXACT_WORD", severity: "HIGH", normalizedTerm: "مرسي" },
  { term: "المرسي", category: "POLITICS", action: "BLOCK", matchType: "EXACT_WORD", severity: "HIGH", normalizedTerm: "المرسي" },
  { term: "الإخوان", category: "POLITICS", action: "BLOCK", matchType: "CONTAINS", severity: "HIGH", normalizedTerm: "الاخوان" },
  { term: "رئيس الجمهورية", category: "POLITICS", action: "REVIEW", matchType: "CONTAINS", severity: "MEDIUM", normalizedTerm: "رييس الجمهوريه" },
  { term: "sex", category: "ADULT", action: "BLOCK", matchType: "EXACT_WORD", severity: "HIGH", normalizedTerm: "sex" },
  { term: "سكس", category: "ADULT", action: "BLOCK", matchType: "CONTAINS", severity: "HIGH", normalizedTerm: "سكس" },
  { term: "نيك", category: "ADULT", action: "BLOCK", matchType: "CONTAINS", severity: "HIGH", normalizedTerm: "نيك" },
  { term: "اختراق", category: "HACKING", action: "BLOCK", matchType: "CONTAINS", severity: "MEDIUM", normalizedTerm: "اختراق" },
  { term: "هاكر", category: "HACKING", action: "REVIEW", matchType: "CONTAINS", severity: "MEDIUM", normalizedTerm: "هاكر" },
  { term: "hack", category: "HACKING", action: "REVIEW", matchType: "CONTAINS", severity: "LOW", normalizedTerm: "hack" },
  { term: "password", category: "HACKING", action: "REVIEW", matchType: "CONTAINS", severity: "LOW", normalizedTerm: "password" },
  { term: "رقم تليفون", category: "PERSONAL_DATA", action: "REVIEW", matchType: "CONTAINS", severity: "MEDIUM", normalizedTerm: "رقم تليفون" },
  { term: "عنوان", category: "PERSONAL_DATA", action: "REVIEW", matchType: "CONTAINS", severity: "LOW", normalizedTerm: "عنوان" },
];

export const OFFICIAL_POLLS = [
  {
    title: "هل تؤيد وجود شركة إنترنت مستقلة تقدم إنترنت غير محدود في مصر؟",
    description: "استفتاء مجتمعي لقياس رأي المستخدمين حول فكرة شركة إنترنت مستقلة",
    options: [
      { text: "أؤيد بشدة", order: 0 },
      { text: "أؤيد بشرط السعر المناسب", order: 1 },
      { text: "لا أؤيد", order: 2 },
      { text: "أحتاج تفاصيل أكثر", order: 3 },
    ],
  },
  {
    title: "هل تفضل أن يكون الدفع حسب السرعة بدل حجم الباقة؟",
    description: "استفتاء حول نموذج الدفع المفضل للمستخدمين",
    options: [
      { text: "نعم", order: 0 },
      { text: "لا", order: 1 },
      { text: "حسب السعر", order: 2 },
      { text: "لا أعلم", order: 3 },
    ],
  },
  {
    title: "ما السعر المناسب لإنترنت منزلي غير محدود بسرعة 100 Mbps؟",
    description: "استفتاء لتحديد السعر المناسب لإنترنت غير محدود",
    options: [
      { text: "أقل من 300 جنيه", order: 0 },
      { text: "من 300 إلى 500 جنيه", order: 1 },
      { text: "من 500 إلى 700 جنيه", order: 2 },
      { text: "أكثر من 700 جنيه لو الخدمة ممتازة", order: 3 },
    ],
  },
  {
    title: "ما أكثر شيء يضايقك في الإنترنت الحالي؟",
    description: "استفتاء لتحديد أكبر مشكلة في الإنترنت الحالي",
    options: [
      { text: "انتهاء الباقة بسرعة", order: 0 },
      { text: "السرعة غير الحقيقية", order: 1 },
      { text: "سوء خدمة العملاء", order: 2 },
      { text: "الأعطال المتكررة", order: 3 },
      { text: "الأسعار", order: 4 },
    ],
  },
  {
    title: "لو ظهرت شركة إنترنت جديدة قانونية ومرخصة، هل ستفكر في الاشتراك معها؟",
    description: "استفتاء لقياس مدى استعداد المستخدمين للتحول لشركة إنترنت جديدة",
    options: [
      { text: "نعم فورًا", order: 0 },
      { text: "نعم بعد تجربة الناس", order: 1 },
      { text: "حسب السعر", order: 2 },
      { text: "لا", order: 3 },
    ],
  },
];

export const RULES_DATA = {
  title: "قبل دخول NetMasr.org",
  text: "NetMasr.org منصة مجتمعية غير ربحية للنقاش حول مشاكل الإنترنت ومستقبله في مصر. للحفاظ على المنصة آمنة ومحترمة، يجب الالتزام بالقواعد التالية.",
  bannedItems: [
    "ممنوع تمامًا أي محتوى سياسي أو نقاشات سياسية.",
    "ممنوع أي محتوى إباحي أو خادش.",
    "ممنوع التحريض على العنف أو الكراهية أو الإيذاء.",
    "ممنوع السب والقذف والإهانات الشخصية.",
    "ممنوع التشهير بأشخاص أو موظفين أو نشر أسمائهم.",
    "ممنوع نشر أرقام تليفونات أو عناوين أو بيانات شخصية.",
    "ممنوع نشر صور أو ملفات من المستخدمين.",
    "ممنوع أي محتوى متعلق بالاختراق أو سرقة الخدمات أو تجاوز الأنظمة.",
    "ممنوع نشر روابط مشبوهة أو دعائية.",
    "ممنوع النصب أو جمع أموال أو الإعلان عن خدمات غير موثقة.",
    "ممنوع انتحال اسم الموقع أو استخدام علامة التوثيق.",
    "ممنوع أي محتوى يخالف القانون.",
  ],
  warning: "أي مخالفة سيتم حذفها فورًا، وقد يتم حظر الجهاز أو الشبكة مؤقتًا من النشر. المنصة مخصصة فقط لمناقشة مشاكل الإنترنت، الاقتراحات، الحلول، والتصويتات المجتمعية.",
};

export const SAMPLE_POSTS = [
  {
    title: "السرعة مش زي ما بيقولوا",
    content: "أنا مشترك في سرعة 30 ميجابت من شركة WE، لكن السرعة الفعلية مش بتعدي 10 ميجابت حتى في أوقات الفجر. كلمت خدمة العملاء كذا مرة وكل مرة يقولوا هيتحل وبعدين مفيش حاجة تتغير. حد عنده نفس المشكلة؟",
    categorySlug: "internet-problems",
    anonymousId: "8391",
    upvotes: 24,
    downvotes: 2,
    comments: [
      { content: "نفس المشكلة بالظبط، أنا في مدينة نصر والسرعة بتقع في المساء تحت 5 ميجابت.", anonymousId: "4521" },
      { content: "جرب تغير المودم أو كابل التليفون، أحيانًا المشكلة في التوصيلات الداخلية.", anonymousId: "6712" },
      { content: "الموضوع مش في المودم، هي سرقة في السرعة من الشركة نفسها.", anonymousId: "9034" },
    ],
  },
  {
    title: "اقتراح: إنترنت مجاني في الأماكن العامة",
    content: "ليه مش يكون في إنترنت مجاني في الميادين والمطارات والمكتبات العامة؟ في دول كتير بتعمل كده. ممكن يكون بسرعة محدودة (5 ميجابت) ومدة محدودة (ساعة) لكل مستخدم. ده مش مكلف والبلد بتتطور.",
    categorySlug: "suggestions",
    anonymousId: "2156",
    upvotes: 31,
    downvotes: 5,
    comments: [
      { content: "فكرة جميلة جدًا، بس للأسف في مصر البنية التحتية مش مستعدة لكده.", anonymousId: "3321" },
      { content: "الموضوع محتاج شراكات مع القطاع الخاص. شركات المحمول ممكن تقدم الخدمة.", anonymousId: "7812" },
    ],
  },
  {
    title: "مصر محتاجة شركة إنترنت وطنية مستقلة",
    content: "أنا بشوف أن الحل الوحيد لمشكلة الإنترنت في مصر هو إنشاء شركة إنترنت وطنية مستقلة، مش تابعة لشركة المحمول ولا WE. شركة زي ما كان المفروض مصر تستثمر في الكابلات البحرية بتاعتها. شركة هدفها خدمة وليس ربح.",
    categorySlug: "independent-company",
    anonymousId: "5647",
    upvotes: 47,
    downvotes: 8,
    comments: [
      { content: "الكلام سهل لكن التطبيق صعب. محتاجين رأس مال ضخم وتراخيص ودعم سياسي.", anonymousId: "1109" },
      { content: "ممكن نبدأ بحملة شعبية ونجمع توقيعات. المنصة دي خطوة أولى كويسة.", anonymousId: "3321" },
      { content: "أي شركة جديدة هتتصدم بالاحتكار الموجود. لازم ضغط شعبي قوي.", anonymousId: "8765" },
      { content: "أنا معاك، بس لازم نكون واقعيين. شركة إنترنت جديدة محتاجة ملايين الدولارات.", anonymousId: "4321" },
    ],
  },
  {
    title: "تجربتي مع 4G بديل للإنترنت الأرضي",
    content: "بسبب سوء خدمة ADSL حولت أستخدم راوتر 4G من فودافون. السرعة أفضل بكتير (حتى 40 ميجابت) لكن الباقة بتخلص بسرعة. 140 جنيها مثلا بتجيب 140 جيجا وده مش كفاية لو في ناس كتير في البيت. مين جرب نفس الحل؟",
    categorySlug: "user-experiences",
    anonymousId: "3201",
    upvotes: 18,
    downvotes: 3,
    comments: [
      { content: "أنا معاك في نفس الموضوع. 4G أسرع لكن مش عملي للاستخدام اليومي الكثيف.", anonymousId: "2341" },
      { content: "جربت أورنج، نفس المشكلة. الباقة بتخلص في 10 أيام.", anonymousId: "1190" },
    ],
  },
  {
    title: "إزاي أعرف إذا كان في تعديل على سرعة النت؟",
    content: "عندي شك أن WE بتخفيف السرعة في أوقات الذروة. أعمل إيه عشان أتأكد؟ هل فيه مواقع أو أدوات أقدر أستخدمها لمراقبة السرعة على مدار اليوم؟",
    categorySlug: "tech-questions",
    anonymousId: "7789",
    upvotes: 12,
    downvotes: 1,
    comments: [
      { content: "استخدم موقع speedtest.net وسجل النتايج. أو استخدم تطبيق NetMonitor.", anonymousId: "3321" },
      { content: "في برامج زي PRTG أو Zabbix تراقب السرعة على مدار 24 ساعة.", anonymousId: "4512" },
    ],
  },
  {
    title: "هل توافق على زيادة أسعار الإنترنت مقابل تحسين الجودة؟",
    content: "سؤال للنقاش: لو شركة الإنترنت قالت هنزود السعر 30% بس هنضمن سرعة فعلية 100% من الباقة وهنحسن خدمة العملاء. هتوافق ولا لا؟ أنا شخصيًا أفضل زيادة السعر على السرقة في السرعة.",
    categorySlug: "general",
    anonymousId: "9012",
    upvotes: 29,
    downvotes: 10,
    comments: [
      { content: "لا، أنا ضد زيادة الأسعار. الخدمة السيئة مش مبرر لزيادة الأسعار.", anonymousId: "5643" },
      { content: "أوافق لو في ضمانات واضحة وسرعة حقيقية مش كلام فارغ.", anonymousId: "8901" },
      { content: "الثقة معدومة. قالوا كده قبل كده وزيادة السعر حصلت والجودة لا.", anonymousId: "2345" },
    ],
  },
];
