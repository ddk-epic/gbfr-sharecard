import { describe, expect, test } from "vitest";
import type { TraitId } from "@/catalog/ids";
import { CHARACTERS, TRAITS, asCharacterId } from "@/catalog";
import { WRIGHTSTONE_SUB_POOL } from "./wrightstone";
import {
  canFollow,
  sigilSecondTraitPool,
  sigilTraitPool,
  takesSecondTrait,
} from "./sigils";

const character = (id: string) => {
  const minted = asCharacterId(id);
  if (!minted) throw new Error(`not a character: ${id}`);
  return minted;
};

const withFlag = (
  flag: "firstTrait" | "secondTrait" | "wrightstoneSub" | "noSecondSlot",
) => TRAITS.filter((trait) => trait[flag]);

describe("trait flags", () => {
  test("the counts the archive gives", () => {
    expect(TRAITS).toHaveLength(200);
    expect(withFlag("firstTrait")).toHaveLength(188);
    expect(withFlag("secondTrait")).toHaveLength(80);
    expect(withFlag("wrightstoneSub")).toHaveLength(72);
    expect(withFlag("noSecondSlot")).toHaveLength(6);
  });

  test("everything that rolls is a sigil trait", () => {
    expect(
      withFlag("wrightstoneSub").filter((trait) => !trait.firstTrait),
    ).toEqual([]);
  });

  test("the second slot is a superset of the wrightstone pool", () => {
    expect(
      withFlag("wrightstoneSub").filter((trait) => !trait.secondTrait),
    ).toEqual([]);
  });

  test("the twelve without a sigil are weapon traits", () => {
    expect(TRAITS.filter((trait) => !trait.firstTrait).map((trait) => trait.id))
      .toMatchInlineSnapshot(`
      [
        "catastrophe",
        "catastrophe-nova",
        "dmg-cap-cardinal",
        "dmg-cap-cobalt",
        "dmg-cap-ecru",
        "dmg-cap-sage",
        "sigil-booster",
        "supernova",
        "unbound-exertion",
        "unbound-master",
        "unbound-strike",
        "unbound-technique",
      ]
    `);
  });

  test("no single-trait sigil is in the wrightstone pool", () => {
    expect(WRIGHTSTONE_SUB_POOL.filter((trait) => trait.noSecondSlot)).toEqual(
      [],
    );
  });

  test("takesSecondTrait is false for exactly the single-trait six", () => {
    expect(TRAITS.filter((trait) => !takesSecondTrait(trait.id))).toHaveLength(
      6,
    );
  });

  test("the traits that lead but never follow", () => {
    expect(
      TRAITS.filter(
        (trait) => trait.firstTrait && !trait.character && !trait.secondTrait,
      ).map((trait) => trait.id),
    ).toMatchInlineSnapshot(`
      [
        "alpha",
        "auto-potion",
        "berserker-echo",
        "beta",
        "crabby-resonance",
        "crabmiration",
        "crabvestment-returns",
        "flight-over-fight",
        "gamma",
        "immortal-shell",
        "in-a-pinch",
        "natural-defenses",
        "potent-greens",
        "roll-of-the-die",
        "seven-net",
        "spartan-echo",
        "stout-heart",
        "sumo-force",
        "super-ultimate-perfect-dodge",
        "untouchable",
        "war-elemental",
      ]
    `);
  });
});

describe("sigil trait pool", () => {
  const openTraits = TRAITS.filter(
    (trait) => trait.firstTrait && !trait.character,
  ).length;

  test("every playable character owns sigils", () => {
    for (const character of CHARACTERS) {
      const own = TRAITS.filter(
        (trait) => trait.character === character.playerId,
      );
      expect(own.length, character.id).toBeGreaterThanOrEqual(3);
    }
  });

  test("a pool is the open traits plus that character's own", () => {
    for (const character of CHARACTERS) {
      const pool = sigilTraitPool(character.id);
      const own = pool.filter((trait) => trait.character);
      expect(pool).toHaveLength(openTraits + own.length);
      for (const trait of own)
        expect(trait.character, trait.id).toBe(character.playerId);
    }
  });

  test("Gran and Djeeta share The Captain's sigils", () => {
    const captain = CHARACTERS.filter((c) => c.playerId === "PL0000");
    expect(captain.map((c) => c.id)).toEqual(["gran", "djeeta"]);
    expect(TRAITS.filter((trait) => trait.character === "PL0000")).toHaveLength(
      3,
    );
  });

  test("no character sees another's sigils", () => {
    const io = sigilTraitPool(character("io")).map((trait) => trait.id);
    expect(io).toContain("mages-aspiration");
    expect(io).not.toContain("guardians-conviction");
  });
});

describe("second trait pool", () => {
  const ids = (first: TraitId | null) =>
    sigilSecondTraitPool(first).map((trait) => trait.id);

  test("no character trait is ever freely offered", () => {
    expect(
      TRAITS.filter((trait) => trait.secondTrait && trait.character),
    ).toEqual([]);
  });

  test("it is wider than the 72 that roll", () => {
    expect(ids(null).length).toBeGreaterThan(WRIGHTSTONE_SUB_POOL.length);
    // Reachable only through synthesis.
    expect(ids(null)).toContain("divergence");
    expect(ids(null)).toContain("celestial-terra");
    expect(ids(null)).toContain("fatebreaker");
    expect(ids(null)).not.toContain("war-elemental");
  });

  test("a character trait follows only its own partner, either way round", () => {
    expect(ids("mages-aspiration")).toContain("mages-savvy");
    expect(ids("mages-savvy")).toContain("mages-aspiration");
    // Not behind an unrelated first trait, nor another character's.
    expect(ids("dmg-cap")).not.toContain("mages-savvy");
    expect(ids("mages-aspiration")).not.toContain("guardians-honor");
  });

  test("pairsWith is symmetric, two per style", () => {
    const paired = TRAITS.filter((trait) => trait.pairsWith);
    expect(paired).toHaveLength(56);
    for (const trait of paired) {
      const partner = TRAITS.find((other) => other.id === trait.pairsWith);
      expect(partner?.pairsWith, trait.id).toBe(trait.id);
      expect(partner?.character, trait.id).toBe(trait.character);
    }
  });

  test("a Warpath leads only - it never follows anything", () => {
    const warpaths = TRAITS.filter(
      (trait) => trait.character && !trait.pairsWith,
    );
    // 28 Warpath slots, plus Ain and the two Boundaries.
    expect(warpaths).toHaveLength(31);
    for (const trait of warpaths) {
      expect(trait.secondTrait, trait.id).toBeUndefined();
      expect(ids("guardians-conviction")).not.toContain(trait.id);
    }
  });

  test("canFollow allows a duplicate, and both pair orders", () => {
    expect(canFollow("dmg-cap", "dmg-cap")).toBe(true);
    expect(canFollow("mages-aspiration", "mages-savvy")).toBe(true);
    expect(canFollow("mages-savvy", "mages-aspiration")).toBe(true);
    expect(canFollow("dmg-cap", "mages-warpath")).toBe(false);
  });
});
