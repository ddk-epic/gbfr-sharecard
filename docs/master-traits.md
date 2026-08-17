# Master traits

A character's three **styles**, each progressing through four **rank** sections.
All selections across all three styles are active at once. Everything here is
read out of the game archive (version 2.0.2); the tables are named so any claim
can be re-checked. See [archive.md](archive.md) for how it is extracted.

The archive side has been reconciled with the authored data on cell counts,
style titles and the perks; the cell wording itself stays hand-authored.

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
| `skillboard_auto_acquire`        | 1450 | unexplained - 50 rows per character           |

`skillboard_layout`, `skillboard_effect` and `skillboard_ui` all hold 2895 rows -
one per cell, joined by key.

A character's three styles are on the `chara` row itself, as
`SkillboardCategoryId1/2/3`. For every character they are the same three keys,
and each is one of the styles:

| Category   | Style   |
| ---------- | ------- |
| `SB_DEF`   | Insight |
| `SB_ATK`   | Essence |
| `SB_LIMIT` | Crux    |

The mapping is read off the perk node names below - `TXT_SB_NAME_PL0400_SP000`
is "Insight: Pure Concentration" and sits in `SB_DEF`. Note it does not follow
the key names: `SB_ATK` is Essence, not the damage-flavoured Crux.

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

Rank 2 and Rank 3 are also not distinguishable by cell count - both hold 9 - but
the perk nodes settle their order independently of `Unk3`: their `SP` indices run
`0 / 1 / 2` across `68DE92AC / A96D9EBC / 4A5DDC7B`, and each perk's text builds
on the one before it.

