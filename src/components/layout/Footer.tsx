import Link from "next/link";
import { tr, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { site, whatsappLink } from "@/content/site";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import Logo from "@/components/ui/Logo";

export default function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <footer className="border-t border-line bg-ink-soft text-[13px] text-muted">
      <div className="mx-auto grid max-w-[1024px] gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo variant="full" />
          <p>{dict.footer.tagline}</p>
          <p>{tr(site.city, lang)}</p>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-fg">{dict.nav.services}</h2>
          <ul className="space-y-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/${lang}/services/${s.slug}`} className="transition hover:text-fg">
                  {tr(s.name, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-fg">{dict.nav.projects}</h2>
          <ul className="space-y-2">
            <li>
              <Link href={`/${lang}/blog`} className="transition hover:text-fg">
                {dict.nav.blog}
              </Link>
            </li>
            {projects.map((p) => (
              <li key={p.slug}>
                <Link href={`/${lang}/projects/${p.slug}`} className="transition hover:text-fg">
                  {tr(p.name, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-fg">{dict.nav.contact}</h2>
          <ul className="space-y-2" dir="ltr">
            {site.phones.map((phone) => (
              <li key={phone} className={lang === "ar" ? "text-right" : ""}>
                <a href={`tel:${phone}`} className="transition hover:text-fg">
                  {phone}
                </a>
              </li>
            ))}
            <li className={lang === "ar" ? "text-right" : ""}>
              <a href={`mailto:${site.email}`} className="transition hover:text-fg">
                {site.email}
              </a>
            </li>
            <li className={lang === "ar" ? "text-right" : ""}>
              <a href={site.instagram} target="_blank" rel="noopener" className="transition hover:text-fg">
                Instagram {site.instagramHandle}
              </a>
            </li>
            <li className={lang === "ar" ? "text-right" : ""}>
              <a href={site.linkedin} target="_blank" rel="noopener" className="transition hover:text-fg">
                LinkedIn
              </a>
            </li>
            <li className={lang === "ar" ? "text-right" : ""}>
              <a href={site.facebook} target="_blank" rel="noopener" className="transition hover:text-fg">
                Facebook
              </a>
            </li>
            <li className={lang === "ar" ? "text-right" : ""}>
              <a href={whatsappLink()} target="_blank" rel="noopener" className="transition hover:text-fg">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-[1024px] border-t border-line px-6 py-5">
        © {new Date().getFullYear()} {lang === "ar" ? site.nameAr : site.name}. {dict.footer.rights}
      </div>
    </footer>
  );
}
