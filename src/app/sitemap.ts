import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import { getPost, getPostSlugs } from "@/lib/blog";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();
  const paths: { path: string; priority: number; lastModified?: Date }[] = [
    { path: "", priority: 1 },
    ...services.map((s) => ({ path: `/services/${s.slug}`, priority: 0.9 })),
    ...projects.map((p) => ({ path: `/projects/${p.slug}`, priority: 0.8 })),
    { path: "/blog", priority: 0.7 },
    ...getPostSlugs().map((slug) => {
      // Real publish date, so Google isn't told every post changed on every deploy.
      const date = getPost("ar", slug)?.date ?? getPost("en", slug)?.date;
      return { path: `/blog/${slug}`, priority: 0.6, lastModified: date ? new Date(date) : undefined };
    }),
  ];

  return paths.flatMap(({ path, priority, lastModified }) =>
    locales.map((lang) => ({
      url: `${site.url}/${lang}${path}`,
      lastModified: lastModified ?? buildDate,
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${site.url}/${l}${path}`])),
      },
    })),
  );
}
