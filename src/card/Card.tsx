import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { Build, StyleId, StyleRank } from "../domain/build";
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
  portraitUrl,
  summonById,
  traitName,
  resolveWeapon,
  wrightstoneName,
} from "../data";
import { LvlBadge } from "./LvlBadge";
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
  Diamond,
  Heading,
  Icon,
  Lvl,
  Orb,
  StatIcon,
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
const COL_HEADING = "-mb-1";

/** The portrait's share of the card height; it bleeds past the inset. */
const PORTRAIT_H = "70%";

const SECTION =
  "rounded-lg bg-white/78 px-3.5 py-3 shadow-[0_1px_6px_rgba(23,60,90,0.12)] backdrop-blur-[3px]";

const PLATE =
  "rounded-[5px] bg-white/85 shadow-[inset_0_0_0_1px_var(--line-soft)]";

const CELL = "flex min-w-0 items-center gap-1.75";

const CLIP = "overflow-hidden text-ellipsis whitespace-nowrap";

/** Height comes from layout.cellH; the rest is the cell's own hand-tuning. */
const OPT =
  "flex items-center gap-1.5 overflow-hidden rounded-sm px-1.75 py-0.75 text-[13.5px] leading-[1.12] data-long:gap-1 data-long:px-1.25 data-long:py-0.5 data-long:text-[11.5px] data-long:leading-[1.06]";

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
      <Icon sm />
      <span className="text-dim">-</span>
      <Lvl tone="dim">T.Lvl {padLevel("-")}</Lvl>
    </TraitRow>
  );
}

