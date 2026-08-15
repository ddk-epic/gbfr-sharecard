import type { ReactNode } from "react";
import type { TraitId } from "@/catalog/ids";
import { TraitIcon, traitIconBox } from "@/components/build/TraitIcon";
import { traitName } from "@/domain/naming";
import { nameTracking } from "./name-tracking";

const CELL = "flex min-w-0 items-center gap-1.25";

/** Trait glyph size, px. */
const ROW_ICON = 22;

const GEAR_ROW_STYLE = "text-2xl font-med text-ui";

/** Cap height of a row's level figure. */
export const ROW_LVL_CAP_HEIGHT = 22;

/** A trait's glyph and name, or a dash when empty. */
export function TraitCell({ trait }: { trait: TraitId | null }) {
  const name = trait ? traitName(trait) : "-";
  return (
    <div className={CELL}>
      {trait ? (
        <TraitIcon trait={trait} size={ROW_ICON} />
      ) : (
        /* Spacer, not a dash: holds the glyph's width so the dash indents like a name. */
        <span aria-hidden className={`flex-none ${traitIconBox(ROW_ICON)}`} />
      )}
      {/* Not clipped: short names and tracking do the fitting, so an overflow shows rather than trims. */}
      <span style={{ letterSpacing: nameTracking(name) }}>{name}</span>
    </div>
  );
}

/** A row shell: name columns set by `cols`, the level trailing after them. */
export function GearRow({
  children,
  cols = "1fr",
}: {
  children: ReactNode;
  cols?: string;
}) {
  return (
    <div
      className={`border-line grid items-center border-b-2 px-2.5 py-1 ${GEAR_ROW_STYLE}`}
      style={{ gridTemplateColumns: `${cols} auto` }}
    >
      {children}
    </div>
  );
}
