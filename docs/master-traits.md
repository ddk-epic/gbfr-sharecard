# Master traits

A character's three **styles**, each with four **rank** sections. All selections across all three styles active at once. Archive version 2.0.2. See [archive.md](archive.md).

Archive reconciled with authored data on cell counts, style titles, perks; cell wording stays hand-authored.

## The skillboard

The game calls it the skillboard; there is no `master_trait` table. System = **skillboard**, ten tables:

| Table                            | Rows | Holds                                         |
| -------------------------------- | ---- | --------------------------------------------- |
| `skillboard_layout`              | 2895 | one row per cell - category, group, character |
| `skillboard_effect`              | 2895 | what a cell does                              |
| `skillboard_effect_action_parts` | 2915 | effect values and conditions                  |
| `skillboard_ui`                  | 2895 | cell's ability references                     |
| `skillboard_category`            | 4    | the styles                                    |
| `skillboard_group`               | 4    | the ranks                                     |
| `skillboard_unlock`              | 50   | node budget per master level                  |
| `skillboard_auto_acquire`        | 1450 | unexplained - 50 rows per character           |

`skillboard_layout`, `skillboard_effect`, `skillboard_ui`: all 2895 rows, one per cell, joined by key.

Three styles on `chara` itself, `SkillboardCategoryId1/2/3` - same three keys for every character:

| Category   | Style   |
| ---------- | ------- |
| `SB_DEF`   | Insight |
| `SB_ATK`   | Essence |
| `SB_LIMIT` | Crux    |

Mapping read off perk node names - `TXT_SB_NAME_PL0400_SP000` = "Insight: Pure Concentration", sits in `SB_DEF`. Doesn't follow key names: `SB_ATK` is Essence, not Crux.

A fourth category exists, keyed only by hash (`544087E7`), no character references it.

## Ranks

Ranks carry the budget. `skillboard_group`: four rows, headers name **none** of its columns:

| Group key  | Unk2 | Unk3 | Unk4 |
| ---------- | ---- | ---- | ---- |
| `68DE92AC` | 10   | 10   | 1    |
| `A96D9EBC` | 10   | 20   | 3    |
| `4A5DDC7B` | 10   | 30   | 5    |
| `3B99904D` | 20   | 30   | 5    |

`Unk2` corroborated: `10/10/10/20` = per-rank point pool, one point per selection, matches `skillboard_unlock` totals. `Unk3`/`Unk4` unexplained. `Unk3` fits "master level this rank is fully funded" for three of four rows, breaks on EX (funded at 50, not 30) - not safe to use.

Rank 2/3 not distinguishable by cell count (both 9), but perk nodes settle order independently: `SP` indices run `0/1/2` across `68DE92AC/A96D9EBC/4A5DDC7B`, each perk's text builds on the one before.

**PWR corroborates it**: `4A5DDC7B` carries the rank-3 weight in `chara_power_skillboard_rank_adjust`. Derivation in [research/pwr-formula.md](../research/pwr-formula.md).

