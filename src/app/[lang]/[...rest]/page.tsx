import { notFound } from "next/navigation";

// Unknown paths under a locale render [lang]/not-found inside the site layout.
export default function CatchAll() {
  notFound();
}
