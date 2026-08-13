# Wrightstones

The items that imbue a weapon with extra traits. Everything here is read out of
the game archive (version 2.0.2); the tables are named so any claim can be
re-checked. See [archive.md](archive.md) for how it is extracted.

## The game calls them pendulums

There is no `wrightstone` table. The item is a **pendulum**, and its family
mirrors the sigil family one for one:

| Table                  | Rows | Holds                                    |
| ---------------------- | ---- | ---------------------------------------- |
| `item_pendulum`        | 74   | every wrightstone variant and its rolls  |
| `item`                 | -    | the display name, rarity and description |
| `skill_level_lot`      | -    | which level a roll lands on              |
| `item_pendulum_sell`   | -    | shop pricing                             |
| `item_pendulum_ticket` | -    | voucher exchange                         |

Every one of the 74 `item_pendulum` rows joins to a real `item` row, so nothing
in the table is orphaned data.

## Four stones, one per main trait

`item_pendulum.MainSkill` is fixed per row, and the item name follows from it.
Five key prefixes appear; four of them are named:

| Keys        | Item name                   | Main trait        | `skill` key    | Rows |
| ----------- | --------------------------- | ----------------- | -------------- | ---- |
| `ITEM_25_*` | _Dread Wrightstone_         | Stun Power        | `SKILL_004_00` | 17   |
| `ITEM_26_*` | _Vitality Wrightstone_      | Critical Hit Rate | `SKILL_003_00` | 17   |
| `ITEM_27_*` | _Fortification Wrightstone_ | HP                | `SKILL_001_00` | 17   |
| `ITEM_28_*` | _Sequestration Wrightstone_ | Weak Point DMG    | `SKILL_014_00` | 17   |
| `ITEM_24_*` | **(unnamed)**               | Linked Together   | `SKILL_009_00` | 2    |
| `ITEM_24_*` | **(unnamed)**               | Drain             | `SKILL_067_00` | 4    |

**The `ITEM_24` six carry an empty `ItemName` hash** - no English string, no
name in any language file. Linked Together and Drain wrightstones exist in the
table and not in the game. Their level ladder is also stunted: Drain tops out at
main level 7, Linked Together never leaves the lot.

So the main trait is not a choice made per stone. **A wrightstone _is_ its main
trait**, and there are four of them.

## Seventeen variants per stone

Each named stone has 14 `ITEM_*` rows plus 3 rows keyed by hash rather than by
`ITEM_` prefix. The hash-keyed ones are later additions - all four families gain
the same three - and they are ordinary named items, not internal rows.

The variants split into two kinds. **Rolled** stones carry empty `SubSkill1/2`
and point at a `skill_level_lot`; **preset** stones name their sub traits and
levels outright.

Rolled - identical across all four families:

| Key     | Rarity | Main level      | Sub 1 level     | Sub 2 level     |
| ------- | ------ | --------------- | --------------- | --------------- |
| `_0000` | 3      | lot 0 → 3-5     | -               | -               |
| `_0001` | 3      | lot 1 → 4-7     | lot 2 → 1-4     | -               |
| `_0010` | 3      | lot 3 → 5-7     | lot 4 → 5       | lot 5 → 2-5     |
| `_0011` | 3      | lot 6 → 5-8     | lot 7 → 5       | -               |
| `_0012` | 4      | lot 8 → 7-10    | lot 9 → 5-7     | lot 10 → 3-5    |
| `_0020` | 4      | lot 11 → 9-10   | lot 12 → 6-7    | lot 13 → 4-5    |
| `_0130` | 5      | lot 14 → 10/15  | lot 15 → 7/10   | lot 16 → 5/7    |
| `_0131` | 5      | lot 17 → **20** | lot 18 → **15** | lot 19 → **10** |

Preset - the sub traits are written into the row:

| Key     | Rarity | Main level | Sub 1             | Sub 2     |
| ------- | ------ | ---------- | ----------------- | --------- |
| `_9999` | 3      | 2          | -                 | -         |
| `_1000` | 3      | 3          | Aegis 1           | -         |
| `_1001` | 3      | 4          | Aegis 2           | -         |
| `_1002` | 3      | 6          | Aegis 2           | ATK 1     |
| `_1003` | 3      | 7          | Aegis 3           | ATK 2     |
| `_0030` | 4      | 9          | per family, below | ”         |
| hash    | 4      | 9          | per family, below | DMG Cap 3 |
| hash    | 4      | 10         | per family, below | DMG Cap 5 |
| hash    | 5      | **20**     | Aegis 15          | ATK 10    |

