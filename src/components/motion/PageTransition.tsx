"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { smooth } from "@/lib/lenis";

// Module state survives the layout remount that a language switch causes.
let booted = false;
let covered = false;
let pendingHash = "";

const HEADER_OFFSET = -56;

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

/**
 * First visit: a counting preloader. Every internal navigation: a two-layer
 * curtain sweeps up over the page, the route changes underneath, and the
 * curtain leaves through the top. Same-page #hash links glide instead.
 */
export default function PageTransition({ brand }: { brand: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState(brand);
  const [count, setCount] = useState(0);
  const [preloading, setPreloading] = useState(!booted);

  const reveal = () => {
    const tl = gsap.timeline({
      onStart: announceEnter,
      onComplete: () => {
        covered = false;
        gsap.set(root.current, { pointerEvents: "none" });
      },
    });
    tl.to("[data-pt-content]", { yPercent: -40, opacity: 0, duration: 0.5, ease: "power3.in" }, 0)
      .to("[data-pt='ink']", { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" }, 0.15)
      .to("[data-pt='accent']", { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" }, 0.28);
    return tl;
  };

  const cover = () =>
    new Promise<void>((resolve) => {
      covered = true;
      gsap.set(root.current, { pointerEvents: "auto" });
      gsap
        .timeline({ onComplete: resolve })
        .set("[data-pt]", { clipPath: "inset(100% 0% 0% 0%)" })
        .set("[data-pt-content]", { yPercent: 40, opacity: 0 })
        .to("[data-pt='accent']", { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "expo.inOut" }, 0)
        .to("[data-pt='ink']", { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "expo.inOut" }, 0.12)
        .to("[data-pt-content]", { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, 0.5);
    });

  // First load: preloader counter, then reveal. A remount after a language switch: just reveal.
  useEffect(() => {
    root.current?.classList.remove("pt-failsafe");
    const ctx = gsap.context(() => {}, root);

    if (booted) {
      scrollTop();
      ctx.add(() => reveal());
      return () => ctx.revert();
    }
    booted = true;
    covered = true;
    let finished = false;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const counter = { v: 0 };
    ctx.add(() => {
      gsap
        .timeline()
        .to(counter, {
          v: 100,
          duration: reduce ? 0.2 : 1.6,
          ease: "power2.inOut",
          onUpdate: () => setCount(Math.round(counter.v)),
        })
        .to("[data-pt-bar]", { scaleX: 1, duration: reduce ? 0.2 : 1.6, ease: "power2.inOut" }, 0)
        .add(() => {
          if (location.hash) {
            pendingHash = location.hash;
          }
          finished = true;
          reveal();
          if (pendingHash) setTimeout(() => scrollToHash(pendingHash, true), 50);
          pendingHash = "";
        });
    });
    return () => {
      // React StrictMode remounts once in dev; let the second mount replay the preloader.
      if (!finished) booted = false;
      ctx.revert();
    };
  }, []);

  // Route changed underneath the curtain: reset scroll, then lift it.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (!covered) {
      // Back/forward navigation: no curtain, just play the entrances.
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
      setLabel(text && text.length <= 32 ? text : brand);
      pendingHash = url.hash;
      setPreloading(false);
      cover().then(() => {
        router.push(url.pathname + url.search + url.hash, { scroll: false });
        // Never leave the curtain down if the route never commits.
        setTimeout(() => {
          if (covered && lastPath.current === location.pathname) reveal();
        }, 5000);
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [brand, router]);

  return (
    <div ref={root} className="pt-failsafe fixed inset-0 z-[90]" aria-hidden>
      <div data-pt="accent" className="absolute inset-0 bg-gradient-to-br from-[#00d4f5] via-[#1fa0f5] to-[#3f4cf5]" />
      <div data-pt="ink" className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#030306]">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(16,176,240,0.6), rgba(48,64,240,0.35) 55%, transparent 70%)" }}
        />
        <div data-pt-content className="relative flex flex-col items-center gap-6 px-6 text-center">
          <Image src="/brand/symbol.png" alt="" width={141} height={126} className="h-14 w-auto animate-pulse" priority />
          {preloading ? (
            <>
              <p className="tracking-display font-semibold tabular-nums text-fg" dir="ltr">
                <span className="text-[72px] leading-none sm:text-[120px]">{count}</span>
                <span className="text-[28px] text-muted sm:text-[40px]">%</span>
              </p>
              <span className="block h-px w-[min(60vw,320px)] overflow-hidden bg-white/10">
                <span data-pt-bar className="block h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#00d4f5] to-[#3f4cf5]" />
              </span>
              <p className="text-[13px] tracking-[0.4em] text-muted" dir="ltr">
                SHIFRA CODE
              </p>
            </>
          ) : (
            <p className="tracking-display text-titanium text-[44px] font-semibold leading-tight sm:text-[80px]">{label}</p>
          )}
        </div>
      </div>
    </div>
  );
}
