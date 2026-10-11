import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatDate, readingTime, type PostMeta } from "@/lib/blog";
import BlogCover from "./BlogCover";

export default function PostCard({
  post,
  lang,
  dict,
  large = false,
  priority = false,
}: {
  post: PostMeta;
  lang: Locale;
  dict: Dictionary["blog"];
  large?: boolean;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/${lang}/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-panel transition duration-500 hover:-translate-y-1"
    >
      <div className="relative">
        <BlogCover
          variant={post.cover}
          colors={post.colors}
          lang={lang}
          priority={priority}
          className={large ? "aspect-[16/10] sm:aspect-[16/7]" : "aspect-[16/10]"}
        />
        {post.tags[0] && (
          <span className="absolute bottom-4 start-4 z-10 rounded-full bg-black/50 px-3 py-1 text-[13px] text-white backdrop-blur">
            {post.tags[0]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-7">
        <p className="text-[13px] text-muted">
          {formatDate(post.date, lang)} · {readingTime(post.readingMinutes, lang)}
        </p>
        <h3 className={`tracking-title mt-2 font-semibold leading-snug ${large ? "text-[28px] sm:text-[32px]" : "text-[21px]"}`}>
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-[16px] leading-relaxed text-muted">{post.description}</p>
        <span className="mt-auto pt-5 text-[15px] text-accent group-hover:underline">
          {dict.read} {lang === "ar" ? "‹" : "›"}
        </span>
      </div>
    </Link>
  );
}
