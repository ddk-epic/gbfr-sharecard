import { ArrowLeftRight } from "lucide-react";
import type {
  SigilSlot,
  TraitId,
  Weapon,
  Wrightstone,
} from "../../domain/build";
import { WEAPON_LEVEL, WEAPON_TRAIT_ROWS } from "../../domain/build";
import {
  TRAITS,
  traitById,
  traitName,
  WEAPONS,
  weaponById,
  wrightstoneName,
} from "../../data";
import { IdentityCol } from "./IdentityCol";
import { NumInput, Select, TraitSelect, type PageProps } from "./controls";
import { BaseStat, Heading, Icon, Lvl, TraitRow, Wpanel } from "../../ui";

// Levels are fixed by the wrightstone, not entered: main / sub1 / sub2.
const WRIGHTSTONE_LEVEL_SETS = [
  [20, 15, 10],
  [15, 10, 7],
];

const SIGIL_MAX_LEVEL = 20;

const IMH =
  "text-dim flex items-center justify-between gap-2 text-[12px] tracking-[0.07em] uppercase";
const VAL = "ml-auto w-15.5 text-right text-[14px]";

type WrightstoneRow = Wrightstone["main"];

/** Figure-space pad so single-digit trait levels stay column-aligned. */
const padLevel = (level: number | string) => String(level).padStart(2, " ");

/** Placeholder line keeping the panel's shape when a slot is unfilled. */
function EmptyTraitRow() {
  return (
    <TraitRow>
      <Icon sm />
      <span className="text-dim">-</span>
      <span className="text-dim">T.Lvl {padLevel("-")}</span>
    </TraitRow>
  );
}

