import type { Dictionary } from "@/i18n/dictionaries";

export default function Industries({ dict }: { dict: Dictionary["industries"] }) {
  // Duplicated once so the marquee loops seamlessly at -50%.
  const row = [...dict.items, ...dict.items];

  return (
    <section className="overflow-hidden bg-ink py-20 sm:py-28">
      <h2 className="tracking-display px-6 text-center text-[32px] font-semibold sm:text-[48px]">{dict.title}</h2>
      <div className="relative mt-12 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <ul className="animate-marquee flex w-max gap-3">
          {row.map((item, i) => (
            <li
              key={i}
              aria-hidden={i >= dict.items.length}
              className="whitespace-nowrap rounded-full border border-line bg-panel px-6 py-3 text-[17px] text-fg/85"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
