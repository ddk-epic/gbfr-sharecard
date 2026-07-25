/**
 * Lvl badge measurements and digit-run layout, in reference-screenshot coordinates.
 * Texture treatment (tex, tint) is baked into the glyphs by scripts/bake-digits.mjs.
 */

/** Produced by scripts/bake-digits.mjs. */
export type DigitGlyph = {
  /** Glyph units; cells vary in width, share a height. */
  width: number;
  height: number;
  /** even-odd */
  outline: string;
  /** Data URI, pre-corrected; must be multiplied. */
  texture: string;
};

export type DigitPlacement = { char: string; x: number };

export const BADGE = {
  /** Origin matches the reference screenshot; the diamond is 111 square. */
  box: { w: 140, h: 140 },
  /** Half-diagonals. */
  diamond: { cx: 69, cy: 70, outer: 55, inner: 50 },
  rule: { outerWidth: 1.5, innerWidth: 1.4 },
  /** Eyeballed, not measured: the number covers the core in the reference shot. */
  glow: { r: 25.5, core: 0.67, bend: 0.5 },
  /** outline is glyph units, painted under the fill so half shows. */
  digits: {
    scale: 0.13,
    centre: 70,
    baseline: 83.3,
    outline: 27,
    keylineFade: 0.3,
    shadeHold: 0.3,
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
    kern1: -3,
    kern2: 0.1,
    outline: 2.7,
  },
  color: {
    halo: "#2a648f", // soft brightening hugging the diamond, not a shadow
    face: "#3280ae",
    glow: "#5ad3f9",
    ruleOuter: "#ccdfe0",
    ruleInner: "#83c4dd",
    inkTop: "#ffffff",
    inkBottom: "#c3e3ff",
    /** Shared by both keylines. */
    keyline: "#1e3852",
  },
  /** Ink-left to ink-left, glyph units; digits never seen paired are estimated. */
  advance: {
    0: 229,
    1: 119,
    2: 225,
    3: 205,
    4: 207,
    5: 226,
    6: 227,
    7: 217,
    8: 233,
    9: 228,
  } as Record<string, number>,
} as const;

/** The cell every digit shares, in glyph units; pad sits each side of the ink. */
export const CELL = { baseline: 333, ascent: 325, pad: 8 } as const;
export const CELL_INK_TOP = CELL.baseline - CELL.ascent;

/**
 * Badge units. Centred on the run's ink, not its advances - the last glyph
 * contributes only its ink width.
 */
export function digitPositions(
  level: number,
  glyphs: Record<string, DigitGlyph>,
): DigitPlacement[] {
  const chars = [...String(level)].filter((c) => c in glyphs);
  if (!chars.length) return [];

  const { scale, centre } = BADGE.digits;
  const inkWidth = (c: string) => glyphs[c].width - CELL.pad * 2;
  const total =
    chars.slice(0, -1).reduce((sum, c) => sum + BADGE.advance[c], 0) +
    inkWidth(chars[chars.length - 1]);

  let pen = centre - (total * scale) / 2;
  return chars.map((char) => {
    const placement = { char, x: pen - CELL.pad * scale };
    pen += BADGE.advance[char] * scale;
    return placement;
  });
}
