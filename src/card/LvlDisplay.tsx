import { useId } from "react";
import { SlantedBar } from "../ui";
import { LVL_DEF } from "./lvl-def";
import { CAP_RATIO, type SvgId } from "./label-run";
import { PALETTE, type Tone } from "./label/palette";
import { Label } from "./label/Label";
import { TraitPrefix, LvlWord, Value } from "./label/Part";
import { labelBox } from "./label/box";

/**
 * This chip's placement, in badge units (viewBox space; cap 17, baseline 36).
 * Shared typography rides in from LVL_DEF.lvl. The browser flows the glyphs,
 * but the box is still a declared estimate (see label/box.ts).
 */
const LVL = {
  cap: LVL_DEF.lvl.cap,
  baseline: LVL_DEF.lvl.baseline,
  outerKeyline: 0.12,
  innerKeyline: 0.02,
  wordRatio: LVL_DEF.lvl.wordRatio,
  boxHeight: LVL_DEF.lvl.boxHeight,
  /** Box past the ink each side. */
  padX: 0.8,
  /** "T." to "Lvl". */
  prefixGap: 0.23,
  /** "Lvl" to the number. */
  numberGap: 0.36,
  reserveDigits: 2,
  /** "T."'s advance. */
  prefixAdvance: 1.06,
  /** "Lvl"'s advance. Tracks kern1/kern2/wordTrack; recalibrate with them. */
  wordAdvance: 1.66,
  /** A tabular digit's advance. */
  digitAdvance: 0.74,
} as const;

const NUMBER_SIZE = LVL.cap / CAP_RATIO;
const WORD_SIZE = NUMBER_SIZE * LVL.wordRatio;

/**
 * A level: the "Lvl" word (or a "T." trait prefix) over the game's figures on a
 * slanted bar. Pure JSX; the browser reflows when the face loads.
 */
export function LvlDisplay({
  cap,
  level,
  traitPrefix = false,
  tone = "plain",
  className = "",
}: {
  cap: number;
  level: number | null;
  traitPrefix?: boolean;
  /** `plain` is the card's own ink, `gold` the game's. */
  tone?: Tone;
  className?: string;
}) {
  const uid = useId();
  const id: SvgId = (name) => `${uid}-${name}`;
  const palette = PALETTE[tone];

  const wordCap = WORD_SIZE * CAP_RATIO;
  const numberCap = NUMBER_SIZE * CAP_RATIO;
  const padX = LVL.padX * LVL.cap;
  const contentWidth =
    (traitPrefix ? (LVL.prefixAdvance + LVL.prefixGap) * wordCap : 0) +
    LVL.wordAdvance * wordCap +
    LVL.numberGap * numberCap +
    LVL.reserveDigits * LVL.digitAdvance * numberCap;

  const box = labelBox({
    baseline: LVL.baseline,
    cap: LVL.cap,
    boxHeight: LVL.boxHeight,
    left: -padX,
    right: contentWidth + padX,
    // A fade on the right padding.
    fade: padX,
  });
  const px = cap / LVL.cap;
  const size = { width: box.width * px, height: box.height * px };

  if (level === null) {
    return (
      <span
        className={`inline-block ${className}`}
        style={size}
        role="presentation"
      />
    );
  }

  return (
    <span
      className={`relative inline-block ${className}`}
      style={size}
      role="img"
      aria-label={`Level ${level}`}
    >
      <SlantedBar share={box.barShare} fadeFrom={box.barFade} />
      <svg
        className="relative block overflow-visible"
        viewBox={`${box.left} ${box.top} ${box.width} ${box.height}`}
        width={size.width}
        height={size.height}
      >
        <Label
          id={id}
          baseline={LVL.baseline}
          anchorSize={NUMBER_SIZE}
          outerKeyline={LVL.outerKeyline}
          innerKeyline={LVL.innerKeyline}
        >
          {traitPrefix && <TraitPrefix size={WORD_SIZE} {...palette} />}
          <LvlWord
            size={WORD_SIZE}
            gap={traitPrefix ? LVL.prefixGap : 0}
            {...palette}
          />
          <Value
            size={NUMBER_SIZE}
            gap={LVL.numberGap}
            ghost={Math.max(0, LVL.reserveDigits - String(level).length)}
            {...palette}
          >
            {level}
          </Value>
        </Label>
      </svg>
    </span>
  );
}
