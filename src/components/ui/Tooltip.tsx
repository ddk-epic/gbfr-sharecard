import type { ReactNode } from "react";

export type TooltipPlacement = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "end";

/* Which side of the host the box opens on */
const TOOLTIP_SIDE: Record<TooltipPlacement, string> = {
  top: "bottom-full mb-1.5",
  bottom: "top-full mt-1.5",
  left: "right-full mr-1.5",
  right: "left-full ml-1.5",
};

/* Cross-axis anchor for a box wider than its host */
const TOOLTIP_ALIGN: Record<TooltipPlacement, Record<TooltipAlign, string>> = {
  top: { start: "left-0", end: "right-0" },
  bottom: { start: "left-0", end: "right-0" },
  left: { start: "top-0", end: "bottom-0" },
  right: { start: "top-0", end: "bottom-0" },
};

const TOOLTIP_BOX =
  "pointer-events-none absolute z-20 w-max rounded-sm bg-deep-7/95 px-2.5 py-2 text-lg leading-snug text-deep-ink opacity-0 ring-1 ring-deep-ring/55 shadow-[0_4px_16px_rgba(2,32,58,0.55)] transition-opacity duration-100 group-hover:opacity-100";

export function Tooltip({
  text,
  placement = "top",
  align = "start",
  maxWidth = 470,
  className = "",
  children,
}: {
  text?: string;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
  /** px, wrapping past it. */
  maxWidth?: number;
  className?: string;
  children: ReactNode;
}) {
  if (!text) return <>{children}</>;
  return (
    <div className="group relative">
      {children}
      <span
        role="tooltip"
        style={{ maxWidth }}
        className={`${TOOLTIP_BOX} ${TOOLTIP_SIDE[placement]} ${TOOLTIP_ALIGN[placement][align]} ${className}`}
      >
        {text}
      </span>
    </div>
  );
}
