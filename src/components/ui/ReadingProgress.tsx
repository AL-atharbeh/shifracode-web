"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Thin brand-gradient bar under the header that fills as the article is read,
 * and fades in the article's blocks (Markdown HTML can't carry data-reveal).
 */
export default function ReadingProgress({ target }: { target: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const article = document.querySelector<HTMLElement>(target);
    if (!article) return;

    gsap.fromTo(
      bar.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: article, start: "top 20%", end: "bottom 80%", scrub: 0.3 },
      },
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.utils.toArray<HTMLElement>(article.children).forEach((block) => {
      gsap.from(block, {
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: block, start: "top 90%", once: true },
      });
    });
  });

  return (
    <div
      ref={bar}
      aria-hidden
      className="fixed inset-x-0 top-12 z-40 h-[3px] origin-[left] bg-gradient-to-r from-[#00d4f5] via-[#1fa0f5] to-[#3f4cf5] rtl:origin-[right] rtl:bg-gradient-to-l"
    />
  );
}
