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

/** The pinned traits of each category, then the build's other traits in name
    order. Weapon traits are excluded: nothing equippable changes their level. */
function rowsByGroup(build: Build): Map<TraitCategory, Row[]> {
  const totals = traitLevelTotals(build);
  const pinned = [...PINNED_TRAITS, ...characterTraits(build.characterId)];
  const seen = new Set(pinned);

  const extra = [...totals.keys()]
    .filter(
      (trait) =>
        !seen.has(trait) && traitById.has(trait) && !isWeaponTrait(trait),
    )
    .sort((a, b) => traitName(a).localeCompare(traitName(b)));

  const groups = new Map<TraitCategory, Row[]>(
    TRAIT_CATEGORIES.map((group) => [group, []]),
  );
  for (const trait of [...pinned, ...extra]) {
    const def = traitById.get(trait);
    if (!def) continue;
    groups.get(traitCategoryOf(def))!.push({
      trait,
      level: totals.get(trait) ?? 0,
      max: def.maxLevel,
    });
  }
  return groups;
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
  const groups = rowsByGroup(build);
  const booster = sigilBoosterLevel(build);
  return (
    <div className="font-med absolute inset-y-0 left-[calc(100%+2px)] z-3">
      <div
        data-popover-lit
        className="border-line flex max-h-full w-82 flex-col rounded-lg border bg-white/90 pt-3.25 pb-0.5 pl-3.5 shadow-[0_10px_34px_rgba(23,60,90,0.3)]"
        style={{ zoom: EDITOR_ZOOM }}
      >
        <Heading
          size="lg"
          className="mr-3.5 flex flex-none items-center justify-between py-1.5!"
        >
          <span>Trait Checklist</span>
          <button
            className="text-dim hover:text-ink-strong -mr-4 cursor-pointer"
            title="close"
            aria-label="close"
            onClick={onClose}
          >
            <X size={20} aria-hidden />
          </button>
        </Heading>
        <div className="min-h-0 flex-1 overflow-y-scroll pt-2.5 pr-1.5 text-xl">
          {TRAIT_CATEGORIES.map((group) => {
            const rows = groups.get(group)!;
            if (rows.length === 0) return null;
            return (
              <div key={group} className="pb-3">
                <PopoverHeading>{traitCategoryLabel[group]}</PopoverHeading>
                {rows.map(({ trait, level, max }) => (
                  <div
                    className={`text-ui flex items-center justify-between gap-1.5 py-0.5 ${level === 0 ? "opacity-40" : ""}`}
                    key={trait}
                  >
                    <TraitIcon trait={trait} placeholder />
                    <span className="min-w-0 flex-1">{traitName(trait)}</span>
                    <span className="flex flex-none items-baseline gap-1">
                      <span className="font-sans text-[0.72em]">Lvl</span>
                      <div className={levelTone(level, max, booster)}>
                        <span className="inline-block min-w-[2ch] text-right tabular-nums">
                          {level}
                        </span>
                        <span className="font-sans text-[0.72em]">
                          /
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
