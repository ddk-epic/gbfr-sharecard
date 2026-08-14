import type { MouseEventHandler, ReactNode } from "react";
import type { TraitId } from "../../domain/build";

export {
  BackdropFrame,
  ParchmentBackdrop,
  type ParchmentBackdropProps,
} from "./ParchmentBackdrop";
import {
  STAT_ICON_ART,
  statIconUrl,
  traitIconUrl,
  type StatIconId,
} from "../../data";

/* Leaf primitives the card and the editor both render. */

const TRAIT_ICON_SIZE = { 16: "size-5.5", 18: "size-6", 22: "size-7" };

export type TraitIconSize = keyof typeof TRAIT_ICON_SIZE;

/** The glyph's box alone, for a caller holding the indent without drawing. */
export const traitIconBox = (size: TraitIconSize = 16) => TRAIT_ICON_SIZE[size];

export function TraitIcon({
  trait,
  size = 16,
}: {
  trait: TraitId;
  size?: keyof typeof TRAIT_ICON_SIZE;
}) {
  const url = traitIconUrl(trait);
  return url ? (
    <img src={url} className={`flex-none ${TRAIT_ICON_SIZE[size]}`} />
  ) : null;
}

/** The `-` a trait cell shows when there is no trait; sized to TraitIcon's box. */
export function EmptyTraitIcon({
  size = 16,
}: {
  size?: keyof typeof TRAIT_ICON_SIZE;
}) {
  return (
    <span
      className={`text-dim inline-flex flex-none items-center justify-center ${TRAIT_ICON_SIZE[size]}`}
    >
      -
    </span>
  );
}

const ORB_SIZE = { 16: "size-5.5", 18: "size-6", 20: "size-6.75" };

/** Skill orb. `size` only ever varies to match a neighbouring glyph. */
export function Orb({ size = 16 }: { size?: keyof typeof ORB_SIZE }) {
  return (
    <span
      className={`flex-none rounded-full border border-[#0006] bg-radial-[circle_at_35%_30%] from-[#ffd98a] to-[#c2571b] ${ORB_SIZE[size]}`}
    />
  );
}

/** Px per source px: the glyphs differ in size and the game scales, not boxes. */
const STAT_ICON_SCALE = 0.27;

export function StatIcon({
  stat,
  scale = STAT_ICON_SCALE,
  className = "",
}: {
  stat: StatIconId;
  scale?: number;
  className?: string;
}) {
  const art = STAT_ICON_ART[stat];
  return (
    <img
      src={statIconUrl(stat)}
      alt=""
      className={`flex-none ${className}`}
      style={{ width: art.w * scale, height: art.h * scale }}
    />
  );
}

const LVL_TONE = {
  value: "text-value",
  hp: "text-hp",
  atk: "text-atk",
  ui: "text-ui",
  dim: "text-dim",
};

const LVL_SIZE = {
  base: "",
  stat: "text-3xl",
  wbase: "text-2xl",
  gear: "text-lg",
};

export function Lvl({
  children,
  tone = "value",
  size = "base",
  unit,
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof LVL_TONE;
  size?: keyof typeof LVL_SIZE;
  unit?: string;
  className?: string;
}) {
  return (
    <span
      className={`font-semibold tabular-nums ${unit ? "relative" : ""} ${LVL_TONE[tone]} ${LVL_SIZE[size]} ${className}`}
    >
      {children}
      {unit && (
        <i className="absolute bottom-px left-full text-[70%] not-italic">
          {unit}
        </i>
      )}
    </span>
  );
}

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

/** One base-stat plate: icon, then the caller's value field. */
export function BaseStat({
  children,
  stat,
  iconScale,
  iconOffset = 17,
  padRight = 16,
  noPadY = false,
  grow = true,
  height,
}: {
  children: ReactNode;
  stat: StatIconId;
  iconScale?: number;
  iconOffset?: number;
  padRight?: number;
  noPadY?: boolean;
  /** Share the row's width evenly with its siblings. */
  grow?: boolean;
  /** Fixed plate height; unset sizes to content. */
  height?: number;
}) {
  return (
    <span
      className={`relative inline-flex min-w-0 items-center ${grow ? "flex-1" : "flex-none"} ${noPadY ? "" : "py-0.75"}`}
      style={{ paddingRight: padRight, height }}
    >
      <SlantedBar />
      <span
        className="relative flex flex-none justify-center"
        style={{ width: iconOffset * 2 }}
      >
        <StatIcon stat={stat} scale={iconScale} />
      </span>
      <span
        className={`relative flex min-w-0 flex-1 items-center ${height === undefined ? "" : "self-baseline"}`}
      >
        {children}
      </span>
    </span>
  );
}

export function Diamond() {
  return (
    <span className="ml-auto size-6.75 flex-none rotate-45 rounded-sm border-2 border-[#c46a4a] bg-linear-135 from-[#8a2f35] to-[#3d1114]" />
  );
}

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
      className={`border-line flex flex-col gap-3 rounded-xl border bg-white/45 shadow-[0_8px_40px_rgba(23,60,90,0.18)] backdrop-blur-xs ${PANEL_PAD[pad]} ${className}`}
    >
      {children}
    </div>
  );
}

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
          : "rounded-[7px] px-8 py-2.75 text-[15.5px]"
      } ${CTA_VARIANT[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function BackButton({
  children,
  inline = false,
  onClick,
}: {
  children: ReactNode;
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
      {children}
    </button>
  );
}
