import type {
  BonusTypeDef,
  Character,
  CharacterCatalog,
  CharacterCatalogFile,
  CharacterStats,
  MasterTraitSections,
  SharedMasterTraitCells,
  SigilLots,
  PowerTables,
  SummonDef,
  SummonEquipTiers,
  TraitDef,
  TraitStats,
  WeaponLevels,
  WeaponSeries,
  WrightstonePrefixMap,
} from "./types";
import { RANKS, STYLES, rankCellIds } from "./ids";
import type { CharacterId } from "./ids";
import masterTraitSharedJson from "./master-trait-shared.json";
import charactersJson from "./characters.json";
import traitsJson from "./traits.json";
import sigilLotsJson from "./sigil-lots.json";
import bonusTypesJson from "./bonus-types.json";
import summonsJson from "./summons.json";
import summonEquipTiersJson from "./summon-equip-tiers.json";
import powerJson from "./power.json";
import traitStatsJson from "./trait-stats.json";
import characterStatsJson from "./character-stats.json";
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
// `pairs` widens to string[][] on import; the tuple is the shape it is written in.
export const SIGIL_LOTS = sigilLotsJson as unknown as SigilLots;
export const BONUS_TYPES = bonusTypesJson as BonusTypeDef[];
// `unit` and `stat` widen to string on import; the JSON is generated to shape.
export const TRAIT_STATS = traitStatsJson as unknown as TraitStats;
export const CHARACTER_STATS = characterStatsJson as Record<
  string,
  CharacterStats
>;
export const SUMMONS = summonsJson as SummonDef[];
export const WEAPON_SERIES = weaponSeriesJson as WeaponSeries[];
export const WEAPON_LEVELS = weaponLevelsJson as WeaponLevels;
export const WRIGHTSTONE_PREFIXES =
  wrightstonePrefixesJson as WrightstonePrefixMap;
export const SUMMON_EQUIP_TIERS = summonEquipTiersJson as SummonEquipTiers;
// Bands widen to number[][] on import.
export const POWER = powerJson as unknown as PowerTables;

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

export const MASTER_TRAIT_SHARED =
  masterTraitSharedJson as SharedMasterTraitCells;

function resolveMasterTraits(file: CharacterCatalogFile): MasterTraitSections {
  const { titles, cells } = file.masterTraits;
  return Object.fromEntries(
    STYLES.map((style) => [
      style,
      {
        title: titles[style],
        ...Object.fromEntries(
          RANKS.map((rank) => [
            rank,
            rankCellIds(style, rank).map((id) => {
              const body = cells[id] ?? MASTER_TRAIT_SHARED[id];
              if (!body)
                throw new Error(`${file.id}: no master-trait cell for ${id}`);
              return { id, ...body };
            }),
          ]),
        ),
      },
    ]),
  ) as MasterTraitSections;
}

export const CATALOG_FILES = {
  io: ioJson,
  katalina: katalinaJson,
  narmaya: narmayaJson,
  cagliostro: cagliostroJson,
  rackam: rackamJson,
  charlotta: charlottaJson,
} as unknown as Record<string, CharacterCatalogFile>;

const CATALOGS = new Map<string, CharacterCatalog>();

export function characterCatalog(id: CharacterId): CharacterCatalog {
  const cached = CATALOGS.get(id);
  if (cached) return cached;
  const file = CATALOG_FILES[id];
  if (!file) throw new Error(`no catalog for character: ${id}`);
  const catalog = { ...file, masterTraits: resolveMasterTraits(file) };
  CATALOGS.set(id, catalog);
  return catalog;
}
