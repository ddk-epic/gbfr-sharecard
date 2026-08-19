# Wrightstones

Items that imbue a weapon with extra traits. Archive version 2.0.2. See [archive.md](archive.md).

## Pendulums

The game calls them pendulums. No `wrightstone` table. Item = **pendulum**; family mirrors the sigil family one for one:

| Table                  | Rows | Holds                                   |
| ---------------------- | ---- | --------------------------------------- |
| `item_pendulum`        | 74   | every wrightstone variant and its rolls |
| `item`                 | -    | display name, rarity, description       |
| `skill_level_lot`      | -    | which level a roll lands on             |
| `item_pendulum_sell`   | -    | shop pricing                            |
| `item_pendulum_ticket` | -    | voucher exchange                        |

All 74 `item_pendulum` rows join to a real `item` row - nothing orphaned.

## Four stones

Four stones, one per main trait. `item_pendulum.MainSkill` fixed per row; item name follows from it. Five key prefixes, four named:

| Keys        | Item name                   | Main trait        | `skill` key    | Rows |
| ----------- | --------------------------- | ----------------- | -------------- | ---- |
| `ITEM_25_*` | _Dread Wrightstone_         | Stun Power        | `SKILL_004_00` | 17   |
| `ITEM_26_*` | _Vitality Wrightstone_      | Critical Hit Rate | `SKILL_003_00` | 17   |
| `ITEM_27_*` | _Fortification Wrightstone_ | HP                | `SKILL_001_00` | 17   |
| `ITEM_28_*` | _Sequestration Wrightstone_ | Weak Point DMG    | `SKILL_014_00` | 17   |
| `ITEM_24_*` | **(unnamed)**               | Linked Together   | `SKILL_009_00` | 2    |
| `ITEM_24_*` | **(unnamed)**               | Drain             | `SKILL_067_00` | 4    |

**The `ITEM_24` six carry an empty `ItemName` hash** - no English string, no name anywhere. Linked Together and Drain wrightstones exist in the table, not in the game. Level ladder stunted: Drain tops at main level 7, Linked Together never leaves the lot.

**A wrightstone _is_ its main trait** - four of them, not a per-stone choice.

## Variants

Seventeen variants per stone. Each named stone: 14 `ITEM_*` rows + 3 hash-keyed rows (later additions, all four families gain the same three; ordinary named items).

Two kinds: **Rolled** stones (empty `SubSkill1/2`, point at a `skill_level_lot`); **preset** stones (sub traits and levels named outright).

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

Preset - sub traits written into the row:

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

Per-family preset pairs:

| Stone         | `_0030` (lv 9)                      | hash (lv 9)        | hash (lv 10)        |
| ------------- | ----------------------------------- | ------------------ | ------------------- |
| Dread         | Linked Together 5 · Uplift 3        | Nimble Onslaught 5 | Autorevive 7        |
| Vitality      | Critical Hit DMG 5 · Steel Nerves 3 | Tyranny 5          | Supplementary DMG 7 |
| Fortification | Aegis 5 · Drain 3                   | Aegis 5            | Greater Aegis 7     |
| Sequestration | Quick Cooldown 5 · Cascade 3        | Uplift 5           | Guts 7              |

## The two rarity-5 level sets

`_0131` = top stone: three lots, each a **single** outcome (17=lvl 20, 18=lvl 15, 19=lvl 10). Can't come out any other way. Hash-keyed rarity-5 preset reaches the same 20/15/10 by naming Aegis 15 and ATK 10 outright.

`_0130` = the step below: three lots, each **two** equally-weighted outcomes - main 10 or 15, sub1 7 or 10, sub2 5 or 7:

| Tier  | Main | Sub 1 | Sub 2 |
| ----- | ---- | ----- | ----- |
| upper | 15   | 10    | 7     |
| lower | 10   | 7     | 5     |

Endgame level sets: **20/15/10** and **15/10/7**, plus **10/7/5** as `_0130`'s lower tier. The three lots are stored independently - table doesn't forbid a mixed draw like 15/7/7; tiering is implied by the paired values, not stated.

`LvPrimarySkill` ≤ 20, `LvSubSkill1` ≤ 15, `LvSubSkill2` ≤ 10, across all 74 rows.

## The level lots

`skill_level_lot`: 20 chance columns + key. The 20 lots wrightstones reference:

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

**Lots 0-13: percentages summing to 100. Lots 14-19: not** - equal counts of 1, even pick among levels listed. Two conventions in one table.

`WeightSubSkill1/2` gates **whether** a sub rolls, not which one: 100 where the sub exists on the rolled stone, 0 where absent. Unnamed `ITEM_24` pair is the only exception - 40 and 20.