/**
 * Read-only, exactly 1920x1080, never scaled itself - on-screen fitting is the
 * wrapper's job and the PNG export captures this node.
 *
 * Laid out as five grid tracks (three columns, a seam between each pair) over
 * two rows divided by two horizontal lines.
 *
 * The **upper line** ends row 1: Status' bottom edge and the master-traits box's
 * bottom edge both land on it, which is what makes the two columns read as one
 * layout rather than two. The **bottom line** ends row 2, liftable off the card's
 * padded edge. Between them sit Skills and Over Mastery + Summons, stretching to
 * fill whatever the two lines leave, separated from the row above by one shared
 * gap - shared so the two seams read as a single line across the card.
 *
 * Column 2 ignores both lines and spans the pair, top-anchored, reaching as far
 * down as its art box takes it and never past the bottom line.
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
  const skillNames = new Map(catalog.skills.map((s) => [s.id, s.name]));
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
        <LvlBadge level={CHARACTER_LEVEL} inset={10} />
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
          className="relative z-2 flex flex-col justify-end gap-4.25"
          style={{ gridColumn: 1, gridRow: 1 }}
        >
          <div className="nameBanner z-2 flex items-center justify-center gap-2.5 px-4 py-1.5 text-[28px] font-bold text-white">
            <Orb size={20} />
            {character?.name ?? build.characterId}
          </div>
          <section className={SECTION}>
            <div className="grid grid-flow-col grid-cols-2 grid-rows-2 gap-x-2.5 gap-y-1.5">
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
            <Heading>Skills</Heading>
            {build.skills.map((skill, i) => (
              <div
                className="border-line-soft flex min-h-0 flex-1 items-center gap-2 border-b py-1.5 text-[16.5px] last:border-b-0 last:pb-0"
                key={i}
              >
                <Orb />
                {skill ? (
                  skillNames.get(skill)
                ) : (
                  <span className="text-dim">-</span>
                )}
                <Diamond />
              </div>
            ))}
          </section>
        </div>

        {/* Column 2 spans both rows, top-anchored: the art box sets how far down
            it reaches. It may stop short of the bottom line but never cross it,
            so overflow-hidden is the cap rather than the column pushing through.
            Every child is flex-none - left shrinkable, flexbox claws back exactly
            what the art box grows by and the slider does nothing. */}
        <div
          className="relative z-1 flex flex-col gap-2.75 overflow-hidden"
          style={{ gridColumn: 3, gridRow: "1 / 3" }}
        >
          <Heading className={`${COL_HEADING} flex-none`}>Weapon</Heading>
          <Wpanel shadow className="flex-none">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-[19px] font-bold ${resolved ? "" : "text-dim"}`}
              >
                {resolved?.name ?? "No Weapon"}
              </span>
              <span className="text-dim text-[12px] whitespace-nowrap">
                {resolved?.seriesName ?? "-"} · Lv. {WEAPON_LEVEL}
              </span>
            </div>
            {/* Sized, not stretched - placeholder until per-weapon art exists. */}
            <div
              data-art
              className="mt-0.5 mb-1 rounded-[10px] bg-linear-115 from-[rgba(106,147,181,0.26)] to-[rgba(106,147,181,0.05)]"
              style={{ height: layout.artH }}
            />
            <div className="mt-1 mb-1.5 flex items-baseline gap-1 text-[14.5px]">
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
                    <Icon sm />
                    <span>
                      {slot.kind === "pool" ? (
                        <>
                          {slot.trait ? (
                            traitName(slot.trait)
                          ) : (
                            <span className="text-dim">-</span>
                          )}{" "}
                          <ArrowLeftRight
                            className="text-essence align-[-0.12em]"
                            size="1em"
                          />
                        </>
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
            <div className="text-dim mt-3.75 mb-0.5 flex justify-between text-[13px] tracking-[0.07em] uppercase">
              <span>Imbued Traits</span>
              <span>{wrightstoneName(build.wrightstone?.main.trait)}</span>
            </div>
            {wrightstoneRows.map((row, i) =>
              row ? (
                <TraitRow size="lg" key={i}>
                  <Icon sm />
                  <span>{traitName(row.trait)}</span>
                  <Lvl>T.Lvl {padLevel(row.level)}</Lvl>
                </TraitRow>
              ) : (
                <EmptyTraitRow key={i} />
              ),
            )}
          </Wpanel>
          <Heading className={`${COL_HEADING} flex-none`}>Sigils</Heading>
          <div className="flex flex-none flex-col gap-[3.5px]">
            {build.sigils.map((slot, i) => (
              <div
                className={`${PLATE} grid grid-cols-[1fr_1fr_30px] items-center gap-2 px-2.25 py-[5.5px] text-[16.5px]`}
                key={i}
              >
                <div className={CELL}>
                  <Icon />
                  <span
                    data-clip
                    className={`${CLIP} ${slot ? "" : "text-dim"}`}
                  >
                    {slot ? traitName(slot.primaryTrait) : "-"}
                  </span>
                </div>
                <div className={`${CELL} text-dim`}>
                  <Icon sm />
                  <span data-clip className={CLIP}>
                    {slot?.secondaryTrait ? traitName(slot.secondaryTrait) : ""}
                  </span>
                </div>
                <Lvl className="text-right">{slot ? slot.level : ""}</Lvl>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3, above the upper line. Fills row 1 exactly: lowering the line
            squeezes the soft spacers inside the style columns until they bottom
            out, which is the point at which only the cell height can give more. */}
        <div
          className="relative z-1 flex flex-col overflow-hidden"
          style={{ gridColumn: 5, gridRow: 1 }}
        >
          <div className="flex h-full min-h-0 flex-col gap-2.75">
            <Heading
              tone="deep"
              className={`${COL_HEADING} flex flex-none items-baseline justify-between`}
            >
              Master Traits
              <span className="text-deep-label text-[13.5px] font-semibold tracking-[0.02em] normal-case text-shadow-none">
                {perkSummary}
              </span>
            </Heading>
            <div className="grid min-h-0 flex-1 grid-cols-3 gap-1">
              {STYLES.map((style) => (
                /* Flattened deliberately: every spacer is a sibling of every
                   other, so flexbox can talk them all down together when the
                   band takes the room. Nesting them per rank would hide them
                   inside a rigid child and nothing would squish. */
                <div
                  data-fit
                  className={`styleCol text-deep-ink relative flex min-h-0 flex-col overflow-hidden rounded-lg border-t-[3px] p-3 ${STYLE_BORDER[style]}`}
                  key={style}
                >
                  <h4 className="flex-none text-[19.5px] font-bold text-white [text-shadow:0_1px_3px_rgba(10,50,70,0.55)]">
                    {STYLE_LABEL[style]}: {catalog.masterTraits[style].title}
                  </h4>
                  {RANKS.map((rank) => (
                    <Fragment key={rank}>
                      <Soft h={colGap} part="colGap" />
                      <Soft h={rankMt} part="rankMt" />
                      <div className="text-deep-label flex flex-none justify-between text-[14px] tracking-[0.08em] uppercase">
                        <span>{STYLE_RANK_LABELS[rank]}</span>
                        <span>{STYLE_RANK_BUDGETS[rank]} pts</span>
                      </div>
                      <Soft h={rankGap} part="rankGap" />
                      {/* Locked: cell height and this row gap never squish. */}
                      <div className="grid flex-none grid-cols-2 gap-1.25">
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
          className="relative z-1 grid grid-cols-3 gap-1"
          style={{ gridColumn: 5, gridRow: 2 }}
        >
          <div className="flex flex-col">
            <Heading>Over Mastery</Heading>
            <Wpanel shadow className="flex flex-1 flex-col overflow-hidden">
              {build.overMastery.map((line, i) => (
                <div
                  className="border-line-soft flex min-h-0 flex-1 items-center gap-2 border-b py-[4.5px] text-[16.5px] last:border-b-0 last:pb-0"
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
            <Heading>Summons</Heading>
            {/* Matches the style columns' gap, so each card edge lands on one. */}
            <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-1">
              {build.summons.map((slot, i) => (
                <div
                  className={`${PLATE} flex min-h-0 flex-col gap-0.75 overflow-hidden px-2.75 py-2 text-[16.5px]`}
                  key={i}
                >
                  <div className="from-gold via-gold-deep to-gold-dark -mx-2.75 -mt-2 mb-0.75 flex min-w-0 flex-none items-center gap-1.5 rounded-t-md bg-linear-90 from-0% via-55% to-100% px-2.75 py-1.25">
                    <Icon tone="summon" sm />
                    <b className="text-[17.5px] font-bold text-white [text-shadow:0_1px_2px_rgba(90,30,0,0.55)]">
                      {slot ? summonById.get(slot.summonId)?.name : "-"}
                    </b>
                  </div>
                  {/* The card's give: stretch lands here, not between the rows. */}
                  <div className="grid flex-1 grid-cols-[6fr_5fr] items-center gap-3">
                    <div className="border-line-soft flex min-w-0 items-baseline gap-1.5 border-r pr-2.5">
                      <span data-clip className={`${CLIP} text-ui`}>
                        {slot?.trait ? traitName(slot.trait) : "-"}
                      </span>
                      {slot && <Lvl className="ml-1">{slot.traitLevel}</Lvl>}
                    </div>
                    <div className="flex min-w-0 items-baseline gap-1.5">
                      <span data-clip className={`${CLIP} text-dim`}>
                        {slot?.equipBonus
                          ? bonusTypeById.get(slot.equipBonus.bonusType)?.name
                          : "-"}
                      </span>
                      {slot?.equipBonus && (
                        <Lvl tone="dim" className="ml-1">
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
      <div className="text-dim absolute right-4 bottom-2 z-5 text-[11.5px] tracking-wider">
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
    <div className={`${PLATE} flex items-baseline gap-2 px-2.5 py-1`}>
      <StatIcon
        tone={tone === "hp" ? "hp" : "default"}
        className="mr-0.5 self-center"
      />
      <span className="text-dim text-[13.5px]">{label}</span>
      <Lvl
        size="stat"
        tone={tone}
        unit={unit}
        className={`ml-auto ${tone === "ui" ? "mr-2.25" : ""}`}
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
      className={`ml-auto ${tone === "ui" ? "mr-2.25" : ""}`}
    >
      {children}
    </Lvl>
  );
}
