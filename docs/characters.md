# Characters

The roster as the archive holds it, from `chara` joined to English text. See [archive.md](archive.md).

`chara` has 41 rows. 29 are playable and carry Masteries trees; the rest are party slots, NPCs and dev entries, listed at the bottom of this page.

## CharaId

Every per-character table keys on `CharaId`, `PL0400` for Io. `characters.json` calls the field `playerId`; `scripts/extract.mjs` joins on it for `character-stats.json`.

`playerId` holds `gem.PlayerReq`, the id that gates a character's signature sigils. It matches `CharaId` for every character except Djeeta, who carries Gran's `PL0000` rather than her own `PL0100`. Both resolve to "The Captain" and their Masteries trees are byte-identical.

## artId

`artId` names the illustration folder under `ui/layouts/common/image_chara/noatlastextures/`, as `cmn_imgchr_<artId>`. Each folder holds seven framings of one illustration. Two ship: `_0`, the full figure, as the card's art, and `_4`, the head-and-torso square, as the select tile's thumbnail.

`artId` is the `CharaId` digits, with five exceptions.

| Character | CharaId  | artId    |
| --------- | -------- | -------- |
| Gran      | `PL0000` | `0001`   |
| Djeeta    | `PL0100` | `0101`   |
| Id        | `PL1900` | `1901`   |
| Gallanza  | `PL2400` | `em2000` |
| Maglielle | `PL2500` | `em2100` |

`cmn_imgchr_2400` and `cmn_imgchr_2500` do not exist. Gallanza's and Maglielle's illustrations sit under the enemy ids they were first drawn for, `em2000` and `em2100`, with all seven framings. `cmn_imgchr_s_*`, the small-illustration set covering the playable roster, lists those two ids in their place. The face busts keyed by `CharaId` are `cmn_imgchr02_2400` for Gallanza and `cmn_imgchr02_2500` for Maglielle.

`cmn_imgchr_em2400` holds Lilith's art and is absent from `cmn_imgchr_s_*`.

## The playable roster

Element: `0` Fire, `1` Water, `2` Earth, `3` Wind, `4` Light, `5` Dark, the order `ElementId` uses in `src/catalog/types.ts`. Gender: `1` male, `2` female.

| CharaId | Name        | Element | UI order | Weapons | In `characters.json` |
| ------- | ----------- | ------- | -------: | ------: | -------------------- |
| PL0000  | The Captain | Wind    |        0 |       6 | `gran`               |
| PL0100  | The Captain | Wind    |        1 |       6 | `djeeta`, as PL0000  |
| PL0200  | Katalina    | Water   |        2 |       6 | yes                  |
| PL0300  | Rackam      | Fire    |        3 |       6 | yes                  |
| PL0400  | Io          | Light   |        4 |       6 | yes                  |
| PL0500  | Eugen       | Earth   |        5 |       6 | yes                  |
| PL0600  | Rosetta     | Dark    |        6 |       6 | yes                  |
| PL1200  | Charlotta   | Light   |        7 |       6 | yes                  |
| PL1500  | Ghandagoza  | Fire    |        8 |       6 | yes                  |
| PL0700  | Ferry       | Light   |        9 |       6 | yes                  |
| PL1400  | Narmaya     | Dark    |       10 |       6 | yes                  |
| PL0800  | Lancelot    | Water   |       11 |       6 | yes                  |
| PL0900  | Vane        | Water   |       12 |       6 | yes                  |
| PL1000  | Percival    | Fire    |       13 |       6 | yes                  |
| PL1100  | Siegfried   | Earth   |       14 |       6 | yes                  |
| PL1800  | Cagliostro  | Earth   |       15 |       6 | yes                  |
| PL1300  | Yodarha     | Wind    |       16 |       6 | yes                  |
| PL1600  | Zeta        | Fire    |       17 |       6 | yes                  |
| PL1700  | Vaseraga    | Dark    |       18 |       6 | yes                  |
| PL2600  | Beatrix     | Water   |       19 |       6 | yes                  |
| PL2700  | Eustace     | Wind    |       20 |       6 | yes                  |
| PL2200  | Seofon      | Wind    |       21 |       4 | yes                  |
| PL2300  | Tweyen      | Light   |       22 |       4 | yes                  |
| PL2100  | Sandalphon  | Light   |       23 |       4 | yes                  |
| PL2800  | Fraux       | Fire    |       24 |       4 | yes                  |
| PL2900  | Fediel      | Dark    |       25 |       4 | yes                  |
| PL1900  | Id          | Dark    |      100 |       6 | yes                  |
| PL2400  | Gallanza    | Earth   |      101 |       4 | yes                  |
| PL2500  | Maglielle   | Light   |      102 |       4 | yes                  |

