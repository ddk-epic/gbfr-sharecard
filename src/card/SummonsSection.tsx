import type { Build } from "../domain/build";
import { bonusTypeById, bonusValueText, summonById, traitName } from "../data";
import { BonusIcon } from "./BonusIcon";
import { Lvl, SectionPanel } from "../ui";

const PLATE =
  "rounded-[7px] bg-white/85 shadow-[inset_0_0_0_1px_var(--line-soft)]";

const CLIP = "overflow-hidden text-ellipsis whitespace-nowrap";

export function SummonsSection({ summons }: { summons: Build["summons"] }) {
  return (
    <SectionPanel shadow className="col-span-2 flex flex-col">
      {/*<Heading size="lg">Summons</Heading>*/}
      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-1.25">
        {summons.map((slot, i) => (
          <div
            className={`${PLATE} flex min-h-0 flex-col gap-1 overflow-hidden px-3.75 py-2.75 text-2xl`}
            key={i}
          >
            <div className="from-gold via-gold-deep to-gold-dark -mx-3.75 -mt-2.75 mb-1 flex min-w-0 flex-none items-center gap-2 rounded-t-md bg-linear-90 from-0% via-55% to-100% px-3.75 py-1.75">
              <b className="text-2xl font-bold text-white [text-shadow:0_1px_2.5px_rgba(90,30,0,0.55)]">
                {slot ? summonById.get(slot.summonId)?.name : "-"}
              </b>
            </div>
            <div className="grid flex-1 grid-cols-[6fr_5fr] items-center gap-4">
              <div className="border-line-soft flex min-w-0 items-baseline gap-2 border-r pr-3.5">
                <span className={`${CLIP} text-ui`}>
                  {slot?.trait ? traitName(slot.trait) : "-"}
                </span>
                {slot && <Lvl className="ml-1.25">{slot.traitLevel}</Lvl>}
              </div>
              <div className="flex min-w-0 items-center gap-1.5">
                {slot?.equipBonus && (
                  <BonusIcon bonusType={slot.equipBonus.bonusType} />
                )}
                <span className={`${CLIP} text-dim`}>
                  {slot?.equipBonus
                    ? bonusTypeById.get(slot.equipBonus.bonusType)?.name
                    : "-"}
                </span>
                {slot?.equipBonus && (
                  <Lvl tone="dim" className="ml-1.25">
                    {bonusValueText(
                      slot.equipBonus.bonusType,
                      slot.equipBonus.value,
                    )}
                  </Lvl>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
