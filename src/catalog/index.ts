// The static game data, typed and indexed. This is the leaf layer: it holds
// no rules and imports nothing above it.

import type {
  BonusTypeDef,
  Character,
  CharacterCatalog,
  SummonDef,
  SummonEquipTiers,
  TraitDef,
  WeaponLevels,
  WeaponSeries,
  WrightstonePrefixMap,
} from "./types";
import type { CharacterId } from "./ids";
import charactersJson from "./characters.json";
import traitsJson from "./traits.json";
import bonusTypesJson from "./bonus-types.json";
import summonsJson from "./summons.json";
import summonEquipTiersJson from "./summon-equip-tiers.json";
import weaponSeriesJson from "./weapon-series.json";
import weaponLevelsJson from "./weapon-levels.json";
import wrightstonePrefixesJson from "./wrightstone-prefixes.json";
import ioJson from "./characters/io.json";
import katalinaJson from "./characters/katalina.json";
import narmayaJson from "./characters/narmaya.json";
import cagliostroJson from "./characters/cagliostro.json";
import rackamJson from "./characters/rackam.json";
import charlottaJson from "./characters/charlotta.json";

export const CHARACTERS = charactersJson as Character[];
export const TRAITS = traitsJson as TraitDef[];
export const BONUS_TYPES = bonusTypesJson as BonusTypeDef[];
export const SUMMONS = summonsJson as SummonDef[];
export const WEAPON_SERIES = weaponSeriesJson as WeaponSeries[];
export const WEAPON_LEVELS = weaponLevelsJson as WeaponLevels;
export const WRIGHTSTONE_PREFIXES =
  wrightstonePrefixesJson as WrightstonePrefixMap;
export const SUMMON_EQUIP_TIERS = summonEquipTiersJson as SummonEquipTiers;

export const characterById = new Map(CHARACTERS.map((c) => [c.id, c]));
export const traitById = new Map(TRAITS.map((t) => [t.id, t]));
export const bonusTypeById = new Map(BONUS_TYPES.map((b) => [b.id, b]));
export const summonById = new Map(SUMMONS.map((s) => [s.id, s]));
export const weaponSeriesById = new Map(WEAPON_SERIES.map((s) => [s.id, s]));

/** The only way to mint a CharacterId; rejects characters not yet enabled. */
export const asCharacterId = (value: unknown): CharacterId | null =>
  typeof value === "string" && characterById.get(value as CharacterId)?.enabled
    ? (value as CharacterId)
    : null;

const CATALOGS = {
  io: ioJson,
  katalina: katalinaJson,
  narmaya: narmayaJson,
  cagliostro: cagliostroJson,
  rackam: rackamJson,
  charlotta: charlottaJson,
} as unknown as Record<string, CharacterCatalog>;

export function characterCatalog(id: CharacterId): CharacterCatalog {
  const catalog = CATALOGS[id];
  if (!catalog) throw new Error(`no catalog for character: ${id}`);
  return catalog;
}
