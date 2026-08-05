import type { Build, SigilSlot } from "../domain/build";
import { CHARACTER_LEVEL } from "../domain/build";
import { bonusTypeById, bonusValueText, summonById, traitName } from "../data";
import { BonusIcon } from "./BonusIcon";
import { MasterTraitsSection } from "./MasterTraitsSection";
import { OverMasterySection } from "./OverMasterySection";
import { SkillsSection } from "./SkillsSection";
import { WeaponSection } from "./WeaponSection";
import { GearRow, ROW_LVL_CAP_HEIGHT, TraitCell } from "./gear-row";
import { Portrait } from "./Portrait";
import { NameBadge } from "./NameBadge";
import { LvlBadge } from "./LvlBadge";
import { LvlDisplay } from "./LvlDisplay";
import { StatusPanel } from "./StatusPanel";
import { BackdropFrame, Heading, Lvl, ParchmentBackdrop } from "../ui";

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

const SECTION =
  "rounded-lg bg-white/90 px-4.75 py-4 shadow-[0_1px_8px_rgba(23,60,90,0.12)] backdrop-blur-[3px]";

// The Skills card runs tighter side padding than SECTION to buy the 2x2 names
// more width.
const SKILLS_SECTION = SECTION.replace("px-4.75", "px-2.5");

const PLATE =
  "rounded-[7px] bg-white/85 shadow-[inset_0_0_0_1px_var(--line-soft)]";

const CLIP = "overflow-hidden text-ellipsis whitespace-nowrap";

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
  return (
    <div
      className="shareCard text-ui relative overflow-hidden bg-linear-160 from-[#f4f8fc] from-0% via-[#e8eff7] via-60% to-[#dfe9f4] to-100% font-sans"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT, padding: CARD_INSET }}
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
          // Grid layout:
          //
          //  ┌──────────────────────────────────────────┐
          //  │ Row 1 (ROW_UPPER px)                     │
          //  │ ┌────────────┐  ┌─────────────────────┐  │
          //  │ │            │  │                     │  │
          //  │ |  Portrait  │  │                     │  │
          //  │ │            │  │                     │  │
          //  │ │            │  │    Master Traits    │  │
          //  │ └────────────┘  │                     │  │
          //  │ ┌────────────┐  │                     │  │
          //  │ │   Status   │  │                     │  │
          //  │ └────────────┘  └─────────────────────┘  │
          //  ├──────────────────────────────────────────┤ ← shared bottom edge
          //  │ Row 2 (minmax(0, 1fr))                   │
          //  │ ┌────────────┐  ┌─────────────────────┐  │
          //  │ │   Skills   │  │    OM + Summons     │  │
          //  │ └────────────┘  └─────────────────────┘  │
          //  └──────────────────────────────────────────┘
          //
          // Using minmax(0, 1fr) allows Row 2 to shrink when needed
          // instead of forcing the overall grid taller than its container.
          gridTemplateColumns: gridColumns(),
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
          <MasterTraitsSection build={build} />
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
