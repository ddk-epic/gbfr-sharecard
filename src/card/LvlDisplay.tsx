import { useId } from "react";
import { SlantedBar } from "../ui";
import { BADGE, type LabelTone } from "./lvl-badge";
import {
  LabelDefs,
  LabelRun,
  LabelShadowFilter,
  LvlWord,
  CAP_RATIO,
  type SvgId,
} from "./label-run";

/** What the game puts in front of a trait's level. */
const TRAIT_PREFIX = "T.";

/**
 * Placement in badge units (viewBox space; cap 17, baseline 36). Nothing is
 * measured: the browser sets the text, these constants place it. SEED marks
 * the runtime-measured ones with no closed form here - calibrate them by eye.
 */
const LVL = {
  cap: BADGE.lvl.cap, //           number cap height
  baseline: BADGE.lvl.baseline, // shared baseline
  outline: BADGE.lvl.outline,
  wordRatio: BADGE.lvl.wordRatio,
  wordOutline: BADGE.lvl.wordOutline,
  boxHeight: BADGE.lvl.boxHeight,
  /** Box past the ink each side, x cap. */
  padX: 0.64,
  /** SEED: "Lvl" left edge (textAnchor start). */
  wordX: 0,
  /** "T." to "Lvl", x cap. */
  prefixGap: 0.33,
  /** SEED: "T." ink left when hung off the word; the box pads left of it so the
      slant clears the T as it does the L. */
  prefixInkLeft: -20,
  /** SEED: right edge the number pins to (past the word by the game's gap). */
  numberRight: 57,
  /** The one gap inside "T.", at word scale. */
  prefixKern: -0.2 * 0.82,
} as const;

const NUMBER_SIZE = LVL.cap / CAP_RATIO;
const WORD_SIZE = NUMBER_SIZE * LVL.wordRatio;

/**
 * A level: the "Lvl" word (or a "T." trait prefix) over the game's figures on a
 * slanted bar. Pure JSX; the browser reflows when the face loads. Used for
 * weapon traits, sigils, and summons.
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
  tone?: LabelTone;
  className?: string;
}) {
  const uid = useId();
  const id: SvgId = (name) => `${uid}-${name}`; //    number ramp (full cap)
  const wordId: SvgId = (name) => id(`w-${name}`); // word ramp (lighter, word cap)

  const boxHeight = LVL.boxHeight * LVL.cap;
  const padX = LVL.padX * LVL.cap;
  // The bar's top edge lands on the number's middle; the box is centred there.
  const top = LVL.baseline - LVL.cap / 2 - boxHeight / 2;
  const left = (traitPrefix ? LVL.prefixInkLeft : LVL.wordX) - padX;
  const right = LVL.numberRight + padX;
  const px = cap / LVL.cap;
  const size = { width: (right - left) * px, height: boxHeight * px };

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
      <SlantedBar />
      <svg
        className="relative block"
        viewBox={`${left} ${top} ${right - left} ${boxHeight}`}
        width={size.width}
        height={size.height}
      >
        <defs>
          <LabelDefs id={id} tone={tone} />
          <LabelDefs id={wordId} tone={tone} cap={LVL.wordRatio * LVL.cap} />
          <LabelShadowFilter id={id} tone={tone} />
        </defs>
        {/* One group so the shadow casts once, not per part. */}
        <g filter={`url(#${id("lblshadow")})`}>
          {traitPrefix && (
            <LabelRun
              ink={wordId}
              x={LVL.wordX - LVL.prefixGap * LVL.cap}
              dx={`0 ${LVL.prefixKern}`}
              textAnchor="end"
              size={WORD_SIZE}
              outline={LVL.outline * LVL.wordOutline}
            >
              {TRAIT_PREFIX}
            </LabelRun>
          )}
          <LvlWord id={wordId} x={LVL.wordX} />
          <LabelRun
            ink={id}
            x={LVL.numberRight}
            textAnchor="end"
            size={NUMBER_SIZE}
            outline={LVL.outline}
          >
            {level}
          </LabelRun>
        </g>
      </svg>
    </span>
  );
}
