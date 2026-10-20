import type { ReactNode } from "react";

/**
 * Renders text as masked words (`.sw > span`) that MotionDirector slides up
 * into view. Words, never letters, so Arabic keeps its joining. A `\n` in the
 * text becomes a line break. Works in server components.
 */
export default function SplitWords({
  text,
  as: Tag = "span",
  className = "",
  mode = "scroll",
  chars = false,
  children,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  /** "scroll": plays when scrolled into view; "load": plays as the page enters. */
  mode?: "scroll" | "load";
  /** Split Latin text into letters for a finer cascade (never use for Arabic). */
  chars?: boolean;
  children?: ReactNode;
}) {
  const lines = text.split("\n");

  return (
    <Tag className={className} data-split={mode} aria-label={text}>
      {lines.map((line, li) => (
        <span key={li} aria-hidden className="block">
          {line.split(" ").map((word, wi, words) => (
            <span key={wi}>
              {chars ? (
                <span className="sw-word">
                  {Array.from(word).map((ch, ci) => (
                    <span key={ci} className="sw">
                      <span>{ch}</span>
                    </span>
                  ))}
                </span>
              ) : (
                <span className="sw">
                  <span>{word}</span>
                </span>
              )}
              {wi < words.length - 1 ? " " : null}
            </span>
          ))}
        </span>
      ))}
      {children}
    </Tag>
  );
}