export function GearPage({ build, onChange }: PageProps) {
  return (
    <div className="grid h-full grid-cols-[1fr_1.3fr] gap-3.5 overflow-hidden px-4 py-3.5">
      <IdentityCol build={build} onChange={onChange} />
      <div className="flex min-w-0 flex-col gap-3.5">
        <Heading>Weapon</Heading>
        <WeaponPanel build={build} onChange={onChange} />
        <Heading>Sigils</Heading>
        <div className="flex flex-col gap-0.5">
          {build.sigils.map((slot, i) => (
            <SigilRow
              key={i}
              slot={slot}
              onChange={(next) =>
                onChange({
                  ...build,
                  sigils: build.sigils.map((x, j) => (j === i ? next : x)),
                })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WeaponPanel({ build, onChange }: PageProps) {
  const weapon = build.weapon;
  const weaponDef = weapon ? weaponById.get(weapon.weaponId) : undefined;
  const setWeapon = (next: Weapon | null) =>
    onChange({ ...build, weapon: next });

  return (
    <Wpanel fill>
      <div className="flex items-baseline gap-2">
        <Select
          className="flex-1 text-[17px] font-bold"
          value={weapon?.weaponId ?? ""}
          onChange={(weaponId) =>
            setWeapon(
              weaponId
                ? { weaponId, critRate: 0, stun: 0, rotatedTrait: null }
                : null,
            )
          }
        >
          <option value="">- weapon -</option>
          {WEAPONS.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </Select>
        <span className="text-dim text-[12px] whitespace-nowrap">
          {weaponDef?.series ?? "-"} · Lv.{WEAPON_LEVEL}
        </span>
      </div>
      {/* placeholder until per-weapon art exists */}
      <div className="pointer-events-none my-1 min-h-15.5 flex-1 rounded-md bg-linear-115 from-[rgba(106,147,181,0.28)] to-[rgba(106,147,181,0.05)]" />
      <div className="mt-1 mb-1.5 flex items-baseline gap-1 text-[12.5px]">
        <BaseStat>
          <Lvl tone={weaponDef ? "value" : "dim"} className={VAL}>
            {weaponDef?.defaultHp ?? "-"}
          </Lvl>
        </BaseStat>
        <BaseStat>
          <Lvl tone={weaponDef ? "value" : "dim"} className={VAL}>
            {weaponDef?.defaultAtk ?? "-"}
          </Lvl>
        </BaseStat>
        <BaseStat>
          {weapon ? (
            <NumInput
              width="wbase"
              className="text-value ml-auto text-[14px] font-semibold"
              value={weapon.critRate}
              max={100}
              onChange={(critRate) => setWeapon({ ...weapon, critRate })}
            />
          ) : (
            <Lvl tone="dim" className={VAL}>
              -
            </Lvl>
          )}
        </BaseStat>
        <BaseStat>
          {weapon ? (
            <NumInput
              width="wbase"
              className="text-value ml-auto text-[14px] font-semibold"
              value={weapon.stun}
              onChange={(stun) => setWeapon({ ...weapon, stun })}
            />
          ) : (
            <Lvl tone="dim" className={VAL}>
              -
            </Lvl>
          )}
        </BaseStat>
      </div>
      {weaponDef && weapon
        ? weaponDef.rows.map((row, i) => (
            <TraitRow key={i}>
              <Icon sm />
              {row.options ? (
                <span className="flex min-w-0 items-center gap-1.5">
                  <TraitSelect
                    className="min-w-0 flex-1"
                    value={weapon.rotatedTrait}
                    pool={traitPool(row.options)}
                    onChange={(rotatedTrait) =>
                      setWeapon({ ...weapon, rotatedTrait })
                    }
                  />
                  <ArrowLeftRight
                    className="text-essence align-[-0.12em]"
                    size="1em"
                  />
                </span>
              ) : (
                <span>{traitName(row.trait)}</span>
              )}
              <Lvl>T.Lvl {padLevel(row.level)}</Lvl>
            </TraitRow>
          ))
        : Array.from({ length: WEAPON_TRAIT_ROWS }, (_, i) => (
            <EmptyTraitRow key={i} />
          ))}
      <WrightstonePanel build={build} onChange={onChange} />
    </Wpanel>
  );
}

/** The wrightstone renders as the weapon's "Imbued Traits". */
function WrightstonePanel({ build, onChange }: PageProps) {
  const wrightstone = build.wrightstone;
  const rows = [
    wrightstone?.main ?? null,
    wrightstone?.sub1 ?? null,
    wrightstone?.sub2 ?? null,
  ];
  const levels =
    WRIGHTSTONE_LEVEL_SETS.find((set) => set[0] === wrightstone?.main.level) ??
    WRIGHTSTONE_LEVEL_SETS[0];

  const setWrightstone = (next: Wrightstone | null) =>
    onChange({ ...build, wrightstone: next });

  // Level follows the slot, so a promoted row takes its new slot's level.
  const applyLevels = (
    ordered: (WrightstoneRow | null)[],
    set: number[],
  ): Wrightstone | null => {
    const [main, sub1, sub2] = ordered.map((row, i) =>
      row ? { trait: row.trait, level: set[i] } : null,
    );
    return main ? { main, sub1, sub2 } : null;
  };

  // The main slot is required, so a cleared main promotes the first sub.
  const collapse = (ordered: (WrightstoneRow | null)[], set: number[]) => {
    if (ordered[0]) return applyLevels(ordered, set);
    if (ordered[1]) return applyLevels([ordered[1], ordered[2], null], set);
    return applyLevels([ordered[2], null, null], set);
  };

  const setWrightstoneRow = (index: number, trait: TraitId | null) =>
    setWrightstone(
      collapse(
        rows.map((row, i) =>
          i === index ? (trait ? { trait, level: levels[i] } : null) : row,
        ),
        levels,
      ),
    );

  const setLevels = (set: number[]) => setWrightstone(collapse(rows, set));

  return (
    <>
      <div className={`${IMH} mt-3 mb-0.5`}>
        <span>Imbued Traits</span>
        <Select
          className="ml-auto text-[11.5px] tracking-normal"
          value={levels[0]}
          onChange={(v) =>
            setLevels(
              WRIGHTSTONE_LEVEL_SETS.find((set) => set[0] === Number(v)) ??
                WRIGHTSTONE_LEVEL_SETS[0],
            )
          }
        >
          {WRIGHTSTONE_LEVEL_SETS.map((set) => (
            <option key={set[0]} value={set[0]}>
              {set.join(" / ")}
            </option>
          ))}
        </Select>
        <span className="flex items-center gap-1.5 tracking-normal normal-case">
          {wrightstoneName(wrightstone?.main.trait)}
        </span>
      </div>
      {rows.map((row, i) => (
        <TraitRow key={i}>
          <Icon sm />
          <TraitSelect
            value={row?.trait ?? null}
            pool={TRAITS}
            onChange={(trait) => setWrightstoneRow(i, trait)}
          />
          <Lvl>{row ? `T.Lvl ${padLevel(levels[i])}` : ""}</Lvl>
        </TraitRow>
      ))}
    </>
  );
}

function SigilRow({
  slot,
  onChange,
}: {
  slot: SigilSlot | null;
  onChange: (next: SigilSlot | null) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr_52px] items-center gap-1.75 rounded-[5px] bg-white/85 px-2 py-1 text-[14.5px] shadow-[inset_0_0_0_1px_var(--line-soft)]">
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon />
        <TraitSelect
          className="min-w-0 flex-1 text-[13.5px]"
          value={slot?.primaryTrait ?? null}
          pool={TRAITS}
          onChange={(primaryTrait) =>
            onChange(
              primaryTrait
                ? {
                    primaryTrait,
                    secondaryTrait: slot?.secondaryTrait ?? null,
                    level: slot?.level ?? 15,
                  }
                : null,
            )
          }
        />
      </div>
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon sm />
        {slot ? (
          <TraitSelect
            className="min-w-0 flex-1 text-[13.5px]"
            value={slot.secondaryTrait}
            pool={TRAITS}
            onChange={(secondaryTrait) => onChange({ ...slot, secondaryTrait })}
          />
        ) : (
          <span className="text-dim">-</span>
        )}
      </div>
      {slot ? (
        <NumInput
          width="full"
          className="text-[13.5px]"
          value={slot.level}
          max={SIGIL_MAX_LEVEL}
          onChange={(level) => onChange({ ...slot, level })}
        />
      ) : (
        <span />
      )}
    </div>
  );
}

const traitPool = (ids: TraitId[]) =>
  ids.map((id) => traitById.get(id)).filter((trait) => trait !== undefined);
