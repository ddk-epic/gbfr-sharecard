// Identifiers for catalog entities. The catalog is the leaf layer, so these
// live here rather than in the domain: a TraitId names a TraitDef, a
// CharacterId names a Character. Both layers above speak in them.

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
