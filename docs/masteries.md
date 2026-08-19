# Masteries

The per-character progression screen, bought with **MSP**. Archive version 2.0.2. See [archive.md](archive.md).

## Four sections, one system

| Section          | What it is                                    | Tables                                | Pays PWR by |
| ---------------- | --------------------------------------------- | ------------------------------------- | ----------- |
| **Offense**      | graded 0-150%                                 | `ap_tree_atk`                         | MSP spent   |
| **Defense**      | graded 0-150%                                 | `ap_tree_def`                         | MSP spent   |
| **Collection**   | a section per weapon, banked once transcended | `ap_tree_wep`, `ap_tree_rebuild`      | MSP spent   |
| **Over Mastery** | the four random lines a meditation rolls      | `limit_bonus_meditation`, `MED_EFF_*` | roll level  |

Over Mastery is a section of Masteries, not separate - own page: [overmasteries.md](overmasteries.md).

Not Masteries, despite the word "master":

- **Master traits** - three Styles × four Style Ranks, `skillboard_*`. [master-traits.md](master-traits.md).
- **Master level** - 1-55 rank, costs MSP, grants master-trait points and flat stats.

Archive calls it `ap_tree`; Game's word: **Masteries**.

Each `ap_tree_*` row names a `limit_bonus`, which names up to three `limit_bonus_param` rows.

## Two readings

### `LimitBonusParamIndex`

`LimitBonusParamIndex` is a level index. Not an index into `ParamId1/2/3` (runs to 7, only 3 params exist). It indexes the param's **value ladder**: a node grants `Lv{index+1}Value` of _every_ param the `limit_bonus` names.

Ladders are per-node increments, not cumulative totals:

```
LBP_EFF_ATK01   150, 250, 300, 100, 100, 100, 100, 100, 100, 100
LBP_EFF_HP01    500, 300, 200, 200, 200, 200, 200, 200, 200, 200
```

First ATK node = 150, second = 250, third = 300, every one after = 100.

### The `reqT = 7` rows

The `reqT = 7` rows replace, they do not add. `ap_tree_rebuild`: twelve rows per weapon - six at `ReqWepTranscensionLevel` 1-6, six more at 7 that **mirror them one-for-one**. T7 rows = same nodes re-priced, not extra.

Recognisable by format string: a `<d>` (`HP +{0}<d>+{1}<d>`) is the upgraded-value display, old value + new:

| Step | Node      | Param               | Value    |
| ---- | --------- | ------------------- | -------- |
| T2   | Health Up | `Health Up`         | 3000     |
| T7   | Health Up | `HP +{0}<d>+{1}<d>` | **3300** |
| T4   | Health Up | `Health Up`         | 5000     |
| T7   | Health Up | `HP +{0}<d>+{1}<d>` | **5500** |

Summing both double-counts. Correct T7 reading: the six `reqT = 7` rows alone - Io's Defender = 8800 HP, not 17,600.

## Per-section grants

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

Sections are thematic: Defender = HP, Terminus/Ascension = ATK, Stinger = crit, Stunner = stun. **A weapon's Collection section is worth having even unequipped** - stats permanent once transcended.

Offense: only 4682 ATK vs. Defense's 33,300 HP. Weapon supplies ATK; Masteries supply HP.

### The 100%→150% extension

The 100%→150% extension is almost all damage cap. Offense/Defense: 25 nodes each past 100% (`DiffSeparatorMaybe` ≥ 300). Across both trees, fifty nodes grant:

| What                                      |   Amount |
| ----------------------------------------- | -------: |
| Health Up                                 |   10,500 |
| Normal Attack / Skill / SBA Damage Cap Up | 200 each |
| Chain Burst Damage Cap Up                 |      100 |
| Skill Healing Cap Up                      |       20 |
| Stun Power Up                             |      3.0 |

No ATK, no crit at all.

## Masteries cost, in MSP

`ap_tree_*.MspCost`, summed per character - `scripts/extract.mjs` writes this into `character-stats.json` as `msp`.

Cagliostro:

| Section                     | Nodes |     MSP |
| --------------------------- | ----: | ------: |
| Offense, to 100%            |   185 |  19,115 |
| Defense, to 100%            |   133 |  15,204 |
| Collection, base            |    36 |   1,104 |
| Collection, transcendence   |    36 |  12,720 |
| Offense + Defense, 100-150% |    50 | 919,000 |

**The extension costs 26x everything before it.** Nodes priced 12,000-40,000 each vs. 1-700 for every node up to 100% - the dominant PWR term.

Identical for everyone: **exactly 50 nodes, 919,000 MSP, all 29 characters.**

### MSP by character

Collection: 36/36 base roster, 24/24 fewer-weapon characters. Extension omitted below (always 50/919,000).

