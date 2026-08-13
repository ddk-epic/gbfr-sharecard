import type {
  BonusTypeDef,
  Character,
  CharacterCatalog,
  ElementId,
  ResolvedWeapon,
  SummonDef,
  SummonEquipTiers,
  TraitDef,
  WeaponLevels,
  WeaponSeries,
  WeaponSlot,
  WrightstonePrefixMap,
} from "../domain/catalog";
import type {
  BonusTypeId,
  CharacterId,
  StyleRank,
  SummonId,
  TraitId,
  Weapon,
} from "../domain/build";
import charactersJson from "./characters.json";
import traitsJson from "./traits.json";
import bonusTypesJson from "./bonus-types.json";
import summonsJson from "./summons.json";
import summonEquipTiersJson from "./summon-equip-tiers.json";
import weaponSeriesJson from "./weapon-series.json";
import weaponLevelsJson from "./weapon-levels.json";
import wrightstonePrefixesJson from "./wrightstone-prefixes.json";
import iconIndexJson from "./icon-index.json";
import ioJson from "./characters/io.json";
import katalinaJson from "./characters/katalina.json";
import narmayaJson from "./characters/narmaya.json";
import cagliostroJson from "./characters/cagliostro.json";
import rackamJson from "./characters/rackam.json";
import charlottaJson from "./characters/charlotta.json";

/** The maxed transcendence rung, as an index into a slot's level sequence. */
const MAX_RUNG = 7;
const TERMINUS_SERIES = "terminus";

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

/** Display name */
export const traitName = (id: TraitId | null | undefined) => {
  if (!id) return "";
  const trait = traitById.get(id);
  return trait ? (trait.short ?? trait.name) : id;
};

/** Prefix follows the main trait, so the name is derived, never stored. */
export const wrightstoneName = (mainTrait: TraitId | null | undefined) => {
  const prefix = mainTrait ? WRIGHTSTONE_PREFIXES[mainTrait] : undefined;
  return prefix ? `${prefix} Wrightstone` : "Wrightstone";
};

export const bonusValueText = (bonusType: BonusTypeId, value: number) =>
  bonusTypeById.get(bonusType)?.unit === "percent" ? `+${value}%` : `+${value}`;

/** The only way to mint a CharacterId; not-yet-added characters are rejected too. */
export const asCharacterId = (value: unknown): CharacterId | null =>
  typeof value === "string" && characterById.get(value as CharacterId)?.enabled
    ? (value as CharacterId)
    : null;

export const portraitUrl = (characterId: CharacterId) =>
  `${import.meta.env.BASE_URL}${characterById.get(characterId)?.portrait ?? ""}`;

export const thumbUrl = (characterId: CharacterId) =>
  `${import.meta.env.BASE_URL}thumbnails/${characterId}.webp`;

export const parchmentUrl = `${import.meta.env.BASE_URL}card/parchment.webp`;

export const masterlevelArtUrl = (file: string) =>
  `${import.meta.env.BASE_URL}masterlevel/${file}.webp`;

export const pwrArtUrl = (file: string) =>
  `${import.meta.env.BASE_URL}pwr/${file}.webp`;

export const elementIconUrl = (element: ElementId) =>
  `${import.meta.env.BASE_URL}icons/elements/${element}.webp`;

export const skillIconUrl = (characterId: CharacterId, skillId: string) =>
  `${import.meta.env.BASE_URL}icons/skills/${characterId}/${skillId}.webp`;

/** The bonus-type id is the filename; over-mastery and summon equip bonuses share these. */
export const bonusIconUrl = (bonusType: BonusTypeId) =>
  `${import.meta.env.BASE_URL}icons/bonus/${bonusType}.webp`;

/** The summon id is already the name slug, which is the filename. */
export const summonIconUrl = (summonId: SummonId) =>
  `${import.meta.env.BASE_URL}icons/summon/${summonId}.webp`;

/** Weapon art carries no index: the exporter names each file after the weapon's
    display name, so the slugged name is the filename. */
const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const weaponArtUrl = (characterId: CharacterId, name: string) =>
  `${import.meta.env.BASE_URL}weapons/${characterId}/${slug(name)}.webp`;

export type StatIconId = "hp" | "atk" | "crit" | "stun" | "power";
export const statIconUrl = (stat: StatIconId) =>
  `${import.meta.env.BASE_URL}icons/stats/${stat}.webp`;

export const STAT_ICON_ART: Record<StatIconId, { w: number; h: number }> = {
  hp: { w: 67, h: 67 },
  atk: { w: 85, h: 85 },
  crit: { w: 80, h: 84 },
  stun: { w: 79, h: 76 },
  power: { w: 127, h: 128 },
};

/** Master-trait board glyphs: rank badge by Style Rank, plus the level star and its backing. */
export const sboardRankIconUrl = (rank: StyleRank) =>
  `${import.meta.env.BASE_URL}icons/sboard/rank-${rank}.webp`;
export const starIconUrl = `${import.meta.env.BASE_URL}icons/sboard/star.webp`;
export const starBgUrl = `${import.meta.env.BASE_URL}icons/sboard/star-bg.webp`;

const TRAIT_GLYPHS = iconIndexJson.traits as Record<string, string>;
export const traitIconUrl = (trait: TraitId): string | null => {
  const glyph = TRAIT_GLYPHS[trait];
  return glyph
    ? `${import.meta.env.BASE_URL}icons/traits/${glyph}.webp`
    : null;
};

