import type { ReactNode } from "react";
import type { SigilSlot } from "@/domain/build";
import type { TraitId } from "@/catalog/ids";
import { Heading } from "@/components/ui";
import { GearRow, ROW_LVL_CAP_HEIGHT, TraitCell } from "./gear-row";
import { LvlDisplay } from "./LvlDisplay";

export function SigilsGrid({
  sigils,
  renderCell = (_index, _secondary, trait) => <TraitCell trait={trait} />,
  renderLevel = (_index, level) => (
    <LvlDisplay
      cap={ROW_LVL_CAP_HEIGHT}
      level={level}
      tone="gold"
      className="-translate-y-0.5"
    />
  ),
}: {
  sigils: (SigilSlot | null)[];
  renderCell?: (
    index: number,
    secondary: boolean,
    trait: TraitId | null,
  ) => ReactNode;
  renderLevel?: (index: number, level: number | null) => ReactNode;
}) {
  return (
    <>
      <Heading size="lg" className="flex-none">
        Sigils
      </Heading>
      <div className="flex flex-none flex-col">
        {sigils.map((slot, i) => (
          <GearRow cols="1fr 1fr" key={i}>
            {renderCell(i, false, slot?.primaryTrait ?? null)}
            {renderCell(i, true, slot?.secondaryTrait ?? null)}
            {renderLevel(i, slot ? slot.level : null)}
          </GearRow>
        ))}
      </div>
    </>
  );
}