The per-family preset pairs:

| Stone         | `_0030` (lv 9)                      | hash (lv 9)        | hash (lv 10)        |
| ------------- | ----------------------------------- | ------------------ | ------------------- |
| Dread         | Linked Together 5 · Uplift 3        | Nimble Onslaught 5 | Autorevive 7        |
| Vitality      | Critical Hit DMG 5 · Steel Nerves 3 | Tyranny 5          | Supplementary DMG 7 |
| Fortification | Aegis 5 · Drain 3                   | Aegis 5            | Greater Aegis 7     |
| Sequestration | Quick Cooldown 5 · Cascade 3        | Uplift 5           | Guts 7              |

## The two rarity-5 level sets

`_0131` is the top stone, and its three lots each hold a **single** outcome: lot
17 is level 20 alone, lot 18 is level 15, lot 19 is level 10. A `_0131` roll
cannot come out any other way. The hash-keyed rarity-5 preset reaches the same
20 / 15 / 10 by naming Aegis 15 and ATK 10 outright.

`_0130` is the other rarity-5 stone, and it is the step below. Its three lots
each hold **two** equally-weighted outcomes - main 10 or 15, sub1 7 or 10, sub2
5 or 7 - which read as two tiers:

| Tier  | Main | Sub 1 | Sub 2 |
| ----- | ---- | ----- | ----- |
| upper | 15   | 10    | 7     |
| lower | 10   | 7     | 5     |

So the endgame level sets are **20 / 15 / 10** and **15 / 10 / 7**, with
10 / 7 / 5 as `_0130`'s lower tier. The three lots are stored independently, so
the table does not itself forbid a mixed draw such as 15 / 7 / 7; the tiering is
what the paired values imply, not something the archive states.

`LvPrimarySkill` never exceeds 20, `LvSubSkill1` never exceeds 15 and
`LvSubSkill2` never exceeds 10, across all 74 rows.

## The level lots

`skill_level_lot` is 20 chance columns and a key. The 20 lots the wrightstones
reference:

| Lot | Distribution         | Lot | Distribution   |
| --- | -------------------- | --- | -------------- |
| 0   | 3:40 4:40 5:20       | 10  | 3:33 4:34 5:33 |
| 1   | 4:40 5:30 6:20 7:10  | 11  | 9:70 10:30     |
| 2   | 1:25 2:25 3:25 4:25  | 12  | 6:70 7:30      |
| 3   | 5:50 6:30 7:20       | 13  | 4:70 5:30      |
| 4   | 5:100                | 14  | 10:1 15:1      |
| 5   | 2:25 3:25 4:25 5:25  | 15  | 7:1 10:1       |
| 6   | 5:40 6:30 7:20 8:10  | 16  | 5:1 7:1        |
| 7   | 5:100                | 17  | 20:1           |
| 8   | 7:40 8:30 9:20 10:10 | 18  | 15:1           |
| 9   | 5:50 6:30 7:20       | 19  | 10:1           |

**Lots 0-13 are percentages summing to 100. Lots 14-19 are not** - they hold
equal counts of 1, so they read as an even pick among the levels listed. Two
different conventions in one table; a reader that assumes basis points or
percentages gets lots 14-19 wrong.

`WeightSubSkill1/2` is a separate thing: it gates **whether** a sub rolls at
all, not which one. It is 100 on the rolled stones that have that sub and 0
where the sub is absent. The unnamed `ITEM_24` pair is the only place it takes
another value - 40 and 20.

## The sub trait pool

On every rolled stone `SubSkill1` and `SubSkill2` are **empty strings**; only
the sub's _level_ is lotted. The traits come from `skill_lot`.

`skill_lot` is 439 rows in 36 groups, and **the union of all 36 groups is 72
traits**. The groups are six slices of that one pool, repeated over several
generations of the table: 4 basic, 21 offense, 22 defense, 8 sustain, 8 special,
9 heavy-hitters. A lot names which slices it draws and at what odds - the widest,
`skill_type_lot` row 16, draws all six and so reaches all 72. **There is one
random-trait pool in the archive, and this is it.** See [sigils.md](sigils.md)
for how sigils draw on it.

The 72, by slice:

**Basic (4)** ATK · HP · Critical Hit Rate · Stun Power

