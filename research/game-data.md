# GBFR game data — source research

Ticket: `wayfinder/tickets/002-source-game-data.md`
Date: 2026-07-22

## Headline findings

1. **Maygi's Relink Damage Calculator sheet is publicly reachable AND machine-exportable.**
   The sheet (`docs.google.com/spreadsheets/d/1RnNLfdqFCW7zWvfHnQsNRJoi7EtIjdOUg-uYB0xsZHQ`) is
   link-viewable ("File → Make a Copy" workflow) and every tab exports as clean CSV via the
   gviz endpoint — no auth, no scraping:

   ```
   https://docs.google.com/spreadsheets/d/1RnNLfdqFCW7zWvfHnQsNRJoi7EtIjdOUg-uYB0xsZHQ/gviz/tq?tqx=out:csv&sheet=<TabName>
   ```

   Verified tabs: `MasterTraits` (16.6 KB), `Sigils` (23.5 KB), `Constants` (14.8 KB), `Io`
   (3.7 KB). Tab list (from the doc): Calculator, Additional Resources, Version Log,
   MasterTraits, per-character sheets (Io, Tweyen, Seofon, Cagliostro, Captain, Ferry, Vane,
   Lancelot, Rackam, Narmaya, Vaseraga, Siegfried, Charlotta, Id, Zeta, Ghandagoza, Rosetta,
   Percival, Katalina, Eugen, Yodarha, Sandalphon), Sigils, SigilValidation, Constants,
   StringConstants, WeaponConstants, WeaponValidation, Template.

   **The chartered "hand-transcription fallback" is unnecessary — it can be a scripted CSV export.**

