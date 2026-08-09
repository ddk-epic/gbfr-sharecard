import { useId, type ReactNode } from "react";
import { pwrArtUrl, statIconUrl, STAT_ICON_ART } from "../data";
import { LVL_DEF } from "./lvl-def";
import {
  LabelDefs,
  LabelRun,
  LabelShadowFilter,
  CAP_RATIO,
  type SvgId,
} from "./label-run";

/** Diamond body nearly fills its own 182x182 canvas. */
const BASE = { w: 182, h: 182, file: "pwr-diamond" };
/** Diamond centre, base px; the placement anchor. */
const CENTER = { x: 91, y: 91 };
/** Headroom above the base for the crest; covers its top at CREST.dy - w*128/127/2. */
const CREST_OVERHANG = 96;

/** Pwr base background fill */
const BODY = { cx: 90.5, cy: 90.5, r: 87 };
const BODY_FILL = "var(--deep-5)";
const BODY_OPACITY = 0.7;

/** Offsets from the diamond centre (dx right, dy down), base 182px; cap is ink
    height, w the crest width. */
const CREST = { dx: 1, dy: -120, w: 124 };
const PWR_DEF = {
  word: { dx: 0, dy: -17.5, cap: 32, outline: 3 },
  num: { dx: 0, dy: 50, cap: 58, outline: 2.6 },
} as const;

/** Keyline width (badge px) painted over both texts' edges, insetting them. */
const INSET = 0.5;

export function PwrBadge({
  power,
  size = BASE.w,
  top = 0,
  left,
  right,
  zIndex = 3,
}: {
  power: number;
  size?: number;
  top?: number;
  left?: number;
  right?: number;
  zIndex?: number;
}) {
  const uid = useId();
  // url(#name) resolves document-wide, not per svg, so every id is namespaced.
  const id: SvgId = (name) => `${uid}-${name}`;

  const vbH = BASE.h + CREST_OVERHANG;
  return (
    <svg
      viewBox={`0 ${-CREST_OVERHANG} ${BASE.w} ${vbH}`}
      width={size}
      height={(size * vbH) / BASE.w}
      // Number rides past the 182 viewBox; overflow visible keeps it unclipped.
      style={{
        position: "absolute",
        top,
        left,
        right,
        zIndex,
        overflow: "visible",
      }}
      role="img"
      aria-label={`Power ${power}`}
    >
      <defs>
        <LabelDefs id={id} tone="pwr" solidKeyline />
        <LabelShadowFilter id={id} tone="pwr" />
      </defs>
      <PwrBase />
      <image
        href={pwrArtUrl(BASE.file)}
        x={0}
        y={0}
        width={BASE.w}
        height={BASE.h}
      />
      <PwrCrest />
      {/* One group so the shadow casts once, not per part. */}
      <g filter={`url(#${id("lblshadow")})`}>
        <PwrLabel id={id} {...PWR_DEF.word}>
          PWR
        </PwrLabel>
        <PwrLabel id={id} {...PWR_DEF.num}>
          {power}
        </PwrLabel>
      </g>
    </svg>
  );
}

/** Opaque plate under the body art, cut to the same rhombus. */
function PwrBase() {
  const { cx, cy, r } = BODY;
  return (
    <polygon
      points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
      style={{ fill: BODY_FILL }}
      fillOpacity={BODY_OPACITY}
    />
  );
}

function PwrCrest() {
  const { w, h } = STAT_ICON_ART.power;
  const cw = CREST.w;
  const ch = (cw * h) / w;
  return (
    <image
      href={statIconUrl("power")}
      x={CENTER.x + CREST.dx - cw / 2}
      y={CENTER.y + CREST.dy - ch / 2}
      width={cw}
      height={ch}
    />
  );
}

function PwrLabel({
  id,
  dx,
  dy,
  cap,
  outline,
  children,
}: {
  id: SvgId;
  dx: number;
  dy: number;
  cap: number;
  outline: number;
  children: ReactNode;
}) {
  const { cap: lvlCap, baseline: lvlBaseline } = LVL_DEF.lvl;
  const s = cap / lvlCap;
  const x = CENTER.x + dx;
  const ty = CENTER.y + dy - s * lvlBaseline;
  return (
    <g transform={`translate(${x} ${ty}) scale(${s})`}>
      <LabelRun
        ink={id}
        x={0}
        textAnchor="middle"
        size={lvlCap / CAP_RATIO}
        outline={outline}
        // /s keeps the badge-px inset uniform across both labels' scales.
        inset={INSET / s}
      >
        {children}
      </LabelRun>
    </g>
  );
}
