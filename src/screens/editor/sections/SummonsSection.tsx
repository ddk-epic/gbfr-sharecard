import type { Build, SummonSlot } from "../../../domain/build";
import {
  bonusTypeById,
  bonusValueText,
  summonById,
  traitName,
} from "../../../data";
import { SummonPortrait } from "../../card/sections/SummonsSection";
import {
  Heading,
  SectionPanel,
  TraitIcon,
  traitIconBox,
} from "../../../components/ui";
import { BonusIcon, BONUS_ICON_EM } from "../../../components/build/BonusIcon";
import { LvlDisplay } from "../../../components/build/LvlDisplay";
import { nameTracking } from "../../../components/build/name-tracking";
import { EmptySlot } from "../controls";

const summonName = (slot: SummonSlot) => summonById.get(slot.summonId)?.name;
const bonusName = (slot: SummonSlot) =>
  slot.equipBonus && bonusTypeById.get(slot.equipBonus.bonusType)?.name;

// Trait glyph/Lvl are preset to 16/18/22.
const TRAIT_ICON = 18;

/* placeholder strut padding. */
const CELL_PAD = "px-2.5 py-2";

/* placeholder struts. */
const BONUS_ROW = "flex min-w-0 items-center gap-1.25 pl-1 text-[18px]";
const BONUS_ROW_HEIGHT = { height: BONUS_ICON_EM };

export function SummonsSection({
  summons,
  onOpen,
}: {
  summons: Build["summons"];
  onOpen: (index: number, el: Element) => void;
}) {
  return (
    <SectionPanel shadow className="flex flex-col overflow-hidden">
      <Heading size="lg" className="mb-1 flex-none">
        Summons
      </Heading>
      <div className="divide-line-soft grid grid-cols-1 divide-y">
        {summons.map((slot, i) => (
          <div key={i} className="relative py-px">
            <SummonCell slot={slot} />
            <button
              type="button"
              aria-label={`Edit summon ${i + 1}`}
              className="hover:bg-band/15 absolute inset-0 z-10 cursor-pointer rounded-md"
              onClick={(e) => onOpen(i, e.currentTarget)}
            />
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}

function SummonCell({ slot }: { slot: SummonSlot | null }) {
  return (
    <div className="relative flex min-h-0 items-center overflow-hidden">
      {slot && <SummonPortrait summonId={slot.summonId} />}

      {/* An empty slot placeholder strut. */}
      <div
        className={`relative z-1 flex min-w-0 flex-col gap-1.25 ${CELL_PAD} ${
          slot ? "" : "invisible"
        }`}
      >
        {slot ? <SummonNameBand slot={slot} /> : <SummonNameStrut />}
        <div className="space-y-1">
          {slot?.trait ? <TraitRow slot={slot} /> : <TraitEmpty />}
          {slot?.equipBonus ? <EquipBonusRow slot={slot} /> : <BonusEmpty />}
        </div>
      </div>

      {!slot && (
        <EmptySlot className="absolute inset-0 text-xl" label="add summon" />
      )}
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
    <div className={`text-ui ${BONUS_ROW}`} style={BONUS_ROW_HEIGHT}>
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

/** Placeholder strut. */
function SummonNameStrut() {
  return (
    <div className="mb-2 block w-60">
      <span className="block px-3 pt-px pb-0.5 text-xl font-bold select-none">
        &nbsp;
      </span>
    </div>
  );
}

function TraitEmpty() {
  return (
    <div className="text-dim/70 flex min-w-0 items-center">
      <span aria-hidden className="w-0 flex-none overflow-hidden pl-1">
        <span className={`block ${traitIconBox(TRAIT_ICON)}`} />
      </span>
      <span className="text-base tracking-[0.08em] uppercase">no trait</span>
    </div>
  );
}

function BonusEmpty() {
  return (
    <div className={`text-dim/70 ${BONUS_ROW}`} style={BONUS_ROW_HEIGHT}>
      <span className="text-sm tracking-[0.08em] uppercase">
        no equip bonus
      </span>
    </div>
  );
}
