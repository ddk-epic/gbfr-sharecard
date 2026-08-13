import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import type {
  BonusTypeId,
  SummonId,
  SummonSlot,
  TraitId,
} from "../../../domain/build";
import type { TraitCategory } from "../../../domain/catalog";
import {
  BONUS_TYPES,
  bonusIconUrl,
  bonusValueText,
  summonEquipTiers,
  summonIconUrl,
  summonsWithTrait,
  SUMMON_TRAIT_POOL,
  traitIconUrl,
  traitName,
} from "../../../data";
import { IconTile, Stepper } from "../controls";
import { Popover, PopoverHeading, POPOVER_BASE, type Anchor } from "../Popover";

const WIDTH = 28 * POPOVER_BASE;

const TRAIT_LEVELS = [11, 12, 13, 14, 15];

const CATEGORY_LABEL: Record<TraitCategory, string> = {
  basic: "Basic",
  attack: "Attack",
  defense: "Defense",
  special: "Special",
  support: "Support",
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL) as TraitCategory[];

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
  const [query, setQuery] = useState("");

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

  /** The trait takes the first summon that rolls it, so a default beats an
      empty step and the slot exists at once. */
  const pickTrait = (next: TraitId) => {
    setDraftTrait(next);
    const first = summonsWithTrait(next)[0];
    if (first) pickSummon(first.id, next);
  };

  return (
    <Popover anchor={anchor} width={WIDTH} label="Summon" onClose={onClose}>
      {!trait ? (
        <TraitStep query={query} onQuery={setQuery} onPick={pickTrait} />
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
                setQuery("");
                if (slot) onChange({ ...slot, trait: "" });
              }}
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <TraitGlyph trait={trait} />
            <span className="min-w-0 flex-1 text-[1em] font-semibold">
              {traitName(trait)}
            </span>
            {slot && (
              <button
                type="button"
                className="text-dim hover:text-ink-strong cursor-pointer"
                title="clear slot"
                aria-label="clear slot"
                onClick={() => onChange(null)}
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

function TraitStep({
  query,
  onQuery,
  onPick,
}: {
  query: string;
  onQuery: (q: string) => void;
  onPick: (trait: TraitId) => void;
}) {
  const needle = query.trim().toLowerCase();
  const matches = SUMMON_TRAIT_POOL.filter((trait) =>
    trait.name.toLowerCase().includes(needle),
  );

  return (
    <>
      <PopoverHeading>Trait</PopoverHeading>
      <input
        autoFocus
        type="search"
        value={query}
        placeholder="filter traits"
        aria-label="filter traits"
        className="border-line mb-2 w-full rounded-sm border bg-white/92 px-2 py-1 text-[1em]"
        onChange={(e) => onQuery(e.target.value)}
      />
      {/* Fixed height so the panel doesn't collapse. */}
      <div className="h-[31em] overflow-y-auto pt-0.5">
        {matches.length === 0 && (
          <p className="text-dim flex h-full items-center justify-center text-[0.85em]">
            no match
          </p>
        )}
        {CATEGORY_ORDER.map((category) => {
          const group = matches.filter((trait) => trait.category === category);
          if (group.length === 0) return null;
          return (
            <div key={category}>
              <PopoverHeading>{CATEGORY_LABEL[category]}</PopoverHeading>
              <div className="mb-1.5">
                {group.map((trait) => (
                  <button
                    key={trait.id}
                    type="button"
                    className="hover:bg-band/35 flex w-full cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-left text-[1em]"
                    onClick={() => onPick(trait.id)}
                  >
                    <TraitGlyph trait={trait.id} />
                    <span className="min-w-0 flex-1">{trait.name}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TraitGlyph({ trait }: { trait: TraitId }) {
  const url = traitIconUrl(trait);
  return url ? (
    <img src={url} alt="" className="size-[1.55em] flex-none" />
  ) : null;
}
