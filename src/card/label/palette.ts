export type Tone = "plain" | "gold" | "hp" | "atk" | "ui";

export type ToneColors = {
  topColor: string;
  bottomColor: string;
  keylineColor: string;
};

const OFF_WHITE = "#f7f3ea";

/** Stat tones: one flat colour, off-white keyline. Painted with Part's
    `noColorFade`, so both ends carry the same colour. */
const statTone = (color: string): ToneColors => ({
  topColor: color,
  bottomColor: color,
  keylineColor: OFF_WHITE,
});

export const PALETTE: Record<Tone, ToneColors> = {
  plain: {
    topColor: "#ffffff",
    bottomColor: "#c3e3ff",
    keylineColor: "#3c5f7d",
  },
  gold: {
    topColor: "#ffeedc",
    bottomColor: "#ffbe86",
    keylineColor: "#80402f",
  },
  hp: statTone("#007d50"),
  atk: statTone("#b45a00"),
  ui: statTone("#325f7d"),
};
