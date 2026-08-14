import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TraitId } from "../../../domain/build";
import { SIGIL_LEVELS } from "../../../domain/build";
import { traitName } from "../../../data";
import { Heading, SectionPanel } from "../../../components/ui";
import {
  GearRow,
  ROW_LVL_CAP_HEIGHT,
  TraitCell,
} from "../../../components/build/gear-row";
import { LvlDisplay } from "../../../components/build/LvlDisplay";
import { EmptySlot } from "../controls";
import { sameCell, type Cell, type Sigils } from "./sigil-cells";

export type SigilBoard = {
  cursor: Cell | null;
  onCursor: (cell: Cell) => void;
  onClear: (cell: Cell) => void;
  onLevel: (index: number, level: number) => void;
};

export function SigilsSection({
  sigils,
  board,
  onOpen,
}: {
  sigils: Sigils;
  board?: SigilBoard;
  onOpen: (el: Element) => void;
}) {
  const filled = sigils.filter(Boolean).length;

  return (
    <SectionPanel shadow className="relative flex flex-col overflow-hidden">
      <Heading size="lg" className="flex-none">
        Sigils
      </Heading>
      <div className="flex flex-none flex-col">
        {sigils.map((slot, i) => (
          <GearRow cols="1fr 1fr" key={i}>
            <SigilBoardCell
              index={i}
              secondary={false}
              trait={slot?.primaryTrait ?? null}
              board={board}
            />
            <SigilBoardCell
              index={i}
              secondary
              trait={slot?.secondaryTrait ?? null}
              board={board}
            />
            <SigilBoardLevel
              level={slot ? slot.level : null}
              label={`sigil ${i + 1} level`}
              onChange={board ? (level) => board.onLevel(i, level) : undefined}
            />
          </GearRow>
        ))}
      </div>
      {filled === 0 && !board && (
        <EmptySlot
          className="pointer-events-none absolute inset-0 text-xl"
          label="add sigils"
        />
      )}
      {!board && (
        <button
          type="button"
          aria-label="Edit sigils"
          className="hover:bg-band/15 absolute inset-0 z-10 cursor-pointer rounded-lg"
          onClick={(e) => onOpen(e.currentTarget)}
        />
      )}
    </SectionPanel>
  );
}

/** Cell overlay box. */
const OVERLAY = "absolute inset-x-0 -inset-y-0.5 rounded";

function SigilBoardCell({
  index,
  secondary,
  trait,
  board,
}: {
  index: number;
  secondary: boolean;
  trait: TraitId | null;
  board?: SigilBoard;
}) {
  if (!board) return <TraitCell trait={trait} />;

  const cell = { index, secondary };
  const aimed = sameCell(board.cursor, cell);
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
        onClick={() => (trait ? board.onClear(cell) : board.onCursor(cell))}
      />
    </div>
  );
}

/* Overlaid stepper half. */
const STEP_HALF =
  "absolute inset-y-0 flex w-1/2 cursor-pointer items-center text-ui/70 hover:text-ink-strong disabled:cursor-default disabled:opacity-0";

function SigilBoardLevel({
  level,
  label,
  onChange,
}: {
  level: number | null;
  label: string;
  onChange?: (level: number) => void;
}) {
  // The read-only chip is the grid item itself.
  if (!onChange)
    return (
      <LvlDisplay
        cap={ROW_LVL_CAP_HEIGHT}
        level={level}
        tone="gold"
        className="-translate-y-0.5"
      />
    );

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
