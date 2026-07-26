import type { MouseEventHandler, ReactNode } from "react";

/* Leaf primitives the card and the editor both render. They used to be
   hand-duplicated in Card.css and Editor.css; importing the same component is
   what stops them drifting. */

const ICON_TONE = {
  /* the plain slate chip */
  default: "border-[#a5bcd4] from-line to-[#93aecb]",
  /* recoloured inside a style column */
  style: "border-[#5090d8] from-[#7fd4f8] to-[#2f6ec2]",
  /* recoloured on a summon card's gold strip */
  summon: "border-[#a5502a] from-[#ffd9a0] to-[#c96a2c]",
};

export function Icon({
  tone = "default",
  sm = false,
}: {
  tone?: keyof typeof ICON_TONE;
  sm?: boolean;
}) {
  return (
    <span
      className={`inline-block flex-none rounded border bg-linear-135 ${
        sm ? "size-[13px]" : "size-4"
      } ${ICON_TONE[tone]}`}
    />
  );
}

const ORB_SIZE = { 16: "size-4", 18: "size-[18px]", 20: "size-5" };

/** Skill orb. `size` only ever varies to match a neighbouring glyph. */
export function Orb({ size = 16 }: { size?: keyof typeof ORB_SIZE }) {
  return (
    <span
      className={`flex-none rounded-full border border-[#0006] bg-radial-[circle_at_35%_30%] from-[#ffd98a] to-[#c2571b] ${ORB_SIZE[size]}`}
    />
  );
}

export function Diamond() {
  return (
    <span className="ml-auto size-5 flex-none rotate-45 rounded-[3px] border-[1.5px] border-[#c46a4a] bg-linear-135 from-[#8a2f35] to-[#3d1114]" />
  );
}

/** Section heading. Spacing is the parent's job, so this declares no margin. */
export function Heading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`from-band via-band-soft text-ink-strong rounded bg-linear-90 from-0% via-45% to-[rgba(156,198,221,0)] to-100% px-3 py-1 text-[15px] font-bold tracking-[0.1em] uppercase ${className}`}
    >
      {children}
    </h3>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-line flex flex-col gap-3 rounded-xl border bg-white/45 px-[18px] py-4 shadow-[0_8px_40px_rgba(23,60,90,0.18)] backdrop-blur-[4px] ${className}`}
    >
      {children}
    </div>
  );
}

const CTA_VARIANT = {
  primary:
    "bg-linear-90 from-gold to-gold-deep text-white [text-shadow:0_1px_2px_rgba(90,30,0,0.55)] shadow-[0_2px_12px_rgba(90,30,0,0.28)] hover:brightness-[1.07]",
  secondary:
    "bg-white/85 text-ink-strong shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-white",
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
      className={`inline-flex cursor-pointer items-center justify-center gap-2 font-bold tracking-[0.05em] ${
        sm
          ? "rounded-md px-4 py-[7px] text-[13.5px]"
          : "rounded-[7px] px-8 py-[11px] text-[15.5px]"
      } ${CTA_VARIANT[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** Pinned clear of the margin the viewport clips off. */
export function BackButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      className="text-ink-strong absolute top-[76px] left-10 z-2 flex cursor-pointer items-center gap-[5px] rounded-md bg-white/80 px-[18px] py-2 text-[15px] font-bold shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-white"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