### UI order

UI order runs 0-25, then 100-102. 0-25 is the in-game roster order. It diverges from `CharaId` order at Charlotta, who sorts 7th on `PL1200`, and Ghandagoza, 8th on `PL1500`. 100-102 is an appendix holding Id, Gallanza and Maglielle.

### `MinorVersionFlag`

`MinorVersionFlag` dates each addition. Flag `0` is the launch roster and includes Id, whose rows ship inside the base tables.

| Flag | Characters                                           |
| ---: | ---------------------------------------------------- |
|    3 | Seofon, Tweyen                                       |
|    4 | Sandalphon                                           |
|    5 | Beatrix, Eustace, Fraux, Fediel, Gallanza, Maglielle |

Seofon and Tweyen arrived together, Sandalphon after them, and the six flag-5 characters last.

## Weapon count

Weapon count drives two Masteries sections. Every character has 6 Collection nodes per weapon series.

| Weapons | Characters                                                     | Collection | Transcendence |
| ------: | -------------------------------------------------------------- | ---------: | ------------: |
|       6 | launch roster + Beatrix, Eustace                               | 36 / 1,104 |   36 / 12,720 |
|       4 | Sandalphon, Seofon, Tweyen, Gallanza, Maglielle, Fraux, Fediel |   24 / 736 |    24 / 8,480 |

Beatrix and Eustace are the only post-launch characters with six weapon series. Every other flag-4 and flag-5 character has four.

Offense and Defense node counts vary per character, see [masteries.md](masteries.md#msp-by-character). The 100-150% extension is identical for all 29: 50 nodes, 919,000 MSP.

## Rows that are not playable characters

| CharaId           | What it is                                                      |
| ----------------- | --------------------------------------------------------------- |
| `SLOT01`-`04`     | empty party slots; element `-1`, UI order 1000-1003             |
| `NP0000`-`NP0600` | Lyria, Vyrn, Sierokarte, Rolan, Historiath, Zathba; `IsNPC = 1` |
| `PL000B`          | `LookDev`, a rendering test entry                               |
| `PL2000`          | a second Id, UI order 2001, no Masteries tree                   |

`PL2000` resolves to "Id" like `PL1900` and has no `ap_tree_*` rows and no max level. A name-join instead of an id-join picks up both.

## Implementation

`characters.json` is hand-authored and holds `id`, `name`, `artId`, `playerId`, `element`, `enabled` per character. `scripts/extract.mjs` checks that `playerId` still matches a `gem.PlayerReq` and does not generate the file.

All 29 characters are in the file, and all 29 carry a `character-stats.json` row. Six are enabled: Katalina, Rackam, Io, Charlotta, Narmaya, Cagliostro. The six flag-5 characters have an entry, stats and art, but no per-character catalog.

Per-character data derived from these ids:

- `character-stats.json`, level-100 base stats, Masteries totals, MSP per section. [masteries.md](masteries.md).
- master traits, hand-authored under `src/catalog/characters/`. [master-traits.md](master-traits.md).
- `weaponHpOffset` and `weaponSignatureTrait`, one integer and one trait per character. [weapons.md](weapons.md).
