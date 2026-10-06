import Image from "next/image";

/**
 * Official Shifra Code logo (background removed from the supplied JPEG).
 * "mark" = symbol + name for the compact header; "full" = the complete
 * three-line wordmark, which needs room to stay legible.
 */
export default function Logo({ variant = "mark", className = "" }: { variant?: "mark" | "full"; className?: string }) {
  if (variant === "full") {
    return (
      <Image
        src="/brand/logo.png"
        alt="Shifra Code Technology"
        width={363}
        height={126}
        className={`h-auto w-[200px] ${className}`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 font-semibold ${className}`} dir="ltr">
      <Image src="/brand/symbol.png" alt="" width={141} height={126} className="h-7 w-auto" priority />
      <span className="tracking-tight">Shifra Code</span>
    </span>
  );
}
