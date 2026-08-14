// Which traits a sigil may carry, and which may sit behind which.

import type { CharacterId, TraitId } from "@/catalog/ids";
import type { TraitDef } from "@/catalog/types";
import { TRAITS, characterById, traitById } from "@/catalog";

/** Open traits are the same for every build, so each slot's share is built once. */
const FIRST_OPEN_POOL: TraitDef[] = TRAITS.filter(
  (trait) => trait.firstTrait && !trait.character,
);
/** Every `secondTrait` is open already - character traits pair instead. */
const SECOND_OPEN_POOL: TraitDef[] = TRAITS.filter(
  (trait) => trait.secondTrait,
);

/** The character's pool for a sigil's own trait: the open traits plus their
    own. `gem.PlayerReq` keeps one character's out of another's pool. */
export function sigilTraitPool(characterId: CharacterId): TraitDef[] {
  const playerId = characterById.get(characterId)?.playerId;
  if (!playerId) return FIRST_OPEN_POOL;
  return [
    ...FIRST_OPEN_POOL,
    ...TRAITS.filter((trait) => trait.character === playerId),
  ];
}

/** The pool for a sigil's second trait (depends on its first). */
export function sigilSecondTraitPool(
  firstTrait: TraitId | null | undefined,
): TraitDef[] {
  const partnerId = firstTrait ? traitById.get(firstTrait)?.pairsWith : null;
  const partner = partnerId ? traitById.get(partnerId) : undefined;
  return partner ? [partner, ...SECOND_OPEN_POOL] : SECOND_OPEN_POOL;
}

/** Whether `second` may sit behind `first` on one sigil. Duplicates are legal. */
export const canFollow = (first: TraitId, second: TraitId): boolean =>
  !!traitById.get(second)?.secondTrait ||
  traitById.get(first)?.pairsWith === second;

/** Whether a sigil built on this trait has a second slot. */
export const takesSecondTrait = (trait: TraitId): boolean =>
  !traitById.get(trait)?.noSecondSlot;
