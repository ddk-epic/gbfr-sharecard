import { X } from "lucide-react";
import type { Build } from "@/domain/build";
import type { TraitId } from "@/catalog/ids";
import { traitById } from "@/catalog";
import { sigilBoosterLevel, traitLevelTotals } from "@/domain/status";
import { characterTraits, isWeaponTrait } from "@/domain/sigils";
import {
  TRAIT_CATEGORIES,
  traitCategoryLabel,
  traitCategoryOf,
  traitName,
  type TraitCategory,
} from "@/domain/naming";
import { TraitIcon } from "@/components/build/TraitIcon";
import { Heading } from "@/components/ui";
import { PopoverHeading } from "./popovers/Popover";
import { EDITOR_ZOOM } from "./controls";
import { PINNED_TRAITS } from "./trait-checklist";

type Row = { trait: TraitId; level: number; max: number };

/** The pinned traits of each category. */
function rowsByCategory(build: Build): Map<TraitCategory, Row[]> {
  const totals = traitLevelTotals(build);
  const pinned = [...PINNED_TRAITS, ...characterTraits(build.characterId)];
  const seen = new Set(pinned);

  const extra = [...totals.keys()]
    .filter(
      (trait) =>
        !seen.has(trait) && traitById.has(trait) && !isWeaponTrait(trait),
    )
    .sort((a, b) => traitName(a).localeCompare(traitName(b)));

  const categories = new Map<TraitCategory, Row[]>(
    TRAIT_CATEGORIES.map((category) => [category, []]),
  );
  for (const trait of [...pinned, ...extra]) {
    const def = traitById.get(trait);
    if (!def) continue;
    categories.get(traitCategoryOf(def))!.push({
      trait,
      level: totals.get(trait) ?? 0,
      max: def.maxLevel,
    });
  }
  return categories;
}

/** Green from maxLevel, warning above maxLevel + booster. */
const levelTone = (level: number, max: number, booster: number) =>
  level > max + booster ? "text-warn" : level >= max ? "text-ok" : "";

export function TraitChecklist({
  build,
  onClose,
}: {
  build: Build;
  onClose: () => void;
}) {
  const categories = rowsByCategory(build);
  const booster = sigilBoosterLevel(build);
  return (
    <div className="font-med absolute inset-y-0 left-[calc(100%+2px)] z-3">
      <div
        data-popover-lit
        className="border-line flex max-h-full w-82 flex-col rounded-lg border bg-white/90 pt-3.25 pb-0.5 pl-3.5 shadow-[0_10px_34px_rgba(23,60,90,0.3)]"
        style={{ zoom: EDITOR_ZOOM }}
      >
        <Heading size="lg" className="mr-3.5 flex-none py-1.25!">
          <button
            className="group flex w-full cursor-pointer items-center justify-between uppercase"
            title="close"
            aria-label="close"
            onClick={onClose}
          >
            <span>Trait Checklist</span>
            <span className="text-dim group-hover:text-ink-strong -mr-4">
              <X size={20} aria-hidden />
            </span>
          </button>
        </Heading>
        <div className="min-h-0 flex-1 overflow-y-scroll pt-2.5 pr-1.5 text-xl">
          {TRAIT_CATEGORIES.map((category) => {
            const rows = categories.get(category)!;
            if (rows.length === 0) return null;
            return (
              <div key={category} className="pb-3">
                <PopoverHeading>{traitCategoryLabel[category]}</PopoverHeading>
                {rows.map(({ trait, level, max }) => (
                  <div
                    className={`text-ui flex items-center justify-between gap-1.5 py-0.5 ${level === 0 ? "opacity-40" : ""}`}
                    key={trait}
                  >
                    <TraitIcon trait={trait} placeholder />
                    <span className="min-w-0 flex-1">{traitName(trait)}</span>
                    <span className="flex flex-none items-baseline gap-1">
                      <span className="font-sans text-[0.72em]">Lvl</span>
                      <div>
                        <span
                          className={`inline-block min-w-[2ch] text-right tabular-nums ${levelTone(level, max, booster)}`}
                        >
                          {level}
                        </span>
                        <span className="font-sans text-[0.72em]">
                          <span className="pr-px pl-0.5">/</span>
                          <span className="inline-block min-w-[2ch] text-right tabular-nums">
                            {max}
                          </span>
                        </span>
                      </div>
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
