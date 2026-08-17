/**
 * Letter-spacing by name length, tightest for the longest. Steps are em so they
 * scale with the row; names below the last threshold keep the face's spacing.
 */
const NAME_TRACKING = [
  { from: 20, em: -0.048 },
  { from: 16, em: -0.036 },
  { from: 12, em: -0.024 },
  { from: 8, em: -0.012 },
];

export const nameTracking = (name: string) => {
  const step = NAME_TRACKING.find((t) => name.length >= t.from);
  return step ? `${step.em}em` : undefined;
};

/**
 * Letter-spacing by trait label weight, tightest for the longest.
 */
const TRAIT_LABEL_TRACKING = [
  { from: 42, em: -0.04 },
  { from: 30, em: -0.03 },
  { from: 18, em: -0.02 },
];

/** Weight past which a label takes the cell's two-line treatment. */
const TRAIT_LABEL_WRAP_FROM = 19;

/** How a trait label is set to fit its cell. Stars have a weight of 2. */
export const traitLabelFit = (label: string, perkRank?: number) => {
  const weight = label.length + (perkRank ?? 0) * 2;
  const step = TRAIT_LABEL_TRACKING.find((t) => weight >= t.from);
  return {
    wraps: weight >= TRAIT_LABEL_WRAP_FROM,
    tracking: step ? `${step.em}em` : undefined,
  };
};
