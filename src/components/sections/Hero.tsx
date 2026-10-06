"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "@/i18n/dictionaries";

const AbuOmarCanvas = dynamic(() => import("@/components/abu-omar/AbuOmarCanvas"), { ssr: false });

export default function Hero({ dict }: { dict: Dictionary["hero"] }) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.from("[data-hero-intro]", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.2,
      });

      if (reduce) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            progress.current = self.progress;
          },
        },
      });

      tl.to("[data-hero-title]", { opacity: 0, scale: 1.08, y: -40, ease: "none", duration: 1 })
        .to("[data-hero-hint]", { opacity: 0, duration: 0.3 }, 0)
        .to("[data-hero-glow]", { scale: 1.4, opacity: 0.9, duration: 2 }, 0)
        .fromTo("[data-hero-line='1']", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6 }, 0.7)
        .to("[data-hero-line='1']", { opacity: 0, y: -40, duration: 0.6 }, 1.6)
        .fromTo("[data-hero-line='2']", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6 }, 1.9)
        .to({}, { duration: 0.6 });
    },
    { scope: section },
  );

  return (
    <section ref={section} id="top" data-abu="hero" className="relative h-dvh overflow-hidden bg-ink">
      <div
        data-hero-glow
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[58%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(16,176,240,0.45), rgba(48,64,240,0.3) 50%, transparent 70%)" }}
      />

      <div className="absolute inset-x-0 top-[34%] bottom-0 sm:top-[30%]">
        <AbuOmarCanvas progress={progress} />
      </div>

      <div data-hero-title className="relative z-10 flex flex-col items-center px-6 pt-24 text-center sm:pt-28">
        <p data-hero-intro className="text-[15px] font-medium text-muted sm:text-[17px]">
          {dict.eyebrow}
        </p>
        <h1
          data-hero-intro
          className="tracking-display text-titanium mt-2 text-[56px] font-semibold leading-[1.05] sm:text-[88px] lg:text-[112px]"
        >
          {dict.title}
        </h1>
        <p data-hero-intro className="tracking-title mt-3 text-[21px] font-semibold text-fg sm:text-[28px]">
          {dict.subtitle}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[10%] z-10 px-6 text-center">
        <p data-hero-line="1" className="tracking-title text-[28px] font-semibold opacity-0 sm:text-[48px]">
          {dict.abuLine1}
        </p>
        <p
          data-hero-line="2"
          className="tracking-title text-gradient-brand absolute inset-x-6 top-0 text-[28px] font-semibold opacity-0 sm:text-[48px]"
        >
          {dict.abuLine2}
        </p>
      </div>

      <div data-hero-hint className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2 text-[12px] text-muted">
        <span>{dict.scroll}</span>
        <span className="h-8 w-px animate-pulse bg-gradient-to-b from-muted to-transparent" />
      </div>
    </section>
  );
}
