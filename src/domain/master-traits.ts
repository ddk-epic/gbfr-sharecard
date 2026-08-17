import type { MasterTraitSelections } from "./build";
import type { PerkRank, StyleId, StyleRank } from "@/catalog/ids";
import { PERK_RANKS, STYLES } from "@/catalog/ids";

/**
 * A style's rank perk activates when that rank section holds `thresholds[rank]`
 * selections *and* the rank below it has already activated - so the active
 * perks are always a prefix, and an empty rank 2 kills rank 3 however full it
 * is. Selections in other ranks of the same style never count, and EX has no
 * perk at all. Displayed, never enforced.
 */
export function stylePerkStates(
  selections: MasterTraitSelections,
  thresholds: Record<PerkRank, number>,
): Record<StyleId, Record<PerkRank, boolean>> {
  const states = {} as Record<StyleId, Record<PerkRank, boolean>>;
  for (const style of STYLES) {
    let below = true;
    states[style] = {} as Record<PerkRank, boolean>;
    for (const rank of PERK_RANKS) {
      below &&= selections[style][rank].length >= thresholds[rank];
      states[style][rank] = below;
    }
  }
  return states;
}

export const STYLE_RANK_BUDGETS: Record<StyleRank, number> = {
  r1: 10,
  r2: 10,
  r3: 10,
  ex: 20,
};
