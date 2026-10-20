"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Apple-style paragraph whose words light up one by one as you scroll. */
export default function Statement({ text }: { text: string }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-statement]", start: "top 75%", end: "bottom 45%", scrub: true },
        },
      );
    },
    { scope: section },
  );

  return (
    <section ref={section} className="px-6 py-32 sm:py-48">
      <p
        data-statement
        className="tracking-title mx-auto max-w-[980px] text-[24px] font-semibold leading-[1.35] sm:text-[48px] lg:text-[56px]"
      >
        {text.split(" ").map((word, i) => (
          <span key={i} data-word className="inline">
            {word}{" "}
          </span>
        ))}
      </p>
    </section>
  );
}
