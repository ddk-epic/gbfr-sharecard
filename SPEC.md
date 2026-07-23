# GBFR Sharecard — buildable v1 spec

Consolidates every closed wayfinding ticket (see `.wayfinder/`) into the single
spec an implementation session can build without asking anything. Where a
prototype exists it is the layout source of truth; this spec records decisions,
not pixels.

**v1 in one sentence:** a static SPA where a player picks a character (v1: Io),
edits that character's build in a carousel editor, and exports a read-only
1920×1080 share card as a PNG (clipboard + download), with the build auto-saved
to localStorage.

---

## 1. Stack & repo

- **Stack:** React + TypeScript + Vite + TanStack Router, static build, pnpm.
  Latest stable versions at implementation time. No SSR, no DB, no backend.
- **Repo:** https://github.com/ddk-epic/gbfr-sharecard (public, `main` pushed,
  husky pre-commit: typecheck + lint + format already configured).
- **Hosting:** GitHub Pages, "GitHub Actions" source, already enabled →
  https://ddk-epic.github.io/gbfr-sharecard/. Nothing deploys until the
  workflow lands.
- **Critical:** project page under a subpath ⇒ Vite `base: '/gbfr-sharecard/'`
  (absolute-root asset URLs will 404).
- **Deploy workflow** (`.github/workflows/deploy.yml`): on push to `main` —
  pnpm install → `pnpm build` → `actions/upload-pages-artifact` (dist) →
  `actions/deploy-pages`.
- **Tests:** written _after_ implementation, unit tests only (domain layer:
  trait tally, catalog resolve, storage load/discard). No UI/e2e tests in v1.
- English-only. All imagery © Cygames — the app footer carries
  "Granblue Fantasy: Relink © Cygames" plus attribution to Maygi's calculator
  sheet and gbfr-logs.

## 2. Screens & app shell

- **Single route.** The whole app lives at the Pages base path
  (`/gbfr-sharecard/`); character select, editor, and card view are one
  route, shown/hidden by state. No per-screen URLs in v1.
- The three screens sit on **one vertical track** (select ⓪ → editor ① →
  card ②, 1080 px each) and every transition is the same scroll-down motion
  (~550 ms ease, arriving screen fades in, slash background stays fixed).
  Select → editor on character pick (§6); editor → card on the Generate Card
  CTA (§7); "‹ Character" / "‹ Editor" buttons (top-left) reverse one step.
  Handoff prototype = `prototype/handoff-prototype.html` (ticket 009).
- Every screen is a fixed **1920×1080 stage** scaled to the viewport via
  wrapper `transform: scale(...)` only (never scale the card node itself —
  export depends on it, §9).

## 3. Domain model

Embedded verbatim from the domain-model ticket (004); glossary in
`CONTEXT.md` is the ubiquitous language.

```ts
// ---- Build (what localStorage stores, one per character) ----
type Build = {
  schemaVersion: 1;
  characterId: string; // slug, e.g. "io"
  status: { hp: number; atk: number; critRate: number; stunPower: number }; // player-entered
  skills: (SkillId | null)[]; // exactly 4, from the character's skill catalog
  overMastery: (OverMasteryLine | null)[]; // exactly 4, fully random lines, no fixed line
  weapon: Weapon | null;
  sigils: (SigilSlot | null)[]; // exactly 12
  wrightstone: Wrightstone | null;
  summons: (SummonSlot | null)[]; // exactly 4
  masterTraits: MasterTraitSelections;
};

type OverMasteryLine = { bonusType: BonusTypeId; value: number };
type Weapon = {
  weapon: WeaponId; // catalog: series, trait rows, rotatable slot
  level: number;
  baseStats: { hp: number; atk: number; critRate: number; stun: number };
  rotatedTrait: TraitId | null;
}; // Terminus slot-2 choice
type SigilSlot = {
  primaryTrait: TraitId;
  secondaryTrait: TraitId | null;
  level: number;
};
// trait-based (sigil item never named); one level credits both traits
type Wrightstone = {
  main: { trait: TraitId; level: number }; // cap 20
  sub1: { trait: TraitId; level: number } | null; // cap 15
  sub2: { trait: TraitId; level: number } | null; // cap 10
}; // display name derived: prefix follows main trait ("Dread…" ⇔ Stun)
type SummonSlot = {
  summon: SummonId;
  trait: TraitId;
  traitLevel: number;
  equipBonus: { bonusType: BonusTypeId; value: number } | null;
};
type MasterTraitSelections = Record<
  StyleId /* insight|essence|crux */,
  Record<Rank /* r1|r2|r3|ex */, OptionId[]>
>;
// OptionId[] is a SET of stable cell ids ("insight.r2.6");
// position/order lives in the catalog, never in the Build
```

**Derived, never stored:**

- `traitTally(build)` — per-trait level sums over 12 sigil slots (both traits
  at slot level) + 3 wrightstone slots. Editor-only; never on the card. The
  ONE calculation v1 performs — no caps, no % math.
- `stylePerkStates(selections)` — rank-perk activation from per-style
  selection counts vs catalog thresholds.

