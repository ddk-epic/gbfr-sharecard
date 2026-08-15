import { DIGIT_GLYPHS, type DigitGlyph } from "./digits.generated";

export type DigitPlacement = {
  char: string;
  /** The ink's left edge, in cell units. */
  x: number;
  glyph: DigitGlyph;
};

/** Origin matches the reference screenshot; the diamond is 110 across. */
const BOX = { w: 140, h: 140 };

export const LVL_DEF = {
  box: BOX,
  diamond: {
    cx: BOX.w / 2,
    cy: BOX.h / 2,
    /** Half-diagonal of the diamond body. */
    outer: 55,
    /** The diamond as a share of the art's canvas half-width. The art carries a
        glow margin outside the body, so it cannot be drawn at `outer`. */
    bodyShare: 133.5 / 148,
  },
  /** The figures' position, x the diamond's width. Stated against the diamond,
      the anchor, so they hold when it resizes and calibrate on it directly. */
  digits: {
    /** The figures' x-height. */
    xHeight: 0.31,
    /** The run's ink centre, off the diamond's own centre. */
    centre: 0,
    /** The baseline, below the diamond's centre. */
    baseline: 0.144,
    /** Cell units between figures; the badge sets them tighter than the atlas
        ships them. */
    tracking: -17,
  },
  /** kern1 is the L-v pair, kern2 v-l, added to the font's advances. */
  lvl: {
    cap: 17,
    kern1: -1.4,
    kern2: -1,
    /** Uniform tracking inside "Lvl", on top of kern1/kern2. */
    wordTrack: 0.3,
    /** The "Lvl" word's ink height as a share of the number's cap. */
    wordRatio: 0.82,
    /** A "Lvl" chip's box height, cap heights. */
    boxHeight: 1.65,
  },
} as const;

/** Walks the pen across the figures' shared-height cells, in cell units. */
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

/** The run's ink span in cell units - what a centred run is centred on. The
    advances overhang the ink both ends, so centring on those sits it visibly
    off. */
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
