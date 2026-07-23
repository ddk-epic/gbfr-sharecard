// Catalog types. Catalogs are static JSON shipped with the app; the Build
// references them by id.

import type {
  BonusTypeId,
  CellId,
  SkillId,
  StyleId,
  StyleRank,
  SummonId,
  TraitId,
  WeaponId,
} from "./build";

export type Character = {
  id: string; // slug, e.g. "io"
  name: string;
  artId: string; // cdn.gbf.wiki Cmn_imgchr id
  portrait: string; // path under the Vite base
  portraitY: number; // framing y-offset (%; default 20)
  element: string;
  enabled: boolean; // v1: only Io
};

/**
 * Flat roster. Which pool a trait belongs to (sigil / wrightstone /
 * character) is not modelled - no source classifies them reliably.
 */
export type TraitDef = {
  id: TraitId;
  name: string;
  maxLevel: number;
};

export type ValueRange = { min: number; max: number };

export type BonusTypeDef = {
  id: BonusTypeId;
  name: string;
  unit: "flat" | "percent";
  overMastery: ValueRange | null; // null = not rollable as over mastery
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

/** Fixed rows carry `trait`; player-choice pools carry `options`. */
export type WeaponRow = { level: number; trait?: TraitId; options?: TraitId[] };

export type WeaponDef = {
  id: WeaponId;
  name: string;
  series: string;
  characterId: string;
  defaultAtk: number;
  defaultHp: number;
  rows: WeaponRow[]; // 5 rows, levels fixed by the weapon
};

export type WrightstonePrefixMap = Record<TraitId, string>; // main trait -> display prefix

/** `label` is the short UI string, `description` the full in-game text. */
export type MasterTraitCell = {
  id: CellId;
  label: string;
  description: string;
};

export type MasterTraitSections = Record<
  StyleId,
  Record<StyleRank, MasterTraitCell[]>
>;

export type CharacterCatalog = {
  id: string;
  skills: { id: SkillId; name: string }[];
  styleNames: Record<StyleId, string>; // display names, e.g. "Insight"
  perkThresholds: number[]; // per-style selection counts activating perks 1..3
  masterTraits: MasterTraitSections;
};
