import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";

// not-found receives no params; show both languages.
export default function NotFound() {
  const ar = getDictionary("ar");
  const en = getDictionary("en");
  return (
    <section className="flex min-h-[80dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-titanium text-[96px] font-semibold leading-none">404</p>
      <h1 className="text-[28px] font-semibold">{ar.notFound.title}</h1>
      <p className="text-[19px] text-muted">{en.notFound.title}</p>
      <div className="mt-4 flex gap-6 text-[17px] text-accent">
        <Link href="/ar">{ar.notFound.back}</Link>
        <Link href="/en">{en.notFound.back}</Link>
      </div>
    </section>
  );
}
