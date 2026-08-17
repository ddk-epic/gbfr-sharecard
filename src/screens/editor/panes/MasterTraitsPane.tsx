import type { CellId, StyleId, StyleRank } from "@/catalog/ids";
import { rankPointsLeft, toggleCell } from "@/domain/master-traits";
import { MasterTraitsSection } from "@/components/build/MasterTraitsSection";
import type { PaneProps } from "@/screens/editor/controls";

/** The card's Master Traits block: col 3 of Card.tsx's upper row. */
const DESIGN_WIDTH = 1481;

/** Shrinks the block to sit snug in the editor body's height. */
const ZOOM = 0.74;

/** Picked cells keep the card's own ring, so only empty ones take the hover. */
const HOVER_RING = "cursor-pointer hover:shadow-[inset_0_0_0_1px_#7fd4f8]";

/** A rank whose shared pool is spent takes no more picks. */
const NO_POINTS = "cursor-not-allowed opacity-50";

const TOOLTIP_PLACEMENT = "top" as const;

export function MasterTraitsPane({ build, onChange }: PaneProps) {
  const toggle = (style: StyleId, rank: StyleRank, id: CellId) =>
    onChange({
      ...build,
      masterTraits: toggleCell(build.masterTraits, style, rank, id),
    });

  return (
    <div
      className="h-full overflow-hidden"
      style={{ width: DESIGN_WIDTH, zoom: ZOOM }}
    >
      <MasterTraitsSection
        build={build}
        tooltipPlacement={TOOLTIP_PLACEMENT}
        cellInteraction={(cell, style, rank) => {
          const picked = build.masterTraits[style][rank].includes(cell.id);
          const spent =
            !picked && rankPointsLeft(build.masterTraits, rank) <= 0;
          return {
            onClick: spent ? undefined : () => toggle(style, rank, cell.id),
            // Nothing to reveal when the label is the whole description.
            tooltip:
              cell.description === cell.label ? undefined : cell.description,
            className: spent
              ? NO_POINTS
              : picked
                ? "cursor-pointer"
                : HOVER_RING,
          };
        }}
      />
    </div>
  );
}
