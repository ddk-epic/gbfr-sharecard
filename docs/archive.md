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

Header column names are not always right. `limit_bonus_param` labels a
stat-type index `DisplayNumberMultiplier` and leaves the real multiplier as
`Unk19`.

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

| Table                        | Holds                                                 |
| ---------------------------- | ----------------------------------------------------- |
| `skill`                      | every trait: `Key`, `Name`, `IconId1`, `IsResistance` |
| `skill_status`               | per-trait, per-level values - and so the max level    |
| `gem`                        | every sigil, 1034 rows                                |
| `gem_rare`                   | sigil level range per rarity                          |
| `weapon`, `weapon_status`    | weapons and their per-level ATK/HP                    |
| `weapon_skill_level_rebuild` | transcension trait slots and ladders                  |
| `limit_bonus*`               | masteries and over-masteries                          |
| `chara`                      | the roster: `CharId`, `CharaName`, `Element`          |

Per-class analysis: [weapons.md](weapons.md), [sigils.md](sigils.md),
[overmasteries.md](overmasteries.md).

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
