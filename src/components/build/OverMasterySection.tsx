import type { ReactNode } from "react";
import type { Build } from "@/domain/build";
import { Heading, SectionPanel } from "@/components/ui";
import { BonusIconStrut, BonusLine } from "./BonusIcon";

const ROW = "border-line-soft text-ui flex items-center gap-1.25 text-xl";

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
  className = "",
  renderEmpty = (index) => <OverMasteryPlaceholder index={index} />,
}: {
  overMastery: Build["overMastery"];
  className?: string;
  renderEmpty?: (index: number) => ReactNode;
}) {
  return (
    <SectionPanel
      shadow
      className={`flex flex-col self-start overflow-hidden ${className}`}
    >
      <Heading size="lg" className="mb-1 flex-none">
        Over Mastery
      </Heading>
      <div className="mt-2 flex flex-col gap-1 px-2">
        {overMastery.map((line, i) => (
          <div className={ROW} key={i}>
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
