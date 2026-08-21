import { describe, expect, test } from "vitest";
import {
  CATALOG_FILES,
  MASTER_TRAIT_SHARED,
  characterCatalog,
} from "@/catalog";
import type { CellId, CharacterId, StyleId, StyleRank } from "@/catalog/ids";
import { RANKS, STYLES } from "@/catalog/ids";
import type { MasterTraitCell, MasterTraitCellBody } from "@/catalog/types";

const CHARACTERS = Object.keys(CATALOG_FILES) as CharacterId[];

/** A resolved cell stripped back to what a shared entry holds. */
const body = (cell: MasterTraitCell): MasterTraitCellBody => ({
  label: cell.label,
  description: cell.description,
  ...(cell.perkRank ? { perkRank: cell.perkRank } : {}),
});

/** Every character's resolved body for one cell, keyed by cell id. */
const resolvedByCell = () => {
  const cells = new Map<CellId, MasterTraitCellBody[]>();
  for (const id of CHARACTERS) {
    const { masterTraits } = characterCatalog(id);
    for (const style of STYLES)
      for (const rank of RANKS)
        for (const cell of masterTraits[style][rank]) {
          if (!cells.has(cell.id)) cells.set(cell.id, []);
          cells.get(cell.id)!.push(body(cell));
        }
  }
  return cells;
};

const unanimous = (bodies: MasterTraitCellBody[]) =>
  bodies.length === CHARACTERS.length &&
  bodies.every((b) => JSON.stringify(b) === JSON.stringify(bodies[0]));

describe("shared master-trait cells", () => {
  test("hold exactly the cells every character agrees on", () => {
    const agreed: CellId[] = [];
    for (const [id, bodies] of resolvedByCell())
      if (unanimous(bodies)) agreed.push(id);

    expect(Object.keys(MASTER_TRAIT_SHARED).sort()).toEqual(agreed.sort());
  });

  test("carry the body all characters resolve to", () => {
    for (const [id, shared] of Object.entries(MASTER_TRAIT_SHARED))
      for (const character of CHARACTERS) {
        const [style, rank] = id.split(".") as [StyleId, StyleRank];
        const cell = characterCatalog(character).masterTraits[style][rank].find(
          (c) => c.id === id,
        );
        expect(body(cell!), `${character} ${id}`).toEqual(shared);
      }
  });

  test("are not repeated in any <character>.json", () => {
    for (const character of CHARACTERS) {
      const own = Object.keys(CATALOG_FILES[character].masterTraits.cells);
      const repeated = own.filter((id) => id in MASTER_TRAIT_SHARED);
      expect(repeated, `${character} restates shared cells`).toEqual([]);
    }
  });
});
