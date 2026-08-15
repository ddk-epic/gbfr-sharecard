import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import type { Wrightstone } from "@/domain/build";
import type { TraitId } from "@/catalog/ids";
import { WRIGHTSTONE_LEVELS } from "@/domain/build";
import { traitIconUrl } from "@/assets/urls";
import { traitName } from "@/domain/naming";
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
import { TraitIcon } from "@/components/build/TraitIcon";
import { TraitPicker } from "./TraitPicker";

const WIDTH = 26 * POPOVER_BASE;

/** The sub slot the trait list is filling; null is the stone's own page. */
type SubSlot = 1 | 2;

export function WrightstonePopover({
  wrightstone,
  anchor,
  onChange,
  onClose,
}: {
  wrightstone: Wrightstone | null;
  anchor: Anchor;
  onChange: (next: Wrightstone | null) => void;
  onClose: () => void;
}) {
  const [picking, setPicking] = useState<SubSlot | null>(null);

  const setSub = (slot: SubSlot, trait: TraitId | null) => {
    if (!wrightstone) return;
    const row = trait ? { trait, level: WRIGHTSTONE_LEVELS[slot] } : null;
    onChange(
      slot === 1
        ? { ...wrightstone, sub1: row }
        : { ...wrightstone, sub2: row },
    );
  };

  // The stone is its main trait, so picking one replaces the stone and keeps
  // its subs.
  const pickMain = (trait: TraitId) =>
    onChange({
      main: { trait, level: WRIGHTSTONE_LEVELS[0] },
      sub1: wrightstone?.sub1 ?? null,
      sub2: wrightstone?.sub2 ?? null,
    });

  if (picking !== null) {
    return (
      <Popover
        anchor={anchor}
        width={WIDTH}
        label="Imbued trait"
        onClose={onClose}
      >
        <div className="mb-3 flex items-center gap-1.5">
          <button
            type="button"
            className="text-dim hover:text-ink-strong cursor-pointer"
            title="back"
            aria-label="back"
            onClick={() => setPicking(null)}
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <span className="min-w-0 flex-1 text-[1em] font-semibold uppercase">
            Sub Trait {picking}
          </span>
        </div>
        <TraitPicker
          pool={WRIGHTSTONE_SUB_POOL}
          onPick={(trait) => {
            setSub(picking, trait);
            setPicking(null);
          }}
        />
      </Popover>
    );
  }

  return (
    <Popover
      anchor={anchor}
      width={WIDTH}
      label="Imbued traits"
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

      <PopoverHeading>Sub traits</PopoverHeading>
      {/* Each slot has a fixed level (Lv15, then Lv10) and nothing is promoted
          when a slot empties, so sub 2 only exists under a filled sub 1. */}
      <SubRow
        slot={1}
        trait={wrightstone?.sub1?.trait ?? null}
        enabled={!!wrightstone}
        canClear={!wrightstone?.sub2}
        onPick={() => setPicking(1)}
        onClear={() => setSub(1, null)}
      />
      <SubRow
        slot={2}
        trait={wrightstone?.sub2?.trait ?? null}
        enabled={!!wrightstone?.sub1}
        canClear
        onPick={() => setPicking(2)}
        onClear={() => setSub(2, null)}
      />
    </Popover>
  );
}

function SubRow({
  slot,
  trait,
  enabled,
  canClear,
  onPick,
  onClear,
}: {
  slot: SubSlot;
  trait: TraitId | null;
  enabled: boolean;
  /** Sub 1 can only be cleared once sub 2 is empty. */
  canClear: boolean;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="mb-1 flex items-center gap-1">
      <button
        type="button"
        disabled={!enabled}
        className={`border-line flex min-w-0 flex-1 items-center gap-1.5 rounded-[5px] border px-1.5 py-1 text-left text-[1em] ${
          enabled
            ? "hover:bg-band/35 cursor-pointer bg-white/70"
            : "text-dim bg-white/40 opacity-40"
        }`}
        onClick={onPick}
      >
        <TraitIcon trait={trait} size="em" placeholder />
        <span className={`min-w-0 flex-1 ${trait ? "" : "text-dim"}`}>
          {trait ? traitName(trait) : "no trait"}
        </span>
      </button>
      <button
        type="button"
        className="text-dim hover:text-ink-strong disabled:hover:text-dim cursor-pointer disabled:opacity-25"
        title={`clear sub trait ${slot}`}
        aria-label={`clear sub trait ${slot}`}
        disabled={!trait || !canClear}
        onClick={onClear}
      >
        <X size={18} aria-hidden />
      </button>
    </div>
  );
}
