import type { Dictionary } from "@/i18n/dictionaries";
import SplitWords from "@/components/motion/SplitWords";
import VelocityMarquee from "@/components/motion/VelocityMarquee";

export default function Industries({ dict }: { dict: Dictionary["industries"] }) {
  const half = Math.ceil(dict.items.length / 2);
  const rows = [dict.items.slice(0, half), dict.items.slice(half)];

  return (
    <section className="overflow-hidden py-20 sm:py-28">
      <SplitWords
        as="h2"
        text={dict.title}
        className="tracking-display px-6 text-center text-[36px] font-semibold sm:text-[64px]"
      />
      <div data-skew className="mt-12 space-y-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        {rows.map((row, r) => (
          <VelocityMarquee key={r} speed={0.8} reverse={r === 1}>
            {row.map((item) => (
              <span
                key={item}
                className="glass me-4 flex items-center gap-3 whitespace-nowrap rounded-full px-7 py-4 text-[18px] text-fg/85 sm:text-[22px]"
              >
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#00d4f5] to-[#3f4cf5]" />
                {item}
              </span>
            ))}
          </VelocityMarquee>
        ))}
      </div>
    </section>
  );
}
