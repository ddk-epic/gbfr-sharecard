import type { Build } from "../domain/build";
import { bonusTypeById, bonusValueText } from "../data";
import { Heading, SectionPanel } from "../ui";
import { BONUS_ICON_EM, BonusIcon } from "./BonusIcon";

export function OverMasterySection({
  overMastery,
  className = "",
}: {
  overMastery: Build["overMastery"];
  className?: string;
}) {
  return (
    <SectionPanel
      shadow
      className={`flex flex-col self-start overflow-hidden ${className}`}
    >
      <Heading size="lg" className="mb-1 flex-none">
        Over Mastery
      </Heading>
      <div className="mt-2 flex flex-col gap-1">
        {overMastery.map((line, i) => (
          <div
            className="border-line-soft text-ui flex items-center gap-1.25 text-xl"
            key={i}
          >
            {line ? (
              <>
                <BonusIcon bonusType={line.bonusType} className="-ml-1" />
                <span>{bonusTypeById.get(line.bonusType)?.name} </span>
                <span className="font-med">
                  {bonusValueText(line.bonusType, line.value)}
                </span>
              </>
            ) : (
              <OverMasteryPlaceholder index={i} />
            )}
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}

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
