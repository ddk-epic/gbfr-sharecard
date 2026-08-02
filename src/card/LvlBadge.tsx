import { useEffect, useId, useState } from "react";
import {
  BADGE,
  CELL,
  CELL_INK_TOP,
  digitPositions,
  LABEL_INK,
  mix,
  type LabelTone,
} from "./lvl-badge";
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
  const { diamond, glow, digits, color } = BADGE;
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

      <LabelDefs id={id} />
    </>
  );
}

/**
 * Split out so the wordmark can paint on its own, outside the diamond.
 * `tone` is the palette; the ramp across it is the badge's either way.
 */
export function LabelDefs({
  id,
  tone = "plain",
}: {
  id: SvgId;
  tone?: LabelTone;
}) {
  const { lvl } = BADGE;
  const ink = LABEL_INK[tone];
  const labelTop = lvl.baseline - lvl.cap;
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

// Ascent/descent come from the full glyph set, not the run in hand, so every
// row's ink box is one height; per-run measuring would drift the baseline.
const PROBE = `${LABEL} 0123456789`;

/** Reserved digits; sigil levels between 11-15. */
const LEVEL_DIGITS = 2;

type LabelMetrics = {
  size: number;
  xs: number[];
  /** Ink half-width from the centre the xs are set against. */
  half: number;
  ascent: number;
  descent: number;
};

function useLvlLabel(text: string = LABEL): LabelMetrics | null {
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
        if (!measured) {
          console.warn(`${FAMILY} measured no ink; Lvl label omitted`);
          return;
        }
        size *= cap / measured;
      }

      ctx.font = `${size}px ${FAMILY}`;
      // Faux tabular figures: every digit steps by the widest digit's advance,
      // centred in its slot, so a level is one width whatever its digits.
      const figure = Math.max(
        ...[..."0123456789"].map((d) => ctx.measureText(d).width),
      );
      const run = (s: string) => {
        const kerns = s.startsWith(LABEL) ? [0, kern1, kern2] : [];
        const boxes = [];
        let pen = 0;
        for (let i = 0; i < s.length; i++) {
          const m = ctx.measureText(s[i]);
          const digit = s[i] >= "0" && s[i] <= "9";
          const slack = digit ? (figure - m.width) / 2 : 0;
          pen += kerns[i] ?? 0;
          boxes.push({
            x: pen + slack,
            left: m.actualBoundingBoxLeft,
            right: m.actualBoundingBoxRight,
          });
          pen += digit ? figure : m.width;
        }
        if (!boxes.length) return { xs: [], lo: 0, hi: 0 };
        // Centre on ink, not advances; a level is the exception - its trailing
        // edge follows the advance so rows line up whatever the digits.
        const lo = Math.min(...boxes.map((b) => b.x - b.left));
        const inked = Math.max(...boxes.map((b) => b.x + b.right));
        return {
          xs: boxes.map((b) => b.x),
          lo,
          hi: s === LABEL ? inked : Math.max(inked, pen),
        };
      };

      const own = run(text);
      const shift = -(own.lo + own.hi) / 2;
      // Reserve the widest run's box so every row is one width and neighbouring
      // columns share an x; a run wider than the reference grows it, not clips.
      const ref = run(`${LABEL} ${"0".repeat(LEVEL_DIGITS)}`);
      const half = Math.max((own.hi - own.lo) / 2, (ref.hi - ref.lo) / 2);

      const probe = ctx.measureText(PROBE);
      setMetrics({
        size,
        xs: own.xs.map((x) => x + shift),
        half,
        ascent: probe.actualBoundingBoxAscent,
        descent: probe.actualBoundingBoxDescent,
      });
    };

    // measureText never triggers a load; fonts.load does. Catching matters:
    // a rejection here is how an undecodable face silently emptied the label.
    void document.fonts
      .load(`16px ${FAMILY}`, text || PROBE)
      .then(() => document.fonts.ready)
      .then(measure)
      .catch((err: unknown) => {
        console.warn(`${FAMILY} failed to load; Lvl label omitted`, err);
      });

    return () => {
      live = false;
    };
  }, [text]);

  return metrics;
}

function LvlLabel({
  id,
  metrics,
  text = LABEL,
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

export function LvlWordmark({
  cap,
  level,
  className,
}: {
  cap: number;
  level: number | null;
  className?: string;
}) {
  const uid = useId();
  const id: SvgId = (name) => `${uid}-${name}`;
  const text = level === null ? "" : `${LABEL} ${level}`;
  const metrics = useLvlLabel(text);
  if (!metrics) return null;

  const { lvl } = BADGE;
  const pad = lvl.outline / 2;
  const w = (metrics.half + pad) * 2;
  // Bound by the ink, not cap: the l and round digits paint outside a cap-high
  // box. Scale still divides by lvl.cap, so `cap` keeps meaning cap height.
  const h = metrics.ascent + metrics.descent + pad * 2;
  return (
    <svg
      viewBox={`${lvl.centre - w / 2} ${lvl.baseline - metrics.ascent - pad} ${w} ${h}`}
      width={(cap * w) / lvl.cap}
      height={(cap * h) / lvl.cap}
      role={level === null ? "presentation" : "img"}
      aria-label={level === null ? undefined : `Level ${level}`}
      className={className}
    >
      {level !== null && (
        <>
          <defs>
            <LabelDefs id={id} />
          </defs>
          <LvlLabel id={id} metrics={metrics} text={text} />
        </>
      )}
    </svg>
  );
}
