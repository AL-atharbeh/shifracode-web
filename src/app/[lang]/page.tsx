import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import AbuStory from "@/components/sections/AbuStory";
import Services from "@/components/sections/Services";
import Industries from "@/components/sections/Industries";
import Projects from "@/components/sections/Projects";
import Process from "@/components/sections/Process";
import Team from "@/components/sections/Team";
import Contact from "@/components/sections/Contact";
import LatestPosts from "@/components/sections/LatestPosts";
import ChapterHud from "@/components/motion/ChapterHud";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const chapters = [
    { id: "services", label: dict.nav.services },
    { id: "projects", label: dict.nav.projects },
    { id: "process", label: dict.nav.process },
    { id: "team", label: dict.nav.team },
    { id: "blog", label: dict.nav.blog },
    { id: "contact", label: dict.nav.contact },
  ];

  return (
    <>
      <ChapterHud chapters={chapters} />
      <Hero lang={lang} dict={dict.hero} />
      <AbuStory lang={lang} dict={dict.abuStory} />
      <Statement text={dict.statement} />
      <Services lang={lang} dict={dict.services} />
      <Industries dict={dict.industries} />
      <Projects lang={lang} dict={dict.projects} />
      <Process dict={dict.process} />
      <Team lang={lang} dict={dict.team} />
      <LatestPosts lang={lang} dict={dict.blog} />
      <Contact lang={lang} dict={dict.contact} />
    </>
  );
}