2. **Two open-source repos already encode most of the model:**
   - [`arveoncode/relink-damage`](https://github.com/arveoncode/relink-damage) — the web-app
     port of Maygi's calculator (relink-damage.vercel.app). TypeScript constants for trait
     level→value curves, sigil max levels, sigil colors/images, over-mastery input schema,
     plus a gbfr-logs-hash → calculator-trait mapping. No LICENSE file (ask before wholesale reuse).
   - [`BitterG/GBFR-PE-Patch-Tool`](https://github.com/BitterG/GBFR-PE-Patch-Tool) — save
     editor with a `data/` directory of audited JSON catalogs: `sigils.json` (187 sigils,
     English names, primary trait, max levels, allowed secondary traits), `traits.json`
     (166 traits with max levels + primary/secondary flags), `wrightstone_traits.json`,
     `wrightstones.json`, `summons.json`, `secondary-trait-rules.json`. Sourced from
     Nenkai's datamined ID tables. No LICENSE file; UI is Chinese but sigil/trait
     display names are English.

3. Canonical ID ground truth: [Nenkai's Relink modding site](https://nenkai.github.io/relink-modding/resources/trait_skill_ids/)
   (SKILL_xxx ids + hashes, interpolated from the game's `text.msg`) and
   [`false-spring/gbfr-logs`](https://github.com/false-spring/gbfr-logs) (MIT) whose
   `src-tauri/lang/en/{sigils,traits,overmasteries}.json` map every in-game hash to an
   English display name (805 sigils incl. all "+" variants, 165 traits, 258 overmastery ids).

---

## Item 1 — Global sigil list (trait(s), max level, "+" flag)

**Best source:** `BitterG/GBFR-PE-Patch-Tool` → `data/sigils.json` (JSON, 936 KB, 187 entries)
cross-checked with Maygi's `Constants` tab (dropdown of 63 calculator-recognized sigils with
max trait level per sigil) and `relink-damage` `src/constants/gear/sigils.ts` /
`sigilLevels.ts` (trait level→value tables, level 0–65).

**Format / shape** (`sigils.json` entry):

```json
{
  "internalId": "GEEN_000_24",
  "hash": "0x2D7F2E70",
  "displayName": "Attack Power V+",
  "supportsSecondaryTrait": true,
  "maxSigilLevel": 15,
  "primaryTraitId": "SKILL_000_00",
  "primaryTraitName": "ATK",
  "firstTraitMaxLevel": 50,
  "allowedSecondaryTraitIds": ["SKILL_000_00", "SKILL_001_00", "..."]
}
```

"+" detection: the `GEEN_xxx_9x` / `_2x` internal-id suffix and the `+` in `displayName`
(`isPlusSigil` field exists but is null in the current draft); `supportsSecondaryTrait`
is populated. gbfr-logs `lang/en/sigils.json` gives the full 805-entry hash→name catalog
including every roman-numeral tier and `+` variant, e.g.
`"02ba37a3": {"key": "GEEN_154_14", "text": "Berserker V+"}`.

Maygi's Constants tab additionally distinguishes the sharecard-relevant view: sigil name →
max *trait* level (e.g. Damage Cap 65, Attack Power 50, Stun Power 45, most others 30,
Celestials/echo sigils 15) and the color/category + allowed-second-trait color classes.

**Completeness:** high — every sigil in the current game (Endless Ragnarok 1.3.x era).
**License/access:** PE-Patch-Tool: public repo, no license file (data is game facts —
uncopyrightable facts, but ask/attribute). gbfr-logs: MIT. Maygi sheet: no explicit
license; author invites copying ("File → Make a Copy") and community contribution —
attribution to @Maygi expected. Human-readable cross-checks: [game8 List of All Sigils](https://game8.co/games/Granblue-Fantasy-Relink/archives/606855),
[relink.gbf.wiki/Sigils](https://relink.gbf.wiki/Sigils).

## Item 2 — Wrightstone traits + level ranges

**Best source:** Maygi's `Constants` tab, "Wrightstone Stats" dropdown column — the exact
list of 43 traits the calculator allows on a wrightstone (CSV-exportable, column 3):

```
Damage Cap, Attack Power, Stun Power, HP, Critical Hit Rate, Critical Damage,
Linked Together, Stamina, Enmity, Tyranny, Concentrated Fire, Quick Charge,
Charged Attack, Lucky Charge, Skilled Assault, Life on the Line, Injury to Insult,
Less is More, Combo Booster, Combo Finisher, Exploiter, Dodge Payback, Guard Payback,
Throw, Quick Cooldown, Cascade, Uplift, Nimble Onslaught, Precise Wrath, Autorevive,
Guts, Potion Hoarder, Steady Focus, Nimble Defense, Aegis, Garrison, Steel Nerves,
Firm Stance, Status Resistance, Supplementary Damage, Glass Cannon, Head Start, Berserker
```

Level ranges: the reference sheet (see `wayfinder/assets/from.png`) caps wrightstone rows
at **20 / 15 / 10** (main / sub1 / sub2) in the Endless Ragnarok era. Launch-era sources
([game8 wrightstone guide](https://game8.co/games/Granblue-Fantasy-Relink/archives/606957),
TeamBRG) say 10 / 7 / 5 — treat 20/15/10 as current and validate against Maygi's inputs.

Secondary source: PE-Patch-Tool `data/wrightstone_traits.json` (159 trait entries with
`maxLevel`, hash, confidence flags) and `data/wrightstones.json` (the 4 max-quality
wrightstone items with hashes, e.g. `{"internalId": "ITEM_25_0131", "displayName":
"Dread Wrightstone", "defaultTraitId": "SKILL_004_00"}`). relink.gbf.wiki has only
stub pages per wrightstone (4 words each) — not useful.

**Completeness:** trait list high; per-slot level ranges medium (needs 20/15/10 vs 10/7/5
confirmation). **License:** as above.

## Item 3 — Summons (list + stat/trait contributions)

Key mechanic note: summon traits and equip bonuses are **randomly rolled**, like sigils —
so the sharecard needs (a) the summon name list and (b) the possible trait/equip-bonus
pools + ranges, not fixed per-summon stats. Maygi's sheet models this as user inputs
("Summon Stats (WIP)": main trait, e.g. War Elemental 15, plus additional stat).

**Best sources:**
- [relink.gbf.wiki/Summons](https://relink.gbf.wiki/Summons) — MediaWiki with working API
  (`/api.php?action=parse&page=Summons&prop=wikitext`; needs a browser User-Agent, plain
  fetch 403s). Contains the full summons list as `{{SummonRow|summon=…|cost=…|type=…|ele=…}}`
  wikitext and an **Equip Bonus min/max table**:

  | Bonus | Min | Max |
  |---|---|---|
  | Attack Power Up | +200 | +3000 |
  | Health Up | +200 | +5000 |
  | Critical Hit Rate Up | +2% | +30% |
  | Stun Power Up | +2 | +20 |
  | Skill Damage Up | +2% | +30% |
  | Skybound Art Damage Up | +2% | +30% |
  | Chain Burst Damage Up | +5% | +100% |
  | Normal Attack DMG Cap Up | +5% | +100% |
  | Skill DMG Cap Up | +5% | +100% |
  | Skybound Art DMG Cap Up | +5% | +100% |
  | Healing Cap Up | +5% | +75% |

  License: CC BY-NC-SA 3.0 (confirmed via `meta=siteinfo&siprop=rightsinfo`).
- [game8 List of All Summons](https://game8.co/games/Granblue-Fantasy-Relink/archives/607083)
  — ~130+ summons with element/cost/type (human-readable, no per-summon trait since rolls
  are random).
- PE-Patch-Tool `data/summons.json` — 189 entries with hash/cost/type but **Chinese**
  display names; usable for ids only.

**Completeness:** list high, trait-pool high (matches the "Summon Stats" dropdown in
Maygi's Constants: War Elemental, Berserker Echo, Spartan Echo, Supplementary Damage, …).

## Item 4 — Over Mastery bonus options + ranges

**Best sources:**
- Option list (canonical 11 rows, matches gbfr-logs `lang/en/overmasteries.json` distinct
  values): Attack Power Up, Health Up, Critical Hit Rate Up, Stun Power Up, Skill Damage Up,
  Skybound Art Damage Up, Chain Burst Damage Up, Normal Attack Damage Cap Up,
  Skill Damage Cap Up, Skybound Art Damage Cap Up, Healing Cap Up.
- Ranges: `relink-damage` `src/types/overmasteries.types.ts` (zod schema encoding the
  calculator's accepted inputs):

  ```ts
  attack: z.number().gte(0).lte(1000),
  normalDamageCapUp: z.number().gte(0).lte(20),
  skillDamageCapUp: z.number().gte(0).lte(20),
  sbaDamageCapUp:   z.number().gte(0).lte(20),
  skillDamageUp:    z.number().gte(0).lte(20),
  sbaDamageUp:      z.number().gte(0).lte(20),
  critHitRate:      z.number().gte(0).lte(20),
  ```

  Community guides ([game8](https://game8.co/games/Granblue-Fantasy-Relink/archives/606467),
  GameLeap) confirm ATK +200…+1000, HP +400…+2000, others +2%…+20%; unlocked at char
  level 80/90/100 for 700/1000/2000 MSP. Note: Maygi's sheet treats these as free numeric
  inputs, so exact roll-tier tables are not required for the sharecard.

**Completeness:** option list high; exact per-roll tier values low everywhere (nobody
publishes the roll table) — but not needed for v1.

## Item 5 — Master traits for Io (3 ranks + EX)

**Best source: Maygi's `MasterTraits` tab — full structured CSV, exactly the 3-in-1 table
the sharecard mimics.** Columns: `Character, Perk, Rank, IDs, Short, Full Text, value1,
value2, Type, Subtype1, Subtype2, Requirement, Active, Selected`. Sample rows (real
export):

```csv
"Io","Insight","1","1","SG Charge -5%","SG Charge Time 5%","0.05","","chargetime","Stargaze","","","TRUE","TRUE"
"Io","Insight","1","2","SG Cap 35%","SG DMG Cap +35%","0.35","","dmgcap","Stargaze","","","TRUE","TRUE"
"Io","Insight","1","3","DMG Cap +20%","DMG Cap +20%","0.20","","dmgcap","","","","TRUE","TRUE"
"Io","Insight","1","4","Max HP +15k","Max HP +15,000","0.00","","hp","","","","TRUE","TRUE"
"Io","Insight","2","6","(**) Stargaze V DMG +10%","Insight Rank Perk 2: While inside Concentration's AoE, Stargaze V gains DMG Dealt +10% ...","0.10","","dmgdealt","Stargaze","Superstar I","2","FALSE","FALSE"
```

Only Io is populated (sheet v3.5.0: "currently, only Io's master traits are available"),
which is exactly the v1 scope. Structure: 3 Styles (Insight "Pure Concentration",
Essence "Magic Chain", Crux "Flowery Seven Overload") × Style Ranks 1/2/3/EX, plus
Rank Perks 1–3 per style.

Cross-check (prose, not tables): [Fextralife Io Master Traits](https://granbluefantasyrelink.wiki.fextralife.com/Io+Master+Traits)
(e.g. Essence R1 "Skill CD -2%, DMG Cap +20%", R2 "Skill CD -3%, Skill DMG Cap +35%",
R3 "Chain Burst DMG Cap +40%, DMG Cap +30%", EX "ATK +20% / DMG Cap +50%") and
[game8 Master Trait Explained](https://game8.co/games/Granblue-Fantasy-Relink/archives/607822).
relink.gbf.wiki has **no** master-trait pages; `relink-damage` has **not** implemented
master traits.

**Completeness:** high for Io (the authoritative source is the very sheet we mimic).
**License:** no explicit license; attribute @Maygi; the sheet's banner invites copying.

## Item 6 — Io portrait

**Best source:** relink.gbf.wiki CDN — official character art, 2968×2160 PNG:

- `https://cdn.gbf.wiki/relink/Cmn_imgchr_0400_2.png` (the wiki's `File:Io wide.png`,
  used on [relink.gbf.wiki/Io](https://relink.gbf.wiki/Io); verified reachable, 200 OK)
- Alternative (what Maygi's own sheet uses, from the Constants tab image column):
  `https://i.imgur.com/PudUfF0.png` (Io icon, ~120 KB, verified 200 OK)

**License:** the artwork is © Cygames regardless of host (wiki text is CC BY-NC-SA, which
does not cover game assets). For a fan tool this is the community norm (game8/Fextralife/
Maygi all do the same); include a "Granblue Fantasy: Relink © Cygames" attribution line.
Best practice: download once and self-host rather than hotlink imgur/wiki CDN.

---

## Access notes / gotchas

- `relink.gbf.wiki` returns **403 to default fetchers**; works with a browser User-Agent.
  Full MediaWiki API available (`action=parse`, `action=query`), MediaWiki 1.43.
- Google Sheet gviz CSV export needs no auth; tab names with spaces must be URL-encoded.
- `game8.co` pages fetch fine but data is HTML prose/tables — use only as human cross-check.
- Fextralife pages fetch fine but have no license and are list-formatted, not tabular.
- Verified clones (for future extraction scripts): `arveoncode/relink-damage`,
  `false-spring/gbfr-logs`, `BitterG/GBFR-PE-Patch-Tool` — all clone cleanly at depth 1.

## Verdict

No hand-transcription needed. Recommended v1 pipeline:

1. Export Maygi tabs (`MasterTraits`, `Sigils`, `Constants`) via gviz CSV → seed JSON
   (traits-per-level curves, sigil dropdown + max levels, wrightstone trait list,
   Io master traits).
2. Use gbfr-logs `lang/en/*.json` (MIT) for canonical hash→name catalogs ("+"-variant
   sigil names, overmastery option names).
3. Use PE-Patch-Tool `sigils.json`/`traits.json` for sigil→trait mapping and secondary
   trait pools (verify license by asking, or re-derive from Nenkai's public ID tables).
4. Pull the summons list + equip-bonus ranges from relink.gbf.wiki via its API
   (CC BY-NC-SA, attribute).
5. Portrait: download `Cmn_imgchr_0400_2.png`, self-host, credit Cygames.
