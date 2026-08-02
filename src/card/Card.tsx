import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { Build, SigilSlot, StyleId, StyleRank } from "../domain/build";
import {
  CHARACTER_LEVEL,
  RANKS,
  STYLES,
  WEAPON_LEVEL,
  WEAPON_TRAIT_ROWS,
} from "../domain/build";
import { STYLE_RANK_BUDGETS, stylePerkStates } from "../domain/derive";
import { PERK_THRESHOLDS } from "../domain/catalog";
import {
  bonusTypeById,
  bonusValueText,
  characterById,
  characterCatalog,
  elementIconUrl,
  portraitUrl,
  skillIconUrl,
  summonById,
  traitName,
  resolveWeapon,
  wrightstoneName,
} from "../data";
import { LvlBadge } from "./LvlBadge";
import { LvlDisplay } from "./LvlDisplay";
import {
  CARD_H,
  CARD_LAYOUT,
  CARD_W,
  columnWidths,
  gridColumns,
  soft,
  softFloor,
  type CardLayout,
  type SoftPart,
} from "./layout";
import {
  BaseStat,
  EmptyTraitIcon,
  Heading,
  Icon,
  Lvl,
  Orb,
  StatIcon,
  TraitIcon,
  traitIconBox,
  TraitRow,
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

/** Heading to body is 7px under the 11px column gap. */
const COL_HEADING = "-mb-1.25";

/** The portrait's share of the card height; it bleeds past the inset. */
const PORTRAIT_H = "70%";

const SECTION =
  "rounded-lg bg-white/78 px-4.75 py-4 shadow-[0_1px_8px_rgba(23,60,90,0.12)] backdrop-blur-[3px]";

const PLATE =
  "rounded-[7px] bg-white/85 shadow-[inset_0_0_0_1px_var(--line-soft)]";

const CELL = "flex min-w-0 items-center gap-1.25";

const CLIP = "overflow-hidden text-ellipsis whitespace-nowrap";

/** Height comes from layout.cellH; the rest is the cell's own hand-tuning. */
const OPT =
  "flex items-center gap-2 overflow-hidden rounded-sm px-2.25 py-1 text-lg leading-[1.12] data-long:gap-1.25 data-long:px-1.75 data-long:py-0.75 data-long:text-base data-long:leading-[1.06]";

/** Figure-space pad so single-digit trait levels stay column-aligned. */
const padLevel = (level: number | string) => String(level).padStart(2, " ");

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

function EmptyTraitRow() {
  return (
    <TraitRow size="lg">
      <EmptyTraitIcon />
      <span className="text-dim">-</span>
      <Lvl tone="dim">T.Lvl {padLevel("-")}</Lvl>
    </TraitRow>
  );
}

/* A sigil row: glyph, name, "Lvl <n>", separated by hairline rules, not plates.
   One row carries both of a slot's traits as two glyph+name columns sharing the
   level; names are set at the glyph's size so each reads as one line. */

/* Sized within the name's line box so the glyph doesn't drive row height. */
const SIGIL_ICON = 22;

/** Matches the glyph box, so name and icon carry the same weight in the row. */
const SIGIL_TEXT = "text-2xl font-med text-ui";

/** Cap height in px, not the ink box (~1.21x this). Free of row height to ~26. */
const SIGIL_LVL_CAP = 22;

/**
 * Letter-spacing by name length, tightest for the longest. Steps are em so they
 * scale with the row; names below the last threshold keep the face's spacing.
 */
const NAME_TRACKING = [
  { from: 20, em: -0.048 },
  { from: 16, em: -0.036 },
  { from: 12, em: -0.024 },
  { from: 8, em: -0.012 },
];

const nameTracking = (name: string) => {
  const step = NAME_TRACKING.find((t) => name.length >= t.from);
  return step ? `${step.em}em` : undefined;
};

/** Primary and secondary render identically; the column is what tells them apart. */
function SigilCell({ trait }: { trait: SigilSlot["primaryTrait"] | null }) {
  const name = trait ? traitName(trait) : "-";
  return (
    <div className={CELL}>
      {trait ? (
        <TraitIcon trait={trait} size={SIGIL_ICON} />
      ) : (
        /* Spacer, not a dash: holds the glyph's width so the dash indents like a name. */
        <span aria-hidden className={`flex-none ${traitIconBox(SIGIL_ICON)}`} />
      )}
      {/* Not clipped: short names and tracking do the fitting, so an overflow shows rather than trims. */}
      <span
        className={`whitespace-nowrap ${trait ? "" : "text-dim"}`}
        style={{ letterSpacing: nameTracking(name) }}
      >
        {name}
      </span>
    </div>
  );
}

function SigilsSection({ sigils }: { sigils: (SigilSlot | null)[] }) {
  return (
    <div className="flex flex-none flex-col">
      {sigils.map((slot, i) => (
        <div
          className={`border-line grid grid-cols-[1fr_1fr_auto] items-center border-b-2 px-2.5 py-1 ${SIGIL_TEXT}`}
          key={i}
        >
          <SigilCell trait={slot?.primaryTrait ?? null} />
          <SigilCell trait={slot?.secondaryTrait ?? null} />
          {/* No slot, no level; the box stays unpainted so name columns keep their x. */}
          <LvlDisplay
            cap={SIGIL_LVL_CAP}
            level={slot ? slot.level : null}
            tone="gold"
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Read-only, exactly 2880x1440, never scaled itself - on-screen fitting is the
 * wrapper's job and the PNG export captures this node.
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
  const skillById = new Map(catalog.skills.map((s) => [s.id, s]));
  const wrightstoneRows = [
    build.wrightstone?.main ?? null,
    build.wrightstone?.sub1 ?? null,
    build.wrightstone?.sub2 ?? null,
  ];

  const [portraitW] = columnWidths(layout);
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
      {/* The one declared bleed: art reaches the card's real edge, not the inset. */}
      <div
        className="absolute top-0 left-0 z-1"
        style={{ width: layout.inset + portraitW, height: PORTRAIT_H }}
      >
        <div
          className="portrait absolute inset-0 bg-size-[auto_115%] bg-top"
          style={{
            backgroundImage: `url('${portraitUrl(build.characterId)}')`,
            backgroundPosition: `center ${character?.portraitY ?? 20}%`,
          }}
        />
        <LvlBadge level={CHARACTER_LEVEL} size={189} inset={14} />
      </div>

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
        {/* Column 1 above the upper line: Status bottoms on it, the banner rides
            above. Neither resizes - raising the line just lifts them. */}
        <div
          className="relative z-2 flex flex-col justify-end gap-5.75"
          style={{ gridColumn: 1, gridRow: 1 }}
        >
          <div className="nameBanner z-2 flex items-center justify-center gap-3.5 px-5.5 py-2 text-4xl font-bold text-white">
            <Orb size={20} />
            {character?.name ?? build.characterId}
          </div>
          <section className={SECTION}>
            <div className="grid grid-flow-col grid-cols-2 grid-rows-2 gap-x-3.5 gap-y-2">
              <StatCell tone="hp" label="HP" value={build.status.hp} />
              <StatCell tone="atk" label="ATK" value={build.status.atk} />
              <StatCell
                tone="ui"
                label="Crit. Hit Rate"
                value={build.status.critRate}
                unit="%"
              />
              <StatCell
                tone="ui"
                label="Stun Power"
                value={build.status.stunPower}
              />
            </div>
          </section>
        </div>

        {/* Column 1 below it: Skills fills down to the bottom line, its four rows
            sharing whatever height that leaves. */}
        <div
          className="relative z-2 flex flex-col"
          style={{ gridColumn: 1, gridRow: 2 }}
        >
          <section
            className={`${SECTION} flex flex-1 flex-col overflow-hidden`}
          >
            <Heading size="lg">Skills</Heading>
            {build.skills.map((skill, i) => {
              const def = skill ? skillById.get(skill) : undefined;
              return (
                <div
                  className="border-line-soft flex min-h-0 flex-1 items-center gap-2.75 border-b py-2 text-2xl last:border-b-0 last:pb-0"
                  key={i}
                >
                  {def ? (
                    <>
                      <img
                        src={elementIconUrl(def.element)}
                        className="size-5.5 flex-none"
                      />
                      <span className="text-dim flex-none text-lg capitalize">
                        {def.element}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {def.name}
                      </span>
                      <img
                        src={skillIconUrl(build.characterId, def.id)}
                        className="ml-auto size-10.75 flex-none"
                      />
                    </>
                  ) : (
                    <span className="text-dim">-</span>
                  )}
                </div>
              );
            })}
          </section>
        </div>

        {/* Column 2 spans both rows, top-anchored: the art box sets how far down
            it reaches. It may stop short of the bottom line but never cross it,
            so overflow-hidden is the cap rather than the column pushing through.
            Every child is flex-none - left shrinkable, flexbox claws back exactly
            what the art box grows by and the slider does nothing. */}
        <div
          className="relative z-1 flex flex-col gap-3.75 overflow-hidden"
          style={{ gridColumn: 3, gridRow: "1 / 3" }}
        >
          <Heading size="lg" className={`${COL_HEADING} flex-none`}>
            Weapon
          </Heading>
          <Wpanel shadow className="flex-none">
            <div className="flex items-baseline gap-2.75">
              <span
                className={`text-2xl font-bold ${resolved ? "" : "text-dim"}`}
              >
                {resolved?.name ?? "No Weapon"}
              </span>
              <span className="text-dim text-base whitespace-nowrap">
                {resolved?.seriesName ?? "-"} · Lv. {WEAPON_LEVEL}
              </span>
            </div>
            {/* Sized, not stretched - placeholder until per-weapon art exists. */}
            <div
              data-art
              className="mt-0.75 mb-1.25 rounded-[13.5px] bg-linear-115 from-[rgba(106,147,181,0.26)] to-[rgba(106,147,181,0.05)]"
              style={{ height: layout.artH }}
            />
            <div className="mt-1.25 mb-2 flex items-baseline gap-1.25 text-xl">
              <BaseStat tone="hp">
                <WeaponStat tone="hp" filled={!!resolved}>
                  {resolved?.hp ?? "-"}
                </WeaponStat>
              </BaseStat>
              <BaseStat>
                <WeaponStat tone="atk" filled={!!resolved}>
                  {resolved?.atk ?? "-"}
                </WeaponStat>
              </BaseStat>
              <BaseStat>
                <WeaponStat
                  tone="ui"
                  filled={!!weapon}
                  unit={weapon ? "%" : undefined}
                >
                  {weapon ? weapon.critRate : "-"}
                </WeaponStat>
              </BaseStat>
              <BaseStat>
                <WeaponStat tone="ui" filled={!!weapon}>
                  {weapon?.stun ?? "-"}
                </WeaponStat>
              </BaseStat>
            </div>
            {resolved
              ? resolved.slots.map((slot, i) => (
                  <TraitRow
                    size="lg"
                    flush={i === resolved.slots.length - 1}
                    key={i}
                  >
                    {slot.trait ? (
                      <TraitIcon trait={slot.trait} />
                    ) : (
                      <EmptyTraitIcon />
                    )}
                    <span>
                      {slot.kind === "pool" ? (
                        <div className="flex">
                          {slot.trait ? (
                            traitName(slot.trait)
                          ) : (
                            <span className="text-dim">-</span>
                          )}
                          <ArrowLeftRight
                            className="text-essence ml-2 align-[-0.12em]"
                            size="1em"
                          />
                        </div>
                      ) : (
                        traitName(slot.trait)
                      )}
                    </span>
                    <Lvl>T.Lvl {padLevel(slot.level)}</Lvl>
                  </TraitRow>
                ))
              : Array.from({ length: WEAPON_TRAIT_ROWS }, (_, i) => (
                  <EmptyTraitRow key={i} />
                ))}
            <div className="text-dim mt-5 mb-0.75 flex justify-between text-lg tracking-[0.07em] uppercase">
              <span>Imbued Traits</span>
              <span>{wrightstoneName(build.wrightstone?.main.trait)}</span>
            </div>
            {wrightstoneRows.map((row, i) =>
              row ? (
                <TraitRow size="lg" key={i}>
                  <TraitIcon trait={row.trait} />
                  <span>{traitName(row.trait)}</span>
                  <Lvl>T.Lvl {padLevel(row.level)}</Lvl>
                </TraitRow>
              ) : (
                <EmptyTraitRow key={i} />
              ),
            )}
          </Wpanel>
          <Heading size="lg" className={`${COL_HEADING} flex-none`}>
            Sigils
          </Heading>
          <SigilsSection sigils={build.sigils} />
        </div>

        {/* Column 3, above the upper line. Fills row 1 exactly: lowering the line
            squeezes the soft spacers inside the style columns until they bottom
            out, which is the point at which only the cell height can give more. */}
        <div
          className="relative z-1 flex flex-col overflow-hidden"
          style={{ gridColumn: 5, gridRow: 1 }}
        >
          <div className="flex h-full min-h-0 flex-col gap-3.75">
            <Heading
              tone="deep"
              size="lg"
              className={`${COL_HEADING} flex flex-none items-baseline justify-between`}
            >
              Master Traits
              <span className="text-deep-label text-lg font-semibold tracking-[0.02em] normal-case text-shadow-none">
                {perkSummary}
              </span>
            </Heading>
            <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.25">
              {STYLES.map((style) => (
                /* Flattened deliberately: every spacer is a sibling of every
                   other, so flexbox can talk them all down together when the
                   band takes the room. Nesting them per rank would hide them
                   inside a rigid child and nothing would squish. */
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

        {/* Column 3, below the upper line. Same three tracks and gap as the style
            columns above, so Over Mastery sits under the first and Summons the
            other two, and both stretch down to the bottom line. */}
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
                    <span className="text-dim">-</span>
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
      <div className="text-dim absolute right-4 bottom-2 z-5 text-base tracking-wider">
        gbfr-sharecard · ddk-epic.github.io/gbfr-sharecard
      </div>
    </div>
  );
}

/** A c1 status box: label left, number right with its unit hung outside. */
function StatCell({
  tone,
  label,
  value,
  unit,
}: {
  tone: "hp" | "atk" | "ui";
  label: string;
  value: number;
  unit?: string;
}) {
  return (
    <div className={`${PLATE} flex items-baseline gap-2.75 px-3.5 py-1.25`}>
      <StatIcon
        tone={tone === "hp" ? "hp" : "default"}
        className="mr-0.75 self-center"
      />
      <span className="text-dim text-lg">{label}</span>
      <Lvl
        size="stat"
        tone={tone}
        unit={unit}
        className={`ml-auto ${tone === "ui" ? "mr-3" : ""}`}
      >
        {value}
      </Lvl>
    </div>
  );
}

/** A weapon base stat; `filled` is false when no weapon is equipped. */
function WeaponStat({
  children,
  tone,
  filled,
  unit,
}: {
  children: ReactNode;
  tone: "hp" | "atk" | "ui";
  filled: boolean;
  unit?: string;
}) {
  return (
    <Lvl
      size="wbase"
      tone={filled ? tone : "dim"}
      unit={unit}
      className={`ml-auto ${tone === "ui" ? "mr-3" : ""}`}
    >
      {children}
    </Lvl>
  );
}
