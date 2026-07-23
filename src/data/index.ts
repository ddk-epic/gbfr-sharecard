// Typed access to the committed catalog JSON.

import type {
  BonusTypeDef,
  Character,
  CharacterCatalog,
  SummonDef,
  SummonEquipTiers,
  TraitDef,
  WeaponDef,
  WrightstonePrefixMap,
} from "../domain/catalog";
import type { BonusTypeId, SummonId, TraitId } from "../domain/build";
import charactersJson from "./characters.json";
import traitsJson from "./traits.json";
import bonusTypesJson from "./bonus-types.json";
import summonsJson from "./summons.json";
import summonEquipTiersJson from "./summon-equip-tiers.json";
import weaponsJson from "./weapons.json";
import wrightstonePrefixesJson from "./wrightstone-prefixes.json";
import ioJson from "./characters/io.json";

export const CHARACTERS = charactersJson as Character[];
export const TRAITS = traitsJson as TraitDef[];
export const BONUS_TYPES = bonusTypesJson as BonusTypeDef[];
export const SUMMONS = summonsJson as SummonDef[];
export const WEAPONS = weaponsJson as WeaponDef[];
export const WRIGHTSTONE_PREFIXES =
  wrightstonePrefixesJson as WrightstonePrefixMap;
export const SUMMON_EQUIP_TIERS = summonEquipTiersJson as SummonEquipTiers;

export const characterById = new Map(CHARACTERS.map((c) => [c.id, c]));
export const traitById = new Map(TRAITS.map((t) => [t.id, t]));
export const bonusTypeById = new Map(BONUS_TYPES.map((b) => [b.id, b]));
export const summonById = new Map(SUMMONS.map((s) => [s.id, s]));
export const weaponById = new Map(WEAPONS.map((w) => [w.id, w]));

export const traitName = (id: TraitId | null | undefined) =>
  id ? (traitById.get(id)?.name ?? id) : "";

/** Prefix follows the main trait, so the name is derived, never stored. */
export const wrightstoneName = (mainTrait: TraitId | null | undefined) => {
  const prefix = mainTrait ? WRIGHTSTONE_PREFIXES[mainTrait] : undefined;
  return prefix ? `${prefix} Wrightstone` : "Wrightstone";
};

export const portraitUrl = (characterId: string) =>
  `${import.meta.env.BASE_URL}${characterById.get(characterId)?.portrait ?? ""}`;

/** The traits a summon can roll, in catalog order. */
export const summonTraits = (summonId: SummonId | null | undefined) =>
  (summonId ? (summonById.get(summonId)?.traits ?? []) : [])
    .map((id) => traitById.get(id))
    .filter((trait): trait is TraitDef => trait !== undefined);

/** The equip bonus values this summon's tier table allows, ascending. */
export const summonEquipTiers = (
  summonId: SummonId | null | undefined,
  bonusType: BonusTypeId | null | undefined,
): number[] => {
  const summon = summonId ? summonById.get(summonId) : undefined;
  if (!summon || !bonusType) return [];
  return SUMMON_EQUIP_TIERS[summon.equipTier][bonusType] ?? [];
};

const io = ioJson as CharacterCatalog;

/** v1 ships Io only - the lookup shape is ready for the v2 roster. */
export function characterCatalog(id: string): CharacterCatalog {
  if (id !== "io") throw new Error(`no catalog for character: ${id}`);
  return io;
}
