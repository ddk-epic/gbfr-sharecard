import type { CSSProperties, ReactNode } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { Build } from "@/domain/build";
import type { TraitId } from "@/catalog/ids";
import { WEAPON_LEVEL_MAX } from "@/domain/build";
import { weaponArtUrl } from "@/assets/urls";
import { resolveWeapon } from "@/domain/weapons";
import { wrightstoneName } from "@/domain/wrightstone";
import { BaseStat } from "@/components/build/StatIcon";
import { EditOverlay, Heading } from "@/components/ui";
import { LvlDisplay } from "./LvlDisplay";
import { StatDisplay, STAT_BOX_HEIGHT } from "./StatDisplay";
import { LvlWeapon } from "./LvlWeapon";
import { GearRow, TraitCell, ROW_LVL_CAP_HEIGHT } from "./gear-row";

type Density = "compact" | "loose";

/** Px gutter a weapon row holds open for its swap marker. */
const MARKER_GUTTER_WIDTH = 32;

/** Left pad the card needs to align the art/stats/heading with the rows
    below, whose own grid already reserves the marker gutter. The editor's
    SectionPanel padding makes this unnecessary. */
const ROW_INDENT = `calc(var(--spacing) * 2.5 + ${MARKER_GUTTER_WIDTH}px)`;

/** Zero on every weapon of every series. */
const WEAPON_CRIT = 0;
const WEAPON_STUN = 0;

const WEAPON_STAT_CAP_HEIGHT = 21;

/** The weapon "Lvl"'s ink height, x the level's cap. By eye. */
const WEAPON_WORD_RATIO = 0.45;
/** The weapon "Lvl"'s independent cap, px. */
const WEAPON_WORD_CAP_HEIGHT = 21;

/** The number's cap, following the word up at the word ratio. */
const WEAPON_LVL_CAP_HEIGHT = WEAPON_WORD_CAP_HEIGHT / WEAPON_WORD_RATIO;
/** Added to each plate's icon offset, in px. */
const STAT_PLATE_ICON_INSET = 3;
/** Plate icon scale, source px per cap px. */
const WEAPON_STAT_ICON_SCALE = 0.27 / 20;

const WEAPON_LAYOUT: Record<
  Density,
  {
    artHeight: number;
    padStyle: CSSProperties;
    headingClass: string;
    statRowClass: string;
    contentClass: string;
  }
> = {
  compact: {
    artHeight: 186,
    padStyle: { paddingLeft: ROW_INDENT },
    // Owns the gap to its own body, since the card stacks the pair flush.
    headingClass: "flex-none mb-3.75",
    statRowClass: "",
    contentClass: "flex-none",
  },
  loose: {
    artHeight: 150,
    padStyle: {},
    headingClass: "flex-none",
    statRowClass: "pl-2.5",
    contentClass: "relative flex-none pt-1",
  },
};

const WRIGHTSTONE_LAYOUT: Record<
  Density,
  { wrapClass: string; dimEmpty: boolean }
> = {
  compact: { wrapClass: "flex-none pb-3", dimEmpty: false },
  loose: { wrapClass: "relative flex-none pb-1", dimEmpty: true },
};

/** Builds the BaseStat props for one stat plate, resolved against the cap. */
const statPlate = (stat: "hp" | "atk" | "crit" | "stun") => ({
  stat,
  iconOffset: 0.75 * WEAPON_STAT_CAP_HEIGHT + STAT_PLATE_ICON_INSET,
  padRight: WEAPON_STAT_CAP_HEIGHT,
  iconScale: WEAPON_STAT_ICON_SCALE * WEAPON_STAT_CAP_HEIGHT,
  noPadY: true,
  // Sized to its reserve, so a 5-digit plate is wider than a 4-digit one.
  grow: false,
  height: WEAPON_STAT_CAP_HEIGHT * STAT_BOX_HEIGHT,
});

/** One trait and one level - shared leaf for both weapon slots and
    wrightstone rows. */
