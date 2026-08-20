import type { CellId, StyleId, StyleRank } from "@/catalog/ids";
import { clearStyle, rankPointsLeft, toggleCell } from "@/domain/master-traits";
import { MasterTraitsSection } from "@/components/build/MasterTraitsSection";
import type { PaneProps } from "@/screens/editor/controls";

const DESIGN_WIDTH = 1481;

const ZOOM = 0.74;

/** Hover effect on the empty cells. */
const HOVER_RING = "cursor-pointer hover:shadow-[inset_0_0_0_1px_#7fd4f8]";

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
        onClearStyle={(style) =>
          onChange({
            ...build,
            masterTraits: clearStyle(build.masterTraits, style),
          })
        }
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
