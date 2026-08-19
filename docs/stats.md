# Stats and PWR

Where HP, ATK, Critical Hit Rate, Stun Power and PWR come from. Archive version 2.0.2. See [archive.md](archive.md).

**HP, ATK, Crit, Stun: solved, confirmed in game to the unit** against a maxed Io - project derives all four. PWR: coefficient tables located, formula derived in research, not yet wired into the app. Check: [below](#worked-example).

## The model

The model is a flat sum, then a percentage. Every source contributes a flat number, they add. One multiplicative stage follows; only ATK is known to reach it.

```
stat = (base + fate + weapon + masteries + master levels + traits + summons)
     x (1 + percentage traits)
```

Confirmed build: single trait worth **+70%**, flat sum 33,216 vs. displayed 56,467.

| Source                                 | Table                                               | HP        | ATK       | Crit   | Stun   |
| -------------------------------------- | --------------------------------------------------- | --------- | --------- | ------ | ------ |
| Character base                         | `chara_status`                                      | per level | per level | 5 flat | 8 flat |
| Fate episodes                          | `chara_status_fate`                                 | +640      | +165      | -      | -      |
| Weapon                                 | `weapon_status` + `_awake` + `_rebuild` + `_plus`   | yes       | yes       | 0      | 0      |
| Traits                                 | `skill_status`                                      | yes       | yes       | yes    | yes    |
| Masteries - Offense/Defense/Collection | `ap_tree_*` -> `limit_bonus` -> `limit_bonus_param` | yes       | yes       | yes    | yes    |
| Masteries - Over Mastery               | `limit_bonus_param` (`MED_EFF_*`)                   | yes       | yes       | yes    | yes    |
| Master levels                          | `skillboard_unlock`                                 | +6000     | +3000     | -      | -      |
| Summon equip                           | `summon_base_param`                                 | yes       | yes       | yes    | yes    |

"Traits" = one row per trait level, covers sigils, wrightstone, weapon's five trait slots - same `skill_status` ladder at different levels.

## Character base

`chara_status`: 19 rows/character, levels 1-100. **Only level 1 and 100 rows carry `Stun`/`CritRate`** - both **8** and **5** for all 29 characters. 17 rows between hold 0 (unchanged).

Level 1 = level 100 base crit/stun; everything above is equipment. `DefenseLikely` = 0 every row - no player DEF stat.

Io (`PL0400`): 144 HP / 9 ATK at level 1 → **3156 HP / 666 ATK** at 100.

## Fate episodes

`chara_status_fate`: 9 rows/character, 261 total, identical: `10/15/20/25/50/70/100/150/200` HP, `3/5/7/10/15/20/25/30/50` ATK - **+640 HP, +165 ATK** fully unlocked.

Three remaining columns (should be stun/crit) = 0 on all 261 rows; tool header: "seem to do nothing." Fate episodes move HP/ATK only.

## Master levels

`skillboard_unlock`: 50 rows, `HealthAdd`/`AttackAdd`/`DmgCapAdd` every fifth. Total: **+6000 HP, +3000 ATK, +100 DMG Cap** at level 50.

Table stops at 50; master level runs to 55 but 51-55 grant no points, no stats (buy Unbound Master's damage cap - [master-traits.md](master-traits.md#master-levels-51-55)). Level 55 = same +6000/+3000 as level 50. Confirmed in game.

## Weapons

All four weapon stat tables carry `StunPower`/`CritRate` - zero on every weapon of every series ([weapons.md](weapons.md#stats)). Crit/stun reach a weapon only through **trait slots** (ordinary `skill_status` traits).

Character HP offset already baked into `weapon_status`: Io's level 150 Defender reads 2599 there (series' 2612 with -13 applied).

## The trait ladders

`skill_status` per-trait, per-level value in `LevelValue1`:

| Trait             | Key            | Levels | Ladder                | Format                        |
| ----------------- | -------------- | ------ | --------------------- | ----------------------------- |
| ATK               | `SKILL_000_00` | 50     | 4, 6, 8 … 2000        | `ATK +{0}`                    |
| HP                | `SKILL_001_00` | 50     | 200, 300, 400 … 10000 | `HP +{0}`                     |
| Critical Hit Rate | `SKILL_003_00` | 45     | 5, 6, 7 … 50          | `Critical Hit Rate +{0:.1f}%` |
| Stun Power        | `SKILL_004_00` | 45     | 0.5, 1, 1.5 … 10      | `Stun Power +{0:10}`          |

ATK/HP flat adds. Critical Hit Rate: percentage points, added to base 5. `{0:.1f}` = precision spec, `{0:10}` = width spec - **neither is a multiplier**.

Flat ATK trait small: level 50 cap = 2000, under a tenth of a maxed weapon. Sigils barely move ATK - percentage traits do.

### Percentage traits

Percentage traits compound, they do not add. Two percentage traits **multiply**. Tyranny at pooled level 17 (ATK +37%) added to Ascension build (Supernova +40%):

```
additive   32944 x (1 + 0.40 + 0.37) = 58311     wrong
compound   32944 x 1.40 x 1.37       = 63186.6   -> 63187, as reported
```

Negative percentage compounds the same way: Tyranny's Max HP -20% took 70761 HP to `70761 x 0.80 = 56608.8`, reported **56609**.

### The multiplicative stage

The percentage traits are the multiplicative stage. ~50 traits carry `ATK +{n}%`. On a Terminus build: **Catastrophe Nova** (`1E1CECCE`), slot 1 of every transcended Terminus, 35-step ladder, **70% at level 35** - the T7 slot 1 level:

| Level | 25  | 30  | 33  | 34  | 35     |
| ----- | --- | --- | --- | --- | ------ |
| ATK % | 50  | 60  | 66  | 68  | **70** |

Text: _"When at {4} max HP or less: ATK +{0:.1f}% / DMG Cap +{1:.1f}%"_ - nominally conditional, but pause-menu ATK **includes it unconditionally**.

**Not every `ATK +n%` source reaches displayed ATK.** Six confirmed not to; the separating rule isn't established:

| Source                             | Reaches displayed ATK? |
| ---------------------------------- | ---------------------- |
| Catastrophe Nova (weapon slot 1)   | yes                    |
| Supernova (weapon slot 3)          | yes                    |
| Tyranny                            | yes                    |
| Glass Cannon                       | yes                    |
| **Fatebreaker (sigil)**            | **no**                 |
| **Masteries `Attack +{0}%` nodes** | **no**                 |
| **Enmity**                         | **no**                 |
| **Stamina**                        | **no**                 |
| **Guard Payback**                  | **no**                 |
| **Overdrive Assassin**             | **no**                 |

First four = the whole of `STAT_TRAIT_SOURCES`' percentage half. Any other `ATK +n%` trait treated as not reaching the number.

### The Terminus slot 2 pool

The Terminus slot 2 pool settles most of the list. Terminus slot 2: nine-trait pool at fixed T7 level 25. Sweeping it, **only Tyranny and Glass Cannon move any number** (PWR moves with displayed ATK, so untouched PWR = untouched ATK):

| Trait              | Lv 25 clause              | Moves ATK? |
| ------------------ | ------------------------- | ---------- |
| Enmity             | `ATK +90%`                | no         |
| Stamina            | `ATK +60%` at full HP     | no         |
| Guard Payback      | `ATK +45%`                | no         |
| Overdrive Assassin | `DMG Dealt +90%`          | no         |
| Glass Cannon       | `ATK +45% / DMG Cap +45%` | **yes**    |
| Tyranny            | `ATK +45% / Max HP -20%`  | **yes**    |

Fatebreaker (`ATK +{0}% / DEF +{1:.1f}% / DMG Cap +{2}%`): confirmed to move ATK by nothing. Io's Offense tree: five `Attack +{0}%` nodes, 10% total - counting them gives 1.80 multiplier vs. observed 1.70.

Conditionality isn't the discriminator: Catastrophe Nova's clause is conditional and applies unconditionally; Enmity's unconditional +90% (largest ATK clause in the pool) does nothing. Size isn't it either - Glass Cannon and Guard Payback both read `ATK +45%` at level 25, same slot, same weapon; only one lands.

## Masteries

Offense, Defense, Collection sections, plus Over Mastery. Own page: [masteries.md](masteries.md).

Per-section totals, Io, every node taken, all six weapons at T7:

| Section    |        HP |      ATK |   Crit |    Stun |
| ---------- | --------: | -------: | -----: | ------: |
| Offense    |         0 |     4682 |     40 |     6.1 |
| Defense    | **33300** |        0 |      0 |       0 |
| Collection | **23200** | **4120** | **38** | **4.8** |

Offense: 4682 ATK vs. Defense's 33,300 HP - real asymmetry. Weapon supplies ATK; Masteries supply HP.

## Stun storage

Stun is stored at a tenth of what it shows. `limit_bonus_param`: 41 stat-type-3 rows `Unk19 = 10`, over-mastery ladder `0.1 … 2`.

**Normalised, universally.** Every stun figure - `chara_status`'s base 8, Masteries fractions, over-mastery ladder, `skill_status` trait's `0.5 … 10` - is a tenth of the printed value. Confirmed build:

```
(8 base + 10.9 masteries + 1.0 over-mastery) x 10 = 199
```

Base Stun Power reads **80** in game, not 8; maxed Stun Power trait = **100**, not 10. Stun is simply stored in tenths throughout.

## Worked example

Io, level 100, master level 55, Masteries complete (150% Offense/150% Defense/100% Collection), four over-masteries (Chain Burst DMG 10%, Skill DMG Cap 20%, Stun Power 10, Normal Attack DMG Cap 20%), **no summons, no master-trait points**. Two weapons, both maxed (level 150, awakening 10, T7, plus 99).

| Reported                   |    HP |   ATK | Crit | Stun |   PWR |
| -------------------------- | ----: | ----: | ---: | ---: | ----: |
| Terminus                   | 71055 | 56467 |  83% |  199 | 46526 |
| Ascension                  | 70761 | 46122 |  83% |  299 | 46044 |
| Ascension + Tyranny        | 56609 | 63187 |  83% |  299 | 46368 |
| Terminus + Tyranny 25      | 56844 | 81877 |  83% |  199 | 46871 |
| Terminus + Glass Cannon 25 | 71055 | 81877 |  83% |  199 | 47042 |

Third = second + one Tyranny sigil, pooled to level 17. Last two = first + a slot 2 pool trait chosen (no extra gear; differ in one clause).

### HP

| Part                      |  Terminus | Ascension |
| ------------------------- | --------: | --------: |
| Io base, level 100        |      3156 |      3156 |
| Fate episodes             |       640 |       640 |
| Weapon, maxed             |      1159 |      4465 |
| Master levels (50 awards) |      6000 |      6000 |
| Masteries - Defense       |     33300 |     33300 |
| Masteries - Collection    |     23200 |     23200 |
| HP trait, level 20        |      3600 |         0 |
| **Total**                 | **71055** | **70761** |

### ATK

| Part                       |  Terminus | Ascension |
| -------------------------- | --------: | --------: |
| Io base, level 100         |       666 |       666 |
| Fate episodes              |       165 |       165 |
| Weapon, maxed              |     20583 |     19711 |
| Master levels (50 awards)  |      3000 |      3000 |
| Masteries - Offense        |      4682 |      4682 |
| Masteries - Collection     |      4120 |      4120 |
| Slot 1 ATK trait, level 35 |         0 |       600 |
| **Flat subtotal**          | **33216** | **32944** |
| Percentage trait           |     x1.70 |     x1.40 |
| Product                    |   56467.2 |   46121.6 |
| **Total, rounded**         | **56467** | **46122** |

Multipliers: **Catastrophe Nova** at 35 = +70% (Terminus slot 1); **Supernova** at 15 = +40% (Ascension slot 3). Ascension's slot 1 = flat ATK trait, 600 at level 35.

**Result is rounded, not truncated.** 56467.2 gives 56467 either way; 46121.6 truncates to 46121 vs. reported 46122.

### Crit and Stun

```
crit = 5 base + 40 Offense + 38 Collection (Stinger)                = 83   (both weapons)
stun = (8 base + 6.1 Offense + 4.8 Collection (Stunner) + 1.0 OM)   = 19.9 x 10 = 199
```

Crit unchanged across the swap - neither weapon's slots carry a crit trait. Same reasoning: no crit or stun sigils on this build; the over-mastery "10" Stun Power line is stored as `1.0`.

### The wrightstone

The wrightstone belongs to the weapon. HP falls exactly **3600** across the swap = the level 20 HP trait, the whole wrightstone contribution. Imbued traits don't follow the character - a Build's wrightstone is a property of the equipped weapon.

### Trait levels

Trait levels pool, and the pooled level indexes the ladder once. Stun rises exactly **10.0 stored** on the Ascension. Slot 2 pool offers Stun Power, worth `6.0` alone at T7 level 25 - not 10.0. Wrightstone Stun Power at level 20 = `5.5` alone. Neither alone nor summed (`11.5`) matches.

Pooled: level 25 + 20 = **level 45**, ladder at 45 = exactly **10.0**. `Trait Level Totals` rule ([CONTEXT.md](../CONTEXT.md)) confirmed - **levels add, then the ladder reads once**; summing separate readings is wrong. Matters most for steep ladders.

Tyranny sigil confirms independently: equipped as `2 + 15`, ladder reads `+35%` at 15, `+36%` at 16, **`+37%` at 17** - the reported figure, not `+8% and +35%`.

## PWR

Game's own definition, `TXT_TIPS_BODY_CYC_PWR`:

> PWR is an aggregate value of a character's level, gear, and Masteries.

Six tables, prefixed `chara_power_`, carry the coefficients; the combining arithmetic is in the executable, not in any table.

| Table                                    | Rows | Holds                                               |
| ---------------------------------------- | ---- | --------------------------------------------------- |
| `chara_power_adjust`                     | 19   | flat multiplier per input key                       |
| `chara_power_attenuate`                  | 68   | diminishing-returns curve for the attenuated keys   |
| `chara_power_rebuild_adjust`             | 6    | value per weapon series, unused by the formula      |
| `chara_power_skillboard_rank_adjust`     | 3    | weight per master-trait rank, unused by the formula |
| `chara_power_skillboard_category_adjust` | 11   | weight per master-trait category, all 1, unused     |
| `chara_power_skill_adjust`               | 1    | single weight, 11, unused                           |

**The formula is derived in [research/pwr-formula.md](../research/pwr-formula.md)**, off Nenkai's disassembly and checked against every in-game reading this project has recorded. It resolves to nine flat inputs plus one rounding step:

```
PWR = (base + level x 10 + weaponLevel x 5 + awakening x 10 + atk + hp
       + traitLevels x 5 + msp + overMasteries x 35 + munitions x 10) + 0.5
PWR = min(PWR, 99999)
```

`atk`, `hp` and `msp` run through `chara_power_attenuate` first; the rest are flat. The full derivation, every measured reading, and the one open question (which attenuation band ATK uses) live in `research/pwr-formula.md` and its companion files - `pwr-sources.md`, `pwr-atk-channel-measurement.md`, `pwr-master-levels.md`, `pwr-atk-flat-and-cap.md`, `pwr-transcendence-ladder.md`, `weapon-pwr.md`.

## Implementation

**All four stats, in `src/domain/status.ts`.** `deriveStatus` = this page as code: flat sum, one multiplicative stage, rounding. Three confirmed builds above = its test, `src/domain/status.test.ts`, reproduces every figure to the unit. `Status` no longer player-entered; `Weapon.critRate`/`Weapon.stun` gone (always zero).

**PWR stays player-entered** - the formula is derived in research but not yet wired into the app; the ATK channel's attenuation band is still open.

Three assumptions the derivation makes (Build carries no field for any; card is a max-build card):

- **Masteries complete** - 150% Offense, 150% Defense, every weapon transcended
- **all nine fate episodes** unlocked
- master level **at least 50** (editor's 51-55 range guarantees it)

Two generated files carry the data: `character-stats.json` (level-100 base, Masteries total), `trait-stats.json` (per-level ladders, four flat traits, percentage traits confirmed to reach displayed ATK). Both from `scripts/extract.mjs`, which fails the run if Io stops matching the confirmed build.

**The percentage whitelist is the one place to look when a build is off** - `STAT_TRAIT_SOURCES`, hand-written: Catastrophe Nova, Supernova, Tyranny, Glass Cannon. A trait outside it contributes nothing to ATK.
