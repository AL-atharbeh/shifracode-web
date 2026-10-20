"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";

const FINE = "(hover: hover) and (pointer: fine)";
const isFinePointer = () => window.matchMedia(FINE).matches;
const subscribeFine = (cb: () => void) => {
  const mq = window.matchMedia(FINE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Custom cursor: a dot that sticks to the pointer and a ring that trails it.
 * Grows over links; over `[data-cursor="<label>"]` it becomes a filled disc
 * with the label inside. Mouse/trackpad only — touch devices keep nothing.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const enabled = useSyncExternalStore(subscribeFine, isFinePointer, () => false);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });

    let state = "";
    const last = { x: -100, y: -100 };
    const onMove = (e: PointerEvent) => {
      last.x = e.clientX;
      last.y = e.clientY;
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      hover(e.target as Element | null);
    };
    // Content slides under a still pointer while scrolling; re-check what it is over.
    const onScroll = () => hover(document.elementFromPoint(last.x, last.y));

    const hover = (target: Element | null) => {
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      const link = target?.closest("a, button, [role='button'], input, textarea, label");
      const next = labelled ? `label:${labelled.dataset.cursor}` : link ? "link" : "";
      if (next === state) return;
      state = next;

      setLabel(labelled?.dataset.cursor ?? "");
      gsap.to(disc.current, {
        scale: labelled ? 2.6 : link ? 1.7 : 1,
        backgroundColor: labelled ? "rgba(34,170,245,1)" : link ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0)",
        borderColor: labelled ? "rgba(34,170,245,0)" : "rgba(255,255,255,0.55)",
        duration: 0.4,
        ease: "power3.out",
      });
      gsap.to(dot.current, { scale: labelled || link ? 0 : 1, duration: 0.25 });
    };
    const onDown = () => gsap.to(ring.current, { scale: 0.8, duration: 0.15 });
    const onUp = () => gsap.to(ring.current, { scale: 1, duration: 0.4, ease: "back.out(3)" });
    const onLeave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 });
    const onEnter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("sc:enter", onScroll);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("sc:enter", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={ring} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100]">
        <div
          ref={disc}
          className="absolute -left-5 -top-5 h-10 w-10 rounded-full border border-white/55"
        />
        <span
          className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[13px] font-semibold text-white transition-opacity duration-200 ${
            label ? "opacity-100" : "opacity-0"
          }`}
        >
          {label}
        </span>
      </div>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
      />
    </>
  );
}
