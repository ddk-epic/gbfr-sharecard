# Weapons

How a GBFR weapon grows: what unlocks at each step, every trait it can carry,
and the stats it gains. Everything here is read out of the game archive
(version 2.0.2) - the tables are named so any claim can be re-checked. See
[archive.md](archive.md) for how the archive is extracted.

## The two stages

A weapon starts at **base**. From there:

- **Ascension** and **Terminus** weapons must be **awakened first**. Awakening
  runs 0 -> 3 -> 6 -> 10, and at 10 the weapon takes a suffix name:
  _Gambanteinn_ becomes _Gambanteinn, Staff of Hope_; _Caduceus_ becomes
  _Caduceus, Immortal Coil_. Only then can it be transcended.
- **Defender, Stunner, Stinger and Executioner** skip awakening and transcend
  straight away.

**Transcendence** is where traits and levels grow, in seven steps from an
untranscended T0 up to T7.

In the archive this is one `weapon` row per awakening step, chained by key -
`WEP_PL0400_06`, `_06_01`, `_06_02`, `_06_03` - with `LastAwakeningLevel`
holding 0/3/6/10. Gran's and Djeeta's chains carry an extra row at awakening 1;
no other character has one. **Only the final row carries
`WeaponSkillLevelRebuildId1..5`**, which is the gate: transcendence unlocks when
awakening finishes. Weapons that need no awakening carry those ids on their base
row.

The archive spells it **Transcension** in its own column names. That spelling is
kept here only where a column is quoted.

Awakening does **not** change traits. Across all 61 chains every row carries the
same `WeaponSkillId1..4`; awakening only raises the ceiling, renames the weapon
and - once complete - opens transcendence.

## What each transcendence step unlocks

Levels belong to the **slot**, not the weapon. The standard ladders:

| Slot | T0  | T1  | T2  | T3  | T4  | T5  | T6  | T7     |
| ---- | --- | --- | --- | --- | --- | --- | --- | ------ |
| 1    | 25  | 26  | 27  | 28  | 29  | 30  | 32  | **35** |
| 2    | 15  | 16  | 17  | 18  | 19  | 20  | 22  | **25** |
| 3    | 0   | 2   | 4   | 6   | 8   | 10  | 12  | **15** |
| 4    | 0   | 1   | 2   | 3   | 4   | 5   | 6   | **10** |
| 5    | 0   | 0   | 0   | 0   | 0   | 0   | 0   | **15** |

Read as unlocks:

- **Slots 1 and 2 are live from T0** and climb one level per step, with a
  two-level step at T6 and a three-level one at T7.
- **Slots 3 and 4 are dormant at T0** and open at T1.
- **Slot 5 stays at zero until T7**, where the whole value arrives at once. It
  is the reward for finishing.
- **T7 is a step change everywhere**, not a continuation: every slot gains more
  at T7 than at any prior step.

Awakened series ladder differently in the lower slots. Ascension and Terminus
start slot 3 at **5** rather than 0, so it is live from T0, and their slot 4 is
flat - Sigil Booster at 1 the whole way, reaching 2 at T7 for Ascension and
staying at 1 for Terminus.

