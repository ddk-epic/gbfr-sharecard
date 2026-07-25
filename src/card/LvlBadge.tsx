import { useEffect, useId, useState } from "react";
import { BADGE, CELL, CELL_INK_TOP, digitPositions } from "./lvl-badge";
import { DIGIT_GLYPHS } from "./digits.generated";

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
      <LvlLabel id={id} />
      <LvlDigits level={level} id={id} />
    </svg>
  );
}

type SvgId = (name: string) => string;

/** Clamped: p may exceed 1. */
function mix(hex: string, p: number, to = "#ffffff") {
  const parse = (c: string) => {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const a = parse(hex);
  const b = parse(to);
  return (
    "#" +
    a
      .map((v, i) =>
        Math.max(0, Math.min(255, Math.round(v + (b[i] - v) * p)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function Defs({ id }: { id: SvgId }) {
  const { diamond, glow, digits, lvl, color } = BADGE;
  const labelTop = lvl.baseline - lvl.cap;
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

      {/* No texture, so the ramp alone shades it: starts tinted, runs past inkBottom. */}
      <linearGradient
        id={id("lblink")}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1={labelTop}
        x2="0"
        y2={lvl.baseline}
      >
        <stop
          offset="0"
          stopColor={mix(color.inkTop, lvl.inkStart, color.inkBottom)}
        />
        <stop
          offset={lvl.shadeHold}
          stopColor={mix(color.inkTop, lvl.inkStart, color.inkBottom)}
        />
        <stop
          offset="1"
          stopColor={mix(color.inkTop, lvl.inkEnd, color.inkBottom)}
        />
      </linearGradient>
      <linearGradient
        id={id("lblkey")}
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1={labelTop}
        x2="0"
        y2={lvl.baseline}
      >
        <stop offset="0" stopColor={mix(color.keyline, lvl.keylineFade)} />
        <stop offset="1" stopColor={color.keyline} />
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
    <>
      {placements.map(({ char, x }, n) => {
        const glyph = DIGIT_GLYPHS[char];
        const clip = id(`clip${n}`);
        return (
          <g
            key={n}
            transform={`translate(${x} ${top}) scale(${digits.scale})`}
          >
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

const LABEL = "Lvl";
const FAMILY = "'GBFR UI'";

type LabelMetrics = { size: number; xs: number[] };

/**
 * Size is fitted by measuring: the font's cap-height ratio is unknown.
 * Null until the face loads - metrics before that describe the fallback.
 */
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

      const { cap, kern1, kern2 } = BADGE.lvl;
      let size = cap / 0.71;
      for (let i = 0; i < 4; i++) {
        ctx.font = `${size}px ${FAMILY}`;
        const measured = ctx.measureText("L").actualBoundingBoxAscent;
        if (!measured) return;
        size *= cap / measured;
      }

      ctx.font = `${size}px ${FAMILY}`;
      const kerns = [0, kern1, kern2];
      const boxes = [];
      let pen = 0;
      for (let i = 0; i < LABEL.length; i++) {
        const m = ctx.measureText(LABEL[i]);
        pen += kerns[i];
        boxes.push({
          x: pen,
          left: m.actualBoundingBoxLeft,
          right: m.actualBoundingBoxRight,
        });
        pen += m.width;
      }
      // Centred on ink, not advances - tight pairs make the two differ.
      const lo = Math.min(...boxes.map((b) => b.x - b.left));
      const hi = Math.max(...boxes.map((b) => b.x + b.right));
      const shift = -(lo + hi) / 2;

      setMetrics({ size, xs: boxes.map((b) => b.x + shift) });
    };

    // measureText never triggers a load; fonts.load does.
    void document.fonts
      .load(`16px ${FAMILY}`, LABEL)
      .then(() => document.fonts.ready)
      .then(measure);

    return () => {
      live = false;
    };
  }, []);

  return metrics;
}

function LvlLabel({ id }: { id: SvgId }) {
  const { lvl } = BADGE;
  const metrics = useLvlLabel();
  if (!metrics) return null;

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
    >
      {LABEL}
    </text>
  );
}
