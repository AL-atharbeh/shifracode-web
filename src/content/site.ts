export const site = {
  name: "Shifra Code",
  nameAr: "شيفرا كود",
  /** Registered company name (commercial register). */
  legalName: "Hikmat Al-Bayanat for Software LLC",
  // Must match the host Vercel serves (apex redirects to www), or Google sees
  // every canonical pointing at a redirect.
  url: "https://www.shifracode.com",
  email: "info@shifracode.com",
  phones: ["+962770466649", "+962770466648"],
  whatsapp: "962770466649",
  instagram: "https://www.instagram.com/shfcod",
  instagramHandle: "@shfcod",
  linkedin: "https://www.linkedin.com/company/shifra-code",
  facebook: "https://www.facebook.com/profile.php?id=61582453484531",
  city: { ar: "عمّان، الأردن", en: "Amman, Jordan" },
  geo: { lat: 31.9967059, lng: 35.845519 },
  mapsUrl: "https://maps.app.goo.gl/ddxYAsbDTJT3JdNv9",
};

/**
 * Abu Omar, the site's mascot: a transparent cut-out (WebP) inside /public.
 * The scroll story assembles him out of code glyphs sampled from this image.
 */
export const abuOmarImage = { src: "/abu-omar/abu-omar.webp", width: 641, height: 1465 };

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
