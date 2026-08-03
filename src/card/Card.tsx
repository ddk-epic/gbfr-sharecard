import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { ArrowLeftRight } from "lucide-react";
import type {
  Build,
  SigilSlot,
  StyleId,
  StyleRank,
  TraitId,
} from "../domain/build";
import {
  CHARACTER_LEVEL,
  RANKS,
  STYLES,
  WEAPON_LEVEL_MAX,
  WEAPON_TRAIT_ROWS,
} from "../domain/build";
import { STYLE_RANK_BUDGETS, stylePerkStates } from "../domain/derive";
import { PERK_THRESHOLDS } from "../domain/catalog";
import {
  bonusTypeById,
  bonusValueText,
  characterById,
  characterCatalog,
  summonById,
  traitName,
  resolveWeapon,
  weaponArtUrl,
  wrightstoneName,
} from "../data";
import { nameTracking } from "./name-tracking";
import { SkillsSection } from "./SkillsSection";
import { Portrait } from "./Portrait";
import { LvlBadge } from "./LvlBadge";
import { LvlDisplay } from "./LvlDisplay";
import { LvlWeapon } from "./LvlWeapon";
import {
  CARD_H,
  CARD_LAYOUT,
  CARD_W,
  gridColumns,
  soft,
  softFloor,
  type CardLayout,
  type SoftPart,
} from "./layout";
import { StatusPanel } from "./StatusPanel";
import {
  BackdropFrame,
  BaseStat,
  Heading,
  Icon,
  Lvl,
  Orb,
  ParchmentBackdrop,
  TraitIcon,
  traitIconBox,
  Wpanel,
} from "../ui";

const STYLE_BORDER: Record<StyleId, string> = {
  insight: "border-t-insight",
  essence: "border-t-essence",
  crux: "border-t-crux",
};

// Universal style word; masterTraits[style].title holds the per-character half.
const STYLE_LABEL: Record<StyleId, string> = {
  insight: "Insight",
  essence: "Essence",
  crux: "Crux",
};

const STYLE_RANK_LABELS: Record<StyleRank, string> = {
  r1: "Style Rank 1",
  r2: "Style Rank 2",
  r3: "Style Rank 3",
  ex: "Style Rank EX",
};

/** Weapon stat plate Icon inset */
const STAT_PLATE_ICON_INSET = 3;

const SECTION =
  "rounded-lg bg-white/90 px-4.75 py-4 shadow-[0_1px_8px_rgba(23,60,90,0.12)] backdrop-blur-[3px]";

// The Skills card runs tighter side padding than SECTION to buy the 2x2 names
// more width.
const SKILLS_SECTION = SECTION.replace("px-4.75", "px-2.5");

const PLATE =
  "rounded-[7px] bg-white/85 shadow-[inset_0_0_0_1px_var(--line-soft)]";

const CELL = "flex min-w-0 items-center gap-1.25";

const CLIP = "overflow-hidden text-ellipsis whitespace-nowrap";

/** Height comes from layout.cellH; the rest is the cell's own hand-tuning. */
const OPT =
  "flex items-center gap-2 overflow-hidden rounded-sm px-2.25 py-1 text-lg leading-[1.12] data-long:gap-1.25 data-long:px-1.75 data-long:py-0.75 data-long:text-base data-long:leading-[1.06]";

/**
 * What the layout is costing the content, counted on every render. `artPx` is
 * the art box's *rendered* height rather than its requested one - the two differ
 * when something upstream is quietly resizing it.
 */
export type Strain = {
  clipped: number;
  shrunk: number;
  overflow: number;
  artPx: number;
};

const STRAIN_CLIP = "1px solid #ef4444";
const STRAIN_LONG = "1px solid #f59e0b";

/**
 * One piece of the master traits' soft spacing, as a flex item rather than a
 * gap or a margin - neither of those can shrink. `h` is what the slack slider
 * asks for; flexbox may take it down to the part's floor when the band grows,
 * and no further. That is the squish.
 */
