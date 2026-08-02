# Level digits

The large numerals the game sets a character level in - the figures inside the
level diamond on the status screen. They are sprites, not a font, and they carry
their own layout metrics. Everything here is read out of the game archive
(version 2.0.2). See [archive.md](archive.md) for how the archive is extracted.

## Where they are

|            |                                                                      |
| ---------- | -------------------------------------------------------------------- |
| Atlas      | `ui/atlas/common_number` (4K); `ui/fhd/atlas/common_number` at 1080p |
| Sprites    | `cmn_num_lv00` - `cmn_num_lv09`, plus `cmn_num_lv12`                 |
| Descriptor | `ui/atlas/common_number.tex.yaml`                                    |
| Index map  | `ui/data/image/numberlv.image.imageb`                                |

`cmn_num_lv12` is a dash, used for an unknown or withheld level.

One atlas holds several unrelated number sets. `cmn_num_lv*` is the large level
set; `cmn_num_*` is a small set on a 36x72 cell, and others sit alongside. The
rules below apply to all of them, only the cell size differs.

`numberlv` maps a digit value to a sprite and nothing else - index 0-9 are the
digits, 10 and 11 repeat `cmn_num_lv00`, 12 is the dash. It carries no
positions.

## The descriptor

Converting an atlas writes **two** outputs, and the second is easy to miss:

```
GBFRDataTools b-convert -i <atlas>.tex.texb
```

produces a folder of cropped sprite PNGs _and_ a `<atlas>.tex.yaml` beside it.
The YAML is where the layout metrics live:

```yaml
- Name: cmn_num_lv00
  Rect: 0, 0, 152, 296
  Border: 0, 0, 0, 0
  Padding: 5.0761204, 67.07612, 5.076126, 69.07614
  Uv: 0.7729492, 0, 0.84228516, 0.15625
  MinSize: 0, 0
```

- **`Rect`** is the sprite's logical cell. Its width is the glyph's advance; its
  height is shared by every glyph in the set.
- **`Padding`** insets the ink within that cell, in the order **left, bottom,
  right, top**. The atlas is bottom-up, so the second value is the distance from
  the cell's bottom edge to the foot of the ink.
- The cropped PNG is the ink only, exactly `Rect` minus `Padding`.

## Rendering

Lay the cells end to end by `advance`, and draw each glyph's ink at its offset
within its own cell. Every cell is the same height, so the cells alone align the
figures - no baseline arithmetic is needed at the point of use.

```
ink.x = padding.left
ink.y = padding.top            # from the top of the cell, once flipped
ink.w = rect.w - padding.left - padding.right
ink.h = rect.h - padding.top - padding.bottom
```

## Metrics

Cell height **296** for the whole set. `x`/`y` are the ink's offset inside the
cell, measured from its top-left. `foot` is the distance from the cell top down
to the bottom of the ink.

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

The fractional parts are in the data, not introduced here.

## They are old-style figures

The set is **old-style (text) figures**, so the glyphs do not share a height and
cannot be aligned by their bounding boxes:

|                                   | glyphs        |
| --------------------------------- | ------------- |
| x-height, sitting on the baseline | 0, 1, 2       |
| ascending                         | 6, 8          |
| descending                        | 3, 4, 5, 7, 9 |

**Baseline 229. Descender depth 56.** Read straight off the `foot` column: the
baseline glyphs land on 228.92 - 228.97, and the descenders 3, 4, 5 and 7 all
land on 284.92 - 284.97.

Two details worth knowing before matching a rendering against a screenshot:

- **`1` sits 2 units below the baseline** (foot 230.92 against 228.92), where the
  usual convention would have the round glyphs overshoot below it instead. This
  is what the data says; it is well under a pixel at normal sizes.
- **`9` descends only 52**, not the 56 the other four descenders share.

## Confirming the padding order

The order matters and is not self-evident, so it is worth stating how it is
checked. Reading `Padding` as left/top/right/bottom instead of left/bottom/right/top
mirrors the set vertically, which puts 6 and 8 _below_ the baseline and lifts 3,
4 and 5 above it - an arrangement no typeface uses.

Two checks settle it:

1. **Internal.** Under the correct order the four descenders 3, 4, 5, 7 agree to
   two decimal places (284.92 - 284.97) and the baseline glyphs 0, 2, 6, 8 agree
   likewise (228.92). A mistaken order scatters both groups; agreement that tight
   across four independent glyphs does not arise by accident.
2. **Against a screenshot.** Set `100` both ways and compare with the level
   diamond. The game's `1` rises clearly above the two `0`s with the feet level.
   The wrong order levels the tops and drops the `1`'s foot below the `0`s.

## The prefabs are a dead end

The obvious place to look for positioning is the prefab that draws the number,
and it does not work. Every prefab referencing `numberlv` - 29 of them, including
`ui/layouts/pause/status/prefabs/status01` and
`ui/layouts/pause/party/prefabs/party01_chr01` - fails to convert on a component
the tool does not model:

```
ERROR: Unmapped/Unsupported component type 'ControllerStatus'
ERROR: Unrecognized property with hash 0x24E49AB7 in 'WeaponInfo'
```

The layout files above them (`.viewb`) convert cleanly but only place prefabs, and
the `.listb` beside each prefab lists its image sets without any geometry. The
atlas descriptor is the only source that carries the metrics.

## Licence

The assets are **© Cygames**.
