import { describe, expect, test } from "vitest";
import type { CellId, StyleId, StyleRank } from "@/catalog/ids";
import { PERK_THRESHOLDS } from "@/catalog/types";
import { emptyMasterTraits } from "./build";
import {
  rankPointsLeft,
  rankSpend,
  stylePerkStates,
  toggleCell,
} from "./master-traits";

type RankCounts = Partial<Record<StyleRank, number>>;

/** n placeholder cell ids - only the count decides a perk or a spend. */
const cells = (style: StyleId, rank: StyleRank, n: number): CellId[] =>
  Array.from({ length: n }, (_, i) => `${style}.${rank}.${i}`);

/** Per-style rank counts, e.g. `{ insight: { r1: 4 }, crux: { r1: 6 } }`. */
const across = (byStyle: Partial<Record<StyleId, RankCounts>>) => {
  const selections = emptyMasterTraits();
  for (const [style, counts] of Object.entries(byStyle))
    for (const [rank, n] of Object.entries(counts ?? {}))
      selections[style as StyleId][rank as StyleRank] = cells(
        style as StyleId,
        rank as StyleRank,
        n,
      );
  return selections;
};

/** A selection built from one style's per-rank counts. */
const picked = (counts: RankCounts, style: StyleId = "insight") =>
  across({ [style]: counts });

const perks = (counts: RankCounts) =>
  stylePerkStates(picked(counts), PERK_THRESHOLDS).insight;

/** Rank 1's 10 points, spread over all three styles. */
const fullRank1 = () =>
  across({ insight: { r1: 4 }, essence: { r1: 4 }, crux: { r1: 2 } });

describe("style rank perks", () => {
  test("a rank counts only its own section", () => {
    expect(perks({ r1: 3, r3: 3 })).toEqual({
      r1: true,
      r2: false,
      r3: false,
    });
  });

  test("an empty rank 2 kills rank 3 however full it is", () => {
    expect(perks({ r1: 3, r3: 6 })).toEqual({
      r1: true,
      r2: false,
      r3: false,
    });
  });

  test("every threshold met lights every perk", () => {
    expect(perks({ r1: 3, r2: 6, r3: 6 })).toEqual({
      r1: true,
      r2: true,
      r3: true,
    });
  });

  test("rank 1 one short takes the ranks above it down", () => {
    expect(perks({ r1: 2, r2: 6, r3: 6 })).toEqual({
      r1: false,
      r2: false,
      r3: false,
    });
  });

  test("every cell taken stays lit - perks never read the pool", () => {
    expect(perks({ r1: 4, r2: 8, r3: 8, ex: 10 })).toEqual({
      r1: true,
      r2: true,
      r3: true,
    });
  });

  test("EX selections light nothing", () => {
    expect(perks({ ex: 20 })).toEqual({ r1: false, r2: false, r3: false });
  });

  test("a style's selections leave the other styles alone", () => {
    const states = stylePerkStates(
      picked({ r1: 3, r2: 6, r3: 6 }, "essence"),
      PERK_THRESHOLDS,
    );
    expect(states.essence).toEqual({ r1: true, r2: true, r3: true });
    expect(states.insight).toEqual({ r1: false, r2: false, r3: false });
    expect(states.crux).toEqual({ r1: false, r2: false, r3: false });
  });
});

describe("style rank budget", () => {
  test("a rank's spend sums across the styles, not across the ranks", () => {
    const selections = across({
      insight: { r1: 4, r2: 8 },
      essence: { r1: 3 },
    });
    expect(rankSpend(selections, "r1")).toBe(7);
    expect(rankSpend(selections, "r2")).toBe(8);
    expect(rankSpend(selections, "r3")).toBe(0);
    expect(rankPointsLeft(selections, "r1")).toBe(3);
  });

  test("the 11th rank 1 pick is refused, whichever style asks", () => {
    const full = fullRank1();
    expect(rankPointsLeft(full, "r1")).toBe(0);
    expect(toggleCell(full, "crux", "r1", "crux.r1.2")).toBe(full);
    expect(toggleCell(full, "insight", "r1", "insight.r1.9")).toBe(full);
  });

  test("a spent rank leaves the other ranks alone", () => {
    const next = toggleCell(fullRank1(), "insight", "r2", "insight.r2.0");
    expect(next.insight.r2).toEqual(["insight.r2.0"]);
  });

  test("deselecting works with no points left", () => {
    const next = toggleCell(fullRank1(), "insight", "r1", "insight.r1.0");
    expect(next.insight.r1).toEqual([
      "insight.r1.1",
      "insight.r1.2",
      "insight.r1.3",
    ]);
    expect(rankPointsLeft(next, "r1")).toBe(1);
  });

  test("a build saved overspent can only shrink", () => {
    const over = across({
      insight: { r1: 4 },
      essence: { r1: 4 },
      crux: { r1: 4 },
    });
    expect(rankPointsLeft(over, "r1")).toBe(-2);
    expect(toggleCell(over, "crux", "r1", "crux.r1.9")).toBe(over);
    const shrunk = toggleCell(over, "crux", "r1", "crux.r1.0");
    expect(rankPointsLeft(shrunk, "r1")).toBe(-1);
  });

  test("EX carries 20 points", () => {
    const full = across({ insight: { ex: 10 }, essence: { ex: 10 } });
    expect(rankPointsLeft(full, "ex")).toBe(0);
    expect(toggleCell(full, "crux", "ex", "crux.ex.0")).toBe(full);
  });
});
