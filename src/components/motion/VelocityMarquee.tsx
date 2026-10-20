"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Endless row that drifts on its own, speeds up with scroll velocity and
 * flips direction with the scroll direction.
 */
export default function VelocityMarquee({
  children,
  speed = 1,
  reverse = false,
  className = "",
}: {
  children: ReactNode;
  /** Base drift in px per frame. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let dir = reverse ? 1 : -1;
    let boost = 0;
    const set = gsap.quickSetter(el, "x", "px");

    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        dir = (reverse ? -1 : 1) * (self.direction === 1 ? -1 : 1);
        boost = Math.min(Math.abs(self.getVelocity()) / 120, 18);
      },
    });

    const tick = () => {
      const half = el.scrollWidth / 2;
      if (!half) return;
      boost *= 0.94;
      x += dir * (speed + boost);
      x = gsap.utils.wrap(-half, 0, x);
      set(x);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, [speed, reverse]);

  return (
    <div className={`overflow-hidden ${className}`} dir="ltr">
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
