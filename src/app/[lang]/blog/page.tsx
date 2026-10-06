import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPosts } from "@/lib/blog";
import { site } from "@/content/site";
import { alternatesFor, jsonLdString } from "@/lib/seo";
import PostCard from "@/components/ui/PostCard";
import Reveal from "@/components/ui/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang).blog;
  return {
    title: dict.eyebrow,
    description: dict.description,
    alternates: alternatesFor(lang, "/blog"),
    openGraph: { title: dict.title, description: dict.description, url: `${site.url}/${lang}/blog` },
  };
}

export default async function BlogIndex({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang).blog;
  const [featured, ...rest] = getPosts(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${dict.eyebrow} | ${site.name}`,
    description: dict.description,
    url: `${site.url}/${lang}/blog`,
    inLanguage: lang,
    publisher: { "@id": `${site.url}/#organization` },
  };

  return (
    <div data-abu="blog" className="bg-ink px-4 pb-28 pt-32 sm:px-6 sm:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <Reveal className="mx-auto max-w-[1024px]">
        <header className="text-center">
          <p data-reveal className="text-[17px] font-semibold text-muted sm:text-[21px]">
            {dict.eyebrow}
          </p>
          <h1 data-reveal className="tracking-display text-titanium mx-auto mt-2 max-w-[820px] text-[44px] font-semibold leading-[1.08] sm:text-[72px]">
            {dict.title}
          </h1>
          <p data-reveal className="mx-auto mt-4 max-w-[620px] text-[17px] text-muted sm:text-[19px]">
            {dict.description}
          </p>
        </header>

        {featured && (
          <div data-reveal className="mt-16">
            <PostCard post={featured} lang={lang} dict={dict} large />
          </div>
        )}
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {rest.map((post) => (
            <li key={post.slug} data-reveal>
              <PostCard post={post} lang={lang} dict={dict} />
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
