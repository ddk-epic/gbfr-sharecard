import { SlantedBar } from "../ui";
import { LVL_DEF } from "./lvl-def";
import {
  CAP_RATIO,
  Label,
  labelBox,
  LvlWord,
  PALETTE,
  TraitPrefix,
  Value,
} from "./label";

/** This chip's placement, in badge units (viewBox space, cap 17).
 * Advances are declared estimates.
 */
const LVL = {
  cap: LVL_DEF.lvl.cap,
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

/** A level: the "Lvl" word (or a "T." trait prefix) on a slanted bar. */
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
  tone?: "plain" | "gold";
  className?: string;
}) {
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
        <Label>
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
