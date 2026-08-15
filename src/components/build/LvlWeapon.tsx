import { LVL_DEF, inkSpan, layoutDigits } from "./glyphs/lvl-def";
import { DigitFigures } from "./glyphs/digit-figures";
import { CAP_RATIO, KEYLINE, Label, LvlWord, PALETTE } from "./glyphs/label";
import { FIGURE_BASELINE, FIGURE_XHEIGHT } from "./glyphs/digits.generated";

/** SEED: "Lvl"'s advance at LVL_DEF.lvl.cap (word ratio 1), badge units; scales
    with `wordRatio` like kern1/kern2 do. */
const WORD_ADVANCE = 30;
const GAP = 0.2; // Lvl to number, x cap
/** "Lvl" raised off the shared baseline, rendered px. */
const OFFSET_Y = 2;

/** The figures' x-height, x LVL_DEF.lvl.cap. Old-style figures have no cap to
    match the word against, so this is set to what the hand-cut glyphs it
    replaced rendered at, keeping the row's size. */
const FIGURE_RATIO = 0.72;

/** Weapon level 150 */
export function LvlWeapon({
  cap,
  level,
  wordRatio = 0.5,
  tone = "plain",
  className = "",
}: {
  cap: number;
  level: number;
  wordRatio?: number;
  tone?: "plain" | "gold";
  className?: string;
}) {
  const { cap: uCap } = LVL_DEF.lvl;
  const gScale = (FIGURE_RATIO * uCap) / FIGURE_XHEIGHT;
  const start = WORD_ADVANCE * wordRatio + GAP * uCap;
  // The badge's tracking, for want of a separate calibration for this row.
  const placements = layoutDigits(String(level), LVL_DEF.digits.tracking);
  const span = inkSpan(placements);

  const right = start + (span.hi - span.lo) * gScale;
  const px = cap / uCap;
  const originY = -FIGURE_BASELINE * gScale;

  const figuresAscent =
    (FIGURE_BASELINE - Math.min(...placements.map((p) => p.glyph.y))) * gScale;
  const wordCap = uCap * wordRatio;
  const wordAscent = OFFSET_Y / px + wordCap + (KEYLINE.outer * wordCap) / 2;
  const boxH = Math.max(figuresAscent, wordAscent);
  const top = -boxH;

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
        <g transform={`translate(0 ${-OFFSET_Y / px})`}>
          <Label>
            <LvlWord size={wordCap / CAP_RATIO} {...PALETTE[tone]} />
          </Label>
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
