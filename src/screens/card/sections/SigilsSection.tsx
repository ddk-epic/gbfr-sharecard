import type { SigilSlot } from "../../../domain/build";
import { Heading } from "../../../components/ui";
import {
  GearRow,
  ROW_LVL_CAP_HEIGHT,
  TraitCell,
} from "../../../components/build/gear-row";
import { LvlDisplay } from "../../../components/build/LvlDisplay";

export function SigilsSection({ sigils }: { sigils: (SigilSlot | null)[] }) {
  return (
    <>
      <Heading size="lg" className="flex-none">
        Sigils
      </Heading>
      <div className="flex flex-none flex-col">
        {sigils.map((slot, i) => (
          <GearRow cols="1fr 1fr" key={i}>
            <TraitCell trait={slot?.primaryTrait ?? null} />
            <TraitCell trait={slot?.secondaryTrait ?? null} />
            <LvlDisplay
              cap={ROW_LVL_CAP_HEIGHT}
              level={slot ? slot.level : null}
              tone="gold"
              className="-translate-y-0.5"
            />
          </GearRow>
        ))}
      </div>
    </>
  );
}