function Soft({ h, part }: { h: number; part: SoftPart }) {
  return (
    <div
      aria-hidden
      className="shrink"
      style={{ height: h, minHeight: softFloor(part), flexBasis: h }}
    />
  );
}

/* A gear row: glyph, name, level, separated by hairline rules, not plates.
   Sigils carry two glyph+name columns sharing one level; weapon and imbued rows
   carry one. Names are set at the glyph's size, so each reads as one line. */

/* Sized within the name's line box so the glyph doesn't drive row height. */
const ROW_ICON = 22;

/**
 * The marker gutter, px - a trait glyph's width, the marker at its trailing
 * edge. Held open on every trait row, marked or not, so the glyphs share an x.
 */
const ROW_MARKER = 32;

/** Left indent shared by the stat bar and the art box: marker gutter + edge pad. */
const BAR_INDENT = `calc(var(--spacing) * 2.5 + ${ROW_MARKER}px)`;

/** Matches the glyph box, so name and icon carry the same weight in the row. */
const ROW_TEXT = "text-2xl font-med text-ui";

/** Cap height, not the ink box. */
const ROW_LVL_CAP = 22;

/**
 * The base stats, calibrated plate by plate against tmp/gear-select.png.
 * Everything below is stated x cap, so the band scales from this one number.
 * It happens to match the trait rows' figures; the two are set independently.
 */
const WEAPON_STAT_CAP = 22;

/** How the game sets a stat figure, against how it sets a level. */
const WEAPON_STAT_SET = {
  boxH: 1.35,
  nudge: 0.06,
  track: -0.09,
  outline: 1.5,
  // The plate's bar is the one that shows: the figure's box hugs its ink and
  // the plate's padRight is the whole indent.
  pad: 0,
};

/**
 * Each plate, x cap: the icon's centre in from the bar's foot, and the figure's
 * ink in from the plate's right edge.
 */
const WEAPON_STAT_PLATES = {
  hp: { slot: 0.9, padRight: 1 },
  atk: { slot: 0.9, padRight: 1 },
  crit: { slot: 0.9, padRight: 1 },
  stun: { slot: 0.9, padRight: 1 },
};

/** Source px per cap px. */
const WEAPON_STAT_ICON = 0.27 / 20;

/** One plate's props, with everything stated x cap resolved against it. */
const statPlate = (stat: keyof typeof WEAPON_STAT_PLATES) => ({
  stat,
  // Flat px on top of the calibrated slot, so it holds as the cap changes.
  slot: WEAPON_STAT_PLATES[stat].slot * WEAPON_STAT_CAP + STAT_PLATE_ICON_INSET,
  padRight: WEAPON_STAT_PLATES[stat].padRight * WEAPON_STAT_CAP,
  iconScale: WEAPON_STAT_ICON * WEAPON_STAT_CAP,
  flush: true,
});

/** Sigil primary and secondary, weapon slot, imbued row: all one cell. */
function TraitCell({ trait }: { trait: TraitId | null }) {
  const name = trait ? traitName(trait) : "-";
  return (
    <div className={CELL}>
      {trait ? (
        <TraitIcon trait={trait} size={ROW_ICON} />
      ) : (
        /* Spacer, not a dash: holds the glyph's width so the dash indents like a name. */
        <span aria-hidden className={`flex-none ${traitIconBox(ROW_ICON)}`} />
      )}
      {/* Not clipped: short names and tracking do the fitting, so an overflow shows rather than trims. */}
      <span style={{ letterSpacing: nameTracking(name) }}>{name}</span>
    </div>
  );
}

/** `cols` is the name columns' track; the level always trails in an auto one. */
function GearRow({
  children,
  cols = "1fr",
}: {
  children: ReactNode;
  cols?: string;
}) {
  return (
    <div
      className={`border-line grid items-center border-b-2 px-2.5 py-1 ${ROW_TEXT}`}
      style={{ gridTemplateColumns: `${cols} auto` }}
    >
      {children}
    </div>
  );
}

