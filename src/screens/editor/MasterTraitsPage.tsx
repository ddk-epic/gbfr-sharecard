import type { CellId, StyleId, StyleRank } from "@/catalog/ids";
import { MasterTraitsSection } from "../../components/build/MasterTraitsSection";
import type { PageProps } from "./controls";

/** The card's Master Traits block: col 3 of Card.tsx's upper row. */
const DESIGN_WIDTH = 1481;

/** Shrinks the block to sit snug in the editor body's height. */
const ZOOM = 0.74;

/** Picked cells keep the card's own ring, so only empty ones take the hover. */
const HOVER_RING = "cursor-pointer hover:shadow-[inset_0_0_0_1px_#7fd4f8]";

export function MasterTraitsPage({ build, onChange }: PageProps) {
  const toggleCell = (style: StyleId, rank: StyleRank, id: CellId) => {
    const selected = build.masterTraits[style][rank];
    onChange({
      ...build,
      masterTraits: {
        ...build.masterTraits,
        [style]: {
          ...build.masterTraits[style],
          [rank]: selected.includes(id)
            ? selected.filter((x) => x !== id)
            : [...selected, id],
        },
      },
    });
  };

  return (
    <div
      className="h-full overflow-hidden"
      style={{ width: DESIGN_WIDTH, zoom: ZOOM }}
    >
      <MasterTraitsSection
        build={build}
        cellInteraction={(cell, style, rank) => ({
          onClick: () => toggleCell(style, rank, cell.id),
          title: cell.description,
          className: build.masterTraits[style][rank].includes(cell.id)
            ? "cursor-pointer"
            : HOVER_RING,
        })}
      />
    </div>
  );
}
