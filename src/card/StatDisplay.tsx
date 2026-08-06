import { useId } from "react";
import { BADGE, type LabelTone } from "./lvl-badge";
import {
  LabelDefs,
  LabelRun,
  LabelShadowFilter,
  CAP_RATIO,
  type SvgId,
} from "./label-run";

/** The stat box's height in cap heights; also the fixed plate height, so a
    taller icon cannot drive the row's baseline. */
export const STAT_BOX_HEIGHT = 1.35;

/** The figure raised off the box's centre, x cap. */
export const STAT_OFFSET_Y = 0.06;

/** Stat-plate placement in badge units (viewBox space; cap 17, baseline 36). */
const STAT = {
  cap: BADGE.lvl.cap, //           number cap height
  baseline: BADGE.lvl.baseline, // shared baseline
  /** The number's keyline width. */
  outline: 1.5,
  /** Box height in cap heights; flatter than a level chip. */
  boxHeight: STAT_BOX_HEIGHT,
  /** The figure raised off the box's centre, x cap. */
  offsetY: STAT_OFFSET_Y,
  /** Between digits, x cap; uniform, so a plain letter-spacing carries it. */
  tracking: -0.09,
  /** SEED: right edge the number pins to; the origin here. */
  numberRight: 0,
  /** SEED: one tabular digit's advance incl. tracking; times reserveDigits it is
      the reserved box, so it must match a real digit or the reserve reads wide. */
  digitStep: 11,
  /** Box past the content each side, x cap; only the keyline overshoot, not
      reserve - kept small so it does not read as an extra slot. */
  padX: 0.1,
  unit: {
    /** The unit's ink height as a share of the number's cap; also its size. */
    ratio: 0.7,
    /** The number to its unit, x cap. */
    gap: 0.2,
    /** The unit's keyline as a share of the number's. */
    outline: 0.7,
    /** SEED: the unit's advance, past which the box still pads. */
    width: 14,
  },
} as const;

const NUMBER_SIZE = STAT.cap / CAP_RATIO;

/**
 * A stat value: the game's figures with an optional unit, no word and no bar.
 * `reserveDigits` holds a fixed box width so a column of plates stays put. Pure
 * JSX; the browser reflows when the face loads.
 */
export function StatDisplay({
  cap,
  value,
  unit = "",
  reserveDigits,
  tone = "plain",
  className = "",
}: {
  cap: number;
  value: number | null;
  /** Hung off the figure at the unit size; "%" and nothing else so far. */
  unit?: string;
  reserveDigits: number;
  /** The stat palettes: `hp`, `atk`, `ui`. */
  tone?: LabelTone;
  className?: string;
}) {
  const uid = useId();
  const id: SvgId = (name) => `${uid}-${name}`; //    number ramp (full cap)
  const wordId: SvgId = (name) => id(`w-${name}`); // unit ramp (lighter, unit cap)

  const showUnit = value !== null && unit !== "";
  const boxHeight = STAT.boxHeight * STAT.cap;
  const padX = STAT.padX * STAT.cap;
  // The number's middle sits offsetY off the box centre.
  const top =
    STAT.baseline - STAT.cap / 2 + STAT.offsetY * STAT.cap - boxHeight / 2;
  // The reserve, not the value, sets the left; the box holds its width whatever
  // the value draws, so the plate never resizes.
  const contentLeft = STAT.numberRight - reserveDigits * STAT.digitStep;
  const contentRight =
    STAT.numberRight +
    (showUnit ? STAT.unit.gap * STAT.cap + STAT.unit.width : 0);
  const left = contentLeft - padX;
  const right = contentRight + padX;
  const px = cap / STAT.cap;
  const size = { width: (right - left) * px, height: boxHeight * px };

  if (value === null) {
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
      aria-label={`${value}${unit}`}
    >
      <svg
        className="relative block"
        viewBox={`${left} ${top} ${right - left} ${boxHeight}`}
        width={size.width}
        height={size.height}
      >
        <defs>
          <LabelDefs id={id} tone={tone} />
          <LabelDefs id={wordId} tone={tone} cap={STAT.unit.ratio * STAT.cap} />
          <LabelShadowFilter id={id} tone={tone} />
        </defs>
        {/* One group so the shadow casts once, not per run. */}
        <g filter={`url(#${id("lblshadow")})`}>
          <LabelRun
            ink={id}
            x={STAT.numberRight}
            textAnchor="end"
            size={NUMBER_SIZE}
            outline={STAT.outline}
            letterSpacing={STAT.tracking * STAT.cap}
          >
            {value}
          </LabelRun>
          {showUnit && (
            <LabelRun
              ink={wordId}
              x={STAT.numberRight + STAT.unit.gap * STAT.cap}
              size={NUMBER_SIZE * STAT.unit.ratio}
              outline={STAT.outline * STAT.unit.outline}
            >
              {unit}
            </LabelRun>
          )}
        </g>
      </svg>
    </span>
  );
}
