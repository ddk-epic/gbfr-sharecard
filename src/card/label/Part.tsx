import type { ReactNode } from "react";
import { usePart } from "./Label";
import { CAP_RATIO } from "../label-run";
import { LVL_DEF } from "../lvl-def";
import type { ToneColors } from "./palette";

type PartProps = ToneColors & {
  /** Font size, absolute; this part's cap derives from it. */
  size: number;
  /** Space before this part, x its own cap. Ignored on a Label's first. */
  gap?: number;
  /** Letter-spacing, x its own cap; negative tightens. Applies after the
      last glyph too, which Label takes off the next part's leading gap. */
  tracking?: number;
  /** Per-glyph dx past the leading gap, badge units, one per glyph after
      the first. */
  kerns?: string;
  /** Paint `topColor` solid, emitting no gradient at all. */
  noColorFade?: boolean;
  /** Invisible leading digits ("0" x n) holding a fixed-width slot. They
      advance like real glyphs and so pad left only: a Label using them
      must be `textAnchor="start"`. */
  ghost?: number;
  children: ReactNode;
};

/**
 * The label-part primitive: one gradient under "defs", one tspan under
 * "fill"/"inner". Runs once per mode, so it must be pure - no useId, no
 * state, no effects.
 */
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
    // A flat part takes no gradient id. Both passes read the same prop, so
    // it is skipped in the same place and the id chain stays in step.
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
  // The ghost slot is a link in the same dx chain: gap 0, same size and
  // tracking, its trailing space taken off by the dx0 call below.
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

/** What the game puts in front of a trait's level. */
export function TraitPrefix({ size, ...colors }: PresetProps) {
  const cap = size * CAP_RATIO;
  return (
    <Part size={size} kerns={`${PREFIX_KERN * cap}`} {...colors}>
      T.
    </Part>
  );
}

const { kern1, kern2, wordTrack, cap: REF_CAP } = LVL_DEF.lvl;
/** kern1 (L-v), kern2 (v-l) and the word's tracking, x reference cap. */
const WORD_KERN1 = kern1 / REF_CAP;
const WORD_KERN2 = kern2 / REF_CAP;
const WORD_TRACKING = wordTrack / REF_CAP;

/** The "Lvl" word, kerned off LVL_DEF.lvl so it matches the badges' own. */
export function LvlWord({ size, gap, ...colors }: PresetProps) {
  const cap = size * CAP_RATIO;
  return (
    <Part
      size={size}
      gap={gap}
      tracking={WORD_TRACKING}
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
  /** Letter-spacing, x this part's own cap. */
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
