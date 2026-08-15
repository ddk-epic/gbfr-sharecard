import type { TraitId } from "@/catalog/ids";
import type { TraitDef } from "@/catalog/types";
import { SIGIL_LOTS, TRAITS, WRIGHTSTONE_PREFIXES, traitById } from "@/catalog";

/** Prefix follows the main trait, so the name is derived, never stored. */
export const wrightstoneName = (mainTrait: TraitId | null | undefined) => {
  const prefix = mainTrait ? WRIGHTSTONE_PREFIXES[mainTrait] : undefined;
  return prefix ? `${prefix} Wrightstone` : "Wrightstone";
};

export const WRIGHTSTONE_MAIN_POOL: TraitDef[] = Object.keys(
  WRIGHTSTONE_PREFIXES,
)
  .map((id) => traitById.get(id))
  .filter((trait): trait is TraitDef => trait !== undefined);

/** A wrightstone rolls its two subs from the archive's one random-trait pool. */
const subTraits = new Set(
  Object.values(SIGIL_LOTS.lots)
    .filter((lot) => lot.wrightstoneSub)
    .flatMap((lot) => lot.traits),
);
export const WRIGHTSTONE_SUB_POOL: TraitDef[] = TRAITS.filter((trait) =>
  subTraits.has(trait.id),
);
