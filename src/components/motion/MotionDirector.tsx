"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * One place that wires the page-wide motion vocabulary, so sections only
 * need data attributes (and can stay server components):
 *
 * - `[data-split]`      masked words (SplitWords) rise into place
 * - `[data-parallax=n]` drifts n × 100px against the scroll
 * - `[data-skew]`       leans with scroll velocity
 * - `[data-magnetic]`   pulled towards the cursor
 * - `[data-tilt]`       3D tilt + `--mx/--my` spotlight vars under the cursor
 *
 * Entrances wait for PageTransition's `sc:enter`, so they play as the
 * curtain lifts rather than behind it.
 */
export default function MotionDirector() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {});
    if (reduce) return;

    ctx.add(() => {
      gsap.set("[data-split] .sw > span", { yPercent: 118, rotate: 5 });
    });

    const play = () =>
      ctx.add(() => {
        gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
          const words = el.querySelectorAll(".sw > span");
          const onLoad = el.dataset.split === "load";
          gsap.to(words, {
            yPercent: 0,
            rotate: 0,
            duration: onLoad ? 1.4 : 1.1,
            ease: "expo.out",
            stagger: { each: onLoad ? 0.06 : 0.035 },
            delay: onLoad ? 0.35 : 0,
            scrollTrigger: onLoad ? undefined : { trigger: el, start: "top 90%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = parseFloat(el.dataset.parallax || "0.2") * 100;
          gsap.fromTo(
            el,
            { y: -amount },
            { y: amount, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });

        const skews = gsap.utils.toArray<HTMLElement>("[data-skew]");
        if (skews.length) {
          const setSkew = gsap.quickTo(skews, "skewY", { duration: 0.6, ease: "power3" });
          const settle = gsap.delayedCall(0.12, () => setSkew(0)).pause();
          ScrollTrigger.create({
            onUpdate: (self) => {
              setSkew(gsap.utils.clamp(-6, 6, self.getVelocity() / -350));
              settle.restart(true);
            },
          });
        }

        ScrollTrigger.refresh();
      });

    window.addEventListener("sc:enter", play, { once: true });
    return () => {
      window.removeEventListener("sc:enter", play);
      ctx.revert();
    };
  }, [pathname]);

  // Pointer interactions are delegated once for the whole app.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let magnet: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;

    const release = (el: HTMLElement | null, kind: "magnet" | "tilt") => {
      if (!el) return;
      if (kind === "magnet") gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.35)" });
      else gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "power3.out" });
    };

    const onMove = (e: PointerEvent) => {
      const target = e.target as Element | null;

      const m = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (m !== magnet) {
        release(magnet, "magnet");
        magnet = m;
      }
      if (m) {
        const r = m.getBoundingClientRect();
        const strength = parseFloat(m.dataset.magnetic || "0.35");
        gsap.to(m, {
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
          duration: 0.5,
          ease: "power3.out",
        });
      }

      const t = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (t !== tilt) {
        release(tilt, "tilt");
        tilt = t;
      }
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        t.style.setProperty("--mx", `${px * 100}%`);
        t.style.setProperty("--my", `${py * 100}%`);
        const max = parseFloat(t.dataset.tilt || "8");
        gsap.to(t, {
          rotateY: (px - 0.5) * max * 2,
          rotateX: (0.5 - py) * max * 2,
          transformPerspective: 900,
          duration: 0.6,
          ease: "power3.out",
        });
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