export const WRIGHTSTONE_MAIN_POOL: TraitDef[] = Object.keys(
  WRIGHTSTONE_PREFIXES,
)
  .map((id) => traitById.get(id))
  .filter((trait): trait is TraitDef => trait !== undefined);

/** The archive's one random-trait pool, 72 traits. */
export const ROLL_POOL: TraitDef[] = TRAITS.filter((trait) => trait.roll);

/** A wrightstone rolls its two subs from the one pool. */
export const WRIGHTSTONE_SUB_POOL = ROLL_POOL;
/** A `+` sigil's second trait rolls from the same pool. */
export const SIGIL_SECOND_TRAIT_POOL = ROLL_POOL;

/** Sigil traits that are not locked to a character - the same for every build. */
const SIGIL_OPEN_POOL: TraitDef[] = TRAITS.filter(
  (trait) => trait.sigil && !trait.character,
);

/** The character's pool for a sigil's own trait. Character sigils are gated by
    `gem.PlayerReq`, so another character's are not offerable. */
export function sigilTraitPool(characterId: CharacterId): TraitDef[] {
  const playerId = characterById.get(characterId)?.playerId;
  if (!playerId) return SIGIL_OPEN_POOL;
  return [
    ...SIGIL_OPEN_POOL,
    ...TRAITS.filter((trait) => trait.character === playerId),
  ];
}

/** True when a sigil carrying this trait can take a second one. */
export const takesSecondTrait = (trait: TraitId): boolean =>
  !traitById.get(trait)?.soloSigil;

export const SUMMON_TRAIT_POOL: TraitDef[] = [
  ...new Set(SUMMONS.flatMap((summon) => summon.traits)),
]
  .map((id) => traitById.get(id))
  .filter((trait): trait is TraitDef => trait !== undefined)
  .sort((a, b) => a.name.localeCompare(b.name));

/** Filter by trait for summons. */
const SUMMONS_BY_TRAIT = SUMMONS.reduce((byTrait, summon) => {
  for (const trait of summon.traits)
    byTrait.set(trait, [...(byTrait.get(trait) ?? []), summon]);
  return byTrait;
}, new Map<TraitId, SummonDef[]>());

/** The number of summons with the same trait. */
export const summonsWithTrait = (trait: TraitId | null | undefined) =>
  (trait ? SUMMONS_BY_TRAIT.get(trait) : undefined) ?? [];

/** The traits in catalog order. */
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

/** The weapons a character owns, in canonical series order. */
export function characterWeaponOptions(
  id: CharacterId,
): { series: string; name: string }[] {
  const { weapons } = characterCatalog(id);
  return WEAPON_SERIES.filter((s) => weapons[s.id]).map((s) => {
    const entry = weapons[s.id];
    return { series: s.id, name: entry.awakened ?? entry.name };
  });
}

/** A pool slot's options, with @signature resolved to the character's own. */
const slotPool = (cat: CharacterCatalog, slot: WeaponSlot): TraitId[] =>
  (slot.pool ?? [])
    .map((t) => (t === "@signature" ? cat.weaponSignatureTrait : t))
    .filter((t): t is TraitId => t !== undefined);

/** The trait each pool slot starts on, in pool order - a freshly picked
    weapon's `poolTraits`. */
export function weaponPoolDefaults(
  id: CharacterId,
  series: string,
): TraitId[] {
  const cat = characterCatalog(id);
  const def = weaponSeriesById.get(series);
  if (!def) return [];
  return def.slots
    .filter((slot) => !slot.trait)
    .map((slot) => slotPool(cat, slot)[0])
    .filter((trait): trait is TraitId => trait !== undefined);
}

/** A build's default weapon is the character's Terminus weapon. */
export function defaultWeapon(id: CharacterId): Weapon {
  const owned = characterWeaponOptions(id);
  const series =
    owned.find((o) => o.series === TERMINUS_SERIES)?.series ?? owned[0]?.series;
  if (!series) throw new Error(`no weapons for character: ${id}`);
  return {
    series,
    critRate: 0,
    stun: 0,
    poolTraits: weaponPoolDefaults(id, series),
  };
}

/** HP is series.hp + weaponHpOffset, except Terminus. Throws on a series the
    character does not own - a build always holds one of their own. */
export function resolveWeapon(
  id: CharacterId,
  weapon: Weapon,
): ResolvedWeapon {
  const cat = characterCatalog(id);
  const series = weaponSeriesById.get(weapon.series);
  const entry = cat.weapons[weapon.series];
  if (!series || !entry)
    throw new Error(`no weapon series ${weapon.series} for character: ${id}`);

  // `poolTraits` counts pool slots, not rows, so it advances only on a pool slot.
  let picked = 0;
  const slots = series.slots.map((slot) => {
    const level = WEAPON_LEVELS[slot.levels]?.[MAX_RUNG] ?? 0;
    if (slot.trait) {
      return { kind: "fixed" as const, trait: slot.trait, pool: [], level };
    }
    return {
      kind: "pool" as const,
      trait: weapon.poolTraits[picked++],
      pool: slotPool(cat, slot),
      level,
    };
  });

  return {
    name: entry.awakened ?? entry.name,
    seriesName: series.name,
    atk: series.atk,
    hp:
      weapon.series === TERMINUS_SERIES
        ? series.hp
        : series.hp + cat.weaponHpOffset,
    slots,
  };
}
