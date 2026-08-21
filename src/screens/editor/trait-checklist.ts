import type { TraitId } from "@/catalog/ids";
import { traitById } from "@/catalog";

export const PINNED_TRAITS: TraitId[] = [
  // basic
  "hp",
  "stun-power",

  // attack
  "fatebreaker",
  "dmg-cap",
  "celestial-aqua",
  "celestial-incendo",
  "celestial-lumen",
  "celestial-nyx",
  "celestial-terra",
  "celestial-ventus",
  "berserker-echo",
  "spartan-echo",
  "supplementary-dmg",
  "war-elemental",

  // defense
  "aegis",
  "greater-aegis",
  "improved-dodge",
  "improved-guard",
  "nimble-defense",
  "garrison",
  "stronghold",
  "steel-nerves",

  // support
  "quick-cooldown",
  "cascade",
  "nimble-onslaught",
  "precise-wrath",
  "uplift",
  "drain",

  // special
  "autorevive",
  "guts",
  "potion-hoarder",
  "stout-heart",
  "immortal-shell",
];

// A pinned id missing from the catalog renders as a blank row.
if (import.meta.env.DEV) {
  const unknown = PINNED_TRAITS.filter((id) => !traitById.has(id));
  if (unknown.length)
    console.error(`trait-checklist: unknown trait ids: ${unknown.join(", ")}`);
}