| Character   | CharaId | Offense 0-100% | Defense 0-100% | Collection | Transcendence |   total |
| ----------- | ------- | -------------: | -------------: | ---------: | ------------: | ------: |
| The Captain | PL0000  |   189 / 19,158 |   161 / 17,355 | 36 / 1,104 |   36 / 12,720 | 969,337 |
| The Captain | PL0100  |   189 / 19,158 |   161 / 17,355 | 36 / 1,104 |   36 / 12,720 | 969,337 |
| Katalina    | PL0200  |   182 / 18,608 |   135 / 15,332 | 36 / 1,104 |   36 / 12,720 | 966,764 |
| Rackam      | PL0300  |   179 / 18,500 |   121 / 13,886 | 36 / 1,104 |   36 / 12,720 | 965,210 |
| Io          | PL0400  |   190 / 19,524 |   128 / 14,354 | 36 / 1,104 |   36 / 12,720 | 966,702 |
| Eugen       | PL0500  |   189 / 19,542 |   129 / 14,317 | 36 / 1,104 |   36 / 12,720 | 966,683 |
| Rosetta     | PL0600  |   181 / 18,715 |   137 / 15,204 | 36 / 1,104 |   36 / 12,720 | 966,743 |
| Ferry       | PL0700  |   185 / 19,198 |   133 / 14,558 | 36 / 1,104 |   36 / 12,720 | 966,580 |
| Lancelot    | PL0800  |   179 / 18,656 |   138 / 15,072 | 36 / 1,104 |   36 / 12,720 | 966,552 |
| Vane        | PL0900  |   177 / 18,335 |   140 / 15,367 | 36 / 1,104 |   36 / 12,720 | 966,526 |
| Percival    | PL1000  |   190 / 19,568 |   129 / 14,352 | 36 / 1,104 |   36 / 12,720 | 966,744 |
| Siegfried   | PL1100  |   180 / 18,516 |   137 / 15,638 | 36 / 1,104 |   36 / 12,720 | 966,978 |
| Charlotta   | PL1200  |   185 / 19,035 |   133 / 15,636 | 36 / 1,104 |   36 / 12,720 | 967,495 |
| Yodarha     | PL1300  |   187 / 19,614 |   133 / 14,608 | 36 / 1,104 |   36 / 12,720 | 967,046 |
| Narmaya     | PL1400  |   189 / 19,450 |   129 / 14,240 | 36 / 1,104 |   36 / 12,720 | 966,514 |
| Ghandagoza  | PL1500  |   184 / 18,981 |   133 / 14,660 | 36 / 1,104 |   36 / 12,720 | 966,465 |
| Zeta        | PL1600  |   192 / 20,009 |   125 / 14,746 | 36 / 1,104 |   36 / 12,720 | 967,579 |
| Vaseraga    | PL1700  |   177 / 18,417 |   140 / 15,271 | 36 / 1,104 |   36 / 12,720 | 966,512 |
| Cagliostro  | PL1800  |   185 / 19,115 |   133 / 15,204 | 36 / 1,104 |   36 / 12,720 | 967,143 |
| Id          | PL1900  |   181 / 18,913 |   137 / 15,597 | 36 / 1,104 |   36 / 12,720 | 967,334 |
| Sandalphon  | PL2100  |   196 / 23,005 |   134 / 15,628 |   24 / 736 |    24 / 8,480 | 966,849 |
| Seofon      | PL2200  |   195 / 23,054 |   135 / 15,525 |   24 / 736 |    24 / 8,480 | 966,795 |
| Tweyen      | PL2300  |   195 / 23,314 |   134 / 15,564 |   24 / 736 |    24 / 8,480 | 967,094 |
| Gallanza    | PL2400  |   191 / 22,122 |   136 / 16,296 |   24 / 736 |    24 / 8,480 | 966,634 |
| Maglielle   | PL2500  |   188 / 21,831 |   142 / 16,983 |   24 / 736 |    24 / 8,480 | 967,030 |
| Beatrix     | PL2600  |   183 / 19,287 |   144 / 18,139 | 36 / 1,104 |   36 / 12,720 | 970,250 |
| Eustace     | PL2700  |   180 / 18,669 |   129 / 14,074 | 36 / 1,104 |   36 / 12,720 | 965,567 |
| Fraux       | PL2800  |   179 / 23,758 |   143 / 17,999 |   24 / 736 |    24 / 8,480 | 969,973 |
| Fediel      | PL2900  |   187 / 23,892 |   144 / 17,408 |   24 / 736 |    24 / 8,480 | 969,516 |

`chara.CharaName`. **PL0000 and PL0100 both "The Captain"** (Gran/Djeeta), byte-identical trees; `characters.json` puts both on PL0000 (that field = `gem.PlayerReq` for sigil gating).

Gran/Djeeta: outlier at **161 Defense nodes** vs. everyone else's 121-144.

### Node implementation

Every node is implemented. Across 13,667 rows of the four trees: **no** blank `LimitBonusId`s, **no** references to a missing `limit_bonus`, **no** node costing 0 MSP. 219 of 908 referenced bonuses carry no stat param but resolve to an `AbilityId` - skill unlocks, exactly 7 per character (15 for Gran/Djeeta).

Extension split reads off `DiffSeparatorMaybe` (311-351 extension, 11-72 below 100%). Splitting by `MspCost >= 1000` instead agrees on all 13,667 rows.

## PWR

PWR pays by MSP spent. Masteries are the biggest term in PWR, by an order of magnitude - attenuated on `chara_power_attenuate` key 7 (`0.2` per MSP up to 90,000, then `0.008`), not by what any node grants. A complete 150%/150% build with every weapon transcended prices at 967,143 MSP → **25,317 PWR**, against under 600 through the stat channels its fifty most expensive nodes actually add.

The derivation - single-node readings, the key 7/11 split, the unexplained 2,989 MSP offset - lives in [research/pwr-formula.md](../research/pwr-formula.md) and [research/pwr-sources.md](../research/pwr-sources.md#masteries-msp).

## Reading it back

Single joins against `tables.sqlite`, with both corrections above (`LimitBonusParamIndex` as a level, `reqT = 7` as a replacement set). `scripts/extract.mjs` builds `character-stats.json`'s `masteries` field this way.

## Implementation

`deriveStatus` assumes **Masteries complete** - 150% Offense, 150% Defense, every weapon transcended. Card is a max-build card; a Build carries no field for partial Masteries. See [stats.md](stats.md#implementation).