**PWR corroborates it.** Every cell selected is worth `50 x` its rank's
`chara_power_skillboard_rank_adjust` weight, and cells from the three ranks
measure 50, 100 and 150 in game - see
[stats.md](stats.md#master-traits-pay-50-a-cell-times-the-rank-weight). A rank
3 cell paying exactly three times a rank 1 cell puts `4A5DDC7B` at weight 3.
The same readings show EX cells pay 50, so its missing row in that table is a
default of 1 rather than a zero.

`skillboard_category` is `3 / 6 / 6` on every one of its four rows - the perk
thresholds, and **universal rather than per-character**. The three numbers are
per rank, not a ladder over the style's total; see
[the perks](#the-three-perks-are-the-styles-mechanic) below.

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
+100 DMG Cap** from master levels alone, before a single point is spent. Level 1
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
costs 2,000 MSP, so fully funding every master trait is worth about 820 of them.

The `99,999` at level 50 is the game's own value, not a rounding artefact here;
every cumulative total from level 50 up ends in `499` because of it.

## What levels 51-55 buy

`skillboard_unlock` stops at master level 50, but the cost table runs five
levels further, and those five cost 1,670,000 MSP between them - more than
everything before level 50 put together. They grant no master-trait points.

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
opens the trait - its level comes from the master traits. That is why
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

The authored data carries `4 / 8 / 8 / 10`, one fewer in each of ranks 1-3 and
the same in EX. **The extra node is the rank's perk** - see below. It is not
`skillboard_auto_acquire`, which was the earlier guess here: that table returns
no rows for any of the three, while ordinary cells hit it once or three times.
So the authored grids are complete, and a rank grid is 4 wide, not 5.

## The three perks are the style's mechanic

Each style holds exactly three perk nodes, one in each of ranks 1, 2 and 3 and
**none in EX**. They are not bonus lines - they are the character's style
mechanic and its two upgrades, and `skillboard_effect` points each at its own
text pair. Io's `SB_DEF` (Insight):

| Rank | Index | Name string                | Text                                          |
| ---- | ----- | -------------------------- | --------------------------------------------- |
| 1    | 0     | `TXT_SB_NAME_PL0400_SP000` | introduces Superstar, and rewrites Stargaze V |
| 2    | 1     | -                          | `SP001` - what gaining a Superstar lvl does   |
| 3    | 2     | -                          | `SP002` - raises Superstar's max lvl          |

`skillboard_layout.Unk30` indexes them `0/1/2` for `SB_DEF`, `100/101/102` for
`SB_ATK` and `200/201/202` for `SB_LIMIT`, matching the `SP0xx / SP1xx / SP2xx`
text keys; the trailing digit is the rank. `Unk25` reads 100 on a perk node
against 50 on an ordinary cell. Verified identical on two characters.

**Only the rank 1 node carries a `NAME` string**, and that name is the style's
in-game header - which is where the per-character title comes from.

Ranks 2 and 3 read as nonsense without rank 1 (they modify an effect rank 1
introduces), and the game bears that out: **a rank's perk requires the rank
below it**. The full rule, confirmed by in-game testing:

- A perk activates when **its own rank section, in that style**, holds
  `3 / 6 / 6` selections - the section's own count, never the style's total.
- A perk also requires the perk below it, so the active perks are always a
  prefix. An empty rank 2 leaves rank 3 dark however full it is.
- **EX has no perk.** Its 20 points feed no threshold.
- None of it is enforced. Any cell can be selected at any time; the thresholds
  only decide what displays as active.

Cells whose description opens `"<Style> Rank II:"` are cells that modify the
perk mechanic, and the project carries that tier as `MasterTraitCell.perkRank`.
It is **not** what lights a cell up: the game lights every selected cell in a
rank section once that section clears its threshold, wherever a cell's own
`perkRank` points.

## Icons are incomplete

Cell icons come from the `common_icon_lb` / `common_icon_lb02` atlases, keyed by
`limit_bonus.IconId` - see
[archive.md](archive.md#icon-classes-not-extracted). Two gaps sit there:

- **`pl2100` and above are referenced but absent.** `limit_bonus` names icons
  for those characters that exist in neither atlas.
- **19 ids match no sprite anywhere** - `cm00`-`cm09` and `sp01`-`sp08`.

Both are moot while mastery icons are not shipped, but they decide whether a
full icon set is even reachable if a visual ticket wants one.

## Each style has a per-character title

The in-game header above a style's grid reads "`<word>: <title>`" - e.g. Io's
Insight page is headed "Insight: Pure Concentration". The leading word
(Insight/Essence/Crux) is universal, the same for every character. The whole
string is in the archive, as the rank 1 perk node's `NAME` text
(`TXT_SB_NAME_<player>_SP000/100/200`); the authored titles were transcribed
from screenshots and agree with it.

The catalog stores only the title half, on the style object itself
(`masterTraits.<style>.title`) - the word is never repeated in data since
it's already the object's key. Rendering composes the two.

## What this project uses

**Master-trait data is hand-authored and stays that way.** It is transcribed
from in-game screenshots, merged per style by `tools/mt-card`, and lives in
`src/catalog/characters/<character>.json` as three styles × four ranks of cells,
each with an `id`, a short `label` and a longer `description`. The archive
tables above are recorded for cross-checking, not as a source - the decision to
author them is about control over wording and layout, not about availability.

Cell order in the authored catalog _is_ the table layout the card renders. A
build stores the set of selected cell ids per style and rank; perk state is
derived from those by `src/domain/master-traits.ts`, never stored.

The perks themselves are not modelled. Their names and descriptions are in the
archive but the project holds none of it - only the rank 1 name's title half,
and the thresholds needed to tell whether a perk is live. A build does not need
to know what a perk does to show that it fired.

**The pool is enforced, the thresholds are not.** The editor refuses a pick once
a rank's 10 (or EX's 20) points are spent across the three styles, and dims the
cells it will not take; a picked cell can always be un-picked. Nothing stops a
build from reaching a threshold or from ignoring one. Enforcing the pool is what
keeps a card from claiming perks the game cannot fund: all three styles clearing
`3 / 6 / 6` would need 45 points against the 30 that ranks 1-3 hold. Builds saved
before this was enforced stay as they are and can only shrink - `hydrate` keeps
or discards a build whole, and clamping would pick which selections to lose.
