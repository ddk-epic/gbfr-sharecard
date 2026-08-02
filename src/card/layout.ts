/**
 * The card's skeleton: the handful of numbers that have relationships rather
 * than being hand-tuned one-offs. A leaf size stays a Tailwind class at its use
 * site; a number lands here only when something else has to agree with it - the
 * two column seams, widths that must sum to the card, the band that is computed
 * from the slack above it.
 *
 * The dev tuner is React state over this object, so the card renders the same
 * way whether or not anyone is dragging a slider. Its Copy button emits a
 * replacement for CARD_LAYOUT below; pasting it is what makes a tuning session
 * permanent.
 *
 * `cellH` is here despite the trait cell being locked: locked means the slack
 * slider may not touch it, so the trait grid keeps its rhythm however tight the
 * column gets. Setting it deliberately is a different act, and it moves the band.
 */

export const CARD_W = 2880;
export const CARD_H = 1440;

export type CardLayout = {
  /** Uniform padding on all four card edges. The portrait art alone bleeds past it. */
  inset: number;
  /** Portrait | Gear seam, px. */
  gap1: number;
  /** Gear | Master Traits seam, px. */
  gap2: number;
  /** Portrait / Gear / Master Traits, as shares of whatever the gaps leave. */
  cols: [number, number, number];
  /**
   * The upper line, measured down from the card inset: where Status' bottom edge
   * and the master-traits box's bottom edge both land. Raising it gives the two
   * boxes below more room; lowering it squeezes the master traits into less.
   */
  upper: number;
  /**
   * The one gap under the upper line - Status to Skills, master traits to Over
   * Mastery and Summons. Deliberately shared: the two seams read as one line.
   */
  rowGap: number;
  /** How far the bottom line is lifted above the card's padded bottom edge. */
  floor: number;
  /** Master-traits soft spacing, 1 = as authored, 0 = every soft part at its floor. */
  slack: number;
  /** Weapon art box height. Sized, not floored - the sigil rows are column 2's give. */
  artH: number;
  /** Master-trait cell height. Locked against the slack slider, not against this. */
  cellH: number;
};

export const CARD_LAYOUT: CardLayout = {
  inset: 16,
  gap1: 27,
  gap2: 27,
  cols: [20, 27, 53],
  upper: 1102,
  rowGap: 24,
  floor: 2,
  slack: 1,
  artH: 172,
  cellH: 46,
};

/**
 * Column widths in px. The gaps are taken off the top and the shares divide
 * what remains, so the five tracks always sum to exactly CARD_W and no slider
 * can overflow the card.
 */
export function columnWidths(layout: CardLayout) {
  const { inset, gap1, gap2, cols } = layout;
  const free = CARD_W - 2 * inset - gap1 - gap2;
  const shares = cols[0] + cols[1] + cols[2];
  return cols.map((share) => (free * share) / shares) as [
    number,
    number,
    number,
  ];
}

/** The five-track column list: three columns with a seam between each pair. */
export const gridColumns = (layout: CardLayout) => {
  const [c1, c2, c3] = columnWidths(layout);
  return `${c1}px ${layout.gap1}px ${c2}px ${layout.gap2}px ${c3}px`;
};

/**
 * The compressible spacing *between* the sections of a style column, as authored
 * and as far as it may be squeezed. Three things are deliberately absent: cell
 * height and the cell-grid row gap, so the trait grid keeps its rhythm no matter
 * how tight the column gets, and the column's own padding, which is a uniform
 * `p-3` matching its sides - an edge that shrank on only two of its four sides
 * would read as a mistake. Floors differ per part: the rank label's top margin
 * doubles up with the gap above it and can vanish outright.
 */
const SOFT = {
  /** Between the style name and each rank section. */
  colGap: { base: 9, floor: 4 },
  /** Between a rank's label and its cell grid. */
  rankGap: { base: 9, floor: 4 },
  /** Above each rank label. */
  rankMt: { base: 15, floor: 0 },
} as const;

export type SoftPart = keyof typeof SOFT;

/** One soft part at the given slack, interpolated between its floor and base. */
export function soft(part: SoftPart, slack: number) {
  const { base, floor } = SOFT[part];
  return floor + (base - floor) * Math.min(Math.max(slack, 0), 1);
}

/**
 * How far a soft part may be squeezed when the band takes room the traits
 * needed. The slack slider sets what a spacer asks for; this is what flexbox is
 * allowed to talk it down to.
 */
export const softFloor = (part: SoftPart) => SOFT[part].floor;

/**
 * How far the upper line can drop if every soft part is taken to its floor.
 * Counts the per-column occurrences: the style-name gap, and the rank label and
 * its gap, once per rank.
 */
export const SOFT_RANGE =
  4 * (SOFT.colGap.base - SOFT.colGap.floor) +
  4 * (SOFT.rankGap.base - SOFT.rankGap.floor) +
  4 * (SOFT.rankMt.base - SOFT.rankMt.floor);

/** Serialised back into the shape of the CARD_LAYOUT literal above. */
export const formatLayout = (layout: CardLayout) =>
  `export const CARD_LAYOUT: CardLayout = {
  inset: ${layout.inset},
  gap1: ${layout.gap1},
  gap2: ${layout.gap2},
  cols: [${layout.cols.join(", ")}],
  upper: ${layout.upper},
  rowGap: ${layout.rowGap},
  floor: ${layout.floor},
  slack: ${Number(layout.slack.toFixed(3))},
  artH: ${layout.artH},
  cellH: ${layout.cellH},
};`;
