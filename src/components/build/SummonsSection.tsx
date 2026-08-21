import { Fragment, type ReactNode } from "react";
import type { Build, SummonSlot } from "@/domain/build";
import type { SummonId } from "@/catalog/ids";
import { summonIconUrl } from "@/assets/urls";
import {
  SUMMON_PORTRAIT_WIDTH,
  summonPortraitOffset,
} from "@/assets/art-metrics";
import { summonById } from "@/catalog";
import { traitName } from "@/domain/naming";
import { TraitIcon, TraitIconStrut } from "@/components/build/TraitIcon";
import { Heading, SectionPanel, nameTracking } from "@/components/ui";
import { BONUS_ICON_EM, BonusIconStrut, BonusLine } from "./BonusIcon";
import { LvlDisplay } from "./LvlDisplay";

type Arrangement = "grid" | "list";
type Density = "compact" | "loose";

const ARRANGEMENT_LAYOUT: Record<
  Arrangement,
  {
    panelClass: string;
    heading: boolean;
    listClass: string;
    showDivider: boolean;
  }
> = {
  grid: {
    panelClass: "col-span-2 self-start overflow-hidden !p-0",
    heading: false,
    listClass: "relative grid grid-cols-2 grid-rows-2 pb-px",
    showDivider: true,
  },
  list: {
    panelClass: "flex flex-col overflow-hidden",
    heading: true,
    listClass: "divide-line-soft grid grid-cols-1 divide-y",
    showDivider: false,
  },
};

const CELL_LAYOUT: Record<
  Density,
  { outerClass: string; innerClass: string; invisibleWhenEmpty: boolean }
> = {
  compact: {
    // No negative bottom margin.
    outerClass: "relative -ml-1 flex min-h-0 items-center overflow-hidden",
    innerClass:
      "relative z-1 mb-px flex min-w-0 flex-col gap-1.25 px-4.5 py-2.75",
    invisibleWhenEmpty: false,
  },
  loose: {
    outerClass: "relative flex min-h-0 items-center overflow-hidden",
    innerClass: "relative z-1 flex min-w-0 flex-col gap-1.25 px-2.5 py-2",
    invisibleWhenEmpty: true,
  },
};

const summonName = (slot: SummonSlot) => summonById.get(slot.summonId)?.name;

/** Set on the row, not the label: the trait glyph scales off it. */
const TRAIT_ROW = "flex min-w-0 items-center gap-1 text-xl";

const BONUS_ROW = "flex min-w-0 items-center gap-1.25 pl-1 text-[18px]";

/** The art bleeds off the cell's right edge and fades out both sides. */
const PORTRAIT_FADE =
  "mask-[linear-gradient(to_left,rgba(0,0,0,0)_0%,#000_14%,#000_60%,rgba(0,0,0,0)_100%)]";

