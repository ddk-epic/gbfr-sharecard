import { useMemo } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import type { CharacterId, TraitId } from "@/catalog/ids";
import { sigilSecondTraitPool, sigilTraitPool } from "../../../data";
import { Popover, POPOVER_BASE, type Anchor } from "../Popover";
import { TraitPicker } from "./TraitPicker";
import {
  cellCount,
  filledCount,
  type Cell,
  type FillOrder,
  type Sigils,
} from "./sigil-cells";

const WIDTH = 26 * POPOVER_BASE;

export function SigilsPopover({
  sigils,
  characterId,
  cursor,
  order,
  anchor,
  onPick,
  onOrder,
  onClose,
}: {
  sigils: Sigils;
  characterId: CharacterId;
  cursor: Cell | null;
  order: FillOrder;
  anchor: Anchor;
  onPick: (trait: TraitId) => void;
  onOrder: (order: FillOrder) => void;
  onClose: () => void;
}) {
  // The first slot is the open traits plus this character's own. The second is
  // narrower and depends on the first, since a character trait may only follow
  // its own partner.
  const firstTraitPool = useMemo(
    () => sigilTraitPool(characterId),
    [characterId],
  );
  const firstOfCursor =
    cursor && cursor.secondary ? sigils[cursor.index]?.primaryTrait : null;
  const secondTraitPool = useMemo(
    () => sigilSecondTraitPool(firstOfCursor),
    [firstOfCursor],
  );

  return (
    <Popover
      anchor={anchor}
      width={WIDTH}
      label="Sigils"
      liveAnchor
      onClose={onClose}
    >
      <div className="mb-2 flex items-center justify-between gap-1.5">
        <span className="min-w-0 flex-1 text-[1em] font-semibold">
          {cursor
            ? `Sigil ${cursor.index + 1} · ${cursor.secondary ? "second" : "first"} trait`
            : "All traits picked"}
        </span>
        <OrderToggle order={order} onOrder={onOrder} />
        <span className="text-ui font-med tabular-nums">
          {filledCount(sigils)}/{cellCount(sigils)}
        </span>
      </div>

      <TraitPicker
        pool={cursor?.secondary ? secondTraitPool : firstTraitPool}
        disabled={cursor === null}
        onPick={onPick}
      />

      <p className="text-dim/80 mt-2 text-[0.8em]">
        Click a sigil trait to remove it, an empty one to add.
      </p>
    </Popover>
  );
}

/** Sets the cursor's walk. */
function OrderToggle({
  order,
  onOrder,
}: {
  order: FillOrder;
  onOrder: (order: FillOrder) => void;
}) {
  const step = (
    value: FillOrder,
    label: string,
    icon: typeof ArrowRight,
    border: string,
  ) => {
    const Icon = icon;
    return (
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={order === value}
        className={`border-line flex cursor-pointer items-center px-1.5 py-0.75 ${border} ${
          order === value
            ? "from-band via-band-soft text-ink-strong bg-linear-160 to-[#b9d7e8]"
            : "text-dim bg-white/70 hover:bg-white"
        }`}
        onClick={() => onOrder(value)}
      >
        <Icon size={14} strokeWidth={2.5} aria-hidden />
      </button>
    );
  };

  return (
    <span className="border-line flex flex-none overflow-hidden rounded-[5px] border">
      {step("across", "fill across, then down", ArrowRight, "")}
      {step("down", "fill down, then across", ArrowDown, "border-l")}
    </span>
  );
}
