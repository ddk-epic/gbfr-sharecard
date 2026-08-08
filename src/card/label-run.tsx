import type { ReactNode } from "react";
import {
  LVL_DEF,
  LABEL_INK,
  mix,
  type DigitPlacement,
  type LabelTone,
} from "./lvl-def";

const FAMILY = "'GBFR UI Medium'";

/** SEED: "GBFR UI Medium" cap-ink height over em, for the figure's size. */
export const CAP_RATIO = 0.71;

/** Namespaces a def's id to one label; `url(#name)` resolves document-wide,
    not per svg, so every id needs this. */
export type SvgId = (name: string) => string;

/**
 * The ink-ramp and keyline gradients every label paints with. Split out so a
 * label outside the diamond (a stat plate, a level chip) can share the same
 * ramp the badge's own figure uses.
 */
export function LabelDefs({
  id,
  tone = "plain",
  cap = LVL_DEF.lvl.cap,
}: {
  id: SvgId;
  tone?: LabelTone;
  /** The ramp's span above the baseline; pass the word's own cap so a smaller
      word still takes the full ink ramp rather than only its darker foot. */
  cap?: number;
}) {
  const { lvl } = LVL_DEF;
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

/** Places pre-rendered digit-glyph images along a laid-out run. */
export function DigitFigures({
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

/** The label's drop shadow. Offset and blur x cap; `darken` how far the colour
    sits past the keyline towards black. */
const SHADOW = { dy: 0.02, blur: 0.02, opacity: 0.6, darken: 0.5 };

/**
 * One run of text on the label's shared baseline: ink-ramp fill, keyline
 * stroke. Real SVG stroke, so `strokeLinejoin="round"` actually rounds the
 * corners - CSS `-webkit-text-stroke` has no linejoin and mitres them.
 */
export function LabelRun({
  ink,
  x,
  y = LVL_DEF.lvl.baseline,
  dx,
  textAnchor = "start",
  size,
  outline = 1.5,
  letterSpacing = 0,
  children,
}: {
  ink: SvgId;
  x: number | string;
  y?: number;
  /** Per-glyph SVG dx, for hand kerning inside a word. */
  dx?: string;
  textAnchor?: "start" | "end" | "middle";
  /** Font size, badge units. */
  size: number;
  /** Keyline width, badge units. */
  outline?: number;
  /** Badge units; negative tightens. */
  letterSpacing?: number;
  children: ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      dx={dx}
      textAnchor={textAnchor}
      fontFamily={FAMILY}
      fontSize={size}
      letterSpacing={letterSpacing}
      style={{ fontVariantNumeric: "tabular-nums" }}
      fill={`url(#${ink("lblink")})`}
      stroke={`url(#${ink("lblkey")})`}
      strokeWidth={outline}
      strokeLinejoin="round"
      paintOrder="stroke"
      xmlSpace="preserve"
    >
      {children}
    </text>
  );
}

/**
 * The "Lvl" word, one shared rendering for every context it appears in - the
 * chip, the diamond badge, the weapon plate - kerned and stroked off
 * `LVL_DEF.lvl` so they read identically; only `id`'s tone, the caller's
 * placement, and `ratio` (a composition's own word-to-number size) differ.
 */
export function LvlWord({
  id,
  x,
  textAnchor = "start",
  ratio = LVL_DEF.lvl.wordRatio,
}: {
  id: SvgId;
  x: number | string;
  textAnchor?: "start" | "end" | "middle";
  /** The word's ink height as a share of the number's cap. Defaults to the
      shared calibration; override where a composition sizes its word
      differently from its number, as the weapon plate's smaller "Lvl" does. */
  ratio?: number;
}) {
  const { cap, kern1, kern2, wordTrack, outline, wordOutline, wordRatio } =
    LVL_DEF.lvl;
  const size = (cap / CAP_RATIO) * ratio;
  const dx = `0 ${(kern1 + wordTrack) * ratio} ${(kern2 + wordTrack) * ratio}`;
  return (
    <LabelRun
      ink={id}
      x={x}
      dx={dx}
      textAnchor={textAnchor}
      size={size}
      // Keyline scales with the word, so it stays the same share of the glyphs
      // at any ratio; wordOutline is calibrated at the default wordRatio.
      outline={outline * wordOutline * (ratio / wordRatio)}
    >
      Lvl
    </LabelRun>
  );
}

/** The shared drop-shadow filter def; wrap the runs' `<g>` in
    `filter={\`url(#${id("lblshadow")})\`}`. */
export function LabelShadowFilter({
  id,
  tone,
}: {
  id: SvgId;
  tone: LabelTone;
}) {
  const { cap } = LVL_DEF.lvl;
  return (
    <filter id={id("lblshadow")} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow
        dx={0}
        dy={SHADOW.dy * cap}
        stdDeviation={SHADOW.blur * cap}
        floodColor={mix(LABEL_INK[tone].keyline, SHADOW.darken, "#000000")}
        floodOpacity={SHADOW.opacity}
      />
    </filter>
  );
}
