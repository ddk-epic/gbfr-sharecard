import { useEffect, useId, useState } from "react";
import {
  DigitInkDefs,
  LabelDefs,
  TexturedDigits,
  type SvgId,
} from "./LvlBadge";
import { BADGE, CELL, type DigitPlacement } from "./lvl-badge";
import { DIGIT_GLYPHS } from "./digits.generated";
import { fitSize, layoutRun, LVL_WORD, type LaidPart } from "./lvl-run";

/** The word is set in the medium face; the number is the baked glyph run. */
const FAMILY = "'GBFR UI Medium'";

/** All x the number's cap height. */
const WORD_TRACK = 0.25; // between the Lvl letters
const WORD_OUTLINE = 2; // the word's keyline, badge units
const GAP = 0.28; // Lvl to number
const PAD = 0.14; // box past the ink

type Laid = {
  word: LaidPart | null;
  glyphs: { placements: DigitPlacement[]; scale: number; top: number };
  lo: number;
  hi: number;
  /** How far the figures' cell reaches below the baseline, badge units. */
  descent: number;
};

/** Measures once the face is ready; null until then, so nothing half-set shows. */
function useWeaponLvl(level: number, wordRatio: number): Laid | null {
  const [laid, setLaid] = useState<Laid | null>(null);

  useEffect(() => {
    let live = true;
    const measure = () => {
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx || !live) return;
      if (!document.fonts.check(`16px ${FAMILY}`)) return;

      const size = fitSize(ctx, FAMILY, BADGE.lvl.cap);
      if (!size) return;

      // The face's caps and digits are not one height, so solve the font scale
      // that lands the word's ink at wordRatio of the number's cap.
      ctx.font = `${size}px ${FAMILY}`;
      const scale =
        (wordRatio * ctx.measureText("0").actualBoundingBoxAscent) /
        ctx.measureText(LVL_WORD).actualBoundingBoxAscent;
      const { cap, baseline } = BADGE.lvl;

      const word = layoutRun(ctx, FAMILY, size, [
        { text: LVL_WORD, scale, track: WORD_TRACK },
      ]);

      // Step the baked figures off the word's advance by the game's gap; the
      // last figure counts its ink, so the box hugs the number on both sides.
      const gScale = cap / CELL.ascent;
      const start = word.end + GAP * cap;
      const chars = [...String(level)].filter((c) => c in DIGIT_GLYPHS);
      let pen = start;
      const placements: DigitPlacement[] = chars.map((char) => {
        const p = { char, x: pen - CELL.pad * gScale };
        pen += BADGE.advance[char] * gScale;
        return p;
      });
      const inkWidth = (c: string) => DIGIT_GLYPHS[c].width - CELL.pad * 2;
      const total = chars.length
        ? chars.slice(0, -1).reduce((s, c) => s + BADGE.advance[c], 0) +
          inkWidth(chars[chars.length - 1])
        : 0;

      // The figures' cell runs well below the baseline; reserve it so the ink
      // is never clipped. The component cancels it back out with a margin.
      const cellBelow = chars.reduce(
        (mx, c) => Math.max(mx, DIGIT_GLYPHS[c].height - CELL.baseline),
        0,
      );

      setLaid({
        word: word.parts[0] ?? null,
        glyphs: {
          placements,
          scale: gScale,
          top: baseline - CELL.baseline * gScale,
        },
        lo: Math.min(word.lo, start),
        hi: Math.max(word.hi, start + total * gScale),
        descent: cellBelow * gScale,
      });
    };

    void document.fonts
      .load(`16px ${FAMILY}`, `${LVL_WORD}0123456789`)
      .then(() => document.fonts.ready)
      .then(measure)
      .catch((err: unknown) => {
        console.warn(`${FAMILY} failed to load; weapon level omitted`, err);
      });

    return () => {
      live = false;
    };
  }, [level, wordRatio]);

  return laid;
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
  // Reserve the figures' full below-baseline cell so nothing clips; the box
  // otherwise ends a pad below the baseline, as the word does.
  const boxH = uCap + laid.descent + 2 * pad;
  const px = cap / uCap;

  return (
    <span
      className={`inline-block ${className}`}
      role="img"
      aria-label={`Level ${level}`}
      // The reserved descent is drawn but not laid out, so the figure stays on
      // its baseline instead of riding up off the empty cell below it.
      style={{ marginBottom: -laid.descent * px }}
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
          <DigitInkDefs id={id} />
        </defs>
        {laid.word && (
          <text
            x={laid.word.xs.join(" ")}
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
        <TexturedDigits
          id={id}
          placements={laid.glyphs.placements}
          scale={laid.glyphs.scale}
          top={laid.glyphs.top}
        />
      </svg>
    </span>
  );
}
