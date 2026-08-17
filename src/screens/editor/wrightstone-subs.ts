import type { Wrightstone } from "@/domain/build";
import type { TraitId } from "@/catalog/ids";
import { WRIGHTSTONE_LEVELS } from "@/domain/build";

export type SubSlot = 1 | 2;

const SUB_SLOTS: SubSlot[] = [1, 2];

export const subAt = (stone: Wrightstone | null, slot: SubSlot) =>
  (slot === 1 ? stone?.sub1 : stone?.sub2)?.trait ?? null;

/** Each slot has a fixed level and nothing is promoted when a slot empties, so
    sub 2 only exists under a filled sub 1. */
export const canFillSub = (stone: Wrightstone | null, slot: SubSlot) =>
  slot === 1 ? !!stone : !!stone?.sub1;

/** Sub 1 can only be cleared once sub 2 is empty. */
export const canClearSub = (stone: Wrightstone | null, slot: SubSlot) =>
  !!subAt(stone, slot) && (slot === 2 || !stone?.sub2);

export function setSub(
  stone: Wrightstone,
  slot: SubSlot,
  trait: TraitId | null,
): Wrightstone {
  const row = trait ? { trait, level: WRIGHTSTONE_LEVELS[slot] } : null;
  return slot === 1 ? { ...stone, sub1: row } : { ...stone, sub2: row };
}

export const nextEmptySub = (stone: Wrightstone | null): SubSlot | null =>
  SUB_SLOTS.find((slot) => canFillSub(stone, slot) && !subAt(stone, slot)) ??
  null;
