"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { tr, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { projects, type ScreenDevice } from "@/content/projects";
import SplitWords from "@/components/motion/SplitWords";

/** Screenshot proportions per frame, so the tiles never stretch the image. */
const ASPECT: Record<ScreenDevice, number> = { phone: 640 / 1390, browser: 1400 / 710, tablet: 1200 / 708 };
const GRID: Record<ScreenDevice, [number, number]> = { phone: [4, 8], browser: [8, 4], tablet: [7, 4] };

/** Deterministic noise so every tile flies its own way, identically on each run. */
const noise = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return s - Math.floor(s) - 0.5;
};

/**
 * A pinned stage. Each project's screenshot is cut into tiles that fly in
 * from every direction and lock into place; as you scroll on, it shatters
 * outwards and the next project assembles from the debris.
 */
export default function Projects({ lang, dict }: { lang: Locale; dict: Dictionary["projects"] }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const groups = gsap.utils.toArray<HTMLElement>("[data-work]");
      const texts = gsap.utils.toArray<HTMLElement>("[data-work-text]");
      const marks = gsap.utils.toArray<HTMLElement>("[data-work-index]");

      const activate = (i: number) =>
        marks.forEach((m, j) => m.classList.toggle("is-active", i === j));

      if (reduce) {
        gsap.set(groups.slice(1), { autoAlpha: 0 });
        gsap.set(texts.slice(1), { autoAlpha: 0 });
        activate(0);
        return;
      }

      const scatter = (tile: Element, i: number) => {
        const k = Number((tile as HTMLElement).dataset.k);
        return {
          x: noise(i, k) * window.innerWidth * 1.1,
          y: noise(i, k + 1) * window.innerHeight * 1.1,
          z: 200 + Math.abs(noise(i, k + 2)) * 600,
          rotation: noise(i, k + 3) * 140,
          rotationX: noise(i, k + 4) * 180,
          rotationY: noise(i, k + 5) * 180,
          scale: 0.4,
          opacity: 0,
        };
      };
      const home = { x: 0, y: 0, z: 0, rotation: 0, rotationX: 0, rotationY: 0, scale: 1, opacity: 1 };

      gsap.set(groups, { autoAlpha: 1 });
      gsap.set(texts, { autoAlpha: 0 });
      groups.forEach((g, gi) => {
        g.querySelectorAll("[data-tile]").forEach((t, ti) => gsap.set(t, scatter(t, ti + gi * 97)));
        gsap.set(g.querySelector("[data-work-frame]"), { opacity: 0 });
        g.style.pointerEvents = "none";
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${projects.length * window.innerHeight * 1.2}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => activate(Math.min(projects.length - 1, Math.floor(self.progress * projects.length))),
        },
      });

      groups.forEach((g, gi) => {
        const tiles = gsap.utils.toArray<HTMLElement>(g.querySelectorAll("[data-tile]"));
        const frame = g.querySelector("[data-work-frame]");
        const t0 = gi * 2;

        tl.to(tiles, { ...home, duration: 1, stagger: { amount: 0.5, from: "random" } }, t0)
          .to(frame, { opacity: 1, duration: 0.3 }, t0 + 1.1)
          .set(g, { pointerEvents: "auto" }, t0 + 1)
          .fromTo(texts[gi], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, t0 + 0.6);

        if (gi < groups.length - 1) {
          tl.set(g, { pointerEvents: "none" }, t0 + 1.8)
            .to(frame, { opacity: 0, duration: 0.2 }, t0 + 1.8)
            .to(texts[gi], { autoAlpha: 0, y: -40, duration: 0.3, ease: "power3.in" }, t0 + 1.8)
            .to(tiles, { ...tileOut(tiles, gi), duration: 1, stagger: { amount: 0.5, from: "center" } }, t0 + 1.85);
        } else {
          tl.to({}, { duration: 0.8 });
        }
      });

      function tileOut(tiles: HTMLElement[], gi: number) {
        return {
          x: (i: number) => scatter(tiles[i], i + gi * 97 + 31).x,
          y: (i: number) => scatter(tiles[i], i + gi * 97 + 31).y,
          z: (i: number) => scatter(tiles[i], i + gi * 97 + 31).z,
          rotation: (i: number) => scatter(tiles[i], i + gi * 97 + 31).rotation,
          rotationX: (i: number) => scatter(tiles[i], i + gi * 97 + 31).rotationX,
          rotationY: (i: number) => scatter(tiles[i], i + gi * 97 + 31).rotationY,
          scale: 0.4,
          opacity: 0,
        };
      }
    },
    { scope: section, dependencies: [lang] },
  );

  return (
    <section
      id="projects"
      data-abu="projects"
      ref={section}
      className="relative scroll-mt-12 overflow-hidden md:h-dvh motion-safe:h-dvh"
    >
      <div className="mx-auto grid h-full max-w-[1200px] grid-rows-[auto_1fr_auto] gap-4 px-6 pb-8 pt-20 md:grid-cols-[5fr_7fr] md:grid-rows-[auto_1fr] md:gap-10 md:pt-24">
        {/* Heading + project index. */}
        <div className="md:row-span-2 md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-muted sm:text-[19px]">{dict.eyebrow}</p>
            <SplitWords as="h2" text={dict.title} className="tracking-display mt-1 text-[32px] font-semibold leading-[1.1] sm:text-[52px]" />
          </div>

          {/* Current project's copy; the timeline swaps them. */}
          <div className="relative mt-6 hidden min-h-[230px] md:block">
            {projects.map((p, i) => (
              <ProjectText key={p.slug} p={p} i={i} lang={lang} view={dict.view} />
            ))}
          </div>

          <ol className="mt-4 hidden gap-5 font-mono text-[12px] md:flex" dir="ltr">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <Link
                  href={`/${lang}/projects/${p.slug}`}
                  data-work-index
                  data-transition={tr(p.name, lang)}
                  className="work-index block border-t border-white/15 pt-2 text-fg/40 transition-colors hover:text-fg"
                >
                  {String(i + 1).padStart(2, "0")}
                </Link>
              </li>
            ))}
          </ol>
        </div>

        {/* The tile stage. */}
        <div className="relative min-h-0 [container-type:size] [perspective:1400px] md:row-span-2">
          {projects.map((p) => {
            const device = p.device ?? "phone";
            const [cols, rows] = GRID[device];
            const ar = ASPECT[device];
            const src = p.screens?.[0];
            const box: CSSProperties = { width: `min(100cqw, calc(100cqh * ${ar}))`, aspectRatio: String(ar) };
            return (
              <Link
                key={p.slug}
                href={`/${lang}/projects/${p.slug}`}
                data-work
                data-cursor={dict.view}
                data-transition={tr(p.name, lang)}
                aria-label={`${tr(p.name, lang)} — ${dict.view}`}
                className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d] motion-reduce:[&:not(:first-child)]:hidden"
              >
                <span className="relative block [transform-style:preserve-3d]" style={box}>
                  <span
                    aria-hidden
                    className="absolute -inset-[12%] -z-10 rounded-full opacity-50 blur-[80px]"
                    style={{ background: `radial-gradient(circle, ${p.colors[0]}88, ${p.colors[1]}33 60%, transparent 75%)` }}
                  />
                  {src &&
                    Array.from({ length: cols * rows }, (_, k) => {
                      const c = k % cols;
                      const r = Math.floor(k / cols);
                      return (
                        <span
                          key={k}
                          data-tile
                          data-k={k}
                          className="absolute block will-change-transform"
                          style={{
                            left: `${(c * 100) / cols}%`,
                            top: `${(r * 100) / rows}%`,
                            width: `calc(${100 / cols}% + 0.5px)`,
                            height: `calc(${100 / rows}% + 0.5px)`,
                            backgroundImage: `url(${src})`,
                            backgroundSize: `${cols * 100}% ${rows * 100}%`,
                            backgroundPosition: `${(c / (cols - 1)) * 100}% ${(r / (rows - 1)) * 100}%`,
                          }}
                        />
                      );
                    })}
                  <span
                    data-work-frame
                    aria-hidden
                    className="pointer-events-none absolute -inset-px rounded-[14px] ring-1 ring-white/20 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
                  />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Mobile: the copy sits under the stage. */}
        <div className="relative min-h-[190px] md:hidden">
          {projects.map((p, i) => (
            <ProjectText key={p.slug} p={p} i={i} lang={lang} view={dict.view} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectText({ p, i, lang, view }: { p: (typeof projects)[number]; i: number; lang: Locale; view: string }) {
  return (
    <div data-work-text className="absolute inset-0 motion-reduce:[&:not(:first-child)]:hidden">
      <p className="font-mono text-[12px] tracking-[0.25em] text-fg/40" dir="ltr">
        {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
      </p>
      <p className="mt-3 text-[14px] font-semibold" style={{ color: p.colors[0] }}>
        {tr(p.category, lang)}
      </p>
      <h3 className="tracking-display mt-1 text-[44px] font-bold leading-[1.05] sm:text-[72px]">{tr(p.name, lang)}</h3>
      <p className="mt-2 max-w-[420px] text-[16px] leading-relaxed text-fg/60 sm:text-[18px]">{tr(p.tagline, lang)}</p>
      <Link
        href={`/${lang}/projects/${p.slug}`}
        data-transition={tr(p.name, lang)}
        data-magnetic="0.3"
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 text-[15px] font-semibold backdrop-blur-md transition hover:border-white/50"
      >
        {view} <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
      </Link>
    </div>
  );
}
