"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { tr, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { projects } from "@/content/projects";
import ProjectMockup from "@/components/ui/ProjectMockup";
import SplitWords from "@/components/motion/SplitWords";

/** Pinned section whose cards slide sideways as you scroll down (desktop). */
export default function Projects({ lang, dict }: { lang: Locale; dict: Dictionary["projects"] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const dir = lang === "ar" ? 1 : -1;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);

        gsap.to(el, {
          x: () => dir * distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-card-mock]").forEach((mock) => {
          gsap.fromTo(mock, { scale: 0.92 }, { scale: 1, ease: "none", scrollTrigger: { trigger: section.current, start: "top bottom", end: "top top", scrub: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: section, dependencies: [lang] },
  );

  return (
    <section id="projects" data-abu="projects" ref={section} className="scroll-mt-12 overflow-hidden py-24 md:flex md:h-dvh md:flex-col md:justify-center md:py-0">
      <div className="mx-auto w-full max-w-[1024px] px-6">
        <p className="text-[17px] font-semibold text-muted sm:text-[21px]">{dict.eyebrow}</p>
        <SplitWords as="h2" text={dict.title} className="tracking-display mt-2 text-[40px] font-semibold leading-[1.1] sm:text-[72px]" />
      </div>

      <div
        ref={track}
        className="mt-10 flex flex-col gap-6 px-4 sm:px-6 md:mt-12 md:w-max md:flex-row md:ps-[max(1.5rem,calc((100vw_-_1024px)/2_+_1.5rem))] md:pe-[10vw]"
      >
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/${lang}/projects/${p.slug}`}
            data-cursor={dict.view}
            data-transition={tr(p.name, lang)}
            data-skew
            className="glass group block w-full shrink-0 overflow-hidden rounded-[28px] md:w-[min(56vw,680px)]"
          >
            <div data-card-mock className="overflow-hidden">
              <ProjectMockup
                kind={p.mockup}
                icon={p.icon}
                screens={p.screens} device={p.device}
                colors={p.colors}
                lang={lang}
                className="aspect-[4/5] transition-transform sm:aspect-[16/10] duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex items-end justify-between gap-6 p-7">
              <div>
                <p className="text-[14px] font-semibold" style={{ color: p.colors[0] }}>
                  {tr(p.category, lang)}
                </p>
                <h3 className="tracking-title mt-1 text-[28px] font-semibold">{tr(p.name, lang)}</h3>
                <p className="mt-1 text-[17px] text-muted">{tr(p.tagline, lang)}</p>
              </div>
              <span className="shrink-0 whitespace-nowrap text-[15px] text-accent group-hover:underline">
                {dict.view} {lang === "ar" ? "‹" : "›"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
