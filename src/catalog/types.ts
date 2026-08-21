import type {
  BonusTypeId,
  CellId,
  CharacterId,
  PerkRank,
  SkillId,
  StyleId,
  StyleRank,
  SummonId,
  TraitId,
} from "@/catalog/ids";

export type ElementId =
  "fire" | "water" | "earth" | "wind" | "light" | "dark" | "plain";

export type Character = {
  id: CharacterId; // slug, e.g. "io"
  name: string;
  artId: string;
  /** `gem.PlayerReq`, gating the character's own sigils. Gran and Djeeta share
      The Captain's `PL0000`; Id's differs from its artId. */
  playerId: string;
  element: string;
  enabled: boolean;
};

export type TraitCategory =
  "basic" | "attack" | "defense" | "special" | "support";

/** Display data only - what a trait may do is its lot's, in sigil-lots.json. */
export type TraitDef = {
  id: TraitId;
  name: string;
  /** Abbreviated display name override. */
  short?: string;
  maxLevel: number;
  category?: TraitCategory;
};

export type SigilLotId =
  | "standard"
  | "synthesisOnly"
  | "firstTraitOnly"
  | "singleTraitOnly"
  | "lucilius"
  | "boundary"
  | "weaponOnly";

/** One lot's whole rule. `eligibleSecondTraits` names the lots its sigil's
    second slot accepts, or the one trait that slot is pinned to; absent means
    the sigil has no second slot. */
export type SigilLot = {
  firstSlot?: true;
  eligibleSecondTraits?: (SigilLotId | TraitId)[];
  wrightstoneSub?: true;
  traits: TraitId[];
};

/** `pairs` are the two traits of a character that may follow each other, one
    tuple per character. `characters` keys a character's own traits by
    `Character.playerId`. */
export type SigilLots = {
  lots: Record<SigilLotId, SigilLot>;
  pairs: [TraitId, TraitId][];
  characters: Record<string, TraitId[]>;
};

export type BonusTypeDef = {
  id: BonusTypeId;
  name: string;
  unit: "flat" | "percent";
  overMastery: number[];
};

/** Summons roll equip bonuses from one of three value tables. */
export type EquipTierGroup = "legendary" | "mid" | "low";

export type SummonEquipTiers = Record<
  EquipTierGroup,
  Record<BonusTypeId, number[]>
>;

export type SummonDef = {
  id: SummonId;
  name: string;
  traits: TraitId[]; // the main traits this summon can roll
  equipTier: EquipTierGroup;
};

/** Fixed carries `trait`; `pool` lets the player pick, `pool[0]` default, with
 *  `@signature` standing for the per-character trait. `levels` keys a sequence
 *  in weapon-levels.json. */
export type WeaponSlot = { levels: string; trait?: TraitId; pool?: TraitId[] };

/** `atk` is the maxed series constant; `hp` is the maxed value at zero hp-offset. */
export type WeaponSeries = {
  id: string;
  name: string;
  atk: number;
  hp: number;
  slots: WeaponSlot[];
};

/** Named T0-T7 level sequences shared by the series' slots. */
export type WeaponLevels = Record<string, number[]>;

export type WeaponEntry = { name: string; awakened?: string };

/** A pool slot always carries its picked trait, so no resolved row is empty. */
export type ResolvedWeaponSlot = {
  kind: "fixed" | "pool";
  trait: TraitId;
  pool: TraitId[]; // pool: options with @signature resolved; fixed: []
  level: number;
};

export type ResolvedWeapon = {
  name: string;
  seriesName: string;
  atk: number;
  hp: number;
  slots: ResolvedWeaponSlot[];
};

export type StatKey = "hp" | "atk" | "crit" | "stun";

/** One trait's contribution to one stat, indexed by trait level. A percentage
 *  entry compounds instead of adding. */
export type TraitStat = {
  stat: StatKey;
  unit: "flat" | "percent";
  values: number[];
};

export type TraitStats = Record<TraitId, TraitStat[]>;

/** `masteries` is every Masteries node taken - Offense, Defense and
 * every weapon's Collection section. `msp` is what those nodes cost, per
 * section, which is what the PWR formula reads rather than the stats. */
export type CharacterStats = {
  base: { hp: number; atk: number };
  masteries: Record<StatKey, number>;
  msp: {
    offense: number; // 0-100%
    defense: number; // 0-100%
    extension: number; // 100-150%, always 919,000
    collection: number;
    transcendence: number;
  };
};

/** The PWR coefficient tables, keyed by the engine's input-type enum, plus the
 *  two ladders only the PWR formula reads: `dmgCap` is every trait that grants
 *  general DMG Cap, percentage by level, and `masterLevel` the board's own
 *  totals at level 50. */
export type PowerTables = {
  adjust: Record<string, number>;
  attenuate: Record<string, [number, number][]>;
  dmgCap: Record<TraitId, number[]>;
  masterLevel: { hp: number; atk: number; dmgCap: number };
  /** PWR per weapon transcendence stage, six of them. */
  transcendence: number[];
};

export type WrightstonePrefixMap = Record<TraitId, string>; // main trait -> display prefix

/** `label` is the short UI string, `description` the full in-game text.
 *  `perkRank` is the perk tier (I-III) the cell is gated behind, read off the
 *  description's "<Style> Rank I/II/III:" prefix; absent when ungated. */
export type MasterTraitCell = {
  id: CellId;
  label: string;
  description: string;
  perkRank?: 1 | 2 | 3;
};

/** `title` is the character-specific half of the style's in-game heading
 *  ("Insight: Pure Concentration"). */
export type MasterTraitSections = Record<
  StyleId,
  { title: string } & Record<StyleRank, MasterTraitCell[]>
>;

/** Selections needed in a style's rank section to activate that rank's perk.
 *  Universal, not per-character. */
export const PERK_THRESHOLDS: Record<PerkRank, number> = {
  r1: 3,
  r2: 6,
  r3: 6,
};

export type CharacterCatalog = {
  id: string;
  skills: { id: SkillId; name: string; element: ElementId }[];
  masterTraits: MasterTraitSections;
  weapons: Record<string, WeaponEntry>; // keyed by series-row id, the character's owned series
  weaponHpOffset: number; // added to series.hp; one integer per character (Terminus exempt)
  weaponSignatureTrait?: TraitId; // the per-character Ascension/Terminus slot-2 trait
};
