import { describe, expect, test } from "vitest";
import type { SigilLotId } from "@/catalog/types";
import type { TraitId } from "@/catalog/ids";
import { CHARACTERS, SIGIL_LOTS, TRAITS, asCharacterId } from "@/catalog";
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

const lot = (id: SigilLotId) => SIGIL_LOTS.lots[id].traits;

describe("sigil lots", () => {
  test("the counts the archive gives", () => {
    expect(TRAITS).toHaveLength(200);
    expect(lot("standard")).toHaveLength(72);
    expect(lot("synthesisOnly")).toHaveLength(8);
    expect(lot("firstTraitOnly")).toHaveLength(93);
    expect(lot("singleTraitOnly")).toHaveLength(9);
    expect(lot("lucilius")).toHaveLength(3);
    expect(lot("boundary")).toHaveLength(3);
    expect(lot("weaponOnly")).toHaveLength(12);
  });

  test("every trait sits in exactly one lot", () => {
    const seen = Object.values(SIGIL_LOTS.lots).flatMap(
      (entry) => entry.traits,
    );
    expect(seen).toHaveLength(TRAITS.length);
    expect(new Set(seen).size).toBe(TRAITS.length);
    for (const id of seen)
      expect(
        TRAITS.some((t) => t.id === id),
        id,
      ).toBe(true);
  });

  test("no lot name shadows a trait id", () => {
    const ids = new Set(TRAITS.map((trait) => trait.id));
    expect(
      Object.keys(SIGIL_LOTS.lots).filter((name) => ids.has(name)),
    ).toEqual([]);
  });

  test("only standard rolls, and it is the whole wrightstone pool", () => {
    const rolling = Object.entries(SIGIL_LOTS.lots)
      .filter(([, entry]) => entry.wrightstoneSub)
      .map(([name]) => name);
    expect(rolling).toEqual(["standard"]);
    expect(WRIGHTSTONE_SUB_POOL).toHaveLength(72);
  });

  test("the twelve without a sigil are weapon traits", () => {
    expect(lot("weaponOnly")).toMatchInlineSnapshot(`
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

  test("takesSecondTrait is false for the single-trait sigils and weapon traits", () => {
    expect(
      TRAITS.filter((trait) => !takesSecondTrait(trait.id)).map((t) => t.id),
    ).toEqual([...lot("singleTraitOnly"), ...lot("weaponOnly")].sort());
  });

  test("the pinned lots name a trait, the rest name lots", () => {
    expect(SIGIL_LOTS.lots.lucilius.eligibleSecondTraits).toEqual(["dmg-cap"]);
    expect(SIGIL_LOTS.lots.boundary.eligibleSecondTraits).toEqual(["regen"]);
    for (const name of ["standard", "synthesisOnly", "firstTraitOnly"] as const)
      expect(SIGIL_LOTS.lots[name].eligibleSecondTraits).toEqual([
        "standard",
        "synthesisOnly",
      ]);
  });
});

describe("pairs and characters", () => {
  test("one pair per character, and both halves belong to it", () => {
    expect(SIGIL_LOTS.pairs).toHaveLength(28);
    expect(Object.keys(SIGIL_LOTS.characters)).toHaveLength(28);
    for (const [one, other] of SIGIL_LOTS.pairs) {
      const owner = Object.entries(SIGIL_LOTS.characters).find(([, owned]) =>
        owned.includes(one),
      );
      expect(owner, one).toBeDefined();
      expect(owner?.[1], one).toContain(other);
    }
  });

  test("a character owns three traits, or four with a Boundary", () => {
    for (const [playerId, owned] of Object.entries(SIGIL_LOTS.characters)) {
      const boundaries = owned.filter((id) => lot("boundary").includes(id));
      expect(owned, playerId).toHaveLength(3 + boundaries.length);
      expect(boundaries.length, playerId).toBeLessThanOrEqual(1);
    }
  });

  test("no character trait is ever freely offered as a second", () => {
    const open = [...lot("standard"), ...lot("synthesisOnly")];
    const owned = new Set(Object.values(SIGIL_LOTS.characters).flat());
    expect(open.filter((id) => owned.has(id))).toEqual([]);
  });
});

describe("sigil trait pool", () => {
  test("every playable character owns sigils", () => {
    for (const entry of CHARACTERS) {
      const owned = SIGIL_LOTS.characters[entry.playerId] ?? [];
      expect(owned.length, entry.id).toBeGreaterThanOrEqual(3);
    }
  });

  test("a pool is the open traits plus that character's own", () => {
    const owned = new Set(Object.values(SIGIL_LOTS.characters).flat());
    const openTraits = sigilTraitPool(character("io")).filter(
      (trait) => !owned.has(trait.id),
    ).length;
    for (const entry of CHARACTERS) {
      const pool = sigilTraitPool(entry.id);
      const own = pool.filter((trait) => owned.has(trait.id));
      expect(pool).toHaveLength(openTraits + own.length);
      for (const trait of own)
        expect(SIGIL_LOTS.characters[entry.playerId], trait.id).toContain(
          trait.id,
        );
    }
  });

  test("Gran and Djeeta share The Captain's sigils", () => {
    const captain = CHARACTERS.filter((c) => c.playerId === "PL0000");
    expect(captain.map((c) => c.id)).toEqual(["gran", "djeeta"]);
    expect(SIGIL_LOTS.characters.PL0000).toHaveLength(3);
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

  test("it is wider than the 72 that roll", () => {
    expect(ids("atk")).toHaveLength(80);
    expect(ids("atk").length).toBeGreaterThan(WRIGHTSTONE_SUB_POOL.length);
    // Reachable only through synthesis.
    expect(ids("atk")).toContain("divergence");
    expect(ids("atk")).toContain("celestial-terra");
    expect(ids("atk")).toContain("fatebreaker");
    expect(ids("atk")).not.toContain("war-elemental");
  });

  test("a character trait follows only its own partner, either way round", () => {
    expect(ids("mages-aspiration")).toContain("mages-savvy");
    expect(ids("mages-savvy")).toContain("mages-aspiration");
    // Not behind an unrelated first trait, nor another character's.
    expect(ids("dmg-cap")).not.toContain("mages-savvy");
    expect(ids("mages-aspiration")).not.toContain("guardians-honor");
  });

  test("a partner widens the open pool by exactly itself", () => {
    expect(ids("mages-aspiration")).toHaveLength(81);
    expect(ids("mages-aspiration")[0]).toBe("mages-savvy");
  });

  test("a Warpath leads only - it never follows anything", () => {
    const owned = Object.values(SIGIL_LOTS.characters).flat();
    const paired = new Set(SIGIL_LOTS.pairs.flat());
    const leaders = owned.filter((id) => !paired.has(id));
    // 28 Warpath slots, plus Ain and the two Boundaries.
    expect(leaders).toHaveLength(31);
    for (const id of leaders)
      expect(ids("guardians-conviction"), id).not.toContain(id);
  });

  test("a pinned first trait offers only its own second", () => {
    expect(ids("alpha")).toEqual(["dmg-cap"]);
    expect(canFollow("alpha", "dmg-cap")).toBe(true);
    expect(canFollow("alpha", "atk")).toBe(false);
    // The pin is one-way - DMG Cap leads a normal sigil.
    expect(ids("dmg-cap").length).toBeGreaterThan(1);
  });

  test("a pinned character trait beats the open pool, but still leads only", () => {
    expect(ids("ain")).toEqual(["regen"]);
    expect(canFollow("ain", "regen")).toBe(true);
    expect(canFollow("ain", "atk")).toBe(false);
    // Pinning a second does not make the trait itself followable.
    expect(canFollow("dmg-cap", "ain")).toBe(false);
  });

  test("a single-trait sigil offers nothing", () => {
    expect(ids("crabmiration")).toEqual([]);
    expect(canFollow("crabmiration", "atk")).toBe(false);
  });

  test("canFollow allows a duplicate, and both pair orders", () => {
    expect(canFollow("dmg-cap", "dmg-cap")).toBe(true);
    expect(canFollow("mages-aspiration", "mages-savvy")).toBe(true);
    expect(canFollow("mages-savvy", "mages-aspiration")).toBe(true);
    expect(canFollow("dmg-cap", "mages-warpath")).toBe(false);
  });

  test("every second pool is the open pool, narrowed or plus a partner", () => {
    const open = new Set([...lot("standard"), ...lot("synthesisOnly")]);
    const partner = new Map(
      SIGIL_LOTS.pairs.flatMap(([a, b]) => [
        [a, b],
        [b, a],
      ]),
    );
    for (const trait of TRAITS) {
      const allowed = new Set(open);
      const mate = partner.get(trait.id);
      if (mate) allowed.add(mate);
      for (const id of ids(trait.id))
        expect(allowed.has(id), `${trait.id} -> ${id}`).toBe(true);
    }
  });
});
