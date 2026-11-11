import Image from "next/image";

/** Abu Omar's portrait on the brand gradient. */
export default function AbuAvatar({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative block overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_30%,#2fb4e6,#ff2d95_70%)] ${className}`}
      aria-hidden
    >
      <Image src="/abu-omar/avatar.webp" alt="" fill sizes="64px" className="object-cover" />
    </span>
  );
}
