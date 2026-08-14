import type { ReactNode } from "react";
import { pwrArtUrl, statIconUrl, STAT_ICON_ART } from "../../data";
import { CAP_RATIO, Label, PALETTE, Value } from "./label";

/** Diamond body nearly fills its own 182x182 canvas. */
const BASE = { w: 182, h: 182, file: "pwr-diamond" };
const CENTER = { x: BASE.w / 2, y: BASE.h / 2 };
/** Headroom above the base for the crest. */
const CREST_OVERHANG = 96;

/** Pwr base background fill */
const BODY = { cx: 90.5, cy: 90.5, r: 87 };
const BODY_FILL = "var(--deep-5)";
const BODY_OPACITY = 0.7;

/** Offsets from the diamond centre (dx right, dy down), base 182px; cap is ink
    height, w the crest width. */
const CREST = { dx: 1, dy: -120, w: 124 };
const PWR_DEF = {
  word: { dx: 0, dy: -17.5, cap: 32 },
  num: { dx: 0, dy: 50, cap: 58 },
} as const;

const SHADOW = { dy: 3, blur: 8, color: "var(--deep-8)", opacity: 0.55 };
const SHADOW_COLOR = `color-mix(in srgb, ${SHADOW.color} ${SHADOW.opacity * 100}%, transparent)`;

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
  const vbH = BASE.h + CREST_OVERHANG;
  const k = (size / BASE.w) * 2;
  return (
    <svg
      viewBox={`0 ${-CREST_OVERHANG} ${BASE.w} ${vbH}`}
      width={size}
      height={(size * vbH) / BASE.w}
      style={{
        position: "absolute",
        top,
        left,
        right,
        zIndex,
        overflow: "visible", // keeps it unclipped
        filter: `drop-shadow(0 ${SHADOW.dy * k}px ${SHADOW.blur * k}px ${SHADOW_COLOR})`,
      }}
      role="img"
      aria-label={`Power ${power}`}
    >
      <PwrBase />
      <image
        href={pwrArtUrl(BASE.file)}
        x={0}
        y={0}
        width={BASE.w}
        height={BASE.h}
      />
      <PwrCrest />
      <PwrLabel {...PWR_DEF.word}>PWR</PwrLabel>
      <PwrLabel {...PWR_DEF.num}>{power}</PwrLabel>
    </svg>
  );
}

/** Opaque plate under the body art, cut to the same diamond. */
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
  dx,
  dy,
  cap,
  children,
}: {
  dx: number;
  dy: number;
  cap: number;
  children: ReactNode;
}) {
  return (
    <Label x={CENTER.x + dx} baseline={CENTER.y + dy} textAnchor="middle">
      <Value size={cap / CAP_RATIO} {...PALETTE.pwr}>
        {children}
      </Value>
    </Label>
  );
}