function WeaponTraitRow({
  trait,
  level,
  marker,
  cell,
}: {
  trait: TraitId | null;
  level: number | null;
  marker?: ReactNode;
  /** Stands in for the plain trait cell, e.g. an editable one. */
  cell?: ReactNode;
}) {
  return (
    <GearRow cols={`${MARKER_GUTTER_WIDTH}px 1fr`}>
      <span className="flex items-center justify-end pr-1">{marker}</span>
      {cell ?? <TraitCell trait={trait} />}
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

export function Weapon({
  build,
  density = "compact",
  onOpen,
}: {
  build: Build;
  density?: Density;
  onOpen?: (el: Element) => void;
}) {
  const layout = WEAPON_LAYOUT[density];
  const weapon = build.weapon;
  const resolved = resolveWeapon(build.characterId, weapon, build.masterLevel);

  return (
    <>
      <div className={layout.headingClass} style={layout.padStyle}>
        <Heading size="lg">Weapon</Heading>
      </div>
      <div className={layout.contentClass}>
        <div className="flex items-baseline justify-center px-2.5 text-2xl font-bold">
          <span>{resolved.name}</span>
          {/* Hardcoded max bonus for now. */}
          <span className="pl-1.5 font-normal text-[#ffff5f] [-webkit-text-stroke:4px_var(--ui)] [paint-order:stroke]">
            +99
          </span>
        </div>
        <div
          className="relative mt-0.75 mb-1.25 flex items-center justify-center px-2.5"
          style={{ height: layout.artHeight, ...layout.padStyle }}
        >
          <img
            src={weaponArtUrl(build.characterId, resolved.name)}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
          {/* Series at the bottom-right. */}
          <div
            className="absolute inset-x-0 bottom-1 flex items-end justify-end px-2.5"
            style={layout.padStyle}
          >
            <span className="text-dim text-base whitespace-nowrap">
              {resolved.seriesName}
            </span>
          </div>
        </div>
        <div
          className={`mr-2 mb-2 flex items-baseline text-xl ${layout.statRowClass}`}
          style={layout.padStyle}
        >
          <LvlWeapon
            cap={WEAPON_LVL_CAP_HEIGHT}
            level={WEAPON_LEVEL_MAX}
            wordRatio={WEAPON_WORD_RATIO}
            // 3px uplift to be on the same y as the weapon stats
            className="-translate-y-0.75"
          />
          <div className="flex flex-1 items-baseline justify-end gap-2">
            <BaseStat {...statPlate("hp")}>
              <WeaponStat tone="hp" value={resolved.hp} reserve={5} />
            </BaseStat>
            <BaseStat {...statPlate("atk")}>
              <WeaponStat tone="atk" value={resolved.atk} reserve={5} />
            </BaseStat>
            <BaseStat {...statPlate("crit")}>
              <WeaponStat tone="ui" value={WEAPON_CRIT} unit="%" reserve={4} />
            </BaseStat>
            <BaseStat {...statPlate("stun")}>
              <WeaponStat tone="ui" value={WEAPON_STUN} reserve={4} />
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
        {onOpen && (
          <EditOverlay label="Edit weapon" radius="md" onOpen={onOpen} />
        )}
      </div>
    </>
  );
}

export function Wrightstone({
  build,
  density = "compact",
  renderEmpty,
  renderSub,
  onOpen,
}: {
  build: Build;
  density?: Density;
  /** Covers the trait rows only, so the heading stays readable. */
  renderEmpty?: () => ReactNode;
  /** Replaces a sub row's trait cell, e.g. with an editable one. */
  renderSub?: (slot: 1 | 2, trait: TraitId | null) => ReactNode;
  onOpen?: (el: Element) => void;
}) {
  const layout = WRIGHTSTONE_LAYOUT[density];
  const wrightstone = build.wrightstone;
  const subs = [wrightstone?.sub1, wrightstone?.sub2];

  return (
    <div className={layout.wrapClass}>
      {/* "relative z-1" lifts the title div so descenders can bleed past the line box, 
          otherwise the placeholder will paint over them. */}
      <div
        className={`font-med text-dim relative z-1 mt-3 flex justify-between px-2.5 tracking-[0.07em] ${layout.dimEmpty && !wrightstone ? "text-dim/70" : ""}`}
      >
        <span>Imbued Traits</span>
        <span>{wrightstoneName(wrightstone?.main.trait)}</span>
      </div>
      <div className="relative">
        <WeaponTraitRow
          trait={wrightstone?.main.trait ?? null}
          level={wrightstone?.main.level ?? null}
        />
        {subs.map((row, i) => {
          const trait = row?.trait ?? null;
          const slot = (i + 1) as 1 | 2;
          return (
            <WeaponTraitRow
              key={slot}
              trait={trait}
              level={row?.level ?? null}
              cell={renderSub?.(slot, trait)}
            />
          );
        })}
        {!wrightstone && renderEmpty?.()}
      </div>
      {onOpen && (
        <EditOverlay label="Edit imbued traits" radius="md" onOpen={onOpen} />
      )}
    </div>
  );
}
