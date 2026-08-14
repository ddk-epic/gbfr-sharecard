import type { DigitPlacement } from "./lvl-def";

/** Places pre-rendered digit-glyph images along a laid-out run. The figures are
    art and carry their own colour, so they take no label paint. */
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
