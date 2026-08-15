export function SlantedBar({
  share,
  fadeFrom = "82%",
}: {
  share?: string;
  /** The fade's start, x the bar's width; it ends at the right edge.
      Labels pass labelBox's `barFade`. */
  fadeFrom?: string;
}) {
  const mask = `linear-gradient(90deg,#000 ${fadeFrom},transparent)`;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
      style={{
        height: share ?? "50%",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <span className="bg-slanted-bar absolute inset-y-0 -right-full left-0 origin-bottom skew-x-[-26deg]" />
    </span>
  );
}

export function ReverseSlantedBar({
  share,
  fadeFrom,
  className = "",
}: {
  share?: string;
  fadeFrom?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 -scale-x-100 ${className}`}
    >
      <SlantedBar share={share} fadeFrom={fadeFrom} />
    </span>
  );
}

export function Diamond() {
  return (
    <span className="ml-auto size-6.75 flex-none rotate-45 rounded-sm border-2 border-[#c46a4a] bg-linear-135 from-[#8a2f35] to-[#3d1114]" />
  );
}
