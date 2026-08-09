/**
 * Extracts the PWR badge diamond base to public/pwr/ as WebP.
 * Run: node scripts/pwr-images.mjs [extract-dir]
 *
 * The PWR badge is the overall Power rating: one diamond base
 * (ps_cmn_icon_base02, from pause_pause_common) with the sword-and-shield crest
 * (cmn_main_pwr01) riding its top vertex. The crest already ships as the "power"
 * stat icon (public/icons/stats/power.webp, see scripts/icons.mjs), so only the
 * base is written here. Art and game data (c) Cygames.
 *
 * The extract dir needs the atlas cropped out of the archive:
 *
 *   GBFRDataTools extract -i <game>/data.i -o <dir> -f ui/atlas/pause_pause_common.wtb
 *   GBFRDataTools extract -i <game>/data.i -o <dir> -f ui/atlas/pause_pause_common.tex.texb
 *   GBFRDataTools b-convert -i <dir>/ui/atlas/pause_pause_common.tex.texb
 *
 * which writes the sprite PNGs beside the atlas.
 */
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const EXTRACT_DIR = process.argv[2] ?? "../gbfr-extract";
const ATLAS = `${EXTRACT_DIR}/ui/atlas/pause_pause_common`;
const OUT_DIR = fileURLToPath(new URL("../public/pwr/", import.meta.url));
const QUALITY = 90;

const BASE = { src: "ps_cmn_icon_base02", out: "pwr-diamond" };

const source = `${ATLAS}/${BASE.src}.png`;
if (!existsSync(source))
  throw new Error(`no ${source} - crop the atlas first, see this file's header`);

await mkdir(OUT_DIR, { recursive: true });
const meta = await sharp(source).metadata();
await sharp(source).webp({ quality: QUALITY }).toFile(`${OUT_DIR}${BASE.out}.webp`);

console.log(`wrote public/pwr/${BASE.out}.webp (${meta.width}x${meta.height})`);
