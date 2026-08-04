import type { Build } from "../domain/build";
import { bonusTypeById, bonusValueText } from "../data";
import { Heading, Wpanel } from "../ui";
import { BonusIcon } from "./BonusIcon";

export function OverMasterySection({
  overMastery,
  className = "",
}: {
  overMastery: Build["overMastery"];
  className?: string;
}) {
  return (
    <Wpanel
      shadow
      className={`flex flex-col self-start overflow-hidden ${className}`}
    >
      <Heading size="lg" className="mb-1 flex-none">
        Over Mastery
      </Heading>
      <div className="flex flex-col gap-1">
        {overMastery.map((line, i) => (
          <div
            className="border-line-soft text-ui font-med flex items-center gap-1.25 text-xl"
            key={i}
          >
            {line ? (
              <>
                <BonusIcon bonusType={line.bonusType} className="-ml-1" />
                <span>
                  {bonusTypeById.get(line.bonusType)?.name}{" "}
                  {bonusValueText(line.bonusType, line.value)}
                </span>
              </>
            ) : (
              <span>-</span>
            )}
          </div>
        ))}
      </div>
    </Wpanel>
  );
}
