import type { Localized } from "@/i18n/config";

/**
 * One landing page per service at /[lang]/services/<slug>.
 * Order matches dict.services.items so the home cards can link here.
 * Copy is written for the searches people in Jordan actually type
 * ("تصميم مواقع عمان", "برمجة تطبيقات الأردن"…).
 */

export type Faq = { q: Localized; a: Localized };

export type Service = {
  slug: string;
  name: Localized;
  /** <title> — keyword first, brand added by the layout template. */
  metaTitle: Localized;
  metaDescription: Localized;
  /** H1 on the page. */
  headline: Localized;
  intro: Localized;
  /** What the client gets. */
  includes: Localized[];
  /** Who it's for. */
  audience: Localized[];
  faq: Faq[];
  /** Project slugs to show as proof. */
  related: string[];
  /** Blog post slug that goes deeper on this service. */
  post?: string;
  colors: [string, string];
};

export const services: Service[] = [
  {
    slug: "web-development",
    name: { ar: "تصميم وبرمجة المواقع الإلكترونية", en: "Website Design & Development" },
    metaTitle: {
      ar: "تصميم مواقع إلكترونية في عمّان، الأردن",
      en: "Website Design & Development in Amman, Jordan",
    },
    metaDescription: {
      ar: "شركة تصميم مواقع في عمّان: نصمّم ونبرمج مواقع سريعة ومتجاوبة تظهر في جوجل وتحوّل الزوار إلى عملاء، بالعربي والإنجليزي، مع دعم بعد الإطلاق.",
      en: "Website design company in Amman: fast, responsive, bilingual websites built to rank on Google and turn visitors into customers, with support after launch.",
    },
    headline: {
      ar: "تصميم مواقع إلكترونية في عمّان تظهر في جوجل وتجلب العملاء.",
      en: "Website design in Amman that ranks on Google and brings in customers.",
    },
    intro: {
      ar: "موقعك هو أول ما يراه العميل عندما يبحث عنك. في شيفرا كود نصمّم ونبرمج مواقع سريعة وجميلة تعمل على كل الأجهزة، مكتوبة بالعربي والإنجليزي، ومبنية من اليوم الأول لتظهر في نتائج جوجل. لا نستخدم قوالب جاهزة: كل موقع نبنيه بكود نظيف يناسب نشاطك وجمهورك، مع أزرار واضحة للتواصل عبر واتساب والاتصال حتى يتحوّل الزائر إلى عميل.",
      en: "Your website is the first thing customers see when they search for you. At Shifra Code we design and build fast, beautiful websites that work on every device, in Arabic and English, and are built from day one to show up on Google. No off-the-shelf templates: every site is hand-coded for your business and audience, with clear WhatsApp and call buttons so visitors become customers.",
    },
    includes: [
      { ar: "تصميم واجهات مخصّص لهويتك", en: "Custom design that matches your brand" },
      { ar: "موقع متجاوب مع الجوال والتابلت", en: "Responsive on mobile and tablet" },
      { ar: "دعم العربية والإنجليزية (RTL و LTR)", en: "Arabic and English (RTL and LTR)" },
      { ar: "تهيئة كاملة لمحركات البحث (SEO)", en: "Full search engine optimisation (SEO)" },
      { ar: "سرعة تحميل عالية واستضافة موثوقة", en: "Fast loading and reliable hosting" },
      { ar: "ربط واتساب وخرائط جوجل ونماذج التواصل", en: "WhatsApp, Google Maps and contact forms" },
      { ar: "لوحة لتعديل المحتوى عند الحاجة", en: "Content editing when you need it" },
      { ar: "دعم وصيانة بعد الإطلاق", en: "Support and maintenance after launch" },
    ],
    audience: [
      { ar: "الشركات والمكاتب التي تريد حضوراً احترافياً", en: "Companies and offices that need a professional presence" },
      { ar: "العيادات والمطاعم والمحلات المحلية في عمّان", en: "Clinics, restaurants and local shops in Amman" },
      { ar: "الشركات الناشئة التي تطلق منتجاً جديداً", en: "Startups launching a new product" },
    ],
    faq: [
      {
        q: { ar: "كم تكلفة تصميم موقع إلكتروني في الأردن؟", en: "How much does a website cost in Jordan?" },
        a: {
          ar: "تعتمد التكلفة على عدد الصفحات والمزايا المطلوبة، مثل اللغتين أو الحجز أو المتجر. بعد جلسة قصيرة نفهم فيها مشروعك نعطيك عرض سعر واضحاً ومكتوباً بدون مفاجآت.",
          en: "It depends on the number of pages and the features you need, such as two languages, bookings or a shop. After a short call to understand your project we send a clear written quote with no surprises.",
        },
      },
      {
        q: { ar: "كم يستغرق تصميم الموقع؟", en: "How long does a website take?" },
        a: {
          ar: "المدة تختلف حسب حجم الموقع. نحدد معك جدولاً زمنياً واضحاً قبل البدء، ونشاركك التقدّم أولاً بأول حتى الإطلاق.",
          en: "It depends on the size of the site. We agree a clear timeline with you before we start and share progress at every step until launch.",
        },
      },
      {
        q: { ar: "هل سيظهر موقعي في جوجل؟", en: "Will my website show up on Google?" },
        a: {
          ar: "نعم. نبني كل موقع بتهيئة كاملة لمحركات البحث: عناوين وأوصاف لكل صفحة، خريطة موقع، بيانات منظمة، وسرعة عالية. ونساعدك في ربطه بـ Google Search Console و Google Business Profile.",
          en: "Yes. Every site ships fully optimised for search: titles and descriptions for each page, a sitemap, structured data and fast loading. We also help you connect it to Google Search Console and Google Business Profile.",
        },
      },
      {
        q: { ar: "هل أستطيع تعديل محتوى الموقع بنفسي؟", en: "Can I edit the content myself?" },
        a: {
          ar: "إذا احتجت ذلك نجهّز لك طريقة سهلة لتعديل النصوص والصور، وإذا فضّلت نتولّى نحن التعديلات ضمن خطة الدعم.",
          en: "If you need it, we set up an easy way to edit text and images. If you prefer, we handle updates for you as part of a support plan.",
        },
      },
    ],
    related: ["shahed", "warshatak"],
    post: "website-or-app",
    colors: ["#2997ff", "#00d4f5"],
  },
  {
    slug: "mobile-app-development",
    name: { ar: "برمجة تطبيقات الجوال", en: "Mobile App Development" },
    metaTitle: {
      ar: "برمجة تطبيقات الجوال في الأردن | iOS و Android",
      en: "Mobile App Development in Jordan | iOS & Android",
    },
    metaDescription: {
      ar: "شركة برمجة تطبيقات في عمّان، الأردن: نطوّر تطبيقات iOS و Android سريعة وسهلة الاستخدام، من الفكرة والتصميم حتى النشر على App Store و Google Play.",
      en: "App development company in Amman, Jordan: fast, easy-to-use iOS and Android apps, from idea and design through to publishing on the App Store and Google Play.",
    },
    headline: {
      ar: "برمجة تطبيقات جوال في الأردن، من الفكرة حتى المتجر.",
      en: "Mobile app development in Jordan, from idea to app store.",
    },
    intro: {
      ar: "عندما يعود عملاؤك إليك بشكل متكرر، يصبح التطبيق أقرب طريق إليهم: إشعارات فورية، دخول بالبصمة، ودفع بضغطة. نطوّر في شيفرا كود تطبيقات iOS و Android بتجربة سلسة وأداء عالٍ، ونتولّى كل المراحل: تحليل الفكرة، تصميم الشاشات، البرمجة، لوحة التحكم الخلفية، والنشر على المتاجر. تطبيق «شِهد» للتقسيط مثال على ما نبنيه.",
      en: "When customers come back to you often, an app is the shortest path to them: instant notifications, biometric sign-in and one-tap payments. At Shifra Code we build iOS and Android apps with a smooth experience and strong performance, and we handle every stage: shaping the idea, screen design, development, the admin back-end and store publishing. Our Shahed instalments app is one example.",
    },
    includes: [
      { ar: "تطبيق واحد يعمل على iOS و Android", en: "One app for both iOS and Android" },
      { ar: "تصميم شاشات UI/UX قبل البرمجة", en: "UI/UX screen design before development" },
      { ar: "لوحة تحكم وخادم (Backend) لإدارة التطبيق", en: "Admin dashboard and back-end" },
      { ar: "إشعارات فورية ودفع إلكتروني", en: "Push notifications and online payments" },
      { ar: "دخول بالبصمة والوجه وقراءة الهوية", en: "Biometric sign-in and ID scanning" },
      { ar: "النشر على App Store و Google Play", en: "Publishing on the App Store and Google Play" },
      { ar: "تحديثات ودعم بعد الإطلاق", en: "Updates and support after launch" },
    ],
    audience: [
      { ar: "المطاعم وشركات التوصيل والمتاجر", en: "Restaurants, delivery companies and shops" },
      { ar: "الشركات الناشئة والمنصات المالية", en: "Startups and fintech platforms" },
      { ar: "أي خدمة يعود إليها العميل أسبوعياً أو يومياً", en: "Any service customers use weekly or daily" },
    ],
    faq: [
      {
        q: { ar: "كم تكلفة برمجة تطبيق في الأردن؟", en: "How much does an app cost in Jordan?" },
        a: {
          ar: "تعتمد التكلفة على عدد الشاشات والمزايا مثل الدفع والإشعارات ولوحة التحكم. نبدأ بجلسة نفهم فيها الفكرة، ثم نرسل لك عرض سعر مفصّلاً.",
          en: "It depends on the number of screens and features like payments, notifications and the admin dashboard. We start with a call to understand the idea, then send a detailed quote.",
        },
      },
      {
        q: { ar: "هل أحتاج تطبيقاً أم يكفيني موقع؟", en: "Do I need an app or is a website enough?" },
        a: {
          ar: "إذا كان عميلك يزورك مرة أو مرتين فالموقع يكفي غالباً. وإذا كان يعود بشكل متكرر أو تحتاج الكاميرا والإشعارات فالتطبيق أفضل. كتبنا عن ذلك دليلاً كاملاً في المدونة.",
          en: "If customers visit once or twice, a website is usually enough. If they come back often, or you need the camera and notifications, an app is the better fit. We wrote a full guide on this in our blog.",
        },
      },
      {
        q: { ar: "هل تنشرون التطبيق على المتاجر؟", en: "Do you publish the app to the stores?" },
        a: {
          ar: "نعم، نتولّى تجهيز التطبيق ورفعه على App Store و Google Play ومتابعة المراجعة حتى يُنشر.",
          en: "Yes. We prepare the app, submit it to the App Store and Google Play, and follow the review until it's live.",
        },
      },
      {
        q: { ar: "من يملك الكود بعد التسليم؟", en: "Who owns the code after delivery?" },
        a: {
          ar: "أنت. نسلّمك الكود وحسابات المتاجر باسمك، ونبقى معك للدعم والتطوير.",
          en: "You do. We hand over the code and store accounts in your name, and stay on for support and new features.",
        },
      },
    ],
    related: ["shahed", "gold-distribution"],
    post: "website-or-app",
    colors: ["#a259ff", "#5e5ce6"],
  },
  {
    slug: "saas-development",
    name: { ar: "برمجة أنظمة SaaS", en: "SaaS Development" },
    metaTitle: {
      ar: "برمجة أنظمة SaaS وأنظمة إدارة الأعمال في الأردن",
      en: "SaaS & Business Systems Development in Jordan",
    },
    metaDescription: {
      ar: "نبني أنظمة SaaS سحابية وأنظمة إدارة مخصّصة للشركات في الأردن: إدارة الطلبات والمخزون والفواتير والموظفين في مكان واحد، بدل الدفاتر والإكسل.",
      en: "We build cloud SaaS platforms and custom management systems for businesses in Jordan: orders, inventory, invoices and staff in one place, instead of paper and spreadsheets.",
    },
    headline: {
      ar: "أنظمة SaaS وأنظمة إدارة تنظّم عملك في مكان واحد.",
      en: "SaaS and business systems that run your work from one place.",
    },
    intro: {
      ar: "الدفتر الورقي والإكسل يكفيان في البداية، لكن مع نمو العمل تضيع الطلبات وتختلط الحسابات. نبني في شيفرا كود أنظمة سحابية تعمل من المتصفح على أي جهاز: لإدارة الورش والمخازن والفواتير والموظفين، أو منصات اشتراك (SaaS) تبيعها لعملائك. منصة «ورشتك» لإدارة ورش السيارات ونظام توزيع الذهب من أعمالنا في هذا المجال.",
      en: "Paper and spreadsheets are fine at the start, but as you grow, orders get lost and the numbers stop adding up. At Shifra Code we build cloud systems that run in the browser on any device: for managing workshops, stock, invoices and staff, or subscription (SaaS) platforms you sell to your own customers. Warshatak, our garage management platform, and our gold distribution system are examples.",
    },
    includes: [
      { ar: "تحليل سير العمل الحالي وتصميم النظام حوله", en: "Mapping your workflow and designing around it" },
      { ar: "لوحة تحكم وتقارير لحظية", en: "Dashboards and live reports" },
      { ar: "صلاحيات للموظفين والفروع", en: "Roles and permissions for staff and branches" },
      { ar: "فواتير ومخزون ومحاسبة", en: "Invoicing, inventory and accounting" },
      { ar: "اشتراكات ودفع إلكتروني لمنصات SaaS", en: "Subscriptions and billing for SaaS platforms" },
      { ar: "نسخ احتياطي وحماية للبيانات", en: "Backups and data security" },
      { ar: "ربط مع واتساب والأنظمة الأخرى", en: "Integration with WhatsApp and other systems" },
    ],
    audience: [
      { ar: "المصانع والمخازن وشركات التوزيع", en: "Factories, warehouses and distributors" },
      { ar: "الكراجات ومحلات الذهب والعيادات", en: "Garages, gold shops and clinics" },
      { ar: "رواد الأعمال الذين يريدون إطلاق منصة اشتراك", en: "Founders launching a subscription platform" },
    ],
    faq: [
      {
        q: { ar: "ما الفرق بين نظام مخصّص ونظام جاهز؟", en: "Custom system or off-the-shelf software?" },
        a: {
          ar: "النظام الجاهز يجبرك على تغيير طريقة عملك لتناسبه. النظام المخصّص يُبنى حول طريقة عملك أنت، ويكبر معك عندما تضيف فرعاً أو خدمة جديدة.",
          en: "Off-the-shelf software makes you change how you work to fit it. A custom system is built around how you already work, and grows with you when you add a branch or service.",
        },
      },
      {
        q: { ar: "هل يعمل النظام على الجوال؟", en: "Does the system work on mobile?" },
        a: {
          ar: "نعم، أنظمتنا تعمل من المتصفح على الكمبيوتر والتابلت والجوال، ويمكن إضافة تطبيق جوال عند الحاجة.",
          en: "Yes. Our systems run in the browser on desktop, tablet and phone, and we can add a mobile app when needed.",
        },
      },
      {
        q: { ar: "هل بياناتي آمنة؟", en: "Is my data safe?" },
        a: {
          ar: "نستضيف الأنظمة على خوادم سحابية موثوقة مع نسخ احتياطي منتظم وصلاحيات دقيقة لكل مستخدم، وبياناتك ملكك بالكامل.",
          en: "We host on reliable cloud servers with regular backups and fine-grained permissions per user, and your data stays entirely yours.",
        },
      },
      {
        q: { ar: "كيف أعرف أن مشروعي يحتاج نظاماً؟", en: "How do I know I need a system?" },
        a: {
          ar: "إذا كنت تضيّع وقتاً في البحث عن الطلبات أو تخطئ في الحسابات أو لا تعرف أرقامك اليومية، فالوقت حان. كتبنا خمس علامات واضحة لذلك في المدونة.",
          en: "If you lose time hunting for orders, make mistakes in the numbers, or don't know your daily figures, it's time. We wrote up five clear signs on our blog.",
        },
      },
    ],
    related: ["warshatak", "gold-distribution"],
    post: "signs-you-need-a-system",
    colors: ["#5e5ce6", "#2997ff"],
  },
  {
    slug: "ai-whatsapp-agents",
    name: { ar: "وكلاء واتساب بالذكاء الاصطناعي", en: "AI WhatsApp Agents" },
    metaTitle: {
      ar: "وكيل واتساب بالذكاء الاصطناعي لخدمة العملاء في الأردن",
      en: "AI WhatsApp Agents for Customer Service in Jordan",
    },
    metaDescription: {
      ar: "موظف خدمة عملاء بالذكاء الاصطناعي يرد على عملائك في واتساب وإنستغرام 24/7 باللهجة الأردنية، يعرف منتجاتك وأسعارك، ويحوّل المحادثة لموظف عند الحاجة.",
      en: "An AI customer service agent that answers your customers on WhatsApp and Instagram 24/7, knows your products and prices, and hands over to a person when needed.",
    },
    headline: {
      ar: "وكيل واتساب بالذكاء الاصطناعي يرد على عملائك 24/7.",
      en: "An AI WhatsApp agent that answers your customers 24/7.",
    },
    intro: {
      ar: "كل رسالة لا يُرد عليها بسرعة هي عميل قد يذهب لغيرك. نبني في شيفرا كود وكلاء ذكاء اصطناعي يردّون على عملائك في واتساب وإنستغرام ليلاً ونهاراً، باللهجة التي يكتب بها العميل، ويعرفون منتجاتك وأسعارك وساعات عملك. يستقبل الوكيل الطلبات ويحجز المواعيد، وعندما يحتاج العميل موظفاً بشرياً يحوّله فوراً. «حاضر» هو منتجنا في هذا المجال، و«أبو عمر» على موقعنا مثال حيّ.",
      en: "Every message that isn't answered quickly is a customer who might go elsewhere. At Shifra Code we build AI agents that answer your customers on WhatsApp and Instagram day and night, in the way the customer writes, and that know your products, prices and opening hours. The agent takes orders and books appointments, and hands over to a person the moment a customer needs one. Hader is our product here, and Abu Omar on our own site is a live example.",
    },
    includes: [
      { ar: "ربط رسمي مع WhatsApp Business", en: "Official WhatsApp Business integration" },
      { ar: "تدريب الوكيل على منتجاتك وأسعارك فقط", en: "Trained only on your products and prices" },
      { ar: "ردود باللهجة الأردنية والعربية الفصحى والإنجليزية", en: "Replies in Jordanian Arabic, standard Arabic and English" },
      { ar: "استقبال الطلبات وحجز المواعيد", en: "Order taking and appointment booking" },
      { ar: "تحويل المحادثة لموظف بشري عند الحاجة", en: "Handover to a human when needed" },
      { ar: "لوحة لمتابعة المحادثات والإحصائيات", en: "Dashboard for conversations and stats" },
    ],
    audience: [
      { ar: "المتاجر والمطاعم التي تستقبل طلبات على واتساب", en: "Shops and restaurants taking orders on WhatsApp" },
      { ar: "العيادات ومراكز الحجز", en: "Clinics and booking-based businesses" },
      { ar: "أي نشاط يصله عدد كبير من الرسائل يومياً", en: "Any business with a high volume of daily messages" },
    ],
    faq: [
      {
        q: { ar: "هل يفهم الوكيل اللهجة الأردنية؟", en: "Does the agent understand Jordanian Arabic?" },
        a: {
          ar: "نعم، يفهم العامية الأردنية والفصحى والإنجليزية، ويرد بنفس أسلوب العميل.",
          en: "Yes. It understands Jordanian dialect, standard Arabic and English, and replies in the customer's own style.",
        },
      },
      {
        q: { ar: "ماذا لو سأل العميل سؤالاً لا يعرفه الوكيل؟", en: "What if a customer asks something it doesn't know?" },
        a: {
          ar: "لا يخترع الوكيل إجابات. يرد فقط من معلومات نشاطك، وإذا لم يجد الجواب يحوّل المحادثة لموظف من فريقك.",
          en: "It doesn't make answers up. It only answers from your business information, and if it can't find the answer it passes the chat to someone on your team.",
        },
      },
      {
        q: { ar: "هل أحتاج رقم واتساب جديداً؟", en: "Do I need a new WhatsApp number?" },
        a: {
          ar: "يعمل الوكيل على رقم WhatsApp Business، وغالباً يمكن استخدام رقمك الحالي. نساعدك في الإعداد خطوة بخطوة.",
          en: "The agent runs on a WhatsApp Business number, and you can usually keep your current one. We guide you through setup step by step.",
        },
      },
      {
        q: { ar: "هل يعمل على إنستغرام أيضاً؟", en: "Does it work on Instagram too?" },
        a: {
          ar: "نعم، يمكن ربط الوكيل نفسه برسائل إنستغرام حتى تكون الردود موحّدة في كل القنوات.",
          en: "Yes. The same agent can answer Instagram messages, so replies are consistent on every channel.",
        },
      },
    ],
    related: ["hader"],
    post: "whatsapp-ai-agent",
    colors: ["#30d158", "#00d4f5"],
  },
  {
    slug: "ecommerce-development",
    name: { ar: "تصميم المتاجر الإلكترونية", en: "E-commerce Development" },
    metaTitle: {
      ar: "تصميم متجر إلكتروني في الأردن بالدفع الإلكتروني",
      en: "E-commerce Store Development in Jordan",
    },
    metaDescription: {
      ar: "نصمّم متاجر إلكترونية متكاملة في الأردن: عرض المنتجات، سلة شراء، دفع إلكتروني، إدارة الطلبات والتوصيل، ولوحة تحكم سهلة لصاحب المتجر.",
      en: "Complete online stores for businesses in Jordan: product catalogue, cart, online payments, order and delivery management, and an easy admin for the owner.",
    },
    headline: {
      ar: "متجر إلكتروني متكامل يبيع عنك ليلاً ونهاراً.",
      en: "A complete online store that sells for you day and night.",
    },
    intro: {
      ar: "المتجر الإلكتروني يفتح لك السوق كله، لا الحي الذي فيه محلك فقط. نبني في شيفرا كود متاجر سريعة وسهلة الشراء، فيها دفع إلكتروني ودفع عند الاستلام، وإدارة للمخزون والطلبات والتوصيل، ولوحة تحكم واضحة تضيف منها منتجاتك وتتابع مبيعاتك. ونربط المتجر بواتساب حتى يصلك كل طلب فوراً.",
      en: "An online store opens up the whole market, not just the neighbourhood around your shop. At Shifra Code we build fast, easy-to-buy-from stores with online payment and cash on delivery, stock, order and delivery management, and a clear admin where you add products and track sales. We connect the store to WhatsApp so every order reaches you instantly.",
    },
    includes: [
      { ar: "تصميم متجر يعكس هوية علامتك", en: "Store design that reflects your brand" },
      { ar: "دفع إلكتروني ودفع عند الاستلام", en: "Online payment and cash on delivery" },
      { ar: "إدارة المنتجات والمخزون والعروض", en: "Products, stock and promotions" },
      { ar: "تتبّع الطلبات والتوصيل", en: "Order and delivery tracking" },
      { ar: "تنبيهات الطلبات على واتساب", en: "Order alerts on WhatsApp" },
      { ar: "تهيئة المنتجات لمحركات البحث", en: "Product pages optimised for search" },
    ],
    audience: [
      { ar: "المحلات التي تريد البيع أونلاين", en: "Shops ready to sell online" },
      { ar: "العلامات التجارية المحلية والمنتجات المنزلية", en: "Local brands and home businesses" },
      { ar: "تجار الجملة والموزّعون", en: "Wholesalers and distributors" },
    ],
    faq: [
      {
        q: { ar: "ما طرق الدفع المتاحة في المتجر؟", en: "Which payment methods can the store take?" },
        a: {
          ar: "نربط المتجر ببوابات الدفع الإلكتروني المتاحة في الأردن، إضافة إلى الدفع عند الاستلام، حسب ما يناسب نشاطك.",
          en: "We connect the store to payment gateways available in Jordan, plus cash on delivery, depending on what suits your business.",
        },
      },
      {
        q: { ar: "هل أستطيع إضافة المنتجات بنفسي؟", en: "Can I add products myself?" },
        a: {
          ar: "نعم، لوحة التحكم مصمّمة لتكون سهلة: تضيف المنتج وصوره وسعره في دقائق.",
          en: "Yes. The admin is built to be simple: add a product with photos and a price in minutes.",
        },
      },
      {
        q: { ar: "هل يمكن ربط المتجر بشركة توصيل؟", en: "Can the store connect to a delivery company?" },
        a: {
          ar: "نعم، يمكن ربط الطلبات بشركة التوصيل التي تتعامل معها أو بنظام توصيل خاص بك.",
          en: "Yes. Orders can flow to the delivery company you work with, or to your own delivery system.",
        },
      },
      {
        q: { ar: "هل يمكن البيع بالتقسيط؟", en: "Can customers pay in instalments?" },
        a: {
          ar: "نعم، يمكن إضافة خيار التقسيط عبر منصات مثل «شِهد» التي بنيناها للسوق الأردني.",
          en: "Yes. Instalments can be added through platforms like Shahed, which we built for the Jordanian market.",
        },
      },
    ],
    related: ["shahed", "hader"],
    colors: ["#ff9f0a", "#ff375f"],
  },
  {
    slug: "ui-ux-design",
    name: { ar: "تصميم واجهات UI/UX والهوية البصرية", en: "UI/UX & Brand Design" },
    metaTitle: {
      ar: "تصميم واجهات UI/UX وهوية بصرية في عمّان",
      en: "UI/UX & Brand Identity Design in Amman",
    },
    metaDescription: {
      ar: "نصمّم واجهات مواقع وتطبيقات سهلة الاستخدام وهويات بصرية لا تُنسى للشركات في الأردن: شعار، ألوان، خطوط، وتصاميم شاشات جاهزة للبرمجة.",
      en: "Easy-to-use website and app interfaces and memorable brand identities for businesses in Jordan: logo, colours, type and developer-ready screen designs.",
    },
    headline: {
      ar: "تصميم واجهات وهوية بصرية تجعل علامتك لا تُنسى.",
      en: "Interface and brand design that makes you unforgettable.",
    },
    intro: {
      ar: "التصميم الجيد ليس شكلاً جميلاً فقط، بل طريق واضح يوصل العميل لما يريد بأقل عدد من الضغطات. نصمّم في شيفرا كود واجهات المواقع والتطبيقات والأنظمة، ونبني الهويات البصرية من الشعار والألوان والخطوط حتى تصاميم السوشال ميديا، بحيث تبدو علامتك متناسقة في كل مكان.",
      en: "Good design isn't just looking nice; it's a clear path that gets customers where they want to go in as few taps as possible. At Shifra Code we design website, app and system interfaces, and build brand identities from logo, colours and type through to social media templates, so your brand looks consistent everywhere.",
    },
    includes: [
      { ar: "بحث تجربة المستخدم ورسم رحلة العميل", en: "UX research and customer journeys" },
      { ar: "نماذج أولية تفاعلية قبل البرمجة", en: "Interactive prototypes before development" },
      { ar: "تصميم شاشات المواقع والتطبيقات", en: "Website and app screen design" },
      { ar: "شعار وهوية بصرية كاملة", en: "Logo and full visual identity" },
      { ar: "دليل استخدام الهوية (Brand Guidelines)", en: "Brand guidelines" },
      { ar: "قوالب للسوشال ميديا", en: "Social media templates" },
    ],
    audience: [
      { ar: "المشاريع الجديدة التي تبني علامتها من الصفر", en: "New businesses building a brand from scratch" },
      { ar: "الشركات التي تريد تجديد شكلها", en: "Companies refreshing their look" },
      { ar: "فرق التطوير التي تحتاج تصاميم جاهزة", en: "Dev teams that need ready designs" },
    ],
    faq: [
      {
        q: { ar: "هل تصمّمون فقط أم تبرمجون أيضاً؟", en: "Do you only design, or build too?" },
        a: {
          ar: "الاثنان. يمكنك طلب التصميم وحده، أو المشروع كاملاً من التصميم حتى البرمجة والإطلاق مع نفس الفريق.",
          en: "Both. You can order design on its own, or the whole project from design to development and launch with the same team.",
        },
      },
      {
        q: { ar: "ماذا أستلم في نهاية تصميم الهوية؟", en: "What do I receive for a brand identity?" },
        a: {
          ar: "تستلم الشعار بكل الصيغ، لوحة الألوان والخطوط، ودليل استخدام يشرح كيف تُستخدم الهوية في المطبوعات والسوشال ميديا.",
          en: "You receive the logo in every format, the colour palette and fonts, and a guide showing how to use the identity in print and on social media.",
        },
      },
      {
        q: { ar: "هل أستطيع طلب تعديلات؟", en: "Can I ask for revisions?" },
        a: {
          ar: "نعم، نعمل معك على مراحل ونعرض عليك التصاميم أولاً بأول، والتعديلات جزء من العمل.",
          en: "Yes. We work in stages, show you designs as we go, and revisions are part of the process.",
        },
      },
    ],
    related: ["shahed", "warshatak"],
    colors: ["#ff375f", "#a259ff"],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
