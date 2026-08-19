# Weapons

How a GBFR weapon grows: unlocks per step, traits it can carry, stats it gains. Archive version 2.0.2. See [archive.md](archive.md).

## The two stages

Weapon starts at **base**. From there:

- **Ascension** and **Terminus** must be **awakened first**: 0 → 3 → 6 → 10; at 10 a suffix name (_Gambanteinn_ → _Gambanteinn, Staff of Hope_; _Caduceus_ → _Caduceus, Immortal Coil_). Only then transcends.
- **Defender, Stunner, Stinger, Executioner** skip awakening, transcend straight away.

**Transcendence**: traits and levels grow, seven steps T0-T7.

Archive: one `weapon` row per awakening step, chained by key - `WEP_PL0400_06`, `_06_01`, `_06_02`, `_06_03`, with `LastAwakeningLevel` = 0/3/6/10. Gran's/Djeeta's chains have an extra row at awakening 1 (no other character does). **Only the final row carries `WeaponSkillLevelRebuildId1..5`** - transcendence unlocks when awakening finishes. No-awakening weapons carry those ids on their base row.

Archive column names spell it **Transcension** - kept only where a column is quoted.

Awakening does **not** change traits: across all 61 chains every row carries the same `WeaponSkillId1..4` - awakening only raises the ceiling, renames the weapon, opens transcendence.

## Transcendence step unlocks

Levels belong to the **slot**, not the weapon:

| Slot | T0  | T1  | T2  | T3  | T4  | T5  | T6  | T7     |
| ---- | --- | --- | --- | --- | --- | --- | --- | ------ |
| 1    | 25  | 26  | 27  | 28  | 29  | 30  | 32  | **35** |
| 2    | 15  | 16  | 17  | 18  | 19  | 20  | 22  | **25** |
| 3    | 0   | 2   | 4   | 6   | 8   | 10  | 12  | **15** |
| 4    | 0   | 1   | 2   | 3   | 4   | 5   | 6   | **10** |
| 5    | 0   | 0   | 0   | 0   | 0   | 0   | 0   | **15** |

- Slots 1/2 live from T0, +1/step, +2 at T6, +3 at T7.
- Slots 3/4 dormant at T0, open at T1.
- Slot 5 zero until T7, full value at once.
- T7 is a step change everywhere - every slot gains more at T7 than any prior step.

Ascension/Terminus (awakened series): slot 3 starts at **5**, live from T0; slot 4 flat - Sigil Booster at 1 the whole way, reaching 2 at T7 for Ascension, staying 1 for Terminus.

Terminus slot 5 tops at **1**, not 15: _Unbound Master_ doesn't take its level from the weapon - _"Boosts damage cap based on master level"_ - a 55-step ladder, same cap as master level. Slot = switch; master level sets strength. See [master-traits.md](master-traits.md#master-levels-51-55).

Post-launch Defender: non-standard slot 1, `25, 26, 26, 27, 27, 28, 29, 30` (gains every other step, caps five lower). Slot 3 starts at **5**, like awakened series.

### The eight-rung ladder

`weapon_skill_level_rebuild`: eleven numeric columns, headers name only eight (`Transcension0..5`, `Unk7`, `Transcension6`, `Unk9`, `Unk10`, `Transcension7`). **`Unk7` is a rung**, sits between T5 and T6 (32 for slot 1, 22 for slot 2). Reading only named columns drops it, turns eight rungs into seven.

Every row a weapon actually references leaves the last three columns zero - eight rungs is the whole ladder. `weapon_status_rebuild` (seven rows/weapon) and `weapon_rebuild_effect_color` (seven rows) agree on seven steps between them.

**64 slot-groups use all eleven columns** on contiguous ladders (25-35 single steps, 15-25) and **none is referenced by any `weapon` row** - abandoned draft or unshipped extension, undecidable.

## Trait slots

Five slots: **fixed** (one trait always) or **pool** (player picks one). Slots 1/3/5 usually fixed; 2/4 usually pools.

Archive: a slot = rows in `weapon_skill_level_rebuild`, found by `WeaponSkillLevelRebuildId<n>`. **One row = fixed, several = pool** (first = default). `Unk12` = trait; `Transcension<n>SkillLevel` columns = ladder. Whole of the "rotatable trait" mechanic, not limited to Terminus.

