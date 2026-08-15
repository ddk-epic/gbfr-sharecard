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

A second trait arrives one of two ways, and **the two are mutually exclusive** -
no gem row has both:

| How     | Column                            | `+` sigils |
| ------- | --------------------------------- | ---------- |
| fixed   | `SkillId2` on the row             | 234        |
| rolled  | `SkillTypeLotIdForRandom2ndSkill` | 285        |
| neither | both empty                        | 3          |

The rolled half points into `skill_type_lot` (21 rows), which fans out to
weighted `skill_lot` pools - `Key 3` is three pools at 33/33/34, `Key 4` is two
at 50/50. 749 sigils carry `-1` and roll nothing.

The fixed half is the part that is easy to miss: **the game spells out a
specific pairing as its own `gem` row**, so one display name covers many rows.
_Damage Cap V+_ is eight rows - one each for `ATK`, `HP`, `Drain`, `Uplift`,
`Nimble Onslaught`, `Aegis` and `Supplementary DMG` as the second trait. A
sigil's identity is the row, not the name.

So a `+` sigil's second trait is a property of the individual sigil a player
owns, not of the sigil name - either rolled at drop time or baked into the row
the drop picked.

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
[wrightstones.md](wrightstones.md). So the rolled second trait is not free. 72
of the 200 catalog traits can land there, and **no character sigil trait is
among them**.

