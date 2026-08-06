import type { ReactNode } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { Build, TraitId } from "../domain/build";
import { WEAPON_LEVEL_MAX, WEAPON_TRAIT_ROWS } from "../domain/build";
import { resolveWeapon, weaponArtUrl, wrightstoneName } from "../data";
import { BaseStat, Heading } from "../ui";
import { LvlDisplay } from "./LvlDisplay";
import { StatDisplay, STAT_BOX_HEIGHT } from "./StatDisplay";
import { LvlWeapon } from "./LvlWeapon";
import { GearRow, TraitCell, ROW_LVL_CAP_HEIGHT } from "./gear-row";

const WEAPON_ART_HEIGHT = 186;

/** Added to each plate's icon offset, in px. */
const STAT_PLATE_ICON_INSET = 3;

/** Px gutter a weapon row holds open for its swap marker. */
const MARKER_GUTTER_WIDTH = 32;

/** Left pad for the stat bar and art box: marker gutter + edge pad. */
const ROW_INDENT = `calc(var(--spacing) * 2.5 + ${MARKER_GUTTER_WIDTH}px)`;

/** Cap height the stat figures scale from. */
const WEAPON_STAT_CAP_HEIGHT = 22;

/** Per-plate geometry. */
const WEAPON_STAT_PLATES = {
  hp: { iconOffset: 0.9, padRight: 1 },
  atk: { iconOffset: 0.9, padRight: 1 },
  crit: { iconOffset: 0.9, padRight: 1 },
  stun: { iconOffset: 0.9, padRight: 1 },
};

/** Plate icon scale, source px per cap px. */
const WEAPON_STAT_ICON_SCALE = 0.27 / 20;

/** Builds the BaseStat props for one stat plate, resolved against the cap. */
const statPlate = (stat: keyof typeof WEAPON_STAT_PLATES) => ({
  stat,
  iconOffset:
    WEAPON_STAT_PLATES[stat].iconOffset * WEAPON_STAT_CAP_HEIGHT +
    STAT_PLATE_ICON_INSET,
  padRight: WEAPON_STAT_PLATES[stat].padRight * WEAPON_STAT_CAP_HEIGHT,
  iconScale: WEAPON_STAT_ICON_SCALE * WEAPON_STAT_CAP_HEIGHT,
  noPadY: true,
  height: WEAPON_STAT_CAP_HEIGHT * STAT_BOX_HEIGHT,
});

/** One trait and one level: the weapon and imbued rows. */
function WeaponTraitRow({
  trait,
  level,
  marker,
}: {
  trait: TraitId | null;
  level: number | null;
  marker?: ReactNode;
}) {
  return (
    <GearRow cols={`${MARKER_GUTTER_WIDTH}px 1fr`}>
      <span className="flex items-center justify-end pr-1">{marker}</span>
      <TraitCell trait={trait} />
      {/* A trait's level, not a sigil's: the game labels the two differently. */}
      <LvlDisplay
        cap={ROW_LVL_CAP_HEIGHT}
        level={level}
        tone="gold"
        traitPrefix
      />
    </GearRow>
  );
}

export function WeaponSection({ build }: { build: Build }) {
  const weapon = build.weapon;
  const resolvedWeapon = weapon
    ? resolveWeapon(build.characterId, weapon)
    : null;
  const wrightstoneRows = [
    build.wrightstone?.main ?? null,
    build.wrightstone?.sub1 ?? null,
    build.wrightstone?.sub2 ?? null,
  ];

  return (
    <>
      <Heading size="lg" className="flex-none">
        Weapon
      </Heading>
      <div className="flex-none pb-3">
        <div className="flex items-baseline justify-center px-2.5 text-2xl font-bold">
          <span className={resolvedWeapon ? "" : "text-dim"}>
            {resolvedWeapon?.name ?? "No Weapon"}
          </span>
          {/* Hardcoded max bonus for now. */}
          {resolvedWeapon && (
            <span className="pl-1.5 font-normal text-[#ffff5f] [-webkit-text-stroke:4px_var(--ui)] [paint-order:stroke]">
              +99
            </span>
          )}
        </div>
        <div
          // No clip: the art is object-contained and the level's
          // descenders need to show past the bottom edge.
          className="relative mt-0.75 mb-1.25 flex items-center justify-center px-2.5"
          style={{ height: WEAPON_ART_HEIGHT, paddingLeft: ROW_INDENT }}
        >
          {resolvedWeapon && (
            <img
              src={weaponArtUrl(build.characterId, resolvedWeapon.name)}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          )}
          {resolvedWeapon && (
            // Overlaid on the art: series bottom-right; the fraction is dropped.
            <div
              className="absolute inset-x-0 bottom-1 flex items-end justify-end px-2.5"
              style={{ paddingLeft: ROW_INDENT }}
            >
              <span className="text-dim text-base whitespace-nowrap">
                {resolvedWeapon.seriesName}
              </span>
            </div>
          )}
        </div>
        <div
          className="mt-1.25 mb-2 flex items-baseline justify-between px-2.5 text-xl"
          style={{ paddingLeft: ROW_INDENT }}
        >
          <LvlWeapon cap={42} level={WEAPON_LEVEL_MAX} />
          <div className="flex items-baseline">
            <BaseStat {...statPlate("hp")}>
              <WeaponStat
                tone="hp"
                value={resolvedWeapon?.hp ?? null}
                reserve={5}
              />
            </BaseStat>
            <BaseStat {...statPlate("atk")}>
              <WeaponStat
                tone="atk"
                value={resolvedWeapon?.atk ?? null}
                reserve={5}
              />
            </BaseStat>
            <BaseStat {...statPlate("crit")}>
              <WeaponStat
                tone="ui"
                value={weapon?.critRate ?? null}
                unit="%"
                reserve={4}
              />
            </BaseStat>
            <BaseStat {...statPlate("stun")}>
              <WeaponStat tone="ui" value={weapon?.stun ?? null} reserve={4} />
            </BaseStat>
          </div>
        </div>
        {resolvedWeapon
          ? resolvedWeapon.slots.map((slot, i) => (
              <WeaponTraitRow
                trait={slot.trait}
                level={slot.level}
                key={i}
                marker={
                  slot.kind === "pool" && (
                    <ArrowLeftRight
                      className="text-ui flex-none"
                      size="0.95em"
                      strokeWidth={3}
                    />
                  )
                }
              />
            ))
          : Array.from({ length: WEAPON_TRAIT_ROWS }, (_, i) => (
              <WeaponTraitRow trait={null} level={null} key={i} />
            ))}
        <div className="font-med text-dim mt-3 flex justify-between px-2.5 tracking-[0.07em]">
          <span>Imbued Traits</span>
          <span>{wrightstoneName(build.wrightstone?.main.trait)}</span>
        </div>
        {wrightstoneRows.map((row, i) => (
          <WeaponTraitRow
            trait={row?.trait ?? null}
            level={row?.level ?? null}
            key={i}
          />
        ))}
      </div>
    </>
  );
}

function WeaponStat({
  tone,
  value,
  unit,
  reserve,
}: {
  tone: "hp" | "atk" | "ui";
  value: number | null;
  unit?: string;
  reserve: number;
}) {
  return (
    <span className="relative ml-auto inline-flex">
      <StatDisplay
        cap={WEAPON_STAT_CAP_HEIGHT}
        value={value}
        unit={unit}
        tone={tone}
        reserveDigits={reserve}
      />
      {value === null && (
        <span className="text-dim absolute inset-0 grid place-items-center text-2xl">
          -
        </span>
      )}
    </span>
  );
}
