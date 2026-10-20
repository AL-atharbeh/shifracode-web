"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import SplitWords from "@/components/motion/SplitWords";
import VelocityMarquee from "@/components/motion/VelocityMarquee";

/** A word that flips to the next one every couple of seconds. */
function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const box = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      gsap.to(box.current, {
        yPercent: -110,
        rotate: -4,
        duration: 0.45,
        ease: "power3.in",
        onComplete: () => {
          setI((v) => (v + 1) % words.length);
          gsap.fromTo(box.current, { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 0.7, ease: "expo.out" });
        },
      });
    }, 2400);
    return () => window.clearInterval(id);
  }, [words.length]);

  return (
    <span className="relative -my-[0.25em] inline-flex overflow-hidden px-1 py-[0.25em] align-baseline">
      <span ref={box} className="text-gradient-brand inline-block">
        {words[i]}
      </span>
    </span>
  );
}

const chips = [
  { text: "</>", className: "start-[8%] top-[22%]", depth: 40 },
  { text: "AI", className: "end-[10%] top-[28%]", depth: 70 },
  { text: "iOS · Android", className: "start-[12%] bottom-[34%]", depth: 55 },
  { text: "SaaS", className: "end-[14%] bottom-[38%]", depth: 30 },
];

export default function Hero({ lang, dict }: { lang: Locale; dict: Dictionary["hero"] }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Content and chips fly in once the preloader/curtain lifts.
      gsap.set("[data-hero-fade], [data-chip]", { opacity: 0 });
      const intro = () => {
        gsap.fromTo(
          "[data-hero-fade]",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.1, delay: 0.7 },
        );
        gsap.fromTo(
          "[data-chip]",
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 1, duration: 1.2, ease: "back.out(2)", stagger: 0.12, delay: 1 },
        );
      };
      window.addEventListener("sc:enter", intro, { once: true });

      // Scrolling away: the headline grows, blurs and dissolves into the background.
      gsap.to("[data-hero-content]", {
        scale: 1.15,
        opacity: 0,
        filter: "blur(14px)",
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-marquee]", {
        yPercent: -60,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
      });

      // Mouse parallax: layers with a larger depth travel further.
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]").map((el) => ({
        depth: parseFloat(el.dataset.depth!),
        x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3" }),
      }));
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        layers.forEach((l) => {
          l.x(nx * l.depth);
          l.y(ny * l.depth);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("sc:enter", intro);
      };
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="top"
      data-abu="hero"
      className="relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden"
    >
      {chips.map((c) => (
        <div key={c.text} data-depth={c.depth} className={`pointer-events-none absolute hidden md:block ${c.className}`}>
          <span
            data-chip
            dir="ltr"
            className="block rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[14px] text-fg/70 shadow-[0_0_40px_rgba(34,170,245,0.15)] backdrop-blur-md"
          >
            {c.text}
          </span>
        </div>
      ))}

      <div data-hero-content className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pt-16 text-center">
        <p
          data-hero-fade
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[13px] text-fg/80 backdrop-blur-md sm:text-[14px]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#30d158]" />
            <span className="relative h-2 w-2 rounded-full bg-[#30d158]" />
          </span>
          {dict.available}
          <span className="text-fg/30">·</span>
          <span className="text-muted">{dict.eyebrow}</span>
        </p>

        <div data-depth="-18">
          <SplitWords
            as="h1"
            mode="load"
            text={dict.title}
            chars={lang === "en"}
            className="split-titanium tracking-display mt-5 text-[clamp(64px,15vw,220px)] font-bold leading-[1.05]"
          />
        </div>

        <p data-hero-fade className="tracking-title mt-4 text-[26px] font-semibold sm:text-[40px]">
          {dict.rotatingPrefix} <RotatingWord words={dict.rotating} />
        </p>

        <p data-hero-fade className="mt-3 max-w-[560px] text-[16px] leading-relaxed text-fg/60 sm:text-[19px]">
          {dict.lead}
        </p>

        <div data-hero-fade className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`/${lang}#contact`}
            data-magnetic="0.4"
            className="group relative overflow-hidden rounded-full bg-fg px-8 py-4 text-[16px] font-semibold text-black"
          >
            <span className="absolute inset-0 translate-y-full rounded-full bg-gradient-to-r from-[#00d4f5] to-[#3f4cf5] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-y-0" />
            <span className="relative transition-colors duration-500 group-hover:text-white">{dict.ctaPrimary}</span>
          </a>
          <a
            href={`/${lang}#projects`}
            data-magnetic="0.4"
            className="rounded-full border border-white/20 bg-white/[0.04] px-8 py-4 text-[16px] font-semibold backdrop-blur-md transition hover:border-white/50"
          >
            {dict.ctaSecondary}
          </a>
        </div>
      </div>

      <div data-hero-marquee className="relative z-0 pb-4 sm:pb-6">
        <VelocityMarquee speed={0.6} className="select-none">
          {dict.marquee.map((word) => (
            <span
              key={word}
              className="text-outline flex items-center gap-8 pe-8 text-[clamp(48px,9vw,140px)] font-bold leading-[1.3]"
            >
              {word}
              <span className="text-[0.4em] text-accent [-webkit-text-stroke:0]">✦</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </section>
  );
}
