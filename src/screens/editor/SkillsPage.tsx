import type {
  BonusTypeId,
  OverMasteryLine,
  SummonId,
  SummonSlot,
} from "../../domain/build";
import {
  BONUS_TYPES,
  bonusTypeById,
  bonusValueText,
  characterCatalog,
  SUMMONS,
  summonEquipTiers,
  summonTraits,
} from "../../data";
import { IdentityCol } from "./IdentityCol";
import {
  NumInput,
  Select,
  TierSelect,
  TraitSelect,
  type PageProps,
} from "./controls";
import { Diamond, Heading, Orb, Panel } from "../../ui";

// Summon main traits only roll Lv 11-15.
const SUMMON_TRAIT_MIN_LEVEL = 11;
const SUMMON_TRAIT_MAX_LEVEL = 15;

const setAt = <T,>(slots: (T | null)[], index: number, value: T | null) =>
  slots.map((slot, i) => (i === index ? value : slot));

export function SkillsPage({ build, onChange }: PageProps) {
  const catalog = characterCatalog(build.characterId);
  return (
    <div className="grid h-full grid-cols-2 gap-3.5 overflow-hidden px-4 py-3.5">
      <IdentityCol build={build} onChange={onChange} />
      <div className="flex min-w-0 flex-col gap-3.5">
        <Heading>Skills</Heading>
        <Panel>
          <div className="flex flex-col gap-1.5">
            {build.skills.map((skill, i) => (
              <div
                className="flex items-center gap-2 px-2.25 py-1 text-[15px]"
                key={i}
              >
                <Orb />
                <Select
                  className="flex-1"
                  value={skill ?? ""}
                  onChange={(v) =>
                    onChange({
                      ...build,
                      skills: setAt(build.skills, i, v || null),
                    })
                  }
                >
                  <option value="">-</option>
                  {catalog.skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <Diamond />
              </div>
            ))}
          </div>
        </Panel>
        <Heading>Over Mastery</Heading>
        <Panel>
          {build.overMastery.map((line, i) => (
            <OverMasteryRow
              key={i}
              line={line}
              onChange={(next) =>
                onChange({
                  ...build,
                  overMastery: setAt(build.overMastery, i, next),
                })
              }
            />
          ))}
        </Panel>
        <Heading>Summons</Heading>
        <div className="flex flex-col gap-0.75">
          {build.summons.map((slot, i) => (
            <SummonCard
              key={i}
              slot={slot}
              onChange={(next) =>
                onChange({ ...build, summons: setAt(build.summons, i, next) })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OverMasteryRow({
  line,
  onChange,
}: {
  line: OverMasteryLine | null;
  onChange: (next: OverMasteryLine | null) => void;
}) {
  const values = line ? bonusTypeById.get(line.bonusType)?.overMastery : null;
  return (
    <div className="flex items-center gap-2 py-0.75 text-[14px]">
      <Select
        className="min-w-0 flex-1"
        value={line?.bonusType ?? ""}
        onChange={(bonusType) =>
          onChange(
            bonusType
              ? { bonusType, value: fitToRange(line?.value ?? 0, bonusType) }
              : null,
          )
        }
      >
        <option value="">-</option>
        {BONUS_TYPES.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Select>
      {line && (
        <NumInput
          value={line.value}
          max={values?.at(-1) ?? 9999}
          onChange={(value) => onChange({ ...line, value })}
        />
      )}
    </div>
  );
}

function SummonCard({
  slot,
  onChange,
}: {
  slot: SummonSlot | null;
  onChange: (next: SummonSlot | null) => void;
}) {
  const traits = summonTraits(slot?.summonId);
  const equipBonus = slot?.equipBonus ?? null;
  const tiers = summonEquipTiers(slot?.summonId, equipBonus?.bonusType);
  return (
    <div className="flex flex-col gap-1.25 rounded-md bg-white/85 px-2.75 py-2 text-[15px] shadow-[inset_0_0_0_1px_var(--line-soft)]">
      <div className="from-gold via-gold-deep to-gold-dark -mx-2.75 -mt-2 mb-0.75 flex min-w-0 items-center gap-1.5 rounded-t-md bg-linear-90 from-0% via-55% to-100% px-2.75 py-1">
        <Select
          tone="strip"
          className="min-w-0 flex-1"
          value={slot?.summonId ?? ""}
          onChange={(v) => onChange(pickSummon(slot, v))}
        >
          <option className="text-ui" value="">
            -
          </option>
          {SUMMONS.map((s) => (
            <option className="text-ui" key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
      {slot && (
        <>
          <div className="flex min-w-0 items-center gap-1.5">
            <TraitSelect
              className="min-w-0 flex-1"
              value={slot.trait || null}
              pool={traits}
              onChange={(trait) => onChange({ ...slot, trait: trait ?? "" })}
            />
            <NumInput
              width="sm"
              className="ml-auto"
              value={slot.traitLevel}
              min={SUMMON_TRAIT_MIN_LEVEL}
              max={SUMMON_TRAIT_MAX_LEVEL}
              onChange={(traitLevel) => onChange({ ...slot, traitLevel })}
            />
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Select
              className="min-w-0 flex-1"
              value={equipBonus?.bonusType ?? ""}
              onChange={(v) =>
                onChange({
                  ...slot,
                  equipBonus: rerollEquipBonus(slot, slot.summonId, v || null),
                })
              }
            >
              <option value="">- equip bonus -</option>
              {BONUS_TYPES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
            {equipBonus && (
              <TierSelect
                className="ml-auto"
                value={equipBonus.value}
                tiers={tiers}
                format={(v) => bonusValueText(equipBonus.bonusType, v)}
                onChange={(value) =>
                  onChange({
                    ...slot,
                    equipBonus:
                      value === null ? null : { ...equipBonus, value },
                  })
                }
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Keeps what the new summon can still roll; drops what it cannot. */
function pickSummon(
  slot: SummonSlot | null,
  summonId: SummonId | "",
): SummonSlot | null {
  if (!summonId) return null;
  const trait = slot?.trait ?? "";
  return {
    summonId,
    trait: summonTraits(summonId).some((t) => t.id === trait) ? trait : "",
    traitLevel: slot?.traitLevel ?? SUMMON_TRAIT_MAX_LEVEL,
    equipBonus: rerollEquipBonus(
      slot,
      summonId,
      slot?.equipBonus?.bonusType ?? null,
    ),
  };
}

/**
 * Tier lists run parallel across bonus types and summons, so a roll keeps its
 * rank rather than being re-picked; a shorter list clamps to its top tier.
 */
function rerollEquipBonus(
  slot: SummonSlot | null,
  summonId: SummonId,
  bonusType: BonusTypeId | null,
): SummonSlot["equipBonus"] {
  if (!bonusType) return null;
  const tiers = summonEquipTiers(summonId, bonusType);
  if (tiers.length === 0) return null;
  const rank = slot?.equipBonus
    ? summonEquipTiers(slot.summonId, slot.equipBonus.bonusType).indexOf(
        slot.equipBonus.value,
      )
    : -1;
  const top = tiers.length - 1;
  return { bonusType, value: tiers[rank < 0 ? top : Math.min(rank, top)] };
}

function fitToRange(value: number, bonusType: BonusTypeId) {
  const top = bonusTypeById.get(bonusType)?.overMastery.at(-1);
  return top === undefined ? value : Math.min(value, top);
}
