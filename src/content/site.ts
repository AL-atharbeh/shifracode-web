export const site = {
  name: "Shifra Code",
  nameAr: "شيفرا كود",
  // Must match the host Vercel serves (apex redirects to www), or Google sees
  // every canonical pointing at a redirect.
  url: "https://www.shifracode.com",
  email: "info@shifracode.com",
  phones: ["+962770466649", "+962770466648"],
  whatsapp: "962770466648",
  instagram: "https://www.instagram.com/shfcod",
  instagramHandle: "@shfcod",
  linkedin: "https://www.linkedin.com/company/shifra-code",
  facebook: "https://www.facebook.com/profile.php?id=61582453484531",
  city: { ar: "عمّان، الأردن", en: "Amman, Jordan" },
  geo: { lat: 31.9967059, lng: 35.845519 },
  mapsUrl: "https://maps.app.goo.gl/ddxYAsbDTJT3JdNv9",
};

/**
 * Path to Abu Omar's real 3D model (GLB) inside /public.
 * While null, the site renders the built-in placeholder character.
 * Example: "/models/abu-omar.glb"
 */
export const abuOmarModelUrl: string | null = "/models/abu-omar.glb";

/**
 * Abu Omar's scroll-scrubbed video inside /public. The cinematic video
 * section only appears once this is set. Example: "/videos/abu-omar-v2.mp4"
 */
export const abuOmarVideoUrl: string | null = "/videos/abu-omar-v2.mp4";

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
