import { useEffect, useId, useState } from "react";
import { SlantedBar } from "../ui";
import { LabelDefs, type SvgId } from "./LvlBadge";
import { BADGE, LABEL_INK, mix, type LabelTone } from "./lvl-badge";
import {
  fitSize,
  ghosted,
  layoutRun,
  LEVEL_DIGITS,
  LVL_WORD,
  type Run,
} from "./lvl-run";

/** The medium face, as every "Lvl" word on the card is set in. */
const FAMILY = "'GBFR UI Medium'";

/** What the game puts in front of a trait's level. */
const TRAIT_PREFIX = "T.";

/**
 * The game's own proportions, off its trait rows. Every measure is stated
 * against the number's cap height, so `cap` scales the whole thing.
 */
const LVL = {
  /** The words' *ink* height against the number's, not their font size. */
  wordRatio: 0.82,
  /** Badge units between letters: inside "T.", then inside "Lvl". */
  track: { prefix: -0.2, word: 0.25 },
  /** "T." to "Lvl", x cap. */
  prefixGap: 0.33,
  /** "Lvl" to the number, x cap, at the reserved two-digit width. */
  gap: 0.76,
  /** The number to its unit, x cap. */
  unitGap: 0.35,
  /**
   * The words' share of the number's keyline. Absolute, not their size ratio:
   * the game's keyline is one pixel at every size.
   */
  wordOutline: 0.82,
  /**
   * The run's drop shadow. Offset and blur are x cap; `darken` is how far past
   * the keyline the colour sits towards black, 0 being the keyline's own.
   */
  shadow: { dx: 0, dy: 0.02, blur: 0.02, opacity: 0.6, darken: 0.5 },
} as const;

/** How a figure is set inside its box. */
export type FigureSet = {
  /** Box height in cap heights. The bar fills its bottom half. */
  boxH: number;
  /** Box past the run's ink, x cap - the same both sides, as the game sets it. */
  pad: number;
  /** The figure raised off the box's centre, x cap. */
  nudge: number;
  /** Between figures, x cap, on top of whatever the face sets. */
  track: number;
  /** The number's keyline. */
  outline: number;
};

const FIGURE: FigureSet = {
  boxH: 1.65,
  pad: 0.64,
  nudge: 0,
  track: 0,
  outline: 2.5,
};

function useLvlRun(
  traitPrefix: boolean,
  lvlWord: boolean,
  digits: string,
  unit: string,
  track: number,
): Run | null {
  const [run, setRun] = useState<Run | null>(null);

  useEffect(() => {
    let live = true;
    const measure = () => {
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx || !live) return;
      if (!document.fonts.check(`16px ${FAMILY}`)) {
        console.warn(`${FAMILY} did not load; level display omitted`);
        return;
      }

      const size = fitSize(ctx, FAMILY, BADGE.lvl.cap);
      if (!size) {
        console.warn(`${FAMILY} measured no ink; level display omitted`);
        return;
      }

      // wordRatio names the ink, and this face's caps and digits are not one
      // height, so the font scale that delivers it has to be solved for.
      ctx.font = `${size}px ${FAMILY}`;
      const scale =
        (LVL.wordRatio * ctx.measureText("0").actualBoundingBoxAscent) /
        ctx.measureText(LVL_WORD).actualBoundingBoxAscent;

      const { cap } = BADGE.lvl;
      const lay = (level: string) =>
        layoutRun(ctx, FAMILY, size, [
          ...(traitPrefix
            ? [
                {
                  text: TRAIT_PREFIX,
                  scale,
                  track: LVL.track.prefix,
                  outline: LVL.wordOutline,
                },
              ]
            : []),
          ...(lvlWord
            ? [
                {
                  text: LVL_WORD,
                  scale,
                  track: LVL.track.word,
                  outline: LVL.wordOutline,
                  lead: traitPrefix ? LVL.prefixGap * cap : 0,
                },
              ]
            : []),
          {
            text: level,
            scale: 1,
            track: track * cap,
            lead: traitPrefix || lvlWord ? LVL.gap * cap : 0,
          },
          // Set like the words: a mark on the figure, not another figure.
          ...(unit
            ? [
                {
                  text: unit,
                  scale,
                  outline: LVL.wordOutline,
                  lead: LVL.unitGap * cap,
                },
              ]
            : []),
        ]);

      // Every display reserves the two-digit box, so a column of them is one
      // width; a level wider than that grows the box rather than overflowing it.
      const own = lay(ghosted(digits));
      const ref = lay("0".repeat(LEVEL_DIGITS));
      setRun({
        parts: own.parts,
        lo: Math.min(own.lo, ref.lo),
        hi: Math.max(own.hi, ref.hi),
        end: own.end,
      });
    };

    // measureText never triggers a load; fonts.load does. Catching matters:
    // a rejection here is how an undecodable face silently emptied the label.
    void document.fonts
      .load(`16px ${FAMILY}`, `${TRAIT_PREFIX}${LVL_WORD}${unit}0123456789`)
      .then(() => document.fonts.ready)
      .then(measure)
      .catch((err: unknown) => {
        console.warn(`${FAMILY} failed to load; level display omitted`, err);
      });

    return () => {
      live = false;
    };
  }, [traitPrefix, lvlWord, digits, unit, track]);

  return run;
}

