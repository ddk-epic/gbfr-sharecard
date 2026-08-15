import { useId } from "react";
import { masterlevelArtUrl } from "@/assets/urls";
import { Label, PALETTE, Part, type SvgId } from "./glyphs/label";

/** Base art and number-cell sizes */
const BASE = { w: 332, h: 348, file: "masterlevel-diamond" };
const NUM_CELL = { w: 216, h: 192 };

const CENTER = { x: BASE.w / 2, y: BASE.h / 2 };

export const MIN_MASTERLEVEL = 51;
export const MAX_MASTERLEVEL = 55;
export const DEFAULT_MASTERLEVEL = MAX_MASTERLEVEL;

const numFile = (level: number) => `masterlevel-${level - 50}`;

const KEYLINE = { outer: 0.22, inner: 0.01 };

const MASTERLEVEL_DEF = {
  word: { x: CENTER.x, baseline: 110, size: 59 },
  num: { cx: CENTER.x, cy: 199, scale: 0.84 },
} as const;

/** Gold flash streak's hotter gold color. */
const FLASH_CORE = "#ffde75";
/** Gold flash streak behind the number. */
const FLASH = { cx: CENTER.x, cy: CENTER.y, w: 280, h: 62, opacity: 1 };

const GOLD = "#ffcf5a";
/** Gold fade glow in front of the base. */
const FADE = { cx: CENTER.x, cy: CENTER.y, w: 270, h: 270, opacity: 0.5 };
/** Gold fade glow behind the base. */
const FADE_BACK = { cx: CENTER.x, cy: CENTER.y, w: 380, h: 380, opacity: 0.5 };

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
      <MasterlevelWord />
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

function MasterlevelWord() {
  const { word } = MASTERLEVEL_DEF;
  return (
    <Label
      x={word.x}
      baseline={word.baseline}
      textAnchor="middle"
      outerKeyline={KEYLINE.outer}
      innerKeyline={KEYLINE.inner}
    >
      <Part size={word.size} {...PALETTE.plain}>
        Master Lvl
      </Part>
    </Label>
  );
}

function MasterlevelNumber({ level }: { level: number }) {
  const { cx, cy, scale } = MASTERLEVEL_DEF.num;
  const w = NUM_CELL.w * scale;
  const h = NUM_CELL.h * scale;
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
