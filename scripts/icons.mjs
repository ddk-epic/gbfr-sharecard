// One-off icon pipeline: converts icons extracted from the game archive to WebP
// under public/icons/ (weapon art under public/weapons/) and writes the
// game-id -> icon-file index to src/data/icon-index.json. Results are committed;
// re-run only when the game updates. Existing files are left alone.
// Art and game data © Cygames. Source and access notes: research/icons.md.
//
//   node scripts/icons.mjs [extract-dir]
//
// The extract dir is produced by Nenkai's GBFRDataTools (MIT), which is NOT
// vendored here - it needs an installed copy of the game. To rebuild it:
//
//   GBFRDataTools extract-all -i <game>/data.i -o <dir> -f system/table/
//   GBFRDataTools extract -i <game>/data.i -o <dir> -f ui/atlas/<atlas>.wtb
//   GBFRDataTools extract -i <game>/data.i -o <dir> -f ui/atlas/<atlas>.tex.texb
//   GBFRDataTools extract-all -i <game>/data.i -o <dir> -f ui/layouts/common/image_equip/
//   GBFRDataTools b-convert -i <dir>/ui/atlas/<atlas>.tex.texb   # crops named sprites
//   GBFRDataTools tbl-to-sqlite -i <dir>/system/table -o <dir>/tables.sqlite -v 2.0.2
//
// b-convert reads each sprite's UV rect from the .texb and crops it out of the
// paired .wtb, so atlases arrive as one PNG per named sprite.

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import sharp from "sharp";
import { readTextTables } from "./msgpack.mjs";

const EXTRACT_DIR = process.argv[2] ?? "../gbfr-extract";
const ICONS_DIR = new URL("../public/icons/", import.meta.url);
const WEAPONS_DIR = new URL("../public/weapons/", import.meta.url);
const DATA_DIR = new URL("../src/data/", import.meta.url);
const WEBP_QUALITY = 88;
const WEAPON_ART_WIDTH = 512; // native is 1280px square; the card's box is far smaller

const atlas = (name) => `${EXTRACT_DIR}/ui/atlas/${name}`;
const equip = `${EXTRACT_DIR}/ui/layouts/common/image_equip/noatlastextures`;

// Each class names its sprites differently, so a class says how to turn the id
// held in the game's table into a source file, and what to call the result.
const CLASSES = [
  {
    name: "skills",
    query: "select Key, IconFileName from ability where IconFileName != ''",
    source: (icon) => `${atlas("common_icon_ability")}/cmn_icablt_pl${icon}.png`,
  },
];

// Deliberately not extracted: summon icons (common_icon_summon, keyed by game
// id rather than name - re-extract if the Summons section wants them), status
// buff icons (common_icon_status) and mastery icons (common_icon_lb/lb02).
// research/icons.md records where they live.

/**
 * `ability.Element` / `summon_info.Element`, indexed. Proven, not assumed: the
 * elemental summon series name themselves (Flame/Aqua/Light/Dark Gyre, Fire and
 * Water Spirit, Rock Golem, Furycane), and Io's skills match tmp/skills.png -
 * Freeze=1=water, Fire=0=fire, Flowery Seven=4=light. 6 is the most common
 * value because every support skill is non-elemental.
 */
const ELEMENTS = ["fire", "water", "earth", "wind", "light", "dark", "plain"];

// The round badges sit at cmn_main_symbol21..26 in element order, with plain
// off on its own at symbol35.
const SYMBOL_BY_ELEMENT = [21, 22, 23, 24, 25, 26, 35];

// The diamond sets (hud_cmnd_ablt_icon*, cmn_icablt_frame0*_*) are ordered
// plain-first, so their suffix is offset by one from the Element value.
const SPRITE_BY_ELEMENT = [1, 2, 3, 4, 5, 6, 0];

