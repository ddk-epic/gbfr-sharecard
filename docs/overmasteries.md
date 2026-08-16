# Over-masteries

The random stat rolls a character earns past level 80. Everything here is read
out of the game archive (version 2.0.2); the tables are named so any claim can
be re-checked. See [archive.md](archive.md) for how it is extracted.

## The game calls them meditation

There is no `overmastery` table. The system is **meditation**, and its rows are
keyed `MED_EFF_*`.

| Table                             | Rows | Holds                                          |
| --------------------------------- | ---- | ---------------------------------------------- |
| `limit_bonus_meditation`          | 3    | the three meditation tiers                     |
| `limit_bonus_meditation_category` | 45   | which stats each tier can roll                 |
| `limit_bonus_meditation_weight`   | 10   | level probabilities                            |
| `limit_bonus_param`               | 1123 | the stat values, shared with the mastery board |
| `limit_bonus`                     | -    | the mastery board, a different system          |

`limit_bonus_param` is **not** over-mastery-specific. It carries every mastery
parameter in the game, `LBP_EFF_*` for the board and `MED_EFF_*` for
over-masteries. Filtering by the keys in `limit_bonus_meditation_category` is
what separates them.

Unlocking is uniform: `chara.MinLvlForOverMasteries` is **80 for all 29
characters**.

## Three tiers, four rolls

`limit_bonus_meditation`:

| Tier   | `MeditationCategoryId` | MSP cost |
| ------ | ---------------------- | -------- |
| Small  | 0                      | 700      |
| Medium | 1                      | 1000     |
| Large  | 2                      | 2000     |

Every row carries `NumMasteries1/2/3` = `4/3/2` with weights `100/0/0`, so the
count is not random: **a meditation always grants 4 over-masteries**, at every
tier. The 3 and 2 branches exist in the data and are switched off.

The English strings for the tier names are **empty** -
`TXT_MEDITATION_TITLE_SMALL` and its siblings resolve to `""`. The UI names
these somewhere the archive does not say.

## The eleven stats

`limit_bonus_meditation_category` joined to `limit_bonus_param` by `Key`:

Each row carries a ten-step ladder in `Lv1Value`-`Lv10Value`:

| Stat                        | `MED_EFF_` key     | ×mult | Lv1 → Lv10                                           |
| --------------------------- | ------------------ | ----- | ---------------------------------------------------- |
| Attack Power Up             | `ATK01`            | 1     | 100, 100, 200, 300, 400, 500, 600, 700, 800, 1000    |
| Health Up                   | `HP01`             | 1     | 100, 200, 400, 500, 600, 800, 1000, 1200, 1600, 2000 |
| Stun Power Up               | `BREAK01`          | 10    | 0.1, 0.1, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.6, 2         |
| Critical Hit Rate Up        | `CRITICAL01`       | 1     | 1, 1, 2, 4, 6, 8, 10, 12, 16, 20                     |
| Skill Damage Up             | `ABILITY_DAMAGE01` | 1     | ”                                                    |
| Skybound Art Damage Up      | `ARTS_DAMAGE01`    | 1     | ”                                                    |
| Chain Burst Damage Up       | `BURST_DAMAGE01`   | 1     | ”                                                    |
| Normal Attack Damage Cap Up | `ATTACK_LIMIT01`   | 1     | ”                                                    |
| Skill Damage Cap Up         | `ABILITY_LIMIT01`  | 1     | ”                                                    |
| Skybound Art Damage Cap Up  | `ARTS_LIMIT01`     | 1     | ”                                                    |
| Skill Healing Cap Up        | `RECOVERY_LIMIT01` | 1     | ”                                                    |

Eleven stats, and eight of the ten steps are reachable - see the level table
below. Nine of the eleven share one ladder; only ATK and HP differ, and Stun
Power is that same ladder stored a tenth of the size.

### Stun Power's fractions are the archive's own

`0.1, 0.1, 0.2, …` is **what the table holds**. It is not a typo here and not a
transcription error - it is confirmed in two independent tables that share no
columns:

- `limit_bonus_param` stores the over-mastery ladder as `0.1 … 2`.
- `skill_status` stores the Stun Power **trait** as `0.5, 1, 1.5, 2, 2.3 … 10`,
  where Critical Hit Rate holds `5, 6, 7, 8, 9 … 50` and ATK holds
  `4, 6, 8, 10, 12 … 2000`.

So fractional storage is a property of the stat, not of the over-mastery system.
Anything reading Stun Power out of the archive will meet it.

`limit_bonus_param` also carries a column the headers call `Unk19`, which is
`10` on **exactly** the 41 rows of stat type 3 and `1` on the other 1082, and
zero `Unk19 = 1` rows hold a fraction.

