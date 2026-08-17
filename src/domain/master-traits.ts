import type { MasterTraitSelections } from "./build";
import type { CellId, PerkRank, StyleId, StyleRank } from "@/catalog/ids";
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

/** Points spent in a rank section. The pool is shared by all three styles. */
export function rankSpend(
  selections: MasterTraitSelections,
  rank: StyleRank,
): number {
  return STYLES.reduce((n, style) => n + selections[style][rank].length, 0);
}

/** Negative on a build saved before the budget was enforced. */
export function rankPointsLeft(
  selections: MasterTraitSelections,
  rank: StyleRank,
): number {
  return STYLE_RANK_BUDGETS[rank] - rankSpend(selections, rank);
}

const withRank = (
  selections: MasterTraitSelections,
  style: StyleId,
  rank: StyleRank,
  cells: CellId[],
): MasterTraitSelections => ({
  ...selections,
  [style]: { ...selections[style], [rank]: cells },
});

/**
 * Deselecting is always allowed, so an overspent build can only shrink;
 * selecting needs a point left in the rank's shared pool. Refusing returns the
 * same object, letting the caller toggle unconditionally.
 */
export function toggleCell(
  selections: MasterTraitSelections,
  style: StyleId,
  rank: StyleRank,
  id: CellId,
): MasterTraitSelections {
  const selected = selections[style][rank];
  if (selected.includes(id))
    return withRank(
      selections,
      style,
      rank,
      selected.filter((cell) => cell !== id),
    );
  if (rankPointsLeft(selections, rank) <= 0) return selections;
  return withRank(selections, style, rank, [...selected, id]);
}
