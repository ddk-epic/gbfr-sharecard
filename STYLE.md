# STYLE - GBFR Sharecard

Tailwind v4 utilities carry everything. A small, sharply-bounded CSS domain holds
what utilities cannot express.

## The ladder - descend only when the rung above literally can't say it

1. **Utility**, including first-class variants (`hover:`, `last:`, `group-*`, `data-*`).
2. **Arbitrary value** - `text-[16.5px]`, `grid-cols-[1fr_1fr_30px]`. An ugly number is not a reason to descend.
3. **Authored CSS class** - only on a trigger below.

**Inline `style={{}}` is for runtime-computed values only** (portrait URL, `--sc`,
a measured `translateY`) - never static design values. It outranks every utility
and is invisible to grep.

## Two triggers for authored CSS, and only these two

- **It's art**: the big background pieces, currently the diagonal slash
  (`.shell::before/::after`, `.shareCard::before/::after`). Gradients and inset
  rings are _decoration_, not art - `.stat`, `.sigil`, `.summonCard`, `.viewport`,
  `.tab.on` are utilities.
- **Tailwind can't say it cleanly**: a `mask-*`/`clip-path`, a gradient with
  **four or more** color stops, a `calc()` on a custom property, or a paired
  `-webkit-` duplicate. Three stops stay utilities - `from-*`/`via-*`/`to-*` says
  them natively, positions included.

## Cascade, and the corollary that keeps the boundary

Authored CSS lives in `@layer components`, so **utilities always win on conflict**
and the JSX is the source of truth. Unlayered author CSS beats every utility
regardless of specificity - a `bg-white/80` in JSX would silently do nothing, and
on the card that surfaces as a wrong PNG.

**An art class declares only art properties**: background, mask, clip-path,
filter, box-shadow, pseudo-element content. Never layout, spacing, sizing or
typography. `display: flex` in an art class is a violation visible by reading it.
_Exemption:_ `::before`/`::after` have no JSX, so they keep their own geometry.

## Structure and state live in JSX

- **Banned:** arbitrary variants (`[&:has(+.imh)]:...`), element selectors,
  descendant selectors. JSX knows the structure; it passes a conditional class.
- Variant classes become props or conditional strings; multi-value ones a lookup
  object. Structural selectors become `last:` variants or JSX conditionals.
- **Runtime-measured state becomes a data attribute** - the measuring code sets
  `data-long`, the JSX carries `data-[long]:` variants, so all values stay in one
  place.

## Reuse is React components only

`src/ui/` owns the primitives (`<Icon>`, `<Orb>`, `<Heading>`, `<Cta>`, ...), each
owning its utility string with variants as props. **No `@apply`, no `@utility`** -
they reintroduce a class whose appearance can't be read from the JSX. Card and
editor import the same component so they cannot drift; if the card must diverge it
**forks the component**, never a CSS override.

**Rule of two for art:** when a second component wants an art class it moves from
`card-art.css` to `art.css` and drops its `.shareCard` prefix.

## Tokens: colors only

`@theme` holds semantic colors, **named for the role the hex plays** - text
(`--color-ui`, `--color-ink-strong`, `--color-dim`, `--color-value`), lines, gold,
band, the three styles, the slash ramp. Art-driving vars (`--slashTex`, `--sx`,
`--pg*`) live in the art files with the art they drive.

**A near-duplicate collapses onto its token** rather than earning one of its own -
but only within a role. Two hexes a few points apart that do different jobs (a
background and a hairline) stay separate; merging them couples what should move
independently.

**Sizes get no tokens.** The 68 distinct px values, 13 of them half-pixels, are
one-off hand-tunings, not a scale. **No value may be rounded**, ever - `14.5px` is
not `text-sm`.

Spacing and sizing utilities multiply `--spacing` (4px) by any **quarter step**, so
every whole-pixel value has a canonical class: `13px` is `size-3.25`, `62px` is
`w-15.5`. Prefer that form. Bracket it when the value is not whole pixels - `2.5px`
is `py-[2.5px]`, because `py-0.625` is off the grid and silently generates nothing -
or when the number resists reading as a multiple: `w-[1190.4px]` (1920 x .62) says
where it came from, `w-297.6` does not. Font-size, radius, border-width and blur
have no such scale, so off-token values there stay arbitrary.

## Files

| File                    | Holds                                                     |
| ----------------------- | --------------------------------------------------------- |
| `src/styles/theme.css`  | `@import "tailwindcss"`, `@theme` tokens, `@font-face`    |
| `src/styles/art.css`    | shell and shared art, in `@layer components`              |
| `src/card/card-art.css` | card-only art - not needed yet, the card shares all of it |
| `src/ui/*`              | shared primitive components                               |

`prototype/*.html` is historical reference, not a source of truth; it stays plain
CSS. Verify with `pnpm typecheck`, `pnpm lint`, and eyeballing each screen.