**Offense (21)** Enmity · Stamina · Charged Attack DMG · Linked Together · Throw
DMG · Critical Hit DMG · Weak Point DMG · Combo Finisher DMG · Concentrated Fire
· DMG Cap · Combo Booster · Tyranny · Lucky Charge · Injury to Insult ·
Overdrive Assassin · Break Assassin · Guard Payback · Dodge Payback · Skilled
Assault · Life on the Line · Quick Charge

**Defense (22)** Garrison · Aegis · Improved Guard · Improved Dodge · Steel
Nerves · Nimble Defense · Precise Resilience · Firm Stance · and the fourteen
resistances - ATK↓ · DEF↓ · Poison · Burn · Blight · Sandtomb · Glaciate ·
Darkflame · Dizzy · Paralysis · Slow · Held Under · Skill Sealed · SBA Sealed

**Sustain (8)** Improved Healing · Regen · Drain · Quick Cooldown · Cascade ·
Uplift · Nimble Onslaught · Precise Wrath

**Special (8)** Guts · Autorevive · Potion Hoarder · Low Profile · Provoke ·
Fast Learner · Rupie Tycoon · Steady Focus

**Heavy-hitters (9)** Stronghold · Power Hungry · Path to Mastery ·
Supplementary DMG · Less Is More · Head Start · Berserker · Glass Cannon ·
Greater Aegis

In `traits.json` the 72 carry `roll: true`, written by `scripts/extract.mjs`
straight from `skill_lot`. There is no separate pool file - the wrightstone sub
pool and the sigil second-trait pool are the same export.

The 17 distinct traits that appear as subs anywhere in `item_pendulum` are all
from preset rows, and every one of them is in the 72 - the presets are a floor
inside the pool, not a separate list: ATK, HP, Linked Together, Critical Hit
DMG, DMG Cap, Tyranny, Guts, Drain, Autorevive, Quick Cooldown, Cascade, Uplift,
Aegis, Steel Nerves, Nimble Onslaught, Supplementary DMG, Greater Aegis.

What the pool excludes is as sharp as what it holds. _Stout Heart_ is in no
`skill_lot` group, carries no second trait on its one sigil, and never rolls as
a sigil's second trait: nothing random in the game hands it out. The same goes
for every character trait, every weapon trait, and the curio traits behind
one-trait sigils.

### The stone names no lot

`item_pendulum` has **no skill-lot column** - its only lot references are the
three `SkillLevelLotFor*` columns, which carry levels. `gem` points at a trait
pool through `SkillTypeLotIdForRandom2ndSkill`; the stone has no equivalent, and
no table outside `skill_type_lot` references a `skill_lot` group at all.

So the 72 are the pool by elimination rather than by pointer: it is the only
random-trait pool the archive holds, and the stone's own presets sit inside it.

## Not resolved

- The column that would tie a stone to `skill_lot`. None exists, so the pool is
  established by elimination rather than by pointer.
- `QuestExBaseDataId` - two ids per family, and 0 on every preset and on
  `_0000`. Rows `_0001` through `_0020` share the family's first id and the
  `_0130`/`_0131` pair takes its second: Stun 17/22, Crit 18/23, HP 19/24, Weak
  Point 20/25, and 21 for the unnamed Linked Together pair. Two contiguous
  blocks of five, so it plausibly names the quest that drops the stone; nothing
  has been matched to it.
- `SortOrderMaybe` is a stable per-family constant (Dread 3, Vitality 0,
  Fortification 2, Sequestration 1) and does not match `item.SortOrder`.

## What this project uses

Only the **`_0131` ceiling**: main level 20, sub1 15, sub2 10, fixed by slot.
Nothing else is modelled - a sharecard shows an endgame build, so the lower
rarities and the whole lot system fall away, and the three levels are implied by
position rather than stored per row.

`_0130`'s 15 / 10 / 7 is deliberately not offered even though it is a real
rarity-5 set: it is dominated by `_0131` at every slot, so a build worth sharing
runs the top stone. There is no level-set control.

The main trait is **one of the four named stones**, never free choice, which is
what makes the derived name work. `wrightstone-prefixes.json` holds the four
name pairs; their source is `item.ItemName` per family, and the four are exactly
the four named `MainSkill` values, so the map is complete.

The sub traits are stored on the build rather than looked up, for the same
reason a `+` sigil's second trait is (see [sigils.md](sigils.md)): they are a
property of the stone a player rolled. `WRIGHTSTONE_SUB_POOL` bounds what the
editor offers - the 72 - but which two came out is the player's, not the
catalog's.
