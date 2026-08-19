import type { Build } from "./build";
import type { BonusTypeId, TraitId } from "@/catalog/ids";
import type { StatKey } from "@/catalog/types";
import { CHARACTER_STATS, POWER, TRAIT_STATS } from "@/catalog";
import { resolveWeapon } from "./weapons";

export type Status = {
  hp: number;
  atk: number;
  /** ATK before the multiplicative traits; the ATK the PWR formula reads. */
  atkBase: number;
  critRate: number;
  stunPower: number;
};

/** All nine fate episodes; the same nine for every character. */
const FATE = { hp: 640, atk: 165 };

/** `skillboard_unlock` at master level 50; levels 51-55 award no stats. */
const MASTER_LEVELS = POWER.masterLevel;

/** Base crit and stun, equal at level 1 and level 100 on every character. */
const BASE_CRIT = 5;
const BASE_STUN = 8;

/** The archive stores every stun figure at a tenth of what the game prints. */
const STUN_SCALE = 10;

const CRIT_CAP = 100;

/** Weapon slot 4 on Ascension and Terminus. */
export const SIGIL_BOOSTER = "sigil-booster";

const OVER_MASTERY_STAT: Record<BonusTypeId, StatKey> = {
  "attack-power-up": "atk",
  "health-up": "hp",
  "critical-hit-rate-up": "crit",
  "stun-power-up": "stun",
};

/** A trait's level summed over every source; allowed to overcap. */
export function traitLevelTotals(build: Build): Map<TraitId, number> {
  const levels = new Map<TraitId, number>();
  const add = (trait: TraitId | null | undefined, level: number) => {
    if (trait) levels.set(trait, (levels.get(trait) ?? 0) + level);
  };

  const weapon = resolveWeapon(
    build.characterId,
    build.weapon,
    build.masterLevel,
  );
  for (const slot of weapon.slots) add(slot.trait, slot.level);

  // The booster credits each sigil slot, so a two-trait sigil takes it twice.
  const booster =
    weapon.slots.find((slot) => slot.trait === SIGIL_BOOSTER)?.level ?? 0;
  for (const sigil of build.sigils) {
    if (!sigil) continue;
    add(sigil.primaryTrait, sigil.level + booster);
    add(sigil.secondaryTrait, sigil.level + booster);
  }

  const wrightstone = build.wrightstone;
  if (wrightstone) {
    add(wrightstone.main.trait, wrightstone.main.level);
    add(wrightstone.sub1?.trait, wrightstone.sub1?.level ?? 0);
    add(wrightstone.sub2?.trait, wrightstone.sub2?.level ?? 0);
  }

  for (const summon of build.summons)
    if (summon) add(summon.trait, summon.traitLevel);

  return levels;
}

/** The four displayed stats: a flat sum; compounded rather than added. Assumes 
    the Build is at cap - character 100, weapons maxed and transcended, Masteries 
    and fate complete. */
export function deriveStatus(build: Build): Status {
  const character = CHARACTER_STATS[build.characterId];
  const weapon = resolveWeapon(
    build.characterId,
    build.weapon,
    build.masterLevel,
  );

  const flat: Record<StatKey, number> = {
    hp: character.base.hp + FATE.hp + MASTER_LEVELS.hp + weapon.hp,
    atk: character.base.atk + FATE.atk + MASTER_LEVELS.atk + weapon.atk,
    crit: BASE_CRIT,
    stun: BASE_STUN,
  };
  for (const stat of Object.keys(flat) as StatKey[])
    flat[stat] += character.masteries[stat];

  const factor: Record<StatKey, number> = { hp: 1, atk: 1, crit: 1, stun: 1 };
  for (const [trait, total] of traitLevelTotals(build)) {
    for (const entry of TRAIT_STATS[trait] ?? []) {
      // One row per level, so the ladder's length is the trait's max level.
      const value = entry.values[Math.min(total, entry.values.length) - 1] ?? 0;
      if (entry.unit === "flat") flat[entry.stat] += value;
      else factor[entry.stat] *= 1 + value / 100;
    }
  }

  // Over-mastery lines and summon equip bonuses share the eleven bonus types,
  // both in printed units, so stun alone converts back into the archive's tenths.
  const lines = [
    ...build.overMastery,
    ...build.summons.map((summon) => summon?.equipBonus ?? null),
  ];
  for (const line of lines) {
    const stat = line && OVER_MASTERY_STAT[line.bonusType];
    if (!stat) continue;
    flat[stat] += stat === "stun" ? line.value / STUN_SCALE : line.value;
  }

  return {
    hp: Math.round(flat.hp * factor.hp),
    atk: Math.round(flat.atk * factor.atk),
    atkBase: Math.round(flat.atk),
    critRate: Math.min(Math.round(flat.crit * factor.crit), CRIT_CAP),
    stunPower: Math.round(flat.stun * factor.stun * STUN_SCALE),
  };
}
