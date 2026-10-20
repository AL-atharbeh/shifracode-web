import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, locales, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getService, services } from "@/content/services";
import { getProject, type Project } from "@/content/projects";
import { getPost } from "@/lib/blog";
import { site, whatsappLink } from "@/content/site";
import { alternatesFor, breadcrumbJsonLd, jsonLdString } from "@/lib/seo";
import ProjectMockup from "@/components/ui/ProjectMockup";
import Reveal from "@/components/ui/Reveal";
import SplitWords from "@/components/motion/SplitWords";

export function generateStaticParams() {
  return locales.flatMap((lang) => services.map((s) => ({ lang, slug: s.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const service = getService(slug);
  if (!hasLocale(lang) || !service) return {};
  const title = tr(service.metaTitle, lang);
  const description = tr(service.metaDescription, lang);
  return {
    title,
    description,
    alternates: alternatesFor(lang, `/services/${slug}`),
    openGraph: { title, description, url: `${site.url}/${lang}/services/${slug}` },
  };
}

export default async function ServicePage({ params }: PageProps<"/[lang]/services/[slug]">) {
  const { lang, slug } = await params;
  const service = getService(slug);
  if (!hasLocale(lang) || !service) notFound();
  const dict = getDictionary(lang);
  const t = dict.servicePage;
  const [a, b] = service.colors;
  const url = `${site.url}/${lang}/services/${slug}`;
  const related = service.related.map(getProject).filter((p): p is Project => p !== undefined);
  const post = service.post ? getPost(lang, service.post) : null;
  const others = services.filter((s) => s.slug !== slug);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: tr(service.name, lang),
      description: tr(service.metaDescription, lang),
      url,
      serviceType: tr(service.name, lang),
      provider: { "@id": `${site.url}/#organization` },
      areaServed: [
        { "@type": "City", name: "Amman" },
        { "@type": "Country", name: "Jordan" },
      ],
      inLanguage: lang,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: service.faq.map((f) => ({
        "@type": "Question",
        name: tr(f.q, lang),
        acceptedAnswer: { "@type": "Answer", text: tr(f.a, lang) },
      })),
    },
    breadcrumbJsonLd(lang, [
      { name: dict.nav.services, path: "#services" },
      { name: tr(service.name, lang), path: `/services/${slug}` },
    ]),
  ];

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />

      <header className="relative overflow-hidden px-6 pb-16 pt-32 text-center sm:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[60vmin] w-[90vmin] -translate-x-1/2 rounded-full opacity-40 blur-[100px]"
          style={{ background: `radial-gradient(circle, ${a}, ${b} 60%, transparent 75%)` }}
        />
        <div className="relative">
          <Link href={`/${lang}#services`} className="text-[15px] text-accent hover:underline">
            {lang === "ar" ? "›" : "‹"} {t.back}
          </Link>
          <p className="mt-8 text-[17px] font-semibold" style={{ color: a }}>
            {tr(service.name, lang)}
          </p>
          <SplitWords
            as="h1"
            mode="load"
            text={tr(service.headline, lang)}
            className="tracking-display mx-auto mt-3 max-w-[900px] text-[36px] font-semibold leading-[1.15] sm:text-[60px]"
          />
          <p className="mx-auto mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted sm:text-[19px]">
            {tr(service.intro, lang)}
          </p>
          <a
            href={whatsappLink(dict.contact.whatsappMessage)}
            target="_blank"
            rel="noopener"
            className="mt-8 inline-block rounded-full bg-accent-strong px-8 py-3.5 text-[17px] font-medium text-white transition hover:bg-accent"
          >
            {t.ctaButton}
          </a>
        </div>
      </header>

      <Reveal className="mx-auto grid max-w-[1024px] gap-4 px-6 pb-24 sm:grid-cols-2">
        <section data-reveal className="rounded-[28px] bg-panel p-8 sm:col-span-2 sm:p-10">
          <h2 className="tracking-title text-[24px] font-semibold sm:text-[28px]">{t.includes}</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {service.includes.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[17px]">
                <span
                  aria-hidden
                  className="mt-2.5 block h-1 w-6 shrink-0 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${a}, ${b})` }}
                />
                {tr(item, lang)}
              </li>
            ))}
          </ul>
        </section>

        <section data-reveal className="rounded-[28px] bg-panel p-8 sm:col-span-2 sm:p-10">
          <h2 className="tracking-title text-[24px] font-semibold sm:text-[28px]">{t.audience}</h2>
          <ul className="mt-6 space-y-3 text-[17px] text-muted">
            {service.audience.map((item, i) => (
              <li key={i}>{tr(item, lang)}</li>
            ))}
          </ul>
        </section>
      </Reveal>

      {related.length > 0 && (
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-[1024px]">
            <h2 className="tracking-title text-[28px] font-semibold">{t.work}</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${lang}/projects/${p.slug}`} className="group block overflow-hidden rounded-[24px] bg-panel">
                    <ProjectMockup kind={p.mockup} icon={p.icon} screens={p.screens} device={p.device} colors={p.colors} lang={lang} className="aspect-[4/3]" />
                    <div className="p-5">
                      <p className="text-[13px] font-semibold" style={{ color: p.colors[0] }}>
                        {tr(p.category, lang)}
                      </p>
                      <p className="mt-1 text-[19px] font-semibold group-hover:text-accent">{tr(p.name, lang)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-[760px]">
          <h2 className="tracking-title text-[28px] font-semibold">{t.faq}</h2>
          <div className="mt-8 space-y-3">
            {service.faq.map((f, i) => (
              <details key={i} className="group rounded-[20px] bg-panel p-6" open={i === 0}>
                <summary className="cursor-pointer list-none text-[19px] font-semibold">
                  <h3 className="inline">{tr(f.q, lang)}</h3>
                </summary>
                <p className="mt-3 text-[17px] leading-relaxed text-muted">{tr(f.a, lang)}</p>
              </details>
            ))}
          </div>
          {post && (
            <p className="mt-8 text-[17px]">
              {t.readMore}:{" "}
              <Link href={`/${lang}/blog/${post.slug}`} className="text-accent hover:underline">
                {post.title}
              </Link>
            </p>
          )}
        </div>
      </section>

      <section data-abu="contact" className="mx-4 mb-20 rounded-[32px] bg-panel px-6 py-16 text-center sm:mx-auto sm:max-w-[1024px]">
        <h2 className="tracking-display text-gradient-brand pb-2 text-[36px] font-semibold sm:text-[56px]">{t.ctaTitle}</h2>
        <a
          href={whatsappLink(dict.contact.whatsappMessage)}
          target="_blank"
          rel="noopener"
          className="mt-6 inline-block rounded-full bg-accent-strong px-8 py-3.5 text-[17px] font-medium text-white transition hover:bg-accent"
        >
          {t.ctaButton}
        </a>
      </section>

      <section className="border-t border-line px-6 py-20">
        <div className="mx-auto max-w-[1024px]">
          <h2 className="tracking-title text-[28px] font-semibold">{t.more}</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/${lang}/services/${s.slug}`}
                  className="block rounded-[20px] bg-panel p-5 text-[17px] font-semibold transition hover:text-accent"
                >
                  {tr(s.name, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
