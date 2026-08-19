import type { Build, MasterTraitSelections } from "./build";
import type { CharacterId, StyleRank } from "@/catalog/ids";
import { RANKS, STYLES } from "@/catalog/ids";
import { CHARACTER_STATS, POWER, TRAITS, bonusTypeById } from "@/catalog";
import { CHARACTER_LEVEL, WEAPON_LEVEL_MAX } from "./build";
import { SIGIL_BOOSTER, deriveStatus, traitLevelTotals } from "./status";

/** `chara_power_adjust` */
const KEY = {
  base: 0,
  level: 1,
  weaponLevel: 2,
  awakening: 3,
  atk: 4,
  hp: 5,
  traits: 6,
  msp: 7,
  overMastery: 8,
  munitions: 9,
  final: 10,
} as const;

/** Leading theory: rms 2.9 across fourteen of the fifteen reference readings.
    The fifteenth, Io's bare Terminus, misses by 167 and refitting cannot absorb
    it, so this is still wrong somewhere - most likely around ATK%, which is the
    one thing that build does differently.
    See research/pwr-atk-flat-and-cap.md. */
const ATK_KEY = 4;
const ATK_SCALE = 1.5496;

/** DMG Cap scales the ATK going into the attenuation rather than the result
    coming out, so cap is what carries a build across key 4's 60,000 break. */
const DMG_CAP_WEIGHT = 1.06e-3;

const PWR_CAP = 99999;

const AWAKENING_SERIES = new Set(["ascension", "terminus"]);
const AWAKENING_MAX = 10;

const MUNITIONS_MAX = 99;

/** MSP spent, summed off the character's own Masteries trees. Node prices differ
    per character, so this is not one constant. The card assumes every section:
    150% Offense, 150% Defense, and every weapon transcended. */
const mspTotal = (characterId: CharacterId) =>
  Object.values(CHARACTER_STATS[characterId].msp).reduce((a, b) => a + b, 0) +
  MSP_OFFSET;

/** MSP the readings demand beyond anything `ap_tree_*` prices. Structural, not
    per-character: Cagliostro's single-node fit puts it at 2,989 and Ferry's
    ladder at 2,995, derived independently. Its source is unknown.
    See docs/masteries.md. */
const MSP_OFFSET = 2990;

/** Every build is shown fully transcended, so all six stages pay.
    `chara_power_rebuild_adjust`. */
const TRANSCENDENCE = POWER.transcendence.reduce((a, b) => a + b, 0);

/** Over-mastery level 3 rolls only. */
const OVER_MASTERY_MIN_LEVEL = 3;

/** `chara_power_skillboard_rank_adjust`. */
const MASTER_TRAIT_RANK_WEIGHT: Record<StyleRank, number> = {
  r1: 1,
  r2: 2,
  r3: 3,
  ex: 1,
};
const MASTER_TRAIT_PER_CELL = 50;

const TRAIT_MAX_LEVEL = new Map(
  TRAITS.map((trait) => [trait.id, trait.maxLevel]),
);

const adjust = (key: number) => POWER.adjust[key] ?? 0;

export function attenuate(key: number, value: number): number {
  const bands = POWER.attenuate[key] ?? [];
  let total = 0;
  for (let i = 0; i < bands.length; i++) {
    const [from, rate] = bands[i];
    if (value <= from) break;
    const next = bands[i + 1]?.[0] ?? Infinity;
    total += (Math.min(value, next) - from) * rate;
  }
  return total;
}

/** Adjust the input, then run it through that key's attenuation curve. */
const channel = (key: number, value: number) =>
  attenuate(key, value * adjust(key));

/** Levels pool across every source, then clamp to the trait's own maximum.
    The Sigil Booster grants levels but its own do not count. */
export function totalTraitLevels(build: Build): number {
  let total = 0;
  for (const [trait, pooled] of traitLevelTotals(build)) {
    if (trait === SIGIL_BOOSTER) continue;
    total += Math.min(pooled, TRAIT_MAX_LEVEL.get(trait) ?? pooled);
  }
  return total;
}

/** Total DMG Cap percentage: every trait that grants it, at its pooled level,
    plus what the master level board grants outright. Builds are shown at master
    level 51+, so the board's whole 100 is always in. */
export function dmgCapPercent(build: Build): number {
  let total = POWER.masterLevel.dmgCap;
  for (const [trait, pooled] of traitLevelTotals(build)) {
    const ladder = POWER.dmgCap[trait];
    if (!ladder) continue;
    total += ladder[Math.min(pooled, ladder.length) - 1] ?? 0;
  }
  return total;
}

export function overMasteryLevels(build: Build): number {
  let total = 0;
  for (const line of build.overMastery) {
    if (!line) continue;
    const ladder = bonusTypeById.get(line.bonusType)?.overMastery ?? [];
    const index = ladder.indexOf(line.value);
    if (index >= 0) total += index + OVER_MASTERY_MIN_LEVEL;
  }
  return total;
}

/** contribution: 50 x rank weight. */
export function masterTraitPower(selections: MasterTraitSelections): number {
  let weighted = 0;
  for (const style of STYLES)
    for (const rank of RANKS)
      weighted +=
        selections[style][rank].length * MASTER_TRAIT_RANK_WEIGHT[rank];
  return weighted * MASTER_TRAIT_PER_CELL;
}

export function derivePower(build: Build): number {
  const stats = deriveStatus(build);
  const awakening = AWAKENING_SERIES.has(build.weapon.series)
    ? AWAKENING_MAX
    : 0;

  const total =
    adjust(KEY.base) +
    CHARACTER_LEVEL * adjust(KEY.level) +
    WEAPON_LEVEL_MAX * adjust(KEY.weaponLevel) +
    awakening * adjust(KEY.awakening) +
    attenuate(
      ATK_KEY,
      stats.atkBase * ATK_SCALE * (1 + DMG_CAP_WEIGHT * dmgCapPercent(build)),
    ) +
    channel(KEY.hp, stats.hp) +
    totalTraitLevels(build) * adjust(KEY.traits) +
    channel(KEY.msp, mspTotal(build.characterId)) +
    TRANSCENDENCE +
    overMasteryLevels(build) * adjust(KEY.overMastery) +
    MUNITIONS_MAX * adjust(KEY.munitions) +
    masterTraitPower(build.masterTraits);

  return Math.min(Math.round(total * adjust(KEY.final)), PWR_CAP);
}
