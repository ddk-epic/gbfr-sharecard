import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import type { SummonSlot } from "@/domain/build";
import type { BonusTypeId, SummonId, TraitId } from "@/catalog/ids";
import { SIGIL_LEVELS } from "@/domain/build";
import { bonusIconUrl, summonIconUrl } from "@/assets/urls";
import { BONUS_TYPES } from "@/catalog";
import { bonusValueText, traitName } from "@/domain/naming";
import {
  summonEquipTiers,
  summonsWithTrait,
  SUMMON_TRAIT_POOL,
} from "@/domain/summons";
import { TraitIcon } from "@/components/build/TraitIcon";
import { IconTile, Stepper } from "@/screens/editor/controls";
import {
  Popover,
  PopoverHeading,
  POPOVER_BASE,
  type Anchor,
} from "@/screens/editor/popovers/Popover";
import { TraitPicker } from "./TraitPicker";

const WIDTH = 28 * POPOVER_BASE;

/** A summon's trait ladder is the sigil ladder. */
const TRAIT_LEVELS = SIGIL_LEVELS;

type EquipBonus = NonNullable<SummonSlot["equipBonus"]>;

/** Tier lists run parallel across bonus types and summons, so a roll keeps
    its rank rather than being re-picked. */
const atRank = (tiers: number[], rank: number) =>
  tiers.length === 0
    ? null
    : tiers[rank < 0 ? tiers.length - 1 : Math.min(rank, tiers.length - 1)];

export function SummonsPopover({
  slot,
  anchor,
  onChange,
  onClose,
}: {
  slot: SummonSlot | null;
  anchor: Anchor;
  onChange: (next: SummonSlot | null) => void;
  onClose: () => void;
}) {
  const [draftTrait, setDraftTrait] = useState<TraitId | null>(
    slot?.trait || null,
  );

  const trait = slot?.trait || draftTrait;

  const bonus = slot?.equipBonus ?? null;
  const tiers = summonEquipTiers(slot?.summonId, bonus?.bonusType);
  const rank = bonus ? tiers.indexOf(bonus.value) : -1;

  const setBonus = (next: EquipBonus | null) =>
    slot && onChange({ ...slot, equipBonus: next });

  const pickBonusType = (bonusType: BonusTypeId) => {
    if (bonus?.bonusType === bonusType) return setBonus(null);
    const value = atRank(summonEquipTiers(slot?.summonId, bonusType), rank);
    setBonus(value === null ? null : { bonusType, value });
  };

  const pickSummon = (summonId: SummonId, forTrait = trait) => {
    const value = bonus
      ? atRank(summonEquipTiers(summonId, bonus.bonusType), rank)
      : null;
    onChange({
      summonId,
      trait: forTrait ?? "",
      traitLevel: slot?.traitLevel ?? TRAIT_LEVELS.at(-1)!,
      equipBonus: bonus && value !== null ? { ...bonus, value } : null,
    });
  };

  /** Picking a trait also picks the first summon that rolls it, so the slot is
      filled without a second click. */
  const pickTrait = (next: TraitId) => {
    setDraftTrait(next);
    const first = summonsWithTrait(next)[0];
    if (first) pickSummon(first.id, next);
  };

  return (
    <Popover anchor={anchor} width={WIDTH} label="Summon" onClose={onClose}>
      {!trait ? (
        <TraitPicker pool={SUMMON_TRAIT_POOL} onPick={pickTrait} />
      ) : (
        <>
          <div className="mb-3 flex items-center gap-1.5">
            <button
              type="button"
              className="text-dim hover:text-ink-strong cursor-pointer"
              title="change trait"
              aria-label="change trait"
              onClick={() => {
                setDraftTrait(null);
                if (slot) onChange({ ...slot, trait: "" });
              }}
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <TraitIcon trait={trait} placeholder />
            <span className="min-w-0 flex-1 text-[1em] font-semibold">
              {traitName(trait)}
            </span>
            {slot && (
              <button
                type="button"
                className="text-dim hover:text-ink-strong cursor-pointer"
                title="clear slot"
                aria-label="clear slot"
                onClick={() => {
                  setDraftTrait(null);
                  onChange(null);
                }}
              >
                <X size={17} aria-hidden />
              </button>
            )}
          </div>

          <PopoverHeading>Summon</PopoverHeading>
          <div className="mb-1 grid grid-cols-4 gap-0.5">
            {summonsWithTrait(trait).map((summon) => (
              <IconTile
                key={summon.id}
                icon={summonIconUrl(summon.id)}
                name={summon.name}
                selected={summon.id === slot?.summonId}
                onClick={() => pickSummon(summon.id)}
              />
            ))}
          </div>

          {slot && (
            <>
              <div className="mb-3.5">
                <Stepper
                  values={TRAIT_LEVELS}
                  value={slot.traitLevel}
                  onChange={(traitLevel) => onChange({ ...slot, traitLevel })}
                />
              </div>

              <PopoverHeading>Equip bonus</PopoverHeading>
              <div className="mb-1 grid grid-cols-4 gap-0.5">
                {BONUS_TYPES.map((def) => (
                  <IconTile
                    key={def.id}
                    icon={bonusIconUrl(def.id)}
                    name={def.name}
                    selected={def.id === bonus?.bonusType}
                    onClick={() => pickBonusType(def.id)}
                  />
                ))}
              </div>
              <div>
                <Stepper
                  values={tiers}
                  value={bonus?.value ?? null}
                  empty="no bonus"
                  format={(v) => bonusValueText(bonus!.bonusType, v)}
                  onChange={(value) => bonus && setBonus({ ...bonus, value })}
                />
              </div>
            </>
          )}
        </>
      )}
    </Popover>
  );
}
