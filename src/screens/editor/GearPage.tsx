import type {
  SigilSlot,
  TraitId,
  Weapon,
  Wrightstone,
} from "../../domain/build";
import { WEAPON_LEVEL } from "../../domain/build";
import {
  TRAITS,
  traitById,
  traitName,
  WEAPONS,
  weaponById,
  wrightstoneName,
} from "../../data";
import { IdentityCol } from "./IdentityCol";
import { NumInput, TraitSelect, type PageProps } from "./controls";

// Levels are fixed by the wrightstone, not entered: main / sub1 / sub2.
const WRIGHTSTONE_LEVEL_SETS = [
  [20, 15, 10],
  [15, 10, 7],
];

const SIGIL_MAX_LEVEL = 20;

type WrightstoneRow = Wrightstone["main"];

/** Figure-space pad so single-digit trait levels stay column-aligned. */
const padLevel = (level: number) => String(level).padStart(2, " ");

export function GearPage({ build, onChange }: PageProps) {
  return (
    <div className="page pGear">
      <IdentityCol build={build} onChange={onChange} />
      <div className="col">
        <h3>Weapon</h3>
        <WeaponPanel build={build} onChange={onChange} />
        <h3>Sigils</h3>
        <div className="sigilStack">
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
    <div className="wpanel">
      <div className="wrow">
        <select
          className="sel wname grow"
          value={weapon?.weaponId ?? ""}
          onChange={(e) => {
            const weaponId = e.target.value;
            setWeapon(
              weaponId
                ? { weaponId, critRate: 0, stun: 0, rotatedTrait: null }
                : null,
            );
          }}
        >
          <option value="">- weapon -</option>
          {WEAPONS.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        {weaponDef && (
          <span className="dim wmeta">
            {weaponDef.series} · Lv.{WEAPON_LEVEL}
          </span>
        )}
      </div>
      {weaponDef && weapon && (
        <>
          <div className="wimg" />
          <div className="wbase">
            <span className="s-hp">
              <span className="sIcon" />
              <span className="val">{weaponDef.defaultHp}</span>
            </span>
            <span className="s-atk">
              <span className="sIcon" />
              <span className="val">{weaponDef.defaultAtk}</span>
            </span>
            <span className="s-crit">
              <span className="sIcon" />
              <NumInput
                value={weapon.critRate}
                max={100}
                onChange={(critRate) => setWeapon({ ...weapon, critRate })}
              />
            </span>
            <span className="s-stun">
              <span className="sIcon" />
              <NumInput
                value={weapon.stun}
                onChange={(stun) => setWeapon({ ...weapon, stun })}
              />
            </span>
          </div>
          {weaponDef.rows.map((row, i) => (
            <div className="trow" key={i}>
              <span className="icon sm" />
              {row.options ? (
                <span className="rotatable">
                  <TraitSelect
                    className="grow"
                    value={weapon.rotatedTrait}
                    pool={traitPool(row.options)}
                    onChange={(rotatedTrait) =>
                      setWeapon({ ...weapon, rotatedTrait })
                    }
                  />
                  <span className="swap">⇄</span>
                </span>
              ) : (
                <span>{traitName(row.trait)}</span>
              )}
              <span className="lvl">T.Lvl {padLevel(row.level)}</span>
            </div>
          ))}
        </>
      )}
      <WrightstonePanel build={build} onChange={onChange} />
    </div>
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
      <div className="imh">
        <span>Imbued Traits</span>
        <select
          className="sel"
          value={levels[0]}
          onChange={(e) =>
            setLevels(
              WRIGHTSTONE_LEVEL_SETS.find(
                (set) => set[0] === Number(e.target.value),
              ) ?? WRIGHTSTONE_LEVEL_SETS[0],
            )
          }
        >
          {WRIGHTSTONE_LEVEL_SETS.map((set) => (
            <option key={set[0]} value={set[0]}>
              {set.join(" / ")}
            </option>
          ))}
        </select>
        <span className="wsname">
          {wrightstoneName(wrightstone?.main.trait)}
        </span>
      </div>
      {rows.map((row, i) => (
        <div className="trow" key={i}>
          <span className="icon sm" />
          <TraitSelect
            value={row?.trait ?? null}
            pool={TRAITS}
            onChange={(trait) => setWrightstoneRow(i, trait)}
          />
          <span className="lvl">
            {row ? `T.Lvl ${padLevel(levels[i])}` : ""}
          </span>
        </div>
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
    <div className="sigil">
      <div className="cell">
        <span className="icon" />
        <TraitSelect
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
      <div className="cell">
        <span className="icon sm" />
        {slot ? (
          <TraitSelect
            value={slot.secondaryTrait}
            pool={TRAITS}
            onChange={(secondaryTrait) => onChange({ ...slot, secondaryTrait })}
          />
        ) : (
          <span className="dim">-</span>
        )}
      </div>
      {slot ? (
        <NumInput
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
