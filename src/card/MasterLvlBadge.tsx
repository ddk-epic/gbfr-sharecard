import { useId } from "react";
import { masterlevelArtUrl } from "../data";
import { LABEL_INK, mix } from "./lvl-def";
import { LabelRun, type SvgId } from "./label-run";

/** Base art and number-cell sizes; num sprites are padded to the cell so tiers
    drop in interchangeably. */
const BASE = { w: 332, h: 348, file: "masterlevel-diamond" };
const NUM_CELL = { w: 216, h: 192 };

/** Tiers l01..l05 are levels 51..55; tier = level - 50. */
export const MIN_MASTERLEVEL = 51;
export const MAX_MASTERLEVEL = 55;
export const DEFAULT_MASTERLEVEL = MAX_MASTERLEVEL;

const numFile = (level: number) => `masterlevel-${level - 50}`;

/** Word and number placement, in the base art's own 332x348 pixels. */
const MASTERLEVEL_DEF = {
  /** Word baseline, centred on x. */
  word: { x: 166.5, baseline: 110, size: 59, outline: 10 },
  /** Number cell centre and scale off native cell pixels. */
  num: { cx: 166, cy: 199, scale: 0.84 },
} as const;

/** Fixed master badge. Absolutely placed, so it needs a positioned ancestor;
    top/left are px from it. */
export function MasterlevelBadge({
  level = DEFAULT_MASTERLEVEL,
  size = BASE.w,
  top = 0,
  left = 0,
  zIndex = 3,
}: {
  level?: number;
  size?: number;
  top?: number;
  left?: number;
  zIndex?: number;
}) {
  const uid = useId();
  // url(#name) resolves document-wide, not per svg, so every id is namespaced.
  const id: SvgId = (name) => `${uid}-${name}`;

  const clamped = Math.min(Math.max(level, MIN_MASTERLEVEL), MAX_MASTERLEVEL);
  return (
    <svg
      viewBox={`0 0 ${BASE.w} ${BASE.h}`}
      width={size}
      height={(size * BASE.h) / BASE.w}
      style={{ position: "absolute", top, left, zIndex }}
      role="img"
      aria-label={`Master Level ${clamped}`}
    >
      <defs>
        <MasterlevelLabelDefs id={id} />
      </defs>
      <image
        href={masterlevelArtUrl(BASE.file)}
        x={0}
        y={0}
        width={BASE.w}
        height={BASE.h}
      />
      <MasterlevelWord id={id} />
      <MasterlevelNumber level={clamped} />
    </svg>
  );
}

function MasterlevelWord({ id }: { id: SvgId }) {
  const { word } = MASTERLEVEL_DEF;
  return (
    <LabelRun
      ink={id}
      x={word.x}
      y={word.baseline}
      textAnchor="middle"
      size={word.size}
      outline={word.outline}
    >
      Master Lvl
    </LabelRun>
  );
}

function MasterlevelNumber({ level }: { level: number }) {
  const { cx, cy, scale } = MASTERLEVEL_DEF.num;
  const w = NUM_CELL.w * scale;
  const h = NUM_CELL.h * scale;
  // Tiers share one cell, so the tile just rides on its centre.
  return (
    <image
      href={masterlevelArtUrl(numFile(level))}
      x={cx - w / 2}
      y={cy - h / 2}
      width={w}
      height={h}
    />
  );
}

/** Ink-ramp and keyline in the word's own bbox; the shared LabelDefs pins to
    the Lvl badge's space, which this badge does not share. */
function MasterlevelLabelDefs({ id }: { id: SvgId }) {
  const ink = LABEL_INK.plain;
  return (
    <>
      <linearGradient id={id("lblink")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={ink.top} />
        <stop offset="1" stopColor={ink.bottom} />
      </linearGradient>
      <linearGradient id={id("lblkey")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={mix(ink.keyline, 0.1)} />
        <stop offset="1" stopColor={ink.keyline} />
      </linearGradient>
    </>
  );
}
