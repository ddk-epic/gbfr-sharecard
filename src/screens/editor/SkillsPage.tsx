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
import { NumInput, TierSelect, TraitSelect, type PageProps } from "./controls";

// Summon main traits only roll Lv 11-15.
const SUMMON_TRAIT_MIN_LEVEL = 11;
const SUMMON_TRAIT_MAX_LEVEL = 15;

const setAt = <T,>(slots: (T | null)[], index: number, value: T | null) =>
  slots.map((slot, i) => (i === index ? value : slot));

export function SkillsPage({ build, onChange }: PageProps) {
  const catalog = characterCatalog(build.characterId);
  return (
    <div className="page">
      <IdentityCol build={build} onChange={onChange} />
      <div className="col">
        <h3>Skills</h3>
        <div className="wpanel">
          <div className="skillStack">
            {build.skills.map((skill, i) => (
              <div className="skillRow" key={i}>
                <span className="orb" />
                <select
                  className="sel"
                  value={skill ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...build,
                      skills: setAt(build.skills, i, e.target.value || null),
                    })
                  }
                >
                  <option value="">-</option>
                  {catalog.skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <span className="diamond" />
              </div>
            ))}
          </div>
        </div>
        <h3>Over Mastery</h3>
        <div className="wpanel">
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
        </div>
        <h3>Summons</h3>
        <div className="sStack">
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
  const range = line ? bonusTypeById.get(line.bonusType)?.overMastery : null;
  return (
    <div className="kvline">
      <select
        className="sel grow"
        value={line?.bonusType ?? ""}
        onChange={(e) => {
          const bonusType = e.target.value;
          onChange(
            bonusType
              ? { bonusType, value: fitToRange(line?.value ?? 0, bonusType) }
              : null,
          );
        }}
      >
        <option value="">-</option>
        {BONUS_TYPES.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      {line && (
        <NumInput
          value={line.value}
          max={range?.max ?? 9999}
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
    <div className="summonCard">
      <div className="r strip">
        <span className="icon sm" />
        <select
          className="sel grow"
          value={slot?.summonId ?? ""}
          onChange={(e) => onChange(pickSummon(slot, e.target.value))}
        >
          <option value="">-</option>
          {SUMMONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      {slot && (
        <>
          <div className="r">
            <TraitSelect
              className="grow"
              value={slot.trait || null}
              pool={traits}
              onChange={(trait) => onChange({ ...slot, trait: trait ?? "" })}
            />
            <NumInput
              className="w4"
              value={slot.traitLevel}
              min={SUMMON_TRAIT_MIN_LEVEL}
              max={SUMMON_TRAIT_MAX_LEVEL}
              onChange={(traitLevel) => onChange({ ...slot, traitLevel })}
            />
          </div>
          <div className="r">
            <select
              className="sel grow"
              value={equipBonus?.bonusType ?? ""}
              onChange={(e) =>
                onChange({
                  ...slot,
                  equipBonus: rerollEquipBonus(
                    slot,
                    slot.summonId,
                    e.target.value || null,
                  ),
                })
              }
            >
              <option value="">- equip bonus -</option>
              {BONUS_TYPES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {equipBonus && (
              <TierSelect
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
  const range = bonusTypeById.get(bonusType)?.overMastery;
  return range ? Math.min(value, range.max) : value;
}
