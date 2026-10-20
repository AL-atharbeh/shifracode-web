"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Apple-style scrubbed video: the section pins and the video plays forward
 * or backward with the scroll. For smooth scrubbing, encode the file with a
 * keyframe on every frame (see assets-inbox/README.md).
 */
export default function AbuVideo({ src, dict }: { src: string; dict: Dictionary["abuVideo"] }) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useGSAP(
    () => {
      const v = video.current!;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        v.autoplay = true;
        v.loop = true;
        void v.play().catch(() => {});
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            if (v.duration) v.currentTime = self.progress * (v.duration - 0.05);
          },
        },
      });

      tl.fromTo("[data-video-frame]", { scale: 0.82, borderRadius: 40 }, { scale: 1, borderRadius: 0, duration: 1, ease: "none" })
        .fromTo("[data-video-line='1']", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 0.6)
        .to("[data-video-line='1']", { opacity: 0, y: -30, duration: 0.4 }, 1.4)
        .fromTo("[data-video-line='2']", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 1.6)
        .to({}, { duration: 0.6 });
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative h-dvh overflow-hidden">
      <div data-video-frame className="absolute inset-0 overflow-hidden will-change-transform">
        <video
          ref={video}
          src={src}
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          aria-label={dict.label}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[12%] px-6 text-center">
        <p data-video-line="1" className="tracking-display text-[36px] font-semibold opacity-0 sm:text-[64px]">
          {dict.line1}
        </p>
        <p
          data-video-line="2"
          className="tracking-display text-gradient-brand absolute inset-x-6 top-0 text-[36px] font-semibold opacity-0 sm:text-[64px]"
        >
          {dict.line2}
        </p>
      </div>
    </section>
  );
}
