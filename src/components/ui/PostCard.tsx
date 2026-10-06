import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatDate, type PostMeta } from "@/lib/blog";

export default function PostCard({
  post,
  lang,
  dict,
  large = false,
}: {
  post: PostMeta;
  lang: Locale;
  dict: Dictionary["blog"];
  large?: boolean;
}) {
  const [a, b] = post.colors;
  return (
    <Link
      href={`/${lang}/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-panel transition duration-500 hover:-translate-y-1"
    >
      <div
        aria-hidden
        className={`relative overflow-hidden ${large ? "aspect-[16/7]" : "aspect-[16/9]"}`}
        style={{ background: `radial-gradient(120% 120% at 20% 0%, ${a}, transparent 55%), radial-gradient(120% 120% at 100% 100%, ${b}, transparent 60%), #111113` }}
      >
        <span className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.06)_95%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.06)_95%)] bg-[length:28px_28px]" />
        {post.tags[0] && (
          <span className="absolute bottom-4 start-4 rounded-full bg-black/40 px-3 py-1 text-[13px] text-white backdrop-blur">
            {post.tags[0]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-7">
        <p className="text-[13px] text-muted">
          {formatDate(post.date, lang)} · {post.readingMinutes} {dict.minutes}
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
