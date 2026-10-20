"use client";

import { useEffect, useRef } from "react";

const BITS = ["0", "1"];
const WORDS = ["شيفرا", "كود", "SHIFRA", "CODE", "أبوعمر"];

type Drop = {
  x: number;
  y: number;
  speed: number;
  /** When set, the drop spells this word top to bottom instead of raining bits. */
  word: string | null;
  i: number;
};

/**
 * Full-page background: a quiet rain of 0s and 1s in the brand blues, where
 * now and then a column spells "شيفرا كود". The cursor is an umbrella — no
 * rain falls under it, and drops splash brighter at its edge. Faster scrolling
 * makes it pour.
 */
export default function CodeRain() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d", { alpha: false })!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let size = 16;
    let gap = 20;
    let drops: Drop[] = [];
    const mouse = { x: -9999, y: -9999 };
    const UMBRELLA = 110;

    const spawn = (x: number, top = false): Drop => ({
      x,
      y: top ? -Math.random() * 20 : Math.random() * (H / size),
      speed: 0.35 + Math.random() * 0.75,
      word: Math.random() < 0.06 ? WORDS[(Math.random() * WORDS.length) | 0] : null,
      i: 0,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      el.width = W * dpr;
      el.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = W < 768 ? 13 : 15;
      gap = W < 768 ? 17 : 21;
      drops = [];
      for (let x = gap / 2; x < W; x += gap) drops.push(spawn(x));
      ctx.fillStyle = "#020307";
      ctx.fillRect(0, 0, W, H);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    let lastY = window.scrollY;
    let pour = 0;
    let last = 0;
    let raf = 0;

    const step = () => {
      const y = window.scrollY;
      pour += (Math.min(Math.abs(y - lastY) / 30, 3) - pour) * 0.2;
      lastY = y;
      // Bright over the hero, a quiet texture behind the content below it.
      const level = 1 - Math.min(y / H, 1) * 0.55;

      ctx.fillStyle = "rgba(2,3,7,0.14)";
      ctx.fillRect(0, 0, W, H);
      ctx.font = `600 ${size}px ui-monospace, "SF Mono", Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      for (const d of drops) {
        const py = d.y * size;
        const dx = d.x - mouse.x;
        const dy = py - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > UMBRELLA) {
          const ch = d.word ? d.word[d.i % d.word.length] : BITS[(Math.random() * 2) | 0];
          const edge = dist < UMBRELLA + 30 && dy < 0;
          // The trail behind the head settles into brand blue.
          ctx.globalAlpha = 0.55 * level;
          ctx.fillStyle = d.word ? "#22aaf5" : "#1b4fd6";
          ctx.fillText(ch, d.x, py - size);
          // The head glows; words and drops splashing on the umbrella burn brighter.
          ctx.globalAlpha = (edge ? 1 : d.word ? 0.95 : 0.7) * level;
          ctx.fillStyle = edge || d.word ? "#d9fbff" : "#7fe9ff";
          ctx.fillText(ch, d.x, py);
        }

        d.y += d.speed * (1 + pour);
        d.i += 1;
        if (py > H + size * 4 && Math.random() > 0.9) Object.assign(d, spawn(d.x, true));
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 45) return;
      last = now;
      step();
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) {
      for (let i = 0; i < 40; i++) step();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 -z-20 h-full w-full" />
      {/* Brand glow and a vignette so the rain stays behind the content. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(34,170,245,0.16), transparent 70%), radial-gradient(120% 90% at 50% 50%, transparent 40%, rgba(2,3,7,0.85) 100%)",
        }}
      />
    </>
  );
}
