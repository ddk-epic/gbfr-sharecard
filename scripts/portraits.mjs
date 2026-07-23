// One-off portrait pipeline: download the roster's wide art from cdn.gbf.wiki,
// resize to 1080px tall, re-encode as WebP (alpha kept) and self-host under
// public/portraits/. Results are committed; re-run only when the roster
// changes. Existing files are left alone. Art © Cygames.
//
//   node scripts/portraits.mjs

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import sharp from "sharp";

const OUT_DIR = new URL("../public/portraits/", import.meta.url);
const PORTRAIT_HEIGHT = 1080;
const WEBP_QUALITY = 82;

const characters = JSON.parse(
  await readFile(new URL("../src/data/characters.json", import.meta.url)),
);

await mkdir(OUT_DIR, { recursive: true });

for (const character of characters) {
  const destination = new URL(`${character.id}.webp`, OUT_DIR);
  if (existsSync(destination)) {
    console.log(`skip ${character.id} (exists)`);
    continue;
  }
  // Some CDN .png files are broken transcodes (Sandalphon's is truncated at
  // exactly 10 MB), so decode-check each candidate and fall back to .webp.
  let sourceBuffer = null;
  for (const extension of ["png", "webp"]) {
    const url = `https://cdn.gbf.wiki/relink/Cmn_imgchr_${character.artId}_2.${extension}`;
    const response = await fetch(url);
    if (!response.ok) continue;
    try {
      const buffer = Buffer.from(await response.arrayBuffer());
      await sharp(buffer).stats();
      sourceBuffer = buffer;
      break;
    } catch {
      console.warn(`bad  ${character.id}.${extension} - trying next`);
    }
  }
  if (!sourceBuffer) {
    console.error(`FAIL ${character.id}: no decodable source`);
    continue;
  }
  const webpBuffer = await sharp(sourceBuffer)
    .resize({ height: PORTRAIT_HEIGHT })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  await writeFile(destination, webpBuffer);
  console.log(
    `ok   ${character.id}  ${(sourceBuffer.length / 1e6).toFixed(1)}MB -> ${(webpBuffer.length / 1e3).toFixed(0)}KB`,
  );
}
