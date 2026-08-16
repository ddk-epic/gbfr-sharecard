# Stats and PWR

Where a character's HP, ATK, Critical Hit Rate, Stun Power and PWR come from.
Everything here is read out of the game archive (version 2.0.2) - the tables are
named so any claim can be re-checked. See [archive.md](archive.md) for how the
archive is extracted.

**HP, ATK, Crit and Stun are solved and confirmed in game**, to the unit, against
a maxed Io, and this project derives all four - see
[what this project uses](#what-this-project-uses). PWR is not; its coefficient
tables are located but the arithmetic that combines them is not settled. The
check that proves the four is [below](#the-confirmed-builds).

## The model: a flat sum, then a percentage

Every source contributes a flat number and they add. One stage of multiplication
follows, and only ATK is known to reach it:

```
stat = (base + fate + weapon + board + master levels + traits + over-masteries + summons)
     x (1 + percentage traits)
```

The percentage stage is what makes ATK look impossible to reconcile if it is
missed. On the confirmed build it is a single trait worth **+70%**, and the flat
sum is 33,216 against a displayed 56,467.

| Source         | Table                                               | HP        | ATK       | Crit   | Stun   |
| -------------- | --------------------------------------------------- | --------- | --------- | ------ | ------ |
| Character base | `chara_status`                                      | per level | per level | 5 flat | 8 flat |
| Fate episodes  | `chara_status_fate`                                 | +640      | +165      | -      | -      |
| Weapon         | `weapon_status` + `_awake` + `_rebuild` + `_plus`   | yes       | yes       | 0      | 0      |
| Traits         | `skill_status`                                      | yes       | yes       | yes    | yes    |
| Mastery board  | `ap_tree_*` -> `limit_bonus` -> `limit_bonus_param` | yes       | yes       | yes    | yes    |
| Master levels  | `skillboard_unlock`                                 | +6000     | +3000     | -      | -      |
| Over-masteries | `limit_bonus_param` (`MED_EFF_*`)                   | yes       | yes       | yes    | yes    |
| Summon equip   | `summon_base_param`                                 | yes       | yes       | yes    | yes    |

"Traits" is one row per trait level and covers sigils, the wrightstone and the
weapon's five trait slots alike - they are the same `skill_status` ladder read at
different levels.

## Character base

`chara_status` is 19 rows per character covering levels 1 to 100, but **only the
level 1 and level 100 rows carry `Stun` and `CritRate`**, and both hold **8** and
**5** for all 29 characters. The 17 rows in between hold 0, meaning unchanged.

So a level 1 character and a level 100 character have identical base crit and
stun, and every point above those two numbers is equipment. `DefenseLikely` is 0
on every row for every character - there is no player DEF stat here.

Io (`PL0400`) runs 144 HP / 9 ATK at level 1 to **3156 HP / 666 ATK** at 100.

## Fate episodes

`chara_status_fate` is 9 rows per character, 261 rows in total, and every
character's nine are identical: `10/15/20/25/50/70/100/150/200` HP against
`3/5/7/10/15/20/25/30/50` ATK, for **+640 HP and +165 ATK** fully unlocked.

Its three remaining columns should by shape be stun and crit. They are 0 on all
261 rows, and the tool's own header says they "seem to do nothing". Fate episodes
move HP and ATK only.

## Master levels

`skillboard_unlock` is 50 rows, one per master level, with `HealthAdd`,
`AttackAdd` and `DmgCapAdd` on every fifth. They total **+6000 HP, +3000 ATK and
+100 DMG Cap** at master level 50.

**The table stops at 50 and the stats stop with it.** Master level runs to 55,
but levels 51-55 grant no board points and no stats - they buy Unbound Master's
damage cap, see
[master-traits.md](master-traits.md#what-levels-51-55-buy). A master level 55
character has the same +6000/+3000 as a master level 50 one. Confirmed in game.

## Weapons

All four weapon stat tables carry `StunPower` and `CritRate` columns and they are
zero on every weapon of every series - see [weapons.md](weapons.md#stats). A
weapon reaches crit and stun only through its **trait slots**, which are ordinary
`skill_status` traits.

The character HP offset is already baked into `weapon_status`: Io's level 150
Defender reads 2599 there, which is the series' 2612 with her -13 applied.

## The trait ladders

`skill_status` stores each trait's per-level value in `LevelValue1`:

| Trait             | Key            | Levels | Ladder                | Format                        |
| ----------------- | -------------- | ------ | --------------------- | ----------------------------- |
| ATK               | `SKILL_000_00` | 50     | 4, 6, 8 … 2000        | `ATK +{0}`                    |
| HP                | `SKILL_001_00` | 50     | 200, 300, 400 … 10000 | `HP +{0}`                     |
| Critical Hit Rate | `SKILL_003_00` | 45     | 5, 6, 7 … 50          | `Critical Hit Rate +{0:.1f}%` |
| Stun Power        | `SKILL_004_00` | 45     | 0.5, 1, 1.5 … 10      | `Stun Power +{0:10}`          |

ATK and HP are flat adds. Critical Hit Rate is in percentage points, added to the
base 5. `{0:.1f}` is a precision spec and `{0:10}` a width spec - **neither is a
multiplier**.

The flat ATK trait is small: at its level 50 cap it is worth 2000, under a tenth
of a maxed weapon. **Sigils barely move the ATK number.** What moves it is the
percentage traits.

### Percentage traits compound, they do not add

Two percentage traits on one build **multiply**. Adding Tyranny at pooled level
17 (ATK +37%) to the Ascension build, whose Supernova already gives +40%:

```
additive   32944 x (1 + 0.40 + 0.37) = 58311     wrong
compound   32944 x 1.40 x 1.37       = 63186.6   -> 63187, as reported
```

A **negative** percentage compounds the same way, and on the final figure:
Tyranny's Max HP -20% took 70761 HP to `70761 x 0.80 = 56608.8`, reported as
**56609**.

### The percentage traits are the multiplicative stage

Around fifty traits carry an `ATK +{n}%` clause. The one that matters on a
Terminus build is **Catastrophe Nova** (`1E1CECCE`), slot 1 of every transcended
Terminus, whose 35-step ladder reaches **70% at level 35** - exactly the level a
T7 weapon's slot 1 carries:

| Level | 25  | 30  | 33  | 34  | 35     |
| ----- | --- | --- | --- | --- | ------ |
| ATK % | 50  | 60  | 66  | 68  | **70** |

Its text reads _"When at {4} max HP or less: ATK +{0:.1f}% / DMG Cap +{1:.1f}%"_,
so it is nominally conditional - but the pause-menu ATK **includes it
unconditionally**, which is what the confirmed build proves.

**Not every `ATK +n%` source reaches the displayed ATK.** Two are confirmed not
to, and the rule separating them is not established:

| Source                           | Reaches displayed ATK? |
| -------------------------------- | ---------------------- |
| Catastrophe Nova (weapon slot 1) | yes                    |
| Supernova (weapon slot 3)        | yes                    |
| Tyranny (sigil)                  | yes                    |
| Glass Cannon (sigil)             | assumed, not measured  |
| **Fatebreaker (sigil)**          | **no**                 |
| **Board `Attack +{0}%` nodes**   | **no**                 |

Those five are the whole of `STAT_TRAIT_SOURCES`' percentage half. Glass Cannon
is in on judgement rather than a reading - every other `ATK +n%` trait is treated
as not reaching the number, so a build that under-reports ATK is pointing at a
sixth trait that belongs in the list.

Fatebreaker reads `ATK +{0}% / DEF +{1:.1f}% / DMG Cap +{2}%` and is confirmed in
game to move the ATK figure by nothing at all. Io's Offense tree carries five
`Attack +{0}%` nodes totalling 10%, and counting them would give a 1.80
multiplier where the observed one is exactly 1.70.

Being conditional is _not_ the discriminator - Catastrophe Nova's clause is
conditional (_"When at {4} max HP or less"_) and it applies unconditionally. The
board nodes are a different stat type from the flat `Attack Power Up` nodes,
which may be the clue, but Fatebreaker is an ordinary trait and is not.

## The mastery board

`ap_tree_atk` (**Offense**), `ap_tree_def` (**Defense**), and `ap_tree_wep` plus
`ap_tree_rebuild` (the per-weapon sections, which the game totals as
**Collection**). Each row names a `limit_bonus`, which names up to three
`limit_bonus_param` rows.

Two readings have to be right or the board comes out wildly wrong. Both are easy
to get wrong in the obvious direction.

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

The first ATK node on the board is worth 150, the second 250, the third 300, and
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

### What each section is worth

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

The sections are thematic: the Defender section is where the board's HP is, the
Terminus and Ascension sections carry ATK, Stinger carries crit and Stunner
carries stun. **A weapon's board section is worth having even if the weapon is
never equipped** - the stats are permanent once the weapon is transcended, which
is why "Collection" is tracked separately.

Offense gives only 4682 ATK against Defense's 33,300 HP. That asymmetry is real,
not a reading error: the weapon supplies ATK, the board supplies HP.

## Stun is stored at a tenth of what it shows

`limit_bonus_param` marks its 41 stat-type-3 rows with `Unk19 = 10` and stores
the over-mastery ladder as `0.1 … 2`.
[overmasteries.md](overmasteries.md#stun-powers-fractions-are-the-archives-own)
left open whether the game renders that or normalises it.

**It normalises it, and the rule is universal.** Every stun figure in the
archive - `chara_status`'s base 8, the board's fractions, the over-mastery
ladder, the `skill_status` trait's `0.5 … 10` - is a tenth of what the game
prints. The confirmed build settles it:

```
(8 base + 10.9 board + 1.0 over-mastery) x 10 = 199
```

So a character's base Stun Power reads **80** in game, not 8, and a maxed Stun
Power trait is worth **100**, not 10. Nothing needs a per-source multiplier;
stun is simply stored in tenths throughout.

## The confirmed builds

Io, character level 100, master level 55, mastery board complete (150% Offense /
150% Defense / 100% Collection), four over-masteries (Chain Burst DMG 10%, Skill
DMG Cap 20%, Stun Power 10, Normal Attack DMG Cap 20%), **no summons equipped and
no master-trait points spent**. Measured with two weapons, both maxed - level 150,
awakening 10, T7, plus 99.

| Reported            |    HP |   ATK | Crit | Stun |   PWR |
| ------------------- | ----: | ----: | ---: | ---: | ----: |
| Terminus            | 71055 | 56467 |  83% |  199 | 46526 |
| Ascension           | 70761 | 46122 |  83% |  299 | 46044 |
| Ascension + Tyranny | 56609 | 63187 |  83% |  299 | 46368 |

The third is the second with one Tyranny sigil added, pooled to level 17.

### HP

| Part                      |  Terminus | Ascension |
| ------------------------- | --------: | --------: |
| Io base, level 100        |      3156 |      3156 |
| Fate episodes             |       640 |       640 |
| Weapon, maxed             |      1159 |      4465 |
| Master levels (50 awards) |      6000 |      6000 |
| Board - Defense           |     33300 |     33300 |
| Board - Collection        |     23200 |     23200 |
| HP trait, level 20        |      3600 |         0 |
| **Total**                 | **71055** | **70761** |

### ATK

| Part                       |  Terminus | Ascension |
| -------------------------- | --------: | --------: |
| Io base, level 100         |       666 |       666 |
| Fate episodes              |       165 |       165 |
| Weapon, maxed              |     20583 |     19711 |
| Master levels (50 awards)  |      3000 |      3000 |
| Board - Offense            |      4682 |      4682 |
| Board - Collection         |      4120 |      4120 |
| Slot 1 ATK trait, level 35 |         0 |       600 |
| **Flat subtotal**          | **33216** | **32944** |
| Percentage trait           |     x1.70 |     x1.40 |
| Product                    |   56467.2 |   46121.6 |
| **Total, rounded**         | **56467** | **46122** |

The two multipliers are each a single weapon trait at its T7 slot level:
**Catastrophe Nova** at 35 is +70% and sits in Terminus slot 1; **Supernova** at
15 is +40% and sits in Ascension slot 3. Ascension's slot 1 is the flat ATK trait
instead, worth 600 at level 35.

**The result is rounded, not truncated.** One build cannot tell the two apart -
56467.2 gives 56467 either way - but 46121.6 truncates to 46121 against a
reported 46122. Two measurements were needed to settle it.

### Crit and Stun

```
crit = 5 base + 40 Offense + 38 Collection (Stinger)                = 83   (both weapons)
stun = (8 base + 6.1 Offense + 4.8 Collection (Stunner) + 1.0 OM)   = 19.9 x 10 = 199
```

Crit is unchanged across the swap, as it must be: neither weapon's slots carry a
crit trait, and the arithmetic closes without one. The same reasoning proves
**no crit sigils and no stun sigils on this build**, and that the over-mastery
Stun Power line reported as "10" is stored as `1.0`.

### The wrightstone belongs to the weapon

HP falls by exactly **3600** across the swap, which is the level 20 HP trait -
the whole of the wrightstone's contribution. The imbued traits do not follow the
character, so a Build's wrightstone is a property of the equipped weapon.

### Trait levels pool, and the pooled level indexes the ladder once

Stun rises by exactly **10.0 stored** on the Ascension. Its slot 2 pool offers
Stun Power, which at the T7 slot 2 level of 25 is worth `6.0` on its own - not
10.0. A wrightstone Stun Power at level 20 is worth `5.5` on its own. Neither
alone nor summed (`11.5`) gives the observed figure.

Pooled, they do: level 25 + level 20 = **level 45**, and the ladder at 45 reads
exactly **10.0**. This is the `Trait Level Totals` rule in
[CONTEXT.md](../CONTEXT.md) confirmed against the game - **levels add, then the
ladder is read once**, and reading each source's value separately and summing is
wrong. It matters most for the traits with steep ladders.

The Tyranny sigil confirms it independently. It was equipped as `2 + 15`, and
Tyranny's ladder reads `+35%` at level 15, `+36%` at 16 and **`+37%` at 17** -
the reported figure. Summing two separate readings would have given `+8% and
+35%`, not `+37%`.

## PWR

The game's own definition, `TXT_TIPS_BODY_CYC_PWR`:

> PWR is an aggregate value of a character's level, gear, and Masteries.

Six tables carry the coefficients, all prefixed `chara_power_`. The arithmetic
that combines them is in the executable.

**Those six are the whole of it.** Every `.tbl` in the archive is imported into
`tables.sqlite` - the only files without a table are directories, `quest_prologue`
and a fade-timing table. There is no further PWR table to find, and nothing in
`skill`, `skill_status` or `status` carries a per-trait power value. What follows
was therefore reconstructed by measurement, not read off.

**This section is parked.** Gear is solved; the stat side is measured but its
coefficients do not match the tables, and closing it needs many more in-game
readings for little return. Nothing in this project depends on it - see
[what this project uses](#what-this-project-uses).

### The attenuation curve

`chara_power_attenuate` is a piecewise diminishing-returns curve: rows of
`(StatAmountForRange, PowerPerStatInRange)`, each row's rate applying from its
own breakpoint to the next. **Only four stat keys attenuate**, and two share a
curve exactly.

| Key   | Rate by range                                                          |
| ----- | ---------------------------------------------------------------------- |
| 4     | 1.0 to 600, 0.2 to 2000, 0.167 to 60000, 0.008 beyond                  |
| 5     | 0.5 to 3000, 0.2 to 10000, 0.02 to 30000, 0.01 to 300000, 0.005 beyond |
| 7, 11 | 1.0 to 120, 0.5 to 800, 0.2 to 90000, 0.008 beyond                     |

### The other five tables

| Table                                    | Rows | Holds                                        |
| ---------------------------------------- | ---- | -------------------------------------------- |
| `chara_power_adjust`                     | 19   | a flat multiplier per stat key               |
| `chara_power_rebuild_adjust`             | 6    | a value per weapon series, for transcendence |
| `chara_power_skillboard_rank_adjust`     | 3    | a weight per master-trait rank               |
| `chara_power_skillboard_category_adjust` | 11   | a weight per master-trait category, all 1    |
| `chara_power_skill_adjust`               | 1    | a single weight, 11                          |

`chara_power_adjust`, keyed 0 to 18:

```
0:0   1:10   2:5   3:10   4:1     5:1     6:5     7:1     8:35   9:10
10:1  11:0.1 12:1  13:1   14:35   15:0.04 16:0.04 17:0.02 18:5
```

**`chara_power_rebuild_adjust` holds floats, not the hex integers its header
claims.** The tool declares `Unk2|hex_uint`; the six values decode as exact
IEEE-754 floats - `43480000` = 200, `43960000` = 300, `437A0000` = 250 - giving
**200 / 300 / 200 / 300 / 250 / 300** across series 0-5. Which index is which
series is not established. This is the pitfall
[archive.md](archive.md#column-layouts) warns about: check a column's shape
against its data before trusting its name.

**`chara_power_skillboard_rank_adjust` skips EX.** Its three keys are
`skillboard_group` hashes weighted **1 / 2 / 3**; `skillboard_group` is the four
rank sections. The EX row `3B99904D` is absent, so on the face of the data the EX
rank contributes no PWR.

### No table names the keys

The 19 keys of `chara_power_adjust` are an engine-internal enum and **no table
names them**. Four candidate enums were checked and none matches:

- `limit_bonus_param`'s stat type: `0 ATK, 1 HP, 2 crit, 3 stun, 4 potion stock,
9 sigil slot`, then a 100+ damage block. Wrong shape.
- `summon_base_param.ParamID`: a 400-series enum. Wrong range.
- `skillboard_category`: four rows. Wrong size.
- `status`: the buff and ailment enum, running to `StatusId` 1021. Wrong thing
  entirely - it holds no stat coefficients.

The confirmed builds constrain it but do not close it. Reading key 4 as ATK and
key 5 as HP on the Terminus build:

```
attenuate(4, 56467) =  9976.0
attenuate(5, 71055) =  3710.6
                      --------
                      13686.5     against a reported PWR of 46526
```

That leaves **32,839** unaccounted - far too much for crit, stun and the
transcendence term to cover. The damage-cap family is the likeliest occupant of
the gap, and the measurements below bear that out: DMG Cap turns out to carry a
PWR channel of its own, worth more per level than its gear.

### PWR is not a function of the displayed HP and ATK

Adding a Tyranny sigil to the Ascension build is a clean experiment: Tyranny
changes ATK and HP and nothing else - no damage caps, no crit, no stun.

| Stat | Before | After |
| ---- | -----: | ----: |
| ATK  |  46122 | 63187 |
| HP   |  70761 | 56609 |
| PWR  |  46044 | 46368 |

**PWR rose by 324.** Every pairing of the four attenuating keys was tested
against that:

| ATK key | HP key | Predicted ΔPWR |
| ------- | ------ | -------------: |
| 4       | 5      |        +2201.6 |
| 4       | 7      |         -487.3 |
| 4       | 11     |        +2060.1 |
| 5       | 4      |         -481.7 |
| 5       | 11     |         -112.4 |
| 7       | 5      |        +3271.5 |
| 11      | 5      |         +199.8 |
| 11      | 4      |         -311.1 |

The closest is +199.8, off by 124, and nothing else is near. **No assignment of
the attenuation keys to the displayed HP and ATK reproduces the observed
change.**

The flat-stat reading fails too, and harder. Tyranny is purely multiplicative:
it leaves the flat subtotals (32,944 ATK and 70,761 HP) completely untouched. A
PWR computed from pre-multiplier stats would therefore not move at all, and it
moved by 324.

So PWR is measuring something other than the four stats alone. The game's own
wording - _"an aggregate value of a character's level, gear, and Masteries"_ -
turns out to be literal: **there is a gear term on top of the stat term.**

### The gear term is 5 per pooled trait level, capped

Confirmed with sigils whose traits move no displayed stat at all, so the stat
term is exactly zero and the whole reading is gear. Levels below are **trait**
levels - the sigil's level plus the +2 from Sigil Booster, which PWR counts:

| Sigil                           | Sigil Lv | Trait levels | Pooled | ΔPWR |
| ------------------------------- | -------: | ------------ | -----: | ---: |
| Quick Cooldown x2               |       15 | 17, 17       |     34 |  170 |
| Quick Cooldown + Potion Hoarder |       11 | 13, 13       | 13, 13 |  130 |
| Supplementary DMG x2            |       15 | 17, 17       |     34 |  170 |

Levels from every copy of a trait pool, and the pooled level is then clamped to
that trait's own maximum before PWR reads it. Adding a second Supplementary DMG
x2 sigil pools to 68 against a cap of 45, and buys only the difference:

| Build                       | Suppl pooled | Support | Gear | ΔPWR |
| --------------------------- | -----------: | ------: | ---: | ---: |
| Suppl x2 @15                |           34 |       - |  170 |  170 |
| + a second Suppl x2 @15     | 68 -> **45** |       - |  225 |  +55 |
| + Suppl-Support @15 instead | 51 -> **45** |      17 |  310 | +140 |

`5 x 45 = 225` and `5 x 45 + 5 x 17 = 310` reproduce both readings exactly. So:

```
gear = sum over traits of 5 * min(pooled trait level, trait max level)
```

Every trait contributes, not just the primary, and a trait that does nothing to
any stat still adds PWR. The rate is **5** for every trait measured so far,
spanning three gem categories - Quick Cooldown (support), Potion Hoarder
(utility) and Supplementary DMG (offensive).

That rate is not fitted. `chara_power_adjust` lists 19 flat coefficients, and 5
is one of them:

| Key | Adjust | Key | Adjust | Key | Adjust |
| --: | -----: | --: | -----: | --: | -----: |
|   0 |      0 |   6 |      5 |  14 |     35 |
|   1 |     10 |   7 |      1 |  15 |   0.04 |
|   2 |      5 |   8 |     35 |  16 |   0.04 |
|   3 |     10 |   9 |     10 |  17 |   0.02 |
|   4 |      1 |  10 |      1 |  18 |      5 |
|   5 |      1 |  11 |    0.1 |     |        |

Only keys 4, 5, 7 and 11 have rows in `chara_power_attenuate`; the rest are flat
rates, and one of the three 5s is the trait rate.

**An earlier reading of this doc had `5L + 10` on sigil level and summed gear per
instance rather than pooling.** Both are wrong. They agreed with the data by
coincidence: a rate through the origin makes per-instance and pooled identical
(`2 x 5 x 17 = 5 x 34`), so the two models only separate where a cap bites, and
no early measurement capped.

### Weapon trait levels pool with sigil levels

The trait level PWR reads is the sum of every source, and the game shows it as
`bonus + base` - the weapon's own levels plus the Sigil Booster on the left, the
sigils' printed levels on the right. Io's Ascension weapon carries ATK at 35, so
a level 11 ATK sigil displays as `37+11` and lands at 48.

This matters because a sigil's gear delta is the _change_ in the pooled level,
not the sigil's own level, and it clips at the trait's maximum:

| ATK sigil | Pooled       | Ladder value | Flat ΔATK | Displayed (x1.40) | Gear levels |
| --------- | ------------ | -----------: | --------: | ----------------: | ----------: |
| none      | 35           |          600 |         - |                 - |           - |
| Lv 11     | 48           |         1700 |      1100 |             +1540 |          13 |
| Lv 15     | 52 -> **50** |         2000 |      1400 |             +1960 |      **15** |

Both observed exactly. The level 15 sigil overcaps, so it buys 15 levels of gear
rather than 17 - the same clamp governs the stat and the gear.

### The ATK channel

Three builds on the Ascension weapon, against a bare-weapon PWR of 46044. Gear
is `5` per pooled trait level as established above:

| Build          | ΔPWR | Gear levels    | Gear | Residual |  ΔATK | DMG Cap value |
| -------------- | ---: | -------------- | ---: | -------: | ----: | ------------: |
| DmgCap-ATK @15 |  213 | 15 ATK + 17 DC |  160 |       53 | +1960 |            51 |
| DmgCap-ATK @11 |  171 | 13 ATK + 13 DC |  130 |       41 | +1540 |            39 |
| DMG Cap x2 @15 |  209 | 34 DC          |  170 |       39 |     0 |           106 |

**DMG Cap is not stat-neutral.** The third build moves no displayed stat yet
still leaves 39 over its gear, and the leftover tracks its cap percentage. It
carries a PWR channel of its own, so it is a poor choice of control trait -
Quick Cooldown, Potion Hoarder and Autorevive remain the clean ones.

Taking DMG Cap's rate from the third build (`39/106`) and solving the other two
for ATK gives three independent readings, the third from the Tyranny series:

```
DmgCap-ATK @15   0.01747 per displayed ATK point
DmgCap-ATK @11   0.01731
Tyranny          0.01718      (63187 -> 69182, assuming Tyranny gear rate 5)
```

They agree to 1.7% across 46k-69k ATK. That agreement is itself the evidence
that **Tyranny's gear rate is also 5** - it was assumed to produce the third
reading, and it landed on the other two rather than away from them. Rate 5 now
holds for Quick Cooldown, Potion Hoarder, Supplementary DMG, DMG Cap, Tyranny
and the Gem-0 ATK trait.

The implied DMG Cap rate falls slightly with level (0.375 at 17, 0.369 at 13 and
0.368 at 34), which is what an attenuating channel should do.

**The ATK rate matches nothing in the tables.** No product of a
`chara_power_adjust` coefficient and a `chara_power_attenuate` rate gives
0.0173; the nearest are `0.167 x 0.1 = 0.0167` and a flat `0.02`, and no key
carries 0.167 in this range. Every build so far also sits inside one band on
every candidate key, so nothing has yet been measured across a boundary.

**The test that would identify the curve is ATK above 90000.** Keys 7 and 11
drop from 0.2 to 0.008 there - a 25-fold collapse that no other key has. Terminus
with Tyranny and an ATK sigil reaches roughly 88k, so it is within reach of a
build tuned slightly harder for ATK.

### Where this stops

The archive is exhausted. Everything above the gear law came out of paired
in-game readings, and each further term needs its own build swap, so the cost
per answer keeps rising while the answers get smaller.

What is solved:

- **Gear.** `5 x min(pooled trait level, trait max)` per trait, pooling weapon
  slots, wrightstone, sigils and the Sigil Booster's +2. Six traits across four
  gem categories, and the ATK sigil's overcap confirms the clamp governs gear and
  stat alike.

What is measured but unmatched:

- **The ATK channel**, ~0.0173 per displayed point, consistent to 1.7% across
  three builds - but not a product of any coefficient in the tables. Every build
  sits inside one band on every candidate key, so the curve is unidentified.
  Crossing 90000 ATK would separate keys 7 and 11 from 4 and 5.
- **DMG Cap's channel**, ~0.37 per point of cap percentage, declining with level.
  The baseline it attenuates against includes the board and the over-masteries
  and has not been isolated.

What was never reached:

- **The HP channel.** No build has moved HP without also moving ATK.
- **The absolute number.** Every reading is a _delta_ against a bare-weapon
  46,044 that still contains the character level, the board, the master levels
  and the weapon. Building that figure from scratch is the real test, and none of
  its terms is isolated.
- **The weapon/series term** in `chara_power_rebuild_adjust`, whose floats decode
  as 200 / 300 / 200 / 300 / 250 / 300 but whose index-to-series mapping is
  unknown.

A note for anyone resuming: **DMG Cap is not a valid control trait** - it carries
its own PWR channel. Quick Cooldown, Potion Hoarder and Autorevive are the clean
stat-neutral ones.

## Reading it back

The queries are single joins against `tables.sqlite`.
`chara_power_attenuate` needs its rows read in `StatAmountForRange` order and
treated as ranges rather than points. The board needs both corrections above -
`LimitBonusParamIndex` as a level, and `reqT = 7` as a replacement set.

## What this project uses

**All four stats, in `src/domain/status.ts`.** `deriveStatus` is this page as
code: the flat sum, then the one multiplicative stage, then the rounding. The
three confirmed builds above are its test, `src/domain/status.test.ts`, and it
reproduces every figure to the unit. `Status` is no longer player-entered, and
`Weapon.critRate` / `Weapon.stun` are gone with it - they were always zero.

**PWR stays player-entered**: its arithmetic is in the executable, the archive
holds no table that closes it, and the reconstruction is parked short of a
formula.

Three assumptions the derivation makes, because a Build carries no field for any
of them and the card is a max-build card:

- the **mastery board is complete** - 150% Offense, 150% Defense, and every
  weapon transcended, so the whole Collection is banked
- **all nine fate episodes** are unlocked
- master level is at least **50**, which the editor's 51-55 range guarantees

Two generated files carry the data. `character-stats.json` holds each
character's level-100 base and its board total; `trait-stats.json` holds the
per-level ladders, for the four flat traits and for the percentage traits
confirmed to reach the displayed ATK. Both come out of `scripts/extract.mjs`,
which fails the run if Io stops matching the confirmed build.

**The percentage whitelist is the one place to look when a build is off.** It is
hand-written in `STAT_TRAIT_SOURCES` and currently names Catastrophe Nova,
Supernova, Tyranny and Glass Cannon. A trait outside it contributes nothing to
ATK, so an under-reported ATK means a fifth trait belongs in the list - which is
a one-line change once the game confirms it.
