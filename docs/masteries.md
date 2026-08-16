# Masteries

The per-character progression screen, bought with **MSP**. Everything here is
read out of the game archive (version 2.0.2) - the tables are named so any claim
can be re-checked. See [archive.md](archive.md) for how it is extracted.

## Four sections, one system

| Section          | What it is                                    | Tables                                | Pays PWR by |
| ---------------- | --------------------------------------------- | ------------------------------------- | ----------- |
| **Offense**      | graded 0-150%                                 | `ap_tree_atk`                         | MSP spent   |
| **Defense**      | graded 0-150%                                 | `ap_tree_def`                         | MSP spent   |
| **Collection**   | a section per weapon, banked once transcended | `ap_tree_wep`, `ap_tree_rebuild`      | MSP spent   |
| **Over Mastery** | the four random lines a meditation rolls      | `limit_bonus_meditation`, `MED_EFF_*` | roll level  |

Over Mastery is a section of Masteries, not a separate system; it has its own
page, [overmasteries.md](overmasteries.md).

Two systems carry the word "master" and are **not** Masteries:

- **Master traits** - the three Styles across four Style Ranks, `skillboard_*`.
  See [master-traits.md](master-traits.md).
- **Master level** - the 1-55 rank, which costs MSP and grants master-trait
  points and flat stats.

The archive calls the whole thing an `ap_tree`, and older notes in this project
called it a "board". Neither is the game's word. It is **Masteries**.

Each `ap_tree_*` row names a `limit_bonus`, which names up to three
`limit_bonus_param` rows.

## Two readings have to be right

Both are easy to get wrong in the obvious direction, and either one wrong makes
the totals wildly wrong.

### `LimitBonusParamIndex` is a level, not a param

The name invites reading it as an index into `ParamId1/2/3`. **It is not** - it
runs to 7 where there are only ever 3 params. It indexes the param's **value
ladder**: a node grants `Lv{index+1}Value` of _every_ param the `limit_bonus`
names.

The ladders are per-node increments rather than cumulative totals, which is why
they look strange in isolation:

```
LBP_EFF_ATK01   150, 250, 300, 100, 100, 100, 100, 100, 100, 100
LBP_EFF_HP01    500, 300, 200, 200, 200, 200, 200, 200, 200, 200
```

The first ATK node in Masteries is worth 150, the second 250, the third 300, and
every one after that 100.

### The `reqT = 7` rows replace, they do not add

`ap_tree_rebuild` holds twelve rows per weapon: six at
`ReqWepTranscensionLevel` 1 to 6, and six more at 7 that **mirror them
one-for-one**. The T7 rows are the same nodes re-priced, not extra nodes.

They are recognisable by their format string. A `<d>` in the format -
`HP +{0}<d>+{1}<d>` - is the game's upgraded-value display, printing the old
value and the new one:

| Step | Node      | Param               | Value    |
| ---- | --------- | ------------------- | -------- |
| T2   | Health Up | `Health Up`         | 3000     |
| T7   | Health Up | `HP +{0}<d>+{1}<d>` | **3300** |
| T4   | Health Up | `Health Up`         | 5000     |
| T7   | Health Up | `HP +{0}<d>+{1}<d>` | **5500** |

Summing both sets double-counts. At T7 the correct reading is the six `reqT = 7`
rows alone, which for Io's Defender is 8800 HP rather than 17,600.

## What each section grants

Io, every node taken, all six weapons at T7:

| Section                  |        HP |      ATK |   Crit |    Stun |
| ------------------------ | --------: | -------: | -----: | ------: |
| Offense (`ap_tree_atk`)  |         0 |     4682 |     40 |     6.1 |
| Defense (`ap_tree_def`)  | **33300** |        0 |      0 |       0 |
| Collection - Defender    |     17500 |       50 |      0 |       0 |
| Collection - Stunner     |         0 |       30 |      0 |     4.8 |
| Collection - Ascension   |      5150 |     1370 |      0 |       0 |
| Collection - Stinger     |       150 |        0 |     38 |       0 |
| Collection - Executioner |       400 |      220 |      0 |       0 |
| Collection - Terminus    |         0 |     2450 |      0 |       0 |
| **Collection total**     | **23200** | **4120** | **38** | **4.8** |

The sections are thematic: the Defender section is where the HP is, the Terminus
and Ascension sections carry ATK, Stinger carries crit and Stunner carries stun.
**A weapon's Collection section is worth having even if the weapon is never
equipped** - the stats are permanent once the weapon is transcended, which is why
Collection is tracked separately.

Offense gives only 4682 ATK against Defense's 33,300 HP. That asymmetry is real,
not a reading error: the weapon supplies ATK, Masteries supply HP.

### The 100% -> 150% extension is almost all damage cap

Offense and Defense each carry 25 nodes past 100%, recognisable by a
`DiffSeparatorMaybe` of 300 or more. Across both trees those fifty nodes grant:

