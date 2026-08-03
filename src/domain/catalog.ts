// Catalog types. Catalogs are static JSON shipped with the app; the Build
// references them by id.

import type {
  BonusTypeId,
  CellId,
  CharacterId,
  SkillId,
  StyleId,
  StyleRank,
  SummonId,
  TraitId,
} from "./build";

export type ElementId =
  "fire" | "water" | "earth" | "wind" | "light" | "dark" | "plain";

export type Character = {
  id: CharacterId; // slug, e.g. "io"
  name: string;
  artId: string;
  portrait: string; // path
  portraitX: number; // framing x-offset (px off centre)
  portraitY: number; // framing y-offset (px off centre)
  element: string;
  enabled: boolean;
};

export type TraitDef = {
  id: TraitId;
  name: string;
  /** Abbreviated display name override. */
  short?: string;
  maxLevel: number;
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

/** Fixed carries `trait`; `pool` lets the player pick, `pool[0]` default. `levels` keys a sequence in weapon-levels.json; card renders its T7 rung. `@signature` marks the per-character trait. */
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

export type WeaponEntry = { name: string; awakened?: string }; // awakened: name once awakened

export type ResolvedWeaponSlot = {
  kind: "fixed" | "pool";
  trait: TraitId | null;
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

export type WrightstonePrefixMap = Record<TraitId, string>; // main trait -> display prefix

/** `label` is the short UI string, `description` the full in-game text. */
export type MasterTraitCell = {
  id: CellId;
  label: string;
  description: string;
};

/** `title` is the character-specific half of the style's in-game heading
 *  ("Insight: Pure Concentration"). */
export type MasterTraitSections = Record<
  StyleId,
  { title: string } & Record<StyleRank, MasterTraitCell[]>
>;

/** Selection counts activating style perks 1..3 */
export const PERK_THRESHOLDS: number[] = [3, 6, 6];

export type CharacterCatalog = {
  id: string;
  skills: { id: SkillId; name: string; element: ElementId }[];
  masterTraits: MasterTraitSections;
  weapons: Record<string, WeaponEntry>; // keyed by series-row id, the character's owned series
  weaponHpOffset: number; // added to series.hp; one integer per character (Terminus exempt)
  weaponSignatureTrait?: TraitId; // the per-character Ascension/Terminus slot-2 trait
};
