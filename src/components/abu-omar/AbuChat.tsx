"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { whatsappLink } from "@/content/site";
import AbuAvatar from "./AbuAvatar";

type ErrorCode = keyof Dictionary["chat"]["errors"];
type Message = { role: "user" | "assistant"; content: string; handoff?: string; error?: ErrorCode };

/** Turns bare URLs in assistant text into links (same tab for our own pages). */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            {...(part.includes("shifracode.com") ? {} : { target: "_blank", rel: "noopener" })}
            className="break-all text-accent underline underline-offset-2"
            dir="ltr"
          >
            {part.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export default function AbuChat({
  lang,
  dict,
  open,
  onClose,
}: {
  lang: Locale;
  dict: Dictionary["chat"];
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const patchLast = (patch: (m: Message) => Message) =>
    setMessages((list) => [...list.slice(0, -1), patch(list[list.length - 1])]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history: Message[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          // Only real exchanged text goes to the server (the greeting is UI-only).
          messages: history.filter((m) => m.content && !m.error).map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.body) throw new Error("no body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as { t: string; v?: string; url?: string; code?: ErrorCode };
          if (event.t === "text" && event.v) patchLast((m) => ({ ...m, content: m.content + event.v }));
          if (event.t === "handoff" && event.url) patchLast((m) => ({ ...m, handoff: event.url }));
          if (event.t === "error") patchLast((m) => ({ ...m, error: event.code ?? "failed" }));
        }
      }
    } catch {
      patchLast((m) => ({ ...m, error: "failed" }));
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-label={dict.title}
      className={`fixed inset-x-3 bottom-3 z-50 flex h-[min(600px,78dvh)] flex-col overflow-hidden rounded-[28px] bg-panel-2/95 text-fg shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur-2xl transition-all duration-300 sm:inset-x-auto sm:bottom-24 sm:end-5 sm:w-[390px] ${
        open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-95 opacity-0"
      }`}
    >
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <AbuAvatar className="h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold leading-tight">{dict.title}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />
            {dict.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={dict.close}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-fg/80 transition hover:bg-white/20"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div ref={scroller} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        <Bubble role="assistant">{dict.greeting}</Bubble>
        {messages.map((m, i) => {
          const last = i === messages.length - 1;
          if (m.role === "user") return <Bubble key={i} role="user">{m.content}</Bubble>;
          if (!m.content && !m.error && !m.handoff) {
            return last && busy ? <Typing key={i} label={dict.typing} /> : null;
          }
          return (
            <div key={i} className="space-y-2">
              {m.content && (
                <Bubble role="assistant">
                  <Linkified text={m.content} />
                </Bubble>
              )}
              {m.handoff && (
                <a
                  href={m.handoff}
                  target="_blank"
                  rel="noopener"
                  className="flex w-fit items-center gap-2 rounded-full bg-[#25d366] px-4 py-2.5 text-[14px] font-semibold text-black transition hover:brightness-110"
                >
                  <WhatsAppIcon />
                  {dict.handoff}
                </a>
              )}
              {m.error && (
                <div className="w-fit max-w-[88%] rounded-2xl bg-[#ff453a]/15 px-4 py-2.5 text-[14px] text-[#ffb4ae]">
                  {dict.errors[m.error] ?? dict.errors.failed}{" "}
                  <a href={whatsappLink()} target="_blank" rel="noopener" className="font-semibold underline">
                    {dict.whatsapp}
                  </a>
                </div>
              )}
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {dict.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void send(s)}
                className="rounded-full border border-white/15 px-3 py-1.5 text-[13px] text-fg/85 transition hover:border-accent hover:text-fg"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-white/10 p-3">
        <div className="flex items-end gap-2 rounded-[22px] bg-black/40 p-1.5 ring-1 ring-white/10 focus-within:ring-accent/60">
          <textarea
            ref={field}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send(input);
              }
            }}
            rows={1}
            maxLength={1500}
            placeholder={dict.placeholder}
            className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-[15px] text-fg outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label={dict.send}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-strong text-white transition hover:bg-accent disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">{dict.disclaimer}</p>
      </form>
    </section>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div
      className={`w-fit max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
        role === "user" ? "ms-auto rounded-ee-md bg-accent-strong text-white" : "rounded-es-md bg-white/[0.08]"
      }`}
    >
      {children}
    </div>
  );
}

function Typing({ label }: { label: string }) {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-es-md bg-white/[0.08] px-4 py-3" aria-label={label}>
      {[0, 150, 300].map((d) => (
        <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-fg/60" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2.1.7 2.8.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}