// Fixed sprites the card needs by name rather than by table lookup. Both stat
// candidates for stun ship - which reads as the stun glyph is a visual call.
const FIXED = {
  stats: ["atk01", "hp01", "crt01", "brk01", "pwr01"].map((n) => ({
    id: n.replace(/0?1$/, ""),
    file: `${atlas("common_icon_main")}/cmn_main_${n}.png`,
  })),
  // Round element badges - the shape the pause skill list uses. The game's
  // ui/data/image/elementicon points at common_icon_main, as distinct from
  // elementhudicon (-> hud_guide_command, the diamond battle-HUD set) and
  // elementweakicon (-> the cmn_main_weak* enemy weakness art).
  elements: ELEMENTS.map((name, element) => ({
    id: name,
    file: `${atlas("common_icon_main")}/cmn_main_symbol${SYMBOL_BY_ELEMENT[element]}.png`,
  })),
  // The skill diamond is composed, not a single image: a flat element-tinted
  // diamond (frame01), an ornate border (frame02) and a thin border (frame03),
  // layered with the skill artwork.
  "skill-frames": [1, 2, 3].flatMap((layer) =>
    ELEMENTS.map((name, element) => ({
      id: `frame0${layer}_${name}`,
      file: `${atlas("common_icon_ability")}/cmn_icablt_frame0${layer}_0${SPRITE_BY_ELEMENT[element]}.png`,
    })),
  ),
};

const missing = [];
const index = {};

// Every class is generated, but only settled ones are written to the committed
// index. A class joins this list once its audit is done; until then its naming
// is still moving, and indexing it would invite src/ to build on ids that are
// about to change.
const SETTLED = new Set(["traits"]);

/** Convert one PNG to WebP, skipping work already committed. */
async function convert(sourcePath, destinationUrl, resizeWidth) {
  if (!existsSync(sourcePath)) {
    missing.push(sourcePath.split("/").pop());
    return false;
  }
  if (existsSync(destinationUrl)) return true;
  let pipeline = sharp(sourcePath);
  if (resizeWidth) pipeline = pipeline.resize({ width: resizeWidth });
  await writeFile(destinationUrl, await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer());
  return true;
}

const database = new DatabaseSync(`${EXTRACT_DIR}/tables.sqlite`);
const text = await readTextTables(`${EXTRACT_DIR}/system/table/text/en`, {
  readFile,
  readdir,
});
/** The game's English name for a TXT_* key, first line only. */
const english = (key) => String(text.get(key) ?? "").split("\n")[0].trim();
// Apostrophes go before the dash pass, so the game's possessive character
// sigils read "mages-warpath" rather than "mage-s-warpath".
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ------------------------------------------------------------------ traits
// One file per *glyph*, keyed by the game's own `skill.IconId1`, with the index
// carrying trait -> glyph. 200 traits wear 79 glyphs and the sharing is
// deliberate: `02_00` is the generic offensive glyph behind 21 unrelated traits,
// `02_05` the DMG Cap glyph behind 12. Naming files after the trait wrote the
// same image out 200 times over; naming them after the glyph cannot.
//
// Sigils have no icon of their own either - `gem.SkillId1` means a sigil shows
// its primary trait's glyph, so they resolve through this same table.
const traitsDirectory = new URL("traits/", ICONS_DIR);
await mkdir(traitsDirectory, { recursive: true });

// The leading pair of `skill.IconId1` is the sigil type, and every glyph name
// carries it as a prefix so the type survives into the filename.
const GLYPH_TYPES = { "01": "basic", "02": "atk", "03": "def", "04": "supp", "05": "sp" };

// Glyphs worn by several traits, named by hand - there is no shared text to
// derive from, so what the image depicts is the only honest name. `atk-dmg-cap`
// was the DMG Cap glyph outright until later expansions hung the Celestial and
// colour variants off it, and it still reads as that.
const GLYPH_NAMES = {
  "02_00": "atk-dmg",
  "02_04": "atk-payback",
  "02_05": "atk-dmg-cap",
  "02_08": "atk-star",
  "02_09": "atk-unbound",
  "03_00": "def-star",
  "03_01": "def-shield",
  "03_02": "def-aegis",
  "03_04": "def-nimble",
  "04_01": "supp-heal",
  "04_02": "supp-cd",
  "04_03": "supp-nimble",
  "05_00": "sp-opus",
  "05_02": "sp-stout-heart",
  "05_12": "sp-crab",
};

