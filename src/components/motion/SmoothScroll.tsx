"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { smooth } from "@/lib/lenis";

/** Inertia scrolling (Lenis) driven by GSAP's ticker, plus a scroll progress bar. */
export default function SmoothScroll() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.4 });
    smooth.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      smooth.lenis = null;
    };
  }, []);

  useEffect(() => {
    const setBar = gsap.quickSetter(bar.current, "scaleX");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setBar(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={bar}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-[#00d4f5] via-[#1fa0f5] to-[#3f4cf5] rtl:origin-right"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