`WeaponSkillId1/2` = **pre-transcendence** traits, slot 1/2 defaults - not the transcended set: Terminus shows `Catastrophe` there but transcends into `Catastrophe Nova`.

## The six series

A series = its five slots; every character's weapon in a series carries the same ones. Named after the slot-1 trait.

### Defender

22 owners (base roster). Base traits HP + Garrison. **Level 150: ATK 2003, HP 2612.**

| Slot | Trait            | Pool                                                                                           |
| ---- | ---------------- | ---------------------------------------------------------------------------------------------- |
| 1    | HP               | fixed                                                                                          |
| 2    | Garrison         | Regen, Greater Aegis, Stronghold, Improved Guard, Burn / Poison / Dizzy / Blight Resistance    |
| 3    | DMG Cap Ecru     | fixed                                                                                          |
| 4    | Regen            | Garrison, Greater Aegis, Stronghold, Improved Guard, Burn / Poison / Dizzy / Blight Resistance |
| 5    | Unbound Exertion | fixed                                                                                          |

### Stunner

22 owners. Base traits Stun Power + Linked Together. **Level 150: ATK 2660, HP 2096.**

| Slot | Trait            | Pool                                                                                                      |
| ---- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| 1    | Stun Power       | fixed                                                                                                     |
| 2    | Linked Together  | Stamina, Aegis, Guard Payback, Sandtomb / Paralysis / SBA Sealed / Held Under Resistance                  |
| 3    | DMG Cap Sage     | fixed                                                                                                     |
| 4    | Potion Hoarder   | Linked Together, Stamina, Aegis, Guard Payback, Sandtomb / Paralysis / SBA Sealed / Held Under Resistance |
| 5    | Unbound Exertion | fixed                                                                                                     |

### Stinger

22 owners. Base traits Critical Hit Rate + Critical Hit DMG. **Level 150: ATK 2299, HP 1579.**

| Slot | Trait             | Pool                                                                                                                           |
| ---- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Critical Hit Rate | fixed                                                                                                                          |
| 2    | Critical Hit DMG  | Life on the Line, Dodge Payback, Overdrive Assassin, Firm Stance, Slow / Skill Sealed / Darkflame Resistance                   |
| 3    | DMG Cap Cobalt    | fixed                                                                                                                          |
| 4    | Guts              | Critical Hit DMG, Life on the Line, Dodge Payback, Overdrive Assassin, Firm Stance, Slow / Skill Sealed / Darkflame Resistance |
| 5    | Unbound Technique | fixed                                                                                                                          |

### Executioner

22 owners. Base traits Weak Point DMG + Break Assassin. **Level 150: ATK 3320, HP 1407.**

| Slot | Trait             | Pool                                                                                                     |
| ---- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| 1    | Weak Point DMG    | fixed                                                                                                    |
| 2    | Break Assassin    | Quick Cooldown, Nimble Onslaught, Uplift, Glaciate / ATK↓ / DEF↓ Resistance                              |
| 3    | DMG Cap Cardinal  | fixed                                                                                                    |
| 4    | Autorevive        | Break Assassin, Quick Cooldown, Nimble Onslaught, Uplift, **Cascade**, Glaciate / ATK↓ / DEF↓ Resistance |
| 5    | Unbound Technique | fixed                                                                                                    |

**Slot 4 offers _Cascade_, slot 2 doesn't.** Slot 4 normally repeats slot 2's pool plus its own default (Stunner adds Potion Hoarder, Stinger adds Guts). Executioner adds Autorevive _and_ Cascade - the only series with a trait reachable in one rollable slot but not the other. Holds across all 22 weapons, confirmed in game on four maxed Executioners: nine slot-4 options, Autorevive and Cascade on top of the seven slot-2 offers.

Ascension/Terminus follow neither pattern - slot 4 fixed at Sigil Booster, no pool.

### Ascension

Awakens to 10 first. Base traits ATK + HP. **Level 150: ATK 1013, HP 1188.**

| Slot | Trait          | Pool                                                                                                                                   |
| ---- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | ATK            | fixed                                                                                                                                  |
| 2    | HP             | Critical Hit Rate, Stun Power, Linked Together, Drain, Precise Wrath, Precise Resilience, Supplementary DMG, + one per-character trait |
| 3    | Supernova      | DMG Cap                                                                                                                                |
| 4    | Sigil Booster  | fixed                                                                                                                                  |
| 5    | Unbound Strike | fixed                                                                                                                                  |

