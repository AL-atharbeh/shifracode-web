import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { projects } from "@/content/projects";
import { getPostSlugs } from "@/lib/blog";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    { path: "", priority: 1 },
    ...projects.map((p) => ({ path: `/projects/${p.slug}`, priority: 0.8 })),
    { path: "/blog", priority: 0.7 },
    ...getPostSlugs().map((slug) => ({ path: `/blog/${slug}`, priority: 0.6 })),
  ];

  return paths.flatMap(({ path, priority }) =>
    locales.map((lang) => ({
      url: `${site.url}/${lang}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${site.url}/${l}${path}`])),
      },
    })),
  );
}
