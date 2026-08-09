import { useId } from "react";
import { LVL_DEF, inkSpan, layoutDigits, type LabelTone } from "./lvl-def";
import { DigitFigures, LabelDefs, LvlWord, type SvgId } from "./label-run";
import { FIGURE_BASELINE, FIGURE_XHEIGHT } from "./digits.generated";

/** SEED: "Lvl"'s own advance at LVL_DEF.lvl.cap (word ratio 1), badge units -
    scales with `wordRatio` like kern1/kern2 do; calibrate by eye, as
    LvlDisplay's numberRight is. */
const WORD_ADVANCE = 33;
const GAP = 0.2; // Lvl to number, x cap
/** "Lvl" raised off the shared baseline, rendered px. */
const OFFSET_Y = 2;
/** Box top past the tallest ink, x cap - a hair of breathing room. */
const TOP_PAD = 0.06;
/** Keyline width base. */
const KEYLINE = 2.8;

/**
 * The figures' x-height as a share of LVL_DEF.lvl.cap. The figures are old-style,
 * so they have no cap to match the word against; this is the size the hand-cut
 * glyphs this replaced were rendering at, kept so the row does not resize.
 */
const FIGURE_RATIO = 0.711;

/**
 * The weapon's level: the "Lvl" word set against the game's textured number
 * glyphs, on one baseline. No bar, no fraction. `cap` is the number's cap in
 * px; the number is meant to read larger than the row's stat plates, so the
 * word's own size is given separately, relative to the number's cap.
 */
export function LvlWeapon({
  cap,
  level,
  wordRatio = 0.5,
  tone = "plain",
  className = "",
}: {
  cap: number;
  level: number;
  /** The word's ink height as a share of the number's cap. */
  wordRatio?: number;
  tone?: LabelTone;
  className?: string;
}) {
  const uid = useId();
  const id: SvgId = (name) => `${uid}-${name}`;

  const { cap: uCap, baseline } = LVL_DEF.lvl;
  const gScale = (FIGURE_RATIO * uCap) / FIGURE_XHEIGHT;
  const start = WORD_ADVANCE * wordRatio + GAP * uCap;
  // The badge's tracking, for want of a separate calibration for this row.
  const placements = layoutDigits(String(level), LVL_DEF.digits.tracking);
  const span = inkSpan(placements);

  const right = start + (span.hi - span.lo) * gScale;
  const px = cap / uCap;
  const originY = baseline - FIGURE_BASELINE * gScale;

  // The box bottom edge is the text baseline itself: an inline SVG's flex
  // baseline is its box bottom, so pinning that to the baseline lands the
  // figures' feet directly on the line `items-baseline` aligns the row to - the
  // stat plates' own baseline - with no scale-dependent drop to tune. The
  // old-style figures' descenders hang below and paint past the edge (the svg
  // is overflow-visible).
  //
  // The top is fit to the tallest ink, not the stat plates' full box height, so
  // the row holds no dead space above the level. The figures set the ceiling
  // here; the raised "Lvl" is measured too, in case it ever reaches higher.
  const figuresAscent =
    (FIGURE_BASELINE - Math.min(...placements.map((p) => p.glyph.y))) * gScale;
  const wordStroke =
    KEYLINE * LVL_DEF.lvl.wordOutline * (wordRatio / LVL_DEF.lvl.wordRatio);
  const wordAscent = OFFSET_Y / px + uCap * wordRatio + wordStroke / 2;
  const top = baseline - Math.max(figuresAscent, wordAscent) - TOP_PAD * uCap;
  const boxH = baseline - top;

  return (
    <span
      className={`inline-block overflow-visible ${className}`}
      role="img"
      aria-label={`Level ${level}`}
      style={{
        width: right * px,
        height: boxH * px,
      }}
    >
      <svg
        className="block overflow-visible"
        viewBox={`0 ${top} ${right} ${boxH}`}
        width={right * px}
        height={boxH * px}
      >
        <defs>
          {/* The ramp spans the word's own cap, so the smaller word reads as
              light as the badge's rather than only its dark foot. */}
          <LabelDefs id={id} tone={tone} cap={wordRatio * uCap} />
        </defs>
        <g transform={`translate(0 ${-OFFSET_Y / px})`}>
          <LvlWord id={id} x={0} ratio={wordRatio} outline={KEYLINE} />
        </g>
        <DigitFigures
          placements={placements}
          scale={gScale}
          originX={start - span.lo * gScale}
          originY={originY}
        />
      </svg>
    </span>
  );
}
