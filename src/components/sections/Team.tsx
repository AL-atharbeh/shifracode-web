"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { tr, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { team } from "@/content/team";
import SplitWords from "@/components/motion/SplitWords";

const STRIPS = 10;

/**
 * Each portrait is cut into vertical strips. Scrolling in, the strips slide
 * together from opposite directions and lock into a face; scrolling on, they
 * split apart again. Hovering pulls the strips apart to show the colour behind.
 */
export default function Team({ lang, dict }: { lang: Locale; dict: Dictionary["team"] }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.utils.toArray<HTMLElement>("[data-member]").forEach((card) => {
        const strips = card.querySelectorAll("[data-strip]");
        const meta = card.querySelectorAll("[data-member-meta]");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 0.8 },
        });
        tl.fromTo(
          strips,
          { yPercent: (i) => (i % 2 ? 110 : -110), scaleY: 0.5, opacity: 0 },
          { yPercent: 0, scaleY: 1, opacity: 1, duration: 0.38, stagger: { each: 0.012, from: "center" } },
          0,
        )
          .fromTo(meta, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.15, stagger: 0.03 }, 0.25)
          .to(
            strips,
            {
              yPercent: (i) => (i % 2 ? -70 : 70),
              rotation: (i) => (i % 2 ? 4 : -4),
              opacity: 0,
              duration: 0.3,
              stagger: { each: 0.012, from: "edges" },
            },
            0.72,
          )
          .to(meta, { opacity: 0, y: -24, duration: 0.12 }, 0.78);
      });
    },
    { scope: section },
  );

  return (
    <section id="team" data-abu="team" ref={section} className="scroll-mt-12 px-6 py-28 sm:py-40">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-[17px] font-semibold text-muted sm:text-[21px]">{dict.eyebrow}</p>
        <SplitWords as="h2" text={dict.title} className="tracking-display mt-2 text-[40px] font-semibold leading-[1.1] sm:text-[72px]" />

        <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
          {team.map((m, i) => (
            <li key={m.initials} data-member className={`group ${i % 2 ? "lg:translate-y-24" : ""}`}>
              <div
                className="relative aspect-square overflow-hidden rounded-[24px]"
                style={{ background: `linear-gradient(160deg, ${m.colors[0]}, ${m.colors[1]})` }}
              >
                {m.photo ? (
                  <div className="absolute inset-0 flex" dir="ltr" aria-label={tr(m.name, lang)} role="img">
                    {Array.from({ length: STRIPS }, (_, s) => (
                      <span key={s} data-strip className="relative h-full flex-1 will-change-transform">
                        <span
                          className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-x-[0.78]"
                          style={{
                            backgroundImage: `url(${m.photo})`,
                            backgroundSize: `${STRIPS * 100}% 100%`,
                            backgroundPosition: `${(s / (STRIPS - 1)) * 100}% 50%`,
                            transitionDelay: `${Math.abs(s - (STRIPS - 1) / 2) * 25}ms`,
                          }}
                        />
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[64px] font-semibold text-white/90" aria-hidden>
                    {m.initials}
                  </span>
                )}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"
                />
                <span aria-hidden className="absolute start-4 top-4 font-mono text-[12px] text-white/70" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 data-member-meta className="tracking-title mt-5 text-[22px] font-semibold sm:text-[26px]">
                {tr(m.name, lang)}
              </h3>
              <p data-member-meta className="mt-1 font-mono text-[12px] uppercase tracking-[0.15em] text-fg/50 sm:text-[13px]">
                {tr(m.role, lang)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
