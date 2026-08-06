import { useId, useMemo } from "react";
import { BADGE, inkSpan, layoutDigits } from "./lvl-badge";
import {
  FIGURE_BASELINE,
  FIGURE_XHEIGHT,
  LVL_DIAMOND,
} from "./digits.generated";
import { useCardFontsReady } from "./fonts";
import { fitSize, labelCtx, layoutLabel, LVL_WORD } from "./lvl-label";
import { Figures, LabelDefs, LabelRun, type SvgId } from "./label-run";

/**
 * Paints nothing outside the diamond; the portrait shows through around it.
 * Places itself, so it needs a positioned ancestor - inset is px in from its top-left.
 */
export function LvlDiamond({
  level,
  size = BADGE.box.w,
  inset = 0,
}: {
  level: number;
  size?: number;
  inset?: number;
}) {
  const uid = useId();
  // url(#name) resolves document-wide, not per svg, so every id is namespaced.
  const id: SvgId = (name) => `${uid}-${name}`;

  const { box } = BADGE;
  const label = useLvlLabel();
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
      {label && <LvlLabel id={id} metrics={label} />}
      <LvlDigits level={level} />
    </svg>
  );
}

function DiamondBackdrop() {
  const { diamond } = BADGE;
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
  const { diamond, digits } = BADGE;
  const placements = layoutDigits(String(level), digits.tracking);
  const span = inkSpan(placements);
  // Everything is a share of the diamond's width, so the figures ride it.
  const width = diamond.outer * 2;
  const scale = (digits.xHeight * width) / FIGURE_XHEIGHT;
  return (
    <Figures
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

const FAMILY = "'GBFR UI Medium'";

type LabelMetrics = { size: number; xs: number[] };

/** Lays out the badge's own "Lvl", centred on its ink; font must be loaded. */
function measureLvlLabel(): LabelMetrics | null {
  const ctx = labelCtx();
  if (!ctx) return null;

  const size = fitSize(ctx, FAMILY, BADGE.lvl.cap);
  if (!size) return null;

  const laid = layoutLabel(ctx, FAMILY, size, [{ text: LVL_WORD, scale: 1 }]);
  const shift = -(laid.inkLeft + laid.inkRight) / 2;
  return { size, xs: laid.pieces[0].positions.map((x) => x + shift) };
}

/** The badge's own "Lvl", centred on its ink over the diamond. */
function useLvlLabel(): LabelMetrics | null {
  const ready = useCardFontsReady();
  return useMemo(() => (ready ? measureLvlLabel() : null), [ready]);
}

function LvlLabel({
  id,
  metrics,
  text = LVL_WORD,
}: {
  id: SvgId;
  metrics: LabelMetrics;
  text?: string;
}) {
  const { lvl } = BADGE;
  return (
    <LabelRun
      ink={id}
      x={metrics.xs.map((x) => lvl.centre + x).join(" ")}
      size={metrics.size}
      outline={lvl.outline}
    >
      {text}
    </LabelRun>
  );
}
