"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Logo from "@/components/ui/Logo";

export default function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const otherLang: Locale = lang === "ar" ? "en" : "ar";
  const switchHref = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${otherLang}`);
  const links = [
    { href: `/${lang}#services`, label: dict.nav.services },
    { href: `/${lang}#projects`, label: dict.nav.projects },
    { href: `/${lang}#process`, label: dict.nav.process },
    { href: `/${lang}#team`, label: dict.nav.team },
    { href: `/${lang}/blog`, label: dict.nav.blog },
    { href: `/${lang}#contact`, label: dict.nav.contact },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? "bg-black/70 backdrop-blur-xl backdrop-saturate-150" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-12 max-w-[1024px] items-center justify-between px-4 text-[13px] sm:px-6">
        <Link href={`/${lang}`} aria-label="Shifra Code" className="text-fg/90 transition hover:text-fg">
          <Logo className="text-[15px]" />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group relative block h-[1.4em] overflow-hidden text-fg/75 hover:text-fg">
                <span className="block transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] group-hover:-translate-y-full">
                  {l.label}
                </span>
                <span aria-hidden className="absolute inset-x-0 top-full block text-fg transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] group-hover:-translate-y-full">
                  {l.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <Link
            href={switchHref}
            hrefLang={otherLang}
            className="text-fg/75 transition hover:text-fg"
            lang={otherLang}
            onClick={() => {
              document.cookie = `${LOCALE_COOKIE}=${otherLang}; path=/; max-age=31536000; samesite=lax`;
              setOpen(false);
            }}
          >
            {dict.nav.switchLang}
          </Link>
          <Link
            href={`/${lang}#contact`}
            data-magnetic="0.5"
            className="hidden rounded-full bg-accent-strong px-4 py-1.5 text-white transition-colors hover:bg-accent sm:inline-block"
          >
            {dict.nav.cta}
          </Link>
          <button
            type="button"
            className="relative h-8 w-8 md:hidden"
            aria-label={open ? dict.nav.close : dict.nav.menu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`absolute inset-x-1.5 top-[13px] h-px bg-fg transition ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`absolute inset-x-1.5 top-[19px] h-px bg-fg transition ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-x-0 top-12 h-[calc(100dvh-3rem)] bg-black/90 backdrop-blur-2xl transition-[clip-path] duration-700 ease-[cubic-bezier(.7,0,.2,1)] md:hidden ${
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <ul className="flex flex-col gap-2 px-6 pt-8">
          {links.map((l, i) => (
            <li key={l.href} className="overflow-hidden">
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${150 + i * 60}ms` : "0ms" }}
                className={`flex items-baseline gap-4 py-2 text-[40px] font-semibold text-fg/90 transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${
                  open ? "translate-y-0" : "translate-y-full"
                }`}
              >
                <span className="font-mono text-[13px] text-accent">0{i + 1}</span>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
