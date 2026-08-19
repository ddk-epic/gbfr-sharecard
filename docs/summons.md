# Summons

A summon carries **main traits** it rolls and an **equip bonus** it grants while equipped. Archive version 2.0.2. See [archive.md](archive.md).

Trait side: only sketched. Equip bonus side: settled, reconciled with the catalog.

## The tables

| Table                                | Rows      | Holds                                            |
| ------------------------------------ | --------- | ------------------------------------------------ |
| `summon_info`                        | 77        | name, description, element, cost, icon           |
| `summon`                             | 189       | a summon: rarity, its four lot ids, its param id |
| `summon_lot`                         | 726       | main trait pools - `SkillId` with a `Weight`     |
| `summon_base_param`                  | 23        | the equip bonus ladders                          |
| `summon_curve`                       | 73        | level distribution for a lot roll                |
| `summon_preset`                      | 513       | prebuilt summons - id, skill, level per slot     |
| `summon_param`                       | 229       | the summon's own combat effect                   |
| `reward_summon`, `reward_summon_lot` | 177 / 587 | where summons drop                               |

`summon_info` 77 rows vs. `summon`'s 189: a summon exists at several rarities. `summon_info.SummonName` carries embedded newlines for long forms - _"Proto Bahamut,\nTranscendent Blue"_.

## Main traits

Main traits are a weighted lot. Each `summon` row points at up to four `SummonLotId`s. A lot = `summon_lot` rows, each a `SkillId` + `Weight`. `SummonCurveId` points into `summon_curve`, which weights the _level_ the trait rolls at - same shape as over-mastery level weighting.

Same information as Nenkai's `summon_trait_chances.md`.

## Equip bonuses

Equip bonuses are a ten-step ladder. `summon_base_param` holds `Level1Value`-`Level10Value` per bonus, plus `ValueDisplayMultiplier`. **Two groups of eleven** bonuses, not three.

**Levels are 0-based on the roll side, 1-based in the columns.** `summon_curve.SkillOrBaseParamLevel` counts `0`-`9`; level _n_ reads `Level<n+1>Value`. Tables below are indexed the curve's way, display values (multiplier applied - why Stun Power reads in whole numbers).

**Group A** - rarity 3, 4, most of rarity 5:

| Bonus                       | 0   | 1   | 2   | 3   | 4    | 5    | 6    | 7    | 8    | 9    |
| --------------------------- | --- | --- | --- | --- | ---- | ---- | ---- | ---- | ---- | ---- |
| Attack Power Up             | 200 | 400 | 600 | 800 | 1000 | 1200 | 1400 | 1600 | 1800 | 2000 |
| Health Up                   | 200 | 400 | 600 | 800 | 1000 | 1200 | 1400 | 1600 | 1800 | 2000 |
| Critical Hit Rate Up        | 2   | 4   | 6   | 8   | 10   | 12   | 14   | 16   | 18   | 20   |
| Stun Power Up               | 2   | 3   | 4   | 5   | 6    | 7    | 9    | 11   | 13   | 15   |
| Skill Damage Up             | 2   | 4   | 6   | 8   | 10   | 12   | 14   | 16   | 18   | 20   |
| Skybound Art Damage Up      | 2   | 4   | 6   | 8   | 10   | 12   | 14   | 16   | 18   | 20   |
| Chain Burst Damage Up       | 5   | 10  | 15  | 20  | 25   | 30   | 35   | 40   | 45   | 50   |
| Normal Attack Damage Cap Up | 5   | 10  | 15  | 20  | 25   | 30   | 35   | 40   | 45   | 50   |
| Skill Damage Cap Up         | 5   | 10  | 15  | 20  | 25   | 30   | 35   | 40   | 45   | 50   |
| Skybound Art Damage Cap Up  | 5   | 10  | 15  | 20  | 25   | 30   | 35   | 40   | 45   | 50   |
| Healing Cap Up              | 5   | 10  | 15  | 20  | 25   | 30   | 35   | 40   | 45   | 50   |

**Group B** - eight rarity-5 summons only:

