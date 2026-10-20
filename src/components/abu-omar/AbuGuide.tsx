"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { whatsappLink } from "@/content/site";
import AbuAvatar from "./AbuAvatar";
import AbuChat from "./AbuChat";

type GuideKey = Exclude<keyof Dictionary["abu"], "name">;

/**
 * Floating Abu Omar: comments on the section in view (sections opt in with
 * `data-abu="<key>"`) and opens the AI chat when tapped. The speech bubble is
 * hidden over the hero.
 */
export default function AbuGuide({
  lang,
  dict,
  chat,
}: {
  lang: Locale;
  dict: Dictionary["abu"];
  chat: Dictionary["chat"];
}) {
  const pathname = usePathname();
  const [key, setKey] = useState<GuideKey | null>(null);
  const [bubble, setBubble] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const closeChat = useCallback(() => setChatOpen(false), []);

  useEffect(() => {
    const triggers = Array.from(document.querySelectorAll<HTMLElement>("[data-abu]")).map((el) => {
      const k = el.dataset.abu as GuideKey;
      return ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) {
            setKey(k);
            setBubble(true);
          }
        },
      });
    });
    return () => triggers.forEach((t) => t.kill());
  }, [pathname]);

  // Other parts of the page (e.g. the Abu Omar story) can open the chat.
  useEffect(() => {
    const open = () => setChatOpen(true);
    window.addEventListener("abu:open", open);
    return () => window.removeEventListener("abu:open", open);
  }, []);

  // Collapse the speech bubble a few seconds after each new line.
  useEffect(() => {
    if (!key) return;
    const id = window.setTimeout(() => setBubble(false), 5000);
    return () => window.clearTimeout(id);
  }, [key]);

  const showBubble = bubble && !chatOpen && key !== null && key !== "hero";

  return (
    <>
      <AbuChat lang={lang} dict={chat} open={chatOpen} onClose={closeChat} />

      <div className="fixed bottom-5 end-5 z-40 flex items-end gap-3">
        <div
          className={`max-w-[240px] origin-bottom rounded-2xl rounded-ee-sm bg-panel-2/90 px-4 py-3 text-[14px] leading-snug text-fg shadow-2xl ring-1 ring-white/10 backdrop-blur-xl transition-all duration-300 ${
            showBubble ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
          }`}
          role="status"
          aria-live="polite"
        >
          <p className="mb-0.5 text-[12px] font-semibold text-accent">{dict.name}</p>
          <p>{key ? dict[key] : ""}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="rounded-full bg-accent-strong px-3 py-1 text-[13px] font-medium text-white"
            >
              {chat.open}
            </button>
            {key === "contact" && (
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener"
                className="rounded-full bg-[#25d366] px-3 py-1 text-[13px] font-medium text-black"
              >
                {chat.whatsapp}
              </a>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setChatOpen((v) => !v)}
          aria-label={chatOpen ? chat.close : chat.open}
          aria-expanded={chatOpen}
          className={`relative shrink-0 rounded-full shadow-xl ring-2 transition hover:scale-105 ${
            chatOpen ? "ring-accent" : "ring-white/15"
          } ${chatOpen ? "max-sm:hidden" : ""}`}
        >
          <AbuAvatar className="h-14 w-14" />
          {!chatOpen && (
            <span className="absolute -top-0.5 end-0 h-3.5 w-3.5 rounded-full border-2 border-black bg-[#30d158]" aria-hidden />
          )}
        </button>
      </div>
    </>
  );
}
