# Characters

The roster as the archive holds it, from `chara` joined to English text. See [archive.md](archive.md).

`chara` has 41 rows: 29 playable with Masteries trees, rest slots/NPCs/dev entries (bottom of page).

## CharaId

Every per-character table keys on `CharaId` - `PL0400` for Io. `characters.json` calls it `playerId`; `scripts/extract.mjs` joins on it for `character-stats.json`.

**`playerId` is not always the character's own id.** It's `gem.PlayerReq`, which gates signature sigils, and the catalog uses it for that first:

- **Gran and Djeeta both carry `PL0000`** in `characters.json`, though the archive has `PL0000`/`PL0100`. Both resolve to "The Captain"; Masteries trees byte-identical, so the collapse costs nothing.
- **Id's `artId` is `1901`, `CharaId` is `PL1900`.**

## The playable roster

Element: `0` Fire, `1` Water, `2` Earth, `3` Wind, `4` Light, `5` Dark - same order as `ElementId` in `src/catalog/types.ts`. Gender: `1` male, `2` female.

| CharaId | Name        | Element | UI order | Version | Weapons | In `characters.json` |
| ------- | ----------- | ------- | -------: | :-----: | ------: | -------------------- |
| PL0000  | The Captain | Wind    |        0 |    -    |       6 | `gran`               |
| PL0100  | The Captain | Wind    |        1 |    -    |       6 | `djeeta`, as PL0000  |
| PL0200  | Katalina    | Water   |        2 |    -    |       6 | yes                  |
| PL0300  | Rackam      | Fire    |        3 |    -    |       6 | yes                  |
| PL0400  | Io          | Light   |        4 |    -    |       6 | yes                  |
| PL0500  | Eugen       | Earth   |        5 |    -    |       6 | yes                  |
| PL0600  | Rosetta     | Dark    |        6 |    -    |       6 | yes                  |
| PL1200  | Charlotta   | Light   |        7 |    -    |       6 | yes                  |
| PL1500  | Ghandagoza  | Fire    |        8 |    -    |       6 | yes                  |
| PL0700  | Ferry       | Light   |        9 |    -    |       6 | yes                  |
| PL1400  | Narmaya     | Dark    |       10 |    -    |       6 | yes                  |
| PL0800  | Lancelot    | Water   |       11 |    -    |       6 | yes                  |
| PL0900  | Vane        | Water   |       12 |    -    |       6 | yes                  |
| PL1000  | Percival    | Fire    |       13 |    -    |       6 | yes                  |
| PL1100  | Siegfried   | Earth   |       14 |    -    |       6 | yes                  |
| PL1800  | Cagliostro  | Earth   |       15 |    -    |       6 | yes                  |
| PL1300  | Yodarha     | Wind    |       16 |    -    |       6 | yes                  |
| PL1600  | Zeta        | Fire    |       17 |    -    |       6 | yes                  |
| PL1700  | Vaseraga    | Dark    |       18 |    -    |       6 | yes                  |
| PL2600  | Beatrix     | Water   |       19 |    5    |       6 | **no**               |
| PL2700  | Eustace     | Wind    |       20 |    5    |       6 | **no**               |
| PL2200  | Seofon      | Wind    |       21 |    3    |       4 | yes                  |
| PL2300  | Tweyen      | Light   |       22 |    3    |       4 | yes                  |
| PL2100  | Sandalphon  | Light   |       23 |    4    |       4 | yes                  |
| PL2800  | Fraux       | Fire    |       24 |    5    |       4 | **no**               |
| PL2900  | Fediel      | Dark    |       25 |    5    |       4 | **no**               |
| PL1900  | Id          | Dark    |      100 |    -    |       6 | yes                  |
| PL2400  | Gallanza    | Earth   |      101 |    5    |       4 | **no**               |
| PL2500  | Maglielle   | Light   |      102 |    5    |       4 | **no**               |

`MinLvlForOverMasteries` **80**, `MaxLevelMaybe` **100**, all 29, no exceptions.

### UI order

UI order has two runs. 0-25: in-game roster order, not `CharaId` order (Charlotta sorts 7th, Ghandagoza 8th; ids PL1200/PL1500).

**100+ is an appendix**: Id, Gallanza, Maglielle sit at 100-102.

### `MinorVersionFlag`

`MinorVersionFlag` dates the additions. Launch roster = flag `0`, includes Id (shipped inside base tables despite late release).

| Flag | Characters                                           |
| ---: | ---------------------------------------------------- |
|    3 | Seofon, Tweyen                                       |
|    4 | Sandalphon                                           |
|    5 | Beatrix, Eustace, Fraux, Fediel, Gallanza, Maglielle |

Seofon/Tweyen dropped together; Sandalphon after. Flag-5 six are the newest.

## Weapon count

Weapon count drives two Masteries sections. Every character: **6 Collection nodes per weapon series**, no exception.

| Weapons | Characters                                                     | Collection | Transcendence |
| ------: | -------------------------------------------------------------- | ---------: | ------------: |
|       6 | launch roster + Beatrix, Eustace                               | 36 / 1,104 |   36 / 12,720 |
|       4 | Sandalphon, Seofon, Tweyen, Gallanza, Maglielle, Fraux, Fediel |   24 / 736 |    24 / 8,480 |

Beatrix and Eustace: flag-5 additions, full six series, roster order 19-20 (not appendix). Every other flag-4/5 character has four.

Offense/Defense node counts vary per character - see [masteries.md](masteries.md#msp-by-character). The 100-150% extension is identical for all 29: 50 nodes, 919,000 MSP.

## Rows that are not playable characters

| CharaId           | What it is                                                      |
| ----------------- | --------------------------------------------------------------- |
| `SLOT01`-`04`     | empty party slots; element `-1`, UI order 1000-1003             |
| `NP0000`-`NP0600` | Lyria, Vyrn, Sierokarte, Rolan, Historiath, Zathba; `IsNPC = 1` |
| `PL000B`          | `LookDev`, a rendering test entry                               |
| `PL2000`          | a **second** Id, UI order 2001, no Masteries tree               |

`PL2000` resolves to "Id" exactly like `PL1900`, but has no `ap_tree_*` rows and no max level. A name-join instead of id-join picks up both.

## Implementation

`characters.json` is hand-authored: `id`, `name`, `artId`, `playerId`, `portrait`, `element`, `enabled`. `scripts/extract.mjs` checks `playerId` still matches a `gem.PlayerReq`, doesn't generate the file.

**Six enabled**: Katalina, Rackam, Io, Charlotta, Narmaya, Cagliostro. Rest present but off. The six flag-5 additions (Beatrix, Eustace, Fraux, Fediel, Gallanza, Maglielle) are absent from the file entirely - no `character-stats.json` row.

Per-character data derived from these ids:

- `character-stats.json` - level-100 base stats, Masteries totals, MSP per section. [masteries.md](masteries.md).
- master traits - hand-authored under `src/catalog/characters/`. [master-traits.md](master-traits.md).
- `weaponHpOffset`, `weaponSignatureTrait` - one integer, one trait per character. [weapons.md](weapons.md).
