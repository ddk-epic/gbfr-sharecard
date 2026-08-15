import type { ReactNode } from "react";
import type { Build } from "@/domain/build";
import { Heading, SectionPanel } from "@/components/ui";
import { BonusIconStrut, BonusLine } from "./BonusIcon";

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

function OverMasteryPlaceholder({ index }: { index: number }) {
  return (
    <>
      <BonusIconStrut />
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
              <BonusLine bonusType={line.bonusType} value={line.value} />
            ) : (
              renderEmpty(i)
            )}
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
