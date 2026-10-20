import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatDate, getPost, getPosts, getPostSlugs, readingTime } from "@/lib/blog";
import { site, whatsappLink } from "@/content/site";
import { alternatesFor, breadcrumbJsonLd, jsonLdString } from "@/lib/seo";
import PostCard from "@/components/ui/PostCard";
import BlogCover from "@/components/ui/BlogCover";
import ReadingProgress from "@/components/ui/ReadingProgress";
import SplitWords from "@/components/motion/SplitWords";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    getPostSlugs()
      .filter((slug) => getPost(lang, slug))
      .map((slug) => ({ lang, slug })),
  );
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const post = getPost(lang, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: alternatesFor(lang, `/blog/${slug}`),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${site.url}/${lang}/blog/${slug}`,
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function BlogPost({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const post = getPost(lang, slug);
  if (!post) notFound();
  const dict = getDictionary(lang);
  const t = dict.blog;
  const [a, b] = post.colors;
  const others = getPosts(lang).filter((p) => p.slug !== slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: lang,
    keywords: post.tags.join(", "),
    url: `${site.url}/${lang}/blog/${slug}`,
    mainEntityOfPage: `${site.url}/${lang}/blog/${slug}`,
    image: `${site.url}/${lang}/opengraph-image`,
    author: { "@id": `${site.url}/#organization` },
    publisher: { "@id": `${site.url}/#organization` },
  };
  const breadcrumbs = breadcrumbJsonLd(lang, [
    { name: t.eyebrow, path: "/blog" },
    { name: post.title, path: `/blog/${slug}` },
  ]);

  return (
    <article className="bg-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString([jsonLd, breadcrumbs]) }} />

      <header className="relative overflow-hidden px-6 pb-12 pt-32 text-center sm:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[60vmin] w-[90vmin] -translate-x-1/2 rounded-full opacity-40 blur-[100px]"
          style={{ background: `radial-gradient(circle, ${a}, ${b} 60%, transparent 75%)` }}
        />
        <div className="relative">
          <Link href={`/${lang}/blog`} className="text-[15px] text-accent hover:underline">
            {lang === "ar" ? "›" : "‹"} {t.back}
          </Link>
          <p className="mt-8 text-[15px] text-muted">
            {formatDate(post.date, lang)} · {readingTime(post.readingMinutes, lang)}
          </p>
          <SplitWords
            as="h1"
            mode="load"
            text={post.title}
            className="tracking-display mx-auto mt-3 max-w-[860px] text-[36px] font-semibold leading-[1.18] sm:text-[56px]"
          />
          <p className="mx-auto mt-5 max-w-[640px] text-[19px] text-muted sm:text-[21px]">{post.description}</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {post.tags.map((tag) => (
              <li key={tag} className="rounded-full border border-line px-3 py-1 text-[13px] text-fg/80">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="mx-auto max-w-[1024px] px-4 pb-16 sm:px-6">
        <BlogCover
          variant={post.cover}
          colors={post.colors}
          lang={lang}
          priority
          className="aspect-[4/3] rounded-[32px] sm:aspect-[16/8]"
        />
      </div>

      <ReadingProgress target="#article-body" />
      <div
        id="article-body"
        className="prose-article mx-auto max-w-[720px] px-6 pb-20"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

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

      {others.length > 0 && (
        <section className="border-t border-line px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[1024px]">
            <h2 className="tracking-title text-[28px] font-semibold">{t.more}</h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {others.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} lang={lang} dict={t} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
