# The game archive

Every fact in `docs/` is read out of the game's own files. This page says how to
get them and what is in them.

## The tool

Nenkai's [GBFRDataTools](https://github.com/Nenkai/GBFRDataTools) (MIT) reads the
packed archive. It needs an installed copy of the game. Release `2.0.0` ships a
~8 MB `win-x64` zip that runs against an installed .NET runtime, no build
required.

The game ships `data.i` (the index) plus `data.0`-`data.10`. The loose
`data/system/table/` folder beside them is a small override set - three `.tbl`
files and a partial `text.msg` of 4,519 strings - **not** the real tables.
Reading it instead of the archive yields an eighth of the text and none of the
`limit_bonus` rows.

## Two commands

```
GBFRDataTools.exe extract-all -i "<game>/data.i" -o <dir> -f system/table/
GBFRDataTools.exe tbl-to-sqlite -i <dir>/system/table -o <dir>/tables.sqlite -v 2.0.2
```

`-f` is a path-prefix filter, so the first command walks the whole 400k-file
index but writes only the tables. `-v` is the **game** version, not the tool
version.

A complete extract is **308 `.tbl` files, 302 SQLite tables, and 33,440 English
strings**. Those three numbers are the check that an extract is whole.

Icons come out of the same archive through three further commands, which
`scripts/icons.mjs` carries in its header.

## Column layouts

The tool's own `Headers/` folder holds one `<table>.headers` file per table,
often with comments from the reverse-engineering. They answer most shape
questions without extracting anything, and they carry per-version column orders
in `set_min_version` / `set_max_version` blocks - which matters, because columns
moved between 1.3.2 and 2.0.0.

Header column names are not always right, and a wrong one will send you down a
dead end. `limit_bonus_param` labels a stat-type index `DisplayNumberMultiplier`
and leaves the column that actually marks fractional storage as `Unk19`;
`limit_bonus_meditation_weight` names its columns `WeightLv1/2/3` when they are
per-tier rather than per-level. Check a column's shape against its data before
trusting its name.

## Text

`system/table/text/en/*.msg` are MessagePack documents shaped
`{ rows_: [ { column_: { id_hash_, subid_hash_, text_ } } ] }`. Every `TXT_*`
key a `.tbl` references resolves here.

Tables hold keys, not text. A trait row carries `Name` = `TXT_SKILL_000_00`; the
string `ATK` comes from the `.msg` side. Any query producing readable output
joins the two.

The two can disagree. Six character styles have their trait names in the text
tables but only one of three rows in `skill` - see
[sigils.md](sigils.md#the-dlc-six-are-text-only).

## The tables behind these docs

| Table                        | Holds                                                  |
| ---------------------------- | ------------------------------------------------------ |
| `skill`                      | every trait: `Key`, `Name`, `IconId1`, `IsResistance`  |
| `skill_status`               | per-trait, per-level values - and so the max level     |
| `gem`                        | every sigil, 1034 rows                                 |
| `gem_rare`                   | sigil level range per rarity                           |
| `weapon`, `weapon_status`    | weapons and their per-level ATK/HP                     |
| `weapon_status_awake`        | ATK/HP added per awakening level                       |
| `weapon_status_rebuild`      | ATK/HP added per transcendence step                    |
| `weapon_skill_level_rebuild` | transcendence trait slots and ladders                  |
| `limit_bonus*`               | masteries and over-masteries                           |
| `chara`                      | the roster: `CharId`, `CharaName`, `Element`           |
| `chara_status`               | per-character base HP/ATK by level, and flat crit/stun |
| `chara_status_fate`          | the HP/ATK a fate episode adds                         |
| `chara_power_*`              | the PWR coefficients                                   |

Per-class analysis: [weapons.md](weapons.md), [sigils.md](sigils.md),
[overmasteries.md](overmasteries.md), [summons.md](summons.md),
[master-traits.md](master-traits.md), [stats.md](stats.md).

## Icon classes not extracted

Icons come out of `ui/atlas/` rather than the tables. These classes were located
but deliberately left, and this is where they live if one is wanted later.

| Class                        | Atlas                                              | Keyed by                  |
| ---------------------------- | -------------------------------------------------- | ------------------------- |
| Summon icons                 | `common_icon_summon`                               | `summon_info.IconIdMaybe` |
| Status / buff icons          | `common_icon_status`                               | -                         |
| Mastery + over-mastery icons | `common_icon_lb`, `common_icon_lb02` (264 sprites) | `limit_bonus.IconId`      |
| Skill diamond frames         | `cmn_icablt_frame0*`                               | -                         |

Icons are cropped with `b-convert`, one call per `.tex.texb`. The atlases worth
knowing: `common_icon_skill`, `common_icon_lb`, `common_icon_lb02`,
`common_icon_summon`, `common_icon_ability`, `common_icon_main`,
`common_icon_equip`, `common_icon_status`, `hud_guide_command`.

**`sprite_names.txt` is a known-names table, not a manifest.** It resolves
19,367 names, and a sprite whose name it does not know still extracts - just
hash-named. So a class missing from it is a naming gap, never an absence.

**Summon icons are the class that hits this.** `common_icon_summon` resolves
**zero** sprite names, so a plain `b-convert` yields hash-named PNGs. The names
are in the data instead: `summon_info.IconIdMaybe` is a raw string holding the
sprite name, and running those through the tool's `XXHash32Custom` matches them
to the hashes it prints per sprite.

**Two references resolve to nothing at all**, as opposed to being unnamed: 44
weapon rows at the `_06` tier (`cmn_imgequ_wp0006`, `wp0206`, … - one per
character) whose art is absent from the archive, and `cmn_icablt_pl2400_09`, a
DLC character skill icon. See [weapons.md](weapons.md) for the weapon side.

**The mastery atlas names itself by type**, per the `limit_bonus` header:

```
0 = general stats                  cmn_iclb_cmn_{0:03}_{1:02}
1 = unique character upgrades      cmn_iclb_uni_pl{0}_{1:02}
2 = ability upgrades               cmn_iclb_cmn_{0:03}_{1:02}
3 = ability unlocks                cmn_iclb_99_01
4 = unique character functionality cmn_iclb_act_{0:03}_{1:02}
```

One atlas therefore covers both the mastery board and over-masteries.

**One glyph was never located.** The skill-slot `Orb` has no sprite name that
obviously matches; the best candidates are in `hud_guide_command`
(`hud_cmnd_ablt_icon00`-`06`, `hud_cmnd_ability_frame01`-`05`). It is the one
class that has to be settled by looking at extracted images rather than by name.

Atlases ship at two resolutions: `ui/atlas/` is the 4K set and `ui/fhd/atlas/`
the same sheets at 1080p.

## Licence

- **GBFRDataTools** is MIT, Copyright (c) 2024 Nenkai.
- The assets are **© Cygames**

## What this project uses

**The archive is the authority.** Where it and a third-party source disagree -
the community calculator sheet, relink.gbf.wiki, the PE patch tool, a datamine
markdown - the archive wins and the catalog moves. Names are not reconciled back
to a sheet's wording. Those sources are hand-maintained and drift: measured
against `skill_status`, 23 of the 190 trait max levels previously shipped were
wrong, most resistances reading 15 against a real cap of 30, and _Sigil Booster_
reading 15 against a real cap of 2.

The extract lives at `../gbfr-extract` relative to the repo, which is the
default the scripts assume. It is uncommitted - raw game data, large,
© Cygames.
