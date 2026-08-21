# Sigils

What a sigil is in the archive, and how it relates to a trait. Archive version 2.0.2. See [archive.md](archive.md).

## Sigils and traits

A sigil is not a trait. `gem`: **1034 rows**. `skill`: **261**. A sigil is one way to carry a trait; most traits have several sigils.

Every sigil points at traits by key:

- `SkillId1` - the trait it grants. **193 distinct traits**; one trait carries up to 18 sigils.
- `SkillId2` - second trait, on 235 of 1034.

Neither list derives from the other. Sigil catalog = `gem`; trait catalog = `skill`.

## Tiers

Tiers are rarity. Sigil name ends in a roman numeral (_Attack Power I_ through _V_) = `Rarity` column, 1-5. `gem_rare` turns rarity into level range:

| Rarity | Name | Starting level | Max level |
| ------ | ---- | -------------- | --------- |
| 1      | I    | 1              | 1         |
| 2      | II   | 2              | 3         |
| 3      | III  | 4              | 6         |
| 4      | IV   | 7              | 10        |
| 5      | V    | 11             | 15        |

**Sigil level, not trait level.** Trait cap from `skill_status`, up to 65 - different ladders.

Rarity distribution: 82/80/166/168/538. V tier = half the catalog (where `+` variants live).

## The `+` marker

`+` is the second trait. **522 sigils carry `+` in the name. 234 have `SkillId2`. Exactly one non-`+` sigil does.** `+` = second-trait marker.

Second trait arrives one of two ways, **mutually exclusive** - no gem row has both:

| How     | Column                            | `+` sigils |
| ------- | --------------------------------- | ---------- |
| fixed   | `SkillId2` on the row             | 234        |
| rolled  | `SkillTypeLotIdForRandom2ndSkill` | 285        |
| neither | both empty                        | 3          |

Rolled half → `skill_type_lot` (21 rows) → weighted `skill_lot` pools (`Key 3` = three at 33/33/34, `Key 4` = two at 50/50). 749 sigils carry `-1`, roll nothing.

Fixed half: **the game spells a specific pairing as its own `gem` row** - one display name covers many rows. _Damage Cap V+_ = eight rows, one each for `ATK`/`HP`/`Drain`/`Uplift`/`Nimble Onslaught`/`Aegis`/`Supplementary DMG` as second trait. Identity = row, not name.

A `+` sigil's second trait is a property of the individual owned sigil - rolled at drop or baked into the row.

### The roll pool

`skill_lot`: 439 rows, **36 groups**, one repeated shape - basic (3-4), offense (21), defense (21-22), sustain (8), special (8). Seven near-identical generations, plus one group of 9 (_Stronghold_, _Power Hungry_, _Path to Mastery_, _Supplementary DMG_, _Less Is More_, _Head Start_, ...) only the widest lot draws.

285 rolling sigils use **ten** of 21 `skill_type_lot` rows:

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

Lots 2-4 / 5-7 = the same three shapes, two generations. Lot 16 widest - only one reaching the 9-group, what curio `+` sigils roll on (_War Elemental+_, _Untouchable+_, _Potent Greens+_, _Roll of the Die+_, _Flight over Fight+_, _Auto Potion+_).

