# Research: DOM→PNG export technique for the sharecard

Ticket: [003-dom-to-png-export](../wayfinder/tickets/003-dom-to-png-export.md)
Date: 2026-07-22

## Context that shapes the evaluation

The card is a **read-only 1920×1080 DOM subtree** rendered by React (TanStack Router + Vite static SPA on GitHub Pages). Its content is:

- CSS grid/flex tables (Over Masteries, Sigils, Wrightstone, Summons, Master Traits 3-in-1)
- Web fonts
- **One raster portrait image** — a bundled, same-origin asset
- Small placeholder icons (same-origin or inline SVG)

Two consequences narrow the problem considerably:

1. **CORS/tainted-canvas risk is near zero.** Every image is served from the app's own origin (GitHub Pages). The classic html2canvas/foreignObject failure mode — cross-origin images tainting the canvas — cannot occur unless we later hotlink third-party art (out of scope for v1).
2. **The card is a fixed-size artifact, not "whatever is on screen."** We control the node we serialize. That means we can render an *untransformed* 1920×1080 card node (off-screen or scaled for display via a CSS `transform` on a **wrapper**, which does not affect the inner node's layout size) and export that node at `pixelRatio: 1`. Exact-size export is a discipline of *our* DOM structure more than of any library.

All candidates except html2canvas and direct-canvas use the same underlying technique: clone the node, inline computed styles + fonts + images into it, serialize into an SVG `<foreignObject>`, draw that SVG onto a canvas, `canvas.toBlob('image/png')`. Fidelity is therefore "whatever the user's own browser renders" — grid, flex, border-radius, box-shadow, gradients all come for free because the real layout engine draws them.

html2canvas instead **re-implements a CSS renderer in JavaScript**, which is why it has a long tail of fidelity bugs on modern CSS.

---

## Candidate-by-candidate

### 1. `html-to-image` (bubkoo)

- **Technique:** foreignObject serialization (fork of dom-to-image).
- **Fidelity:** Excellent for grid/flex/border-radius/box-shadow (native rendering). Web fonts are embedded as data-URL `@font-face` rules; by default it walks *all* document stylesheets, which can bloat output/slow export — mitigated with the `fontEmbedCSS` / `skipFonts` options. Same-origin images inline cleanly.
- **Known risks:** A well-documented **Safari/iOS flakiness** where images or fonts are missing on the *first* invocation ([#361](https://github.com/bubkoo/html-to-image/issues/361), dom-to-image [#343](https://github.com/tsayen/dom-to-image/issues/343)); the standard workaround is to run the conversion twice and keep the second result. Safari also drops `<foreignObject>` content that lacks explicit width/height.
- **pixelRatio:** First-class `pixelRatio` option, plus `canvasWidth`/`canvasHeight` overrides. **Pitfall:** it defaults to `window.devicePixelRatio`, so a user on a 150 % Windows scale would get 2880×1620 unless we pin `pixelRatio: 1`.
- **Bundle:** ~50 kB min / **~15–16 kB min+gzip**. Zero dependencies, TypeScript, tree-shakable named exports (`toBlob`, `toPng`).
- **Maintenance (mid-2026):** Latest release **1.11.13, ~Sep 2025** (10 months old). ~1.6 M weekly downloads — the most popular of the modern foreignObject family. Issue tracker active but slow; bug issues from Mar/Apr 2026 (#578, #579) open. Cadence is "coasting, not dead."

### 2. `html2canvas` (niklasvh)

- **Technique:** JS re-implementation of CSS rendering onto canvas.
- **Fidelity:** The risky option for this card. Last release **1.4.1 is ~4 years old (2022)** and predates much of the CSS the card may use. It notably **throws on modern color functions (`oklch()`, `lab()`)** — which means it is incompatible out-of-the-box with Tailwind CSS v4 (oklch-based palette), a plausible styling choice for this project. Long-standing partial support for shadows, `object-fit`, some grid edge cases; every visual feature is only as good as its re-implementation.
- **pixelRatio:** `scale` option (defaults to `devicePixelRatio` — same pitfall, pin `scale: 1`).
- **Bundle:** ~200 kB min / **~45–48 kB min+gzip** — 3–5× the foreignObject libraries.
- **Maintenance:** Effectively **abandoned** (no npm release in 4 years). The community fork **`html2canvas-pro`** is healthy (releases within the last 3 months, ~900 k weekly downloads, fixes oklch/lab) — but it inherits the re-implemented-renderer architecture and its fidelity tail. Not worth it when native rendering is available and CORS (html2canvas's one structural advantage via proxy/foreignObject-avoidance) is a non-issue here.

### 3. `dom-to-image-more` (IDisposable)

- **Technique:** foreignObject serialization (maintained continuation of the original dom-to-image).
- **Fidelity:** Good for the same reasons as html-to-image; handles computed-style inlining with a "reduced style" diffing approach that keeps output smaller. Font embedding is less refined than html-to-image's (`fontEmbedCSS`-style control is weaker). Same Safari foreignObject caveats as the whole family.
- **pixelRatio:** No direct `pixelRatio` option; scaling is done via `width`/`height` + a `style: { transform: scale(n) … }` recipe from the README — workable but clumsier and easier to get subtly wrong for an exact-size mandate.
- **Bundle:** ~10 kB min+gzip. No TS-first API (types via bundled d.ts).
- **Maintenance (mid-2026):** Surprisingly the healthiest cadence of all: **3.10.2 released July 2026** (days ago), ~227 k weekly downloads, repo actively shepherded. But the codebase is the oldest lineage and the API is the least ergonomic for our exact-size + blob needs.

### 4. `modern-screenshot` (qq15725)

- **Technique:** foreignObject serialization — explicitly a fork of html-to-image, rewritten in TS with bug fixes and performance work.
- **Fidelity:** Same native-rendering fidelity as html-to-image, with a series of fixes the parent lacks (image/asset fetching pipeline with caching and `fetchFn`/`filter` hooks, better handling of the Safari first-render race by awaiting resource decode, `-webkit-` properties, iframes). ~2 000 stars.
- **pixelRatio:** First-class **`scale`** option plus explicit `width`/`height` — `domToBlob(node, { scale: 1, width: 1920, height: 1080, type: 'image/png' })` expresses the exact-1920×1080 requirement directly. It does *not* silently multiply by `devicePixelRatio` when `scale` is set.
- **Extras:** optional **Web Worker mode** (`createContext({ workerUrl })`) to move SVG→PNG encoding off the main thread — unnecessary for a single card but a nice escape hatch; `domToPng`/`domToBlob`/`domToCanvas` variants.
- **Bundle:** ~9–11 kB min+gzip. Zero deps, ESM, tree-shakable.
- **Maintenance (mid-2026):** **v4.7.0, Apr 16 2026**; 57 releases; commits through 2026. Smaller community than html-to-image (fewer eyes) but a faster fix cadence.

### 5. Hand-rolled SVG `foreignObject` serialization

- **Feasibility:** ~60 lines for the happy path (`XMLSerializer` → `<svg><foreignObject>` → `Image` → canvas → blob). The happy path is not the problem. The real work is what the libraries above exist for: inlining **computed styles** for every node (React class styles don't travel into a serialized SVG), embedding **web fonts** as data-URL `@font-face`, converting the portrait `<img>` to a data URL, and papering over the Safari decode race and width/height quirks.
- **Verdict:** We would re-write ~the same 10 kB the libraries ship, without their accumulated browser-quirk fixes, and own every regression across browser updates. Only justified if a dependency were unacceptable. Rejected.

### 6. Rendering the card to `<canvas>` directly

- **Feasibility:** Draw the whole card with Canvas 2D calls (or a lib like Konva). Gives *perfect* deterministic 1920×1080 output, trivial `toBlob`, no foreignObject quirks, works identically in every browser.
- **Cost:** The card stops being a DOM subtree — we'd implement layout (the grid tables, the hard Master Traits 3-in-1 compaction), text wrapping, font loading (`document.fonts.load`), and theming **twice** or move the card entirely to canvas and lose CSS, DevTools iteration, accessibility, and the "React renders the card" architecture the map already assumes. For a v1 where the card layout is still being prototyped in CSS, this doubles the hardest work item.
- **Verdict:** Rejected for v1. Worth remembering as the nuclear option if foreignObject export proves unfixably broken in some browser — the card's data model would port.

---

## Clipboard path: `navigator.clipboard.write` + `ClipboardItem`

### Support matrix (as of mid-2026)

| Browser | `write()` with `ClipboardItem({'image/png': blob})` | Notes |
|---|---|---|
| Chrome / Edge | ✅ since Chrome 66 / Edge 79 | Most permissive; PNG is a mandated format |
| Safari (macOS & iOS) | ✅ since 13.1 | Strict **transient user activation**: `write()` must be called synchronously inside the gesture handler |
| Firefox | ✅ since **127 (June 2024)** — enabled by default on all channels | Previously behind `dom.events.asyncClipboard.clipboardItem`; any 2026-era Firefox has it |

The Clipboard API spec **mandates** support for `image/png` (alongside plain text and HTML), so PNG is the one image format that is safe everywhere. All of this requires a **secure context** (HTTPS — GitHub Pages qualifies).

### Constraints and the Safari pattern

- **User gesture:** Safari (and to a lesser degree Firefox) require `clipboard.write()` to run during transient user activation. A naive `onClick = async () => { const blob = await exportCard(); await navigator.clipboard.write(...) }` **fails in Safari** — by the time the blob resolves, the activation has expired (`NotAllowedError`).
- **The fix — promise-valued ClipboardItem:** construct the `ClipboardItem` *synchronously* in the click handler and hand it a `Promise<Blob>`; the browser resolves it internally:

  ```ts
  function onCopyClick() {                        // NOT async
    const item = new ClipboardItem({
      'image/png': exportCardToPngBlob(),          // Promise<Blob>, starts now
    });
    navigator.clipboard.write([item]).then(showCopiedToast, showCopyFailedToast);
  }
  ```

  This pattern also works in Chrome (76+) and Firefox 127+, so it can be the **single code path** — no Safari branch needed. (Old Chromium <76 didn't accept promise values, but that's below any 2026 baseline.)

- **Feature detection & fallback UX:**

  ```ts
  const canCopyImage =
    typeof ClipboardItem !== 'undefined' &&
    !!navigator.clipboard?.write &&
    (ClipboardItem.supports?.('image/png') ?? true);
  ```

  If false (ancient Firefox ESR, embedded webviews, `http://` contexts): hide or disable the Copy button and lean on the **Download** button, which needs no permission and works everywhere (`URL.createObjectURL(blob)` + `<a download="sharecard.png">`). On copy *failure* at runtime (permission denied, activation expired), show a toast: "Couldn't copy — downloading instead" and trigger the download path. Download is the universal fallback; there is no reason for the user to ever hit a dead end.

- **Permissions:** Writing (as opposed to reading) does not prompt in any of the four browsers when triggered by a gesture; Firefox's paste-prompt machinery applies to `read()`, not `write()`.

### Exact 1920×1080 regardless of zoom/scale

Ingredients, independent of library choice:

1. The card node has fixed CSS dimensions `1920px × 1080px`. On-screen fitting is done by a `transform: scale(...)` on a **wrapper**, never by resizing the card itself (transforms don't change layout size, and we serialize the inner node).
2. Pass `scale: 1` (modern-screenshot) / `pixelRatio: 1` (html-to-image) explicitly — **never rely on the default**, which multiplies by `devicePixelRatio` (Windows display scaling, Retina, browser zoom).
3. Pass explicit `width: 1920, height: 1080` to the export call as a belt-and-suspenders clamp.
4. Await `document.fonts.ready` before exporting so fonts are embedded, not fallback-rendered.

---

## Recommendation

### Primary: **`modern-screenshot`** (`domToBlob`)

Rationale tied to this card:

- **Native-fidelity foreignObject rendering** covers the card's actual needs (grid/flex tables, border-radius, box-shadow, web fonts) with zero re-implementation risk; with all assets same-origin, the technique's main weakness (CORS) doesn't apply.
- **Best-expressed exact-size control:** `{ width: 1920, height: 1080, scale: 1 }` is precisely the ticket's mandate, with no devicePixelRatio surprises.
- **Actively maintained as of mid-2026** (v4.7.0, Apr 2026) while its parent html-to-image has coasted since Sep 2025; it specifically carries fixes for the Safari resource-race family of bugs that is the technique's biggest fidelity risk.
- **Smallest practical cost:** ~10 kB gzip, zero deps, ESM/TS, `domToBlob` returns exactly the `Blob` both the clipboard and download paths consume.

### Runner-up: **`html-to-image`**

Same technique, same API shape (`toBlob(node, { pixelRatio: 1, canvasWidth: 1920, canvasHeight: 1080 })`), ~10× the user base — the safer bet purely on adoption. It loses on maintenance cadence (last release ~Sep 2025, slow issue triage) and on the known first-call Safari flakiness that would need the "run twice" workaround in our own code. Because both libraries serialize the same way, **swapping between them is a one-file change** — the spec should mandate the technique (foreignObject serialization of the fixed-size card node, `scale/pixelRatio` pinned to 1) and name modern-screenshot as the implementation, with html-to-image as the sanctioned substitute if a blocking bug appears.

Explicitly rejected: `html2canvas` (abandoned; breaks on modern CSS color functions, e.g. Tailwind v4's oklch; 5× bundle for lower fidelity), `dom-to-image-more` (healthy maintenance but no direct pixelRatio control and weaker font embedding), hand-rolled foreignObject (re-writing the library minus its quirk fixes), direct canvas (duplicates the hardest layout work for a v1 whose card is still being prototyped in CSS).

### Clipboard verdict

`navigator.clipboard.write([new ClipboardItem({'image/png': blob})])` is **green across Chrome, Edge, Safari, and Firefox (127+) in 2026** for PNG specifically. The spec must mandate the **synchronous-ClipboardItem-with-Promise\<Blob\>** pattern (works in all four, required by Safari) plus feature-detected fallback to the download path — which must exist anyway per the ticket.

---

## Sources

- [modern-screenshot repo](https://github.com/qq15725/modern-screenshot) · [npm](https://www.npmjs.com/package/modern-screenshot) · [Socket analysis](https://socket.dev/npm/package/modern-screenshot)
- [html-to-image repo](https://github.com/bubkoo/html-to-image) · [releases](https://github.com/bubkoo/html-to-image/releases) · [issues](https://github.com/bubkoo/html-to-image/issues) · Safari image-missing issues [#361](https://github.com/bubkoo/html-to-image/issues/361), dom-to-image [#343](https://github.com/tsayen/dom-to-image/issues/343)
- [dom-to-image-more repo](https://github.com/IDisposable/dom-to-image-more) · [npm](https://www.npmjs.com/package/dom-to-image-more) · [Snyk health](https://security.snyk.io/package/npm/dom-to-image-more)
- [html2canvas npm](https://www.npmjs.com/package/html2canvas) · [Snyk (discontinued signal)](https://security.snyk.io/package/npm/html2canvas) · [html2canvas-pro Snyk](https://security.snyk.io/package/npm/html2canvas-pro) · [bundlephobia html2canvas](https://bundlephobia.com/package/html2canvas)
- Comparisons: [npm-compare dom-to-image/html-to-image/html2canvas](https://npm-compare.com/dom-to-image,html-to-image,html2canvas) · [portalzine: Best HTML to Canvas Solutions 2025](https://portalzine.de/best-html-to-canvas-solutions-in-2025/) · [monday.com engineering: Capturing DOM as image](https://engineering.monday.com/capturing-dom-as-image-is-harder-than-you-think-how-we-solved-it-at-monday-com/)
- Clipboard: [web.dev copy-images pattern](https://web.dev/patterns/clipboard/copy-images/) · [web.dev async-clipboard](https://web.dev/articles/async-clipboard) · [MDN Clipboard.write()](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write) · [MDN ClipboardItem](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem) · [MDN ClipboardItem.supports()](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem/supports_static) · [WebKit: Async Clipboard API](https://webkit.org/blog/10855/async-clipboard-api/) · [Rittner: Clipboard in Safari](https://wolfgangrittner.dev/how-to-use-clipboard-api-in-safari/) · [Rittner: Clipboard in Firefox](https://wolfgangrittner.dev/how-to-use-clipboard-api-in-firefox/) · [Mozilla intent-to-ship (Fx 127)](https://groups.google.com/a/mozilla.org/g/dev-platform/c/lNXj_A-Lllk) · [kian.org.uk: Safari transient activation](https://kian.org.uk/writing-to-clipboard-in-safari-transient-activation/)
- foreignObject quirks: [Safari foreignObject width/height issue](https://github.com/bkrem/react-d3-tree/issues/284) · [semisignal: rendering HTML via foreignObject](https://semisignal.com/rendering-web-content-to-image-with-svg-foreign-object/)
