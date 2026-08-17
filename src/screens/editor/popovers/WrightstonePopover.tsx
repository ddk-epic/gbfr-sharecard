import { X } from "lucide-react";
import type { Wrightstone } from "@/domain/build";
import type { TraitId } from "@/catalog/ids";
import { WRIGHTSTONE_LEVELS } from "@/domain/build";
import { traitIconUrl } from "@/assets/urls";
import {
  WRIGHTSTONE_MAIN_POOL,
  WRIGHTSTONE_SUB_POOL,
  wrightstoneName,
} from "@/domain/wrightstone";
import { IconTile } from "@/screens/editor/controls";
import {
  Popover,
  PopoverHeading,
  POPOVER_BASE,
  type Anchor,
} from "@/screens/editor/popovers/Popover";
import type { SubSlot } from "@/screens/editor/wrightstone-subs";
import { TraitPicker } from "./TraitPicker";

const WIDTH = 26 * POPOVER_BASE;

export function WrightstonePopover({
  wrightstone,
  cursor,
  anchor,
  onChange,
  onPick,
  onClose,
}: {
  wrightstone: Wrightstone | null;
  /** The sub row a pick fills; null when there is none to fill. */
  cursor: SubSlot | null;
  anchor: Anchor;
  onChange: (next: Wrightstone | null) => void;
  onPick: (trait: TraitId) => void;
  onClose: () => void;
}) {
  // The stone is its main trait, so picking one replaces the stone and keeps
  // its subs.
  const pickMain = (trait: TraitId) =>
    onChange({
      main: { trait, level: WRIGHTSTONE_LEVELS[0] },
      sub1: wrightstone?.sub1 ?? null,
      sub2: wrightstone?.sub2 ?? null,
    });

  return (
    <Popover
      anchor={anchor}
      width={WIDTH}
      label="Imbued traits"
      liveAnchor
      onClose={onClose}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <span className="min-w-0 flex-1 text-[1em] font-semibold">
          {wrightstoneName(wrightstone?.main.trait)}
        </span>
        {/* Always here, so picking a stone can't grow the header. */}
        <button
          type="button"
          className="text-dim hover:text-ink-strong disabled:hover:text-dim cursor-pointer disabled:opacity-25"
          title="clear wrightstone"
          aria-label="clear wrightstone"
          disabled={!wrightstone}
          onClick={() => onChange(null)}
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      <PopoverHeading>Wrightstone Trait</PopoverHeading>
      <div className="mb-3 grid grid-cols-4 gap-0.5">
        {WRIGHTSTONE_MAIN_POOL.map((trait) => (
          <IconTile
            key={trait.id}
            icon={traitIconUrl(trait.id) ?? ""}
            name={wrightstoneName(trait.id).replace(" Wrightstone", "")}
            selected={trait.id === wrightstone?.main.trait}
            onClick={() => pickMain(trait.id)}
          />
        ))}
      </div>

      <TraitPicker
        pool={WRIGHTSTONE_SUB_POOL}
        heading={cursor ? `Sub Trait ${cursor}` : "Sub Traits"}
        disabled={cursor === null}
        onPick={onPick}
      />

      <p className="text-dim/80 mt-2 text-[0.8em]">
        Click a sub trait to remove it, an empty one to add.
      </p>
    </Popover>
  );
}
