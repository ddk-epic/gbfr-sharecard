# Sigils

What a sigil is in the game archive, and how it relates to a trait. Everything
here is read out of the archive (version 2.0.2); the tables are named so any
claim can be re-checked. See [archive.md](archive.md) for how it is extracted.

## A sigil is not a trait

`gem` holds **1034 rows**. `skill` holds **261**. A sigil is one way to carry a
trait, and most traits have several sigils.

Every sigil points at its traits by key:

- `SkillId1` - the trait it grants. **193 distinct traits** appear here, and one
  trait carries as many as 18 sigils.
- `SkillId2` - a second trait, on 235 of the 1034.

Neither list derives from the other. The sigil catalog is `gem`; the trait
catalog is `skill`.

## Tiers are rarity

A sigil name ends in a roman numeral - _Attack Power I_ through _Attack Power V_ -
and that numeral is the `Rarity` column, 1 to 5. The five rows of `gem_rare`
turn rarity into the sigil's level range:

| Rarity | Name | Starting level | Max level |
| ------ | ---- | -------------- | --------- |
| 1      | I    | 1              | 1         |
| 2      | II   | 2              | 3         |
| 3      | III  | 4              | 6         |
| 4      | IV   | 7              | 10        |
| 5      | V    | 11             | 15        |

**This is the sigil's level, not the trait's.** A trait's own cap comes from
`skill_status` and runs as high as 65. They are different ladders.

Rarity distribution: 82 / 80 / 166 / 168 / 538. The V tier is half the catalog
because it is where the `+` variants live.

## `+` is the second trait

**522 sigils carry a `+` in their name. 234 of them have a `SkillId2`. Exactly
one non-`+` sigil does.** The `+` suffix is the second-trait marker.

The second trait is **rolled, not fixed**. `SkillTypeLotIdForRandom2ndSkill`
points into `skill_type_lot` (21 rows), which fans out to weighted `skill_lot`
pools - `Key 3` is three pools at 33/33/34, `Key 4` is two at 50/50. 749 sigils
carry `-1` and roll nothing.

So a `+` sigil's second trait is a property of the individual sigil a player
owns, not of the sigil type.

### The roll pool

`skill_lot` is 439 rows in **36 groups**, and the groups repeat one shape - a
basic group of 3-4, an offense group of 21, a defense group of 21-22, a sustain
group of 8 and a special group of 8. Seven near-identical generations of that
five-group set, plus one group of 9 (_Stronghold_, _Power Hungry_, _Path to
Mastery_, _Supplementary DMG_, _Less Is More_, _Head Start_, ...) that only the
widest lot draws from.

The 285 sigils that roll use **ten** of the 21 `skill_type_lot` rows:

| Lot | Sigils | Groups                                    | Traits |
| --- | ------ | ----------------------------------------- | ------ |
| 2   | 8      | offense · defense · sustain · special @25 | 58     |
| 3   | 70     | defense @33 · sustain @33 · special @34   | 37     |
| 4   | 11     | sustain @50 · special @50                 | 16     |
| 5   | 4      | offense · defense · sustain · special @25 | 59     |
| 6   | 38     | defense @33 · sustain @33 · special @34   | 38     |
| 7   | 25     | sustain @50 · special @50                 | 16     |
| 15  | 101    | five groups @20                           | 63     |
| 16  | 9      | six groups @20                            | 72     |
| 26  | 9      | four groups @25                           | 55     |
| 27  | 10     | four groups @25                           | 55     |

Lots 2-4 and 5-7 are the same three shapes over two generations of the groups.
Lot 16 is the widest - it is the only one that reaches the 9-group - and it is
what the curio `+` sigils roll on (_War Elemental+_, _Untouchable+_, _Potent
Greens+_, _Roll of the Die+_, _Flight over Fight+_, _Auto Potion+_).

**The union of all 36 groups is 72 traits, and lot 16 is all 72.** Every other
lot is a slice of the same pool: there is one random-trait pool in the archive,
not one per lot, and the rolled wrightstones draw on it as well - see
[wrightstones.md](wrightstones.md). So the second trait is not free. 72 of the
200 catalog traits can land there, and **no character sigil trait is among
them**.

Which of the 72 a given sigil rolled is not in the archive - it is per owned
sigil - so this project stores it on the build rather than looking it up.

## Categories are the colour groups

`Category` runs 1 to 5 and, with rarity, picks the frame art -
`cmn_icequ_{Category:02}_{Rarity-1:02}`.

| Category | Count | Contains                                                                      |
| -------- | ----- | ----------------------------------------------------------------------------- |
| 1        | 47    | the flat stats - Attack Power, Health, Critical Hit Rate, Stun Power          |
| 2        | 436   | offensive traits - Enmity, Stamina, Tyranny, Supplementary Damage, Damage Cap |
| 3        | 178   | defensive traits and resistances - Garrison, Aegis, Improved Guard            |
| 4        | 80    | sustain - Improved Healing, Regen, Uplift, Cascade                            |
| 5        | 293   | everything special - Guts, Autorevive, character sigils, awakenings           |

