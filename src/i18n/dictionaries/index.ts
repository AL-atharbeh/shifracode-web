import type { Locale } from "../config";
import { ar, type Dictionary } from "./ar";
import { en } from "./en";

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export const getDictionary = (lang: Locale) => dictionaries[lang];
export type { Dictionary };
