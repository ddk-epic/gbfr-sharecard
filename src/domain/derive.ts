import type { MasterTraitSelections } from "./build";
import type { StyleId, StyleRank } from "@/catalog/ids";
import { RANKS, STYLES } from "@/catalog/ids";

/** Selection count per style, across all four rank sections. */
export function styleSelectionCounts(
  selections: MasterTraitSelections,
): Record<StyleId, number> {
  const counts = { insight: 0, essence: 0, crux: 0 };
  for (const style of STYLES)
    for (const rank of RANKS) counts[style] += selections[style][rank].length;
  return counts;
}

/**
 * Perk n is active when the style's total selection count reaches
 * thresholds[n]. Displayed, never enforced.
 */
export function stylePerkStates(
  selections: MasterTraitSelections,
  perkThresholds: number[],
): Record<StyleId, boolean[]> {
  const counts = styleSelectionCounts(selections);
  const states = {} as Record<StyleId, boolean[]>;
  for (const style of STYLES)
    states[style] = perkThresholds.map(
      (threshold) => counts[style] >= threshold,
    );
  return states;
}

export const STYLE_RANK_BUDGETS: Record<StyleRank, number> = {
  r1: 10,
  r2: 10,
  r3: 10,
  ex: 20,
};
