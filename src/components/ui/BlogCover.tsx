"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Locale } from "@/i18n/config";

export type CoverVariant = "devices" | "chat" | "system";

/**
 * Layered blog cover: Abu Omar plus real project screenshots on the post's
 * gradient. Layers float, drift with the scroll and follow the pointer, each
 * by its own depth, so the cover reads as a small 3D scene.
 */
export default function BlogCover({
  variant,
  colors,
  lang,
  className = "",
  priority = false,
}: {
  variant: CoverVariant;
  colors: [string, string];
  lang: Locale;
  className?: string;
  priority?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [a, b] = colors;

  // Scroll parallax: deeper layers travel further as the cover passes through the viewport.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((layer) => {
        const depth = Number(layer.dataset.depth);
        gsap.fromTo(
          layer,
          { yPercent: depth * 6 },
          {
            yPercent: -depth * 6,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  // Pointer tilt: expose the pointer position as CSS variables (-1..1).
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    e.currentTarget.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const onLeave = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--mx", "0");
    e.currentTarget.style.setProperty("--my", "0");
  };

  return (
    <div
      ref={root}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 120% at 15% 0%, ${a}cc, transparent 55%), radial-gradient(120% 120% at 100% 100%, ${b}cc, transparent 60%), #0c0c0f`,
      }}
    >
      {/* Moving grid + glow */}
      <span className="animate-grid absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.07)_95%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.07)_95%)] bg-[length:32px_32px]" />
      <span
        className="animate-orb absolute -start-[10%] top-[10%] h-[70%] w-[50%] rounded-full blur-3xl"
        style={{ background: `${a}55` }}
      />

      {variant === "devices" && (
        <>
          <Layer depth={1} className="start-[5%] top-[16%] w-[60%]" float={0}>
            <BrowserFrame src="/projects/warshatak/dashboard.webp" ratio="198/100" />
          </Layer>
          <Layer depth={2} className="start-[48%] top-[26%] h-[68%]" float={1}>
            <PhoneFrame src="/projects/shahed/screen-1.webp" />
          </Layer>
          <Abu src="/blog/abu-wave.webp" className="end-[3%] h-[96%]" priority={priority} />
        </>
      )}

      {variant === "chat" && (
        <>
          <Layer depth={0.6} className="start-[4%] top-[12%] w-[66%] opacity-70" float={2}>
            <BrowserFrame src="/projects/hader/platform.webp" ratio="198/100" />
          </Layer>
          <Layer depth={2} className="start-[5%] top-[30%] w-[48%]" float={0}>
            <ChatBubbles lang={lang} />
          </Layer>
          <Abu src="/blog/abu-face.webp" className="end-[2%] h-[78%]" priority={priority} />
        </>
      )}

      {variant === "system" && (
        <>
          <Layer depth={0.8} className="start-[4%] top-[14%] w-[56%]" float={1}>
            <BrowserFrame src="/projects/warshatak/login.webp" ratio="198/100" />
          </Layer>
          <Layer depth={1.8} className="start-[22%] top-[44%] w-[50%]" float={0}>
            <TabletFrame src="/projects/gold/login.webp" />
          </Layer>
          <Abu src="/blog/abu-stand.webp" className="end-[6%] h-[92%]" priority={priority} />
        </>
      )}
    </div>
  );
}

function Layer({
  depth,
  className,
  float,
  children,
}: {
  depth: number;
  className: string;
  float: number;
  children: ReactNode;
}) {
  return (
    <div data-depth={depth} className={`absolute ${className}`}>
      <div
        className="animate-float h-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        style={
          {
            animationDelay: `${float * -1.7}s`,
            translate: `calc(var(--mx, 0) * ${depth * 8}px) calc(var(--my, 0) * ${depth * 6}px)`,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}

function Abu({ src, className, priority }: { src: string; className: string; priority: boolean }) {
  return (
    <div data-depth={3} className={`absolute bottom-0 ${className}`}>
      <div
        className="relative h-full transition-transform duration-500 ease-out group-hover:-translate-y-2"
        style={{ translate: "calc(var(--mx, 0) * 22px) calc(var(--my, 0) * 10px)" } as CSSProperties}
      >
        <Image
          src={src}
          alt=""
          width={600}
          height={900}
          priority={priority}
          sizes="(min-width: 768px) 240px, 40vw"
          className="h-full w-auto max-w-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
        />
      </div>
    </div>
  );
}

function BrowserFrame({ src, ratio }: { src: string; ratio: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0f0f11] shadow-[0_24px_60px_-18px_rgba(0,0,0,0.85)]" dir="ltr">
      <div className="flex gap-1 border-b border-white/5 px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="relative" style={{ aspectRatio: ratio }}>
        <Image src={src} alt="" fill sizes="(min-width: 768px) 360px, 60vw" className="object-cover object-top" />
      </div>
    </div>
  );
}

function PhoneFrame({ src }: { src: string }) {
  return (
    <div className="relative aspect-[921/2000] h-full overflow-hidden rounded-[1.1rem] border-[4px] border-[#2a2a2e] bg-white shadow-[0_24px_60px_-18px_rgba(0,0,0,0.9)]">
      <Image src={src} alt="" fill sizes="140px" className="object-cover" />
    </div>
  );
}

function TabletFrame({ src }: { src: string }) {
  return (
    <div className="relative aspect-[963/568] overflow-hidden rounded-xl border-[5px] border-[#1c1c1f] bg-white shadow-[0_24px_60px_-18px_rgba(0,0,0,0.9)]">
      <Image src={src} alt="" fill sizes="(min-width: 768px) 300px, 50vw" className="object-cover" />
    </div>
  );
}

function ChatBubbles({ lang }: { lang: Locale }) {
  const lines =
    lang === "ar"
      ? [
          { me: false, t: "عندكم توصيل اليوم؟" },
          { me: true, t: "أكيد! بنوصل لكل عمّان خلال ساعة 🚚" },
          { me: false, t: "تمام، بدي أطلب" },
        ]
      : [
          { me: false, t: "Do you deliver today?" },
          { me: true, t: "Sure! Anywhere in Amman within an hour 🚚" },
          { me: false, t: "Great, I'd like to order" },
        ];
  return (
    <div className="flex flex-col gap-1.5 text-[11px] leading-snug text-white sm:text-[12px]">
      {lines.map((l, i) => (
        <p
          key={i}
          className={`animate-bubble w-fit max-w-[85%] rounded-2xl px-3 py-1.5 shadow-lg ${
            l.me ? "self-end rounded-ee-sm bg-[#005c4b]" : "self-start rounded-es-sm bg-white/15 backdrop-blur"
          }`}
          style={{ animationDelay: `${i * 0.9}s` }}
        >
          {l.t}
        </p>
      ))}
    </div>
  );
}