**Master-trait mechanics:** three universal styles (Insight/Essence/Crux); all
selections across styles active simultaneously; per-rank shared budgets
10/10/10/20, 1 point per selection; perks activate at per-style thresholds
(≈3/6/6 — verify, §10).

**Generic⇄specific master-trait split:** cell identity ≠ trait payload.
Shared pool `genericMasterTraits: Record<GenericTraitId, { label }>`;
per-character sections are ordered `SectionEntry[]`, an entry being
`{ id: OptionId, ref: GenericTraitId }` (generic, interned) or
`{ id: OptionId, label }` (character-specific, inline). `OptionId` is the
cell id (CSV `IDs` column), unique within its section — the same generic def
may occupy multiple cells (real case: Io Essence EX has "DMG Cap +30%" three
times). One pure resolve function at catalog load produces uniform
`{ id, label }` cells; `ref`-vs-`label` is the only discriminator. Row
pairing (2 cells per row) is rendering, not data. Worked example in ticket
004's addendum.

**Validation stance:** structural caps only — slot counts 4/4/12/4,
wrightstone 20/15/10 (highest tier only), trait max levels from catalog.
Budgets and perk states are displayed, never enforced.

## 4. localStorage

- Key per character: `gbfr-sharecard:build:<characterId>`, written on every
  edit (debounce ~300 ms is fine).
- On load with `schemaVersion` mismatch (or parse failure): **discard and
  start fresh**. No migration in v1.

## 5. Static data (catalog)

Shipped as JSON under `src/data/` (or `public/data/` if fetched — prefer
imported JSON for type safety). Shapes per §3:

- `characters.json` — slug, display name, portrait path, **portrait framing
  y-offset** (§6), element; v1 ships the full 23-entry roster for the select
  grid but only Io has `enabled: true` + catalog payload.
- `traits.json` — name, maxLevel, sigil/wrightstone pool flags.
- `bonus-types.json` — the 11 canonical types with per-context value ranges
  (over-mastery ranges; summon-equip ranges).
- `summons.json`, `weapons.json` (name, series, base stats, 5 trait rows +
  which slot is rotatable), `wrightstone-prefixes.json` (prefix↔main-trait).
- `master-traits.generic.json` + per-character `characters/io.json`
  (skills, master-trait sections as ordered entries).

**Extraction pipeline** (one-off scripts in `scripts/`, results committed;
sources & access notes in `research/game-data.md`):

1. Maygi sheet tabs (`MasterTraits`, `Sigils`, `Constants`) via public gviz
   CSV export → master traits (incl. Io), sigil trait levels, wrightstone
   trait pool.
2. gbfr-logs `lang/en/*.json` (MIT) → canonical names (sigils incl. "+"
   variants, over-masteries).
3. PE-Patch-Tool `sigils.json` → sigil→trait mapping + secondary-trait pools.
4. relink.gbf.wiki MediaWiki API (browser User-Agent required; CC BY-NC-SA,
   attribute) → summon list; equip-bonus value ranges from Nenkai's 2.0.x
   page.
5. Portraits: `https://cdn.gbf.wiki/relink/Cmn_imgchr_<id>_2.png` for the
   whole roster, downloaded and **self-hosted** in `public/portraits/`.
   Verified id map: Gran `0001`, Djeeta `0101`, then in-game order `0200`
   Katalina, `0300` Rackam, `0400` Io, `0500` Eugen, `0600` Rosetta, `0700`
   Ferry, `0800` Lancelot, `0900` Vane, `1000` Percival, `1100` Siegfried,
   `1200` Charlotta, `1300` Yodarha, `1400` Narmaya, `1500` Ghandagoza,
   `1600` Zeta, `1700` Vaseraga, `1800` Cagliostro, `1901` Id, `2100`
   Sandalphon, `2200` Seofon, `2300` Tweyen. (`2000` is Id's dragon form —
   skip.)

## 6. Character select (`/`)

Prototype = `prototype/character-select-prototype.html` (ticket 008).

- One centered window on the slash-match background: 6-column grid of square
  portrait tiles, full 23-tile roster in the order above.
- Tile = square-cropped wide art. Global framing default zoom 180% /
  y 20%, overridable per character by the catalog **y-offset** (character
  heights vary; the global pair is a compromise).
- **Signals:** gold fade strip on the name = _available_; greyed art + muted
  strip + "v2" hover note = not in v1; gold **"Saved" chip** top-right = an
  auto-save exists (possibly half-built). Signals are independent.
- **Handoff:** picking an available character scrolls the 1080-tall stage
  down one screen (~550 ms ease) while the editor fades in; the slash
  background stays fixed. Editor's "‹ Character" reverses it. The two
  screens sit on one vertical track (same route, §2).

## 7. Editor

Prototype = `prototype/editor-prototype.html` (ticket 006, resolution v2).

- **Windowed 3-page carousel** on the card's slash-match light theme.
  Column width fixed at the MT unit (⅓ of the 60% window); window per page:
  ① 40% (2 units), ② 46% (unit + 1.3-unit sigils), ③ 60% (3 units); 76% tall
  (shrunk from the prototype's 83% to fit the Generate CTA below — re-check
  the sigil stack and MT page still fit during assembly).
