# Weapon progression

How a GBFR weapon grows: what unlocks at each step, and every trait it can
carry. Everything here is read out of the game archive (version 2.0.2) - the
tables are named so any claim can be re-checked. See
[research/icons.md](../research/icons.md) for how the archive is extracted.

## The two stages

A weapon starts at **base**. From there:

- **Ascension** and **Terminus** weapons must be **awakened first**. Awakening
  runs 0 -> 3 -> 6 -> 10, and at 10 the weapon takes a suffix name:
  _Gambanteinn_ becomes _Gambanteinn, Staff of Hope_; _Caduceus_ becomes
  _Caduceus, Immortal Coil_. Only then can it be transcended.
- **Defender, Stunner, Stinger and Executioner** skip awakening and transcend
  straight away.

**Transcension** is where traits and levels grow, in seven steps T0-T6.

In the archive this is one `weapon` row per awakening step, chained by key -
`WEP_PL0400_06`, `_06_01`, `_06_02`, `_06_03` - with `LastAwakeningLevel`
holding 0/3/6/10. Gran's and Djeeta's chains carry an extra row at awakening 1;
no other character has one. **Only the final row carries
`WeaponSkillLevelRebuildId1..5`**, which is the gate: transcension unlocks when
awakening finishes. Weapons that need no awakening carry those ids on their base
row.

Awakening does **not** change traits. Across all 61 chains every row carries the
same `WeaponSkillId1..4`; awakening only raises the ceiling, renames the weapon
and - once complete - opens transcension.

## What each transcension step unlocks

Levels belong to the **slot**, not the weapon. The standard ladders:

| Slot | T0  | T1  | T2  | T3  | T4  | T5  | T6     |
| ---- | --- | --- | --- | --- | --- | --- | ------ |
| 1    | 25  | 26  | 27  | 28  | 29  | 30  | **35** |
| 2    | 15  | 16  | 17  | 18  | 19  | 20  | **25** |
| 3    | 0   | 2   | 4   | 6   | 8   | 10  | **15** |
| 4    | 0   | 1   | 2   | 3   | 4   | 5   | **10** |
| 5    | 0   | 0   | 0   | 0   | 0   | 0   | **15** |

Read as unlocks:

- **Slots 1 and 2 are live from T0** and climb one level per step, then jump
  five at T6.
- **Slots 3 and 4 are dormant at T0** and open at T1.
- **Slot 5 stays at zero until T6**, where the whole value arrives at once. It
  is the reward for finishing.
- **T6 is a step change everywhere**, not a continuation: every slot gains far
  more at T6 than at any prior step.

Awakened series ladder differently in the lower slots. Ascension and Terminus
start slot 3 at **5** rather than 0, so it is live from T0, and their slot 4 is
flat - Sigil Booster at 1 the whole way, reaching 2 at T6 for Ascension and
staying at 1 for Terminus. Terminus slot 5 tops out at **1**, not 15, because
_Unbound Master_ is counted differently from the other Unbound traits.

The post-launch Defender is the only series with a non-standard slot 1:
`25, 26, 26, 27, 27, 28, 30` - it gains a level every _other_ step and caps five
lower than everything else.

## Trait slots

Each of the five slots is either **fixed** (one trait, always) or a **pool**
(the player picks one). Slots 1, 3 and 5 are usually fixed; slots 2 and 4 are
usually pools.

In the archive a slot is a set of rows in `weapon_skill_level_rebuild`, found by
the weapon's `WeaponSkillLevelRebuildId<n>`. **One row means fixed, several rows
mean a pool** - each row an option, the first being the default. `Unk12` is the
trait, the `Transcension<n>SkillLevel` columns are the ladder. This is the whole
of the "rotatable trait" mechanic, and it is not limited to Terminus.

A weapon's `WeaponSkillId1/2` columns hold the **pre-transcension** traits,
which are the slot 1 and 2 defaults. They are not the transcended set: Terminus
shows `Catastrophe` there but transcends into `Catastrophe Nova`.

