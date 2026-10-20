import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, locales, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getProject, projects } from "@/content/projects";
import { site, whatsappLink } from "@/content/site";
import { alternatesFor, breadcrumbJsonLd, jsonLdString } from "@/lib/seo";
import ProjectMockup from "@/components/ui/ProjectMockup";
import Reveal from "@/components/ui/Reveal";
import SplitWords from "@/components/motion/SplitWords";

export function generateStaticParams() {
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!hasLocale(lang) || !project) return {};
  const title = `${tr(project.name, lang)} — ${tr(project.category, lang)}`;
  return {
    title,
    description: tr(project.summary, lang),
    alternates: alternatesFor(lang, `/projects/${slug}`),
    openGraph: { title, description: tr(project.summary, lang), url: `${site.url}/${lang}/projects/${slug}` },
  };
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!hasLocale(lang) || !project) notFound();
  const dict = getDictionary(lang);
  const t = dict.projectPage;
  const [a, b] = project.colors;
  const others = projects.filter((p) => p.slug !== slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: tr(project.name, lang),
    description: tr(project.summary, lang),
    url: `${site.url}/${lang}/projects/${slug}`,
    creator: { "@id": `${site.url}/#organization` },
    ...(project.url ? { sameAs: project.url } : {}),
    keywords: project.stack.flatMap((g) => g.items).join(", "),
    inLanguage: lang,
  };
  const breadcrumbs = breadcrumbJsonLd(lang, [
    { name: dict.nav.projects, path: "#projects" },
    { name: tr(project.name, lang), path: `/projects/${slug}` },
  ]);

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString([jsonLd, breadcrumbs]) }} />

      <header className="px-6 pb-16 pt-32 text-center sm:pt-40">
        <Link href={`/${lang}#projects`} className="text-[15px] text-accent hover:underline">
          {lang === "ar" ? "›" : "‹"} {t.back}
        </Link>
        {project.icon && (
          <Image src={project.icon} alt={tr(project.name, lang)} width={96} height={96} className="mx-auto mt-8 h-20 w-20 rounded-[22px] shadow-2xl" priority />
        )}
        <p className="mt-6 text-[17px] font-semibold" style={{ color: a }}>
          {tr(project.category, lang)}
        </p>
        <SplitWords
          as="h1"
          mode="load"
          text={tr(project.name, lang)}
          chars={lang === "en"}
          className="split-titanium tracking-display mt-2 text-[56px] font-semibold leading-[1.1] sm:text-[110px]"
        />
        <p className="tracking-title mx-auto mt-4 max-w-[720px] text-[21px] font-semibold sm:text-[28px]">
          {tr(project.tagline, lang)}
        </p>
        <p className="mx-auto mt-4 max-w-[640px] text-[17px] text-muted sm:text-[19px]">{tr(project.summary, lang)}</p>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener"
            className="mt-8 inline-block rounded-full px-7 py-3 text-[17px] font-medium text-black transition hover:brightness-110"
            style={{ background: b }}
          >
            {t.visit} ↗
          </a>
        )}
      </header>

      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        <ProjectMockup kind={project.mockup} icon={project.icon} screens={project.screens} device={project.device} colors={project.colors} lang={lang} className="aspect-[4/5] rounded-[32px] sm:aspect-[16/10]" />
      </div>

      <Reveal className="mx-auto grid max-w-[1024px] gap-4 px-6 py-24 sm:grid-cols-2 sm:py-32">
        {[
          { title: t.challenge, body: tr(project.challenge, lang) },
          { title: t.solution, body: tr(project.solution, lang) },
        ].map((block) => (
          <section key={block.title} data-reveal className="rounded-[28px] bg-panel p-8 sm:p-10">
            <h2 className="text-[17px] font-semibold text-muted">{block.title}</h2>
            <p className="tracking-title mt-3 text-[24px] font-semibold leading-snug sm:text-[28px]">{block.body}</p>
          </section>
        ))}

        <section data-reveal className="rounded-[28px] bg-panel p-8 sm:col-span-2 sm:p-10">
          <h2 className="text-[17px] font-semibold text-muted">{t.features}</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {project.features.map((f, i) => (
              <li key={i} className="tracking-title text-[21px] font-semibold">
                <span
                  className="mb-3 block h-1 w-10 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${a}, ${b})` }}
                />
                {tr(f, lang)}
              </li>
            ))}
          </ul>
        </section>

        {project.stack.length > 0 && (
          <section data-reveal className="rounded-[28px] bg-panel p-8 sm:col-span-2 sm:p-10">
            <h2 className="text-[17px] font-semibold text-muted">{t.stack}</h2>
            <div className="mt-4 space-y-6">
              {project.stack.map((group, gi) => (
                <div key={gi}>
                  {group.label && <h3 className="mb-3 text-[19px] font-semibold">{tr(group.label, lang)}</h3>}
                  <ul className="flex flex-wrap gap-2" dir="ltr">
                    {group.items.map((item) => (
                      <li key={item} className="rounded-full border border-line px-4 py-2 text-[15px]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </Reveal>

      <section data-abu="contact" className="px-6 pb-24 text-center sm:pb-32">
        <h2 className="tracking-display text-gradient-brand pb-2 text-[40px] font-semibold sm:text-[64px]">{t.ctaTitle}</h2>
        <a
          href={whatsappLink(dict.contact.whatsappMessage)}
          target="_blank"
          rel="noopener"
          className="mt-8 inline-block rounded-full bg-accent-strong px-8 py-3.5 text-[17px] font-medium text-white transition hover:bg-accent"
        >
          {t.ctaButton}
        </a>
      </section>

      <section className="border-t border-line px-6 py-20">
        <div className="mx-auto max-w-[1024px]">
          <h2 className="tracking-title text-[28px] font-semibold">{t.more}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {others.map((p) => (
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
    </article>
  );
}
