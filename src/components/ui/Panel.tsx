import type { ReactNode } from "react";

/** Bordered panel exclusively for the card. */
export function SectionPanel({
  children,
  fill = false,
  shadow = false,
  className = "",
}: {
  children: ReactNode;
  fill?: boolean;
  shadow?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`border-line relative rounded-lg border bg-white/90 px-3.5 py-3.5 backdrop-blur-[3px] ${
        fill ? "flex flex-1 flex-col" : ""
      } ${shadow ? "shadow-[0_1px_8px_rgba(23,60,90,0.1)]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* Panel padding variants */
const PANEL_PAD = { md: "px-4.5 py-4", sm: "px-4 py-3.5", none: "" };

export function Panel({
  children,
  pad = "md",
  className = "",
}: {
  children: ReactNode;
  pad?: keyof typeof PANEL_PAD;
  className?: string;
}) {
  return (
    <div
      className={`border-line flex flex-col gap-3 rounded-xl border bg-white/75 shadow-[0_8px_40px_rgba(23,60,90,0.18)] backdrop-blur-xs ${PANEL_PAD[pad]} ${className}`}
    >
      {children}
    </div>
  );
}
