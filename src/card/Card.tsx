import { Fragment, useEffect, useRef } from "react";
import type { Build, SigilSlot, StyleId, StyleRank } from "../domain/build";
import { CHARACTER_LEVEL, RANKS, STYLES } from "../domain/build";
import { STYLE_RANK_BUDGETS, stylePerkStates } from "../domain/derive";
import { PERK_THRESHOLDS } from "../domain/catalog";
import {
  bonusTypeById,
  bonusValueText,
  characterCatalog,
  summonById,
  traitName,
} from "../data";
import { BonusIcon } from "./BonusIcon";
import { OverMasterySection } from "./OverMasterySection";
import { SkillsSection } from "./SkillsSection";
import { WeaponSection } from "./WeaponSection";
import { GearRow, ROW_LVL_CAP_HEIGHT, TraitCell } from "./gear-row";
import { Portrait } from "./Portrait";
import { NameBadge } from "./NameBadge";
import { LvlBadge } from "./LvlBadge";
import { LvlDisplay } from "./LvlDisplay";
import { StatusPanel } from "./StatusPanel";
import { BackdropFrame, Heading, Icon, Lvl, ParchmentBackdrop } from "../ui";

export const CARD_WIDTH = 2880;
export const CARD_HEIGHT = 1440;

// Uniform padding on all four card edges; the portrait art alone bleeds past it.
const CARD_INSET = 16;
// Each column seam, px: Portrait | Gear and Gear | Master Traits both run this.
const COL_GAP = 27;
// Portrait / Gear / Master Traits, as shares of whatever the gaps leave.
const COL_SHARES = [20, 27, 53] as const;
// Grid row 1's height: the upper line where Status and the master-traits box
// both bottom out.
const ROW_UPPER = 1102;
// The one gap under the upper line, shared by both seams so they read as one.
const ROW_GAP = 24;

/**
 * Column widths in px. The two gaps come off the top and the shares divide what
 * remains, so the three tracks plus their seams sum to exactly the padded card.
 */
function columnWidths() {
  const free = CARD_WIDTH - 2 * CARD_INSET - 2 * COL_GAP;
  const total = COL_SHARES[0] + COL_SHARES[1] + COL_SHARES[2];
  return COL_SHARES.map((share) => (free * share) / total) as [
    number,
    number,
    number,
  ];
}

/** The five-track grid template: three columns with a seam between each pair. */
function gridColumns() {
  const [c1, c2, c3] = columnWidths();
  return `${c1}px ${COL_GAP}px ${c2}px ${COL_GAP}px ${c3}px`;
}

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

const SECTION =
  "rounded-lg bg-white/90 px-4.75 py-4 shadow-[0_1px_8px_rgba(23,60,90,0.12)] backdrop-blur-[3px]";

// The Skills card runs tighter side padding than SECTION to buy the 2x2 names
// more width.
const SKILLS_SECTION = SECTION.replace("px-4.75", "px-2.5");

const PLATE =
  "rounded-[7px] bg-white/85 shadow-[inset_0_0_0_1px_var(--line-soft)]";

const CLIP = "overflow-hidden text-ellipsis whitespace-nowrap";

/** A master-trait cell: fixed height, an overflowing label shrinks via data-long. */
const OPT =
  "h-[46px] flex items-center gap-2 overflow-hidden rounded-sm px-2.25 py-1 text-lg leading-[1.12] data-long:gap-1.25 data-long:px-1.75 data-long:py-0.75 data-long:text-base data-long:leading-[1.06]";

/**
 * The compressible spacing between the master-traits sections: authored height
 * and how far flexbox may squeeze it. Cell height and the cell-grid row gap are
 * deliberately absent so the trait grid keeps its rhythm however tight it gets.
 */
const SOFT = {
  colGap: { base: 9, floor: 4 }, // between the style name and each rank section
  rankGap: { base: 9, floor: 4 }, // between a rank's label and its cell grid
  rankMt: { base: 15, floor: 0 }, // above each rank label
} as const;

type SoftPart = keyof typeof SOFT;

/**
 * One piece of the master-traits soft spacing, a flex item rather than a gap or
 * margin so it can shrink: it sits at its authored height but flexbox may
 * squeeze it to the part's floor when the band grows, no further.
 */