15 traits carry `IsResistance` on the `skill` side, which identifies a
resistance without matching on the name.

## Character sigils

The game names every character sigil individually. There is no generic
_Warpath_, _Boundary_ or "character sigil" in the archive - those are
third-party umbrella entries.

Each character has a **style**, and the style owns three traits keyed
`SKILL_<style>_00/_01/_02`. **`_02` is the Warpath slot for all 28 styles** -
26 name it "…'s Warpath", and two name the same slot _Fearless Heart_ (The
Captain) and _Versalis Heart_ (Id). The slot is structural; only the wording
varies.

Their sigils are `GEEN_<style>_64`, all Category 5, Rarity 5. The style's icon
is `cmn_icskill_05_pl<charid>`, which is how a style resolves to a character.

| Style | Character   | Traits                                                        |
| ----- | ----------- | ------------------------------------------------------------- |
| 114   | The Captain | Fearless Drive · Spirit · Heart                               |
| 115   | Katalina    | Guardian's Conviction · Honor · Warpath                       |
| 116   | Rackam      | Helmsman's Navigation · Tenacity · Warpath                    |
| 117   | Io          | Mage's Aspiration · Savvy · Warpath                           |
| 118   | Eugen       | Veteran's Insight · Vision · Warpath                          |
| 119   | Rosetta     | Rose's Blooming · Profusion · Warpath                         |
| 120   | Ferry       | Phantasm's Concord · Harmony · Warpath                        |
| 121   | Lancelot    | White Dragon's Oath · Glory · Warpath                         |
| 122   | Vane        | Hero's Creed · Will · Warpath                                 |
| 123   | Percival    | Lord's Procession · Ambition · Warpath                        |
| 124   | Siegfried   | Dragonslayer's Dominance · Ingenuity · Warpath                |
| 125   | Charlotta   | Holy Knight's Luster · Grandeur · Warpath                     |
| 126   | Yodarha     | Swordmaster's Prowess · Art · Warpath                         |
| 127   | Narmaya     | Butterfly's Grace · Valor · Warpath                           |
| 128   | Ghandagoza  | Eternal Rage's Mettle · Ethos · Warpath                       |
| 129   | Cagliostro  | Founder's Strategy · Truth · Warpath                          |
| 130   | Id          | Versalis Foundation · Ignition · Heart                        |
| 131   | Zeta        | Crimson's Clout · Flight · Warpath                            |
| 132   | Vaseraga    | Ebony's Presence · Poise · Warpath                            |
| 170   | Seofon      | Spirit Edge's Rally · Fury · Warpath · Seven-Star Boundary    |
| 171   | Tweyen      | Dark Huntress's Volley · Surge · Warpath · Two-Crown Boundary |
| 172   | Sandalphon  | Supreme Primarch's Awe · Nimbus · Warpath · Ain               |
| 173   | Gallanza    | Gladiator's Frenzy · Top · Warpath                            |
| 174   | Maglielle   | Bladequeen's Serenade · Circuit · Warpath                     |
| 175   | Beatrix     | Ultramarine's Flash · Adversity · Warpath                     |
| 176   | Eustace     | Thunderwolf's Recharge · Acuity · Warpath                     |
| 177   | Fraux       | Enchantress's Blessing · Rhythm · Warpath                     |
| 178   | Fediel      | The Black's Mark · Impulse · Warpath                          |

Styles 170-172 carry a **fourth** trait - the Boundary (Seofon, Tweyen) or
_Ain_ (Sandalphon) - which no other style has.

Style numbers are neither contiguous nor in character order. 129 is Cagliostro
(`pl1800`) while 130 is Id (`pl1900`), and 131-132 step back to Zeta (`pl1600`)
and Vaseraga (`pl1700`). Between them, 133-168 in the same `SKILL_1xx` space are
ordinary traits - _Catastrophe_, _Berserker_, _Greater Aegis_,
_Alpha_/_Beta_/_Gamma_. A style resolves through the icon's `pl` id, never
through arithmetic on the style number.

### The DLC six are text-only

Styles **173-178** - Gallanza, Maglielle, Beatrix, Eustace, Fraux, Fediel - have
all three trait names in `text/en`, but the `skill` table carries **one row
each** (`_01`), not three. Their `gem` rows number 2 rather than 3.

For these six the names are present and the trait rows are not. Walking `skill`
to enumerate character sigils comes up short here; walking
`TXT_SKILL_<style>_00..02` does not. The text and the table genuinely disagree
at version 2.0.2.