| Bonus                       | 0   | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9    |
| --------------------------- | --- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| Attack Power Up             | 800 | 1000 | 1200 | 1400 | 1600 | 1800 | 2000 | 2200 | 2500 | 3000 |
| Health Up                   | 800 | 1000 | 1200 | 1400 | 1600 | 1800 | 2000 | 2500 | 3000 | 5000 |
| Critical Hit Rate Up        | 8   | 10   | 12   | 14   | 16   | 18   | 20   | 22   | 25   | 30   |
| Stun Power Up               | 5   | 6    | 7    | 9    | 11   | 13   | 15   | 16   | 18   | 20   |
| Skill Damage Up             | 8   | 10   | 12   | 14   | 16   | 18   | 20   | 22   | 25   | 30   |
| Skybound Art Damage Up      | 8   | 10   | 12   | 14   | 16   | 18   | 20   | 22   | 25   | 30   |
| Chain Burst Damage Up       | 20  | 25   | 30   | 35   | 40   | 45   | 50   | 60   | 80   | 100  |
| Normal Attack Damage Cap Up | 20  | 25   | 30   | 35   | 40   | 45   | 50   | 60   | 80   | 100  |
| Skill Damage Cap Up         | 20  | 25   | 30   | 35   | 40   | 45   | 50   | 60   | 80   | 100  |
| Skybound Art Damage Cap Up  | 20  | 25   | 30   | 35   | 40   | 45   | 50   | 60   | 80   | 100  |
| Healing Cap Up              | 20  | 25   | 30   | 35   | 40   | 45   | 50   | 55   | 60   | 75   |

23rd row empty, multiplier 0.

Group A ladders - only **four** distinct:

```
ATK + Health
Critical Hit Rate + Skill Damage + Skybound Art Damage
Chain Burst + the three caps + Healing Cap
Stun Power
```

Group B - **six**: ATK, Health, Healing Cap each break away from A's grouping.

**ATK and Health Up are not the same ladder.** Group A: identical. Group B: share first seven steps, then split - ATK takes `2200`, tops `3000`; Health skips `2200`, tops `5000`. Health's top step is the only one more than a step above the one below.

**Stun Power stored fractionally here too**, `ValueDisplayMultiplier` 10, same as `limit_bonus_param` - see [overmasteries.md](overmasteries.md#stun-power). Named **"Healing Cap Up"** here vs. over-mastery's "Skill Healing Cap Up" - no shared naming between the two systems.

## Tiers

A tier is a group plus a curve. Equip bonus rolls through the **same lot mechanism as traits**: `summon_lot.SkillId` holds base-param keys as well as trait keys. Of 224 lots: 186 traits, 33 group A, 5 group B.

**Group B is rarity-5-only**, 8 of 189 summons. Rarity 3, 4, most of 5 draw group A. The two value groups aren't the tiers - they're rungs of exclusivity. Tier = the lot's `SummonCurveId`, deciding _which levels can roll_.

Most curves fixed - single level, weight 10000. Four span a range:

| Curve      | Group | Levels (0-based) | Weights                       |
| ---------- | ----- | ---------------- | ----------------------------- |
| `BD0C6515` | A     | 0-2              | 3330 / 3330 / 3340            |
| `DDAB04DC` | A     | 3-5              | 3330 / 3330 / 3340            |
| `2E2C5483` | A     | 6-9              | 2500 each                     |
| `4E547493` | B     | 5-9              | 4500 / 4000 / 700 / 500 / 300 |

Matches the catalog exactly for all eleven bonuses:

| Catalog tier | Group | Curve      | Levels |
| ------------ | ----- | ---------- | ------ |
| `legendary`  | B     | `4E547493` | 5-9    |
| `mid`        | A     | `2E2C5483` | 6-9    |
| `low`        | A     | `DDAB04DC` | 3-5    |

Legendary curve weighted toward its bottom - `4500` on level 5 vs. `300` on level 9 - top value rare. `mid` flat 2500 across all four.

`BD0C6515` (levels 0-2) has **no counterpart in the catalog** - markdown collapses to top-tier summons, lowest band absent.

## Implementation

Summon traits and equip tiers still generated from Nenkai's `summon_trait_chances.md` - the one external fetch left in `scripts/extract.mjs`. Archive tables above documented, not wired.

Equip bonuses key by over-mastery bonus type id: markdown's "Healing Cap Up" aliased to game's "Skill Healing Cap Up" during extraction.

Summon icons not extracted - see [archive.md](archive.md#icon-classes). Wiring needs a join that doesn't exist: **icons key on game id (`0300`), catalog keys on name slug.** `system/table/text/en/text_sum.msg` closes it - `TXT_SMN_So0300` → _Proto Bahamut_ - but a naive scan mis-pairs some rows, and 25 of 74 catalog summons are datamine-only enemy entries absent from that file.
