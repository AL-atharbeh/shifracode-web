import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";
import type { Locale } from "@/i18n/config";
import type { CoverVariant } from "@/components/ui/BlogCover";

/**
 * Blog posts live in src/content/blog/<slug>/<lang>.md with a small
 * frontmatter block:
 *
 *   ---
 *   title: ...
 *   description: ...
 *   date: 2026-10-06
 *   tags: a, b
 *   colors: #00d4f5, #3f4cf5
 *   cover: devices | chat | system
 *   ---
 */

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export type PostMeta = {
  slug: string;
  lang: Locale;
  title: string;
  description: string;
  date: string;
  tags: string[];
  colors: [string, string];
  cover: CoverVariant;
  readingMinutes: number;
};

export type Post = PostMeta & { html: string };

function parse(raw: string) {
  // Normalise CRLF (Windows checkouts) so the frontmatter pattern still matches.
  const match = raw.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("Blog post is missing its frontmatter block");
  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  return { data, body: match[2] };
}

const list = (value = "") =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

function loadRaw(slug: string, lang: Locale): { meta: PostMeta; body: string } | null {
  const file = path.join(BLOG_DIR, slug, `${lang}.md`);
  if (!existsSync(file)) return null;
  const { data, body } = parse(readFileSync(file, "utf8"));
  const [c1 = "#00d4f5", c2 = "#3f4cf5"] = list(data.colors);
  const words = body.split(/\s+/).filter(Boolean).length;

  const meta: PostMeta = {
    slug,
    lang,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    tags: list(data.tags),
    colors: [c1, c2],
    cover: (["devices", "chat", "system"] as const).find((v) => v === data.cover) ?? "devices",
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };
  return { meta, body };
}

export function getPostSlugs() {
  if (!existsSync(BLOG_DIR)) return [];
  return readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/** Posts available in a language, newest first. */
export function getPosts(lang: Locale): PostMeta[] {
  return getPostSlugs()
    .map((slug) => loadRaw(slug, lang))
    .filter((p) => p !== null)
    .map((p) => p.meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(lang: Locale, slug: string): Post | null {
  const raw = loadRaw(slug, lang);
  if (!raw) return null;
  return { ...raw.meta, html: marked.parse(raw.body, { async: false }) };
}

/** "1 دقيقة قراءة" / "3 دقائق قراءة" / "5 min read" — Arabic needs number agreement. */
export function readingTime(minutes: number, lang: Locale) {
  if (lang === "en") return `${minutes} min read`;
  if (minutes === 1) return "دقيقة قراءة";
  if (minutes === 2) return "دقيقتا قراءة";
  if (minutes <= 10) return `${minutes} دقائق قراءة`;
  return `${minutes} دقيقة قراءة`;
}

export const formatDate = (date: string, lang: Locale) =>
  new Date(date).toLocaleDateString(lang === "ar" ? "ar-JO" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
