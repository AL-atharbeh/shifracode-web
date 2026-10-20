import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Readex_Pro } from "next/font/google";
import { dirOf, hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site } from "@/content/site";
import { alternatesFor, jsonLdString, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AbuGuide from "@/components/abu-omar/AbuGuide";
import CodeRain from "@/components/motion/CodeRain";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Cursor from "@/components/motion/Cursor";
import MotionDirector from "@/components/motion/MotionDirector";
import PageTransition from "@/components/motion/PageTransition";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
// Arabic pages use Readex Pro for both scripts so mixed Arabic/Latin text matches.
const readex = Readex_Pro({ variable: "--font-readex", subsets: ["arabic", "latin"], display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);

  return {
    metadataBase: new URL(site.url),
    title: { default: dict.meta.title, template: `%s | ${dict.meta.shortTitle}` },
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    applicationName: site.name,
    alternates: alternatesFor(lang),
    openGraph: {
      type: "website",
      siteName: site.name,
      title: dict.meta.title,
      description: dict.meta.description,
      url: `${site.url}/${lang}`,
      locale: lang === "ar" ? "ar_JO" : "en_US",
      alternateLocale: lang === "ar" ? "en_US" : "ar_JO",
    },
    twitter: { card: "summary_large_image", title: dict.meta.title, description: dict.meta.description },
    robots: { index: true, follow: true },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html lang={lang} dir={dirOf(lang)} className={`${inter.variable} ${readex.variable}`}>
      <body className="min-h-dvh text-fg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString([organizationJsonLd(lang), websiteJsonLd(lang)]) }}
        />
        <CodeRain />
        <div aria-hidden className="film-grain" />
        <SmoothScroll />
        <Header lang={lang} dict={dict} />
        <main>{children}</main>
        <Footer lang={lang} dict={dict} />
        <AbuGuide lang={lang} dict={dict.abu} chat={dict.chat} />
        <MotionDirector />
        <PageTransition
          copy={{
            brand: lang === "ar" ? site.nameAr : site.name,
            greeting: dict.splash.greeting,
            tagline: dict.splash.tagline,
            city: site.city.en,
          }}
        />
        <Cursor />
      </body>
    </html>
  );
}
