import { ChevronLeft } from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";

const CTA_VARIANT = {
  primary:
    "bg-linear-90 from-gold to-gold-deep text-white [text-shadow:0_1px_2px_rgba(90,30,0,0.55)] shadow-[0_2px_12px_rgba(90,30,0,0.28)] hover:brightness-[1.07]",
  secondary:
    "bg-white/85 text-ink-strong shadow-[inset_0_0_0_1px_var(--line)] hover:bg-white",
};

export function Cta({
  children,
  variant = "primary",
  sm = false,
  onClick,
}: {
  children: ReactNode;
  variant?: keyof typeof CTA_VARIANT;
  sm?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 font-bold tracking-wider ${
        sm
          ? "rounded-md px-4 py-1.75 text-[13.5px]"
          : "rounded-[7px] px-7 py-2.75 text-[15.5px]"
      } ${CTA_VARIANT[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** Transparent hit area over a section, opening its editor. */
export function EditOverlay({
  label,
  radius = "lg",
  onOpen,
}: {
  label: string;
  radius?: "md" | "lg";
  onOpen: (el: Element) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`hover:bg-band/15 absolute inset-0 z-10 cursor-pointer ${
        radius === "md" ? "rounded-md" : "rounded-lg"
      }`}
      onClick={(e) => onOpen(e.currentTarget)}
    />
  );
}

export function BackButton({
  label,
  inline = false,
  onClick,
}: {
  label: string;
  /** Sits in a header row rather than floating over the stage. */
  inline?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      className={`text-ink-strong flex cursor-pointer items-center gap-1.25 rounded-md bg-white/80 px-4.5 py-2 text-[15px] font-bold shadow-[inset_0_0_0_1px_var(--line)] hover:bg-white ${
        inline ? "" : "absolute top-19 left-10 z-2"
      }`}
      onClick={onClick}
    >
      <ChevronLeft size={16} aria-hidden />
      <span>{label}</span>
    </button>
  );
}
