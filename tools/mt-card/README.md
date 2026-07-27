# MT Card

Merges in-game Master Traits screenshots into one tall image per style, so a
character's whole trait table can be read (or transcribed) in one go.

A character has 3 styles × 4 style ranks = 12 screenshots. The tool turns each
style's 4 shots into one image, `<character>-<style>.png`.

Open `index.html` in a browser. No server, no build step.

## Capturing

The Master Traits screen is one scrollable column that jumps cell by cell, so
the same scroll position is reproducible.

1. Open the style's trait list in-game.
2. Scroll so Style Rank 1 is at the top, **Alt+PrtSc**.
3. Scroll so Style Rank 2 is at the top, **Alt+PrtSc**. Same for Rank 3 and EX.
4. Repeat for the other two styles.

Shooting a rank across all three styles before moving to the next rank works
just as well — set **Paste order** to match.

Every capture must be exactly **1920×1080** — the game has to be at 1080p with
no window chrome in the shot. Anything else is rejected on paste, with the size
it actually got.

## Merging

1. Pick the character from the dropdown.
2. Click the first slot to arm it, then **Ctrl+V** twelve times — the armed slot
   advances after each paste. Click any slot to re-arm it and overwrite.
   **Paste order** sets which way it advances: down a style at a time, or across
   a rank at a time. Match it to the order the shots were taken in.
3. **Merge → download** per column. It stays disabled until all 4 slots of that
   column are filled and a character is picked.

`Clear slots` empties all twelve. Calibration is untouched.

## Calibration

The merge lays the Rank 1 shot down whole, then overwrites it with each later
shot, offset so the overlapping sections coincide.

- **left / right** — vertical cuts, same for every shot.
- **top r2 / r3 / ex** — where a later shot's usable content starts, just under
  the screen header. Rank 1 has no top cut: it carries the title.
- **bottom** — only the EX shot needs one; the others have their tails
  overwritten by the next shot.
- **shift** — how far down a shot is pushed so its content lands on the previous
  shot's matching content. One per seam, per column. This is the only number
  that has to be pixel-exact.

The cuts are dragged as green lines directly on the thumbnails, or typed in the
calibration bar. Hovering or holding a line brings up a loupe showing the source
pixels around the cut at 8× on a pixel grid, with the cut itself marked — the
thumbnail is far too small to place an edge on by eye.

A thumbnail pixel is about three source pixels, so plain dragging can only land
on every third one. **Shift-drag** slows it to one source pixel per screen pixel,
and the **wheel** over a line steps it ±1 (shift ±10) along that line's own axis —
so rolling over a vertical line moves it left and right.

Shifts are set with **Calibrate seam**, which lays the two shots
over each other at 1:1 — blended, so a misalignment shows as doubled text. Drag,
or nudge with ↑/↓ (shift for 10). Untick blend to see the real output.

Shifts usually carry over between characters; recalibrate a seam only when one
looks wrong.

## Persistence

None, deliberately. **Copy calibration** puts a replacement `CALIBRATION` block
on the clipboard; paste it over the block in `index.html` to make a session
permanent. The file is the single truth, so a reload resets everything to what
is committed.

## Note

The character list is hardcoded in `index.html` — a `file://` page cannot read
`src/data/characters.json`. It is the full in-game roster and is wider than
`characters.json`, which currently only carries the base 23.
