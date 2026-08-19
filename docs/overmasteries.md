# Over-masteries

Random stat rolls a character earns past level 80. Archive version 2.0.2. See [archive.md](archive.md).

## Meditation

The game calls them meditation. No `overmastery` table. System = **meditation**, rows keyed `MED_EFF_*`.

| Table                             | Rows | Holds                                               |
| --------------------------------- | ---- | --------------------------------------------------- |
| `limit_bonus_meditation`          | 3    | the three meditation tiers                          |
| `limit_bonus_meditation_category` | 45   | which stats each tier can roll                      |
| `limit_bonus_meditation_weight`   | 10   | level probabilities                                 |
| `limit_bonus_param`               | 1123 | stat values, shared with rest of Masteries          |
| `limit_bonus`                     | -    | Offense/Defense/Collection nodes, different section |

`limit_bonus_param` is **not** over-mastery-specific - every mastery parameter, `LBP_EFF_*` for Masteries nodes and `MED_EFF_*` for over-masteries. Filtering by `limit_bonus_meditation_category` keys separates them.

`chara.MinLvlForOverMasteries` = **80 for all 29 characters**.

## Three tiers, four rolls

`limit_bonus_meditation`:

| Tier   | `MeditationCategoryId` | MSP cost |
| ------ | ---------------------- | -------- |
| Small  | 0                      | 700      |
| Medium | 1                      | 1000     |
| Large  | 2                      | 2000     |

`NumMasteries1/2/3` = `4/3/2`, weights `100/0/0`: **a meditation always grants 4 over-masteries**, every tier. 3/2 branches present in data, switched off.

`TXT_MEDITATION_TITLE_SMALL` and siblings resolve to `""` - tier names not in the archive text.

## The eleven stats

`limit_bonus_meditation_category` joined to `limit_bonus_param` by `Key`. Each row: ten-step ladder `Lv1Value`-`Lv10Value`:

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

Eight of ten steps reachable (see level table below). Nine of eleven share one ladder; only ATK/HP differ, Stun Power is the same ladder at a tenth of the size.

### Stun Power

`0.1, 0.1, 0.2, …` is what the table holds, confirmed in two tables sharing no columns:

- `limit_bonus_param`: over-mastery ladder `0.1 … 2`.
- `skill_status`: Stun Power **trait** `0.5, 1, 1.5, 2, 2.3 … 10` (Critical Hit Rate: `5, 6, 7, 8, 9 … 50`; ATK: `4, 6, 8, 10, 12 … 2000`).

Fractional storage is a property of the stat, not the over-mastery system.

`limit_bonus_param`'s `Unk19` column: `10` on **exactly** the 41 rows of stat type 3, `1` on the other 1082 - zero `Unk19 = 1` rows hold a fraction.

**The game renders ten times the stored value**, confirmed in game: three stun sigils stacked, Stun Power pooled to levels 16, 32, 45; `skill_status` ladder holds `5.1`, `6.9`, `10`; displayed Stun Power moved `+51`, `+18`, `+31` (= `51/69/100`). An over-mastery storing `1.6` shows as `16`, on the same `2 … 20` ladder as the nine percentage stats. Readings: [research/pwr-formula.md](../research/pwr-formula.md).

That settles rendering, not mechanism - `skill_status` has no `Unk19` and stores fractions anyway. Treat `Unk19` as a per-stat-type flag marking fractional storage.

`DisplayNumberMultiplier` (header name) is a different, also-misnamed thing: a stat-type index (0 ATK, 1 HP, 2 crit, 3 stun, 100-107 damage family).

## Flat or percent

Flat or percent is in the format string. `NameFormat` resolves to the UI line; whether it carries `%` is the only reliable test:

| Stat                  | Format                                                          |
| --------------------- | --------------------------------------------------------------- |
| Attack Power Up       | `Attack +{0}`                                                   |
| Health Up             | `HP +{0}`                                                       |
| **Stun Power Up**     | **`Stun Power +{0}`**                                           |
| Critical Hit Rate Up  | `Critical Hit Rate +{0}%`                                       |
| Skill Damage Up       | `Skill Damage +{0}%`                                            |
| Skill Healing Cap Up  | `Healing Cap (Receiving) +{0}%`⏎`Healing Cap (Bestowing) +{0}%` |
| … remaining cap stats | `… +{0}%`                                                       |

**Stun Power is flat, not a percentage**, despite sharing the `2 … 20` ladder with the percentage stats. Stat-type index doesn't separate them (stun = type 3, adjacent to crit at 2). _Skill Healing Cap Up_ is the one stat whose format prints two lines.

## Small tier

Small tier is weighted toward the basics. Medium/Large: all eleven stats at `Weight 1` - flat pick. Small: 23 rows, four basic stats repeated:

```
ATK       ×5   (MED_EFF_ATK01, _02, _03, _04, _05)
HP        ×5
Critical  ×3
Stun      ×3
the other seven  ×1 each
```

Duplicate keys resolve to the same `limit_bonus_param` row - weighting by row count, not the `Weight` column. Small: 16-in-23 for a basic stat. Medium/Large: 4-in-11.

## Roll-level weights

`limit_bonus_meditation_weight`: one row per level, one column per tier (despite `WeightLv1/2/3` naming). Each column sums to 10000 - basis points.

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

**Levels 1-2 unreachable at every tier** - a roll lands on one of **8 values**. From level 3: ATK `200 … 1000`, HP `400 … 2000`, `2 … 20` for the nine percentage stats.

Small weighted low, Medium mid, Large high.

## Implementation

Only **Large tier** - all eleven stats evenly, so Small's row-count weighting doesn't carry over. Each stat stored as its eight reachable values, not a `{min, max}` range - a roll lands on a step, never between two. Roll probabilities not modelled.

**Stun Power normalised to whole numbers** by `Unk19`, on the same `2 … 20` ladder as the percentage stats - matches what the game shows. Catalog holds only whole numbers. Still flat, not percent - the format string's `%` decides that.

## The stat icons

Each stat: a bonus icon, `cmn_iclb_s_01`-`s_15` in `ui/atlas/common_icon_lb`. Stat→sprite pairing **not in any table**: meditation rows carry `LimitBonusParamTypeId = -1`; icon chosen at runtime by `LimitBonusIconSetter` (`window_dialog01_lb01.prfb`). Ordered sprite list in UI image descriptors instead - `meditationicons.image.imageb` (four basics), `meditationlatters.image.imageb` (seven damage-family), `summonbaseparamicons.image.imageb` (all eleven, same order). All three agree.

`.imageb` files reference each sprite by 32-bit `texb|subid` hash from Nenkai's [hashlist](https://nenkai.github.io/relink-modding/resources/re/hashes/) (XXHash32 variant). Read back: grep hashlist for `cmn_iclb_s_NN` → hash, scan `.imageb` bytes (uint32 LE) for hashes in offset order. Catalog order:

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

`s_05`, `s_09`, `s_10`, `s_12` - Masteries stats (DEF, non-cap damage variants) the meditation system never rolls.