/**
 * Character sigil glyphs are the one group with a name of their own, because
 * their traits share a title: "Mage's Aspiration", "Mage's Savvy" and "Mage's
 * Warpath" all sit on Io's `05_pl0400`, which makes it `mage`. Majority rather
 * than unanimity - Seofon's glyph also carries "Seven-Star Boundary", which
 * shares nothing with the three "Spirit Edge's ..." sigils beside it.
 *
 * Only `05_pl*`. Glyphs worn by several traits with no shared text are named in
 * GLYPH_NAMES instead - deriving one from 21 unrelated traits would mislead
 * about the other 20 - and a glyph with a single trait just takes that trait's
 * name. Either way the type prefix comes along.
 */
function glyphName(icon, names) {
  if (GLYPH_NAMES[icon]) return GLYPH_NAMES[icon];
  const type = GLYPH_TYPES[icon.slice(0, 2)];
  if (!icon.startsWith("05_pl"))
    return names.length === 1 ? `${type}-${slug(names[0])}` : icon;
  const words = names.map((name) => name.split(/\s+/));
  for (let length = Math.max(...words.map((w) => w.length)); length >= 1; length--) {
    const tally = new Map();
    for (const word of words.filter((w) => w.length >= length)) {
      const phrase = word.slice(0, length).join(" ");
      tally.set(phrase, (tally.get(phrase) ?? 0) + 1);
    }
    const [phrase, count] = [...tally].sort((a, b) => b[1] - a[1])[0] ?? [];
    // The title is possessive in all but two cases; the glyph is the character,
    // not the character's, so "Mage's" lands as `mage`.
    if (count > names.length / 2) return slug(phrase.replace(/['’]s$|s['’]$/i, ""));
  }
  return icon;
}

const glyphs = new Map();
for (const row of database
  .prepare("select Name, IconId1 from skill where IconId1 != ''")
  .all()) {
  const name = english(row.Name);
  if (!name) continue; // unnamed placeholder rows carry icons but no trait
  if (!glyphs.has(row.IconId1)) glyphs.set(row.IconId1, new Set());
  glyphs.get(row.IconId1).add(name);
}

const traits = {};
const glyphFiles = new Map();
for (const [icon, names] of glyphs) {
  const file = glyphName(icon, [...names]);
  if (glyphFiles.has(file))
    console.warn(`  glyph name clash: ${icon} and ${glyphFiles.get(file)} both -> ${file}`);
  glyphFiles.set(file, icon);
  if (
    !(await convert(
      `${atlas("common_icon_skill")}/cmn_icskill_${icon}.png`,
      new URL(`${file}.webp`, traitsDirectory),
      null,
    ))
  )
    continue;
  for (const name of names) {
    const id = slug(name);
    // Two trait names slugging alike only matters when they disagree about the
    // glyph - then one silently loses. Say so rather than ship the wrong one.
    if (traits[id] && traits[id] !== file)
      console.warn(`  slug collision: ${id} claims both ${traits[id]} and ${file}`);
    traits[id] = file;
  }
}
index.traits = traits;
console.log(
  `traits: ${Object.keys(traits).length} traits -> ${new Set(Object.values(traits)).size} glyphs`,
);

for (const { name, query, source } of CLASSES) {
  const directory = new URL(`${name}/`, ICONS_DIR);
  await mkdir(directory, { recursive: true });
  const map = {};
  for (const row of database.prepare(query).all()) {
    const [key, icon] = Object.values(row);
    if (await convert(source(icon), new URL(`${icon}.webp`, directory), null))
      map[key] = icon;
  }
  index[name] = map;
  console.log(`${name}: ${Object.keys(map).length} keys -> ${new Set(Object.values(map)).size} icons`);
}

