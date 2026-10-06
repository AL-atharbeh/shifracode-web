import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import AbuVideo from "@/components/sections/AbuVideo";
import { abuOmarVideoUrl } from "@/content/site";
import Services from "@/components/sections/Services";
import Industries from "@/components/sections/Industries";
import Projects from "@/components/sections/Projects";
import Process from "@/components/sections/Process";
import Team from "@/components/sections/Team";
import Contact from "@/components/sections/Contact";
import LatestPosts from "@/components/sections/LatestPosts";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <Hero dict={dict.hero} />
      <Statement text={dict.statement} />
      {abuOmarVideoUrl && <AbuVideo src={abuOmarVideoUrl} dict={dict.abuVideo} />}
      <Services dict={dict.services} />
      <Industries dict={dict.industries} />
      <Projects lang={lang} dict={dict.projects} />
      <Process dict={dict.process} />
      <Team lang={lang} dict={dict.team} />
      <LatestPosts lang={lang} dict={dict.blog} />
      <Contact lang={lang} dict={dict.contact} />
    </>
  );
}
