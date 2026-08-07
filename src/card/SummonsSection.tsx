// Four quadrants split by a cross divider. Text on the left (summon name over a
// gold title band, then trait + "T. Lvl NN" at one cap, then the equip bonus a
// step smaller like an Over Mastery row). The zoomed portrait bleeds full-height
// into the right of each cell, past the padding.

import type { Build } from "../domain/build";
import {
  bonusTypeById,
  bonusValueText,
  summonById,
  summonIconUrl,
  traitName,
} from "../data";
import { SectionPanel, TraitIcon } from "../ui";
import { BonusIcon } from "./BonusIcon";
import { LvlDisplay } from "./LvlDisplay";
import { nameTracking } from "./name-tracking";

type Slot = Build["summons"][number];

const summonName = (slot: Slot) =>
  slot ? (summonById.get(slot.summonId)?.name ?? "-") : "-";
const bonusName = (slot: Slot) =>
  slot?.equipBonus
    ? (bonusTypeById.get(slot.equipBonus.bonusType)?.name ?? "-")
    : "-";

// Trait glyph/Lvl are preset to 16/18/22.
const TRAIT_ICON = 18;

export function SummonsSection({ summons }: { summons: Build["summons"] }) {
  return (
    <SectionPanel
      shadow
      className="col-span-2 self-start overflow-hidden !px-0 !py-0"
    >
      <div className="relative grid grid-cols-2 grid-rows-2">
        <span
          aria-hidden
          className="bg-line-soft pointer-events-none absolute inset-y-3 left-1/2 z-1 w-px -translate-x-1/2"
        />
        <span
          aria-hidden
          className="bg-line-soft pointer-events-none absolute inset-x-3 top-1/2 z-1 h-px -translate-y-1/2"
        />
        {summons.map((slot, i) => {
          const traitLabel = slot?.trait ? traitName(slot.trait) : "-";
          return (
            <div
              key={i}
              className="relative -mx-1 flex min-h-0 items-center overflow-hidden"
            >
              {/* Zoomed portrait */}
              {slot && (
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 mask-[linear-gradient(to_left,rgba(0,0,0,0)_0%,#000_14%,#000_60%,rgba(0,0,0,0)_100%)]">
                  <img
                    src={summonIconUrl(slot.summonId)}
                    alt=""
                    className="-my-7 h-full w-full origin-top scale-130 object-cover object-top"
                  />
                </div>
              )}

              <div className="relative z-1 mb-px flex min-w-0 flex-col gap-1 px-4.5 py-3">
                <div className="mb-1 block w-60 overflow-hidden rounded-sm">
                  <span className="from-gold-deep via-gold block bg-linear-90 from-0% via-60% to-transparent to-100% py-0.5 pr-3 pl-2 text-xl font-bold tracking-wide whitespace-nowrap text-white [-webkit-text-stroke:3px_var(--gold-deep)] [paint-order:stroke] [text-shadow:0_1px_3px_rgba(74,0,0,0.85)]">
                    {summonName(slot)}
                  </span>
                </div>
                {/* Trait Row */}
                <div className="flex min-w-0 items-center gap-1">
                  {slot?.trait ? (
                    <TraitIcon trait={slot.trait} size={TRAIT_ICON} />
                  ) : (
                    <span
                      aria-hidden
                      className="flex-none"
                      style={{ width: TRAIT_ICON, height: TRAIT_ICON }}
                    />
                  )}
                  <span
                    className="font-med text-ui text-xl whitespace-nowrap"
                    style={{ letterSpacing: nameTracking(traitLabel) }}
                  >
                    {traitLabel}
                  </span>
                  <LvlDisplay
                    cap={16}
                    level={slot?.traitLevel ?? null}
                    tone="gold"
                    traitPrefix
                    className="ml-1 -translate-y-px"
                  />
                </div>
                {/* Equip bonus */}
                <div className="text-ui flex min-w-0 items-center gap-1.25 pl-1 text-[18px]">
                  {slot?.equipBonus ? (
                    <>
                      <BonusIcon
                        bonusType={slot.equipBonus.bonusType}
                        className="-ml-1"
                      />
                      <span className="whitespace-nowrap">
                        <span>{bonusName(slot)} </span>
                        <span className="font-med">
                          {bonusValueText(
                            slot.equipBonus.bonusType,
                            slot.equipBonus.value,
                          )}
                        </span>
                      </span>
                    </>
                  ) : (
                    <span className="text-dim">-</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionPanel>
  );
}
