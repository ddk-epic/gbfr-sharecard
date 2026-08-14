import { useState } from "react";
import type { TraitId } from "../../domain/build";
import { IdentityCol } from "./sections/IdentityCol";
import { EDITOR_ZOOM, GEAR_ZOOM, type PageProps } from "./controls";
import { anchorOf, type Anchor } from "./Popover";
import { Weapon, Wrightstone } from "../../components/build/Weapon";
import {
  SigilsSection,
  SigilPickerCell,
  SigilPickerLevel,
} from "./sections/SigilsSection";
import { SectionPanel } from "../../components/ui";
import { WeaponPopover } from "./sections/WeaponPopover";
import { WrightstonePopover } from "./sections/WrightstonePopover";
import { SigilsPopover } from "./sections/SigilsPopover";
import {
  clear,
  cursorFor,
  nextEmpty,
  pick,
  setLevel,
  type Cell,
  type FillOrder,
  type Sigils,
} from "./sections/sigil-cells";

/** The width these sections were drawn at: the card's gear column. */
const DESIGN_WIDTH = 754;

/** Matches the skills page: the identity column is the fixed anchor across page
    flips. */
const IDENTITY_WIDTH = 560 * 1.15;

/** The open popover; only one at a time. */
type Open =
  | { kind: "weapon"; anchor: Anchor }
  | { kind: "wrightstone"; anchor: Anchor }
  | { kind: "sigils"; anchor: Anchor };

export function GearPage({ build, onChange }: PageProps) {
  const [open, setOpen] = useState<Open | null>(null);
  const [cursor, setCursor] = useState<Cell | null>(null);
  /** That cursor's walking direction. */
  const [order, setOrder] = useState<FillOrder>("across");
  const close = () => setOpen(null);

  const setSigils = (sigils: Sigils) => onChange({ ...build, sigils });

  const sigilsOpen = open?.kind === "sigils";
  const renderSigilCell = sigilsOpen
    ? (index: number, secondary: boolean, trait: TraitId | null) => (
        <SigilPickerCell
          index={index}
          secondary={secondary}
          trait={trait}
          cursor={cursor}
          onCursor={(cell) => setCursor(cursorFor(build.sigils, cell))}
          onClear={(cell) => {
            const next = clear(build.sigils, cell);
            setSigils(next);
            // The emptied cell is the likeliest next pick.
            setCursor(cursorFor(next, cell));
          }}
        />
      )
    : undefined;
  const renderSigilLevel = sigilsOpen
    ? (index: number, level: number | null) => (
        <SigilPickerLevel
          level={level}
          label={`sigil ${index + 1} level`}
          onChange={(lvl) => setSigils(setLevel(build.sigils, index, lvl))}
        />
      )
    : undefined;

  const pickTrait = (trait: TraitId) => {
    if (!cursor) return;
    const next = pick(build.sigils, cursor, trait);
    setSigils(next);
    setCursor(nextEmpty(next, cursor, order));
  };

  return (
    <div className="flex h-full gap-2.5">
      <div
        className="flex-none"
        style={{ width: IDENTITY_WIDTH, zoom: EDITOR_ZOOM }}
      >
        <IdentityCol
          build={build}
          width={IDENTITY_WIDTH}
          onChangeStatus={(status) => onChange({ ...build, status })}
        />
      </div>
      <div
        className="flex flex-none flex-col gap-3"
        style={{ width: DESIGN_WIDTH, zoom: GEAR_ZOOM }}
      >
        <SectionPanel shadow className="flex flex-col overflow-hidden">
          <Weapon
            build={build}
            density="loose"
            onOpen={(el) => setOpen({ kind: "weapon", anchor: anchorOf(el) })}
          />
          <Wrightstone
            build={build}
            density="loose"
            onOpen={(el) =>
              setOpen({ kind: "wrightstone", anchor: anchorOf(el) })
            }
          />
        </SectionPanel>
        <SigilsSection
          sigils={build.sigils}
          renderCell={renderSigilCell}
          renderLevel={renderSigilLevel}
          onOpen={(el) => {
            setCursor(nextEmpty(build.sigils, null, order));
            setOpen({ kind: "sigils", anchor: anchorOf(el) });
          }}
        />
      </div>

      {open?.kind === "weapon" && (
        <WeaponPopover
          characterId={build.characterId}
          weapon={build.weapon}
          anchor={open.anchor}
          onChange={(weapon) => onChange({ ...build, weapon })}
          onClose={close}
        />
      )}
      {open?.kind === "wrightstone" && (
        <WrightstonePopover
          wrightstone={build.wrightstone}
          anchor={open.anchor}
          onChange={(wrightstone) => onChange({ ...build, wrightstone })}
          onClose={close}
        />
      )}
      {open?.kind === "sigils" && (
        <SigilsPopover
          sigils={build.sigils}
          characterId={build.characterId}
          cursor={cursor}
          order={order}
          anchor={open.anchor}
          onPick={pickTrait}
          onOrder={setOrder}
          onClose={close}
        />
      )}
    </div>
  );
}