function Soft({ part }: { part: SoftPart }) {
  const { base, floor } = SOFT[part];
  return (
    <div
      aria-hidden
      className="shrink"
      style={{ height: base, minHeight: floor, flexBasis: base }}
    />
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
            cap={ROW_LVL_CAP_HEIGHT}
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
export function Card({ build }: { build: Build }) {
  const catalog = characterCatalog(build.characterId);
  const perks = stylePerkStates(build.masterTraits, PERK_THRESHOLDS);
  const perkSummary = STYLES.map(
    (style) =>
      `${STYLE_LABEL[style]}: ${catalog.masterTraits[style].title} Perk ${perks[style].lastIndexOf(true) + 1}`,
  ).join(" · ");

  const cardRef = useRef<HTMLDivElement>(null);

  // Cells are uniform height, so master-trait labels that overflow get shrunk
  // after layout. Cleared first so a re-render can un-shrink what it shrank.
  useEffect(() => {
    const root = cardRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-opt]").forEach((el) => {
      el.removeAttribute("data-long");
      if (el.scrollHeight > el.clientHeight + 1)
        el.setAttribute("data-long", "");
    });
  });

  return (
    <div
      className="shareCard text-ui relative overflow-hidden bg-linear-160 from-[#f4f8fc] from-0% via-[#e8eff7] via-60% to-[#dfe9f4] to-100% font-sans"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT, padding: CARD_INSET }}
      ref={cardRef}
    >
      <ParchmentBackdrop />
      <BackdropFrame />

      <Portrait
        characterId={build.characterId}
        seam={CARD_INSET + columnWidths()[0]}
      />

      <div
        className="grid"
        style={{
          gridTemplateColumns: gridColumns(),
          // Row 1 ends on the upper line - where Status and the master-traits
          // box both bottom out. Row 2 runs from there to the bottom line, its
          // two boxes stretching to fill. minmax(0,...) not 1fr so row 2 is
          // squeezed rather than growing the grid past the bottom line.
          gridTemplateRows: `${ROW_UPPER}px minmax(0, 1fr)`,
          rowGap: ROW_GAP,
          height: "100%",
        }}
      >
        {/* Column 1, above the upper line */}
        <div
          className="relative z-2 flex flex-col justify-end gap-5.75"
          style={{ gridColumn: 1, gridRow: 1 }}
        >
          <NameBadge characterId={build.characterId} />
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
          <WeaponSection build={build} />
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
                  className={`styleCol text-deep-ink relative flex min-h-0 flex-col overflow-hidden rounded-lg border-t-4 p-4 ${STYLE_BORDER[style]}`}
                  key={style}
                >
                  <h4 className="flex-none text-2xl font-bold text-white [text-shadow:0_1px_4px_rgba(10,50,70,0.55)]">
                    {STYLE_LABEL[style]}: {catalog.masterTraits[style].title}
                  </h4>
                  {RANKS.map((rank) => (
                    <Fragment key={rank}>
                      <Soft part="colGap" />
                      <Soft part="rankMt" />
                      <div className="text-deep-label flex flex-none justify-between text-lg tracking-[0.08em] uppercase">
                        <span>{STYLE_RANK_LABELS[rank]}</span>
                        <span>{STYLE_RANK_BUDGETS[rank]} pts</span>
                      </div>
                      <Soft part="rankGap" />
                      {/* Locked: cell height and this row gap never squish. */}
                      <div className="grid flex-none grid-cols-2 gap-1.75">
                        {catalog.masterTraits[style][rank].map((cell) => (
                          <div
                            key={cell.id}
                            data-opt
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
          <OverMasterySection overMastery={build.overMastery} />
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
                      <span className={`${CLIP} text-ui`}>
                        {slot?.trait ? traitName(slot.trait) : "-"}
                      </span>
                      {slot && <Lvl className="ml-1.25">{slot.traitLevel}</Lvl>}
                    </div>
                    <div className="flex min-w-0 items-center gap-1.5">
                      {slot?.equipBonus && (
                        <BonusIcon bonusType={slot.equipBonus.bonusType} />
                      )}
                      <span className={`${CLIP} text-dim`}>
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