Terminus slot 5 tops out at **1**, not 15, because _Unbound Master_ does not
take its level from the weapon. The game describes it as _"Boosts damage cap
based on master level"_, and it is the only trait with a 55-step ladder - the
same 55 as the master level cap. The slot is a switch that turns the trait on;
the board sets how strong it is. See
[master-traits.md](master-traits.md#what-levels-51-55-buy).

The post-launch Defender is the only series with a non-standard slot 1:
`25, 26, 26, 27, 27, 28, 29, 30` - it gains a level every _other_ step and caps
five lower than everything else. Its slot 3 also starts at **5**, like the
awakened series, rather than 0.

### The ladder has eight rungs, not seven

`weapon_skill_level_rebuild` carries eleven numeric columns, of which the
headers name only eight - `Transcension0..5`, then `Unk7`, `Transcension6`,
`Unk9`, `Unk10`, `Transcension7`. **`Unk7` is a rung**, not a spare: it sits
between T5 and T6 in the physical layout and holds the value the ladder needs
there (32 for slot 1, 22 for slot 2). Reading only the named columns silently
drops it and turns an eight-rung ladder into a seven-rung one.

Every row a weapon actually references leaves the last three columns at zero, so
eight rungs is the whole ladder. Two other tables agree on the seven steps that
separate them: `weapon_status_rebuild` holds seven rows per weapon and
`weapon_rebuild_effect_color` holds seven rows outright.

**64 slot-groups use all eleven columns** on contiguous ladders - 25 through 35
in single steps, 15 through 25 - and **not one of them is referenced by any
`weapon` row**. Whether they are an abandoned draft or an unshipped extension is
not decidable from the tables.

## Trait slots

Each of the five slots is either **fixed** (one trait, always) or a **pool**
(the player picks one). Slots 1, 3 and 5 are usually fixed; slots 2 and 4 are
usually pools.

In the archive a slot is a set of rows in `weapon_skill_level_rebuild`, found by
the weapon's `WeaponSkillLevelRebuildId<n>`. **One row means fixed, several rows
mean a pool** - each row an option, the first being the default. `Unk12` is the
trait, the `Transcension<n>SkillLevel` columns are the ladder. This is the whole
of the "rotatable trait" mechanic, and it is not limited to Terminus.

A weapon's `WeaponSkillId1/2` columns hold the **pre-transcendence** traits,
which are the slot 1 and 2 defaults. They are not the transcended set: Terminus
shows `Catastrophe` there but transcends into `Catastrophe Nova`.

## The six series

A series is its five slots, and every character's weapon in a series carries the
same ones. Series are named after the slot-1 trait.

### Defender

22 owners (base roster). Base traits HP + Garrison.
**Level 150: ATK 2003, HP 2612.**

| Slot | Trait            | Pool                                                                                           |
| ---- | ---------------- | ---------------------------------------------------------------------------------------------- |
| 1    | HP               | fixed                                                                                          |
| 2    | Garrison         | Regen, Greater Aegis, Stronghold, Improved Guard, Burn / Poison / Dizzy / Blight Resistance    |
| 3    | DMG Cap Ecru     | fixed                                                                                          |
| 4    | Regen            | Garrison, Greater Aegis, Stronghold, Improved Guard, Burn / Poison / Dizzy / Blight Resistance |
| 5    | Unbound Exertion | fixed                                                                                          |

### Stunner

22 owners. Base traits Stun Power + Linked Together.
**Level 150: ATK 2660, HP 2096.**

| Slot | Trait            | Pool                                                                                                      |
| ---- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| 1    | Stun Power       | fixed                                                                                                     |
| 2    | Linked Together  | Stamina, Aegis, Guard Payback, Sandtomb / Paralysis / SBA Sealed / Held Under Resistance                  |
| 3    | DMG Cap Sage     | fixed                                                                                                     |
| 4    | Potion Hoarder   | Linked Together, Stamina, Aegis, Guard Payback, Sandtomb / Paralysis / SBA Sealed / Held Under Resistance |
| 5    | Unbound Exertion | fixed                                                                                                     |

### Stinger

22 owners. Base traits Critical Hit Rate + Critical Hit DMG.
**Level 150: ATK 2299, HP 1579.**

| Slot | Trait             | Pool                                                                                                                           |
| ---- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Critical Hit Rate | fixed                                                                                                                          |
| 2    | Critical Hit DMG  | Life on the Line, Dodge Payback, Overdrive Assassin, Firm Stance, Slow / Skill Sealed / Darkflame Resistance                   |
| 3    | DMG Cap Cobalt    | fixed                                                                                                                          |
| 4    | Guts              | Critical Hit DMG, Life on the Line, Dodge Payback, Overdrive Assassin, Firm Stance, Slow / Skill Sealed / Darkflame Resistance |
| 5    | Unbound Technique | fixed                                                                                                                          |

### Executioner

22 owners. Base traits Weak Point DMG + Break Assassin.
**Level 150: ATK 3320, HP 1407.**

| Slot | Trait             | Pool                                                                                                     |
| ---- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| 1    | Weak Point DMG    | fixed                                                                                                    |
| 2    | Break Assassin    | Quick Cooldown, Nimble Onslaught, Uplift, Glaciate / ATK↓ / DEF↓ Resistance                              |
| 3    | DMG Cap Cardinal  | fixed                                                                                                    |
| 4    | Autorevive        | Break Assassin, Quick Cooldown, Nimble Onslaught, Uplift, **Cascade**, Glaciate / ATK↓ / DEF↓ Resistance |
| 5    | Unbound Technique | fixed                                                                                                    |

**Slot 4 offers _Cascade_ and slot 2 does not.** Slot 4 normally repeats slot
2's pool and adds only its own default - Stunner adds Potion Hoarder, Stinger
adds Guts. Executioner adds Autorevive _and_ Cascade, making it the only series
where a trait is reachable in one rollable slot but not the other. It holds
across all 22 Executioner weapons, and is **confirmed in game** on four maxed
Executioners: nine slot-4 options, with Autorevive and Cascade on top of the
seven slot 2 offers.

Ascension and Terminus follow neither pattern: their slot 4 is fixed at Sigil
Booster with no pool at all.

### Ascension

Awakens to 10 first. Base traits ATK + HP.
**Level 150: ATK 1013, HP 1188.**

| Slot | Trait          | Pool                                                                                                                                   |
| ---- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | ATK            | fixed                                                                                                                                  |
| 2    | HP             | Critical Hit Rate, Stun Power, Linked Together, Drain, Precise Wrath, Precise Resilience, Supplementary DMG, + one per-character trait |
| 3    | Supernova      | DMG Cap                                                                                                                                |
| 4    | Sigil Booster  | fixed                                                                                                                                  |
| 5    | Unbound Strike | fixed                                                                                                                                  |

For the post-launch characters the defaults swap: slot 2 leads with
_Supplementary DMG_ and offers _HP_ as an option.

### Terminus

Awakens to 10 first. Base traits Catastrophe + Regen. **Level 150: ATK 2285, HP
99 for every character** - the only series whose HP does not vary.

| Slot | Trait                | Pool                                                                                                                        |
| ---- | -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1    | Catastrophe **Nova** | fixed                                                                                                                       |
| 2    | Regen                | Stamina, Enmity, Tyranny, Nimble Defense, Guard Payback, Drain, Glass Cannon, Overdrive Assassin, + one per-character trait |
| 3    | DMG Cap              | fixed                                                                                                                       |
| 4    | Sigil Booster        | fixed                                                                                                                       |
| 5    | Unbound Master       | fixed                                                                                                                       |

## The per-character signature trait

Ascension and Terminus each end their slot-2 pool with **one trait chosen per
character**, and it is the same trait for both series. Eight options are shared;
the ninth is the character's own. This is the only place a weapon's traits
depend on who holds it.

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

Sandalphon, Seofon, Tweyen, Gallanza, Maglielle, Fraux and Fediel have **four
series, not six** - no Stunner, no Executioner. Beatrix and Eustace are _not_ in
this group; they carry the full six like the base roster.

Their Defender is a different weapon: slot 1 leads with **Greater Aegis** rather
than HP, on the reduced ladder noted above, and slot 3 gains a **second option
unique to the character**:

| Character  | Weapon           | Slot 3 option  |
| ---------- | ---------------- | -------------- |
| Sandalphon | Apprentice       | Guts           |
| Seofon     | Sette di Spade   | Uplift         |
| Tweyen     | Bow of Dismissal | Quick Cooldown |
| Gallanza   | Contester        | Enmity         |
| Maglielle  | Al Fine          | Steel Nerves   |
| Fraux      | Mephisto's Waltz | Cascade        |
| Fediel     | Hedera           | Steady Focus   |

Their pools are wider throughout. Defender slot 2 offers 12 options against the
base roster's 8, adding Glaciate, Held Under, ATK↓ and DEF↓ Resistance. Stinger
offers 10 against 8, adding ATK↓, Sandtomb, Paralysis and SBA Sealed Resistance
while dropping Skill Sealed.

## Stats

A weapon's ATK and HP come from four tables that add together:

| Table                   | Adds                               | Keyed by                |
| ----------------------- | ---------------------------------- | ----------------------- |
| `weapon_status`         | the level 1-150 ladder             | the weapon key          |
| `weapon_status_awake`   | a bonus per awakening level 1-10   | `WeaponStatusAwakeId`   |
| `weapon_status_rebuild` | a bonus per transcendence step 1-7 | `WeaponStatusRebuildId` |
| `weapon_status_plus`    | a bonus per plus level 1-99        | `WeaponStatusPlusId`    |

All four carry `StunPower` and `CritRate` columns as well. They are **zero on
every weapon of every series**; the only nonzero values anywhere are a `-9` stun
on six non-series weapons.

The game abbreviates a transcendence step as **T. Lvl** and names the six series
in its own item text - _"Used to transcend Defender weapons"_.

### The level ladder

`weapon_status` is 2602 rows but stores only eleven levels: **1, 10, 20, 30, 40,
50, 65, 75, 100, 125, 150**. Seven of those are the uncap caps, which
`weapon_limit` lists as 10/30/50/75/100/125/150; the other four are shape.
Levels in between are not in the table. ATK divides evenly across every span for
all 162 series weapons, so it steps by a whole number per level; HP does not,
because the per-character offset accrues over the upper spans.

**ATK is a series constant at every level**, not just at 150 - all 162 weapons
match their series ladder exactly:

| Series      |    1 |   10 |   20 |   30 |   40 |   50 |   65 |   75 |  100 |  125 |      150 |
| ----------- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | -------: |
| Defender    |    9 |   18 |   28 |   38 |   48 |   68 |   98 |  128 |  503 | 1053 | **2003** |
| Stunner     |   11 |   20 |   30 |   50 |   70 |   90 |  120 |  160 |  660 | 1410 | **2660** |
| Stinger     |   10 |   19 |   29 |   39 |   59 |   79 |  109 |  149 |  599 | 1249 | **2299** |
| Executioner |   11 |   20 |   30 |   50 |   70 |   90 |  135 |  195 |  820 | 1820 | **3320** |
| Ascension   |   15 |   33 |   53 |   73 |   93 |  113 |  143 |  163 |  538 |  813 | **1013** |
| Terminus    | 1540 | 1585 | 1635 | 1685 | 1735 | 1785 | 1860 | 1910 | 2035 | 2160 | **2285** |

**Terminus is the shape that stands out.** It opens at 1540 and reaches 2285 -
it gains less over 149 levels than an Executioner gains between 125 and 150. A
Terminus is close to its ceiling the moment it is forged; every other series
back-loads almost everything past level 75.

HP, at a zero-offset character (Zeta):

| Series      |   1 |  10 |  20 |  30 |  40 |  50 |  65 |   75 |  100 |  125 |      150 |
| ----------- | --: | --: | --: | --: | --: | --: | --: | ---: | ---: | ---: | -------: |
| Defender    |  23 |  95 | 205 | 315 | 445 | 575 | 845 | 1025 | 1525 | 2025 | **2612** |
| Stunner     |  20 |  74 | 154 | 234 | 334 | 434 | 644 |  784 | 1209 | 1634 | **2096** |
| Stinger     |  18 |  72 | 142 | 212 | 302 | 392 | 542 |  642 |  942 | 1242 | **1579** |
| Executioner |  16 |  70 | 140 | 210 | 290 | 370 | 505 |  595 |  845 | 1095 | **1407** |
| Ascension   |  27 |  81 | 161 | 261 | 391 | 521 | 746 |  876 | 1051 | 1126 | **1188** |
| Terminus    |  99 |  99 |  99 |  99 |  99 |  99 |  99 |   99 |   99 |   99 |   **99** |

**HP is `series.hp + character.hpOffset` at level 150** - exact for all 29
characters, one integer each, holding across every series. It is _not_ a
constant offset at every level: the ladders start identical (a level 1 Defender
is 23 HP for everyone) and fan out toward 150. Terminus is flat at 99 for every
character at every level - the only series whose HP neither grows nor varies.

The post-launch Defender shares Defender's ATK and HP ladders exactly. Only its
slot 1 differs.

### Awakening

Only Ascension and Terminus awaken. `weapon_status_awake` gives a bonus per
awakening level, and level 10 is worth far more than the nine before it:

| Series    | Levels 1-9 each | Level 10   | Total at awakening 10 |
| --------- | --------------- | ---------- | --------------------- |
| Ascension | +200 ATK/150 HP | +1200/+600 | **+3000 ATK/1950 HP** |
| Terminus  | +200 ATK/0 HP   | +2000/+0   | **+3800 ATK/0 HP**    |

Terminus gains no HP from awakening at all - the only stage of the four that
gives it nothing.

These rows are **increments, one per awakening level**, not the running total -
see [the totals below](#what-a-maxed-weapon-reaches), which only reconcile if all
ten levels are summed.

### Transcendence

`weapon_status_rebuild` holds seven rows per weapon, one per step T0->T1 through
T6->T7. This is where most of a weapon's power is:

| Series      |   T1 |   T2 |   T3 |   T4 |   T5 |   T6 |   T7 |     Total |
| ----------- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --------: |
| Defender    | 1000 | 1000 | 1200 | 1500 | 1000 |  800 |  500 |  **7000** |
| Stunner     | 4000 | 3500 | 3000 | 2000 | 2000 | 1500 | 1000 | **17000** |
| Stinger     | 4000 | 3500 | 3000 | 2000 | 2000 | 1500 | 1000 | **17000** |
| Executioner | 4000 | 3500 | 3000 | 2000 | 2000 | 1500 | 1000 | **17000** |
| Ascension   | 4000 | 3500 | 3000 | 2000 | 1000 | 1000 | 1000 | **15500** |
| Terminus    |  800 | 1000 | 1500 | 2000 | 2500 | 3000 | 3500 | **14300** |

HP is flat per step: **+100** for Defender, Stunner, Stinger and Executioner,
**+50** for Ascension, **+10** for Terminus - so +700, +350 and +70 over the
seven steps.

**These rows are increments.** Four of the six ladders _decrease_, so they cannot
be running totals; a weapon does not lose ATK by transcending further. This is
the reading `weapon_status_rebuild` proves outright, and it is the same shape
`weapon_status_awake` uses.

**Transcendence runs the opposite way for Terminus.** Every other series
front-loads it - the first step is the biggest and each one after is worth less.
Terminus back-loads it, 800 at T1 climbing to 3500 at T7, so it is the series
that punishes stopping early. It also gains the least of the five that reach
five figures, and still finishes highest, because it starts 1540 ATK ahead.

Defender is the outlier in size: **7000 against everyone else's 14300-17000**. A
transcended Defender ends at roughly half the ATK of any other series, on the
same +700 HP.

### Plus levels

`weapon_status_plus` is one table with one key, and **408 of the 410 `weapon`
rows point at it**. It is 99 flat steps of **+2 ATK and +10 HP**, so a weapon at
its plus cap carries **+198 ATK and +990 HP** on top of everything else.

Nothing in the tables or the English text names this mechanic, and no column
gates it per weapon or per series. What settles that it belongs in a maxed
weapon's stats is arithmetic: the totals below are short by exactly 198 and 990
without it.

### What a maxed weapon reaches

Level 150, awakening 10 where it applies, T7, plus 99, at a zero-offset
character:

| Series      |       ATK |       HP |
| ----------- | --------: | -------: |
| Terminus    | **20583** |     1159 |
| Executioner | **20518** |     3097 |
| Stunner     | **19858** |     3786 |
| Ascension   | **19711** | **4478** |
| Stinger     | **19497** |     3269 |
| Defender    |  **9201** |     4302 |

Five of the six land within 1100 ATK of each other; Defender ends at under half
of any of them. Ascension takes the most HP despite the second-lowest base
ladder, because awakening hands it +1950 on its own. Terminus takes the most ATK
on the smallest transcendence total, and still ends with a quarter of anyone
else's HP.

Subtract the character's HP offset for a specific character. **All six are
confirmed in game on Io**, whose offset is -13:

| Series      |   ATK |   HP |
| ----------- | ----: | ---: |
| Terminus    | 20583 | 1159 |
| Executioner | 20518 | 3084 |
| Stunner     | 19858 | 3773 |
| Ascension   | 19711 | 4465 |
| Stinger     | 19497 | 3256 |
| Defender    |  9201 | 4289 |

Those twelve numbers are the check on every reading above, and they only come
out if the awakening and transcendence tables are both summed as increments and
the plus table is included. Getting any one of the three wrong misses.

### The character HP offset

The one number in the whole system that depends on who holds the weapon:

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

Terminus is exempt: its 99 HP is the same for everyone. Awakening and
transcendence bonuses are series constants too, so nothing downstream of the
level ladder varies by character.

## Art

Awakening changes a weapon's art in only three cases across the whole game -
Gran's and Djeeta's _Sword of Eos_, and Lancelot's _Ethereal Lasher_, whose
awakened forms use the `_01`-suffixed texture. Every other weapon keeps one
image through the entire chain.

**The `_06` tier has no art.** 44 weapon rows reference textures
(`cmn_imgequ_wp0006`, `wp0206`, … - one per character) that are absent from the
archive, not merely unnamed. Nothing can be extracted for them because nothing
is there.

## Reading it back

`tmp/weapon-analysis.mjs` dumps every slot set with its pools, ladders and
owners:

```
node tmp/weapon-analysis.mjs <extract-dir>
```

It reports **33 distinct slot sets** across 162 transcendable weapons. That is
not 33 series: it is the six above, multiplied by the per-character signature
trait and the post-launch pool widths.

## What this project uses

Only the **maxed transcendent** weapon of each series - T7 at level 150 and plus
99, and for Ascension and Terminus that means awakening 10 as well. Since every
stage above the level ladder is a series constant, the only per-character number
in a weapon's stats is the HP offset.

The catalog stores `defaultAtk` and `defaultHp` per weapon. Those are the maxed
totals, not the level-150 base figures listed per series above.
