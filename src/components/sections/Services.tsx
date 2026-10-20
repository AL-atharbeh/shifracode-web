import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { services } from "@/content/services";
import Reveal from "@/components/ui/Reveal";
import SplitWords from "@/components/motion/SplitWords";

const icons = [
  // Website
  <path key="w" d="M4 6h16v12H4zM4 9h16M7 7.5h.01M9 7.5h.01" />,
  // Mobile
  <path key="m" d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2" />,
  // SaaS / cloud
  <path key="s" d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z" />,
  // AI
  <path key="a" d="M12 3v3M12 18v3M3 12h3M18 12h3M7 7l2 2M15 15l2 2M7 17l2-2M15 9l2-2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />,
  // E-commerce
  <path key="e" d="M5 7h14l-1.5 10h-11zM9 7a3 3 0 0 1 6 0" />,
  // Design
  <path key="d" d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-1.3-1-1.6-1-2.6 0-.8.7-1.3 1.5-1.3H16a5 5 0 0 0 5-5C21 6.5 17 3 12 3zM7.5 12h.01M9.5 8h.01M14.5 8h.01" />,
];

const glows = ["#2997ff", "#a259ff", "#5e5ce6", "#30d158", "#ff9f0a", "#ff375f"];

export default function Services({ lang, dict }: { lang: Locale; dict: Dictionary["services"] }) {
  return (
    <section id="services" data-abu="services" className="scroll-mt-12 px-4 py-28 sm:px-6 sm:py-40">
      <Reveal className="mx-auto max-w-[1024px]">
        <p data-reveal className="text-[17px] font-semibold text-muted sm:text-[21px]">
          {dict.eyebrow}
        </p>
        <SplitWords
          as="h2"
          text={dict.title}
          className="tracking-display mt-2 text-[32px] font-semibold leading-[1.15] sm:text-[72px]"
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dict.items.map((item, i) => (
            <Link
              key={item.title}
              href={`/${lang}/services/${services[i]?.slug ?? ""}`}
              data-reveal
              data-tilt="6"
              data-transition={item.title}
              data-cursor={lang === "ar" ? "اكتشف" : "Explore"}
              className="glass spotlight group relative block overflow-hidden rounded-[28px] p-8 transition-[border-color] duration-500 hover:border-white/20"
            >
              <span
                aria-hidden
                className="absolute end-7 top-7 font-mono text-[13px] text-fg/30 transition-colors duration-500 group-hover:text-fg/70"
              >
                0{i + 1}
              </span>
              <div
                aria-hidden
                className="absolute -end-16 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
                style={{ background: glows[i] }}
              />
              <svg
                viewBox="0 0 24 24"
                className="relative h-10 w-10"
                fill="none"
                stroke={glows[i]}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {icons[i]}
              </svg>
              <h3 className="tracking-title relative mt-10 text-[24px] font-semibold transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                {item.title}
              </h3>
              <p className="relative mt-2 text-[17px] leading-relaxed text-muted">{item.desc}</p>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