- Pages: ① Skills & Summons (identity col | skills, over mastery, 4 summon
  cards) · ② Gear & Sigils (identity col | weapon panel over 12 sigil rows)
  · ③ Master Traits (3 style cards, stretched snug).
- **Page flip:** whole window rolls off-screen and the next rolls in from
  the opposite side (~120 ms per leg) — never in-frame sliding or width
  tweening. Tabs above; full-height side arrow strips (edge-fade hover wash,
  glyphs 110 px from stage edges); ←/→ keys.
- Persistent identity column on ① and ② (portrait fade, Lvl chip, name
  badge, Status 2×2 read-write).
- **Trait checklist** (the tally): docks flush to the window's right edge on
  ① and ②, rolls with it; ✕ collapses to a Σ tab, state persists; absent
  on ③.
- All affordances are in-place `▾` selects / steppers per the prototype;
  numeric wrightstone levels read-only in the weapon panel ("Imbued
  Traits"), rotatable ⇄ only on Terminus slot 2.
- Spacing rhythm: heading→body 7 px, section→section 14 px.
- **Generate Card CTA** (ticket 009): a gold "Generate Card ▼" button
  centered directly under the carousel window — clicking it scrolls down to
  the card screen (§8). Always enabled; a half-built build just makes a
  sparse card.
- Every edit writes the Build (§4).

## 8. Card

Prototype = `prototype/card-prototype.html`, commit `cb18cb4` (ticket 005).

- Read-only, exactly **1920×1080**: A6 "slash match" — light theme,
  hand-tuned diagonal slash (frozen gradient values in the prototype),
  crest texture; master traits as three per-style columns on darkened
  slash-ramp panels, gold-on-blue selected cells; gear-select weapon
  showcase; example.png-style status bar.
- Contents: character w/ portrait, Status, Over Masteries, Weapon (base
  stats, 5 traits, wrightstone as "Imbued Traits"), Sigils, Summons,
  Skills, full Master Traits (3 styles × R1–3+EX).
- NOT on the card: trait tally, criteria, raw/modified stats.
- Trait icons: placeholder slots only (v1 ships no icon artwork).
- Editor and card are **deliberately separate component trees**; sharing is
  allowed only for leaf primitives that are pixel-identical (icons, stat
  cell), never layout.
- **Card screen** (ticket 009, `prototype/handoff-prototype.html`): the card
  is presented scaled to **62%** inside the editor's shared window chrome
  ("the frame") — display scaling via wrapper transform only, the card node
  itself stays 1920×1080 (§9). Header row inside the frame: "Share Card"
  title · "PNG · 1920×1080" meta · **Copy PNG** (gold primary) · **Download**
  (secondary) — export buttons keep a locked width when flashing their
  done-state. Below the frame: a "read-only — jump back up to keep editing"
  hint. "‹ Editor" top-left scrolls back up.
- **Footer:** a slim strip pinned to the bottom of the card screen marks the
  end of the page — brand · the §1 attribution line (© Cygames, Maygi,
  gbfr-logs) · GitHub link.

## 9. PNG export (ticket 003)

- **Library:** `modern-screenshot` (`domToBlob`), SVG-foreignObject
  technique. Runner-up `html-to-image` is a one-file swap if ever needed.
- Card node fixed at 1920×1080, `{ width: 1920, height: 1080, scale: 1 }`
  (pixelRatio pinned — no devicePixelRatio multiplication); on-screen
  fitting via wrapper transform only; `await document.fonts.ready` before
  capture.
- **Copy:** construct the `ClipboardItem` _synchronously_ in the click
  handler with a `Promise<Blob>` value —
  `navigator.clipboard.write([new ClipboardItem({'image/png': blobPromise})])`
  — the one pattern that satisfies Safari's transient-activation rule and
  works in Chrome/Edge/Firefox 127+/Safari 13.1+.
- **Fallback:** feature-detect; route to download with a "couldn't copy —
  downloaded instead" toast.
- **Download:** same blob → object URL → `<a download="gbfr-<char>-build.png">`.

## 10. Verify during implementation

Facts the spec inherits as "check while extracting data" (all from ticket
resolutions):

- Exact master-trait perk thresholds & option ids — MasterTraits CSV
  `Requirement` column.
- Over-mastery per-type value ranges (Nenkai) — schema bounds ATK ≤1000,
  others ≤20% until then.
- Wrightstone tier triplets (20/15/10 is modeled; ≈15/10/7 and 10/7/5 exist
  but stay unmodeled).
- Wrightstone prefix↔trait mapping (full table).
- Which generic master-trait options are truly shared across characters.
- Per-character portrait y-offsets (eyeball each of the 23 crops once).

## 11. Out of scope (v1)

HP/ATK or any stat calculation · damage-cap/% math · trait icon artwork ·
data for characters beyond Io · loadout management (named/multiple builds) ·
share URLs (PNG is the only sharing) · wrightstone lower quality tiers ·
schema migration.
