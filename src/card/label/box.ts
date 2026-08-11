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

/** Box geometry for a Label's wrapper span and SVG viewBox, laid out around a
    baseline at y=0 - so `top` comes out negative and the Label sits on the
    origin. */
export function labelBox({
  cap,
  boxHeight,
  centerOffset = 0,
  left,
  right,
  fade = 0,
}: {
  /** The box's anchor cap. */
  cap: number;
  /** Box height. */
  boxHeight: number;
  /** The anchor's midline off the box's own centre. */
  centerOffset?: number;
  left: number;
  right: number;
  /** The bar's fade length. */
  fade?: number;
}): LabelBox {
  const height = boxHeight * cap;
  const top = -cap / 2 + centerOffset * cap - height / 2;
  const barTop = -cap / 2;
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
