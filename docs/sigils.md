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

Only three sigils carry `IsLuciliusGem`: _Alpha+_, _Beta+_, _Gamma+_.

## Not resolved

`gem_type` is ten unnamed integer columns and nothing has been matched to it.
`gem_mix*` covers sigil synthesis - grand-success rates, rupie costs.

## What this project uses

Only **rarity V** - a sharecard shows an endgame build, so `gem_rare` is not
generated and the sigil level range in play is always 11-15. Sigil synthesis is
not modelled. Because a `+` sigil's second trait is rolled per owned sigil, it
is stored on the equipped sigil rather than looked up from a catalog.