Post-launch characters: slot 2 leads with _Supplementary DMG_, offers _HP_ as an option.

### Terminus

Awakens to 10 first. Base traits Catastrophe + Regen. **Level 150: ATK 2285, HP 99 for every character** - only series whose HP doesn't vary.

| Slot | Trait                | Pool                                                                                                                        |
| ---- | -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1    | Catastrophe **Nova** | fixed                                                                                                                       |
| 2    | Regen                | Stamina, Enmity, Tyranny, Nimble Defense, Guard Payback, Drain, Glass Cannon, Overdrive Assassin, + one per-character trait |
| 3    | DMG Cap              | fixed                                                                                                                       |
| 4    | Sigil Booster        | fixed                                                                                                                       |
| 5    | Unbound Master       | fixed                                                                                                                       |

## The per-character signature trait

Ascension and Terminus each end their slot-2 pool with **one trait per character**, same trait for both series - eight options shared, ninth is the character's own. Only place a weapon's traits depend on the holder.

| Trait              | Characters                                                                     |
| ------------------ | ------------------------------------------------------------------------------ |
| Combo Booster      | Katalina, Rosetta, Lancelot, Charlotta, Zeta, Id, Eustace, Gallanza, Maglielle |
| Combo Finisher DMG | Gran, Djeeta, Vane, Siegfried, Yodarha, Cagliostro, Sandalphon, Seofon         |
| Charged Attack DMG | Io, Ghandagoza, Vaseraga                                                       |
| Injury to Insult   | Ferry, Tweyen, Beatrix                                                         |
| Skilled Assault    | Narmaya, Fraux                                                                 |
| Quick Charge       | Percival, Fediel                                                               |
| Throw DMG          | Eugen                                                                          |
| Concentrated Fire  | Rackam                                                                         |

## Post-launch characters

Sandalphon, Seofon, Tweyen, Gallanza, Maglielle, Fraux, Fediel: **four series, not six** - no Stunner, no Executioner. Beatrix and Eustace carry the full six.

Their Defender is a different weapon: slot 1 leads with **Greater Aegis** (not HP), reduced ladder above, slot 3 gains a **second option unique to the character**:

| Character  | Weapon           | Slot 3 option  |
| ---------- | ---------------- | -------------- |
| Sandalphon | Apprentice       | Guts           |
| Seofon     | Sette di Spade   | Uplift         |
| Tweyen     | Bow of Dismissal | Quick Cooldown |
| Gallanza   | Contester        | Enmity         |
| Maglielle  | Al Fine          | Steel Nerves   |
| Fraux      | Mephisto's Waltz | Cascade        |
| Fediel     | Hedera           | Steady Focus   |

Pools wider throughout: Defender slot 2 offers 12 vs. base roster's 8 (adds Glaciate, Held Under, ATK↓, DEF↓ Resistance). Stinger offers 10 vs. 8 (adds ATK↓, Sandtomb, Paralysis, SBA Sealed Resistance; drops Skill Sealed).

## Stats

ATK and HP come from four tables, added together:

| Table                   | Adds                             | Keyed by                |
| ----------------------- | -------------------------------- | ----------------------- |
| `weapon_status`         | level 1-150 ladder               | the weapon key          |
| `weapon_status_awake`   | bonus per awakening level 1-10   | `WeaponStatusAwakeId`   |
| `weapon_status_rebuild` | bonus per transcendence step 1-7 | `WeaponStatusRebuildId` |
| `weapon_status_plus`    | bonus per plus level 1-99        | `WeaponStatusPlusId`    |

All four carry `StunPower`/`CritRate` columns - **zero on every weapon of every series** (only nonzero: `-9` stun on six non-series weapons).

Game abbreviates a transcendence step as **T. Lvl**, names the six series in item text - _"Used to transcend Defender weapons"_.

### The level ladder

`weapon_status`: 2602 rows, stores only eleven levels - **1, 10, 20, 30, 40, 50, 65, 75, 100, 125, 150**. Seven are the uncap caps (`weapon_limit`: 10/30/50/75/100/125/150), four are shape. Levels between aren't stored. ATK divides evenly per span for all 162 series weapons; HP doesn't (per-character offset accrues over upper spans).

