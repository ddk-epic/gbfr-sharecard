import { useEffect, useId, useState } from "react";
import {
  BADGE,
  CELL,
  CELL_INK_TOP,
  digitPositions,
  LABEL_INK,
  mix,
  type DigitGlyph,
  type DigitPlacement,
  type LabelTone,
} from "./lvl-badge";
import { DIGIT_GLYPHS } from "./digits.generated";
import { fitSize, layoutRun, LVL_WORD } from "./lvl-run";

/**
 * Paints nothing outside the diamond; the portrait shows through around it.
 * Places itself, so it needs a positioned ancestor - inset is px in from its top-left.
 */
export function LvlBadge({
  level,
  size = BADGE.box.w,
  inset,
}: {
  level: number;
  size?: number;
  inset: number;
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
        <Defs id={id} />
      </defs>
      <LvlDiamond id={id} />
      <rect
        width={box.w}
        height={box.h}
        fill={`url(#${id("glow")})`}
        clipPath={`url(#${id("face")})`}
      />
      {label && <LvlLabel id={id} metrics={label} />}
      <LvlDigits level={level} id={id} />
    </svg>
  );
}

export type SvgId = (name: string) => string;

function Defs({ id }: { id: SvgId }) {
  const { diamond, glow, color } = BADGE;
  return (
    <>
      <radialGradient
        id={id("glow")}
        gradientUnits="userSpaceOnUse"
        cx={diamond.cx}
        cy={diamond.cy}
        r={glow.r}
      >
        <stop offset="0" stopColor={color.glow} stopOpacity="1" />
        <stop offset={glow.core} stopColor={color.glow} stopOpacity="1" />
        <stop
          offset={(1 + glow.core) / 2}
          stopColor={color.glow}
          stopOpacity={glow.bend}
        />
        <stop offset="1" stopColor={color.glow} stopOpacity="0" />
      </radialGradient>
      <clipPath id={id("face")}>
        <path d={diamondPath(diamond.outer)} />
      </clipPath>
      <filter id={id("soft")} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>

      <DigitInkDefs id={id} />
      <LabelDefs id={id} />
    </>
  );
}

/** The digit ink, keyline and texture ramp, in glyph units. Shared by any run
    that paints the baked number glyphs, badge or not. */
export function DigitInkDefs({ id }: { id: SvgId }) {
  const { digits, color } = BADGE;
  return (
    <>
      {/* Glyph units over the shared span, so every digit gets the same ramp. */}
      <linearGradient
        id={id("ink")}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1={CELL_INK_TOP}
        x2="0"
        y2={CELL.baseline}
      >
        <stop offset="0" stopColor={color.inkTop} />
        <stop offset={digits.shadeHold} stopColor={color.inkTop} />
        <stop offset="1" stopColor={color.inkBottom} />
      </linearGradient>
      <linearGradient
        id={id("key")}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1={CELL_INK_TOP}
        x2="0"
        y2={CELL.baseline}
      >
        <stop offset="0" stopColor={mix(color.keyline, digits.keylineFade)} />
        <stop offset="1" stopColor={color.keyline} />
      </linearGradient>
      {/* Held off above the shade line, fading in towards the baseline. */}
      <linearGradient
        id={id("texramp")}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1={CELL_INK_TOP}
        x2="0"
        y2={CELL.baseline}
      >
        <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
        <stop offset={digits.shadeHold} stopColor="#ffffff" stopOpacity="0" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="1" />
      </linearGradient>
      <mask id={id("texmask")} maskContentUnits="userSpaceOnUse">
        <rect
          x="-200"
          y="-200"
          width="2000"
          height="1200"
          fill={`url(#${id("texramp")})`}
        />
      </mask>
    </>
  );
}

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

const diamondPath = (r: number) => {
  const { cx, cy } = BADGE.diamond;
  return `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
};

function LvlDiamond({ id }: { id: SvgId }) {
  const { diamond, rule, color } = BADGE;
  const side = diamond.outer * Math.SQRT2;
  const inner = diamond.inner * Math.SQRT2;
  return (
    <g transform={`translate(${diamond.cx} ${diamond.cy}) rotate(45)`}>
      {/* Brightening, not a shadow. */}
      <rect
        x={-side / 2 - 2}
        y={-side / 2 - 2}
        width={side + 4}
        height={side + 4}
        fill="none"
        stroke={color.halo}
        strokeWidth="4"
        filter={`url(#${id("soft")})`}
      />
      <rect
        x={-side / 2}
        y={-side / 2}
        width={side}
        height={side}
        fill={color.face}
        stroke={color.ruleOuter}
        strokeWidth={rule.outerWidth}
      />
      <rect
        x={-inner / 2}
        y={-inner / 2}
        width={inner}
        height={inner}
        fill="none"
        stroke={color.ruleInner}
        strokeWidth={rule.innerWidth}
      />
    </g>
  );
}

function LvlDigits({ level, id }: { level: number; id: SvgId }) {
  const { digits } = BADGE;
  const placements = digitPositions(level, DIGIT_GLYPHS);
  const top = digits.baseline - CELL.baseline * digits.scale;
  return (
    <TexturedDigits
      id={id}
      placements={placements}
      scale={digits.scale}
      top={top}
    />
  );
}

/**
 * The baked number glyphs on one baseline. `placements` are draw origins and
 * `scale`/`top` map glyph units onto the target: same paint as the badge, so a
 * level display can carry the game's textured figures. Needs DigitInkDefs.
 */
export function TexturedDigits({
  id,
  placements,
  scale,
  top,
  glyphs = DIGIT_GLYPHS,
}: {
  id: SvgId;
  placements: DigitPlacement[];
  scale: number;
  top: number;
  glyphs?: Record<string, DigitGlyph>;
}) {
  const { digits } = BADGE;
  return (
    <>
      {placements.map(({ char, x }, n) => {
        const glyph = glyphs[char];
        const clip = id(`clip${n}`);
        return (
          <g key={n} transform={`translate(${x} ${top}) scale(${scale})`}>
            <clipPath id={clip}>
              <path clipRule="evenodd" d={glyph.outline} />
            </clipPath>
            <path
              d={glyph.outline}
              fill={`url(#${id("ink")})`}
              fillRule="evenodd"
              stroke={`url(#${id("key")})`}
              strokeWidth={digits.outline}
              strokeLinejoin="round"
              paintOrder="stroke"
            />
            <g clipPath={`url(#${clip})`} style={{ isolation: "isolate" }}>
              <rect
                width={glyph.width}
                height={glyph.height}
                fill={`url(#${id("ink")})`}
              />
              <image
                href={glyph.texture}
                width={glyph.width}
                height={glyph.height}
                mask={`url(#${id("texmask")})`}
                style={{ mixBlendMode: "multiply" }}
              />
            </g>
          </g>
        );
      })}
    </>
  );
}

const FAMILY = "'GBFR UI'";

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
