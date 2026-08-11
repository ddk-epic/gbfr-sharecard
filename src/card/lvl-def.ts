/**
 * Lvl measurements, in reference-screenshot coordinates - the badge diamond,
 * the "Lvl" chip, and the shared digit layout.
 *
 * The figures and the diamond are the game's own art. Their own metrics - cell,
 * baseline, advances - live in digits.generated.ts and are explained in
 * docs/digits.md; what is here is only where the badge puts them.
 */
import { DIGIT_GLYPHS, type DigitGlyph } from "./digits.generated";

export type DigitPlacement = {
  char: string;
  /** The ink's left edge, in cell units. */
  x: number;
  glyph: DigitGlyph;
};

export const LVL_DEF = {
  /** Origin matches the reference screenshot; the diamond is 110 across. */
  box: { w: 140, h: 140 },
  diamond: {
    cx: 69,
    cy: 70,
    /** Half-diagonal of the diamond body. */
    outer: 55,
    /**
     * The art's diamond as a share of its canvas half-width. It carries a glow
     * margin outside the body, so the image box is larger than the diamond and
     * cannot simply be drawn at `outer`.
     */
    bodyShare: 133.5 / 148,
  },
  /**
   * Where the figures sit, as shares of the diamond's width. The diamond is
   * the anchor - it is the art everything else is placed against - so stating
   * these against it keeps the number put when the diamond is resized, and
   * lets them be calibrated on the diamond rather than through the badge box.
   */
  digits: {
    /** The figures' x-height. */
    xHeight: 0.31,
    /** The run's ink centre, off the diamond's own centre. */
    centre: 0,
    /** The baseline, below the diamond's centre. */
    baseline: 0.143,
    /**
     * Cell units between figures. The set's own advances are the game's, but
     * the badge sets them tighter than the atlas ships them.
     */
    tracking: -17,
  },
  /** kern1 is the L-v pair, kern2 v-l, added to the font's advances. */
  lvl: {
    cap: 17,
    centre: 69.6,
    baseline: 36,
    keylineFade: 0.1,
    inkStart: 0,
    inkEnd: 1.4, // overshoots inkBottom on purpose

    shadeHold: 0,
    kern1: -1.4,
    kern2: -1,
    /** Uniform tracking inside "Lvl", on top of kern1/kern2. */
    wordTrack: 0.3,
    /** The number's keyline width, badge units. */
    outline: 2.5,
    /** The "Lvl" word's ink height as a share of the number's cap. */
    wordRatio: 0.82,
    /** The word's keyline as a share of the number's. */
    wordOutline: 0.82,
    /** A "Lvl" chip's box height, cap heights. The bar fills its bottom half in
        LvlDisplay; a bar-less chip still uses it so its synthesized flex
        baseline (a box's bottom edge) lands the same distance below the true
        text baseline as one with a bar does. */
    boxHeight: 1.65,
  },
  /** The figures carry their own colour; these dress the "Lvl" word. */
  color: {
    inkTop: "#ffffff",
    inkBottom: "#c3e3ff",
    keyline: "#1e3852",
  },
} as const;

/** Clamped: p may exceed 1. */
export function mix(hex: string, p: number, to = "#ffffff") {
  const parse = (c: string) => {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const a = parse(hex);
  const b = parse(to);
  return (
    "#" +
    a
      .map((v, i) =>
        Math.max(0, Math.min(255, Math.round(v + (b[i] - v) * p)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

export const LABEL_INK = {
  plain: {
    top: LVL_DEF.color.inkTop,
    bottom: LVL_DEF.color.inkBottom,
    keyline: LVL_DEF.color.keyline,
  },
  gold: { top: "#ffeedc", bottom: "#ffbe86", keyline: "#80402f" },
  pwr: { top: "#fff1c1", bottom: "#f5cd72", keyline: "#654f0d" },
} as const;

export type LabelTone = keyof typeof LABEL_INK;

/**
 * Walks the pen across the figures' shared-height cells, in cell units.
 * `tracking` sits between figures and never after the last, so a single figure
 * is not padded and a run's box hugs its ink on both sides.
 */
export function layoutDigits(
  text: string,
  tracking = 0,
  glyphs: Record<string, DigitGlyph> = DIGIT_GLYPHS,
): DigitPlacement[] {
  const placements: DigitPlacement[] = [];
  let pen = 0;
  for (const char of text) {
    const glyph = glyphs[char];
    if (!glyph) continue; // an unknown character sets nothing rather than guess
    if (placements.length) pen += tracking;
    placements.push({ char, x: pen + glyph.x, glyph });
    pen += glyph.advance;
  }
  return placements;
}

/**
 * The run's ink span in cell units - what a centred run is centred on. The
 * advances overhang the ink at both ends, so centring on them sits a run
 * visibly off.
 */
export function inkSpan(placements: DigitPlacement[]): {
  lo: number;
  hi: number;
} {
  if (!placements.length) return { lo: 0, hi: 0 };
  return {
    lo: Math.min(...placements.map((p) => p.x)),
    hi: Math.max(...placements.map((p) => p.x + p.glyph.w)),
  };
}
