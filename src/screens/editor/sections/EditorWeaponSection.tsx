import { ArrowLeftRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Build, TraitId } from "../../../domain/build";
import { WEAPON_LEVEL_MAX, WRIGHTSTONE_LEVELS } from "../../../domain/build";
import { resolveWeapon, weaponArtUrl, wrightstoneName } from "../../../data";
import { BaseStat, Heading, SectionPanel } from "../../../ui";
import { LvlDisplay } from "../../../card/LvlDisplay";
import { StatDisplay, STAT_BOX_HEIGHT } from "../../../card/StatDisplay";
import { LvlWeapon } from "../../../card/LvlWeapon";
import { GearRow, TraitCell, ROW_LVL_CAP_HEIGHT } from "../../../card/gear-row";

const WEAPON_ART_HEIGHT = 150;

const STAT_PLATE_ICON_INSET = 3;
const MARKER_GUTTER_WIDTH = 32;
const WEAPON_STAT_CAP_HEIGHT = 22;
const WEAPON_LVL_CAP_HEIGHT = WEAPON_STAT_CAP_HEIGHT * 1.8;
const WEAPON_WORD_RATIO = 0.45;
const WEAPON_STAT_ICON_SCALE = 0.27 / 20;

const statPlate = (stat: "hp" | "atk" | "crit" | "stun") => ({
  stat,
  iconOffset: 0.75 * WEAPON_STAT_CAP_HEIGHT + STAT_PLATE_ICON_INSET,
  padRight: WEAPON_STAT_CAP_HEIGHT,
  iconScale: WEAPON_STAT_ICON_SCALE * WEAPON_STAT_CAP_HEIGHT,
  noPadY: true,
  grow: false,
  height: WEAPON_STAT_CAP_HEIGHT * STAT_BOX_HEIGHT,
});

export function EditorWeaponSection({
  build,
  onOpenWeapon,
  onOpenWrightstone,
}: {
  build: Build;
  onOpenWeapon: (el: Element) => void;
  onOpenWrightstone: (el: Element) => void;
}) {
  const weapon = build.weapon;
  const resolved = resolveWeapon(build.characterId, weapon);
  const wrightstone = build.wrightstone;
  const rows = [wrightstone?.main, wrightstone?.sub1, wrightstone?.sub2];

  return (
    <SectionPanel shadow className="flex flex-col overflow-hidden">
      <div className="flex-none">
        <Heading size="lg">Weapon</Heading>
      </div>

      <div className="relative flex-none pt-1">
        <div className="flex items-baseline justify-center px-2.5 text-2xl font-bold">
          <span>{resolved.name}</span>
          <span className="pl-1.5 font-normal text-[#ffff5f] [-webkit-text-stroke:4px_var(--ui)] [paint-order:stroke]">
            +99
          </span>
        </div>

        <div
          className="relative mt-0.75 mb-1.25 flex items-center justify-center px-2.5"
          style={{ height: WEAPON_ART_HEIGHT }}
        >
          <img
            src={weaponArtUrl(build.characterId, resolved.name)}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
          <div className="absolute inset-x-0 bottom-1 flex items-end justify-end px-2.5">
            <span className="text-dim text-base whitespace-nowrap">
              {resolved.seriesName}
            </span>
          </div>
        </div>

        <div className="mr-2 mb-2 flex items-baseline pl-2.5 text-xl">
          <LvlWeapon
            cap={WEAPON_LVL_CAP_HEIGHT}
            level={WEAPON_LEVEL_MAX}
            wordRatio={WEAPON_WORD_RATIO}
          />
          <div className="flex flex-1 items-baseline justify-end gap-2">
            <BaseStat {...statPlate("hp")}>
              <WeaponStat tone="hp" value={resolved.hp} reserve={5} />
            </BaseStat>
            <BaseStat {...statPlate("atk")}>
              <WeaponStat tone="atk" value={resolved.atk} reserve={5} />
            </BaseStat>
            <BaseStat {...statPlate("crit")}>
              <WeaponStat
                tone="ui"
                value={weapon.critRate}
                unit="%"
                reserve={4}
              />
            </BaseStat>
            <BaseStat {...statPlate("stun")}>
              <WeaponStat tone="ui" value={weapon.stun} reserve={4} />
            </BaseStat>
          </div>
        </div>

        {resolved.slots.map((slot, i) => (
          <WeaponTraitRow
            key={i}
            trait={slot.trait}
            level={slot.level}
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
        ))}

        <button
          type="button"
          aria-label="Edit weapon"
          className="hover:bg-band/15 absolute inset-0 z-10 cursor-pointer rounded-md"
          onClick={(e) => onOpenWeapon(e.currentTarget)}
        />
      </div>

      <div className="relative flex-none pb-1">
        <div className="font-med text-dim mt-3 flex justify-between px-2.5 tracking-[0.07em]">
          <span>Imbued Traits</span>
          <span className={wrightstone ? "" : "text-dim/70"}>
            {wrightstoneName(wrightstone?.main.trait)}
          </span>
        </div>
        {rows.map((row, i) => (
          <WeaponTraitRow
            key={i}
            trait={row?.trait ?? null}
            level={row ? WRIGHTSTONE_LEVELS[i] : null}
          />
        ))}
        <button
          type="button"
          aria-label="Edit imbued traits"
          className="hover:bg-band/15 absolute inset-0 z-10 cursor-pointer rounded-md"
          onClick={(e) => onOpenWrightstone(e.currentTarget)}
        />
      </div>
    </SectionPanel>
  );
}

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
      <LvlDisplay
        cap={ROW_LVL_CAP_HEIGHT}
        level={level}
        tone="gold"
        className="-translate-y-0.5"
        traitPrefix
      />
    </GearRow>
  );
}

function WeaponStat({
  tone,
  value,
  unit,
  reserve,
}: {
  tone: "plain" | "hp" | "atk" | "ui";
  value: number;
  unit?: string;
  reserve: number;
}) {
  return (
    <StatDisplay
      cap={WEAPON_STAT_CAP_HEIGHT}
      value={value}
      unit={unit}
      tone={tone}
      reserveDigits={reserve}
    />
  );
}
