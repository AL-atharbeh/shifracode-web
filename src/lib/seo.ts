import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";
import { site } from "@/content/site";

/** Canonical + hreflang alternates for a path that exists in every locale. */
export function alternatesFor(lang: Locale, path = ""): Metadata["alternates"] {
  const languages = Object.fromEntries(locales.map((l) => [l, `${site.url}/${l}${path}`]));
  return {
    canonical: `${site.url}/${lang}${path}`,
    languages: { ...languages, "x-default": `${site.url}/ar${path}` },
  };
}

export function organizationJsonLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}/#organization`,
    name: site.name,
    alternateName: site.nameAr,
    url: `${site.url}/${lang}`,
    logo: `${site.url}/brand/logo.png`,
    email: site.email,
    telephone: site.phones[0],
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Amman",
      addressCountry: "JO",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    areaServed: [
      { "@type": "Country", name: "Jordan" },
      { "@type": "City", name: "Amman" },
    ],
    contactPoint: site.phones.map((telephone) => ({
      "@type": "ContactPoint",
      telephone,
      contactType: "customer service",
      availableLanguage: ["Arabic", "English"],
    })),
    sameAs: [site.instagram, site.linkedin, site.facebook],
    knowsAbout: [
      "Web development",
      "Mobile app development",
      "SaaS",
      "E-commerce",
      "AI chatbots",
      "WhatsApp automation",
      "UI/UX design",
    ],
  };
}

/** Safe JSON for a <script type="application/ld+json"> tag. */
export const jsonLdString = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
