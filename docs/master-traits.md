# Master traits

A character's three **styles**, each progressing through four **rank** sections.
All selections across all three styles are active at once. Everything here is
read out of the game archive (version 2.0.2); the tables are named so any claim
can be re-checked. See [archive.md](archive.md) for how it is extracted.

This page is a head start. The archive side below is newly found and has not
been reconciled with the authored data.

## The game calls it the skillboard

There is no `master_trait` table. The system is **skillboard**, ten tables:

| Table                            | Rows | Holds                                         |
| -------------------------------- | ---- | --------------------------------------------- |
| `skillboard_layout`              | 2895 | one row per cell - category, group, character |
| `skillboard_effect`              | 2895 | what a cell does                              |
| `skillboard_effect_action_parts` | 2915 | the effect's values and conditions            |
| `skillboard_ui`                  | 2895 | the cell's ability references                 |
| `skillboard_category`            | 4    | the styles                                    |
| `skillboard_group`               | 4    | the ranks                                     |
| `skillboard_unlock`              | 50   | node budget per master level                  |
| `skillboard_auto_acquire`        | 1450 | cells granted rather than chosen              |

`skillboard_layout`, `skillboard_effect` and `skillboard_ui` all hold 2895 rows -
one per cell, joined by key.

A character's three styles are on the `chara` row itself, as
`SkillboardCategoryId1/2/3`. For every character they are the same three keys:

```
SB_DEF · SB_ATK · SB_LIMIT
```

A fourth category exists, keyed only by hash (`544087E7`), that no character
references.

## Ranks carry the budget

`skillboard_group` is four rows, and the headers name **none** of its columns:

| Group key  | Unk2 | Unk3 | Unk4 |
| ---------- | ---- | ---- | ---- |
| `68DE92AC` | 10   | 10   | 1    |
| `A96D9EBC` | 10   | 20   | 3    |
| `4A5DDC7B` | 10   | 30   | 5    |
| `3B99904D` | 20   | 30   | 5    |

Only `Unk2` is corroborated: `10 / 10 / 10 / 20` is the per-rank point pool,
shared across all three styles with every selection costing one point, and it
matches the totals `skillboard_unlock` hands out. `Unk3` and `Unk4` are
unexplained. `Unk3` fits "master level at which this rank is fully funded" for
three of the four rows and then breaks on EX, which is funded at 50 rather than
30, so the reading is not safe to use.

Rank 2 and Rank 3 are also not distinguishable by cell count - both hold 9 - so
which group key is which rests on `Unk3` increasing with rank. That is an
assumption, not a proof.

`skillboard_category` is `3 / 6 / 6` on every one of its four rows - the perk
thresholds, and **universal rather than per-character**.

## The points are earned, one per master level

`skillboard_unlock` is 50 rows, one per master level 1-50, each granting a
single point to exactly one rank:

| Master level | Grants                    | Running total |
| ------------ | ------------------------- | ------------- |
| 1-10         | +1 Rank 1 point per level | Rank 1 = 10   |
| 11-20        | +1 Rank 2 point per level | Rank 2 = 10   |
| 21-30        | +1 Rank 3 point per level | Rank 3 = 10   |
| 31-50        | +1 EX point per level     | EX = 20       |

Totals `10 / 10 / 10 / 20`, which is exactly `skillboard_group.Unk2`. So that
column is not an independent constant - it is the sum of what fifty master
levels hand out.

A rank opens when its first point arrives, so the gate is master level:

| Rank | Opens at master level | Fully funded at |
| ---- | --------------------- | --------------- |
| 1    | 1                     | 10              |
| 2    | 11                    | 20              |
| 3    | 21                    | 30              |
| EX   | 31                    | 50              |

Every cell costs exactly 1 point regardless of rank, so a rank's pool is simply
the number of cells that can be taken in it - which is why high-rank selections
are mutually exclusive in practice.

Every fifth master level also carries flat stats, in the same table:

| Level  | HP   | ATK  | DMG Cap |
| ------ | ---- | ---- | ------- |
| 2, 5   | +400 | +200 | +5      |
| 10, 15 | +500 | +250 | +6      |
| 20, 25 | +600 | +300 | +7      |
| 30, 35 | +600 | +300 | +10     |
| 40, 45 | +600 | +300 | +12     |
| 50     | +600 | +300 | +20     |

