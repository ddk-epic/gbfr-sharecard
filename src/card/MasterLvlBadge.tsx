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

/** Gold flash streak's hotter gold color. */
const FLASH_CORE = "#ffde75";
/** Gold flash streak behind the number. */
const FLASH = { cx: 166, cy: 174, w: 340, h: 52, opacity: 1 };

/** Gold fade color */
const GOLD = "#ffcf5a";
/** Gold fade glow in front of the base. */
const FADE = { cx: 166, cy: 174, w: 270, h: 270, opacity: 0.5 };
/** Gold fade glow behind the base. */
const FADE_BACK = { cx: 166, cy: 174, w: 380, h: 380, opacity: 0.5 };

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
        <MasterlevelGoldTint id={id} />
        <MasterlevelFlashTint id={id} />
      </defs>
      <MasterlevelFadeBack id={id} />
      <image
        href={masterlevelArtUrl(BASE.file)}
        x={0}
        y={0}
        width={BASE.w}
        height={BASE.h}
      />
      <MasterlevelFade id={id} />
      <MasterlevelFlash id={id} />
      <MasterlevelWord id={id} />
      <MasterlevelNumber level={clamped} />
    </svg>
  );
}

/** Tints a white sprite to gold via the offset column. */
function MasterlevelGoldTint({ id }: { id: SvgId }) {
  const c = (i: number) => parseInt(GOLD.slice(i, i + 2), 16) / 255;
  const [r, g, b] = [c(1), c(3), c(5)];
  const values = `0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1 0`;
  return (
    <filter id={id("gold")} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values={values} />
    </filter>
  );
}

/** Flash tint */
function MasterlevelFlashTint({ id }: { id: SvgId }) {
  const hex = (h: string) => {
    const c = (i: number) => parseInt(h.slice(i, i + 2), 16) / 255;
    return [c(1), c(3), c(5)] as const;
  };
  const [er, eg, eb] = hex(GOLD);
  const [cr, cg, cb] = hex(FLASH_CORE);
  const row = (e: number, k: number) => `0 0 0 ${k - e} ${e}`;
  const values = `${row(er, cr)} ${row(eg, cg)} ${row(eb, cb)} 0 0 0 1 0`;
  return (
    <filter id={id("flash")} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values={values} />
    </filter>
  );
}

function MasterlevelFadeBack({ id }: { id: SvgId }) {
  return (
    <image
      href={masterlevelArtUrl("masterlevel-fade-back")}
      x={FADE_BACK.cx - FADE_BACK.w / 2}
      y={FADE_BACK.cy - FADE_BACK.h / 2}
      width={FADE_BACK.w}
      height={FADE_BACK.h}
      opacity={FADE_BACK.opacity}
      filter={`url(#${id("gold")})`}
    />
  );
}

function MasterlevelFade({ id }: { id: SvgId }) {
  return (
    <image
      href={masterlevelArtUrl("masterlevel-fade-front")}
      x={FADE.cx - FADE.w / 2}
      y={FADE.cy - FADE.h / 2}
      width={FADE.w}
      height={FADE.h}
      opacity={FADE.opacity}
      filter={`url(#${id("gold")})`}
    />
  );
}

function MasterlevelFlash({ id }: { id: SvgId }) {
  return (
    <image
      href={masterlevelArtUrl("masterlevel-flash")}
      x={FLASH.cx - FLASH.w / 2}
      y={FLASH.cy - FLASH.h / 2}
      width={FLASH.w}
      height={FLASH.h}
      opacity={FLASH.opacity}
      filter={`url(#${id("flash")})`}
    />
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

/** Ink-ramp and keyline in the word's own bbox. */
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