`skillboard_category` = `3/6/6` on all four rows - perk thresholds, universal not per-character, per rank not per style total. See [the perks](#the-three-perks).

## The points

The points are earned, one per master level. `skillboard_unlock`: 50 rows, master level 1-50, each grants one point to one rank:

| Master level | Grants                    | Running total |
| ------------ | ------------------------- | ------------- |
| 1-10         | +1 Rank 1 point per level | Rank 1 = 10   |
| 11-20        | +1 Rank 2 point per level | Rank 2 = 10   |
| 21-30        | +1 Rank 3 point per level | Rank 3 = 10   |
| 31-50        | +1 EX point per level     | EX = 20       |

Totals `10/10/10/20` = `skillboard_group.Unk2` exactly - the sum of fifty master levels.

Rank opens on first point:

| Rank | Opens at master level | Fully funded at |
| ---- | --------------------- | --------------- |
| 1    | 1                     | 10              |
| 2    | 11                    | 20              |
| 3    | 21                    | 30              |
| EX   | 31                    | 50              |

Every cell costs 1 point regardless of rank - a rank's pool is its cell count.

Every fifth master level also carries flat stats, same table:

| Level  | HP   | ATK  | DMG Cap |
| ------ | ---- | ---- | ------- |
| 2, 5   | +400 | +200 | +5      |
| 10, 15 | +500 | +250 | +6      |
| 20, 25 | +600 | +300 | +7      |
| 30, 35 | +600 | +300 | +10     |
| 40, 45 | +600 | +300 | +12     |
| 50     | +600 | +300 | +20     |

Master level 50: **+6000 HP, +3000 ATK, +100 DMG Cap** from levels alone, before any point spent. Level 1: point, no stats. Stat awards start level 2.

## Rank cost, in MSP

`chara_master_exp.TotalMSP`: **56 rows = levels 0-55**, row _n_ = level _n-1_ (zero-based, two leading zeros = level 0 and free level 1). Confirmed in game: level 2 costs 3,000 = row 3.

| Levels | MSP     |
| ------ | ------- |
| 1      | free    |
| 2-6    | 3,000   |
| 7-9    | 5,000   |
| 10-14  | 7,500   |
| 15-17  | 10,000  |
| 18-19  | 12,000  |
| 20-23  | 15,000  |
| 24-27  | 17,000  |
| 28-29  | 20,000  |
| 30-39  | 50,000  |
| 40-49  | 75,000  |
| 50     | 99,999  |
| 51     | 200,000 |
| 52     | 250,000 |
| 53     | 320,000 |
| 54     | 400,000 |
| 55     | 500,000 |

Cumulative MSP per rank:

| Rank opens                 | Cumulative MSP |
| -------------------------- | -------------- |
| Rank 1 (level 1)           | 0              |
| Rank 2 (level 11)          | 45,000         |
| Rank 3 (level 21)          | 151,500        |
| EX (level 31)              | 389,500        |
| EX fully funded (level 50) | **1,639,499**  |
| Level cap (level 55)       | 3,309,499      |

`99,999` at level 50 is the game's own value - every cumulative total from 50 up ends in `499` because of it.

## Master levels 51-55

`skillboard_unlock` stops at 50; the cost table runs five levels further, costing 1,670,000 MSP between them - more than everything before 50 combined. No master-trait points granted.

They buy **Unbound Master** (weapon trait): _"Boosts damage cap based on master level."_ The only trait with a 55-step ladder, steps = master levels:

| Master level | Damage cap    | Step             |
| ------------ | ------------- | ---------------- |
| 1-50         | 0.5% → 25%    | +0.5 per level   |
| 51-55        | 30% → **50%** | **+5 per level** |

Rate goes up **tenfold** past 50. Last five levels double the trait's value.

Unbound Master sits in slot 5 of a maxed Terminus weapon - the weapon opens the trait, master traits set its level. See [weapons.md](weapons.md#transcendence-step-unlocks) - Terminus slot 5 tops at `1` where every other series reaches 15: a switch, not a ladder.

## Cell counts

`skillboard_layout` grouped by category/group, one character:

| Rank            | Cells in archive |
| --------------- | ---------------- |
| 1 (`68DE92AC`)  | 5                |
| 2 (`A96D9EBC`)  | 9                |
| 3 (`4A5DDC7B`)  | 9                |
| EX (`3B99904D`) | 10               |

Identical across styles - 33 per style, 99 per character.

Authored data: `4/8/8/10`, one fewer in ranks 1-3, same in EX. **Extra node = the rank's perk.** Not `skillboard_auto_acquire` (returns no rows for these three; ordinary cells hit it once or three times). Authored grids complete: rank grid is 4 wide, not 5.

## The three perks

The three perks are the style's mechanic. Each style: three perk nodes, one in ranks 1/2/3, **none in EX**. Not bonus lines - the character's style mechanic and its two upgrades; `skillboard_effect` points each at its own text pair. Io's `SB_DEF` (Insight):

| Rank | Index | Name string                | Text                                        |
| ---- | ----- | -------------------------- | ------------------------------------------- |
| 1    | 0     | `TXT_SB_NAME_PL0400_SP000` | introduces Superstar, rewrites Stargaze V   |
| 2    | 1     | -                          | `SP001` - what gaining a Superstar lvl does |
| 3    | 2     | -                          | `SP002` - raises Superstar's max lvl        |

`skillboard_layout.Unk30` indexes `0/1/2` for `SB_DEF`, `100/101/102` for `SB_ATK`, `200/201/202` for `SB_LIMIT` - matches `SP0xx/SP1xx/SP2xx` text keys, trailing digit = rank. `Unk25` reads 100 on a perk node vs. 50 on ordinary - verified on two characters.

**Only rank 1 carries a `NAME` string** - the in-game header, source of the per-character title.

Rank 2/3 read as nonsense without rank 1 (modify an effect rank 1 introduces) - confirmed in game: **a rank's perk requires the rank below it.**

- A perk activates when **its own rank section, in that style**, holds `3/6/6` selections - section's own count, never style total.
- Also requires the perk below it - active perks always a prefix. Empty rank 2 leaves rank 3 dark regardless.
- **EX has no perk** - its 20 points feed no threshold.
- None enforced. Any cell selectable any time; thresholds only decide display.

Cells whose description opens `"<Style> Rank II:"` modify the perk mechanic - `MasterTraitCell.perkRank`. Not what lights a cell up: the game lights every selected cell in a rank section once that section clears its threshold, regardless of a cell's own `perkRank`.

## Icons

Icons are incomplete. Cell icons from `common_icon_lb`/`common_icon_lb02`, keyed by `limit_bonus.IconId` - see [archive.md](archive.md#icon-classes).

- **`pl2100` and above referenced but absent** - `limit_bonus` names icons for characters missing from both atlases.
- **19 ids match no sprite anywhere** - `cm00`-`cm09`, `sp01`-`sp08`.

Moot while mastery icons unshipped; matters if a visual ticket wants a full icon set.

## Style titles

Each style has a per-character title. In-game header: `"<word>: <title>"` - e.g. Io's Insight page: "Insight: Pure Concentration". Leading word (Insight/Essence/Crux) universal. Full string in archive as rank 1 perk node's `NAME` text (`TXT_SB_NAME_<player>_SP000/100/200`); authored titles transcribed from screenshots, agree with it.

Catalog stores only the title half, on the style object (`masterTraits.<style>.title`) - the word isn't repeated since it's the object's key. Rendering composes the two.

## Implementation

**Master-trait data is hand-authored.** Transcribed from screenshots, merged per style by `tools/mt-card`, lives in `src/catalog/characters/<character>.json` - three styles × four ranks of cells, each with `id`, `label`, `description`. Archive tables above are for cross-checking, not source.

Cell order in the authored catalog _is_ the table layout the card renders. A build stores selected cell ids per style/rank; perk state derived by `src/domain/master-traits.ts`, never stored.

Perks themselves not modelled - names/descriptions in the archive, project holds none of it beyond the rank-1 title half and the activation thresholds.

**The pool is enforced, the thresholds are not.** Editor refuses a pick once a rank's 10 (or EX's 20) points are spent across the three styles, dims cells it won't take; a picked cell can always be un-picked. Nothing enforces reaching or ignoring a threshold. Enforcing the pool keeps a card from claiming perks the game can't fund: all three styles at `3/6/6` needs 45 points against 30 held by ranks 1-3. Builds saved before this was enforced stay as-is and can only shrink - `hydrate` keeps or discards a build whole.
