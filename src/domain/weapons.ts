import type { CharacterId, TraitId } from "@/catalog/ids";
import type {
  CharacterCatalog,
  ResolvedWeapon,
  WeaponSlot,
} from "@/catalog/types";
import type { Weapon } from "./build";
import { MASTER_LEVEL_DEFAULT } from "./build";
import {
  WEAPON_LEVELS,
  WEAPON_SERIES,
  characterCatalog,
  weaponSeriesById,
} from "@/catalog";

/** The maxed transcendence rung, as an index into a slot's level sequence. */
const MAX_RUNG = 7;
const TERMINUS_SERIES = "terminus";
const UNBOUND_MASTER = "unbound-master";

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

/** The trait each pool slot starts on, in pool order. */
export function defaultPoolTraits(id: CharacterId, series: string): TraitId[] {
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
  return { series, poolTraits: defaultPoolTraits(id, series) };
}

/** HP is series.hp + weaponHpOffset, except Terminus.
    `masterLevel` sets Unbound Master's level. */
export function resolveWeapon(
  id: CharacterId,
  weapon: Weapon,
  masterLevel: number = MASTER_LEVEL_DEFAULT,
): ResolvedWeapon {
  const cat = characterCatalog(id);
  const series = weaponSeriesById.get(weapon.series);
  const entry = cat.weapons[weapon.series];
  if (!series || !entry)
    throw new Error(`no weapon series ${weapon.series} for character: ${id}`);

  // `poolTraits` counts pool slots, not rows, so it advances only on a pool slot.
  let picked = 0;
  const slots = series.slots.map((slot) => {
    const rung = WEAPON_LEVELS[slot.levels]?.[MAX_RUNG] ?? 0;
    const level =
      slot.trait === UNBOUND_MASTER && rung > 0 ? masterLevel : rung;
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
