"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { smooth } from "@/lib/lenis";
import { abuOmarImage } from "@/content/site";

// Module state survives the layout remount that a language switch causes.
let booted = false;
let covered = false;
let pendingHash = "";

const HEADER_OFFSET = -56;
const SHUTTERS = 7;

export function scrollToHash(hash: string, immediate = false) {
  const el = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (!el) return false;
  if (smooth.lenis) smooth.lenis.scrollTo(el, { offset: HEADER_OFFSET, immediate, duration: 1.6 });
  else el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  return true;
}

function scrollTop() {
  if (smooth.lenis) smooth.lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

/** Lets MotionDirector start the page's entrance animations. */
const announceEnter = () => requestAnimationFrame(() => window.dispatchEvent(new Event("sc:enter")));

/** Resolves once fonts, the page and Abu Omar's picture are ready (or after a cap). */
function assetsReady() {
  const img = new window.Image();
  img.src = abuOmarImage.src;
  const page = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
  return Promise.race([
    Promise.all([document.fonts?.ready, img.decode().catch(() => {}), page]),
    new Promise((r) => setTimeout(r, 4000)),
  ]);
}

/** The overlay element, set when PageTransition mounts. */
let rootEl: HTMLDivElement | null = null;

const shutterStagger = { each: 0.06, from: "center" as const };

/** Rolls the shutters back up over the new page. */
function reveal() {
  return gsap
    .timeline({
      onStart: announceEnter,
      onComplete: () => {
        covered = false;
        gsap.set(rootEl, { pointerEvents: "none", visibility: "hidden" });
      },
    })
    .to("[data-pt-content]", { y: -60, opacity: 0, duration: 0.5, ease: "power3.in" }, 0)
    .to("[data-pt-shutter]", { scaleY: 0, transformOrigin: "50% 0%", duration: 0.85, ease: "expo.inOut", stagger: shutterStagger }, 0.2)
    .to("[data-pt-edge]", { scaleY: 0, transformOrigin: "50% 0%", duration: 0.85, ease: "expo.inOut", stagger: shutterStagger }, 0.26);
}

/** Drops the shutters from the centre out; resolves once the page is hidden. */
function cover() {
  return new Promise<void>((resolve) => {
    covered = true;
    gsap.set(rootEl, { pointerEvents: "auto", visibility: "visible" });
    gsap
      .timeline({ onComplete: resolve })
      .set("[data-pt-shutter], [data-pt-edge]", { scaleY: 0, transformOrigin: "50% 100%" })
      .set("[data-pt-content]", { y: 40, opacity: 0 })
      .to("[data-pt-edge]", { scaleY: 1, duration: 0.7, ease: "expo.inOut", stagger: shutterStagger }, 0)
      .to("[data-pt-shutter]", { scaleY: 1, duration: 0.7, ease: "expo.inOut", stagger: shutterStagger }, 0.06)
      .to("[data-pt-content]", { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, 0.5)
      .fromTo("[data-pt-label] > span", { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "expo.out" }, 0.5);
  });
}

export type TransitionCopy = { brand: string; greeting: string; tagline: string; city: string };

/**
 * First visit: a splash where Abu Omar is scanned in over the brand name while
 * a real loading counter runs. Every internal navigation: vertical shutters
 * drop from the centre out, show where you're going, and roll back up over
 * the new page. Same-page #hash links glide instead.
 */
export default function PageTransition({ copy }: { copy: TransitionCopy }) {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState(copy.brand);
  const [path, setPath] = useState("");
  const [count, setCount] = useState(0);
  const [splash, setSplash] = useState(!booted);

  // First load: the splash. A remount after a language switch: just reveal.
  useEffect(() => {
    rootEl = root.current;
    rootEl?.classList.remove("pt-failsafe");
    const ctx = gsap.context(() => {}, root);

    if (booted) {
      scrollTop();
      ctx.add(() => reveal());
      return () => ctx.revert();
    }
    booted = true;
    covered = true;
    let finished = false;
    let alive = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const counter = { v: 0 };
    const tick = () => setCount(Math.round(counter.v));

    ctx.add(() => {
      const intro = gsap.timeline();
      intro
        .fromTo("[data-splash-name]", { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 1.6, ease: "expo.out" }, 0)
        .fromTo("[data-splash-abu]", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" }, 0.15)
        .fromTo("[data-splash-scan]", { top: "100%", opacity: 1 }, { top: "0%", duration: 1.5, ease: "expo.inOut" }, 0.15)
        .to("[data-splash-scan]", { opacity: 0, duration: 0.3 }, 1.6)
        .fromTo("[data-splash-line] > span", { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 }, 0.9)
        .fromTo("[data-splash-meta]", { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.1 }, 0.4)
        .to(counter, { v: 86, duration: reduce ? 0.2 : 1.7, ease: "power2.out", onUpdate: tick }, 0)
        .to("[data-splash-bar]", { scaleX: 0.86, duration: reduce ? 0.2 : 1.7, ease: "power2.out" }, 0);

      // Finish the count only once the assets have really arrived.
      Promise.all([assetsReady(), new Promise((r) => intro.eventCallback("onComplete", r))]).then(() => {
        if (!alive) return;
        ctx.add(() => {
          gsap
            .timeline()
            .to(counter, { v: 100, duration: 0.45, ease: "power2.inOut", onUpdate: tick })
            .to("[data-splash-bar]", { scaleX: 1, duration: 0.45, ease: "power2.inOut" }, 0)
            .to("[data-splash-abu]", { y: -30, scale: 0.96, opacity: 0, duration: 0.7, ease: "power3.in" }, 0.5)
            .to("[data-splash-name], [data-splash-line], [data-splash-meta]", { opacity: 0, duration: 0.5 }, 0.55)
            .add(() => {
              finished = true;
              if (location.hash) pendingHash = location.hash;
              reveal();
              if (pendingHash) setTimeout(() => scrollToHash(pendingHash, true), 50);
              pendingHash = "";
            }, 0.9);
        });
      });
    });
    return () => {
      alive = false;
      // React StrictMode remounts once in dev; let the second mount replay the splash.
      if (!finished) booted = false;
      ctx.revert();
    };
  }, []);

  // Route changed underneath the shutters: reset scroll, then lift them.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (!covered) {
      // Back/forward navigation: no shutters, just play the entrances.
      announceEnter();
      return;
    }
    scrollTop();
    ScrollTrigger.refresh();
    if (pendingHash) scrollToHash(pendingHash, true);
    pendingHash = "";
    reveal();
  }, [pathname]);

  // Intercept internal link clicks.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.hasAttribute("download")) return;
      if (a.target && a.target !== "_self") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;

      if (url.pathname === location.pathname && url.search === location.search) {
        e.preventDefault();
        if (url.hash && scrollToHash(url.hash)) history.pushState(null, "", url.hash);
        else if (!url.hash && smooth.lenis) smooth.lenis.scrollTo(0, { duration: 1.6 });
        else if (!url.hash) window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      e.preventDefault();
      if (covered) return;
      const text = (a.dataset.transition ?? a.textContent ?? "").trim();
      pendingHash = url.hash;
      // Commit the label now so the cover animation can target it.
      flushSync(() => {
        setLabel(text && text.length <= 32 ? text : copy.brand);
        setPath(decodeURIComponent(url.pathname));
        setSplash(false);
      });
      cover().then(() => {
        router.push(url.pathname + url.search + url.hash, { scroll: false });
        // Never leave the shutters down if the route never commits.
        setTimeout(() => {
          if (covered && lastPath.current === location.pathname) reveal();
        }, 5000);
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [copy.brand, router]);

  return (
    <div ref={root} className="pt-failsafe fixed inset-0 z-[90]" aria-hidden>
      {Array.from({ length: SHUTTERS }, (_, i) => (
        <div
          key={i}
          className="absolute inset-y-0"
          style={{ left: `${(i * 100) / SHUTTERS}%`, width: `calc(${100 / SHUTTERS}% + 1px)` }}
        >
          <div data-pt-edge className="absolute inset-0 bg-gradient-to-b from-[#00d4f5] to-[#3f4cf5]" />
          <div data-pt-shutter className="absolute inset-0 border-x border-white/[0.03] bg-[#040508]" />
        </div>
      ))}

      <div data-pt-content className="absolute inset-0 overflow-hidden">
        {splash ? (
          <>
            <div
              aria-hidden
              className="absolute left-1/2 top-[46%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[110px]"
              style={{ background: "radial-gradient(circle, rgba(16,176,240,0.5), rgba(48,64,240,0.3) 55%, transparent 72%)" }}
            />

            {/* The brand name sits behind Abu Omar like a poster. */}
            <p
              data-splash-name
              className="text-outline absolute inset-x-0 top-[40%] -translate-y-1/2 select-none whitespace-nowrap text-center text-[17vw] font-bold leading-none [-webkit-text-stroke-color:rgb(245_245_247/0.14)] md:text-[15vw]"
            >
              {copy.brand}
            </p>

            <div className="absolute bottom-[22%] left-1/2 h-[54vh] -translate-x-1/2" style={{ aspectRatio: `${abuOmarImage.width} / ${abuOmarImage.height}` }}>
              <div data-splash-abu className="relative h-full w-full">
                <Image src={abuOmarImage.src} alt="" fill priority sizes="300px" className="object-contain" />
              </div>
              <span
                data-splash-scan
                className="absolute inset-x-[-30%] h-px bg-gradient-to-r from-transparent via-[#7fe9ff] to-transparent shadow-[0_0_24px_4px_rgba(34,170,245,0.7)]"
              />
            </div>

            <div className="absolute inset-x-6 bottom-[9%] text-center">
              <p data-splash-line className="overflow-hidden text-[22px] font-semibold sm:text-[30px]">
                <span className="inline-block">{copy.greeting}</span>
              </p>
              <p data-splash-line className="mt-1 overflow-hidden text-[14px] text-fg/55 sm:text-[16px]">
                <span className="inline-block">{copy.tagline}</span>
              </p>
            </div>

            <div className="absolute inset-x-6 top-6 flex justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-fg/45 sm:inset-x-10" dir="ltr">
              <span data-splash-meta>Shifra Code ©{new Date().getFullYear()}</span>
              <span data-splash-meta>{copy.city}</span>
            </div>

            <div className="absolute inset-x-6 bottom-6 flex items-end gap-6 sm:inset-x-10" dir="ltr">
              <span className="relative mb-2 block h-px flex-1 overflow-hidden bg-white/10">
                <span data-splash-bar className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-[#00d4f5] to-[#3f4cf5]" />
              </span>
              <span className="font-mono text-[13px] tabular-nums text-fg/70">
                {String(count).padStart(3, "0")}
                <span className="text-fg/35">%</span>
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
            <span className="relative block h-16 w-16 overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_30%,#10b0f0,#3040f0_70%)] ring-1 ring-white/15">
              <Image src="/abu-omar/avatar.webp" alt="" fill sizes="64px" className="object-cover" />
            </span>
            <p data-pt-label className="overflow-hidden pb-2">
              <span className="tracking-display text-titanium inline-block text-[44px] font-semibold leading-tight sm:text-[84px]">
                {label}
              </span>
            </p>
            <p className="font-mono text-[12px] tracking-[0.2em] text-accent" dir="ltr">
              → {path}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
