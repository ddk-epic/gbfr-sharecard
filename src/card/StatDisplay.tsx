import { useId } from "react";
import { LVL_DEF } from "./lvl-def";
import { CAP_RATIO, type SvgId } from "./label-run";
import { PALETTE, type Tone } from "./label/palette";
import { Label } from "./label/Label";
import { Part, Value } from "./label/Part";
import { labelBox } from "./label/box";

/** The stat box's height in cap heights. */
export const STAT_BOX_HEIGHT = 1.42;

/** The figure raised off the box's centre. */
const STAT_OFFSET_Y = 0.06;

/** Stat-plate placement in badge units (viewBox space; cap 17, baseline 36).
    The browser flows the glyphs; the box is declared - see label/box.ts. */
const STAT = {
  cap: LVL_DEF.lvl.cap,
  baseline: LVL_DEF.lvl.baseline,
  outerKeyline: 0.1,
  innerKeyline: 0,
  boxHeight: STAT_BOX_HEIGHT,
  offsetY: STAT_OFFSET_Y,
  tracking: -0.085,
  unit: {
    ratio: 0.75,
    gap: 0.2,
  },
  /** A tabular digit's advance. */
  digitAdvance: 0.69,
  /** The unit's advance. */
  unitAdvance: 1.261,
  /** Box past the content each side. */
  padX: 0.1,
} as const;

const NUMBER_SIZE = STAT.cap / CAP_RATIO;

/**
 * A stat value: the game's figures with an optional unit.
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
  /** the unit "%" */
  unit?: string;
  reserveDigits: number;
  /** The stat palettes: `hp`, `atk`, `ui`. */
  tone?: Tone;
  className?: string;
}) {
  const uid = useId();
  const id: SvgId = (name) => `${uid}-${name}`;
  const palette = PALETTE[tone];

  const showUnit = value !== null && unit !== "";
  const unitCap = NUMBER_SIZE * STAT.unit.ratio * CAP_RATIO;
  const padX = STAT.padX * STAT.cap;
  // The reserve sets the width, not the value: ghost + real digits advance
  // the same total at any digit count.
  const contentWidth =
    reserveDigits * STAT.digitAdvance * STAT.cap +
    (showUnit ? STAT.unit.gap * unitCap + STAT.unitAdvance * unitCap : 0);

  const box = labelBox({
    baseline: STAT.baseline,
    cap: STAT.cap,
    boxHeight: STAT.boxHeight,
    centerOffset: STAT.offsetY,
    left: -padX,
    right: contentWidth + padX,
  });
  const px = cap / STAT.cap;
  const size = { width: box.width * px, height: box.height * px };

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
        className="relative block overflow-visible"
        viewBox={`${box.left} ${box.top} ${box.width} ${box.height}`}
        width={size.width}
        height={size.height}
      >
        <Label
          id={id}
          baseline={STAT.baseline}
          anchorSize={NUMBER_SIZE}
          outerKeyline={STAT.outerKeyline}
          innerKeyline={STAT.innerKeyline}
        >
          <Value
            size={NUMBER_SIZE}
            tracking={STAT.tracking}
            noColorFade
            ghost={Math.max(0, reserveDigits - String(value).length)}
            {...palette}
          >
            {value}
          </Value>
          {showUnit && (
            <Part
              size={NUMBER_SIZE * STAT.unit.ratio}
              gap={STAT.unit.gap}
              noColorFade
              {...palette}
            >
              {unit}
            </Part>
          )}
        </Label>
      </svg>
    </span>
  );
}
