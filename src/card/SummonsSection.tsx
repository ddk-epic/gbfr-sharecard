import type { Build, SummonId, SummonSlot } from "../domain/build";
import {
  bonusTypeById,
  bonusValueText,
  summonById,
  summonIconUrl,
  traitName,
} from "../data";
import { SectionPanel, TraitIcon, traitIconBox } from "../ui";
import { BONUS_ICON_EM, BonusIcon } from "./BonusIcon";
import { LvlDisplay } from "./LvlDisplay";
import { nameTracking } from "./name-tracking";

const summonName = (slot: SummonSlot) => summonById.get(slot.summonId)?.name;
const bonusName = (slot: SummonSlot) =>
  slot.equipBonus && bonusTypeById.get(slot.equipBonus.bonusType)?.name;

// Trait glyph/Lvl are preset to 16/18/22.
const TRAIT_ICON = 18;

/* Portrait framing, shared with the editor's copy of this cell. */
const PORTRAIT_SCALE = "scale-130";
/** Slides the frame down the art - 0% is the top - since the face sits high. */
const PORTRAIT_CROP = "object-[50%_10%]";
const PORTRAIT_FADE =
  "mask-[linear-gradient(to_left,rgba(0,0,0,0)_0%,#000_14%,#000_60%,rgba(0,0,0,0)_100%)]";

export function SummonPortrait({ summonId }: { summonId: SummonId }) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 right-0 w-1/3 ${PORTRAIT_FADE}`}
    >
      <img
        src={summonIconUrl(summonId)}
        alt=""
        className={`h-full w-full object-cover ${PORTRAIT_CROP} ${PORTRAIT_SCALE}`}
      />
    </div>
  );
}

export function SummonsSection({ summons }: { summons: Build["summons"] }) {
  return (
    <SectionPanel shadow className="col-span-2 self-start overflow-hidden !p-0">
      <div className="relative grid grid-cols-2 grid-rows-2 pb-px">
        <span
          aria-hidden
          className="bg-line-soft pointer-events-none absolute inset-y-3 left-1/2 z-1 w-px -translate-x-1/2"
        />
        <span
          aria-hidden
          className="bg-line-soft pointer-events-none absolute inset-x-3 top-1/2 z-1 h-px -translate-y-1/2"
        />
        {summons.map((slot, i) => (
          <SummonCell key={i} slot={slot} />
        ))}
      </div>
    </SectionPanel>
  );
}

function SummonCell({ slot }: { slot: SummonSlot | null }) {
  return (
    <div className="relative -mb-1 -ml-1 flex min-h-0 items-center overflow-hidden">
      {slot && <SummonPortrait summonId={slot.summonId} />}

      <div className="relative z-1 mb-px flex min-w-0 flex-col gap-1.25 px-4.5 py-3.25">
        {slot ? <SummonNameBand slot={slot} /> : <SummonNameGhost />}
        <div className="space-y-1">
          {slot?.trait ? <TraitRow slot={slot} /> : <TraitGhost />}
          {slot?.equipBonus ? (
            <EquipBonusRow slot={slot} />
          ) : (
            <EquipBonusGhost />
          )}
        </div>
      </div>
    </div>
  );
}

/* Fields */
function SummonNameBand({ slot }: { slot: SummonSlot }) {
  return (
    <div className="mb-2 block w-60">
      <span className="from-gold-deep via-gold block rounded-sm bg-linear-90 from-0% via-40% to-transparent to-100% px-3 pt-px pb-0.5 text-xl font-bold tracking-wider whitespace-nowrap text-white [-webkit-text-stroke:5px_var(--gold-deep)] [paint-order:stroke] [text-shadow:0_1px_3px_rgba(74,0,0,0.85)]">
        {summonName(slot)}
      </span>
    </div>
  );
}

function TraitRow({ slot }: { slot: SummonSlot }) {
  const traitLabel = traitName(slot.trait);
  return (
    <div className="flex min-w-0 items-center gap-1">
      <TraitIcon trait={slot.trait} size={TRAIT_ICON} />
      <span
        className="font-med text-ui text-xl whitespace-nowrap"
        style={{ letterSpacing: nameTracking(traitLabel) }}
      >
        {traitLabel}
      </span>
      <LvlDisplay
        cap={16}
        level={slot.traitLevel}
        tone="gold"
        traitPrefix
        className="ml-1 -translate-y-px"
      />
    </div>
  );
}

function EquipBonusRow({ slot }: { slot: SummonSlot }) {
  if (!slot.equipBonus) return null;
  return (
    <div className="text-ui flex min-w-0 items-center gap-1.25 pl-1 text-[18px]">
      <BonusIcon bonusType={slot.equipBonus.bonusType} className="-ml-1" />
      <span className="whitespace-nowrap">
        <span>{bonusName(slot)} </span>
        <span className="font-med">
          {bonusValueText(slot.equipBonus.bonusType, slot.equipBonus.value)}
        </span>
      </span>
    </div>
  );
}

/* Ghosts */
function SummonNameGhost() {
  return (
    <div className="mb-2 block w-60">
      <span className="from-slanted-bar block rounded-sm bg-linear-90 from-0% to-transparent to-90% px-3 pt-px pb-0.5 text-xl font-bold tracking-wider whitespace-nowrap text-transparent select-none">
        &nbsp;
      </span>
    </div>
  );
}

function TraitGhost() {
  return (
    <div className="flex min-w-0 items-center gap-1">
      {/* Strut: the real row's text-xl label sets its height, not the icon. */}
      <span aria-hidden className="w-0 overflow-hidden text-xl select-none">
        &nbsp;
      </span>
      <span
        className={`bg-slanted-bar flex-none rounded-sm ${traitIconBox(TRAIT_ICON)}`}
      />
      <span className="bg-slanted-bar h-3.5 w-28 rounded-sm" />
    </div>
  );
}

function EquipBonusGhost() {
  return (
    <div className="flex min-w-0 items-center gap-1.25 text-[18px]">
      {/* Strut: the real row's BonusIcon sets its height, not the small bar. */}
      <span
        aria-hidden
        className="w-0 flex-none"
        style={{ height: BONUS_ICON_EM }}
      />
      <span className="bg-slanted-bar h-3 w-32 rounded-sm" />
    </div>
  );
}