/**
 * One trait and one level: the weapon and imbued rows. They lead with the
 * marker gutter; sigils are their own list and do not carry it.
 */
function GearTraitRow({
  trait,
  level,
  marker,
}: {
  trait: TraitId | null;
  level: number | null;
  marker?: ReactNode;
}) {
  return (
    <GearRow cols={`${ROW_MARKER}px 1fr`}>
      <span className="flex items-center justify-end pr-1">{marker}</span>
      <TraitCell trait={trait} />
      {/* A trait's level, not a sigil's: the game labels the two differently. */}
      <LvlDisplay cap={ROW_LVL_CAP} level={level} tone="gold" traitPrefix />
    </GearRow>
  );
}

function SigilsSection({ sigils }: { sigils: (SigilSlot | null)[] }) {
  return (
    <div className="flex flex-none flex-col">
      {sigils.map((slot, i) => (
        <GearRow cols="1fr 1fr" key={i}>
          <TraitCell trait={slot?.primaryTrait ?? null} />
          <TraitCell trait={slot?.secondaryTrait ?? null} />
          {/* No slot, no level; the box stays unpainted so name columns keep their x. */}
          <LvlDisplay
            cap={ROW_LVL_CAP}
            level={slot ? slot.level : null}
            tone="gold"
          />
        </GearRow>
      ))}
    </div>
  );
}

/**
 * Read-only and never scaled itself - on-screen fitting is the wrapper's job,
 * and the PNG export captures this node.
 */
