/**
 * Extracts the Master Lvl badge art to public/masterlevel/ as WebP.
 * Run: node scripts/masterlevel-images.mjs [extract-dir]
 *
 * The badge is fixed art: one diamond base (cmn_ml_base02), one baked
 * "50 + N stars" sprite per star tier (cmn_mb_num_l01..l05, a master level of
 * 51..55 selects l01..l05), plus the gold glow overlays (cmn_ml_flash01,
 * cmn_mb_fade01, cmn_mb_fade02).
 *
 * GBFRDataTools exports each tier sprite trimmed to its ink, at differing
 * sizes. This pads each back onto its full 216x192 atlas cell (the descriptor's
 * Padding says where the ink sits), so every tier ships as one interchangeable
 * tile - the card drops it in at a fixed rect, no per-sprite metrics. The base
 * and glow icons are full-frame already and are copied as-is. Art and game
 * data (c) Cygames.
 *
 * The extract dir needs the atlas cropped out of the archive:
 *
 *   GBFRDataTools extract-all -i <game>/data.i -o <dir> -f ui/atlas/common_masterlevel.
 *   GBFRDataTools b-convert -i <dir>/ui/atlas/common_masterlevel.tex.texb
 *
 * which writes the sprite PNGs and common_masterlevel.tex.yaml beside them.
 */
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const EXTRACT_DIR = process.argv[2] ?? "../gbfr-extract";
const ATLAS = `${EXTRACT_DIR}/ui/atlas/common_masterlevel`;
const DESCRIPTOR = `${ATLAS}.tex.yaml`;
const OUT_DIR = fileURLToPath(new URL("../public/masterlevel/", import.meta.url));
const QUALITY = 90;

// Atlas sprite name -> shipped basename. Tier N (N stars over 50) is level 50+N.
const BASE = { src: "cmn_ml_base02", out: "masterlevel-diamond" };
const NUMS = [1, 2, 3, 4, 5].map((n) => ({
  src: `cmn_mb_num_l0${n}`,
  out: `masterlevel-${n}`,
}));
// Gold glow overlays, full-frame like the base.
const ICONS = [
  { src: "cmn_ml_flash01", out: "masterlevel-flash" },
  { src: "cmn_mb_fade01", out: "masterlevel-fade-front" },
  { src: "cmn_mb_fade02", out: "masterlevel-fade-back" },
];

if (!existsSync(DESCRIPTOR))
  throw new Error(`no ${DESCRIPTOR} - crop the atlas first, see this file's header`);

// The descriptor's Rect is the atlas cell; Padding insets the ink within it,
// ordered left, bottom, right, top. Padding left/top is where the trimmed ink
// sits in the cell.
const lines = (await readFile(DESCRIPTOR, "utf8")).split("\n").map((l) => l.trim());
const rects = {};
for (let i = 0; i < lines.length; i++) {
  const named = /^- Name: (\S+)$/.exec(lines[i]);
  if (!named) continue;
  const field = (re) => {
    for (let j = i; j < i + 6; j++) {
      const m = re.exec(lines[j]);
      if (m) return m[1].split(",").map((v) => Number(v.trim()));
    }
    throw new Error(`${named[1]}: no ${re}`);
  };
  const [, , rectW, rectH] = field(/^Rect: (.+)$/);
  const [left, bottom, right, top] = field(/^Padding: (.+)$/);
  rects[named[1]] = { cellW: rectW, cellH: rectH, left, bottom, right, top };
}

const missing = [BASE, ...NUMS, ...ICONS].filter((s) => !(s.src in rects));
if (missing.length) throw new Error(`missing sprites: ${missing.map((s) => s.src).join(", ")}`);

const cell = { w: rects[NUMS[0].src].cellW, h: rects[NUMS[0].src].cellH };
for (const { src } of NUMS)
  if (rects[src].cellW !== cell.w || rects[src].cellH !== cell.h)
    throw new Error(`${src}: cell ${rects[src].cellW}x${rects[src].cellH} breaks ${cell.w}x${cell.h}`);

await mkdir(OUT_DIR, { recursive: true });

const png = (name) => {
  const file = `${ATLAS}/${name}.png`;
  if (!existsSync(file)) throw new Error(`no sprite ${file}`);
  return file;
};

// Base: opaque colour, lossy is fine.
await sharp(png(BASE.src)).webp({ quality: QUALITY }).toFile(`${OUT_DIR}${BASE.out}.webp`);

// Glow icons: white-on-alpha, kept lossless so the alpha stays crisp.
for (const { src, out } of ICONS)
  await sharp(png(src)).webp({ lossless: true }).toFile(`${OUT_DIR}${out}.webp`);

// Tiers: composite the trimmed ink onto a transparent full cell at its inset.
for (const { src, out } of NUMS) {
  const r = rects[src];
  await sharp({
    create: { width: cell.w, height: cell.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: png(src), left: Math.round(r.left), top: Math.round(r.top) }])
    .webp({ quality: QUALITY })
    .toFile(`${OUT_DIR}${out}.webp`);
}

console.log(
  `wrote public/masterlevel/: ${BASE.out} + ${NUMS.length} tiers (${cell.w}x${cell.h}) + ${ICONS.length} glow icons`,
);