// ---------------------------------------------------------- character art
// Variant _0 is the most complete crop (full body, legs included); the others
// are derivable from it. Two sizes ship because the grid loads all 23 at once:
// the card wants ~869px (70% of 1080, background-sized to 115%), the grid tile
// ~270px, doubled for HiDPI.
//
// NOTE: this writes public/art/, NOT public/portraits/. The committed
// portraits are the wiki's variant _2 wide art, and every character's
// portraitY is tuned to that framing - swapping the source re-frames the card,
// editor and grid, so the switch is a roster/visual decision, not this
// script's to make.
const ART_DIR = new URL("../public/art/", import.meta.url);
const CARD_ART_HEIGHT = 900;
const GRID_ART_HEIGHT = 540;
const charaRoot = `${EXTRACT_DIR}/ui/layouts/common/image_chara/noatlastextures`;

const characters = JSON.parse(
  await readFile(new URL("characters.json", DATA_DIR)),
);
await mkdir(ART_DIR, { recursive: true });
await mkdir(new URL("grid/", ART_DIR), { recursive: true });
let artCount = 0;
for (const character of characters) {
  const stem = `cmn_imgchr_${character.artId}`;
  const source = `${charaRoot}/${stem}/${stem}_0.png`;
  if (!existsSync(source)) {
    missing.push(`${stem}_0.png`);
    continue;
  }
  for (const [directory, height] of [
    [ART_DIR, CARD_ART_HEIGHT],
    [new URL("grid/", ART_DIR), GRID_ART_HEIGHT],
  ]) {
    const destination = new URL(`${character.id}.webp`, directory);
    if (existsSync(destination)) continue;
    await writeFile(
      destination,
      await sharp(source)
        .resize({ height })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer(),
    );
  }
  artCount++;
}
console.log(`art: ${artCount} characters (card + grid)`);

// ------------------------------------------------------------- weapon art
await mkdir(WEAPONS_DIR, { recursive: true });
const weapons = {};
// `Key` is the row identity (410 distinct, one per weapon incl. awakening
// steps). `WeaponId`/`WeaponId2` are cross-references into the awakening chain
// and are sparse - keying on those resolves only 75 of 410 rows.
for (const row of database
  .prepare(
    "select Key, CharaId, IconFileNameId from weapon where IconFileNameId != ''",
  )
  .all()) {
  const spriteName = `cmn_imgequ_wp${row.IconFileNameId}`;
  if (
    !(await convert(
      `${equip}/${spriteName}/${spriteName}.png`,
      new URL(`${row.IconFileNameId}.webp`, WEAPONS_DIR),
      WEAPON_ART_WIDTH,
    ))
  )
    continue;
  weapons[row.Key] = { art: row.IconFileNameId, character: row.CharaId };
}
index.weapons = weapons;
console.log(
  `weapons: ${Object.keys(weapons).length} keys -> ${new Set(Object.values(weapons).map((w) => w.art)).size} art files`,
);

// ------------------------------------------------------- fixed-name sprites
for (const [name, entries] of Object.entries(FIXED)) {
  const directory = new URL(`${name}/`, ICONS_DIR);
  await mkdir(directory, { recursive: true });
  const map = {};
  for (const { id, file } of entries)
    if (await convert(file, new URL(`${id}.webp`, directory), null)) map[id] = id;
  index[name] = map;
  console.log(`${name}: ${Object.keys(map).length} icons`);
}

const settled = Object.fromEntries(
  Object.entries(index).filter(([name]) => SETTLED.has(name)),
);
await writeFile(
  new URL("icon-index.json", DATA_DIR),
  JSON.stringify(settled, null, 2) + "\n",
);
console.log(
  `\nwrote src/data/icon-index.json: ${Object.keys(settled).join(", ")}` +
    ` (held back: ${Object.keys(index).filter((n) => !SETTLED.has(n)).join(", ")})`,
);
if (missing.length)
  console.warn(`\n${missing.length} unresolved (first 10): ${[...new Set(missing)].slice(0, 10).join(", ")}`);
