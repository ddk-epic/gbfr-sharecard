// Summon trait pools and the equip-bonus ladders.

import type { BonusTypeId, SummonId, TraitId } from "@/catalog/ids";
import type { SummonDef, TraitDef } from "@/catalog/types";
import { SUMMONS, SUMMON_EQUIP_TIERS, summonById, traitById } from "@/catalog";

export const SUMMON_TRAIT_POOL: TraitDef[] = [
  ...new Set(SUMMONS.flatMap((summon) => summon.traits)),
]
  .map((id) => traitById.get(id))
  .filter((trait): trait is TraitDef => trait !== undefined)
  .sort((a, b) => a.name.localeCompare(b.name));

const SUMMONS_BY_TRAIT = SUMMONS.reduce((byTrait, summon) => {
  for (const trait of summon.traits)
    byTrait.set(trait, [...(byTrait.get(trait) ?? []), summon]);
  return byTrait;
}, new Map<TraitId, SummonDef[]>());

export const summonsWithTrait = (trait: TraitId | null | undefined) =>
  (trait ? SUMMONS_BY_TRAIT.get(trait) : undefined) ?? [];

/** The summon's main traits, in catalog order. */
export const summonTraits = (summonId: SummonId | null | undefined) =>
  (summonId ? (summonById.get(summonId)?.traits ?? []) : [])
    .map((id) => traitById.get(id))
    .filter((trait): trait is TraitDef => trait !== undefined);

export const summonEquipTiers = (
  summonId: SummonId | null | undefined,
  bonusType: BonusTypeId | null | undefined,
): number[] => {
  const summon = summonId ? summonById.get(summonId) : undefined;
  if (!summon || !bonusType) return [];
  return SUMMON_EQUIP_TIERS[summon.equipTier][bonusType] ?? [];
};