**Union of all 36 groups = 72 traits, lot 16 = all 72.** One random-trait pool in the archive; rolled wrightstones draw the same pool - see [wrightstones.md](wrightstones.md). 72 of 200 catalog traits can land there, **no character sigil trait among them** (roll pool only - see [the second-trait pool](#the-second-trait-pool)).

Which of the 72 a sigil rolled: not in the archive, per owned sigil - stored on the build.

## Categories

Categories are the colour groups. `Category` 1-5, with rarity, picks frame art - `cmn_icequ_{Category:02}_{Rarity-1:02}`.

| Category | Count | Contains                                                                      |
| -------- | ----- | ----------------------------------------------------------------------------- |
| 1        | 47    | flat stats - Attack Power, Health, Critical Hit Rate, Stun Power              |
| 2        | 436   | offensive traits - Enmity, Stamina, Tyranny, Supplementary Damage, Damage Cap |
| 3        | 178   | defensive traits and resistances - Garrison, Aegis, Improved Guard            |
| 4        | 80    | sustain - Improved Healing, Regen, Uplift, Cascade                            |
| 5        | 293   | everything special - Guts, Autorevive, character sigils, awakenings           |

15 traits carry `IsResistance` on the `skill` side.

## Character sigils

Every character sigil individually named - no generic _Warpath_, _Boundary_ or "character sigil" in the archive (third-party umbrella entries).

Each character owns three traits keyed `SKILL_<n>_00/_01/_02`. **`_02` = Warpath slot, all 28 characters** - 26 name it "…'s Warpath", two name it _Fearless Heart_ (The Captain) and _Versalis Heart_ (Id). Structural slot, wording varies.

Sigils: `GEEN_<n>_64`, Category 5, Rarity 5. The icon `cmn_icskill_05_pl<charid>` resolves the number to its character.

| #   | Character   | Traits                                                        |
| --- | ----------- | ------------------------------------------------------------- |
| 114 | The Captain | Fearless Drive · Spirit · Heart                               |
| 115 | Katalina    | Guardian's Conviction · Honor · Warpath                       |
| 116 | Rackam      | Helmsman's Navigation · Tenacity · Warpath                    |
| 117 | Io          | Mage's Aspiration · Savvy · Warpath                           |
| 118 | Eugen       | Veteran's Insight · Vision · Warpath                          |
| 119 | Rosetta     | Rose's Blooming · Profusion · Warpath                         |
| 120 | Ferry       | Phantasm's Concord · Harmony · Warpath                        |
| 121 | Lancelot    | White Dragon's Oath · Glory · Warpath                         |
| 122 | Vane        | Hero's Creed · Will · Warpath                                 |
| 123 | Percival    | Lord's Procession · Ambition · Warpath                        |
| 124 | Siegfried   | Dragonslayer's Dominance · Ingenuity · Warpath                |
| 125 | Charlotta   | Holy Knight's Luster · Grandeur · Warpath                     |
| 126 | Yodarha     | Swordmaster's Prowess · Art · Warpath                         |
| 127 | Narmaya     | Butterfly's Grace · Valor · Warpath                           |
| 128 | Ghandagoza  | Eternal Rage's Mettle · Ethos · Warpath                       |
| 129 | Cagliostro  | Founder's Strategy · Truth · Warpath                          |
| 130 | Id          | Versalis Foundation · Ignition · Heart                        |
| 131 | Zeta        | Crimson's Clout · Flight · Warpath                            |
| 132 | Vaseraga    | Ebony's Presence · Poise · Warpath                            |
| 170 | Seofon      | Spirit Edge's Rally · Fury · Warpath · Seven-Star Boundary    |
| 171 | Tweyen      | Dark Huntress's Volley · Surge · Warpath · Two-Crown Boundary |
| 172 | Sandalphon  | Supreme Primarch's Awe · Nimbus · Warpath · Ain               |
| 173 | Gallanza    | Gladiator's Frenzy · Top · Warpath                            |
| 174 | Maglielle   | Bladequeen's Serenade · Circuit · Warpath                     |
| 175 | Beatrix     | Ultramarine's Flash · Adversity · Warpath                     |
| 176 | Eustace     | Thunderwolf's Recharge · Acuity · Warpath                     |
| 177 | Fraux       | Enchantress's Blessing · Rhythm · Warpath                     |
| 178 | Fediel      | The Black's Mark · Impulse · Warpath                          |

Keys 170-172 carry a **fourth** trait - Boundary (Seofon, Tweyen) or _Ain_ (Sandalphon).

Key numbers not contiguous or in character order: 129 = Cagliostro (`pl1800`), 130 = Id (`pl1900`), 131-132 = Zeta (`pl1600`)/Vaseraga (`pl1700`). 133-168 in `SKILL_1xx` space = ordinary traits (_Catastrophe_, _Berserker_, _Greater Aegis_, _Alpha_/_Beta_/_Gamma_). Resolve the character through the icon's `pl` id, never key arithmetic.

### The DLC six

The DLC six carry hashed keys. Numbers **173-178** (Gallanza, Maglielle, Beatrix, Eustace, Fraux, Fediel): all three traits in `skill`, but only `_01` has a resolved `SKILL_<n>_01` key. `_00`/`_02` rows keyed by **unresolved hash**:

| #   | `_00`                            | `_01`                               | `_02`                           |
| --- | -------------------------------- | ----------------------------------- | ------------------------------- |
| 174 | `7B5B081D` Bladequeen's Serenade | `SKILL_174_01` Bladequeen's Circuit | `79266456` Bladequeen's Warpath |

Rows present and complete (names, glyphs) - only key strings missing from the hash list. `Key LIKE 'SKILL_174_%'` finds one of three; `IconId1` `05_pl<charid>` finds all three.

**Never enumerate a character's traits by key arithmetic.** Match on the glyph, or read pairs off the `_90` awakening gems.

## Awakening sigils

35 sigils carry `CanOnlyHoldOne` (no duplicates). 28 = `GEEN_<n>_90`, one per character (_Mage's Awakening+_, _Guardian's Awakening+_). Rest are curio one-offs (_Crabby Resonance_, _Crabvestment Returns_, _Sumo Force_).

`IsLuciliusGem`: three-value column - **1 on exactly three sigils** (_Alpha+_, _Beta+_, _Gamma+_), **2 on 199** (every character sigil and `_90` awakening). Boolean reading pulls in all 202.

## Sigil traits

**188 of 200 catalog traits have a `gem` row.** Twelve don't - weapon traits.

`SkillId1` holds 193 distinct keys vs. 188 - five carry a glyph but no English name, never become catalog traits.

### Twelve weapon-only traits

No `gem` row anywhere - not first, not second, not in a roll pool:

| Trait                                          | Where it does live                        |
| ---------------------------------------------- | ----------------------------------------- |
| Catastrophe                                    | `weapon.WeaponSkillId1` on 118 weapons    |
| Sigil Booster                                  | `weapon.WeaponSkillId6ForAwakening` on 61 |
| Catastrophe Nova · Supernova                   | `weapon_skill_level_rebuild` only         |
| DMG Cap Cardinal · Cobalt · Ecru · Sage        | `weapon_skill_level_rebuild` only         |
| Unbound Exertion · Master · Strike · Technique | `weapon_skill_level_rebuild` only         |

`weapon_skill_level_rebuild` = transcendence ladder, 3016 rows, via `weapon.WeaponSkillLevelRebuildId1-5`, trait key in `Unk12`, eight `TranscensionNSkillLevel` columns. **73 distinct traits appear there**; these twelve appear there and nowhere in `gem` - weapon traits, never on a sigil.

Ten of twelve aren't on `weapon` either - arrive only via transcension. Only _Catastrophe_ and _Sigil Booster_ sit on the weapon row.

### Single-trait sigils

Nine traits: no sigil is ever a `+`, second slot never exists:

_Crabby Resonance_ · _Crabmiration_ · _Crabvestment Returns_ · _Immortal Shell_ · _In a Pinch_ · _Natural Defenses_ · _Seven Net_ · _Stout Heart_ · _Sumo Force_

Six read straight off the table: every `gem` row granting them has empty `SkillId2` and `-1` roll lot.

Other three (_Crabby Resonance_, _Immortal Shell_, _In a Pinch_) need the table overruled: three two-trait crab gems ship in no build - _Crabs Are Forever+_ (`426AD20E`, carries _Crabmiration_), _Immortal Shell+_ (`66CB28BA`), _In a Pinch+_ (`76786869`, carries _Crabvestment Returns_). No column marks them unobtainable - `extract.mjs` drops the three keys by hand, throws if a key stops matching.

_Auto Potion_ isn't in this set - _Auto Potion+_ genuinely exists, rolls on lot 16.

_Stout Heart_: single-trait sigil, never second, absent from all 36 `skill_lot` groups.

_Ain_, _Seven-Star Boundary_, _Two-Crown Boundary_: one sigil each (`GEEN_172_74`, `GEEN_170_74`, `GEEN_171_74`), carrying _Regen_ as a fixed second trait.

`IsLuciliusGem = 1`: _Alpha+_, _Beta+_, _Gamma+_ (`GEEN_160/161/162_04`), fixed second **_DMG Cap_** (`SKILL_020_00`), never _Regen_. `IsLuciliusGem = 2`: the Boundary/_Ain_ set, fixed second _Regen_ (`SKILL_066_00`). Two sets, two fixed traits - not the same "Lucilius" grouping.

A second slot is settled (not offered) when three conditions hold together:

- every sigil carrying the trait first agrees on **one** second trait;
- **none of them rolls** - `SkillTypeLotIdForRandom2ndSkill` is `-1` throughout;
- **synthesis refuses them all**, so no other sigil can carry the trait.

Drop any one and the slot reopens (a `Warpath+` rolls on lot 15; an awakening shares its trait with a rolling `+`; a generic `<Trait> V+` goes in the pot). Six traits satisfy all three: _Alpha_, _Beta_, _Gamma_ on _DMG Cap_; _Ain_, _Seven-Star Boundary_, _Two-Crown Boundary_ on _Regen_. `IsLuciliusGem` alone would name the first three, miss the other three.

Editor fills the second slot the moment the first is picked, pool collapses to one entry - _Ain_ is in `boundary` and listed under its character (Sandalphon offered it, nobody else), _Regen_ lands automatically. Pinning a second says nothing about the trait following anything - all six still lead only.

## The second-trait pool

The second-trait pool is 80 open, plus one paired. Rarity-5 `+` sigils ("legendary (+) mark", what the synthesis screen asks for): second trait splits three ways before synthesis:

| Source            | Rows | Distinct traits |
| ----------------- | ---- | --------------- |
| fixed `SkillId2`  | 154  | 59              |
| rolled from a lot | 197  | 72              |
| neither           | 3    | -               |

Union = 103. Fixed side contributes **31 the roll pool never reaches**: 28 character traits (every character's `_01`, paired by the awakening sigils: _Guardian's Awakening+_ = _Conviction_ + _Honor_), plus _Divergence_ from _War Elemental+_, _Crabmiration_/_Crabvestment Returns_ from crab curios.

Synthesis output's first trait is drawn from all four input traits, second from the remaining three - any **open** trait an eligible sigil carries can land second (draw is random and repeatable, every combination eventually comes out). Resolving eligible sigils' own traits, fixed seconds, roll lots, dropping character-locked ones: **80**.

Synthesis both widens and narrows: adds six _Celestial_ elements + _Fatebreaker_ (never roll, never fixed second, arrive because generic `V+` sigils are legal inputs); withholds curio traits whose sigils it refuses - see [`CanGemMix`](#cangemmix).

The 72 that roll are a strict subset of the 80.

### Character traits

Character traits do not join that pool. A character trait is never freely offerable behind an arbitrary first trait. Each character owns **two paired traits and a Warpath** - the only combination that exists:

- one of two paired traits may follow the other, **in either order**;
- a **Warpath leads only** - never follows;
- so do _Ain_ and the two Boundaries.

56 paired traits (two per character), 28 Warpaths, 3 loners = 87 character-locked traits. Only the 56 can sit second, and only behind their own partner.

Pairing read off gems carrying **two** character traits at once (`_90` awakenings, exactly 28, one per character). Deriving from `SKILL_<n>_00/_01` key order instead misses the six DLC characters (unresolved key hashes on `_00`/`_02`).

Duplicates legal: synthesis can land the same trait in both slots.

Having no second slot and being able to follow are separate questions - as of 2.0.2 no trait does both, which is what lets `singleTraitOnly` be its own lot. The only rows putting a single-trait trait second were the three phantom crab gems, dropped before lots are built.

## Sigil synthesis

`TXT_YOROZU_TTL_GN_COMP` = **Sigil Synthesis**, Knickknack Shack. Game's strings:

- _"You must own at least 2 legendary (+) mark sigils."_
- _"Choose 2 sigils to combine."_
- `TXT_YOROZU_LOTTERY_SKILL` - **Trait Pool**
- `TXT_YOROZU_COMP_PREDICTION` - **Prospect {0}**

Screen takes two rarity-5 `+` sigils, shows a trait pool and prospects, returns one sigil. `gem_mix` maps rarity to an `item_tier_map` material set; `gem_mix_rupi`/`gem_mix_ticket` give cost by combined level; `gem_mix_success` gives great/grand success weights - zero below combined level 44, rising 55/45 to 15/85 at 60.

### The outcome rule

No table maps two inputs to an output pair (in the executable), but known from play:

> The two inputs put **four traits** in the pot. Output's **first** trait rolled uniformly from all four (25% each); **second** from the remaining three (33% each).

Both slots draw from the same four - **a duplicate pair is legal**. Anything that can lead a synthesised sigil can follow one, so the open pool is read off eligible sigils rather than the archive's lot tables.

Character traits are the exception: they obey the pairing rule - a Warpath never comes out second.

### `CanGemMix`

`CanGemMix` marks what synthesis refuses. It **names the opposite of what it reads as**: set on the sigils synthesis will **not** accept. Eligibility = `CanGemMix` **clear**.

Set on 264 of 1034 rows; restricted to legendary `+`: **151 of 354**, clean split:

| `CanGemMix` | Synthesis | What it covers                                                                                                                                                                                                                                                                                                                                              |
| ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1           | refused   | every character sigil (trait, Warpath, Awakening) plus curios: _Ain+_, _Alpha+_/_Beta+_/_Gamma+_, the Boundaries, _War Elemental+_, _Untouchable+_, _Roll of the Die+_, _Auto Potion+_, _Flight over Fight+_, _Potent Greens+_, _Immortal Shell+_, _In a Pinch+_, _Spartan Echo+_, _Berserker Echo+_, _Crabs Are Forever+_, _Super Ultimate Perfect Dodge+_ |
| 0           | accepted  | every generic `<Trait> V+` - _Damage Cap V+_, _Tyranny V+_, _Attack Power V+_, all resistances, _Improved Dodge+_                                                                                                                                                                                                                                           |

Synthesis recombines the sigils you **can** farm on demand; the ones you can't are kept out of the randomiser. _DMG Cap_ reaches the second slot via _Damage Cap V+_; _Alpha_ doesn't (its only sigil, refused).

Three things fix the polarity, against what the column name suggests:

- **In game.** _Alpha+_/_Beta+_/_Gamma+_ can't be selected as synthesis inputs; _Improved Dodge+_ can.
- **Improved Dodge+ is the tell.** The one named, non-generic legendary `+` sigil on the `0` side - a farmable sigil, not an exception.
- **The flag sits where inputs can't reach.** Set on rarity 1-3 sigils (_Crabby Resonance_, _Crabmiration_, _Seven Net_) that could never be inputs anyway (screen demands legendary `+`) - dead data as "may be synthesised", consistent as "this sigil is unique."

`CanGemMix` gates **inputs** only, not what the editor offers - traits it unlocks are mostly not on eligible sigils themselves.

One ambiguity left open: the screen's two prompts, `TXT_YOROZU_CHOICE_LEGPLUS_GN` ("Select a **(+) mark** legendary sigil") and `TXT_YOROZU_CHOICE_LEG_GN` ("Select a legendary sigil"), might mean the second input need not be `+`. This project takes **both inputs as `+`** (the only path players use) - makes no difference either way: all 104 rarity-5 non-`+` rows carry `CanGemMix = 1`, refused regardless.

## Not resolved

`gem_type` **is resolved**: five rows, one per `Category`, nine RGBA colours each - UI palette, not gameplay.

Synthesis' 25%/33% draw is known from play, not tables - not modelled here (only which pairs are reachable).

## Implementation

Only **rarity V** - sigil level range in play is always 11-15; `gem_rare` not generated.

A `+` sigil's second trait is a property of the owned sigil - stored on the equipped sigil, not looked up.

Synthesis not simulated (no costs, no success rates) but **is** what sets the second slot's pool - the only route by which a never-rolling trait ends up there.

### The lots

`traits.json` is display data only. What a trait may do is its **lot**, in `sigil-lots.json`, each trait in exactly one:

| Lot               | Count | What a sigil built on it does                 |
| ----------------- | ----- | --------------------------------------------- |
| `standard`        | 72    | takes any open second; rolls on a wrightstone |
| `synthesisOnly`   | 8     | takes any open second; never rolls            |
| `firstTraitOnly`  | 93    | takes any open second; never follows anything |
| `singleTraitOnly` | 9     | no second slot                                |
| `lucilius`        | 3     | second slot pinned to _DMG Cap_               |
| `boundary`        | 3     | second slot pinned to _Regen_                 |
| `weaponOnly`      | 12    | never on a sigil at all                       |

A lot's `eligibleSecondTraits` names the **lots** its second slot accepts - "open" = `standard` + `synthesisOnly` = 80, resolved at load. Pinned lots name a **trait** instead. Lot id and trait id never collide - `extract.mjs` throws if one shadows the other.

Per-trait (not per-lot) facts beside the lots:

- `pairs` - 28 tuples, the two traits of a character that may follow each other, read off the `_90` gems.
- `characters` - a character's own traits, keyed by `Character.playerId`.

Three traps this shape avoids:

- `firstSlot` reads **`SkillId1` only**. Reading `SkillId2` too happens to give the same 188 today (no trait is second-only) - but would offer a second-only trait as a first trait the moment one exists.
- Leading and following are **independent**. `firstTraitOnly` and `standard` behave identically in a first slot, identical second pool - they differ only in whether the trait may follow, downstream of synthesis refusing it.
- "Open" means "follows _anything_" - no character trait is in `standard` or `synthesisOnly`. A character trait's eligibility is conditional, lives in `pairs`.

`standard` = exactly the wrightstone roll pool; open pool is a strict superset. `extract.mjs` throws if that stops holding, if lots stop covering all 200 traits, or pairings don't cover exactly 28 characters.

### Editor trait pools

`src/domain/sigils.ts`:

| Export                             | Pool                                     |
| ---------------------------------- | ---------------------------------------- |
| `sigilTraitPool(characterId)`      | first slot: 101 open + that character's  |
| `sigilSecondTraitPool(firstTrait)` | second slot: the 80, plus the partner    |
| `canFollow(first, second)`         | the pair rule as a predicate             |
| `fixedSecondTrait(first)`          | the pinned second, or null               |
| `WRIGHTSTONE_SUB_POOL`             | the 72                                   |
| `takesSecondTrait(id)`             | false for the nine and the weapon traits |

Second pool keys off the **first trait**, not the character - can't leak another character's traits. First pool still `PlayerReq`-gated; a build is bound to its character (`storage.ts` keys on it).

Changing a first trait re-checks the second, drops it if the pair is no longer legal. A first trait in a pinned lot skips that check and fills its second slot outright - picking _Alpha_ writes _DMG Cap_, picking _Ain_ writes _Regen_.

Second slot **narrower** than first: 80 open vs. 101. **21** traits lead a sigil but never follow it (only legendary `+` is a unique synthesis refuses, or - five crab traits - has no `+` sigil at all):

_Alpha_ · _Beta_ · _Gamma_ · _Auto Potion_ · _Berserker Echo_ · _Crabby Resonance_ · _Crabmiration_ · _Crabvestment Returns_ · _Flight over Fight_ · _Immortal Shell_ · _In a Pinch_ · _Natural Defenses_ · _Potent Greens_ · _Roll of the Die_ · _Seven Net_ · _Spartan Echo_ · _Stout Heart_ · _Sumo Force_ · _Super Ultimate Perfect Dodge_ · _Untouchable_ · _War Elemental_

The six _Celestial_ elements and _Fatebreaker_ are **not** in this group - never roll either, but their generic `V+` sigils are legal synthesis inputs.

Picking a single-trait trait moves the cursor straight to the next sigil - second cell not offered, cell count drops to match.
