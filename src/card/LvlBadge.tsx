import { useEffect, useId, useState } from "react";
import {
  BADGE,
  inkSpan,
  LABEL_INK,
  layoutDigits,
  mix,
  type DigitPlacement,
  type LabelTone,
} from "./lvl-badge";
import {
  FIGURE_BASELINE,
  FIGURE_XHEIGHT,
  LVL_DIAMOND,
} from "./digits.generated";
import { fitSize, layoutRun, LVL_WORD } from "./lvl-run";

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

export type SvgId = (name: string) => string;

/**
 * Split out so a level display can paint the same ink, outside the diamond.
 * `tone` is the palette; the ramp across it is the badge's either way.
 */
export function LabelDefs({
  id,
  tone = "plain",
  cap = BADGE.lvl.cap,
}: {
  id: SvgId;
  tone?: LabelTone;
  /** The ramp's span above the baseline; pass the word's own cap so a smaller
      word still takes the full ink ramp rather than only its darker foot. */
  cap?: number;
}) {
  const { lvl } = BADGE;
  const ink = LABEL_INK[tone];
  const labelTop = lvl.baseline - cap;
  return (
    <>
      {/* No texture, so the ramp alone shades it: starts tinted, runs past bottom. */}
      <linearGradient
        id={id("lblink")}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1={labelTop}
        x2="0"
        y2={lvl.baseline}
      >
        <stop offset="0" stopColor={mix(ink.top, lvl.inkStart, ink.bottom)} />
        <stop
          offset={lvl.shadeHold}
          stopColor={mix(ink.top, lvl.inkStart, ink.bottom)}
        />
        <stop offset="1" stopColor={mix(ink.top, lvl.inkEnd, ink.bottom)} />
      </linearGradient>
      <linearGradient
        id={id("lblkey")}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1={labelTop}
        x2="0"
        y2={lvl.baseline}
      >
        <stop offset="0" stopColor={mix(ink.keyline, lvl.keylineFade)} />
        <stop offset="1" stopColor={ink.keyline} />
      </linearGradient>
    </>
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

export function Figures({
  placements,
  scale,
  originX,
  originY,
}: {
  placements: DigitPlacement[];
  scale: number;
  originX: number;
  originY: number;
}) {
  return (
    <>
      {placements.map(({ x, glyph }, n) => (
        <image
          key={n}
          href={glyph.src}
          x={originX + x * scale}
          y={originY + glyph.y * scale}
          width={glyph.w * scale}
          height={glyph.h * scale}
        />
      ))}
    </>
  );
}

const FAMILY = "'GBFR UI Medium'";

type LabelMetrics = { size: number; xs: number[] };

/** The badge's own "Lvl", centred on its ink over the diamond. */
function useLvlLabel(): LabelMetrics | null {
  const [metrics, setMetrics] = useState<LabelMetrics | null>(null);

  useEffect(() => {
    let live = true;
    const measure = () => {
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx || !live) return;
      if (!document.fonts.check(`16px ${FAMILY}`)) {
        console.warn(`${FAMILY} did not load; Lvl label omitted`);
        return;
      }

      const size = fitSize(ctx, FAMILY, BADGE.lvl.cap);
      if (!size) {
        console.warn(`${FAMILY} measured no ink; Lvl label omitted`);
        return;
      }

      const run = layoutRun(ctx, FAMILY, size, [{ text: LVL_WORD, scale: 1 }]);
      const shift = -(run.lo + run.hi) / 2;
      setMetrics({ size, xs: run.parts[0].xs.map((x) => x + shift) });
    };

    // measureText never triggers a load; fonts.load does. Catching matters:
    // a rejection here is how an undecodable face silently emptied the label.
    void document.fonts
      .load(`16px ${FAMILY}`, LVL_WORD)
      .then(() => document.fonts.ready)
      .then(measure)
      .catch((err: unknown) => {
        console.warn(`${FAMILY} failed to load; Lvl label omitted`, err);
      });

    return () => {
      live = false;
    };
  }, []);

  return metrics;
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
    <text
      x={metrics.xs.map((x) => lvl.centre + x).join(" ")}
      y={lvl.baseline}
      textAnchor="start"
      fontFamily={FAMILY}
      fontSize={metrics.size}
      fill={`url(#${id("lblink")})`}
      stroke={`url(#${id("lblkey")})`}
      strokeWidth={lvl.outline}
      strokeLinejoin="round"
      paintOrder="stroke"
      xmlSpace="preserve"
    >
      {text}
    </text>
  );
}
