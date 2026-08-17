import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { TraitId } from "@/catalog/ids";
import { SIGIL_LEVELS } from "@/domain/build";
import { traitName } from "@/domain/naming";
import { EditOverlay, SectionPanel } from "@/components/ui";
import { ROW_LVL_CAP_HEIGHT, TraitCell } from "@/components/build/gear-row";
import { LvlDisplay } from "@/components/build/LvlDisplay";
import { SigilsGrid } from "@/components/build/SigilsGrid";
import { EmptySlot } from "@/screens/editor/controls";
import { sameCell, type Cell, type Sigils } from "@/screens/editor/sigil-cells";

export function SigilsSection({
  sigils,
  picking,
  renderCell,
  renderLevel,
  onOpen,
}: {
  sigils: Sigils;
  /** The sigils popover is open, so the cells take the clicks themselves. */
  picking: boolean;
  renderCell?: (
    index: number,
    secondary: boolean,
    trait: TraitId | null,
  ) => ReactNode;
  renderLevel?: (index: number, level: number | null) => ReactNode;
  onOpen: (el: Element) => void;
}) {
  const filled = sigils.filter(Boolean).length;

  return (
    <SectionPanel shadow className="relative flex flex-col overflow-hidden">
      <SigilsGrid
        sigils={sigils}
        renderCell={renderCell}
        renderLevel={renderLevel}
        overlay={
          filled === 0 &&
          !picking && (
            <EmptySlot
              className="pointer-events-none absolute inset-0 text-xl"
              label="add sigils"
            />
          )
        }
      />
      {!picking && <EditOverlay label="Edit sigils" onOpen={onOpen} />}
    </SectionPanel>
  );
}

/** Cell overlay box. */
const OVERLAY = "absolute inset-x-0 -inset-y-0.5 rounded";

/** Interactive sigil cell, live only while the sigils popover is open. */
export function SigilPickerCell({
  index,
  secondary,
  trait,
  cursor,
  onCursor,
  onClear,
}: {
  index: number;
  secondary: boolean;
  trait: TraitId | null;
  cursor: Cell | null;
  onCursor: (cell: Cell) => void;
  onClear: (cell: Cell) => void;
}) {
  const cell = { index, secondary };
  const aimed = sameCell(cursor, cell);
  const which = secondary ? "second" : "first";

  return (
    <div className="group/cell relative min-w-0">
      <span
        aria-hidden
        className={`${OVERLAY} ${aimed ? "bg-band/50" : ""} ${
          trait
            ? "group-hover/cell:bg-rose-500/20"
            : "group-hover/cell:bg-band/25"
        }`}
      />
      <div className={trait ? "group-hover/cell:line-through" : ""}>
        <TraitCell trait={trait} />
      </div>
      <button
        type="button"
        className={`${OVERLAY} cursor-pointer`}
        aria-label={
          trait
            ? `remove ${traitName(trait)} from sigil ${index + 1}`
            : `pick sigil ${index + 1} ${which} trait`
        }
        onClick={() => (trait ? onClear(cell) : onCursor(cell))}
      />
    </div>
  );
}

/* Overlaid stepper half. */
const STEP_HALF =
  "absolute inset-y-0 flex w-1/2 cursor-pointer items-center text-ui/70 hover:text-ink-strong disabled:cursor-default disabled:opacity-0";

/** Interactive level stepper, live only while the sigils popover is open. */
export function SigilPickerLevel({
  level,
  label,
  onChange,
}: {
  level: number | null;
  label: string;
  onChange: (level: number) => void;
}) {
  const at = level === null ? -1 : SIGIL_LEVELS.indexOf(level);
  const step = (delta: number) => {
    const next = SIGIL_LEVELS[at + delta];
    if (next !== undefined) onChange(next);
  };

  return (
    <span className="relative inline-flex -translate-y-0.5">
      <LvlDisplay cap={ROW_LVL_CAP_HEIGHT} level={level} tone="gold" />
      <button
        type="button"
        className={`${STEP_HALF} left-0 justify-start`}
        aria-label={`lower ${label}`}
        disabled={at <= 0}
        onClick={() => step(-1)}
      >
        <ChevronLeft size="0.7em" strokeWidth={3} aria-hidden />
      </button>
      <button
        type="button"
        className={`${STEP_HALF} right-0 justify-end`}
        aria-label={`raise ${label}`}
        disabled={at < 0 || at >= SIGIL_LEVELS.length - 1}
        onClick={() => step(1)}
      >
        <ChevronRight size="0.7em" strokeWidth={3} aria-hidden />
      </button>
    </span>
  );
}
