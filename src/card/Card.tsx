import type { Build } from "../domain/build";
import { CHARACTER_LEVEL } from "../domain/build";
import { MasterTraitsSection } from "./MasterTraitsSection";
import { OverMasterySection } from "./OverMasterySection";
import { SigilsSection } from "./SigilsSection";
import { SkillsSection } from "./SkillsSection";
import { SummonsSection } from "./SummonsSection";
import { WeaponSection } from "./WeaponSection";
import { Portrait } from "./Portrait";
import { NameBadge } from "./NameBadge";
import { LvlBadge } from "./LvlBadge";
import { MasterlevelBadge } from "./MasterLvlBadge";
import { PwrBadge } from "./PwrBadge";
import { StatusPanel } from "./StatusPanel";
import { BackdropFrame, ParchmentBackdrop } from "../ui";

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
          //  │                 ┌─────────────────────┐  │
          //  │                 │                     │  │
          //  │                 │                     │  │
          //  │   *Portrait*    │                     │  │
          //  │                 │    Master Traits    │  │
          //  │                 │                     │  │
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
        {/* Column 1 */}
        <div
          className="relative z-2 flex flex-col justify-end gap-5.75"
          style={{ gridColumn: 1, gridRow: 1 }}
        >
          <div className="border-red-500">
            <LvlBadge level={CHARACTER_LEVEL} size={189} />
            <MasterlevelBadge size={130} top={6} left={142} />
            <PwrBadge power={56252} size={110} top={0} right={0} />
          </div>
          <NameBadge characterId={build.characterId} />
          <StatusPanel status={build.status} />
        </div>
        <div
          className="relative z-2 flex flex-col"
          style={{ gridColumn: 1, gridRow: 2 }}
        >
          <SkillsSection
            characterId={build.characterId}
            skills={build.skills}
          />
        </div>

        {/* Column 2, Gear */}
        <div
          className="relative z-1 flex flex-col gap-3.75 overflow-hidden"
          style={{ gridColumn: 3, gridRow: "1 / 3" }}
        >
          <WeaponSection build={build} />
          <SigilsSection sigils={build.sigils} />
        </div>

        {/* Column 3 */}
        <div
          className="relative z-1 flex flex-col overflow-hidden"
          style={{ gridColumn: 5, gridRow: 1 }}
        >
          <MasterTraitsSection build={build} />
        </div>
        <div
          className="relative z-1 grid grid-cols-3 gap-1.25"
          style={{ gridColumn: 5, gridRow: 2 }}
        >
          <OverMasterySection overMastery={build.overMastery} />
          <SummonsSection summons={build.summons} />
        </div>
      </div>
      <div className="text-dim absolute right-4 bottom-2 z-5 text-base tracking-wider">
        gbfr-sharecard · ddk-epic.github.io/gbfr-sharecard
      </div>
    </div>
  );
}