**ATK is a series constant at every level**, not just 150 - all 162 weapons match their series ladder exactly:

| Series      |    1 |   10 |   20 |   30 |   40 |   50 |   65 |   75 |  100 |  125 |      150 |
| ----------- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | -------: |
| Defender    |    9 |   18 |   28 |   38 |   48 |   68 |   98 |  128 |  503 | 1053 | **2003** |
| Stunner     |   11 |   20 |   30 |   50 |   70 |   90 |  120 |  160 |  660 | 1410 | **2660** |
| Stinger     |   10 |   19 |   29 |   39 |   59 |   79 |  109 |  149 |  599 | 1249 | **2299** |
| Executioner |   11 |   20 |   30 |   50 |   70 |   90 |  135 |  195 |  820 | 1820 | **3320** |
| Ascension   |   15 |   33 |   53 |   73 |   93 |  113 |  143 |  163 |  538 |  813 | **1013** |
| Terminus    | 1540 | 1585 | 1635 | 1685 | 1735 | 1785 | 1860 | 1910 | 2035 | 2160 | **2285** |

**Terminus stands out**: opens 1540, reaches 2285 - gains less over 149 levels than Executioner gains between 125 and 150. Every other series back-loads past level 75.

HP, zero-offset character (Zeta):

| Series      |   1 |  10 |  20 |  30 |  40 |  50 |  65 |   75 |  100 |  125 |      150 |
| ----------- | --: | --: | --: | --: | --: | --: | --: | ---: | ---: | ---: | -------: |
| Defender    |  23 |  95 | 205 | 315 | 445 | 575 | 845 | 1025 | 1525 | 2025 | **2612** |
| Stunner     |  20 |  74 | 154 | 234 | 334 | 434 | 644 |  784 | 1209 | 1634 | **2096** |
| Stinger     |  18 |  72 | 142 | 212 | 302 | 392 | 542 |  642 |  942 | 1242 | **1579** |
| Executioner |  16 |  70 | 140 | 210 | 290 | 370 | 505 |  595 |  845 | 1095 | **1407** |
| Ascension   |  27 |  81 | 161 | 261 | 391 | 521 | 746 |  876 | 1051 | 1126 | **1188** |
| Terminus    |  99 |  99 |  99 |  99 |  99 |  99 |  99 |   99 |   99 |   99 |   **99** |

**HP = `series.hp + character.hpOffset` at level 150** - exact for all 29 characters. Not a constant offset at every level: ladders start identical (level 1 Defender = 23 HP for everyone), fan out toward 150. Terminus flat at 99 for every character, every level.

Post-launch Defender: same ATK/HP ladders as Defender; only slot 1 differs.

### Awakening

Only Ascension and Terminus awaken. `weapon_status_awake`: level 10 worth far more than the nine before it:

| Series    | Levels 1-9 each | Level 10   | Total at awakening 10 |
| --------- | --------------- | ---------- | --------------------- |
| Ascension | +200 ATK/150 HP | +1200/+600 | **+3000 ATK/1950 HP** |
| Terminus  | +200 ATK/0 HP   | +2000/+0   | **+3800 ATK/0 HP**    |

Terminus gains no HP from awakening at all.

