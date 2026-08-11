/** Box geometry for a Label's wrapper span and SVG viewBox. `left`/`right`
    are declared, not measured - the browser flows the glyphs. Draw with
    overflow visible; an undersize box clips otherwise. */

export type LabelBox = {
  top: number;
  left: number;
  right: number;
  width: number;
  height: number;
  /** SlantedBar's `share`. Puts the bar's top edge on baseline - cap/2. */
  barShare: string;
  /** SlantedBar's `fadeFrom`, x the bar's width. */
  barFade: string;
};

export function labelBox({
  baseline,
  cap,
  boxHeight,
  centerOffset = 0,
  left,
  right,
  fade = 0,
}: {
  baseline: number;
  /** The box's anchor cap. */
  cap: number;
  /** Box height. */
  boxHeight: number;
  /** The anchor's midline off the box's own centre. */
  centerOffset?: number;
  left: number;
  right: number;
  /** The bar's fade length, box units; 0 leaves it hard-edged. */
  fade?: number;
}): LabelBox {
  const height = boxHeight * cap;
  const top = baseline - cap / 2 + centerOffset * cap - height / 2;
  const barTop = baseline - cap / 2;
  const width = right - left;
  return {
    top,
    left,
    right,
    width,
    height,
    barShare: `${((top + height - barTop) / height) * 100}%`,
    barFade: `${((width - fade) / width) * 100}%`,
  };
}
