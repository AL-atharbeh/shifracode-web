import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPosts } from "@/lib/blog";
import { site } from "@/content/site";
import { alternatesFor, jsonLdString } from "@/lib/seo";
import PostCard from "@/components/ui/PostCard";
import Reveal from "@/components/ui/Reveal";
import SplitWords from "@/components/motion/SplitWords";

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
    <div data-abu="blog" className="relative overflow-hidden px-4 pb-28 pt-28 sm:px-6 sm:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />

      {/* Drifting brand glows behind the header */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[720px]">
        <span className="animate-orb absolute start-[8%] top-[6%] h-[420px] w-[420px] rounded-full bg-[#00d4f5]/20 blur-[110px]" />
        <span
          className="animate-orb absolute end-[6%] top-[22%] h-[460px] w-[460px] rounded-full bg-[#3f4cf5]/25 blur-[120px]"
          style={{ animationDelay: "-6s" }}
        />
        <span className="animate-grid absolute inset-0 bg-[linear-gradient(transparent_96%,rgba(255,255,255,0.05)_96%),linear-gradient(90deg,transparent_96%,rgba(255,255,255,0.05)_96%)] bg-[length:40px_40px] [mask-image:radial-gradient(70%_60%_at_50%_30%,#000,transparent)]" />
      </div>

      <Reveal className="relative mx-auto max-w-[1024px]">
        <header className="grid items-end gap-6 text-center md:grid-cols-[1fr_auto] md:text-start">
          <div className="md:pb-10">
            <p data-reveal className="text-[17px] font-semibold text-muted sm:text-[21px]">
              {dict.eyebrow}
            </p>
            <SplitWords
              as="h1"
              mode="load"
              text={dict.title}
              className="split-titanium tracking-display mt-2 max-w-[640px] text-[44px] font-semibold leading-[1.12] max-md:mx-auto sm:text-[64px]"
            />
            <p data-reveal className="mt-4 max-w-[560px] text-[17px] text-muted max-md:mx-auto sm:text-[19px]">
              {dict.description}
            </p>
          </div>
          <div data-reveal className="relative mx-auto h-[260px] w-[200px] sm:h-[340px] sm:w-[260px]">
            <span aria-hidden className="absolute inset-x-4 bottom-2 h-10 rounded-[50%] bg-[#1fa0f5]/40 blur-2xl" />
            <Image
              src="/blog/abu-wave.webp"
              alt={dict.abuAlt}
              width={314}
              height={900}
              priority
              className="animate-float relative mx-auto h-full w-auto drop-shadow-[0_24px_40px_rgba(0,0,0,0.6)]"
            />
          </div>
        </header>

        {featured && (
          <div data-reveal className="mt-16">
            <PostCard post={featured} lang={lang} dict={dict} large priority />
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
