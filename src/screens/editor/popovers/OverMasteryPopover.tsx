import type { Build } from "@/domain/build";
import type { BonusTypeId } from "@/catalog/ids";
import { bonusIconUrl } from "@/assets/urls";
import { BONUS_TYPES, bonusTypeById } from "@/catalog";
import { bonusValueText } from "@/domain/naming";
import { BonusIcon } from "@/components/build/BonusIcon";
import { IconTile, Stepper } from "@/screens/editor/controls";
import {
  Popover,
  PopoverHeading,
  POPOVER_BASE,
  type Anchor,
} from "@/screens/editor/popovers/Popover";

const WIDTH = 28 * POPOVER_BASE;

/* Placeholder strut. */
const CELL_HEIGHT = "rounded-md border h-[3.75em]";

const ladder = (bonusType: BonusTypeId) =>
  bonusTypeById.get(bonusType)?.overMastery ?? [];

export function OverMasteryPopover({
  overMastery,
  anchor,
  onChange,
  onClose,
}: {
  overMastery: Build["overMastery"];
  anchor: Anchor;
  onChange: (next: Build["overMastery"]) => void;
  onClose: () => void;
}) {
  const full = overMastery.every((line) => line !== null);

  const lineOf = (bonusType: BonusTypeId) =>
    overMastery.findIndex((line) => line?.bonusType === bonusType);

  const toggle = (bonusType: BonusTypeId) => {
    const picked = lineOf(bonusType);
    if (picked >= 0) return onChange(setAt(overMastery, picked, null));
    const empty = overMastery.indexOf(null);
    if (empty < 0) return;
    const steps = ladder(bonusType);
    onChange(
      setAt(overMastery, empty, { bonusType, value: steps.at(-1) ?? 0 }),
    );
  };

  return (
    <Popover
      anchor={anchor}
      width={WIDTH}
      label="Over Mastery"
      onClose={onClose}
    >
      <PopoverHeading>
        <div className="flex justify-between">
          <span>Bonus</span>
          <span>
            {overMastery.filter(Boolean).length}/{overMastery.length}
          </span>
        </div>
      </PopoverHeading>
      <div className="mb-2.5 flex flex-col gap-1.5">
        {overMastery.map((line, i) =>
          line ? (
            <div
              key={i}
              className={`border-line-soft flex flex-col justify-center ${CELL_HEIGHT} px-1.5 pb-1`}
            >
              <div className="mb-1 flex items-center gap-1.5 text-[1em]">
                <BonusIcon bonusType={line.bonusType} />
                <span className="min-w-0 flex-1">
                  {bonusTypeById.get(line.bonusType)?.name}
                </span>
              </div>
              <Stepper
                values={ladder(line.bonusType)}
                value={line.value}
                format={(v) => bonusValueText(line.bonusType, v)}
                onChange={(value) =>
                  onChange(setAt(overMastery, i, { ...line, value }))
                }
              />
            </div>
          ) : (
            <div
              key={i}
              className={`border-line-soft text-dim/70 flex items-center justify-center border-dotted ${CELL_HEIGHT}`}
            >
              <span className="text-[0.85em] tracking-[0.08em] uppercase">
                empty line
              </span>
            </div>
          ),
        )}
      </div>
      <PopoverHeading>Bonus types</PopoverHeading>
      <div className="grid grid-cols-4 gap-0.5">
        {BONUS_TYPES.map((bonus) => {
          const picked = lineOf(bonus.id);
          return (
            <IconTile
              key={bonus.id}
              icon={bonusIconUrl(bonus.id)}
              name={bonus.name}
              selected={picked >= 0}
              disabled={full && picked < 0}
              badge={picked >= 0 ? picked + 1 : undefined}
              onClick={() => toggle(bonus.id)}
            />
          );
        })}
      </div>
    </Popover>
  );
}

const setAt = <T,>(slots: T[], index: number, value: T) =>
  slots.map((slot, i) => (i === index ? value : slot));