| What                                      |   Amount |
| ----------------------------------------- | -------: |
| Health Up                                 |   10,500 |
| Normal Attack / Skill / SBA Damage Cap Up | 200 each |
| Chain Burst Damage Cap Up                 |      100 |
| Skill Healing Cap Up                      |       20 |
| Stun Power Up                             |      3.0 |

No ATK and no crit at all. Half the stat sheet's headline numbers do not move
across the whole extension.

## What Masteries cost

MSP per node, Cagliostro; every other character is within a few hundred MSP of
this.

| Section                     | Nodes |     MSP |
| --------------------------- | ----: | ------: |
| Offense, to 100%            |   185 |  19,115 |
| Defense, to 100%            |   133 |  15,204 |
| Collection, base            |    36 |   1,104 |
| Collection, transcendence   |    36 |  12,720 |
| Offense + Defense, 100-150% |    50 | 919,000 |

**The extension costs 26 times everything before it.** Its nodes are priced
12,000 to 40,000 each against 1 to 700 for every node up to 100%. That pricing is
what makes it the dominant term in PWR, because PWR pays by MSP.

## PWR pays by MSP, not by what the nodes grant

Masteries are the biggest term in PWR by an order of magnitude:

```
masteries = attenuate(key 7, total MSP spent in Masteries)
          = 0.2 per MSP up to 90000, then 0.008
```

Read one node at a time on a Cagliostro sitting at 100% Offense / 100% Defense,
buying into the extension. Each node grants damage cap and nothing else, and the
damage-cap channel is **0.2 per percentage point**:

| Node bought     | MSP cost |   PWR | ΔPWR | Predicted |
| --------------- | -------: | ----: | ---: | --------: |
| _(start)_       |        - | 37330 |    - |         - |
| NA Cap +10%     |    12000 | 39732 | 2402 |    2402.0 |
| Skill Cap +10%  |    12000 | 42134 | 2402 |    2402.0 |
| NA Cap +12%     |    13000 | 44737 | 2603 |    2602.4 |
| Skill Cap +12%  |    13000 | 45202 |  465 |     465.1 |
| N/S/SBA Cap +5% |    14000 | 45317 |  115 |     115.0 |
| SBA Cap +10%    |    14000 | 45430 |  113 |     114.0 |

Six readings, total miss 1.7, on one free parameter - the MSP the character
already had invested. The two rates are read straight off
`chara_power_attenuate`, not fitted: `2402 = 12000 x 0.2 + 10 x 0.2` and
`115 = 14000 x 0.008 + 15 x 0.2`.

**The fourth node is the proof.** It is the same cell type at the same 13,000
cost as the third and pays 465 where the third paid 2,603, because the running
MSP total crosses **90,000** partway through it - the exact breakpoint where key
7 collapses from 0.2 to 0.008, a 25-fold drop no other key has. Nothing about the
node changed; only the total spent before it.

That also **identifies keys 7 and 11**, which share a curve in
`chara_power_attenuate` and differ only in their `chara_power_adjust`
coefficient. The observed rate is the raw 0.2, so Masteries are the one with
adjust **1** - key 7. ATK, measured at roughly 0.02, is `0.1 x 0.2` - key **11**.
See [stats.md](stats.md#the-attenuation-curve) for the curve itself.

### What Masteries are worth

| State                                      |     MSP |    PWR |
| ------------------------------------------ | ------: | -----: |
| 100/100, base collection, no transcendence |  35,423 |  7,385 |
| 100/100, every weapon transcended          |  48,143 |  9,929 |
| 150/150, every weapon transcended          | 967,143 | 25,317 |

**The extension is worth about 15,000 PWR** while everything its fifty nodes
grant is worth **under 600** through the stat channels. The nodes' own bonuses
are nearly irrelevant to the number they move.

### The 2,989 MSP offset

The fit puts Cagliostro's prior spend at **51,132** where the tables above price
100/100 with every weapon transcended at **48,143** - a gap of 2,989 that no
`ap_tree_*` row accounts for. It is not weapon-shaped (a weapon's transcendence
section is 2,120) and no node costs it. Either some MSP sink outside the four
`ap_tree_*` tables feeds the same channel, or the curve's input carries an
offset.

**A second character at a known Masteries state settles it.** If the same 2,989
turns up, it is structural; if it differs, it is per-character spend.

## Reading it back

The queries are single joins against `tables.sqlite`, with both corrections
above - `LimitBonusParamIndex` as a level, and `reqT = 7` as a replacement set.
`scripts/extract.mjs` does exactly this to build `character-stats.json`, whose
`masteries` field is each character's Masteries total.

## What this project uses

`deriveStatus` assumes **Masteries are complete** - 150% Offense, 150% Defense,
and every weapon transcended, so the whole Collection is banked. The card is a
max-build card and a Build carries no field for partial Masteries. See
[stats.md](stats.md#what-this-project-uses).
