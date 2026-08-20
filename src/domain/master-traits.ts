import type { MasterTraitSelections } from "./build";
import type { CellId, PerkRank, StyleId, StyleRank } from "@/catalog/ids";
import { PERK_RANKS, STYLES } from "@/catalog/ids";

/**
 * Each style's perk state per rank. A rank's perk is active when that rank holds
 * `thresholds[rank]` picks and every rank below it is active. EX has no perk.
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

export function rankSpend(
  selections: MasterTraitSelections,
  rank: StyleRank,
): number {
  return STYLES.reduce((n, style) => n + selections[style][rank].length, 0);
}

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

export function clearStyle(
  selections: MasterTraitSelections,
  style: StyleId,
): MasterTraitSelections {
  return {
    ...selections,
    [style]: { r1: [], r2: [], r3: [], ex: [] },
  };
}

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
