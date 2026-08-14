import type { Weapon } from "../../../domain/build";
import type { CharacterId, TraitId } from "@/catalog/ids";
import { weaponArtUrl } from "@/assets/urls";
import { traitName } from "@/domain/naming";
import {
  characterWeaponOptions,
  resolveWeapon,
  weaponPoolDefaults,
} from "@/domain/weapons";
import { IconTile } from "../controls";
import { Popover, PopoverHeading, POPOVER_BASE, type Anchor } from "../Popover";
import { TraitGlyph } from "./TraitPicker";

const WIDTH = 26 * POPOVER_BASE;

export function WeaponPopover({
  characterId,
  weapon,
  anchor,
  onChange,
  onClose,
}: {
  characterId: CharacterId;
  weapon: Weapon;
  anchor: Anchor;
  onChange: (next: Weapon) => void;
  onClose: () => void;
}) {
  const resolved = resolveWeapon(characterId, weapon);
  const poolSlots = resolved.slots.filter((slot) => slot.kind === "pool");

  /** A weapon is always equipped, so a pick swaps. */
  const pickSeries = (series: string) => {
    if (weapon.series === series) return;
    onChange({
      series,
      critRate: 0,
      stun: 0,
      poolTraits: weaponPoolDefaults(characterId, series),
    });
  };

  const pickPoolTrait = (ordinal: number, trait: TraitId) =>
    onChange({
      ...weapon,
      poolTraits: weapon.poolTraits.map((t, i) => (i === ordinal ? trait : t)),
    });

  return (
    <Popover anchor={anchor} width={WIDTH} label="Weapon" onClose={onClose}>
      <PopoverHeading>Weapon</PopoverHeading>
      <div className="mb-1 grid grid-cols-4 gap-0.5">
        {characterWeaponOptions(characterId).map((option) => (
          <IconTile
            key={option.series}
            icon={weaponArtUrl(characterId, option.name)}
            name={option.name}
            contain
            selected={option.series === weapon.series}
            onClick={() => pickSeries(option.series)}
          />
        ))}
      </div>

      {poolSlots.map((slot, ordinal) => (
        <div key={ordinal} className="mt-2.5">
          <PopoverHeading>
            {poolSlots.length > 1
              ? `Weapon trait ${ordinal + 1}`
              : "Weapon trait"}
          </PopoverHeading>
          <div className="max-h-[13em] overflow-y-auto">
            {slot.pool.map((trait) => (
              <button
                key={trait}
                type="button"
                aria-pressed={trait === slot.trait}
                className={`flex w-full cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-left text-[1em] ${
                  trait === slot.trait ? "bg-band/70" : "hover:bg-band/35"
                }`}
                onClick={() => pickPoolTrait(ordinal, trait)}
              >
                <TraitGlyph trait={trait} />
                <span className="min-w-0 flex-1">{traitName(trait)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </Popover>
  );
}
