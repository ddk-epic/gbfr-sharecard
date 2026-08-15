// Which traits a sigil may carry, and which may sit behind which. Every rule is
// a lot's; only a partner and a style's ownership vary per trait.

import type { CharacterId, TraitId } from "@/catalog/ids";
import type { SigilLot, SigilLotId, TraitDef } from "@/catalog/types";
import { SIGIL_LOTS, TRAITS, characterById } from "@/catalog";

const LOTS = SIGIL_LOTS.lots;

/** Pools keep catalog order, so the editor lists them the way it always has. */
const poolOf = (ids: Iterable<TraitId>): TraitDef[] => {
  const wanted = new Set(ids);
  return TRAITS.filter((trait) => wanted.has(trait.id));
};

const lotByTrait = new Map<TraitId, SigilLot>();
for (const lot of Object.values(LOTS))
  for (const id of lot.traits) lotByTrait.set(id, lot);

/** A reference names a lot when one answers to it, and a trait otherwise. */
const expand = (refs: (SigilLotId | TraitId)[]): TraitId[] =>
  refs.flatMap((ref) =>
    Object.hasOwn(LOTS, ref) ? LOTS[ref as SigilLotId].traits : [ref],
  );

/** A lot pins its second slot when it names a trait there rather than a lot. */
const pinnedOf = (lot: SigilLot): TraitId | null => {
  const refs = lot.eligibleSecondTraits ?? [];
  return refs.length === 1 && !Object.hasOwn(LOTS, refs[0]) ? refs[0] : null;
};

const partnerOf = new Map<TraitId, TraitId>();
for (const [one, other] of SIGIL_LOTS.pairs) {
  partnerOf.set(one, other);
  partnerOf.set(other, one);
}

const STYLE_LOCKED = new Set(Object.values(SIGIL_LOTS.styles).flat());

/** Open traits are the same for every build, so each slot's share is built once. */
const FIRST_OPEN_POOL: TraitDef[] = poolOf(
  Object.values(LOTS)
    .filter((lot) => lot.firstSlot)
    .flatMap((lot) => lot.traits)
    .filter((id) => !STYLE_LOCKED.has(id)),
);

/** A lot's second pool never varies, so it is resolved once per lot. */
const secondPoolByLot = new Map<SigilLot, TraitDef[]>(
  Object.values(LOTS).map((lot) => [
    lot,
    poolOf(expand(lot.eligibleSecondTraits ?? [])),
  ]),
);

/** The character's pool for a sigil's own trait: the open traits plus their
    own. `gem.PlayerReq` keeps one style's out of another's pool. */
export function sigilTraitPool(characterId: CharacterId): TraitDef[] {
  const playerId = characterById.get(characterId)?.playerId;
  const own = playerId ? SIGIL_LOTS.styles[playerId] : undefined;
  return own ? [...FIRST_OPEN_POOL, ...poolOf(own)] : FIRST_OPEN_POOL;
}

/** The trait this one's sigil always carries second, if the slot is pinned. */
export function fixedSecondTrait(
  firstTrait: TraitId | null | undefined,
): TraitId | null {
  const lot = firstTrait ? lotByTrait.get(firstTrait) : undefined;
  return lot ? pinnedOf(lot) : null;
}

/** The pool for a sigil's second trait (depends on its first). */
export function sigilSecondTraitPool(
  firstTrait: TraitId | null | undefined,
): TraitDef[] {
  const lot = firstTrait ? lotByTrait.get(firstTrait) : undefined;
  const pool = (lot && secondPoolByLot.get(lot)) ?? [];
  const partnerId = firstTrait ? partnerOf.get(firstTrait) : undefined;
  const partner = partnerId ? poolOf([partnerId]) : [];
  return [...partner, ...pool];
}

/** Whether `second` may sit behind `first` on one sigil. Duplicates are legal. */
export const canFollow = (first: TraitId, second: TraitId): boolean =>
  sigilSecondTraitPool(first).some((trait) => trait.id === second);

/** Whether a sigil built on this trait has a second slot. */
export const takesSecondTrait = (trait: TraitId): boolean =>
  (lotByTrait.get(trait)?.eligibleSecondTraits?.length ?? 0) > 0;