function SummonPortrait({ summonId }: { summonId: SummonId }) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-no-repeat ${PORTRAIT_FADE}`}
      style={{
        backgroundImage: `url('${summonIconUrl(summonId)}')`,
        backgroundSize: `${SUMMON_PORTRAIT_WIDTH}% auto`,
        backgroundPosition: `50% calc(50% + ${summonPortraitOffset(summonId)}px)`,
      }}
    />
  );
}

/* Fields */
function SummonNameBand({ slot }: { slot: SummonSlot }) {
  return (
    <div className="mb-2 block w-60">
      <span className="from-gold-deep via-gold block rounded-sm bg-linear-90 from-0% via-40% to-transparent to-100% px-3 pt-px pb-0.5 text-xl font-bold tracking-wider whitespace-nowrap text-white [-webkit-text-stroke:5px_var(--gold-deep)] [paint-order:stroke] [text-shadow:0_1px_3px_rgba(74,0,0,0.85)]">
        {summonName(slot)}
      </span>
    </div>
  );
}

function TraitRow({ slot }: { slot: SummonSlot }) {
  const traitLabel = traitName(slot.trait);
  return (
    <div className={TRAIT_ROW}>
      <TraitIcon trait={slot.trait} />
      <span
        className="font-med text-ui whitespace-nowrap"
        style={{ letterSpacing: nameTracking(traitLabel) }}
      >
        {traitLabel}
      </span>
      <LvlDisplay
        cap={16}
        level={slot.traitLevel}
        tone="gold"
        traitPrefix
        className="ml-1 -translate-y-px"
      />
    </div>
  );
}

function EquipBonusRow({ slot }: { slot: SummonSlot }) {
  if (!slot.equipBonus) return null;
  return (
    <div className={`text-ui ${BONUS_ROW}`} style={{ height: BONUS_ICON_EM }}>
      <BonusLine
        bonusType={slot.equipBonus.bonusType}
        value={slot.equipBonus.value}
      />
    </div>
  );
}

/* Bonus-empty strut. */
const BONUS_EMPTY: Record<Density, () => ReactNode> = {
  compact: () => (
    <div className="flex min-w-0 items-center gap-1.25 text-[18px]">
      <BonusIconStrut />
      <span className="bg-slanted-bar h-3 w-32 rounded-sm" />
    </div>
  ),
  loose: () => (
    <div
      className={`text-dim/70 ${BONUS_ROW}`}
      style={{ height: BONUS_ICON_EM }}
    >
      <span className="text-sm tracking-[0.08em] uppercase">
        no equip bonus
      </span>
    </div>
  ),
};

function defaultCompactEmpty(): { name: ReactNode; trait: ReactNode } {
  return {
    name: (
      <div className="mb-2 block w-60">
        <span className="from-slanted-bar block rounded-sm bg-linear-90 from-0% to-transparent to-90% px-3 pt-px pb-0.5 text-xl font-bold tracking-wider whitespace-nowrap text-transparent select-none">
          &nbsp;
        </span>
      </div>
    ),
    trait: (
      <div className={TRAIT_ROW}>
        {/* Strut: the real row's label sets its height, not the icon. */}
        <span aria-hidden className="w-0 overflow-hidden select-none">
          &nbsp;
        </span>
        <TraitIconStrut className="bg-slanted-bar rounded-sm" />
        <span className="bg-slanted-bar h-3.5 w-28 rounded-sm" />
      </div>
    ),
  };
}

function SummonCell({
  slot,
  density,
  renderEmpty,
}: {
  slot: SummonSlot | null;
  density: Density;
  renderEmpty: () => { name: ReactNode; trait: ReactNode; overlay?: ReactNode };
}) {
  const layout = CELL_LAYOUT[density];
  const empty = slot ? null : renderEmpty();
  return (
    <div className={layout.outerClass}>
      {slot && <SummonPortrait summonId={slot.summonId} />}
      <div
        className={`${layout.innerClass} ${
          !slot && layout.invisibleWhenEmpty ? "invisible" : ""
        }`}
      >
        {slot ? <SummonNameBand slot={slot} /> : empty!.name}
        <div className="space-y-1">
          {slot ? <TraitRow slot={slot} /> : empty!.trait}
          {slot?.equipBonus ? (
            <EquipBonusRow slot={slot} />
          ) : (
            BONUS_EMPTY[density]()
          )}
        </div>
      </div>
      {empty?.overlay}
    </div>
  );
}

export function SummonsSection({
  summons,
  arrangement = "grid",
  density = "compact",
  wrapCell = (_index, cell) => cell,
  renderEmpty = defaultCompactEmpty,
}: {
  summons: Build["summons"];
  arrangement?: Arrangement;
  density?: Density;
  wrapCell?: (index: number, cell: ReactNode) => ReactNode;
  renderEmpty?: () => {
    name: ReactNode;
    trait: ReactNode;
    overlay?: ReactNode;
  };
}) {
  const layout = ARRANGEMENT_LAYOUT[arrangement];
  return (
    <SectionPanel shadow className={layout.panelClass}>
      {layout.heading && (
        <Heading size="lg" className="mb-1 flex-none">
          Summons
        </Heading>
      )}
      <div className={layout.listClass}>
        {layout.showDivider && (
          <>
            <span
              aria-hidden
              className="bg-line-soft pointer-events-none absolute inset-y-3 left-1/2 z-1 w-px -translate-x-1/2"
            />
            <span
              aria-hidden
              className="bg-line-soft pointer-events-none absolute inset-x-3 top-1/2 z-1 h-px -translate-y-1/2"
            />
          </>
        )}
        {summons.map((slot, i) => (
          <Fragment key={i}>
            {wrapCell(
              i,
              <SummonCell
                slot={slot}
                density={density}
                renderEmpty={renderEmpty}
              />,
            )}
          </Fragment>
        ))}
      </div>
    </SectionPanel>
  );
}
