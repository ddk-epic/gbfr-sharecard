import type { Build } from "../../../domain/build";
import { bonusTypeById, bonusValueText } from "../../../data";
import { Heading, SectionPanel } from "../../../ui";
import { BonusIcon } from "../../../card/BonusIcon";
import { EmptySlot } from "../controls";

/** Clears the bonus glyph, so an empty row stands as tall as a filled one. */
const ROW_HEIGHT = "h-8.5";

export function EditorOverMasterySection({
  overMastery,
  onOpen,
}: {
  overMastery: Build["overMastery"];
  onOpen: (el: Element) => void;
}) {
  return (
    <SectionPanel shadow className="relative flex flex-col overflow-hidden">
      <Heading size="lg" className="mb-2 flex-none">
        Over Mastery
      </Heading>
      <div className="flex flex-col gap-1 px-2">
        {overMastery.map((line, i) => (
          <div
            className={`border-line-soft text-ui flex items-center gap-1.25 text-xl ${ROW_HEIGHT}`}
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
              <EmptySlot
                className="flex-1 py-0.75 text-base"
                label="add bonus"
              />
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Edit over mastery"
        className="hover:bg-band/15 absolute inset-0 z-10 cursor-pointer rounded-lg"
        onClick={(e) => onOpen(e.currentTarget)}
      />
    </SectionPanel>
  );
}
