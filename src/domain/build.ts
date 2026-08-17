import type {
  BonusTypeId,
  CellId,
  CharacterId,
  SkillId,
  StyleId,
  StyleRank,
  SummonId,
  TraitId,
} from "@/catalog/ids";

// Builds are shown at cap; weapons are assumed fully transcended.
export const CHARACTER_LEVEL = 100;
export const WEAPON_LEVEL_MAX = 150;

/** Only levels 51-55 are modelled. */
export const MASTER_LEVEL_MIN = 51;
export const MASTER_LEVEL_MAX = 55;
export const MASTER_LEVEL_DEFAULT = MASTER_LEVEL_MAX;

/** A sigil's own level ladder; rarity V only. */
export const SIGIL_LEVELS = [11, 12, 13, 14, 15];
export const SIGIL_DEFAULT_LEVEL = 15;

/** Only the top wrightstone is modelled, so the levels follow the slot. */
export const WRIGHTSTONE_LEVELS = [20, 15, 10];

export type Build = {
  schemaVersion: 5;
  characterId: CharacterId; // slug, e.g. "io"
  masterLevel: number; // Levels 51-55
  skills: (SkillId | null)[]; // exactly 4
  overMastery: (OverMasteryLine | null)[]; // exactly 4; all random lines
  weapon: Weapon; // always equipped; the character's Terminus by default
  sigils: (SigilSlot | null)[]; // exactly 12
  wrightstone: Wrightstone | null;
  summons: (SummonSlot | null)[]; // exactly 4
  masterTraits: MasterTraitSelections;
};

/** A slot array with one index replaced. */
export const setAt = <T>(slots: T[], index: number, value: T) =>
  slots.map((slot, i) => (i === index ? value : slot));

export type OverMasteryLine = { bonusType: BonusTypeId; value: number };

/** series is the (character x series) cell id; ATK/HP and slots come from the
    catalog. */
export type Weapon = {
  series: string;
  /** One per `kind: "pool"` slot, in slot order. */
  poolTraits: TraitId[];
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

/** The weapon comes from the caller: it is catalog data, which the domain
    does not read. */
export function emptyBuild(characterId: CharacterId, weapon: Weapon): Build {
  return {
    schemaVersion: 5,
    characterId,
    masterLevel: MASTER_LEVEL_DEFAULT,
    skills: [null, null, null, null],
    overMastery: [null, null, null, null],
    weapon,
    sigils: Array(12).fill(null),
    wrightstone: null,
    summons: [null, null, null, null],
    masterTraits: emptyMasterTraits(),
  };
}
