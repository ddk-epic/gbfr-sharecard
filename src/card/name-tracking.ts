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