export function Card({
  build,
  layout = CARD_LAYOUT,
  strain = false,
  onStrain,
}: {
  build: Build;
  layout?: CardLayout;
  strain?: boolean;
  onStrain?: (strain: Strain) => void;
}) {
  const character = characterById.get(build.characterId);
  const catalog = characterCatalog(build.characterId);
  const weapon = build.weapon;
  const resolved = weapon ? resolveWeapon(build.characterId, weapon) : null;
  const perks = stylePerkStates(build.masterTraits, PERK_THRESHOLDS);
  const perkSummary = STYLES.map(
    (style) =>
      `${STYLE_LABEL[style]}: ${catalog.masterTraits[style].title} Perk ${perks[style].lastIndexOf(true) + 1}`,
  ).join(" · ");
  const wrightstoneRows = [
    build.wrightstone?.main ?? null,
    build.wrightstone?.sub1 ?? null,
    build.wrightstone?.sub2 ?? null,
  ];

  const colGap = soft("colGap", layout.slack);
  const rankGap = soft("rankGap", layout.slack);
  const rankMt = soft("rankMt", layout.slack);

  const cardRef = useRef<HTMLDivElement>(null);
  const reported = useRef<Strain | null>(null);

  // Cells are uniform height, so labels that overflow get shrunk after layout.
  // Cleared first so widening a column can un-shrink what narrowing it shrank.
  useEffect(() => {
    const root = cardRef.current;
    if (!root) return;

    let shrunk = 0;
    root.querySelectorAll<HTMLElement>("[data-opt]").forEach((el) => {
      el.removeAttribute("data-long");
      if (el.scrollHeight > el.clientHeight + 1) {
        el.setAttribute("data-long", "");
        shrunk++;
      }
      el.style.outline =
        strain && el.hasAttribute("data-long") ? STRAIN_LONG : "";
    });

    let clipped = 0;
    root.querySelectorAll<HTMLElement>("[data-clip]").forEach((el) => {
      const isClipped = el.scrollWidth > el.clientWidth + 1;
      if (isClipped) clipped++;
      el.style.outline = strain && isClipped ? STRAIN_CLIP : "";
    });

    // A style column whose spacers have all bottomed out and still does not fit.
    // Past that point the band is taking room only the cell height can give back.
    let overflow = 0;
    root.querySelectorAll<HTMLElement>("[data-fit]").forEach((el) => {
      const over = el.scrollHeight > el.clientHeight + 1;
      if (over) overflow++;
      el.style.outline = strain && over ? STRAIN_CLIP : "";
    });

    const artPx = Math.round(
      root.querySelector<HTMLElement>("[data-art]")?.offsetHeight ?? 0,
    );

    // Guarded: reporting upward re-renders, which would re-run this effect.
    const last = reported.current;
    if (
      !last ||
      last.clipped !== clipped ||
      last.shrunk !== shrunk ||
      last.overflow !== overflow ||
      last.artPx !== artPx
    ) {
      reported.current = { clipped, shrunk, overflow, artPx };
      onStrain?.({ clipped, shrunk, overflow, artPx });
    }
  });

  return (
    <div
      className="shareCard text-ui relative overflow-hidden bg-linear-160 from-[#f4f8fc] from-0% via-[#e8eff7] via-60% to-[#dfe9f4] to-100% font-sans"
      style={{ width: CARD_W, height: CARD_H, padding: layout.inset }}
      ref={cardRef}
    >
      <ParchmentBackdrop />
      <BackdropFrame />

      <Portrait characterId={build.characterId} layout={layout} />

      <div
        className="grid"
        style={{
          gridTemplateColumns: gridColumns(layout),
          // Row 1 ends on the upper line - where Status and the master-traits
          // box both bottom out. Row 2 runs from there to the bottom line, its
          // two boxes stretching to fill. minmax(0,...) not 1fr so row 2 is
          // squeezed rather than growing the grid past the bottom line.
          gridTemplateRows: `${layout.upper}px minmax(0, 1fr)`,
          rowGap: layout.rowGap,
          // The bottom line itself, lifted off the card's padded edge.
          height: `calc(100% - ${layout.floor}px)`,
        }}
      >
        {/* Column 1, above the upper line */}
        <div
          className="relative z-2 flex flex-col justify-end gap-5.75"
          style={{ gridColumn: 1, gridRow: 1 }}
        >
          <div className="nameBanner z-2 flex items-center justify-center gap-3.5 px-5.5 py-2 text-4xl font-bold text-white">
            <Orb size={20} />
            {character?.name ?? build.characterId}
          </div>
          <StatusPanel status={build.status} className={SECTION} />
        </div>

        {/* Column 1, below the upper line */}
        <div
          className="relative z-2 flex flex-col"
          style={{ gridColumn: 1, gridRow: 2 }}
        >
          <SkillsSection
            characterId={build.characterId}
            skills={build.skills}
            className={SKILLS_SECTION}
          />
        </div>

        {/* Column 2, spanning both rows */}
        <div
          className="relative z-1 flex flex-col gap-3.75 overflow-hidden"
          style={{ gridColumn: 3, gridRow: "1 / 3" }}
        >
          <Heading size="lg" className="flex-none">
            Weapon
          </Heading>
          <div className="flex-none pb-3">
            <div className="flex items-baseline justify-center px-2.5 text-2xl font-bold">
              <span className={resolved ? "" : "text-dim"}>
                {resolved?.name ?? "No Weapon"}
              </span>
              {/* Hardcoded max bonus for now. */}
              {resolved && (
                <span className="pl-1.5 font-normal text-[#ffff5f] [-webkit-text-stroke:4px_var(--ui)] [paint-order:stroke]">
                  +99
                </span>
              )}
            </div>
            <div
              data-art
              // No clip: the art is object-contained anyway, and the level's
              // descenders need to show past the bottom edge.
              className="relative mt-0.75 mb-1.25 flex items-center justify-center px-2.5"
              style={{ height: layout.artH, paddingLeft: BAR_INDENT }}
            >
              {resolved && (
                <img
                  src={weaponArtUrl(build.characterId, resolved.name)}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                />
              )}
              {resolved && (
                // Overlaid on the art: level bottom-left at the bar indent,
                // series bottom-right; the fraction is dropped.
                <div
                  className="absolute inset-x-0 bottom-1 flex items-end justify-between px-2.5"
                  style={{ paddingLeft: BAR_INDENT }}
                >
                  <LvlWeapon cap={42} level={WEAPON_LEVEL_MAX} />
                  <span className="text-dim text-base whitespace-nowrap">
                    {resolved.seriesName}
                  </span>
                </div>
              )}
            </div>
            <div
              className="mt-1.25 mb-2 flex items-baseline gap-5 px-2.5 text-xl"
              style={{ paddingLeft: BAR_INDENT }}
            >
              {/* Each plate carries its own slot and indent. */}
              <BaseStat {...statPlate("hp")}>
                <WeaponStat tone="hp" value={resolved?.hp ?? null} />
              </BaseStat>
              <BaseStat {...statPlate("atk")}>
                <WeaponStat tone="atk" value={resolved?.atk ?? null} />
              </BaseStat>
              <BaseStat {...statPlate("crit")}>
                <WeaponStat
                  tone="ui"
                  value={weapon?.critRate ?? null}
                  unit="%"
                />
              </BaseStat>
              <BaseStat {...statPlate("stun")}>
                <WeaponStat tone="ui" value={weapon?.stun ?? null} />
              </BaseStat>
            </div>
            {resolved
              ? resolved.slots.map((slot, i) => (
                  <GearTraitRow
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
                  <GearTraitRow trait={null} level={null} key={i} />
                ))}
            <div className="font-med text-dim mt-3 flex justify-between px-2.5 tracking-[0.07em]">
              <span>Imbued Traits</span>
              <span>{wrightstoneName(build.wrightstone?.main.trait)}</span>
            </div>
            {wrightstoneRows.map((row, i) => (
              <GearTraitRow
                trait={row?.trait ?? null}
                level={row?.level ?? null}
                key={i}
              />
            ))}
          </div>
          <Heading size="lg" className="flex-none">
            Sigils
          </Heading>
          <SigilsSection sigils={build.sigils} />
        </div>

        {/* Column 3, above the upper line */}
        <div
          className="relative z-1 flex flex-col overflow-hidden"
          style={{ gridColumn: 5, gridRow: 1 }}
        >
          <div className="flex h-full min-h-0 flex-col gap-3.75">
            <Heading
              tone="deep"
              size="lg"
              className="flex flex-none items-baseline justify-between"
            >
              <span>Master Traits</span>
              <span className="text-deep-label text-lg font-semibold tracking-[0.02em] normal-case text-shadow-none">
                {perkSummary}
              </span>
            </Heading>
            <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.25">
              {STYLES.map((style) => (
                /* Flattened deliberately so column can squish. */
                <div
                  data-fit
                  className={`styleCol text-deep-ink relative flex min-h-0 flex-col overflow-hidden rounded-lg border-t-4 p-4 ${STYLE_BORDER[style]}`}
                  key={style}
                >
                  <h4 className="flex-none text-2xl font-bold text-white [text-shadow:0_1px_4px_rgba(10,50,70,0.55)]">
                    {STYLE_LABEL[style]}: {catalog.masterTraits[style].title}
                  </h4>
                  {RANKS.map((rank) => (
                    <Fragment key={rank}>
                      <Soft h={colGap} part="colGap" />
                      <Soft h={rankMt} part="rankMt" />
                      <div className="text-deep-label flex flex-none justify-between text-lg tracking-[0.08em] uppercase">
                        <span>{STYLE_RANK_LABELS[rank]}</span>
                        <span>{STYLE_RANK_BUDGETS[rank]} pts</span>
                      </div>
                      <Soft h={rankGap} part="rankGap" />
                      {/* Locked: cell height and this row gap never squish. */}
                      <div className="grid flex-none grid-cols-2 gap-1.75">
                        {catalog.masterTraits[style][rank].map((cell) => (
                          <div
                            key={cell.id}
                            data-opt
                            style={{ height: layout.cellH }}
                            className={`${OPT} ${
                              build.masterTraits[style][rank].includes(cell.id)
                                ? "to-deep-3/30 bg-linear-135 from-white/18 text-white shadow-[inset_0_0_0_1px_var(--deep-ring)]"
                                : "bg-deep-cell text-deep-mute"
                            }`}
                          >
                            <Icon tone="style" sm />
                            {cell.label}
                          </div>
                        ))}
                      </div>
                    </Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3, below the upper line */}
        <div
          className="relative z-1 grid grid-cols-3 gap-1.25"
          style={{ gridColumn: 5, gridRow: 2 }}
        >
          <div className="flex flex-col">
            <Heading size="lg">Over Mastery</Heading>
            <Wpanel shadow className="flex flex-1 flex-col overflow-hidden">
              {build.overMastery.map((line, i) => (
                <div
                  className="border-line-soft flex min-h-0 flex-1 items-center gap-2.75 border-b py-1.5 text-2xl last:border-b-0 last:pb-0"
                  key={i}
                >
                  {line ? (
                    <>
                      {bonusTypeById.get(line.bonusType)?.name}
                      <Lvl className="ml-auto">
                        {bonusValueText(line.bonusType, line.value)}
                      </Lvl>
                    </>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              ))}
            </Wpanel>
          </div>
          <div className="col-span-2 flex flex-col">
            <Heading size="lg">Summons</Heading>
            {/* Matches the style columns' gap, so each card edge lands on one. */}
            <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-1.25">
              {build.summons.map((slot, i) => (
                <div
                  className={`${PLATE} flex min-h-0 flex-col gap-1 overflow-hidden px-3.75 py-2.75 text-2xl`}
                  key={i}
                >
                  <div className="from-gold via-gold-deep to-gold-dark -mx-3.75 -mt-2.75 mb-1 flex min-w-0 flex-none items-center gap-2 rounded-t-md bg-linear-90 from-0% via-55% to-100% px-3.75 py-1.75">
                    <Icon tone="summon" sm />
                    <b className="text-2xl font-bold text-white [text-shadow:0_1px_2.5px_rgba(90,30,0,0.55)]">
                      {slot ? summonById.get(slot.summonId)?.name : "-"}
                    </b>
                  </div>
                  {/* The card's give: stretch lands here, not between the rows. */}
                  <div className="grid flex-1 grid-cols-[6fr_5fr] items-center gap-4">
                    <div className="border-line-soft flex min-w-0 items-baseline gap-2 border-r pr-3.5">
                      <span data-clip className={`${CLIP} text-ui`}>
                        {slot?.trait ? traitName(slot.trait) : "-"}
                      </span>
                      {slot && <Lvl className="ml-1.25">{slot.traitLevel}</Lvl>}
                    </div>
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span data-clip className={`${CLIP} text-dim`}>
                        {slot?.equipBonus
                          ? bonusTypeById.get(slot.equipBonus.bonusType)?.name
                          : "-"}
                      </span>
                      {slot?.equipBonus && (
                        <Lvl tone="dim" className="ml-1.25">
                          {bonusValueText(
                            slot.equipBonus.bonusType,
                            slot.equipBonus.value,
                          )}
                        </Lvl>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* UI layer, above the portrait backdrop: the level badge in the corner. */}
      <LvlBadge level={CHARACTER_LEVEL} size={189} inset={14} />
      <div className="text-dim absolute right-4 bottom-2 z-5 text-base tracking-wider">
        gbfr-sharecard · ddk-epic.github.io/gbfr-sharecard
      </div>
    </div>
  );
}

/**
 * A weapon base stat, keylined like a level. The display's box is the plate's
 * whole height, so the plate's bottom half is exactly the bar it would have
 * drawn itself. A null value keeps that box and shows a dash in it.
 */
function WeaponStat({
  tone,
  value,
  unit,
}: {
  tone: "hp" | "atk" | "ui";
  value: number | null;
  unit?: string;
}) {
  return (
    <span className="relative ml-auto inline-flex">
      <LvlDisplay
        cap={WEAPON_STAT_CAP}
        level={value}
        lvlWord={false}
        unit={value === null ? undefined : unit}
        bar={false}
        tone={tone}
        set={WEAPON_STAT_SET}
      />
      {value === null && (
        <span className="text-dim absolute inset-0 grid place-items-center text-2xl">
          -
        </span>
      )}
    </span>
  );
}