## The sub trait pool

Every rolled stone: `SubSkill1`/`SubSkill2` **empty strings** - only the sub's _level_ is lotted. Traits come from `skill_lot`.

`skill_lot`: 439 rows, 36 groups, union = **72 traits**. Six slices of one pool, repeated over several table generations: 4 basic, 21 offense, 22 defense, 8 sustain, 8 special, 9 heavy-hitters. `skill_type_lot` row 16 (widest) draws all six, reaches all 72. **One random-trait pool in the archive.** See [sigils.md](sigils.md).

The 72, by slice:

**Basic (4)** ATK · HP · Critical Hit Rate · Stun Power

**Offense (21)** Enmity · Stamina · Charged Attack DMG · Linked Together · Throw DMG · Critical Hit DMG · Weak Point DMG · Combo Finisher DMG · Concentrated Fire · DMG Cap · Combo Booster · Tyranny · Lucky Charge · Injury to Insult · Overdrive Assassin · Break Assassin · Guard Payback · Dodge Payback · Skilled Assault · Life on the Line · Quick Charge

**Defense (22)** Garrison · Aegis · Improved Guard · Improved Dodge · Steel Nerves · Nimble Defense · Precise Resilience · Firm Stance · fourteen resistances - ATK↓ · DEF↓ · Poison · Burn · Blight · Sandtomb · Glaciate · Darkflame · Dizzy · Paralysis · Slow · Held Under · Skill Sealed · SBA Sealed

**Sustain (8)** Improved Healing · Regen · Drain · Quick Cooldown · Cascade · Uplift · Nimble Onslaught · Precise Wrath

**Special (8)** Guts · Autorevive · Potion Hoarder · Low Profile · Provoke · Fast Learner · Rupie Tycoon · Steady Focus

**Heavy-hitters (9)** Stronghold · Power Hungry · Path to Mastery · Supplementary DMG · Less Is More · Head Start · Berserker · Glass Cannon · Greater Aegis

`traits.json`: the 72 carry `roll: true`, from `skill_lot` via `scripts/extract.mjs`. No separate pool file - wrightstone sub pool and sigil second-trait pool are the same export.

The 17 distinct traits appearing as subs anywhere in `item_pendulum` are all from preset rows and all in the 72: ATK, HP, Linked Together, Critical Hit DMG, DMG Cap, Tyranny, Guts, Drain, Autorevive, Quick Cooldown, Cascade, Uplift, Aegis, Steel Nerves, Nimble Onslaught, Supplementary DMG, Greater Aegis.

_Stout Heart_: no `skill_lot` group, no second trait on its one sigil, never rolls as a second trait - nothing random hands it out. Same for every character trait, weapon trait, and curio trait behind one-trait sigils.

### No lot column

The stone names no lot. `item_pendulum` has **no skill-lot column** - only lot references are the three `SkillLevelLotFor*` columns, which carry levels. `gem` points at a trait pool via `SkillTypeLotIdForRandom2ndSkill`; the stone has no equivalent, and no table outside `skill_type_lot` references a `skill_lot` group at all.

The 72 = the pool by elimination, not pointer: the only random-trait pool the archive holds.

## Not resolved

- The column tying a stone to `skill_lot` - none exists.
- `QuestExBaseDataId` - two ids per family, 0 on every preset and on `_0000`. `_0001`-`_0020` share the family's first id; `_0130`/`_0131` take its second: Stun 17/22, Crit 18/23, HP 19/24, Weak Point 20/25, 21 for the unnamed Linked Together pair. Two contiguous blocks of five - plausibly the drop quest, unmatched.
- `SortOrderMaybe` - stable per-family constant (Dread 3, Vitality 0, Fortification 2, Sequestration 1), doesn't match `item.SortOrder`.

## Implementation

Only the **`_0131` ceiling**: main level 20, sub1 15, sub2 10, fixed by slot. Nothing else modelled - lower rarities and the lot system fall away; the three levels are implied by position, not stored per row.

`_0130`'s 15/10/7 deliberately not offered - dominated by `_0131` at every slot. No level-set control.

Main trait = **one of the four named stones**, never free choice - what makes the derived name work. `wrightstone-prefixes.json` holds the four name pairs, sourced from `item.ItemName` per family; the four are exactly the four named `MainSkill` values.

Sub traits stored on the build, not looked up (same reason as a `+` sigil's second trait - see [sigils.md](sigils.md)): a property of the stone rolled. `WRIGHTSTONE_SUB_POOL` bounds what the editor offers - the 72 - not which two came out.