**The game renders ten times the stored value**, confirmed in game. Three stun
sigils stacked on one build pooled the Stun Power trait to levels 16, 32 and 45,
whose `skill_status` ladder holds `5.1`, `6.9` and `10`; the displayed Stun Power
moved by `+51`, `+18` and `+31`, which are the differences of `51 / 69 / 100`. So
an over-mastery storing `1.6` shows as `16`, on the same `2 … 20` ladder as the
nine percentage stats. The readings are in
[stats.md](stats.md#over-masteries-pay-by-roll-level).

That settles the rendering, not the mechanism. `skill_status` has no `Unk19`
column and stores fractions anyway, so `Unk19` cannot be the thing that makes the
stat work - treat it as a per-stat-type flag that marks fractional storage.

The column the headers call `DisplayNumberMultiplier` is a different thing
again, and also misnamed: it holds a stat-type index (0 ATK, 1 HP, 2 crit,
3 stun, then 100-107 for the damage family).

## Flat or percent is in the format string

`NameFormat` resolves to the line the UI prints, and whether it carries a `%` is
the only reliable test:

| Stat                      | Format                                                          |
| ------------------------- | --------------------------------------------------------------- |
| Attack Power Up           | `Attack +{0}`                                                   |
| Health Up                 | `HP +{0}`                                                       |
| **Stun Power Up**         | **`Stun Power +{0}`**                                           |
| Critical Hit Rate Up      | `Critical Hit Rate +{0}%`                                       |
| Skill Damage Up           | `Skill Damage +{0}%`                                            |
| Skill Healing Cap Up      | `Healing Cap (Receiving) +{0}%`⏎`Healing Cap (Bestowing) +{0}%` |
| … the remaining cap stats | `… +{0}%`                                                       |

**Stun Power is flat, not a percentage**, despite sharing the `2 … 20` ladder
with the nine percentage stats and sharing nothing else with ATK and HP. The
stat-type index does not separate them - stun is type 3, adjacent to crit at 2 -
so a rule built on the type index gets it wrong. _Skill Healing Cap Up_ is also
the one stat whose format prints two lines.

## Small tier is weighted toward the basics

Medium and Large offer all eleven stats at `Weight 1` each - a flat pick. Small
offers 23 rows rather than 11, because the four basic stats are **repeated**:

```
ATK       ×5   (MED_EFF_ATK01, _02, _03, _04, _05)
HP        ×5
Critical  ×3
Stun      ×3
the other seven  ×1 each
```

The duplicate keys all resolve to the same `limit_bonus_param` row, so this is
weighting by row count rather than by the `Weight` column. A Small meditation is
16-in-23 to roll a basic stat; Medium and Large are 4-in-11.

## Which level gets rolled

`limit_bonus_meditation_weight` is **one row per level and one column per
tier**, despite the column names reading `WeightLv1/2/3`. Each column sums to
exactly 10000, so the numbers are basis points.

| Level | Small | Medium | Large |
| ----- | ----- | ------ | ----- |
| 1     | 0     | 0      | 0     |
| 2     | 0     | 0      | 0     |
| 3     | 3500  | 300    | 500   |
| 4     | 2600  | 500    | 500   |
| 5     | 1700  | 1100   | 700   |
| 6     | 1100  | 3500   | 1000  |
| 7     | 500   | 2600   | 1500  |
| 8     | 300   | 1700   | 1800  |
| 9     | 200   | 200    | 2200  |
| 10    | 100   | 100    | 1800  |

**Levels 1 and 2 are unreachable at every tier**, so a roll lands on one of
**8 values**, not 10. Reading the ladder from level 3 up gives ATK
`200 … 1000`, HP `400 … 2000`, and `2 … 20` for the nine percentage stats.

The three columns are what the tier names mean: Small is weighted toward the
low end, Medium peaks in the middle, Large climbs toward the top.

## What this project uses

Only the **Large tier**, which offers all eleven stats evenly, so the small
tier's row-count weighting does not carry over. Each stat is stored as its eight
reachable values rather than a `{min, max}` range, because a roll lands on a
step and never between two. The roll probabilities are not modelled - a
sharecard shows a build that already exists, not the odds of rolling it.

**Stun Power is normalised to whole numbers** by its `Unk19`, putting it on the
same `2 … 20` ladder as the percentage stats. That is what the game itself shows,
not a presentation choice made here. The catalog holds only whole numbers, so
nothing downstream deals in fractions. It is still flat rather than
percent - the format string decides that, and Stun Power's carries no `%`.

## The stat icons

Each stat carries a bonus icon, `cmn_iclb_s_01`-`s_15` in `ui/atlas/common_icon_lb`.
The stat -> sprite pairing is **not in any table**: the meditation rows carry
`LimitBonusParamTypeId = -1`, and the icon is chosen at runtime by
`LimitBonusIconSetter` (`window_dialog01_lb01.prfb`). The ordered sprite list is
in the UI image descriptors instead - `meditationicons.image.imageb` holds the
four basics and `meditationlatters.image.imageb` the seven damage-family, and
`summonbaseparamicons.image.imageb` holds all eleven concatenated in the same
order. All three agree.

Those `.imageb` files reference each sprite by the 32-bit `texb|subid` hash from
Nenkai's [hashlist](https://nenkai.github.io/relink-modding/resources/re/hashes/)
(XXHash32 variant). Reading them back is: grep the hashlist for `cmn_iclb_s_NN`
to get each hash, then scan the `.imageb` bytes (uint32 LE) for those hashes in
offset order. In catalog order:

| Stat                        | Sprite |
| --------------------------- | ------ |
| Attack Power Up             | s_01   |
| Health Up                   | s_02   |
| Critical Hit Rate Up        | s_03   |
| Stun Power Up               | s_04   |
| Skill Damage Up             | s_08   |
| Skybound Art Damage Up      | s_06   |
| Chain Burst Damage Up       | s_07   |
| Normal Attack Damage Cap Up | s_11   |
| Skill Damage Cap Up         | s_13   |
| Skybound Art Damage Cap Up  | s_14   |
| Skill Healing Cap Up        | s_15   |

`s_05`, `s_09`, `s_10`, `s_12` are board stats (DEF, non-cap damage variants) the
meditation system never rolls, so they go unused.