export function LvlDisplay({
  cap,
  level,
  traitPrefix = false,
  lvlWord = true,
  unit = "",
  bar = true,
  shadow = true,
  tone = "plain",
  set,
  className = "",
}: {
  cap: number;
  level: number | null;
  traitPrefix?: boolean;
  lvlWord?: boolean;
  /** Hung off the figure at the words' size; "%" and nothing else so far. */
  unit?: string;
  bar?: boolean;
  shadow?: boolean;
  /** `plain` is the card's own ink, `gold` the game's; the rest are stats. */
  tone?: LabelTone;
  /** Overrides the level chip's own setting; see FigureSet. */
  set?: Partial<FigureSet>;
  className?: string;
}) {
  const uid = useId();
  const id: SvgId = (name) => `${uid}-${name}`;
  // A second ink, spanning the words' cap, so they read as light as the number
  // rather than only its darker foot.
  const wordId: SvgId = (name) => id(`w-${name}`);
  const figure = { ...FIGURE, ...set };
  const run = useLvlRun(
    traitPrefix,
    lvlWord,
    level === null ? "" : `${level}`,
    unit,
    figure.track,
  );
  if (!run) return null;

  const { lvl } = BADGE;
  const boxH = figure.boxH * lvl.cap;
  const pad = figure.pad * lvl.cap;
  const left = run.lo - pad;
  const right = run.hi + pad;
  // Centred on the number's middle, where the bar's top edge lands; nudge is
  // how far the game's own box sits off that centre.
  const top = lvl.baseline - lvl.cap / 2 + figure.nudge * lvl.cap - boxH / 2;
  const px = cap / lvl.cap;

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ width: (right - left) * px, height: boxH * px }}
      role={level === null ? "presentation" : "img"}
      aria-label={level === null ? undefined : `Level ${level}`}
    >
      {level !== null && (
        <>
          {bar && <SlantedBar />}
          <svg
            className="relative block"
            viewBox={`${left} ${top} ${right - left} ${boxH}`}
            width={(right - left) * px}
            height={boxH * px}
          >
            <defs>
              <LabelDefs id={id} tone={tone} />
              <LabelDefs
                id={wordId}
                tone={tone}
                cap={LVL.wordRatio * lvl.cap}
              />
              {shadow && (
                // Room for the blur, which the default region would clip.
                <filter
                  id={id("lblshadow")}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx={LVL.shadow.dx * lvl.cap}
                    dy={LVL.shadow.dy * lvl.cap}
                    stdDeviation={LVL.shadow.blur * lvl.cap}
                    floodColor={mix(
                      LABEL_INK[tone].keyline,
                      LVL.shadow.darken,
                      "#000000",
                    )}
                    floodOpacity={LVL.shadow.opacity}
                  />
                </filter>
              )}
            </defs>
            {/* Filtered as one group: part by part, each would cast onto the
                next and double up where they overlap. */}
            <g filter={shadow ? `url(#${id("lblshadow")})` : undefined}>
              {run.parts.map((part, i) => {
                // The number takes the full-cap ink; the words take their own.
                const g = part.text === `${level}` ? id : wordId;
                return (
                  <text
                    key={i}
                    x={part.xs.join(" ")}
                    y={lvl.baseline}
                    textAnchor="start"
                    fontFamily={FAMILY}
                    fontSize={part.size}
                    fill={`url(#${g("lblink")})`}
                    stroke={`url(#${g("lblkey")})`}
                    strokeWidth={figure.outline * part.outline}
                    strokeLinejoin="round"
                    paintOrder="stroke"
                    xmlSpace="preserve"
                  >
                    {part.text}
                  </text>
                );
              })}
            </g>
          </svg>
        </>
      )}
    </span>
  );
}
