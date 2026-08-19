# Level digits

The large numerals in the level diamond on the status screen. Sprites, not a font, with their own layout metrics. Archive version 2.0.2. See [archive.md](archive.md).

## Where they are

|            |                                                                      |
| ---------- | -------------------------------------------------------------------- |
| Atlas      | `ui/atlas/common_number` (4K); `ui/fhd/atlas/common_number` at 1080p |
| Sprites    | `cmn_num_lv00` - `cmn_num_lv09`, plus `cmn_num_lv12`                 |
| Descriptor | `ui/atlas/common_number.tex.yaml`                                    |
| Index map  | `ui/data/image/numberlv.image.imageb`                                |

`cmn_num_lv12` = dash, for an unknown or withheld level.

One atlas holds several unrelated number sets: `cmn_num_lv*` (large level set), `cmn_num_*` (small, 36x72 cell), others alongside. Same rules, different cell size.

`numberlv` maps digit value to sprite only - index 0-9 digits, 10 and 11 repeat `cmn_num_lv00`, 12 = dash. No positions.

## The descriptor

```
GBFRDataTools b-convert -i <atlas>.tex.texb
```

Writes two outputs: cropped sprite PNGs, and a `<atlas>.tex.yaml` beside it. The YAML carries the layout metrics:

```yaml
- Name: cmn_num_lv00
  Rect: 0, 0, 152, 296
  Border: 0, 0, 0, 0
  Padding: 5.0761204, 67.07612, 5.076126, 69.07614
  Uv: 0.7729492, 0, 0.84228516, 0.15625
  MinSize: 0, 0
```

- `Rect` - sprite's logical cell. Width = glyph advance. Height shared by every glyph.
- `Padding` - insets ink within the cell, order **left, bottom, right, top**. Atlas is bottom-up, so the second value is distance from the cell's bottom edge to the foot of the ink.
- Cropped PNG = ink only, exactly `Rect` minus `Padding`.

## Rendering

Lay cells end to end by `advance`; draw each glyph's ink at its offset within its own cell. Every cell shares height, so no baseline arithmetic needed at point of use.

```
ink.x = padding.left
ink.y = padding.top            # from the top of the cell, once flipped
ink.w = rect.w - padding.left - padding.right
ink.h = rect.h - padding.top - padding.bottom
```

## Metrics

Cell height **296**. `x`/`y` = ink offset inside the cell, from top-left. `foot` = distance from cell top to bottom of ink.

| glyph | sprite         | advance | x    | y      | w      | h      | foot   |
| ----- | -------------- | ------- | ---- | ------ | ------ | ------ | ------ |
| 0     | `cmn_num_lv00` | 152     | 5.08 | 69.08  | 141.85 | 159.85 | 228.92 |
| 1     | `cmn_num_lv01` | 88      | 5.08 | 58.03  | 77.85  | 172.90 | 230.92 |
| 2     | `cmn_num_lv02` | 148     | 4.05 | 64.08  | 136.87 | 164.90 | 228.97 |
| 3     | `cmn_num_lv03` | 140     | 6.03 | 65.08  | 128.96 | 219.85 | 284.92 |
| 4     | `cmn_num_lv04` | 140     | 2.03 | 64.03  | 133.90 | 220.95 | 284.97 |
| 5     | `cmn_num_lv05` | 148     | 2.03 | 64.05  | 139.92 | 220.87 | 284.92 |
| 6     | `cmn_num_lv06` | 148     | 3.01 | 12.03  | 142.96 | 216.90 | 228.92 |
| 7     | `cmn_num_lv07` | 144     | 4.03 | 67.01  | 137.95 | 217.91 | 284.92 |
| 8     | `cmn_num_lv08` | 160     | 6.08 | 15.08  | 147.85 | 213.85 | 228.92 |
| 9     | `cmn_num_lv09` | 148     | 2.03 | 63.08  | 141.90 | 217.85 | 280.92 |
| -     | `cmn_num_lv12` | 88      | 5.08 | 133.08 | 77.85  | 33.85  | 166.92 |

Fractional parts are in the data.

## Old-style figures

Not aligned by bounding box; no shared height:

|                                   | glyphs        |
| --------------------------------- | ------------- |
| x-height, sitting on the baseline | 0, 1, 2       |
| ascending                         | 6, 8          |
| descending                        | 3, 4, 5, 7, 9 |

**Baseline 229. Descender depth 56.** From `foot`: baseline glyphs 228.92-228.97, descenders 3/4/5/7 at 284.92-284.97.

- **`1` sits 2 units below the baseline** (foot 230.92 vs 228.92) - the data, not typical round-glyph overshoot. Under a pixel at normal sizes.
- **`9` descends only 52**, not 56 like the other three descenders.

## Confirming the padding order

Reading `Padding` as left/top/right/bottom instead of left/bottom/right/top mirrors the set vertically: 6 and 8 drop below the baseline, 3/4/5 rise above it - no typeface does this.

1. **Internal.** Correct order: descenders 3/4/5/7 agree to two decimals (284.92-284.97), baseline glyphs 0/2/6/8 agree at 228.92. Wrong order scatters both groups.
2. **Against a screenshot.** `100` both ways vs. the level diamond: the game's `1` rises above the two `0`s with feet level. Wrong order levels the tops and drops the `1`'s foot below the `0`s.

## The prefabs

The prefabs are a dead end. Every prefab referencing `numberlv` (29, including `ui/layouts/pause/status/prefabs/status01`, `ui/layouts/pause/party/prefabs/party01_chr01`) fails to convert:

```
ERROR: Unmapped/Unsupported component type 'ControllerStatus'
ERROR: Unrecognized property with hash 0x24E49AB7 in 'WeaponInfo'
```

`.viewb` layouts above them convert but only place prefabs; `.listb` beside each prefab lists image sets, no geometry. The atlas descriptor is the only source with metrics.

## Licence

Assets **© Cygames**.
