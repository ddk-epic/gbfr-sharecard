import { describe, expect, test } from "vitest";
import {
  CHARACTERS,
  WRIGHTSTONE_SUB_POOL,
  TRAITS,
  asCharacterId,
  sigilTraitPool,
  takesSecondTrait,
} from ".";

const character = (id: string) => {
  const minted = asCharacterId(id);
  if (!minted) throw new Error(`not a character: ${id}`);
  return minted;
};

const withFlag = (
  flag: "firstTrait" | "wrightstoneSub" | "noSecondSlot",
) =>
  TRAITS.filter((trait) => trait[flag]);

describe("trait flags", () => {
  test("the counts the archive gives", () => {
    expect(TRAITS).toHaveLength(200);
    expect(withFlag("firstTrait")).toHaveLength(188);
    expect(withFlag("wrightstoneSub")).toHaveLength(72);
    expect(withFlag("noSecondSlot")).toHaveLength(6);
  });

  test("everything that rolls is a sigil trait", () => {
    expect(withFlag("wrightstoneSub").filter((trait) => !trait.firstTrait)).toEqual([]);
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
    expect(WRIGHTSTONE_SUB_POOL.filter((trait) => trait.noSecondSlot)).toEqual([]);
  });

  test("takesSecondTrait is false for exactly the single-trait six", () => {
    expect(TRAITS.filter((trait) => !takesSecondTrait(trait.id))).toHaveLength(
      6,
    );
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
