// The Build - what localStorage stores, one per character.

/**
 * Branded, unlike the ids below: the only id that arrives from outside the app,
 * via the URL. Mint with `asCharacterId`.
 */
export type CharacterId = string & { readonly brand: unique symbol };

export type SkillId = string;
export type TraitId = string;
export type SummonId = string;
export type BonusTypeId = string;
export type StyleId = "insight" | "essence" | "crux";
export type StyleRank = "r1" | "r2" | "r3" | "ex";
/** Stable master-trait cell id, e.g. "insight.r2.6" - names the cell, not the trait. */
export type CellId = string;

export const STYLES: StyleId[] = ["insight", "essence", "crux"];
export const RANKS: StyleRank[] = ["r1", "r2", "r3", "ex"];

// Builds are shown at cap: no half-levelled characters or weapons, and
// weapons are assumed fully transcended.
export const CHARACTER_LEVEL = 100;
export const WEAPON_LEVEL = 150;

/** Every weapon rolls this many trait rows, so an empty slot can stand in. */
export const WEAPON_TRAIT_ROWS = 5;

export type Build = {
  schemaVersion: 1;
  characterId: CharacterId; // slug, e.g. "io"
  status: { hp: number; atk: number; critRate: number; stunPower: number }; // player-entered
  skills: (SkillId | null)[]; // exactly 4
  overMastery: (OverMasteryLine | null)[]; // exactly 4; all random lines
  weapon: Weapon | null;
  sigils: (SigilSlot | null)[]; // exactly 12
  wrightstone: Wrightstone | null;
  summons: (SummonSlot | null)[]; // exactly 4
  masterTraits: MasterTraitSelections;
};

export type OverMasteryLine = { bonusType: BonusTypeId; value: number };

/** series is the (character x series) cell id. ATK/HP and slots come from the catalog; crit/stun don't. */
export type Weapon = {
  series: string;
  critRate: number;
  stun: number;
  rotations: (TraitId | null)[]; // one per slot; null = default/fixed
};

/** Trait-based (the sigil item is never named); one level credits both traits. */
export type SigilSlot = {
  primaryTrait: TraitId;
  secondaryTrait: TraitId | null;
  level: number;
};

/** Display name derived: prefix follows the main trait ("Dread…" ⇔ Stun). */
export type Wrightstone = {
  main: { trait: TraitId; level: number }; // cap 20
  sub1: { trait: TraitId; level: number } | null; // cap 15
  sub2: { trait: TraitId; level: number } | null; // cap 10
};

export type SummonSlot = {
  summonId: SummonId;
  trait: TraitId;
  traitLevel: number;
  equipBonus: { bonusType: BonusTypeId; value: number } | null;
};

/** A set; position/order lives in the catalog, never in the Build. */
export type MasterTraitSelections = Record<
  StyleId,
  Record<StyleRank, CellId[]>
>;

export function emptyMasterTraits(): MasterTraitSelections {
  const perStyle = () => ({ r1: [], r2: [], r3: [], ex: [] });
  return { insight: perStyle(), essence: perStyle(), crux: perStyle() };
}

export function emptyBuild(characterId: CharacterId): Build {
  return {
    schemaVersion: 1,
    characterId,
    status: { hp: 0, atk: 0, critRate: 0, stunPower: 0 },
    skills: [null, null, null, null],
    overMastery: [null, null, null, null],
    weapon: null,
    sigils: Array(12).fill(null),
    wrightstone: null,
    summons: [null, null, null, null],
    masterTraits: emptyMasterTraits(),
  };
}
