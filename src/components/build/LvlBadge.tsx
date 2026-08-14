import { LVL_DEF, inkSpan, layoutDigits } from "./lvl-def";
import {
  FIGURE_BASELINE,
  FIGURE_XHEIGHT,
  LVL_DIAMOND,
} from "./digits.generated";
import { DigitFigures } from "./digit-figures";
import { CAP_RATIO, Label, LvlWord, PALETTE } from "./label";

/** The word's position on the badge's fixed 140x140 canvas. */
const WORD = { centre: LVL_DEF.diamond.cx, baseline: 36 };

/** Looser than the default LVL_DEF.lvl.wordTrack. */
const WORD_TRACK = 1.2;

/** Lvl 100 diamond badge; inset is px in from its top-left. */
export function LvlBadge({
  level,
  size = LVL_DEF.box.w,
  inset = 0,
}: {
  level: number;
  size?: number;
  inset?: number;
}) {
  const { box, lvl } = LVL_DEF;
  return (
    <svg
      viewBox={`0 0 ${box.w} ${box.h}`}
      width={size}
      height={(size * box.h) / box.w}
      style={{ position: "absolute", top: inset, left: inset, zIndex: 2 }}
      role="img"
      aria-label={`Level ${level}`}
    >
      <LvlBadgeBase />
      <Label x={WORD.centre} baseline={WORD.baseline} textAnchor="middle">
        <LvlWord
          size={lvl.cap / CAP_RATIO}
          wordTrack={WORD_TRACK}
          {...PALETTE.plain}
        />
      </Label>
      <LvlDigits level={level} />
    </svg>
  );
}

function LvlBadgeBase() {
  const { diamond } = LVL_DEF;
  const size = (diamond.outer * 2) / diamond.bodyShare;
  return (
    <image
      href={LVL_DIAMOND}
      x={diamond.cx - size / 2}
      y={diamond.cy - size / 2}
      width={size}
      height={size}
    />
  );
}

function LvlDigits({ level }: { level: number }) {
  const { diamond, digits } = LVL_DEF;
  const placements = layoutDigits(String(level), digits.tracking);
  const span = inkSpan(placements);
  // Everything is a share of the diamond's width, so the figures ride it.
  const width = diamond.outer * 2;
  const scale = (digits.xHeight * width) / FIGURE_XHEIGHT;
  return (
    <DigitFigures
      placements={placements}
      scale={scale}
      // Centred on the run's ink, not its advances, and sat on the baseline.
      originX={
        diamond.cx + digits.centre * width - ((span.lo + span.hi) / 2) * scale
      }
      originY={diamond.cy + digits.baseline * width - FIGURE_BASELINE * scale}
    />
  );
}
