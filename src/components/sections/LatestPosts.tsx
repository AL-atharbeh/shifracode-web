import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getPosts } from "@/lib/blog";
import PostCard from "@/components/ui/PostCard";
import Reveal from "@/components/ui/Reveal";

export default function LatestPosts({ lang, dict }: { lang: Locale; dict: Dictionary["blog"] }) {
  const posts = getPosts(lang).slice(0, 3);
  if (!posts.length) return null;

  return (
    <section id="blog" data-abu="blog" className="scroll-mt-12 bg-ink px-4 py-28 sm:px-6 sm:py-40">
      <Reveal className="mx-auto max-w-[1024px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p data-reveal className="text-[17px] font-semibold text-muted sm:text-[21px]">
              {dict.latest}
            </p>
            <h2 data-reveal className="tracking-display mt-2 text-[40px] font-semibold leading-[1.08] sm:text-[56px]">
              {dict.title}
            </h2>
          </div>
          <Link data-reveal href={`/${lang}/blog`} className="text-[17px] text-accent hover:underline">
            {dict.all} {lang === "ar" ? "‹" : "›"}
          </Link>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug} data-reveal>
              <PostCard post={post} lang={lang} dict={dict} />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
