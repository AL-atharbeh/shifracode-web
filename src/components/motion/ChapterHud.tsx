"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Cinematic HUD for long pages: the current chapter's number and name roll
 * in at the bottom corner, and a glowing thread down the edge fills with
 * the scroll.
 */
export default function ChapterHud({ chapters }: { chapters: { id: string; label: string }[] }) {
  const [active, setActive] = useState(-1);
  const thread = useRef<HTMLSpanElement>(null);
  const hud = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggers = chapters.map((c, i) => {
      const el = document.getElementById(c.id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && setActive(i),
        onLeaveBack: () => i === 0 && setActive(-1),
      });
    });

    const setThread = gsap.quickSetter(thread.current, "scaleY");
    const progress = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setThread(self.progress),
    });

    return () => {
      triggers.forEach((t) => t?.kill());
      progress.kill();
    };
  }, [chapters]);

  useEffect(() => {
    gsap.to(hud.current, { opacity: active < 0 ? 0 : 1, duration: 0.5 });
  }, [active]);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed bottom-[20vh] start-6 top-[20vh] z-40 hidden w-px bg-white/10 lg:block">
        <span
          ref={thread}
          className="absolute inset-0 origin-top bg-gradient-to-b from-[#00d4f5] to-[#3f4cf5] shadow-[0_0_12px_#22aaf5]"
          style={{ transform: "scaleY(0)" }}
        />
      </div>

      <div
        ref={hud}
        aria-hidden
        className="pointer-events-none fixed bottom-6 start-6 z-40 hidden items-baseline gap-3 opacity-0 mix-blend-difference lg:flex"
      >
        <span className="font-mono text-[13px] text-accent" dir="ltr">
          {String(Math.max(active, 0) + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
        </span>
        <span className="relative h-7 overflow-hidden text-[17px] font-semibold text-white">
          {chapters.map((c) => (
            <span
              key={c.id}
              className="block h-7 leading-7 transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)]"
              style={{ transform: `translateY(${-Math.max(active, 0) * 100}%)` }}
            >
              {c.label}
            </span>
          ))}
        </span>
      </div>
    </>
  );
}
