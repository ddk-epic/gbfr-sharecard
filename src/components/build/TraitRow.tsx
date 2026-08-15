import type { ReactNode } from "react";

const TRAIT_ROW_SIZE = {
  md: "py-1 text-xl",
  sm: "py-[3.5px] text-lg",
  lg: "py-[6px] text-2xl",
};

export function TraitRow({
  children,
  size = "md",
  flush = false,
}: {
  children: ReactNode;
  size?: keyof typeof TRAIT_ROW_SIZE;
  flush?: boolean;
}) {
  return (
    <div
      className={`border-line-soft grid grid-cols-[22px_1fr_auto] items-center gap-2.25 ${TRAIT_ROW_SIZE[size]} ${
        flush ? "pb-0" : "border-b last:border-b-0 last:pb-0"
      }`}
    >
      {children}
    </div>
  );
}
