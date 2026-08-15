import { useState } from "react";
import type { TraitId } from "@/catalog/ids";
import type { TraitCategory, TraitDef } from "@/catalog/types";
import { TraitIcon } from "@/components/build/TraitIcon";
import { PopoverHeading } from "@/screens/editor/popovers/Popover";

const CATEGORY_LABEL: Record<TraitCategory, string> = {
  basic: "Basic",
  attack: "Attack",
  defense: "Defense",
  special: "Special",
  support: "Support",
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL) as TraitCategory[];

/** Fixed, so the panel keeps its height as the filter narrows the list. */
const LIST_HEIGHT = "h-[31em]";

/** Filtered, category-grouped trait list. The pool and what a pick means are
    the caller's. */
export function TraitPicker({
  pool,
  heading = "Trait",
  disabled = false,
  onPick,
  trailing,
}: {
  pool: TraitDef[];
  heading?: string;
  /** Disables the rows only. Filtering and scrolling still work. */
  disabled?: boolean;
  onPick: (trait: TraitId) => void;
  /** Rendered at the right of each row, e.g. a picked count. */
  trailing?: (trait: TraitDef) => React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = pool.filter((trait) =>
    trait.name.toLowerCase().includes(needle),
  );

  return (
    <>
      <PopoverHeading>{heading}</PopoverHeading>
      <input
        autoFocus
        type="search"
        value={query}
        placeholder="filter traits"
        aria-label="filter traits"
        className="border-line mb-2 w-full rounded-sm border bg-white/92 px-2 py-1 text-[1em]"
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className={`${LIST_HEIGHT} overflow-y-auto pt-0.5`}>
        {matches.length === 0 && (
          <p className="text-dim flex h-full items-center justify-center text-[0.85em]">
            no match
          </p>
        )}
        {/* A wash over the rows while picking is disabled. */}
        <div className="relative">
          {disabled && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 -mt-0.5 bg-white/40"
            />
          )}
          {/* Uncategorised traits are listed last, under "Other", instead of
              being left out. */}
          {[...CATEGORY_ORDER, "other" as const].map((category) => {
            const group = matches.filter((trait) =>
              category === "other"
                ? !trait.category
                : trait.category === category,
            );
            if (group.length === 0) return null;
            return (
              <div key={category}>
                <PopoverHeading>
                  {category === "other" ? "Other" : CATEGORY_LABEL[category]}
                </PopoverHeading>
                <div className="mb-1.5">
                  {group.map((trait) => (
                    <button
                      key={trait.id}
                      type="button"
                      disabled={disabled}
                      className="hover:bg-band/35 flex w-full cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-left text-[1em] disabled:cursor-default disabled:hover:bg-transparent"
                      onClick={() => onPick(trait.id)}
                    >
                      <TraitIcon trait={trait.id} size="em" placeholder />
                      <span className="min-w-0 flex-1">{trait.name}</span>
                      {trailing?.(trait)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