Rows are **increments per level**, not running total - see [totals below](#maxed-weapon-totals).

### Transcendence

`weapon_status_rebuild`: seven rows/weapon, T0→T1 through T6→T7. Most of a weapon's power is here:

| Series      |   T1 |   T2 |   T3 |   T4 |   T5 |   T6 |   T7 |     Total |
| ----------- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --------: |
| Defender    | 1000 | 1000 | 1200 | 1500 | 1000 |  800 |  500 |  **7000** |
| Stunner     | 4000 | 3500 | 3000 | 2000 | 2000 | 1500 | 1000 | **17000** |
| Stinger     | 4000 | 3500 | 3000 | 2000 | 2000 | 1500 | 1000 | **17000** |
| Executioner | 4000 | 3500 | 3000 | 2000 | 2000 | 1500 | 1000 | **17000** |
| Ascension   | 4000 | 3500 | 3000 | 2000 | 1000 | 1000 | 1000 | **15500** |
| Terminus    |  800 | 1000 | 1500 | 2000 | 2500 | 3000 | 3500 | **14300** |

HP flat per step: **+100** Defender/Stunner/Stinger/Executioner, **+50** Ascension, **+10** Terminus - +700/+350/+70 over seven steps.

**Rows are increments** - four of six ladders decrease, so can't be running totals; a weapon doesn't lose ATK by transcending further.

**Terminus runs opposite:** every other series front-loads (biggest first, less each step). Terminus back-loads, 800 at T1 climbing to 3500 at T7 - punishes stopping early. Gains the least of the five reaching five figures, still finishes highest (starts 1540 ATK ahead).

Defender: outlier in size, **7000 vs. everyone else's 14300-17000** - roughly half the ATK of any other series, same +700 HP.

### Plus levels

`weapon_status_plus`: one table, one key, **408 of 410 `weapon` rows point at it**. 99 flat steps of **+2 ATK and +10 HP** - plus cap = **+198 ATK and +990 HP**.

No table or English text names this mechanic; no column gates it. Confirmed by arithmetic - totals below are short exactly 198 and 990 without it.

### Maxed weapon totals

Level 150, awakening 10 where applicable, T7, plus 99, zero-offset character:

| Series      |       ATK |       HP |
| ----------- | --------: | -------: |
| Terminus    | **20583** |     1159 |
| Executioner | **20518** |     3097 |
| Stunner     | **19858** |     3786 |
| Ascension   | **19711** | **4478** |
| Stinger     | **19497** |     3269 |
| Defender    |  **9201** |     4302 |

Five of six within 1100 ATK of each other; Defender under half of any of them. Ascension takes the most HP (awakening +1950) despite second-lowest base ladder. Terminus takes the most ATK on the smallest transcendence total, ends with a quarter of anyone else's HP.

Subtract the character's HP offset - Io (-13), confirmed in game:

| Series      |   ATK |   HP |
| ----------- | ----: | ---: |
| Terminus    | 20583 | 1159 |
| Executioner | 20518 | 3084 |
| Stunner     | 19858 | 3773 |
| Ascension   | 19711 | 4465 |
| Stinger     | 19497 | 3256 |
| Defender    |  9201 | 4289 |

Those twelve numbers check every reading above - require awakening and transcendence tables summed as increments, plus table included.

### The character HP offset

The one number depending on who holds the weapon:

| Offset | Characters                                               |
| ------ | -------------------------------------------------------- |
| 0      | Zeta                                                     |
| -1     | Id, Beatrix, Eustace, Gallanza, Maglielle, Fraux, Fediel |
| -4     | Yodarha                                                  |
| -6     | Charlotta                                                |
| -13    | Io, Ferry                                                |
| -18    | Narmaya                                                  |
| -34    | Rosetta, Cagliostro                                      |
| -37    | Gran, Djeeta, Sandalphon, Seofon, Tweyen                 |
| -42    | Siegfried                                                |
| -44    | Eugen                                                    |
| -46    | Ghandagoza                                               |
| -56    | Katalina                                                 |
| -61    | Vane, Percival                                           |
| -69    | Lancelot                                                 |
| -77    | Rackam                                                   |
| -80    | Vaseraga                                                 |

Terminus exempt (flat 99 HP for everyone). Awakening/transcendence bonuses are series constants too - nothing downstream of the level ladder varies by character.

## Art

Awakening changes art in only three cases: Gran's/Djeeta's _Sword of Eos_, Lancelot's _Ethereal Lasher_ (awakened forms use `_01`-suffixed texture). Every other weapon keeps one image through the chain.

**The `_06` tier has no art.** 44 weapon rows reference textures (`cmn_imgequ_wp0006`, `wp0206`, ... one per character) absent from the archive - nothing to extract.

## Reading it back

`tmp/weapon-analysis.mjs` dumps every slot set with pools, ladders, owners:

```
node tmp/weapon-analysis.mjs <extract-dir>
```

Reports **33 distinct slot sets** across 162 transcendable weapons - the six series above, multiplied by per-character signature trait and post-launch pool widths.

## Implementation

Only the **maxed transcendent** weapon of each series - T7, level 150, plus 99 (and awakening 10 for Ascension/Terminus). Every stage above the level ladder is a series constant - the only per-character number in a weapon's stats is the HP offset.
