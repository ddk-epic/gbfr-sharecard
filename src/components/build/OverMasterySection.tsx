import type { ReactNode } from "react";
import type { Build } from "../../domain/build";
import { bonusTypeById, bonusValueText } from "../../data";
import { Heading, SectionPanel } from "../ui";
import { BONUS_ICON_EM, BonusIcon } from "./BonusIcon";

type Density = "compact" | "loose";

const DENSITY_LAYOUT: Record<
  Density,
  {
    panelClass: string;
    container: string;
    headingClass: string;
    rowClass: string;
  }
> = {
  compact: {
    panelClass: "self-start",
    container: "mt-2 flex flex-col gap-1",
    headingClass: "mb-1 flex-none",
    rowClass: "border-line-soft text-ui flex items-center gap-1.25 text-xl",
  },
  loose: {
    panelClass: "",
    container: "flex flex-col gap-1 px-2",
    headingClass: "mb-2 flex-none",
    rowClass:
      "border-line-soft text-ui flex h-8.5 items-center gap-1.25 text-xl",
  },
};

// Varied bar widths so stacked empty rows read as distinct lines; cycled by
// index to stay stable across renders.
const GHOST_WIDTHS = ["w-44", "w-32", "w-38", "w-28", "w-40", "w-34"];

// Strut carries the real row's BonusIcon height so filled and empty rows match.
function OverMasteryPlaceholder({ index }: { index: number }) {
  return (
    <>
      <span
        aria-hidden
        className="w-0 flex-none"
        style={{ height: BONUS_ICON_EM }}
      />
      <span
        className={`bg-slanted-bar h-3.5 rounded-sm ${GHOST_WIDTHS[index % GHOST_WIDTHS.length]}`}
      />
    </>
  );
}

export function OverMasterySection({
  overMastery,
  density = "compact",
  className = "",
  renderEmpty = (index) => <OverMasteryPlaceholder index={index} />,
}: {
  overMastery: Build["overMastery"];
  density?: Density;
  className?: string;
  renderEmpty?: (index: number) => ReactNode;
}) {
  const layout = DENSITY_LAYOUT[density];
  return (
    <SectionPanel
      shadow
      className={`flex flex-col overflow-hidden ${layout.panelClass} ${className}`}
    >
      <Heading size="lg" className={layout.headingClass}>
        Over Mastery
      </Heading>
      <div className={layout.container}>
        {overMastery.map((line, i) => (
          <div className={layout.rowClass} key={i}>
            {line ? (
              <>
                <BonusIcon bonusType={line.bonusType} className="-ml-1" />
                <span>{bonusTypeById.get(line.bonusType)?.name} </span>
                <span className="font-med">
                  {bonusValueText(line.bonusType, line.value)}
                </span>
              </>
            ) : (
              renderEmpty(i)
            )}
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
