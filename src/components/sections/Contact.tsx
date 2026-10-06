import { tr, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { site, whatsappLink } from "@/content/site";
import Reveal from "@/components/ui/Reveal";

export default function Contact({ lang, dict }: { lang: Locale; dict: Dictionary["contact"] }) {
  const cards = [
    {
      label: dict.call,
      lines: site.phones.map((p) => ({ text: p, href: `tel:${p}` })),
      ltr: true,
    },
    { label: dict.email, lines: [{ text: site.email, href: `mailto:${site.email}` }], ltr: true },
    {
      label: dict.social,
      lines: [
        { text: `Instagram ${site.instagramHandle}`, href: site.instagram, external: true },
        { text: "LinkedIn", href: site.linkedin, external: true },
        { text: "Facebook", href: site.facebook, external: true },
      ],
      ltr: true,
    },
    { label: dict.location, lines: [{ text: tr(site.city, lang), href: site.mapsUrl, external: true }], ltr: false },
  ];

  return (
    <section id="contact" data-abu="contact" className="scroll-mt-12 bg-ink px-6 py-28 sm:py-40">
      <Reveal className="mx-auto max-w-[1024px] text-center">
        <p data-reveal className="text-[17px] font-semibold text-muted sm:text-[21px]">
          {dict.eyebrow}
        </p>
        <h2
          data-reveal
          className="tracking-display text-gradient-brand mx-auto mt-2 max-w-[820px] pb-2 text-[48px] font-semibold leading-[1.08] sm:text-[80px]"
        >
          {dict.title}
        </h2>
        <p data-reveal className="mx-auto mt-4 max-w-[560px] text-[19px] text-muted sm:text-[21px]">
          {dict.subtitle}
        </p>

        <div data-reveal className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappLink(dict.whatsappMessage)}
            target="_blank"
            rel="noopener"
            className="rounded-full bg-[#25d366] px-7 py-3.5 text-[17px] font-medium text-black transition hover:brightness-110"
          >
            {dict.whatsapp}
          </a>
          <a
            href={`tel:${site.phones[0]}`}
            className="rounded-full border border-fg/25 px-7 py-3.5 text-[17px] font-medium transition hover:bg-fg/10"
          >
            {dict.call}
          </a>
        </div>

        <div className="mt-16 grid gap-4 text-start sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} data-reveal className="rounded-[24px] bg-panel p-6">
              <p className="text-[14px] font-semibold text-muted">{card.label}</p>
              <ul className="mt-2 space-y-1">
                {card.lines.map((line) => (
                  <li key={line.text} dir={card.ltr ? "ltr" : undefined} className={card.ltr && lang === "ar" ? "text-right" : ""}>
                    {"href" in line && line.href ? (
                      <a
                        href={line.href}
                        {...("external" in line && line.external ? { target: "_blank", rel: "noopener" } : {})}
                        className="text-[17px] transition hover:text-accent"
                      >
                        {line.text}
                      </a>
                    ) : (
                      <span className="text-[17px]">{line.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div data-reveal className="relative mt-4 overflow-hidden rounded-[24px] bg-panel">
          <iframe
            title={dict.mapTitle}
            src={`https://www.google.com/maps?q=${site.geo.lat},${site.geo.lng}&z=16&hl=${lang}&output=embed`}
            className="h-[320px] w-full grayscale invert-[0.92] hue-rotate-180"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* The grayscale filter hides Google's red pin; the map is centred on the office. */}
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener"
            aria-label={dict.location}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <span className="absolute -inset-3 animate-ping rounded-full bg-accent/40" />
            <span className="relative block h-5 w-5 rounded-full border-[3px] border-white bg-accent-strong shadow-lg" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
