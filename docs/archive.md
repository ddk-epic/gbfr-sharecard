# The game archive

Every fact in `docs/` is read out of the game's own files.

## The tool

Nenkai's [GBFRDataTools](https://github.com/Nenkai/GBFRDataTools) (MIT) reads the packed archive. Needs an installed copy of the game. Release `2.0.0` ships a ~8 MB `win-x64` zip, runs against an installed .NET runtime, no build required.

Game ships `data.i` (index) plus `data.0`-`data.10`. The loose `data/system/table/` folder is a small override set - three `.tbl` files and a partial `text.msg` of 4,519 strings - **not** the real tables. Reading it instead of the archive yields an eighth of the text and none of the `limit_bonus` rows.

## Two commands

```
GBFRDataTools.exe extract-all -i "<game>/data.i" -o <dir> -f system/table/
GBFRDataTools.exe tbl-to-sqlite -i <dir>/system/table -o <dir>/tables.sqlite -v 2.0.2
```

`-f` = path-prefix filter; first command walks the 400k-file index but writes only the tables. `-v` = the **game** version, not the tool version.

Complete extract: **305 `.tbl` files, 302 SQLite tables, 33,440 English strings**. That's the completeness check. Three tables don't reach SQLite - no `.headers` file; [tables.md](tables.md) names them.

Icons come from the same archive via three further commands, in `scripts/icons.mjs`'s header.

## Column layouts

The tool's `Headers/` folder holds one `<table>.headers` file per table. Per-version column orders in `set_min_version` / `set_max_version` blocks - columns moved between 1.3.2 and 2.0.0.

Header column names aren't always right: `limit_bonus_param` labels a stat-type index `DisplayNumberMultiplier` and leaves the fractional-storage marker as `Unk19`; `limit_bonus_meditation_weight` names columns `WeightLv1/2/3` when they're per-tier, not per-level. Check a column's shape against its data before trusting its name.

## Text

`system/table/text/en/*.msg` are MessagePack documents shaped `{ rows_: [ { column_: { id_hash_, subid_hash_, text_ } } ] }`. Every `TXT_*` key a `.tbl` references resolves here.

Tables hold keys; a trait row carries `Name` = `TXT_SKILL_000_00`; the string `ATK` comes from the `.msg` side.

The two can disagree: six characters have all three trait rows in `skill` but only one resolved key between them - a key-filtered query finds one row of three. See [sigils.md](sigils.md#the-dlc-six).

## The tables behind these docs

Full list: [tables.md](tables.md). What this project reads:

| Table                        | Holds                                                 |
| ---------------------------- | ----------------------------------------------------- |
| `skill`                      | every trait: `Key`, `Name`, `IconId1`, `IsResistance` |
| `skill_status`               | per-trait, per-level values - max level               |
| `gem`                        | every sigil, 1034 rows                                |
| `gem_rare`                   | sigil level range per rarity                          |
| `weapon`, `weapon_status`    | weapons and their per-level ATK/HP                    |
| `weapon_status_awake`        | ATK/HP added per awakening level                      |
| `weapon_status_rebuild`      | ATK/HP added per transcendence step                   |
| `weapon_skill_level_rebuild` | transcendence trait slots and ladders                 |
| `limit_bonus*`               | masteries and over-masteries                          |
| `chara`                      | roster: `CharId`, `CharaName`, `Element`              |
| `chara_status`               | per-character base HP/ATK by level, flat crit/stun    |
| `chara_status_fate`          | HP/ATK a fate episode adds                            |
| `chara_power_*`              | PWR coefficients                                      |

Per-class analysis: [characters.md](characters.md), [weapons.md](weapons.md), [sigils.md](sigils.md), [overmasteries.md](overmasteries.md), [summons.md](summons.md), [master-traits.md](master-traits.md), [masteries.md](masteries.md), [stats.md](stats.md).

## Icon classes

Icon classes are not extracted from the tables; icons come from `ui/atlas/` instead.

| Class                        | Atlas                                              | Keyed by                  |
| ---------------------------- | -------------------------------------------------- | ------------------------- |
| Summon icons                 | `common_icon_summon`                               | `summon_info.IconIdMaybe` |
| Status / buff icons          | `common_icon_status`                               | -                         |
| Mastery + over-mastery icons | `common_icon_lb`, `common_icon_lb02` (264 sprites) | `limit_bonus.IconId`      |
| Skill diamond frames         | `cmn_icablt_frame0*`                               | -                         |

Cropped with `b-convert`, one call per `.tex.texb`. Atlases worth knowing: `common_icon_skill`, `common_icon_lb`, `common_icon_lb02`, `common_icon_summon`, `common_icon_ability`, `common_icon_main`, `common_icon_equip`, `common_icon_status`, `hud_guide_command`.

**`sprite_names.txt` is a known-names table, not a manifest.** Resolves 19,367 names; an unknown-name sprite still extracts, hash-named. A class missing from it is a naming gap, not an absence.

**Summon icons hit this.** `common_icon_summon` resolves **zero** sprite names - plain `b-convert` yields hash-named PNGs. Names sit in `summon_info.IconIdMaybe`, a raw string holding the sprite name; running it through the tool's `XXHash32Custom` matches the printed hashes.

**Two references resolve to nothing at all** (not merely unnamed): 44 weapon rows at the `_06` tier (`cmn_imgequ_wp0006`, `wp0206`, ... one per character), and `cmn_icablt_pl2400_09` (a DLC character skill icon). See [weapons.md](weapons.md).

Mastery atlas names itself by type, per the `limit_bonus` header:

```
0 = general stats                  cmn_iclb_cmn_{0:03}_{1:02}
1 = unique character upgrades      cmn_iclb_uni_pl{0}_{1:02}
2 = ability upgrades               cmn_iclb_cmn_{0:03}_{1:02}
3 = ability unlocks                cmn_iclb_99_01
4 = unique character functionality cmn_iclb_act_{0:03}_{1:02}
```

One atlas covers both Masteries nodes and Over Mastery.

**One glyph never located:** the skill-slot `Orb`. Best candidates in `hud_guide_command` (`hud_cmnd_ablt_icon00`-`06`, `hud_cmnd_ability_frame01`-`05`) - needs settling by image inspection, not name.

Atlases ship at two resolutions: `ui/atlas/` (4K), `ui/fhd/atlas/` (1080p).

## Licence

- **GBFRDataTools** - MIT, Copyright (c) 2024 Nenkai.
- Assets - **© Cygames**

## Implementation

**The archive is the authority.** Where it disagrees with a third-party source - relink.gbf.wiki, PE patch tool, datamine markdown - the archive wins and the catalog moves. Names aren't reconciled back to a sheet's wording.

Extract lives at `../gbfr-extract` relative to the repo (script default).
