import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { MockupKind, ScreenDevice } from "@/content/projects";

/**
 * Code-drawn UI previews used until real screenshots are provided.
 * Each mockup sits on a gradient stage built from the project's colors.
 */
export default function ProjectMockup({
  kind,
  colors,
  lang,
  icon,
  screens,
  device = "phone",
  className = "",
}: {
  kind: MockupKind;
  colors: [string, string];
  lang: Locale;
  icon?: string;
  screens?: string[];
  device?: ScreenDevice;
  className?: string;
}) {
  const [a, b] = colors;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-panel ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 50% 110%, ${a}55, transparent 60%), #111113`,
      }}
      aria-hidden
    >
      {screens?.length ? (
        device === "browser" ? (
          <BrowserScreensMock screens={screens} />
        ) : device === "tablet" ? (
          <TabletMock screen={screens[0]} />
        ) : (
          <ScreensMock screens={screens} />
        )
      ) : (
        <>
          {kind === "installments" && (
            <InstallmentsMock a={a} b={b} lang={lang} icon={icon} />
          )}
          {kind === "dashboard" && <DashboardMock a={a} b={b} lang={lang} />}
          {kind === "chat" && <ChatMock a={a} lang={lang} />}
          {kind === "gold" && <GoldMock a={a} b={b} lang={lang} />}
        </>
      )}
    </div>
  );
}

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[9/19] h-[88%] rounded-[2.2rem] border-[6px] border-[#2a2a2e] bg-black p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
      <div className="absolute left-1/2 top-2.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
      <div className="h-full overflow-hidden rounded-[1.6rem] bg-[#0f0f11]">
        {children}
      </div>
    </div>
  );
}

/** Real screenshots in two overlapping phones (screens already include the status bar). */
function ScreensMock({ screens }: { screens: string[] }) {
  const [front, back] = screens;
  return (
    <div
      className="relative flex h-[88%] items-center justify-center"
      dir="ltr"
    >
      {back && (
        <div className="relative -me-[12%] aspect-[921/2000] h-[86%] translate-y-[4%] -rotate-6 overflow-hidden rounded-[1.8rem] border-[5px] border-[#2a2a2e] bg-white opacity-90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
          <Image
            src={back}
            alt=""
            fill
            sizes="(min-width: 768px) 220px, 40vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="relative z-10 aspect-[921/2000] h-full overflow-hidden rounded-[2rem] border-[6px] border-[#2a2a2e] bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <Image
          src={front}
          alt=""
          fill
          sizes="(min-width: 768px) 260px, 45vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}

/** A real landscape tablet screenshot in a slim-bezel frame. */
function TabletMock({ screen }: { screen: string }) {
  return (
    <div className="relative aspect-[963/568] w-[86%] overflow-hidden rounded-[1.6rem] border-[10px] border-[#1c1c1f] bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
      <Image src={screen} alt="" fill sizes="(min-width: 768px) 600px, 86vw" className="object-cover" />
    </div>
  );
}

/** Real desktop screenshots in two stacked browser windows. */
function BrowserScreensMock({ screens }: { screens: string[] }) {
  const [front, back] = screens;
  return (
    <div className="relative h-full w-full" dir="ltr">
      {back && (
        <div className="absolute left-[4%] top-[8%] w-[70%] opacity-80">
          <Browser className="w-full">
            <div className="relative aspect-[198/100]">
              <Image src={back} alt="" fill sizes="(min-width: 768px) 480px, 70vw" className="object-cover" />
            </div>
          </Browser>
        </div>
      )}
      <div className={`absolute ${back ? "bottom-[8%] right-[4%] w-[78%]" : "inset-x-[6%] top-1/2 -translate-y-1/2"}`}>
        <Browser className="w-full">
          <div className="relative aspect-[198/100]">
            <Image src={front} alt="" fill sizes="(min-width: 768px) 560px, 80vw" className="object-cover" />
          </div>
        </Browser>
      </div>
    </div>
  );
}

function Browser({ children, className = "w-[88%]" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`${className} overflow-hidden rounded-xl border border-white/10 bg-[#0f0f11] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]`}>
      <div
        className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2"
        dir="ltr"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ms-3 h-4 w-1/3 rounded-full bg-white/5" />
      </div>
      {children}
    </div>
  );
}

function InstallmentsMock({
  a,
  b,
  lang,
  icon,
}: {
  a: string;
  b: string;
  lang: Locale;
  icon?: string;
}) {
  const ar = lang === "ar";
  return (
    <Phone>
      <div className="flex h-full flex-col gap-2.5 p-3 pt-8 text-[9px] text-white">
        <div className="flex items-center gap-2">
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon} alt="" className="h-6 w-6 rounded-lg" />
          ) : (
            <span className="h-6 w-6 rounded-lg" style={{ background: a }} />
          )}
          <p className="text-[12px] font-semibold">{ar ? "شِهد" : "Shahed"}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] p-3">
          <div
            className="mb-2 h-10 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${a}55, ${b}33)` }}
          />
          <p className="font-semibold">{ar ? "سلة المشتريات" : "Your cart"}</p>
          <p className="mt-0.5 text-[15px] font-bold" dir="ltr">
            600 <span className="text-[9px] text-white/60">JOD</span>
          </p>
        </div>
        <div
          className="rounded-2xl p-3"
          style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
        >
          <p className="font-semibold text-black/80">
            {ar ? "قسّطها على 4 دفعات" : "Split into 4 payments"}
          </p>
          <div className="mt-2 flex justify-between">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={`h-5 w-5 rounded-full border-2 border-black/50 ${i === 0 ? "bg-black/60" : ""}`}
                />
                <span className="font-semibold text-black/80" dir="ltr">
                  150
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5">
          {(ar
            ? ["بدون فوائد", "بدون رسوم تأخير"]
            : ["0% interest", "No late fees"]
          ).map((t) => (
            <span
              key={t}
              className="whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-semibold"
              style={{ background: `${a}33`, color: b }}
            >
              ✓ {t}
            </span>
          ))}
        </div>
        <div
          className="mt-auto rounded-full py-2 text-center text-[11px] font-bold text-black"
          style={{ background: b }}
        >
          {ar ? "اشترِ الآن" : "Buy now"}
        </div>
      </div>
    </Phone>
  );
}

