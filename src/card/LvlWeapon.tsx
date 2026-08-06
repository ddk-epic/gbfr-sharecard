import { useId, useMemo } from "react";
import { BADGE, inkSpan, layoutDigits, type DigitPlacement } from "./lvl-badge";
import { Figures, LabelDefs, type SvgId } from "./label-run";
import { FIGURE_BASELINE, FIGURE_XHEIGHT } from "./digits.generated";
import { useCardFontsReady } from "./fonts";
import {
  fitSize,
  labelCtx,
  layoutLabel,
  LVL_WORD,
  type LaidPiece,
} from "./lvl-label";

/** The word is set in the medium face; the number is the game's own figures. */
const FAMILY = "'GBFR UI Medium'";

/** All x the number's cap height. */
const WORD_TRACK = 0.25; // between the Lvl letters
const WORD_OUTLINE = 2; // the word's keyline, badge units
const GAP = 0.28; // Lvl to number
const PAD = 0.14; // box past the ink

/**
 * The figures' x-height as a share of BADGE.lvl.cap. The figures are old-style,
 * so they have no cap to match the word against; this is the size the hand-cut
 * glyphs this replaced were rendering at, kept so the row does not resize.
 */
const FIGURE_RATIO = 0.711;

type Laid = {
  word: LaidPiece | null;
  glyphs: {
    placements: DigitPlacement[];
    scale: number;
    originX: number;
    originY: number;
  };
  lo: number;
  hi: number;
  /** How far the figures reach below the baseline, badge units. */
  descent: number;
};

/** Lays out the weapon level; the font must already be loaded. */
function measureWeaponLvl(level: number, wordRatio: number): Laid | null {
  const ctx = labelCtx();
  if (!ctx) return null;

  const size = fitSize(ctx, FAMILY, BADGE.lvl.cap);
  if (!size) return null;

  // The face's caps and digits are not one height, so solve the font scale
  // that lands the word's ink at wordRatio of the number's cap.
  ctx.font = `${size}px ${FAMILY}`;
  const scale =
    (wordRatio * ctx.measureText("0").actualBoundingBoxAscent) /
    ctx.measureText(LVL_WORD).actualBoundingBoxAscent;
  const { cap, baseline } = BADGE.lvl;

  const word = layoutLabel(ctx, FAMILY, size, [
    { text: LVL_WORD, scale, track: WORD_TRACK },
  ]);

  // Step the figures off the word's advance by the game's gap, and start them
  // on their ink rather than their cell, so the box hugs the number.
  const gScale = (FIGURE_RATIO * cap) / FIGURE_XHEIGHT;
  const start = word.penEnd + GAP * cap;
  // The badge's tracking, for want of a separate calibration for this row.
  const placements = layoutDigits(String(level), BADGE.digits.tracking);
  const span = inkSpan(placements);

  // Descenders run below the baseline; reserve what this number actually needs
  // so the ink is never clipped. The component cancels it back out with a margin.
  const below = placements.reduce(
    (mx, p) => Math.max(mx, p.glyph.y + p.glyph.h - FIGURE_BASELINE),
    0,
  );

  return {
    word: word.pieces[0] ?? null,
    glyphs: {
      placements,
      scale: gScale,
      originX: start - span.lo * gScale,
      originY: baseline - FIGURE_BASELINE * gScale,
    },
    lo: Math.min(word.inkLeft, start),
    hi: Math.max(word.inkRight, start + (span.hi - span.lo) * gScale),
    descent: below * gScale,
  };
}

function useWeaponLvl(level: number, wordRatio: number): Laid | null {
  const ready = useCardFontsReady();
  return useMemo(
    () => (ready ? measureWeaponLvl(level, wordRatio) : null),
    [ready, level, wordRatio],
  );
}

/**
 * The weapon's level: a gold "Lvl" word set against the game's textured number
 * glyphs, on one baseline. No bar, no fraction. `cap` is the number's cap in px.
 */
export function LvlWeapon({
  cap,
  level,
  wordRatio = 0.5,
  className = "",
}: {
  cap: number;
  level: number;
  /** The word's ink height as a share of the number's cap. */
  wordRatio?: number;
  className?: string;
}) {
  const uid = useId();
  const id: SvgId = (name) => `${uid}-${name}`;
  const laid = useWeaponLvl(level, wordRatio);
  if (!laid) return null;

  const { cap: uCap, baseline } = BADGE.lvl;
  const pad = PAD * uCap;
  const left = laid.lo - pad;
  const right = laid.hi + pad;
  const top = baseline - uCap - pad;
  const boxH = uCap + laid.descent + 2 * pad;
  const px = cap / uCap;
  const layoutH = (baseline - top) * px;

  return (
    <span
      className={`inline-block overflow-visible ${className}`}
      role="img"
      aria-label={`Level ${level}`}
      style={{ width: (right - left) * px, height: layoutH }}
    >
      <svg
        className="block"
        viewBox={`${left} ${top} ${right - left} ${boxH}`}
        width={(right - left) * px}
        height={boxH * px}
      >
        <defs>
          {/* The ramp spans the word's own cap, so the smaller word reads as
              light as the badge's rather than only its dark foot. */}
          <LabelDefs id={id} cap={wordRatio * uCap} />
        </defs>
        {laid.word && (
          <text
            x={laid.word.positions.join(" ")}
            y={baseline}
            textAnchor="start"
            fontFamily={FAMILY}
            fontSize={laid.word.size}
            fill={`url(#${id("lblink")})`}
            stroke={`url(#${id("lblkey")})`}
            strokeWidth={WORD_OUTLINE}
            strokeLinejoin="round"
            paintOrder="stroke"
            xmlSpace="preserve"
          >
            {laid.word.text}
          </text>
        )}
        <Figures
          placements={laid.glyphs.placements}
          scale={laid.glyphs.scale}
          originX={laid.glyphs.originX}
          originY={laid.glyphs.originY}
        />
      </svg>
    </span>
  );
}
