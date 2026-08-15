import type { ReactNode } from "react";
import { usePart } from "./Label";
import { LVL_DEF } from "../lvl-def";
import type { ToneColors } from "./palette";

/** SEED: "GBFR UI Medium" cap-ink height over em. Sizes in the module are font
    sizes; gaps, keylines and ramps are stated x the cap this derives. */
export const CAP_RATIO = 0.71;

type PartProps = ToneColors & {
  /** Font size, absolute; this part's cap derives from it. */
  size: number;
  /** Space before this part, x its own cap. Ignored on a Label's first. */
  gap?: number;
  /** Letter-spacing, x its own cap. */
  tracking?: number;
  /** Per-glyph dx past the leading gap, badge units, one per glyph after
      the first. */
  kerns?: string;
  /** Paint `topColor` solid, emitting no gradient at all. */
  noColorFade?: boolean;
  /** Invisible leading digits ("0" x n) holding a fixed-width slot. They pad
      left only, so the Label must be `textAnchor="start"`. */
  ghost?: number;
  children: ReactNode;
};

/** One gradient under "defs", one tspan under "fill"/"inner". Runs once per
    mode, so it must be pure - no useId, no state, no effects. */
export function Part({
  size,
  topColor,
  bottomColor,
  keylineColor,
  gap = 0,
  tracking = 0,
  kerns,
  noColorFade = false,
  ghost = 0,
  children,
}: PartProps) {
  const ctx = usePart();
  const cap = size * CAP_RATIO;

  if (ctx.mode === "defs") {
    // A flat part takes no gradient id; both passes skip in the same place, so
    // the id chain stays in step.
    if (noColorFade) return null;
    const gradId = ctx.id(`p${ctx.nextGradId()}`);
    const top = ctx.baseline - cap;
    return (
      <linearGradient
        id={gradId}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1={top}
        x2="0"
        y2={ctx.baseline}
      >
        <stop offset="0" stopColor={topColor} />
        <stop offset="1" stopColor={bottomColor} />
      </linearGradient>
    );
  }

  const letterSpacing = tracking * cap;
  // The ghost is a link in the same dx chain: gap 0, same size and tracking,
  // its trailing space taken off by the dx0 call below.
  const ghostDx = ghost > 0 ? ctx.leadingDx(0, cap, tracking) : null;
  const dx0 = ctx.leadingDx(gap, cap, tracking);
  const dx = kerns ? `${dx0} ${kerns}` : `${dx0}`;
  const fill =
    ctx.mode !== "fill"
      ? "none"
      : noColorFade
        ? topColor
        : `url(#${ctx.id(`p${ctx.nextGradId()}`)})`;
  const strokeWidth =
    (ctx.mode === "fill" ? ctx.outerKeyline : ctx.innerKeyline) * cap;

  return (
    <>
      {ghost > 0 && (
        <tspan
          dx={String(ghostDx)}
          fontSize={size}
          letterSpacing={letterSpacing}
          fill="none"
          stroke="none"
        >
          {"0".repeat(ghost)}
        </tspan>
      )}
      <tspan
        dx={dx}
        fontSize={size}
        letterSpacing={letterSpacing}
        fill={fill}
        stroke={keylineColor}
        strokeWidth={strokeWidth}
      >
        {children}
      </tspan>
    </>
  );
}

type PresetProps = ToneColors & { size: number; gap?: number };

/** "T." internal gap, x reference cap. */
const PREFIX_KERN = -0.2 / LVL_DEF.lvl.cap;

/** The game's prefix on a trait's level. */
export function TraitPrefix({ size, ...colors }: PresetProps) {
  const cap = size * CAP_RATIO;
  return (
    <Part size={size} kerns={`${PREFIX_KERN * cap}`} {...colors}>
      T.
    </Part>
  );
}

const { kern1, kern2, wordTrack, cap: REF_CAP } = LVL_DEF.lvl;
/** kern1 (L-v) and kern2 (v-l), x reference cap. */
const WORD_KERN1 = kern1 / REF_CAP;
const WORD_KERN2 = kern2 / REF_CAP;

/** The "Lvl" word, kerned off LVL_DEF.lvl so it matches the badges' own. */
export function LvlWord({
  size,
  gap,
  wordTrack: track = wordTrack,
  ...colors
}: PresetProps & {
  wordTrack?: number;
}) {
  const cap = size * CAP_RATIO;
  return (
    <Part
      size={size}
      gap={gap}
      tracking={track / REF_CAP}
      kerns={`${WORD_KERN1 * cap} ${WORD_KERN2 * cap}`}
      {...colors}
    >
      Lvl
    </Part>
  );
}

/** A numeric value: Part with no kerns, plus an optional ghost slot. */
export function Value({
  size,
  gap,
  tracking = 0,
  noColorFade = false,
  ghost = 0,
  children,
  ...colors
}: ToneColors & {
  size: number;
  gap?: number;
  tracking?: number;
  noColorFade?: boolean;
  ghost?: number;
  children: ReactNode;
}) {
  return (
    <Part
      size={size}
      gap={gap}
      tracking={tracking}
      noColorFade={noColorFade}
      ghost={ghost}
      {...colors}
    >
      {children}
    </Part>
  );
}
