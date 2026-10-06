import type { Localized } from "@/i18n/config";

export type MockupKind = "installments" | "dashboard" | "chat" | "gold";

export type ScreenDevice = "phone" | "browser" | "tablet";

export type StackGroup = { label?: Localized; items: string[] };

export type Project = {
  slug: string;
  name: Localized;
  category: Localized;
  tagline: Localized;
  summary: Localized;
  challenge: Localized;
  solution: Localized;
  features: Localized[];
  /** Tech grouped by layer (label optional). Empty hides the section. */
  stack: StackGroup[];
  mockup: MockupKind;
  /** Live product link, if public. */
  url?: string;
  /** App icon / logo inside /public. */
  icon?: string;
  /** Real screenshots inside /public; shown instead of the drawn mockup. */
  screens?: string[];
  /** Frame for `screens` (default phone). */
  device?: ScreenDevice;
  /** Two colors for the project's gradient accents. */
  colors: [string, string];
};

export const projects: Project[] = [
  {
    slug: "shahed",
    name: { ar: "شِهد", en: "Shahed" },
    category: { ar: "تقسيط متوافق مع الشريعة", en: "Sharia-compliant BNPL" },
    tagline: {
      ar: "اشترِ الآن وقسّط براحتك. بدون فوائد.",
      en: "Buy now, pay in installments. Interest-free.",
    },
    summary: {
      ar: "شِهد منصة «اشترِ الآن وادفع لاحقاً» في السوق الأردني، متوافقة مع أحكام الشريعة: بدون فوائد ولا رسوم تأخير، بطلب يأخذ دقيقة وموافقة فورية.",
      en: "Shahed is a buy-now-pay-later platform for the Jordanian market, built on a Sharia-compliant model: no interest, no late fees, a one-minute application and instant approval.",
    },
    challenge: {
      ar: "الناس يريدون التقسيط، لكنهم يتجنّبونه بسبب الفوائد والأوراق والانتظار، والتجار يخسرون مبيعات بسبب ذلك.",
      en: "People want to pay in installments but avoid it because of interest, paperwork and waiting — and merchants lose sales because of it.",
    },
    solution: {
      ar: "بنينا منظومة متكاملة: العميل يقسّط بدون فوائد، والتاجر يستلم قيمة الفاتورة كاملة، والتحصيل على شِهد.",
      en: "We built a complete ecosystem: customers pay in interest-free installments, merchants receive the full invoice amount, and Shahed handles collection.",
    },
    features: [
      { ar: "تطبيق جوال للعملاء", en: "Customer mobile app" },
      { ar: "لوحة تحكم للتجار ونقطة بيع", en: "Merchant dashboard & POS" },
      { ar: "نظام تسوية ومحاسبة", en: "Settlement & accounting" },
      { ar: "تقييم ائتماني آلي", en: "Automated credit scoring" },
      { ar: "قراءة الهوية بالكاميرا", en: "ID scanning with the camera" },
      { ar: "دخول بالبصمة والوجه", en: "Biometric sign-in" },
    ],
    stack: [
      {
        label: { ar: "تطبيق الجوال (iOS و Android من كود واحد)", en: "Mobile app (iOS & Android, one codebase)" },
        items: ["Flutter", "Dart 3.6", "Provider", "Firebase Auth", "Firebase Messaging", "Stripe", "Google ML Kit", "Biometrics", "Deep links"],
      },
      {
        label: { ar: "الخادم", en: "Backend" },
        items: ["NestJS 10", "Node.js", "TypeScript", "TypeORM", "JWT + Passport", "bcrypt", "Swagger", "Throttler"],
      },
    ],
    mockup: "installments",
    colors: ["#2eaa62", "#95cd41"],
    url: "https://shahedapp.com",
    icon: "/projects/shahed/icon.png",
    screens: ["/projects/shahed/screen-1.webp", "/projects/shahed/screen-2.webp"],
  },
  {
    slug: "warshatak",
    name: { ar: "ورشتك", en: "Warshatak" },
    category: { ar: "منصة SaaS لإدارة الورش", en: "Garage management SaaS" },
    tagline: {
      ar: "أدر ورشتك بذكاء، من الاستلام إلى التسليم.",
      en: "Run your garage smartly, from check-in to delivery.",
    },
    summary: {
      ar: "منصة سحابية تشترك فيها ورش السيارات لإدارة كل شيء في مكان واحد: أوامر العمل، الفنيين، المخزون والفواتير.",
      en: "A cloud platform garages subscribe to, managing everything in one place: work orders, technicians, inventory and invoices.",
    },
    challenge: {
      ar: "الورق والهاتف يضيّعان حالة السيارة، ويفتحان باب الخلاف على الأسعار، ولا يوضّحان الأرباح.",
      en: "Paper and phone calls lose track of each car, invite pricing disputes and hide the real profit.",
    },
    solution: {
      ar: "دورة عمل واضحة لا يبدأ فيها التصليح قبل موافقة العميل الرقمية، والعميل يتابع سيارته من جواله.",
      en: "A clear workflow where no repair starts before the customer's digital approval, and customers track their car from their phone.",
    },
    features: [
      { ar: "تتبّع السيارة وإشعارات واتساب", en: "Car tracking & WhatsApp updates" },
      { ar: "موافقة العميل بتوقيع رقمي", en: "Digital customer approval" },
      { ar: "6 أدوار بصلاحيات دقيقة", en: "6 roles, precise permissions" },
      { ar: "مخزون وموردون وأوامر شراء", en: "Inventory, suppliers & POs" },
      { ar: "فواتير وتقارير أرباح", en: "Invoices & profit reports" },
      { ar: "عربي وإنجليزي، ويُثبَّت كتطبيق", en: "Arabic & English, installable app" },
    ],
    stack: [
      {
        label: { ar: "الواجهة", en: "Frontend" },
        items: ["Next.js 16", "React 19", "Tailwind CSS 4", "TanStack Query", "Zustand", "Recharts", "PWA"],
      },
      {
        label: { ar: "الخادم", en: "Backend" },
        items: ["Node.js", "Express", "TypeScript", "Prisma", "PostgreSQL", "Redis + Bull", "Socket.IO", "Zod"],
      },
    ],
    mockup: "dashboard",
    colors: ["#2f8cff", "#0b3fb3"],
    screens: ["/projects/warshatak/dashboard.webp", "/projects/warshatak/login.webp"],
    device: "browser",
  },
  {
    slug: "hader",
    name: { ar: "حاضر", en: "Hader" },
    category: { ar: "موظف خدمة عملاء بالذكاء الاصطناعي", en: "AI customer-service agent" },
    tagline: {
      ar: "يرد على عملائك 24/7، بمعرفة متجرك وحده.",
      en: "Answers your customers 24/7, knowing only your store.",
    },
    summary: {
      ar: "منصة تعطي كل متجر وكيل ذكاء اصطناعي خاص به، يرد على العملاء في واتساب وماسنجر وإنستغرام والمكالمات الصوتية.",
      en: "A platform that gives every store its own AI agent, answering customers on WhatsApp, Messenger, Instagram and voice calls.",
    },
    challenge: {
      ar: "الرسائل تتأخر فيذهب العميل، والردود الآلية العادية تخمّن وتعطي معلومات خاطئة.",
      en: "Slow replies lose customers, and ordinary bots guess and give wrong answers.",
    },
    solution: {
      ar: "وكيل يعرف ما كُتب له فقط: يبحث في الكتالوج ويحسب الأسعار ويسجّل العملاء، وإذا لم يعرف يحوّل لموظف بشري.",
      en: "An agent that only knows what it's given: it searches the catalog, prices orders and captures leads, and hands off to a human when unsure.",
    },
    features: [
      { ar: "واتساب وماسنجر وإنستغرام ومكالمات", en: "WhatsApp, Messenger, Instagram & calls" },
      { ar: "يفهم الفويس ويرد بصوت عربي", en: "Understands voice notes, replies in Arabic voice" },
      { ar: "أسعار حيّة مثل سعر الذهب", en: "Live prices, like today's gold rate" },
      { ar: "تحويل فوري لموظف بشري", en: "Instant handoff to a human" },
      { ar: "بيانات كل متجر معزولة تماماً", en: "Each store's data fully isolated" },
      { ar: "باقات وحدود تُطبَّق فعلياً", en: "Plans & limits enforced in real time" },
    ],
    stack: [
      {
        label: { ar: "المنصة", en: "Platform" },
        items: ["Next.js 15", "React 19", "TypeScript", "PostgreSQL", "Supabase", "Prisma", "Vercel"],
      },
      {
        label: { ar: "الذكاء الاصطناعي والصوت", en: "AI & voice" },
        items: ["Claude (Anthropic)", "Groq", "Whisper", "Orpheus Arabic"],
      },
      {
        label: { ar: "القنوات والأمان", en: "Channels & security" },
        items: ["Meta Cloud API", "AES-256-GCM", "HMAC-SHA256", "PBKDF2"],
      },
    ],
    mockup: "chat",
    colors: ["#34d399", "#0f9f75"],
    screens: ["/projects/hader/platform.webp", "/projects/hader/plans.webp"],
    device: "browser",
  },
  {
    slug: "gold-distribution",
    name: { ar: "إدارة توزيع الذهب", en: "Gold Distribution" },
    category: { ar: "نظام لموزّعي وتجار الذهب", en: "Gold distribution ledger" },
    tagline: {
      ar: "دفتر الذهب، بدقة لا تُخطئ ولا تُمحى.",
      en: "Your gold ledger — precise and tamper-proof.",
    },
    summary: {
      ar: "تطبيق يحوّل دفتر موزّع الذهب الورقي إلى نظام سحابي دقيق: الذهب بالمليجرام، والنقد بالفلس، ورصيد واضح لكل تاجر وزبون.",
      en: "An app that turns a gold distributor's paper ledger into a precise cloud system: gold in milligrams, cash in fils, and a clear balance for every merchant and customer.",
    },
    challenge: {
      ar: "الدفتر الورقي يضيع ويُعدَّل، والكسور الصغيرة تتراكم حتى تصبح غرامات ضائعة، ولا حجة واضحة عند الخلاف.",
      en: "Paper ledgers get lost or altered, tiny fractions add up to lost grams, and there's no solid proof in a dispute.",
    },
    solution: {
      ar: "كل حركة قيد متوازن لا يُحذف ولا يُعدَّل؛ الخطأ يُلغى بقيد عكسي ظاهر، فيبقى الكشف حجة كاملة.",
      en: "Every entry is a balanced record that can't be deleted or edited; mistakes are reversed by a visible counter-entry, so the statement stays solid proof.",
    },
    features: [
      { ar: "دفتر ذهب بالمليجرام ودفتر نقد", en: "Gold (mg) and cash ledgers" },
      { ar: "لا حذف ولا تعديل، قيود عكسية فقط", en: "No edits or deletes, reversals only" },
      { ar: "معاملات العيار لكل موزّع", en: "Per-distributor karat factors" },
      { ar: "بضاعة العرض والمرتجعات", en: "Consignment stock & returns" },
      { ar: "الشيكات حسب الاستحقاق", en: "Cheques by due date" },
      { ar: "التسكير وتثبيت السعر", en: "Price fixing (taskeer)" },
    ],
    stack: [
      { label: { ar: "التطبيق", en: "App" }, items: ["Flutter", "Dart"] },
      { label: { ar: "الخادم وقاعدة البيانات", en: "Backend & database" }, items: ["Supabase", "PostgreSQL", "SQL"] },
    ],
    mockup: "gold",
    colors: ["#d4a94f", "#a8802f"],
    screens: ["/projects/gold/login.webp"],
    device: "tablet",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