A character at master level 50 has therefore gained **+6000 HP, +3000 ATK and
+100 DMG Cap** from the board itself, before a single point is spent. Level 1
grants a point but no stats; the stat awards start at level 2.

## What a rank costs in MSP

Master levels are bought with **MSP**, and `chara_master_exp` holds the
cumulative total as a single column, `TotalMSP`. Its **56 rows are levels 0
to 55**, so row _n_ is level _n-1_ - the table is zero-based, and the two
leading zeros are level 0 and the free first level. Confirmed in game: reaching
level 2 costs 3,000, which is row 3.

The cost of each level:

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

So reaching each rank costs, cumulatively:

| Rank opens                 | Cumulative MSP |
| -------------------------- | -------------- |
| Rank 1 (level 1)           | 0              |
| Rank 2 (level 11)          | 45,000         |
| Rank 3 (level 21)          | 151,500        |
| EX (level 31)              | 389,500        |
| EX fully funded (level 50) | **1,639,499**  |
| Level cap (level 55)       | 3,309,499      |

For scale, a Large meditation - the tier this project uses for over-masteries -
costs 2,000 MSP, so a fully funded board is worth about 820 of them.

The `99,999` at level 50 is the game's own value, not a rounding artefact here;
every cumulative total from level 50 up ends in `499` because of it.

## What levels 51-55 buy

`skillboard_unlock` stops at master level 50, but the cost table runs five
levels further, and those five cost 1,670,000 MSP between them - more than
everything before level 50 put together. They grant no board points.

What they buy is the **Unbound Master** weapon trait, which the game describes
as _"Boosts damage cap based on master level."_ It is the only trait in the
archive with a 55-step ladder, and the steps are the master levels:

| Master level | Damage cap    | Step             |
| ------------ | ------------- | ---------------- |
| 1-50         | 0.5% → 25%    | +0.5 per level   |
| 51-55        | 30% → **50%** | **+5 per level** |

The rate goes up **tenfold** past 50. The last five levels double the trait's
value, from 25% to 50%, which is what the disproportionate cost is paying for.

Unbound Master sits in slot 5 of a maxed Terminus weapon, so the weapon only
opens the trait - its level comes from the board. That is why
[weapons.md](weapons.md) records Terminus slot 5 topping out at `1` where every
other series reaches 15: the slot is a switch, not a ladder.

## Cell counts

`skillboard_layout` grouped by category and group, for one character:

| Rank            | Cells in archive |
| --------------- | ---------------- |
| 1 (`68DE92AC`)  | 5                |
| 2 (`A96D9EBC`)  | 9                |
| 3 (`4A5DDC7B`)  | 9                |
| EX (`3B99904D`) | 10               |

Identical across all three styles, giving 33 cells per style and 99 per
character.

**This is one more than the authored data holds in ranks 1-3**, which carry
`4 / 8 / 8 / 10`. `skillboard_auto_acquire` is the likely explanation - a cell
granted outright rather than chosen would appear in the layout and not on a
selection grid - but that has not been confirmed.

## Icons are incomplete

Cell icons come from the `common_icon_lb` / `common_icon_lb02` atlases, keyed by
`limit_bonus.IconId` - see
[archive.md](archive.md#icon-classes-not-extracted). Two gaps sit there:

- **`pl2100` and above are referenced but absent.** `limit_bonus` names icons
  for those characters that exist in neither atlas.
- **19 ids match no sprite anywhere** - `cm00`-`cm09` and `sp01`-`sp08`.

Both are moot while mastery icons are not shipped, but they decide whether a
full icon set is even reachable if a visual ticket wants one.

## What this project uses

**Master-trait data is hand-authored and stays that way.** It is transcribed
from in-game screenshots, merged per style by `tools/mt-card`, and lives in
`src/data/characters/<character>.json` as three styles × four ranks of cells,
each with an `id`, a short `label` and a longer `description`. The archive
tables above are recorded for cross-checking, not as a source - the decision to
author them is about control over wording and layout, not about availability.

Cell order in the authored catalog _is_ the table layout the card renders. A
build stores the set of selected cell ids per style and rank; perk state is
derived from those, never stored.

The cell-count discrepancy is worth settling before the Master Traits section
lands, since it decides whether a rank grid is 4 or 5 wide.
