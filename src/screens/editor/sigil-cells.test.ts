import { describe, expect, test } from "vitest";
import type { SigilSlot } from "@/domain/build";
import {
  cellCount,
  cells,
  clear,
  cursorFor,
  filledCount,
  nextEmpty,
  pick,
  setLevel,
  type Cell,
  type Sigils,
} from "./sigil-cells";

const SOLO = "stout-heart";
const A = "war-elemental";
const B = "improved-guard";

const slot = (primary: string, secondary: string | null = null): SigilSlot => ({
  primaryTrait: primary,
  secondaryTrait: secondary,
  level: 15,
});

const board = (...slots: (SigilSlot | null)[]): Sigils => slots;

const byCell = (a: Cell, b: Cell) =>
  a.index - b.index || Number(a.secondary) - Number(b.secondary);

describe("cells", () => {
  test("an empty sigil offers two - nothing decides yet", () => {
    expect(cells(board(null))).toHaveLength(2);
  });

  test("a single-trait sigil offers one", () => {
    expect(cells(board(slot(SOLO)))).toEqual([{ index: 0, secondary: false }]);
  });

  test("a stored second trait keeps its cell even under the rule", () => {
    expect(cells(board(slot(SOLO, B)))).toHaveLength(2);
    expect(filledCount(board(slot(SOLO, B)))).toBe(2);
  });
});

describe("cursor", () => {
  test("skips the second cell of a single-trait sigil", () => {
    expect(
      nextEmpty(board(slot(SOLO), null), { index: 0, secondary: false }),
    ).toEqual({ index: 1, secondary: false });
  });

  test("an empty sigil's second cell aims at its first", () => {
    expect(cursorFor(board(null), { index: 0, secondary: true })).toEqual({
      index: 0,
      secondary: false,
    });
  });

  test("wraps, so a gap left behind is still reachable", () => {
    const sigils = board(null, slot(A, B));
    expect(nextEmpty(sigils, { index: 1, secondary: true })).toEqual({
      index: 0,
      secondary: false,
    });
  });

  test("null once every cell is filled", () => {
    expect(nextEmpty(board(slot(SOLO), slot(A, B)), null)).toBeNull();
  });

  test("across takes the sigil's own second trait next", () => {
    expect(
      nextEmpty(board(slot(A), null), { index: 0, secondary: false }, "across"),
    ).toEqual({ index: 0, secondary: true });
  });

  test("down takes the next sigil's first trait next", () => {
    expect(
      nextEmpty(board(slot(A), null), { index: 0, secondary: false }, "down"),
    ).toEqual({ index: 1, secondary: false });
  });

  test("down turns into the second column once the first is full", () => {
    const sigils = board(slot(A), slot(A));
    expect(nextEmpty(sigils, { index: 1, secondary: false }, "down")).toEqual({
      index: 0,
      secondary: true,
    });
  });

  test("either way it is the same cells, only reordered", () => {
    const sigils = board(slot(SOLO), slot(A, B), null);
    expect([...cells(sigils, "down")].sort(byCell)).toEqual(
      [...cells(sigils, "across")].sort(byCell),
    );
  });
});

describe("picking", () => {
  test("a single-trait pick drops the second trait it would have kept", () => {
    const sigils = pick(
      board(slot(A, B)),
      { index: 0, secondary: false },
      SOLO,
    );
    expect(sigils[0]).toEqual(slot(SOLO));
    expect(cellCount(sigils)).toBe(1);
  });

  test("replacing a first trait keeps the level and the second", () => {
    const sigils = pick(board(slot(A, B)), { index: 0, secondary: false }, "x");
    expect(sigils[0]).toEqual({
      primaryTrait: "x",
      secondaryTrait: B,
      level: 15,
    });
  });

  test("a pinned first trait brings its second with it", () => {
    const sigils = pick(board(null), { index: 0, secondary: false }, "alpha");
    expect(sigils[0]).toEqual({
      primaryTrait: "alpha",
      secondaryTrait: "dmg-cap",
      level: 15,
    });
    // Both cells filled, so the cursor moves past the sigil entirely.
    expect(nextEmpty(sigils, { index: 0, secondary: false })).toBeNull();
  });

  test("a pinned pick overrides the second trait it replaces", () => {
    const sigils = pick(
      board(slot(A, B)),
      { index: 0, secondary: false },
      "beta",
    );
    expect(sigils[0]?.secondaryTrait).toBe("dmg-cap");
  });

  test("a second trait needs a first, so it cannot land alone", () => {
    const sigils = board(null);
    expect(pick(sigils, { index: 0, secondary: true }, B)).toBe(sigils);
  });
});

describe("clearing", () => {
  test("a second trait goes on its own", () => {
    expect(clear(board(slot(A, B)), { index: 0, secondary: true })[0]).toEqual(
      slot(A),
    );
  });

  test("a first trait takes the sigil with it", () => {
    expect(
      clear(board(slot(A, B)), { index: 0, secondary: false })[0],
    ).toBeNull();
  });

  test("clearing leaves a gap the cursor can be aimed back into", () => {
    const sigils = clear(board(slot(A, B), slot(A)), {
      index: 0,
      secondary: false,
    });
    expect(cursorFor(sigils, { index: 0, secondary: false })).toEqual({
      index: 0,
      secondary: false,
    });
    expect(filledCount(sigils)).toBe(1);
  });
});

test("a level only lands on a sigil that is there", () => {
  expect(setLevel(board(slot(A)), 0, 11)[0]?.level).toBe(11);
  expect(setLevel(board(null), 0, 11)[0]).toBeNull();
});
