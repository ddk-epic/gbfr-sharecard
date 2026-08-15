import type { Build, MasterTraitSelections } from "./build";
import type { StyleId, StyleRank, TraitId } from "@/catalog/ids";
import { RANKS, STYLES } from "@/catalog/ids";

/**
 * Per-trait level sums over the 12 sigil slots (both traits credit at slot
 * level) + the 3 wrightstone slots. Editor-only; no caps, no % math.
 */
export function traitLevelTotals(build: Build): Map<TraitId, number> {
  const totals = new Map<TraitId, number>();
  const add = (trait: TraitId | null | undefined, level: number) => {
    if (trait) totals.set(trait, (totals.get(trait) ?? 0) + level);
  };
  for (const slot of build.sigils) {
    if (!slot) continue;
    add(slot.primaryTrait, slot.level);
    add(slot.secondaryTrait, slot.level);
  }
  const wrightstone = build.wrightstone;
  if (wrightstone) {
    add(wrightstone.main.trait, wrightstone.main.level);
    add(wrightstone.sub1?.trait, wrightstone.sub1?.level ?? 0);
    add(wrightstone.sub2?.trait, wrightstone.sub2?.level ?? 0);
  }
  return totals;
}

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
