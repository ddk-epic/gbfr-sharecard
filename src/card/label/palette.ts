export type ToneColors = {
  topColor: string;
  bottomColor: string;
  keylineColor: string;
};

const OFF_WHITE = "#f7f3ea";

/** One flat colour with an off-white keyline; paint with Part's `noColorFade`. */
const statTone = (color: string): ToneColors => ({
  topColor: color,
  bottomColor: color,
  keylineColor: OFF_WHITE,
});

export const PALETTE = {
  plain: {
    topColor: "#ffffff",
    bottomColor: "#c3e3ff",
    keylineColor: "#304b6f",
  },
  gold: {
    topColor: "#ffeedc",
    bottomColor: "#ffbe86",
    keylineColor: "#80402f",
  },
  pwr: {
    topColor: "#fff1c1",
    bottomColor: "#f5cd72",
    keylineColor: "#654f0d",
  },
  hp: statTone("#007d50"),
  atk: statTone("#b45a00"),
  ui: statTone("#325f7d"),
} satisfies Record<string, ToneColors>;

export type Tone = keyof typeof PALETTE;