## The six series

A series is its five slots, and every character's weapon in a series carries the
same ones. Series are named after the slot-1 trait.

### Defender

22 owners (base roster). Base traits HP + Garrison. **ATK 2003, HP 2612.**

| Slot | Trait            | Pool                                                                                           |
| ---- | ---------------- | ---------------------------------------------------------------------------------------------- |
| 1    | HP               | fixed                                                                                          |
| 2    | Garrison         | Regen, Greater Aegis, Stronghold, Improved Guard, Burn / Poison / Dizzy / Blight Resistance    |
| 3    | DMG Cap Ecru     | fixed                                                                                          |
| 4    | Regen            | Garrison, Greater Aegis, Stronghold, Improved Guard, Burn / Poison / Dizzy / Blight Resistance |
| 5    | Unbound Exertion | fixed                                                                                          |

### Stunner

22 owners. Base traits Stun Power + Linked Together. **ATK 2660, HP 2096.**

| Slot | Trait            | Pool                                                                                                      |
| ---- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| 1    | Stun Power       | fixed                                                                                                     |
| 2    | Linked Together  | Stamina, Aegis, Guard Payback, Sandtomb / Paralysis / SBA Sealed / Held Under Resistance                  |
| 3    | DMG Cap Sage     | fixed                                                                                                     |
| 4    | Potion Hoarder   | Linked Together, Stamina, Aegis, Guard Payback, Sandtomb / Paralysis / SBA Sealed / Held Under Resistance |
| 5    | Unbound Exertion | fixed                                                                                                     |

### Stinger

22 owners. Base traits Critical Hit Rate + Critical Hit DMG. **ATK 2299, HP 1579.**

| Slot | Trait             | Pool                                                                                                                           |
| ---- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Critical Hit Rate | fixed                                                                                                                          |
| 2    | Critical Hit DMG  | Life on the Line, Dodge Payback, Overdrive Assassin, Firm Stance, Slow / Skill Sealed / Darkflame Resistance                   |
| 3    | DMG Cap Cobalt    | fixed                                                                                                                          |
| 4    | Guts              | Critical Hit DMG, Life on the Line, Dodge Payback, Overdrive Assassin, Firm Stance, Slow / Skill Sealed / Darkflame Resistance |
| 5    | Unbound Technique | fixed                                                                                                                          |

### Executioner

22 owners. Base traits Weak Point DMG + Break Assassin. **ATK 3320, HP 1407.**

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

Awakens to 10 first. Base traits ATK + HP. **ATK 1013, HP 1188.**

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

Awakens to 10 first. Base traits Catastrophe + Regen. **ATK 2285, HP 99 for
every character** - the only series whose HP does not vary.

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

`weapon_status` holds ATK/HP per weapon per level, 2602 rows. Two facts collapse
it to almost nothing:

- **ATK is a series constant.** Every Stinger maxes at 2299 and every
  Executioner at 3320, for every character.
- **HP is `series.hp + character.hpOffset`** - exact for all 29 characters, one
  integer each, holding across every series.

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

So neither stat belongs on the weapon.

## Scope

**v1 ships only the maxed transcendent weapon of each series** - T6, and for
Ascension and Terminus that means awakening 10 as well.

## Art

Awakening changes a weapon's art in only three cases across the whole game -
Gran's and Djeeta's _Sword of Eos_, and Lancelot's _Ethereal Lasher_, whose
awakened forms use the `_01`-suffixed texture. Every other weapon keeps one
image through the entire chain.

## Reading it back

`tmp/weapon-analysis.mjs` dumps every slot set with its pools, ladders and
owners:

```
node tmp/weapon-analysis.mjs <extract-dir>
```

It reports **33 distinct slot sets** across 162 transcendable weapons. That is
not 33 series: it is the six above, multiplied by the per-character signature
trait and the post-launch pool widths.
