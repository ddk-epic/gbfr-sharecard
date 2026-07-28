# Summons

A summon carries **main traits** it rolls and an **equip bonus** it grants while
equipped. Everything here is read out of the game archive (version 2.0.2); the
tables are named so any claim can be re-checked. See [archive.md](archive.md)
for how it is extracted.

This page is a head start, not a finished survey - the trait side is only
sketched. The equip bonus side is settled and reconciled with what the catalog
ships.

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

`summon_info` is 77 rows against `summon`'s 189 because a summon exists at
several rarities. `summon_info.SummonName` carries embedded newlines for the
long forms - _"Proto Bahamut,\nTranscendent Blue"_.

## Main traits are a weighted lot

Each `summon` row points at up to four `SummonLotId`s. A lot is a set of
`summon_lot` rows, each a `SkillId` with a `Weight`, so the traits a summon can
roll and their odds are both in the table. `SummonCurveId` points into
`summon_curve`, which weights the _level_ the trait rolls at - the same
shape as the over-mastery level weighting.

This is the same information Nenkai's `summon_trait_chances.md` dumps.

## Equip bonuses are a ten-step ladder

`summon_base_param` holds `Level1Value` through `Level10Value` per bonus, plus a
`ValueDisplayMultiplier`. There are **two groups of eleven** bonuses, not three:

**Levels are 0-based on the roll side and 1-based in the columns.**
`summon_curve.SkillOrBaseParamLevel` counts `0`-`9`, and level _n_ there reads
`Level<n+1>Value` here. The tables below are indexed the way a curve refers to
them, and carry display values - the multiplier is already applied, which is why
Stun Power reads in whole numbers.

**Group A** - rarity 3, 4 and most of rarity 5:

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

A 23rd row is empty, with a multiplier of 0.

Most bonuses share a ladder. Group A has only **four** distinct ones:

```
ATK + Health
Critical Hit Rate + Skill Damage + Skybound Art Damage
Chain Burst + the three caps + Healing Cap
Stun Power
```

Group B splits into **six** - ATK, Health and Healing Cap each break away from
the group they shared in A.

**ATK and Health Up are not the same ladder.** In group A they are identical, in
group B they share the first seven steps and then split - ATK takes `2200` and
tops out at `3000`, Health skips `2200` and tops out at `5000`. Health is the
only bonus whose top step is more than a step above the one below it.

Two things follow. **Stun Power is stored fractionally here too**, with
`ValueDisplayMultiplier` 10, exactly as in `limit_bonus_param` - see
[overmasteries.md](overmasteries.md#stun-powers-fractions-are-the-archives-own).
And the bonus is named **"Healing Cap Up"** here, where the over-mastery table
calls the same idea "Skill Healing Cap Up". The two systems do not share their
naming.

## A tier is a group plus a curve

The equip bonus is rolled through the **same lot mechanism as the traits**:
`summon_lot.SkillId` holds base-param keys as well as trait keys, so a lot is
either a trait pool or an equip-bonus pool. Of 224 lots, 186 are traits, 33 are
group A and 5 are group B.

**Group B belongs to rarity 5 alone**, and only 8 of the 189 summons use it.
Rarity 3, 4 and most of rarity 5 draw from group A. So the two value groups are
not the tiers - they are two rungs of exclusivity, and the tier comes from the
lot's `SummonCurveId`, which decides _which levels of the ladder can roll_.

Most curves are fixed - a single level at weight 10000. Only four span a range:

| Curve      | Group | Levels (0-based) | Weights                       |
| ---------- | ----- | ---------------- | ----------------------------- |
| `BD0C6515` | A     | 0-2              | 3330 / 3330 / 3340            |
| `DDAB04DC` | A     | 3-5              | 3330 / 3330 / 3340            |
| `2E2C5483` | A     | 6-9              | 2500 each                     |
| `4E547493` | B     | 5-9              | 4500 / 4000 / 700 / 500 / 300 |

Those are the tiers a player experiences as a variable roll. Everything else
lands on one value every time.

Checked against the committed catalog, the mapping is exact for all eleven
bonuses:

| Catalog tier | Group | Curve      | Levels |
| ------------ | ----- | ---------- | ------ |
| `legendary`  | B     | `4E547493` | 5-9    |
| `mid`        | A     | `2E2C5483` | 6-9    |
| `low`        | A     | `DDAB04DC` | 3-5    |

So clustering Nenkai's markdown on value signatures recovered the right three
groups, and the archive now explains why they exist. Note the legendary curve is
steeply weighted toward its bottom - `4500` on level 5 against `300` on level 9 -
so its top value is rare, where `mid` is a flat 2500 across all four.

The fourth ranged curve, `BD0C6515` at levels 0-2, has **no counterpart in the
catalog** - the markdown collapses to top-tier summons, so the lowest band never
appears there.

## What this project uses

The catalog's summon traits and equip tiers are still generated from Nenkai's
`summon_trait_chances.md`, which is the one external fetch left in
`scripts/extract.mjs`. The archive tables above are documented but not yet wired.

Equip bonuses key by over-mastery bonus type id, so the markdown's
"Healing Cap Up" is aliased to the game's "Skill Healing Cap Up" during
extraction.

Summon icons are not extracted - see
[archive.md](archive.md#icon-classes-not-extracted) for where they live and the
hash workaround they need. Wiring them needs a join that does not exist yet:
**icons key on the game id (`0300`) and the catalog keys on a name slug.**
`system/table/text/en/text_sum.msg` closes it - `TXT_SMN_So0300` resolves to
_Proto Bahamut_ - but a naive scan mis-pairs some rows, and 25 of the catalog's
74 summons are datamine-only enemy entries with no row in that file at all.
