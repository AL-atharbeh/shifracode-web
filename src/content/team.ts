import type { Localized } from "@/i18n/config";

export type Member = {
  name: Localized;
  role: Localized;
  initials: string;
  colors: [string, string];
  /** Photo path inside /public; while undefined, an initials avatar is shown. */
  photo?: string;
};

export const team: Member[] = [
  {
    name: { ar: "بشار", en: "Bashar" },
    role: { ar: "المدير التنفيذي ومبرمج", en: "CEO & Developer" },
    initials: "B",
    colors: ["#0a84ff", "#5e5ce6"],
    photo: "/team/bashar-2.webp",
  },
  {
    name: { ar: "أحمد", en: "Ahmad" },
    role: { ar: "مدير الحركات ومبرمج", en: "Motion Director & Developer" },
    initials: "A",
    colors: ["#ff375f", "#ff9f0a"],
    photo: "/team/ahmad-2.webp",
  },
  {
    name: { ar: "محمود", en: "Mahmoud" },
    role: { ar: "مصمم", en: "Designer" },
    initials: "M",
    colors: ["#bf5af2", "#5e5ce6"],
    photo: "/team/mahmoud-2.webp",
  },
  {
    name: { ar: "شهد", en: "Shahd" },
    role: { ar: "مسؤولة السوشال ميديا", en: "Social Media Lead" },
    initials: "S",
    colors: ["#30d158", "#00c7be"],
    photo: "/team/shahd.webp",
  },
];
