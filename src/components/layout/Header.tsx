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
              <Link href={l.href} className="text-fg/75 transition hover:text-fg">
                {l.label}
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
            className="hidden rounded-full bg-accent-strong px-3.5 py-1 text-white transition hover:bg-accent sm:inline-block"
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
        className={`overflow-hidden transition-[max-height] duration-500 md:hidden ${open ? "max-h-[80dvh]" : "max-h-0"}`}
      >
        <ul className="flex flex-col gap-1 px-6 pb-8 pt-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-2xl font-semibold text-fg/90"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
