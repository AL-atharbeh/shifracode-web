import Image from "next/image";
import { tr, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { team } from "@/content/team";
import Reveal from "@/components/ui/Reveal";
import SplitWords from "@/components/motion/SplitWords";

/** Light section — Apple alternates dark and light to pace the page. */
export default function Team({ lang, dict }: { lang: Locale; dict: Dictionary["team"] }) {
  return (
    <section id="team" data-abu="team" className="scroll-mt-12 bg-paper px-6 py-28 text-[#1d1d1f] sm:py-40">
      <Reveal className="mx-auto max-w-[1024px]">
        <p data-reveal className="text-[17px] font-semibold text-[#6e6e73] sm:text-[21px]">
          {dict.eyebrow}
        </p>
        <SplitWords as="h2" text={dict.title} className="tracking-display mt-2 text-[40px] font-semibold leading-[1.1] sm:text-[72px]" />

        <ul className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {team.map((m) => (
            <li key={m.initials} data-reveal data-tilt="10" className="spotlight group relative rounded-[28px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div
                className="relative mx-auto aspect-square w-full max-w-[180px] overflow-hidden rounded-full transition-transform duration-500 group-hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${m.colors[0]}, ${m.colors[1]})` }}
              >
                {m.photo ? (
                  <Image src={m.photo} alt={tr(m.name, lang)} fill sizes="180px" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[56px] font-semibold text-white/90" aria-hidden>
                    {m.initials}
                  </span>
                )}
              </div>
              <h3 className="tracking-title mt-6 text-center text-[21px] font-semibold">{tr(m.name, lang)}</h3>
              <p className="mt-1 text-center text-[15px] text-[#6e6e73]">{tr(m.role, lang)}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