That last sentence is about the roll pool only. It is not a statement about
second traits in general - once the fixed rows and synthesis are counted, the
second slot reaches 80 open traits, and a character trait can follow its own
partner besides. See
[the second-trait pool](#the-second-trait-pool-is-80-open-plus-one-paired).

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

### The DLC six carry hashed keys

Styles **173-178** - Gallanza, Maglielle, Beatrix, Eustace, Fraux, Fediel - have
all three traits in `skill`, but only `_01` carries a resolved `SKILL_<style>_01`
key. Their `_00` and `_02` rows are keyed by **unresolved hash** instead:

| Style | `_00`                            | `_01`                               | `_02`                           |
| ----- | -------------------------------- | ----------------------------------- | ------------------------------- |
| 174   | `7B5B081D` Bladequeen's Serenade | `SKILL_174_01` Bladequeen's Circuit | `79266456` Bladequeen's Warpath |

So the rows are present and complete - names, glyphs and all - and only the key
strings are missing from the hash list. A query filtering on
`Key LIKE 'SKILL_174_%'` finds one row of three and looks like missing data; the
`IconId1` of `05_pl<charid>` finds all three.

**Never enumerate a style's traits by key arithmetic.** Match on the glyph, or
read the pairs off the `_90` awakening gems.

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

### Nine traits have only single-trait sigils

Carrying a trait and taking a second trait are separate questions. For nine
traits no sigil is ever a `+`, so the second slot never exists:

_Crabby Resonance_ · _Crabmiration_ · _Crabvestment Returns_ ·
_Immortal Shell_ · _In a Pinch_ · _Natural Defenses_ · _Seven Net_ ·
_Stout Heart_ · _Sumo Force_

Six of them are read straight off the table: **every** `gem` row granting them
has an empty `SkillId2` and a `-1` roll lot.

The other three - _Crabby Resonance_, _Immortal Shell_, _In a Pinch_ - need the
table overruled. It holds three two-trait crab gems that ship in no build of the
game: _Crabs Are Forever+_ (`426AD20E`, carrying _Crabmiration_),
_Immortal Shell+_ (`66CB28BA`) and _In a Pinch+_ (`76786869`, both carrying
_Crabvestment Returns_). No column marks them unobtainable - not
`CanGemMix`, not `ItemTierId`, not `CanOnlyHoldOne` - so `extract.mjs` drops the
three keys by hand before any flag reads the table, and throws if a key stops
matching a row. Without that, five traits would claim a second slot the game
never offers.

_Auto Potion_ looks like the same kind of curio but is not in the set:
_Auto Potion+_ genuinely exists and rolls on lot 16.

_Stout Heart_ is the extreme case - a single-trait sigil, never a second trait,
and absent from all 36 `skill_lot` groups. Nothing random in the game hands it
out.

At the other end, _Ain_, _Seven-Star Boundary_ and _Two-Crown Boundary_ have
exactly one sigil each - `GEEN_172_74`, `GEEN_170_74`, `GEEN_171_74` - and it
carries _Regen_ as a fixed second trait. Their second trait is neither free nor
absent; it is always _Regen_.

These are **not** the Lucilius sigils, and their fixed trait is not the
Lucilius one. `IsLuciliusGem = 1` is _Alpha+_, _Beta+_ and _Gamma+_
(`GEEN_160/161/162_04`), and all three carry **_DMG Cap_** (`SKILL_020_00`)
fixed - never _Regen_. The three Boundary/_Ain_ sigils carry
`IsLuciliusGem = 2`, the same value as every character sigil, and their fixed
trait is _Regen_ (`SKILL_066_00`). Two different sets, two different fixed
traits.

The trio's _DMG Cap_ is not a default the player can edit away. One gem carries
each trait, it pins the second slot, it never rolls, and synthesis refuses it -
so no _Alpha_ sigil holding anything else can exist. That is what `fixedSecond`
records: `extract.mjs` reads `IsLuciliusGem = 1`, the editor fills the second
slot the moment the first is picked, and the second-slot pool collapses to the
one entry. `pairsWith` widens a pool by one; `fixedSecond` replaces it.

_Ain_ and the two Boundaries pin _Regen_ by the same mechanic but do not get the
flag - they are character-locked, so `character` and `pairsWith` already keep
them out of every free pool.

## The second-trait pool is 80 open, plus one paired

Counting only the roll pool badly undercounts what a legal `+` sigil can hold.
Take the rarity-5 `+` sigils - the "legendary (+) mark" sigils the synthesis
screen asks for - and the second trait already splits three ways **before**
synthesis enters:

| Source            | Rows | Distinct traits |
| ----------------- | ---- | --------------- |
| fixed `SkillId2`  | 154  | 59              |
| rolled from a lot | 197  | 72              |
| neither           | 3    | -               |

That union alone is 103. The fixed side contributes **31 the roll pool never
reaches** - 28 character traits (every style's `_01`, paired by the awakening
sigils: _Guardian's Awakening+_ is _Conviction_ + _Honor_), plus _Divergence_
from _War Elemental+_ and _Crabmiration_ / _Crabvestment Returns_ from the
crab curios.

Synthesis then decides the open half. Because the output's first trait is drawn
from all four input traits and its second from the remaining three, any **open**
trait an eligible sigil carries can land in the second slot - the draw is random
and repeatable, so every combination of the four eventually comes out. Resolving
the eligible sigils' own traits, their fixed seconds and their roll lots, then
dropping the character-locked ones, gives **80**.

Synthesis both widens and narrows. It adds the six _Celestial_ elements and
_Fatebreaker_, which never roll and are never a fixed second - they arrive only
because their generic `V+` sigils are legal inputs. It withholds the curio
traits, whose sigils it refuses; see
[`CanGemMix`](#cangemmix-marks-what-synthesis-refuses).

The 72 that roll are a strict subset of those 80.

### Character traits do not join that pool

A character trait is never freely offerable behind an arbitrary first trait.
Each style owns **two paired traits and a Warpath**, and the pair is the only
character combination that exists:

- one of the two paired traits may follow the other, **in either order**;
- a **Warpath leads only** - it never follows anything;
- so do _Ain_ and the two Boundaries.

That is 56 paired traits (two per style), 28 Warpaths and 3 loners - the 87
character-locked traits. Only the 56 can ever sit second, and only behind their
own partner.

The pairing is read off the gems carrying **two** character traits at once - the
`_90` awakenings - which is exactly 28, one per style. Deriving it from the
`SKILL_<style>_00/_01` key order instead would miss the six DLC styles, whose
`_00` and `_02` rows carry unresolved key hashes rather than `SKILL_` keys.

Duplicates, on the other hand, are entirely legal: synthesis can land the same
trait in both slots, so nothing rejects a sigil carrying a trait twice.

`noSecondSlot` and `secondTrait` remain separate questions - one is about the
sigil, the other about the trait - but as of 2.0.2 nothing sets both. The only
rows that put a single-trait trait second were the three phantom crab gems, and
those are dropped before the flags are built (see above).

## Sigil synthesis

`TXT_YOROZU_TTL_GN_COMP` is **Sigil Synthesis**, at the Knickknack Shack. The
game's own strings give the input rule exactly:

- _"You must own at least 2 legendary (+) mark sigils."_
- _"Choose 2 sigils to combine."_
- `TXT_YOROZU_LOTTERY_SKILL` - **Trait Pool**
- `TXT_YOROZU_COMP_PREDICTION` - **Prospect {0}**

So the screen takes two rarity-5 `+` sigils, shows a trait pool and a set of
prospects, and returns one sigil. The economy is in the tables: `gem_mix` maps
rarity to an `item_tier_map` material set, `gem_mix_rupi` and `gem_mix_ticket`
give cost by combined level, and `gem_mix_success` gives great/grand success
weights - zero below combined level 44, then rising from 55/45 to 15/85 at 60.

### The outcome rule

No table maps two inputs to an output pair - that selection is in the
executable - but the rule is known from play:

> The two inputs put **four traits** in the pot. The output's **first** trait is
> rolled uniformly from all four (25% each); its **second** is rolled from the
> remaining three (33% each).

Both slots draw from the same four, so nothing stops the same trait landing
twice - **a duplicate pair is legal**. For open traits it also means anything
that can lead a synthesised sigil can follow one, which is what makes
`secondTrait` a property of the eligible sigils rather than of any lot table.

Character traits are the exception the draw alone does not predict: they obey
the pairing rule above, so a Warpath never comes out second however the four
inputs fall.

### `CanGemMix` marks what synthesis refuses

Not every sigil can go in the pot, and `CanGemMix` is how the archive says so -
but **it names the opposite of what it reads as**. The column is set on the
sigils synthesis will **not** accept. Eligibility is `CanGemMix` **clear**.

It is set on 264 of 1034 rows; restricted to the legendary `+` tier it marks
**151 of 354**, and the split is clean:

| `CanGemMix` | Synthesis | What it covers                                                                                                                                                                                                                                                                                                                                                    |
| ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1           | refused   | every character sigil - trait, Warpath, Awakening - plus the curios: _Ain+_, _Alpha+_/_Beta+_/_Gamma+_, the Boundaries, _War Elemental+_, _Untouchable+_, _Roll of the Die+_, _Auto Potion+_, _Flight over Fight+_, _Potent Greens+_, _Immortal Shell+_, _In a Pinch+_, _Spartan Echo+_, _Berserker Echo+_, _Crabs Are Forever+_, _Super Ultimate Perfect Dodge+_ |
| 0           | accepted  | every generic `<Trait> V+` - _Damage Cap V+_, _Tyranny V+_, _Attack Power V+_, all resistances - and _Improved Dodge+_                                                                                                                                                                                                                                            |

The rule reads as a design decision the other way round from what the column
name suggests: synthesis recombines the sigils you **can** farm on demand, and
the ones you cannot are kept out of the randomiser. So _DMG Cap_ reaches the
second slot on the strength of _Damage Cap V+_, and _Alpha_ does not reach it at
all - _Alpha+_ is the only sigil carrying it, and the pot will not take it.

Three things fix the polarity, and it is worth keeping all three, because the
column name argues against them:

- **In game.** _Alpha+_/_Beta+_/_Gamma+_ cannot be selected as synthesis inputs;
  _Improved Dodge+_ can. Those are opposite values of `CanGemMix`, and the
  observed behaviour matches "1 means refused" in both directions.
- **Improved Dodge+ is the tell in the table.** It is the one named, non-generic
  legendary `+` sigil on the `0` side. Under the old reading it was an
  unexplained exception; under this one it is simply a farmable sigil.
- **The flag sits where inputs cannot.** It is set on rarity 1-3 sigils
  (_Crabby Resonance_, _Crabmiration_, _Seven Net_) that could never be inputs
  anyway, since the screen demands legendary `+`. As "may be synthesised" that is
  dead data; as "this sigil is unique" it marks the whole catalog consistently.

Note the direction: `CanGemMix` gates which sigils are **inputs**. It does not
gate what the editor may offer, and the traits it unlocks are mostly not on
eligible sigils themselves.

One ambiguity is left open deliberately. The screen has two different prompts -
`TXT_YOROZU_CHOICE_LEGPLUS_GN` ("Select a **(+) mark** legendary sigil") and
`TXT_YOROZU_CHOICE_LEG_GN` ("Select a legendary sigil") - which might mean the
second input need not be `+`. This project takes **both inputs as `+`**, which
is the only path players use. Under this reading it makes no difference to the
pool either way: all 104 rarity-5 non-`+` rows carry `CanGemMix = 1`, so they
are refused whether or not the screen would offer them.

## Not resolved

`gem_type` is **resolved**: five rows, one per `Category`, holding nine RGBA
colours each - the per-category UI palette, not gameplay data.

Synthesis' 25%/33% draw is known from play, not from the tables. The odds are
not modelled here - only which pairs are reachable - so the exact weights would
matter only if this project ever simulated a synthesis.

## What this project uses

Only **rarity V** - a sharecard shows an endgame build, so `gem_rare` is not
generated and the sigil level range in play is always 11-15.

A `+` sigil's second trait is a property of the owned sigil, so it is stored on
the equipped sigil rather than looked up from a catalog.

Synthesis is not simulated - no costs, no success rates - but it **is** what
sets the second slot's pool, because it is the only route by which a trait that
never rolls can end up there.

### The flags

`scripts/extract.mjs` writes four booleans and two references onto `traits.json`,
plus `character` holding the `PlayerReq` of a character-locked trait. Each
answers a **different** question, so each is built from its own column:

| Flag             | Count | Question it answers                          | Built from                               |
| ---------------- | ----- | -------------------------------------------- | ---------------------------------------- |
| `firstTrait`     | 188   | can it be a sigil's own trait?               | `gem.SkillId1`                           |
| `secondTrait`    | 80    | can it follow **any** first trait?           | synthesis-eligible legendary+, open only |
| `pairsWith`      | 56    | which single trait may it follow?            | gems carrying two character traits       |
| `fixedSecond`    | 3     | which trait is its second slot pinned to?    | `gem.IsLuciliusGem = 1`                  |
| `wrightstoneSub` | 72    | can it be a wrightstone sub?                 | `skill_lot`                              |
| `noSecondSlot`   | 9     | does a sigil built on it lack a second slot? | `SkillId1` with no pair, ever            |

Three traps these names are shaped to avoid:

- `firstTrait` reads **`SkillId1` only**. Reading `SkillId2` as well happens to
  give the same 188 today - no trait is second-only - but it would offer a
  second-only trait as a first trait the moment the game adds one.
- `noSecondSlot` is about **the sigil**, the others about **the trait**. They
  are independent questions, so a trait setting both would not be a
  contradiction - it would mean no sigil of its own takes a second trait, while
  some other sigil carries it second. Nothing sets both today, but do not treat
  that as an invariant.
- `secondTrait` means "follows _anything_", so no character trait carries it.
  A character trait's eligibility is conditional, and `pairsWith` is where that
  condition lives.

`secondTrait` is a strict superset of `wrightstoneSub`; `extract.mjs` throws if
that ever stops holding, and again if the pairings do not cover exactly 28
styles.

### What the editor offers

`src/domain/sigils.ts` turns the flags into the pools:

| Export                             | Pool                                    |
| ---------------------------------- | --------------------------------------- |
| `sigilTraitPool(characterId)`      | first slot: 101 open + that character's |
| `sigilSecondTraitPool(firstTrait)` | second slot: the 80, plus the partner   |
| `canFollow(first, second)`         | the pair rule as a predicate            |
| `fixedSecondTrait(first)`          | the pinned second, or null              |
| `WRIGHTSTONE_SUB_POOL`             | the 72                                  |
| `takesSecondTrait(id)`             | false for the nine                      |

The second pool keys off the **first trait**, not the character: every trait in
it is either open or that first trait's own partner, so it cannot leak another
character's traits. The first pool is still `PlayerReq`-gated, and a build is
bound to its character - `storage.ts` keys on it - so it never changes under a
build.

Changing a first trait re-checks the second and drops it if the pair is no
longer legal, so swapping away from a character trait clears its partner. A
first trait with a `fixedSecond` skips that check and fills its second slot
outright - picking _Alpha_ writes _DMG Cap_ beside it, and the cursor moves on
to the next sigil.

The second slot is **narrower** than the first: 80 open traits against 101.
Exactly **21** traits can lead a sigil and never follow it, for one of two
reasons - either their only legendary `+` sigil is a unique synthesis refuses, or
(for the five crab traits) they have no `+` sigil at all:

_Alpha_ · _Beta_ · _Gamma_ · _Auto Potion_ · _Berserker Echo_ ·
_Crabby Resonance_ · _Crabmiration_ · _Crabvestment Returns_ ·
_Flight over Fight_ · _Immortal Shell_ · _In a Pinch_ · _Natural Defenses_ ·
_Potent Greens_ · _Roll of the Die_ · _Seven Net_ · _Spartan Echo_ ·
_Stout Heart_ · _Sumo Force_ · _Super Ultimate Perfect Dodge_ · _Untouchable_ ·
_War Elemental_

None of them rolls, none is a fixed second, and none sits on a sigil the pot
will take. The six _Celestial_ elements and _Fatebreaker_ are **not** in this
group, though they look like they should be: they never roll either, but their
generic `V+` sigils are legal inputs, so synthesis can put them second.

Picking a single-trait trait moves the cursor straight to the next sigil: the
second cell is not offered, and the cell count drops to match.
