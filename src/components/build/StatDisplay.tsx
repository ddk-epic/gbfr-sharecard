import { LVL_DEF } from "./glyphs/lvl-def";
import {
  CAP_RATIO,
  Label,
  labelBox,
  PALETTE,
  Part,
  Value,
} from "./glyphs/label";

/** The stat box's height in cap heights. */
export const STAT_BOX_HEIGHT = 1.42;
const STAT_OFFSET_Y = 0.06;

/** Stat-plate placement in badge units (viewBox space, cap 17). */
const STAT = {
  cap: LVL_DEF.lvl.cap,
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
  unitAdvance: 0.69,
  /** Box past the content each side. */
  padX: 0.1,
} as const;

const NUMBER_SIZE = STAT.cap / CAP_RATIO;

/** A stat value, unit optional. */
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
  tone?: "plain" | "hp" | "atk" | "ui";
  className?: string;
}) {
  const palette = PALETTE[tone];

  const showUnit = value !== null && unit !== "";
  const unitCap = NUMBER_SIZE * STAT.unit.ratio * CAP_RATIO;
  const padX = STAT.padX * STAT.cap;
  // The reserve sets the width: ghost + real digits advance
  // the same total at any digit count.
  const contentWidth =
    reserveDigits * STAT.digitAdvance * STAT.cap +
    (showUnit ? STAT.unit.gap * unitCap + STAT.unitAdvance * unitCap : 0);

  const box = labelBox({
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
