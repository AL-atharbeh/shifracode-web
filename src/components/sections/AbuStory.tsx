"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { abuOmarImage } from "@/content/site";

const GLYPHS = "شيفراكودعمر{}<>/;=01()[]*+#$&ضصثقغهخحجطظزنتلبس".split("");
const BRAND = ["#00d4f5", "#22aaf5", "#3f4cf5", "#7fe9ff"];

type Particle = {
  ch: string;
  // Positions: on the typed line, in the vortex (polar), and in the portrait (0..1 of the image box).
  lx: number;
  ly: number;
  angle: number;
  radius: number;
  spin: number;
  tx: number;
  ty: number;
  // Per-particle delay so the portrait assembles as a sweep, not all at once.
  delay: number;
  brand: [number, number, number];
  color: [number, number, number];
  // Live position and the displacement the cursor adds.
  x: number;
  y: number;
  ox: number;
  oy: number;
};

const hex = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/**
 * "The story of a line": a pinned, scroll-scrubbed chapter. One typed line of
 * code bursts into a vortex of glyphs, which then fly into place and assemble
 * Abu Omar out of his own picture's colours, until the real image resolves
 * and he says hello. The cursor scatters the glyphs while they are loose.
 */
export default function AbuStory({ lang, dict }: { lang: Locale; dict: Dictionary["abuStory"] }) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const portrait = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      const cv = canvas.current!;
      const ctx = cv.getContext("2d")!;
      const state = { p: 0 };
      let particles: Particle[] = [];
      let W = 0;
      let H = 0;
      let dpr = 1;
      let cell = 7;
      const mouse = { x: -9999, y: -9999 };
      const rtl = lang === "ar";

      // Where the portrait sits: centred while assembling, then it steps aside for the greeting.
      const box = (shift: number) => {
        const mobile = W < 768;
        const h = mobile ? H * 0.56 : H * 0.84;
        const w = (h * abuOmarImage.width) / abuOmarImage.height;
        const side = mobile ? 0 : (rtl ? -1 : 1) * W * 0.2 * shift;
        return { x: W / 2 - w / 2 + side, y: mobile ? H * 0.1 : H * 0.08, w, h };
      };

      const build = (img: HTMLImageElement) => {
        const b = box(0);
        const mobile = W < 768;
        cell = mobile ? 6 : Math.max(6, Math.round(b.h / 125));
        const cols = Math.floor(b.w / cell);
        const rows = Math.floor(b.h / cell);
        if (cols < 1 || rows < 1) return;
        const off = document.createElement("canvas");
        off.width = cols;
        off.height = rows;
        const octx = off.getContext("2d", { willReadFrequently: true })!;
        octx.drawImage(img, 0, 0, cols, rows);
        const data = octx.getImageData(0, 0, cols, rows).data;

        const lineW = Math.min(W * 0.7, 720);
        const next: Particle[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const i = (r * cols + c) * 4;
            if (data[i + 3] < 140) continue;
            const ty = r / rows;
            next.push({
              ch: GLYPHS[(Math.random() * GLYPHS.length) | 0],
              lx: (Math.random() - 0.5) * lineW,
              ly: (Math.random() - 0.5) * 10,
              angle: Math.random() * Math.PI * 2,
              radius: Math.pow(Math.random(), 0.6),
              spin: 0.25 + Math.random() * 0.6,
              tx: c / cols,
              ty,
              delay: ty * 0.55 + Math.random() * 0.25,
              brand: hex(BRAND[(Math.random() * BRAND.length) | 0]),
              color: [data[i], data[i + 1], data[i + 2]],
              x: W / 2,
              y: H / 2,
              ox: 0,
              oy: 0,
            });
          }
        }
        particles = next;
      };

      const img = new window.Image();
      img.src = abuOmarImage.src;

      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = cv.clientWidth;
        H = cv.clientHeight;
        cv.width = W * dpr;
        cv.height = H * dpr;
        if (img.complete && img.naturalWidth) build(img);
      };
      img.onload = resize;
      resize();
      window.addEventListener("resize", resize);

      const onMove = (e: PointerEvent) => {
        const r = cv.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      };
      const onLeave = () => {
        mouse.x = mouse.y = -9999;
      };
      cv.parentElement!.addEventListener("pointermove", onMove);
      cv.parentElement!.addEventListener("pointerleave", onLeave);

      let time = 0;
      const draw = () => {
        if (!particles.length) {
          // The canvas can have no size yet on the first pass; build once it does.
          if (img.complete && img.naturalWidth && cv.clientWidth) resize();
          return;
        }
        const r = section.current!.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        time += 0.016;

        const p = state.p;
        const burst = ease(range(p, 0.13, 0.3));
        const gather = range(p, 0.4, 0.72);
        const solid = range(p, 0.74, 0.84);
        const shift = ease(range(p, 0.84, 0.94));
        const b = box(shift);
        const cx = W / 2;
        const cy = H / 2;
        const vortexR = Math.min(W, H) * 0.48;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        if (p < 0.12) return;

        const font = Math.round(cell * 1.35);
        ctx.font = `600 ${font}px ui-monospace, "SF Mono", Menlo, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fade = 1 - solid * 0.88;

        for (const q of particles) {
          // Line -> vortex.
          const a = q.angle + time * q.spin * (1.4 - q.radius) + burst * 2.5;
          const rad = q.radius * vortexR * (0.6 + 0.4 * Math.sin(time * 0.7 + q.angle * 3));
          const vx = cx + Math.cos(a) * rad;
          const vy = cy + Math.sin(a) * rad * 0.62;
          let x = cx + q.lx + (vx - cx - q.lx) * burst;
          let y = cy + q.ly + (vy - cy - q.ly) * burst;

          // Vortex -> portrait, staggered top to bottom.
          const g = ease(clamp01((gather - q.delay * 0.55) / 0.45));
          const px = b.x + q.tx * b.w + cell / 2;
          const py = b.y + q.ty * b.h + cell / 2;
          x += (px - x) * g;
          y += (py - y) * g;

          // The cursor pushes loose glyphs away; they spring back.
          const dx = q.x - mouse.x;
          const dy = q.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120 && solid < 1) {
            const f = (1 - Math.sqrt(d2) / 120) * 9;
            const n = Math.sqrt(d2) || 1;
            q.ox += (dx / n) * f;
            q.oy += (dy / n) * f;
          }
          q.ox *= 0.9;
          q.oy *= 0.9;
          q.x = x + q.ox;
          q.y = y + q.oy;

          const c = q.brand;
          const t = g;
          const R = (c[0] + (q.color[0] - c[0]) * t) | 0;
          const G = (c[1] + (q.color[1] - c[1]) * t) | 0;
          const B = (c[2] + (q.color[2] - c[2]) * t) | 0;
          const flicker = g < 1 ? 0.55 + 0.45 * Math.sin(time * 6 + q.angle * 10) : 1;
          ctx.globalAlpha = fade * flicker * (0.35 + 0.65 * Math.min(1, burst * 3));
          ctx.fillStyle = `rgb(${R},${G},${B})`;
          ctx.fillText(q.ch, q.x, q.y);
        }
        ctx.globalAlpha = 1;

        // Sync the crisp portrait with the glyph box.
        const el = portrait.current!;
        el.style.left = `${b.x}px`;
        el.style.top = `${b.y}px`;
        el.style.width = `${b.w}px`;
        el.style.height = `${b.h}px`;
        el.style.opacity = String(solid);
        el.style.setProperty("--scan", `${(1 - solid) * 100}%`);
      };
      gsap.ticker.add(draw);

      // Scroll drives one progress value; the copy is choreographed against it.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=500%",
          pin: true,
          scrub: 0.6,
        },
      });
      tl.to(state, { p: 1, duration: 1 }, 0);

      const show = (sel: string, from: number, to: number) => {
        tl.fromTo(sel, { opacity: 0, y: 40, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.04 }, from);
        if (to < 1) tl.to(sel, { opacity: 0, y: -40, filter: "blur(10px)", duration: 0.04 }, to);
      };
      tl.fromTo("[data-story-code]", { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.4, filter: "blur(8px)", duration: 0.05 }, 0.11);
      tl.fromTo(
        "[data-story-type]",
        { clipPath: "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.09, ease: "steps(22)" },
        0.005,
      );
      show("[data-story='0']", 0.0, 0.12);
      show("[data-story='1']", 0.18, 0.36);
      show("[data-story='2']", 0.44, 0.66);
      show("[data-story='3']", 0.72, 0.84);
      show("[data-story='hello']", 0.9, 1);
      tl.fromTo("[data-story-meter]", { scaleX: 0 }, { scaleX: 1, duration: 0.84 }, 0);
      tl.to("[data-story-hud]", { opacity: 0, duration: 0.04 }, 0.86);

      // Chapter counter in the HUD.
      const labels = gsap.utils.toArray<HTMLElement>("[data-story-label]");
      const windows = [0, 0.18, 0.44, 0.72];
      tl.eventCallback("onUpdate", () => {
        const p = state.p;
        const idx = windows.filter((w) => p >= w).length - 1;
        labels.forEach((l) => (l.style.transform = `translateY(${-idx * 100}%)`));
        const pct = document.querySelector<HTMLElement>("[data-story-pct]");
        if (pct) pct.textContent = String(Math.round(Math.min(p / 0.84, 1) * 100)).padStart(3, "0");
      });

      return () => {
        gsap.ticker.remove(draw);
        window.removeEventListener("resize", resize);
        cv.parentElement?.removeEventListener("pointermove", onMove);
        cv.parentElement?.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: section, dependencies: [lang] },
  );

  const textSide = "absolute inset-x-6 bottom-[8%] text-center md:inset-x-auto md:bottom-auto md:start-[7%] md:top-1/2 md:max-w-[560px] md:-translate-y-1/2 md:text-start";

  return (
    <section
      ref={section}
      id="abu"
      data-abu="hero"
      aria-label={dict.label}
      className="relative h-[100svh] overflow-hidden motion-reduce:h-auto motion-reduce:py-24"
    >
      {/* Soft spotlight behind the figure. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[120px] motion-reduce:hidden"
        style={{ background: "radial-gradient(circle, rgba(16,176,240,0.35), rgba(48,64,240,0.2) 50%, transparent 70%)" }}
      />

      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full motion-reduce:hidden" />

      <div
        ref={portrait}
        className="story-portrait pointer-events-none absolute opacity-0 motion-reduce:relative motion-reduce:mx-auto motion-reduce:h-[70vh] motion-reduce:w-[calc(70vh*0.4375)] motion-reduce:opacity-100"
      >
        <Image src={abuOmarImage.src} alt={dict.hello} fill sizes="(max-width: 768px) 60vw, 380px" className="object-contain" />
      </div>

      {/* Chapter 0: the single typed line. */}
      <div data-story-code className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center motion-reduce:hidden" dir="ltr">
        <code className="inline-flex items-center font-mono text-[18px] text-fg sm:text-[30px]">
          <span data-story-type className="inline-block whitespace-nowrap">
            <span className="text-[#c792ea]">const</span> <span className="text-[#7fe9ff]">idea</span> ={" "}
            <span className="text-[#c3e88d]">{dict.code}</span>;
          </span>
          <span className="ms-1 inline-block h-[1.1em] w-[0.55em] animate-pulse bg-accent" />
        </code>
      </div>

      {dict.chapters.map((c, i) => (
        <div key={c.name} data-story={i} className={`${textSide} pointer-events-none opacity-0 motion-reduce:relative motion-reduce:mt-8 motion-reduce:opacity-100`}>
          <p className="font-mono text-[13px] tracking-[0.3em] text-accent" dir="ltr">
            {c.n} — {c.name}
          </p>
          <h2 className="tracking-display mt-3 text-[34px] font-bold leading-[1.15] sm:text-[56px]">{c.title}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-fg/65 sm:text-[19px]">{c.body}</p>
        </div>
      ))}

      <div data-story="hello" className={`${textSide} opacity-0 motion-reduce:relative motion-reduce:mt-8 motion-reduce:opacity-100`}>
        <h2 className="tracking-display text-gradient-brand pb-1 text-[40px] font-bold leading-[1.15] sm:text-[72px]">{dict.hello}</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-fg/70 sm:text-[20px]">{dict.helloBody}</p>
        <button
          type="button"
          data-magnetic="0.4"
          onClick={() => window.dispatchEvent(new Event("abu:open"))}
          className="mt-7 inline-flex items-center gap-3 rounded-full bg-fg px-7 py-3.5 text-[16px] font-semibold text-black transition hover:bg-accent hover:text-white"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#30d158]" />
            <span className="relative h-2 w-2 rounded-full bg-[#30d158]" />
          </span>
          {dict.ask}
        </button>
      </div>

      {/* Compiler HUD. */}
      <div
        data-story-hud
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-20 flex items-center justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.25em] text-fg/50 motion-reduce:hidden sm:inset-x-10 sm:top-24"
        dir="ltr"
      >
        <span className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          {dict.compiling} abu-omar.ts
        </span>
        <span className="hidden h-px flex-1 overflow-hidden bg-white/10 sm:block">
          <span data-story-meter className="block h-full origin-left bg-gradient-to-r from-[#00d4f5] to-[#3f4cf5]" />
        </span>
        <span className="flex items-center gap-4">
          <span className="relative block h-[1.4em] overflow-hidden">
            {dict.chapters.map((c) => (
              <span key={c.n} data-story-label className="block h-[1.4em] transition-transform duration-500">
                {c.n}/{String(dict.chapters.length).padStart(2, "0")}
              </span>
            ))}
          </span>
          <span>
            <span data-story-pct>000</span>%
          </span>
        </span>
      </div>
    </section>
  );
}
