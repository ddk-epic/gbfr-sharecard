# CONTEXT — GBFR Sharecard

Ubiquitous language for the Granblue Fantasy: Relink build-sharecard domain.

## Glossary

- **Build** — one character's complete shareable loadout: over-masteries, sigil slots, wrightstone, summons, master traits. One Build per Character (v1).
- **Character** — a playable GBFR character (v1 ships only Io). Identified by a character id.
- **Trait** — a named effect (e.g. *Damage Cap*, *Stun Power*) with a game-defined max level. Traits are the currency of the whole model: sigils, wrightstones and the tally all speak in traits.
- **Sigil Slot** — one of the Build's 12 sigil positions: `{ primaryTrait, secondaryTrait?, level }`. Trait-based (the sigil *item* is never named). A slot may be empty. The single `level` applies to both the primary and secondary trait.
- **Primary Trait / Secondary Trait** — the two traits a sigil slot can carry; a secondary trait exists only on "+"-style sigils.
- **Over Mastery** — exactly 4 fully-random bonus lines on a character: `{ bonusType, value }` each. Any of the 11 canonical bonus types can appear on any line; no line is fixed. Values sit in per-type datamined ranges (Nenkai). A line may be empty (unrolled).
- **Bonus Type** — one of the 11 canonical over-mastery bonus kinds (Attack Power Up, Health Up, Critical Hit Rate Up, Stun Power Up, Skill Damage Up, Skybound Art Damage Up, Chain Burst Damage Up, Normal Attack Damage Cap Up, Skill Damage Cap Up, Skybound Art Damage Cap Up, Healing Cap Up).
- **Wrightstone** — one optional equip per Build: a **main** slot and two **sub** slots, each `{ trait, level }`, traits drawn from the wrightstone trait pool. The wrightstone's display name is *derived*: its prefix follows the main trait (e.g. "Dread…" ⇔ Stun Power). Quality tiers cap the slots — highest tier 20/15/10 (main/sub1/sub2), lower tiers exist (≈15/10/7, 10/7/5, …); v1 validates only against the highest caps.
- **Summon Slot** — one of the Build's 4 summon positions: `{ summon, trait, traitLevel, equipBonus: { bonusType, value } }`. The summon's rolled trait and rolled equip bonus are player-entered (rolls are random in-game); equip bonuses share the 11 Bonus Types with their own value ranges.
- **Trait Tally** — the derived accumulation of trait levels across all sigil slots + the wrightstone. Editor-only overview; never on the card. The one calculation v1 performs.
- **Master Traits** — a character's three **Styles**, each progressing through four **Style Rank** sections (1 / 2 / 3 / EX). All selected traits across all three styles are active simultaneously. The Build stores, per style × rank, the *set of selected trait option ids*; everything else is derived.
- **Style** — one of the three universal master-trait tracks: **Insight / Essence / Crux**. The names are the same for every character; what differs per character is the skill-related trait options inside. ("Style" is the working term — the user reads it more as a "direction"; rename if a better word surfaces.)
- **Master-trait option** — one selectable *cell* in a style×rank section. Its **OptionId names the cell, not the trait**: each cell either references a **generic** trait definition from a pool shared by every character (e.g. *DMG Cap +30%* — which may legitimately occupy two cells of the same section) or carries a **character-specific** skill-related definition inline (e.g. Io's *SG Cap 35%*). Cell order in the character's catalog *is* the table layout; the Build stores sets of cell ids.
- **Style Rank budget** — each rank section has a shared points pool spent across all three styles (Rank 1: 10, Rank 2: 10, Rank 3: 10, EX: 20). Every selection costs exactly 1 point, so the budget is simply the max number of selections in that rank section — which is why high-rank perks are mutually exclusive in practice.
- **Style Rank Perk** — a style's per-rank bonus that activates when enough of that style's traits are selected (thresholds ≈ 3 / 6 / 6 — verify exact numbers and point costs against the MasterTraits CSV `Requirement` column during data extraction). Perk active-state is **derived from selections, never stored**.
- **Card** — the read-only 1920×1080 render of a Build, exported as PNG. Shows the master-trait tables in their full 3-styles × 4-ranks selection structure (a flat "selected traits" list is too hard to copy from) — revisit only if the layout prototype proves it can't fit.
- **Editor** — the interactive UI that mutates a Build; separate from the Card.
