import type { ReactNode } from "react";

/* Heading variants */
const HEADING_TONE = {
  band: "from-band via-band-soft to-[rgba(156,198,221,0)] text-ink-strong",
  deep: "from-deep-2 via-deep-3 to-deep-4 text-white [text-shadow:0_1px_4px_rgba(10,50,70,0.5)]",
};

/* Size variants */
const HEADING_SIZE = {
  md: "px-3 py-1.75 text-[15px]",
  lg: "px-4 py-2 text-[20px]",
};

/** Section heading */
export function Heading({
  children,
  tone = "band",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof HEADING_TONE;
  size?: keyof typeof HEADING_SIZE;
  className?: string;
}) {
  return (
    <h3
      className={`font-med rounded bg-linear-90 from-0% via-45% to-100% tracking-wider uppercase ${HEADING_SIZE[size]} ${HEADING_TONE[tone]} ${className}`}
    >
      {children}
    </h3>
  );
}
