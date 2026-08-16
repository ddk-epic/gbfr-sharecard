import { describe, expect, it } from "vitest";
import { asCharacterId } from "@/catalog";
import type { Build, SigilSlot } from "./build";
import { emptyBuild } from "./build";
import { defaultWeapon } from "./weapons";
import { deriveStatus } from "./status";

// The maxed Io of docs/stats.md#the-confirmed-builds. Of its four over-mastery
// lines only Stun Power moves a displayed stat.
const IO = asCharacterId("io")!;
const OVER_MASTERY = [
  { bonusType: "chain-burst-damage-up", value: 10 },
  { bonusType: "skill-damage-cap-up", value: 20 },
  { bonusType: "stun-power-up", value: 10 },
  { bonusType: "normal-attack-damage-cap-up", value: 20 },
];

const build = (
  series: string,
  poolTraits: string[],
  wrightstoneTrait: string,
  sigils: SigilSlot[] = [],
): Build => {
  const base = emptyBuild(IO, { ...defaultWeapon(IO), series, poolTraits });
  return {
    ...base,
    overMastery: OVER_MASTERY,
    weapon: { ...base.weapon, poolTraits },
    wrightstone: {
      main: { trait: wrightstoneTrait, level: 20 },
      sub1: null,
      sub2: null,
    },
    sigils: [...sigils, ...Array(12 - sigils.length).fill(null)],
  };
};

// Regen is the Terminus slot 2 default and moves no displayed stat.
const terminus = build("terminus", ["regen"], "hp");
// Stun Power pools weapon slot 2 with the wrightstone: 25 + 20 = 45, its cap.
const ascension = build("ascension", ["stun-power", "supernova"], "stun-power");

const withSigil = (trait: string, level: number): Build => ({
  ...ascension,
  sigils: [
    { primaryTrait: trait, secondaryTrait: null, level },
    ...Array(11).fill(null),
  ],
});
const tyranny = withSigil("tyranny", 15);
// 35 on the weapon + 15 + 2 booster = 52 against the ATK trait's max of 50.
const overcapped = withSigil("atk", 15);

describe("deriveStatus", () => {
  it("reproduces the Terminus build", () => {
    expect(deriveStatus(terminus)).toEqual({
      hp: 71055,
      atk: 56467,
      critRate: 83,
      stunPower: 199,
    });
  });

  it("reproduces the Ascension build", () => {
    expect(deriveStatus(ascension)).toEqual({
      hp: 70761,
      atk: 46122,
      critRate: 83,
      stunPower: 299,
    });
  });

  // Totalling 17 with the Ascension's Sigil Booster: ATK +37% compounding on
  // Supernova's +40%, and Max HP -20% on the final figure.
  it("compounds a Tyranny sigil rather than adding it", () => {
    expect(deriveStatus(tyranny)).toEqual({
      hp: 56609,
      atk: 63187,
      critRate: 83,
      stunPower: 299,
    });
  });

  // The weapon's 35 levels plus a 15 sigil overcap at 50, so the sigil is
  // worth 1400 flat rather than 2000.
  it("reads the ladder at the trait's maximum when the pool overcaps", () => {
    // 32944 flat + 1400 = 34344, x1.40 Supernova
    expect(deriveStatus(overcapped).atk).toBe(48082);
  });
});