## Awakening sigils

35 sigils carry `CanOnlyHoldOne`, which stops a player holding a duplicate. 28
of them are `GEEN_<style>_90`, one per style - _Mage's Awakening+_, _Guardian's
Awakening+_. The rest are curio one-offs (_Crabby Resonance_, _Crabvestment
Returns_, _Sumo Force_).

`IsLuciliusGem` is not a flag but a three-value column: **1 on exactly three
sigils** - _Alpha+_, _Beta+_, _Gamma+_ - and **2 on 199**, every character
sigil and every `_90` awakening. Reading it as a boolean pulls in all 202.

## Which traits a sigil can carry

**188 of the 200 catalog traits have a `gem` row.** Twelve have none, and those
twelve are weapon traits. Every other trait a sigil grants is a sigil trait,
character traits included.

`SkillId1` holds 193 distinct keys rather than 188 because five of them carry a
glyph but no English name, so they never become catalog traits.

### Twelve are weapon traits, not sigil traits

Twelve traits have **no `gem` row anywhere** - not as a first trait, not as a
second, not in a roll pool:

| Trait                                          | Where it does live                        |
| ---------------------------------------------- | ----------------------------------------- |
| Catastrophe                                    | `weapon.WeaponSkillId1` on 118 weapons    |
| Sigil Booster                                  | `weapon.WeaponSkillId6ForAwakening` on 61 |
| Catastrophe Nova · Supernova                   | `weapon_skill_level_rebuild` only         |
| DMG Cap Cardinal · Cobalt · Ecru · Sage        | `weapon_skill_level_rebuild` only         |
| Unbound Exertion · Master · Strike · Technique | `weapon_skill_level_rebuild` only         |

`weapon_skill_level_rebuild` is the transcendence ladder - 3016 rows, reached
through `weapon.WeaponSkillLevelRebuildId1-5`, with the trait key in the column
the schema calls `Unk12` and eight `TranscensionNSkillLevel` columns beside it.
**73 distinct traits appear there**, and these twelve are exactly the ones that
appear there and nowhere in `gem`. They are weapon traits, so a sigil never
carries them.

Ten of the twelve are not on `weapon` either; they arrive only when a weapon is
transcended. Only _Catastrophe_ and _Sigil Booster_ sit on the weapon row
itself.

### Six traits have only single-trait sigils

Carrying a trait and taking a second trait are separate questions. For six
traits **every** `gem` row that grants them has an empty `SkillId2` and a `-1`
roll lot, so no sigil of theirs is ever a `+`:

_Crabmiration_ · _Crabvestment Returns_ · _Natural Defenses_ · _Seven Net_ ·
_Stout Heart_ · _Sumo Force_

The set is narrower than the names suggest. _Auto Potion_ and _Immortal Shell_
are the same kind of curio and are not in it: _Auto Potion+_ rolls on lot 16,
and _Immortal Shell+_ carries _Crabvestment Returns_ fixed.

_Stout Heart_ is the extreme case - a single-trait sigil, never a second trait,
and absent from all 36 `skill_lot` groups. Nothing random in the game hands it
out.

At the other end, _Ain_, _Seven-Star Boundary_ and _Two-Crown Boundary_ have
exactly one sigil each, the Lucilius `+` (`GEEN_170/171/172_74`), and it carries
_Regen_ as a fixed second trait. Their second trait is neither free nor absent;
it is always _Regen_.

## Not resolved

`gem_type` is ten unnamed integer columns and nothing has been matched to it.
`gem_mix*` covers sigil synthesis - grand-success rates, rupie costs.

## What this project uses

Only **rarity V** - a sharecard shows an endgame build, so `gem_rare` is not
generated and the sigil level range in play is always 11-15. Sigil synthesis is
not modelled.

A `+` sigil's second trait is rolled per owned sigil, so it is stored on the
equipped sigil rather than looked up from a catalog.

The three pools ride on `traits.json` as flags - `sigil`, `roll`, `soloSigil` -
written by `scripts/extract.mjs`, with `character` holding the `PlayerReq` of a
character-locked trait. `src/data/index.ts` turns them into what the editor
offers:

| Export                    | Pool                                                 |
| ------------------------- | ---------------------------------------------------- |
| `sigilTraitPool(id)`      | a sigil's own trait: the 101 open + that character's |
| `SIGIL_SECOND_TRAIT_POOL` | the 72                                               |
| `takesSecondTrait(id)`    | false for the six                                    |

A character sigil belongs to one character, so `SigilsPopover` offers ~104
traits rather than 200 and a build can only hold sigils its character could
equip. A build is bound to its character - `storage.ts` keys on it - so the pool
never changes under a build.

Picking a single-trait trait moves the cursor straight to the next sigil: the
second cell is not offered, and the cell count drops to match.
