"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "@/i18n/dictionaries";
import SplitWords from "@/components/motion/SplitWords";

/** Timeline whose line draws itself and lights each step as you scroll. */
export default function Process({ dict }: { dict: Dictionary["process"] }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-line]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-steps]", start: "top 65%", end: "bottom 65%", scrub: true },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
        gsap.fromTo(
          step,
          { opacity: 0.25 },
          {
            opacity: 1,
            duration: 0.4,
            scrollTrigger: { trigger: step, start: "top 65%", toggleActions: "play none none reverse" },
          },
        );
      });
    },
    { scope: section },
  );

  return (
    <section id="process" data-abu="process" ref={section} className="scroll-mt-12 px-6 py-28 sm:py-40">
      <div className="mx-auto max-w-[1024px]">
        <p className="text-[17px] font-semibold text-muted sm:text-[21px]">{dict.eyebrow}</p>
        <SplitWords as="h2" text={dict.title} className="tracking-display mt-2 text-[32px] font-semibold leading-[1.15] sm:text-[72px]" />

        <ol data-steps className="relative mt-16 space-y-16 ps-12 sm:ps-20">
          <span aria-hidden className="absolute bottom-2 start-[15px] top-2 w-px bg-line sm:start-[23px]" />
          <span
            data-line
            aria-hidden
            className="absolute bottom-2 start-[15px] top-2 w-px origin-top bg-gradient-to-b from-[#00d4f5] via-[#1fa0f5] to-[#3f4cf5] sm:start-[23px]"
          />
          {dict.steps.map((step, i) => (
            <li key={step.title} data-step className="relative">
              <span className="absolute -start-12 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-panel-2 text-[13px] font-semibold ring-1 ring-white/15 sm:-start-20 sm:h-12 sm:w-12 sm:text-[17px]">
                {i + 1}
              </span>
              <span
                aria-hidden
                data-parallax="0.25"
                className="text-outline pointer-events-none absolute -top-6 end-0 select-none font-mono text-[90px] font-bold leading-none sm:text-[150px]"
              >
                0{i + 1}
              </span>
              <SplitWords as="h3" text={step.title} className="tracking-title text-[32px] font-semibold sm:text-[56px]" />
              <p className="mt-1 text-[17px] text-muted sm:text-[21px]">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
