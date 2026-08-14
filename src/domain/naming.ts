// Display names derived from catalog definitions.

import type { BonusTypeId, TraitId } from "@/catalog/ids";
import { bonusTypeById, traitById } from "@/catalog";

export const traitName = (id: TraitId | null | undefined) => {
  if (!id) return "";
  const trait = traitById.get(id);
  return trait ? (trait.short ?? trait.name) : id;
};

export const bonusValueText = (bonusType: BonusTypeId, value: number) =>
  bonusTypeById.get(bonusType)?.unit === "percent" ? `+${value}%` : `+${value}`;
