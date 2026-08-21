import type { BonusTypeId, TraitId } from "@/catalog/ids";
import type { TraitDef } from "@/catalog/types";
import { bonusTypeById, traitById } from "@/catalog";

export const TRAIT_CATEGORIES = [
  "basic",
  "attack",
  "defense",
  "support",
  "special",
  "character",
] as const;

export type TraitCategory = (typeof TRAIT_CATEGORIES)[number];

export const traitCategoryLabel: Record<TraitCategory, string> = {
  basic: "Basic",
  attack: "Attack",
  defense: "Defense",
  support: "Support",
  special: "Special",
  character: "Character",
};

export const traitCategoryOf = (trait: TraitDef): TraitCategory =>
  trait.category ?? "character";

export const traitName = (id: TraitId | null | undefined) => {
  if (!id) return "";
  const trait = traitById.get(id);
  return trait ? (trait.short ?? trait.name) : id;
};

export const bonusValueText = (bonusType: BonusTypeId, value: number) =>
  bonusTypeById.get(bonusType)?.unit === "percent" ? `+${value}%` : `+${value}`;
