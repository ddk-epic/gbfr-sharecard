import { useId } from "react";
import { LVL_DEF, inkSpan, layoutDigits } from "./lvl-def";
import {
  FIGURE_BASELINE,
  FIGURE_XHEIGHT,
  LVL_DIAMOND,
} from "./digits.generated";
import { DigitFigures, LabelDefs, LvlWord, type SvgId } from "./label-run";

/** Keyline width base. */
const KEYLINE = 3.4;

/**
 * Paints nothing outside the diamond; the portrait shows through around it.
 * Places itself, so it needs a positioned ancestor - inset is px in from its top-left.
 */
export function LvlDiamond({
  level,
  size = LVL_DEF.box.w,
  inset = 0,
}: {
  level: number;
  size?: number;
  inset?: number;
}) {
  const uid = useId();
  // url(#name) resolves document-wide, not per svg, so every id is namespaced.
  const id: SvgId = (name) => `${uid}-${name}`;

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
      <defs>
        <LabelDefs id={id} />
      </defs>
      <DiamondBackdrop />
      <LvlWord id={id} x={lvl.centre} textAnchor="middle" outline={KEYLINE} />
      <LvlDigits level={level} />
    </svg>
  );
}

function DiamondBackdrop() {
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