function DashboardMock({ a, b, lang }: { a: string; b: string; lang: Locale }) {
  const bars = [40, 65, 50, 80, 60, 95, 75];
  const kpis =
    lang === "ar"
      ? ["المواعيد", "أوامر العمل", "الإيراد"]
      : ["Bookings", "Work orders", "Revenue"];
  return (
    <Browser>
      <div className="flex text-[9px] text-white">
        <div className="hidden w-1/5 space-y-2 border-e border-white/5 p-3 sm:block">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-2 rounded"
              style={{
                background: i === 0 ? a : "#ffffff14",
                width: `${70 + (i % 2) * 20}%`,
              }}
            />
          ))}
        </div>
        <div className="flex-1 space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            {kpis.map((k, i) => (
              <div key={k} className="rounded-lg bg-white/[0.05] p-2">
                <p className="text-white/50">{k}</p>
                <p className="mt-1 text-[14px] font-semibold">
                  {["128", "46", "12.4K"][i]}
                </p>
              </div>
            ))}
          </div>
          <div className="flex h-28 items-end gap-2 rounded-lg bg-white/[0.04] p-3">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(180deg, ${a}, ${b})`,
                }}
              />
            ))}
          </div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: i === 0 ? "#30d158" : a }}
              />
              <span className="h-1.5 w-1/3 rounded bg-white/15" />
              <span className="ms-auto h-1.5 w-10 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </Browser>
  );
}

function ChatMock({ a, lang }: { a: string; lang: Locale }) {
  const msgs =
    lang === "ar"
      ? [
          { me: false, t: "مرحبا، عندكم حجز اليوم؟" },
          {
            me: true,
            t: "أهلاً! نعم، متوفر الساعة 5 و 7 مساءً. أي وقت يناسبك؟",
          },
          { me: false, t: "الساعة 7 لو سمحت" },
          { me: true, t: "تم الحجز ✅ رح يوصلك تذكير قبل الموعد." },
        ]
      : [
          { me: false, t: "Hi, any bookings available today?" },
          {
            me: true,
            t: "Hello! Yes — 5 PM and 7 PM are free. Which works for you?",
          },
          { me: false, t: "7 PM please" },
          { me: true, t: "Booked ✅ You'll get a reminder before your visit." },
        ];
  return (
    <Phone>
      <div className="flex h-full flex-col text-[9px] text-white">
        <div className="flex items-center gap-2 bg-white/[0.05] px-3 pb-2 pt-8">
          <span className="h-6 w-6 rounded-full" style={{ background: a }} />
          <div>
            <p className="font-semibold">AI Agent</p>
            <p className="text-white/50">online</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-1.5 p-2.5">
          {msgs.map((m, i) => (
            <p
              key={i}
              className={`max-w-[80%] rounded-xl px-2.5 py-1.5 leading-snug ${m.me ? "self-end" : "self-start bg-white/10"}`}
              style={m.me ? { background: "#005c4b" } : undefined}
            >
              {m.t}
            </p>
          ))}
        </div>
        <div className="m-2 h-6 rounded-full bg-white/[0.07]" />
      </div>
    </Phone>
  );
}

function GoldMock({ a, b, lang }: { a: string; b: string; lang: Locale }) {
  const karats = [
    { k: "24K", p: "71.40" },
    { k: "21K", p: "62.50" },
    { k: "18K", p: "53.60" },
  ];
  return (
    <Browser>
      <div className="space-y-3 p-4 text-[9px] text-white">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold">
            {lang === "ar" ? "أسعار الذهب الآن" : "Live gold prices"}
          </p>
          <span className="flex items-center gap-1 text-[#30d158]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#30d158]" />{" "}
            LIVE
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {karats.map(({ k, p }) => (
            <div
              key={k}
              className="rounded-lg border border-white/5 p-2"
              style={{ background: `${a}14` }}
            >
              <p style={{ color: a }} className="font-semibold">
                {k}
              </p>
              <p className="mt-1 text-[14px] font-semibold" dir="ltr">
                {p} <span className="text-[8px] text-white/50">JOD/g</span>
              </p>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 300 90" className="w-full rounded-lg bg-white/[0.03]">
          <defs>
            <linearGradient id="gold-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={a} stopOpacity="0.45" />
              <stop offset="1" stopColor={b} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 70 L30 62 L60 66 L90 48 L120 52 L150 38 L180 44 L210 26 L240 32 L270 18 L300 22 L300 90 L0 90Z"
            fill="url(#gold-fill)"
          />
          <path
            d="M0 70 L30 62 L60 66 L90 48 L120 52 L150 38 L180 44 L210 26 L240 32 L270 18 L300 22"
            fill="none"
            stroke={a}
            strokeWidth="2"
          />
        </svg>
      </div>
    </Browser>
  );
}
