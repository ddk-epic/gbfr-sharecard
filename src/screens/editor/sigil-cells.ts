import type { Build } from "@/domain/build";
import type { TraitId } from "@/catalog/ids";
import { SIGIL_DEFAULT_LEVEL, setAt } from "@/domain/build";
import { canFollow, takesSecondTrait } from "@/domain/sigils";

export type Sigils = Build["sigils"];

/** A trait's place on the board. */
export type Cell = { index: number; secondary: boolean };

export const sameCell = (a: Cell | null, b: Cell | null) =>
  !!a && !!b && a.index === b.index && a.secondary === b.secondary;

/** The cursor's walk direction. */
export type FillOrder = "across" | "down";

const hasSecond = (slot: Sigils[number]) =>
  !slot || slot.secondaryTrait !== null || takesSecondTrait(slot.primaryTrait);

export function cells(sigils: Sigils, order: FillOrder = "across"): Cell[] {
  const firsts = sigils.map((_, index) => ({ index, secondary: false }));
  const seconds = sigils.flatMap((slot, index) =>
    hasSecond(slot) ? [{ index, secondary: true }] : [],
  );
  if (order === "down") return [...firsts, ...seconds];
  return firsts.flatMap((cell) =>
    hasSecond(sigils[cell.index])
      ? [cell, { index: cell.index, secondary: true }]
      : [cell],
  );
}

export function traitAt(sigils: Sigils, cell: Cell): TraitId | null {
  const slot = sigils[cell.index];
  if (!slot) return null;
  return cell.secondary ? slot.secondaryTrait : slot.primaryTrait;
}

/** A second trait needs a first, or else it isn't fillable. */
const fillable = (sigils: Sigils, cell: Cell) =>
  !cell.secondary || sigils[cell.index] !== null;

export const cursorFor = (sigils: Sigils, cell: Cell): Cell =>
  fillable(sigils, cell) ? cell : { index: cell.index, secondary: false };

export function nextEmpty(
  sigils: Sigils,
  after: Cell | null,
  order: FillOrder = "across",
): Cell | null {
  const all = cells(sigils, order);
  const from = after ? all.findIndex((cell) => sameCell(cell, after)) + 1 : 0;
  const ordered = [...all.slice(from), ...all.slice(0, from)];
  return (
    ordered.find((cell) => fillable(sigils, cell) && !traitAt(sigils, cell)) ??
    null
  );
}

/** A second trait survives a change of first only if it is still legal behind
    it - swapping away from a character trait drops its partner. */
const keptSecond = (first: TraitId, second: TraitId | null | undefined) =>
  second && takesSecondTrait(first) && canFollow(first, second) ? second : null;

export function pick(sigils: Sigils, cell: Cell, trait: TraitId): Sigils {
  const slot = sigils[cell.index];
  if (cell.secondary)
    return slot
      ? setAt(sigils, cell.index, { ...slot, secondaryTrait: trait })
      : sigils;
  return setAt(sigils, cell.index, {
    primaryTrait: trait,
    secondaryTrait: keptSecond(trait, slot?.secondaryTrait),
    level: slot?.level ?? SIGIL_DEFAULT_LEVEL,
  });
}

export function clear(sigils: Sigils, cell: Cell): Sigils {
  const slot = sigils[cell.index];
  if (!slot) return sigils;
  return setAt(
    sigils,
    cell.index,
    cell.secondary ? { ...slot, secondaryTrait: null } : null,
  );
}

export function setLevel(sigils: Sigils, index: number, level: number): Sigils {
  const slot = sigils[index];
  return slot ? setAt(sigils, index, { ...slot, level }) : sigils;
}

export const filledCount = (sigils: Sigils) =>
  cells(sigils).filter((cell) => traitAt(sigils, cell)).length;

export const cellCount = (sigils: Sigils) => cells(sigils).length;
