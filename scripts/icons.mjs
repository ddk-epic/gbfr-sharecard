// One-off icon pipeline: converts icons extracted from the game archive to WebP
// under public/icons/ (weapon art under public/weapons/) and writes the
// game-id -> icon-file index to src/data/icon-index.json. Results are committed;
// re-run only when the game updates. Existing files are left alone.
// Art and game data © Cygames. Archive access: docs/archive.md.
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
// Native is 320px square. The card draws a skill at 20px (`Diamond`, size-5) and
// exports at pixelRatio 1, and the editor shows no icon at all - 128 leaves the
// diamond a lot of room to grow before it softens.
const SKILL_ICON_WIDTH = 128;

const atlas = (name) => `${EXTRACT_DIR}/ui/atlas/${name}`;
const equip = `${EXTRACT_DIR}/ui/layouts/common/image_equip/noatlastextures`;

// The game calls Gran and Djeeta both "The Captain" - it does not name them
// apart at all - so the one distinction it declines to make is made here.
const SKILL_CHARACTERS = { "0000": "gran", "0100": "djeeta" };

// Deliberately not extracted: summon icons (common_icon_summon, keyed by game
// id rather than name - re-extract if the Summons section wants them), status
// buff icons (common_icon_status) and mastery icons (common_icon_lb/lb02).
// docs/archive.md records where they live and the hash workaround summon icons
// need.
//
// The skill diamond frames (cmn_icablt_frame0*) are gameplay UI, not menu UI -
// the card is a menu surface, so they do not belong on it.

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

// Fixed sprites the card needs by name rather than by table lookup.
const FIXED = {
  // Named in the card's language, not the atlas's abbreviations - the sprite is
  // `cmn_main_brk01` but the stat is Stun Power, and nothing about "brk" says
  // so. `power` is the odd one: an ornate crest at twice the resolution, the
  // menus' overall Power rating badge rather than a stat glyph, so it has no
  // Status row to sit in.
  stats: [
    ["hp", "hp01"],
    ["atk", "atk01"],
    ["crit", "crt01"],
    ["stun", "brk01"],
    ["power", "pwr01"],
  ].map(([id, sprite]) => ({
    id,
    file: `${atlas("common_icon_main")}/cmn_main_${sprite}.png`,
  })),
  // Round element badges - the shape the pause skill list uses. The game's
  // ui/data/image/elementicon points at common_icon_main, as distinct from
  // elementhudicon (-> hud_guide_command, the diamond battle-HUD set) and
  // elementweakicon (-> the cmn_main_weak* enemy weakness art).
  elements: ELEMENTS.map((name, element) => ({
    id: name,
    file: `${atlas("common_icon_main")}/cmn_main_symbol${SYMBOL_BY_ELEMENT[element]}.png`,
  })),
};

const missing = [];
const index = {};

// Every class is generated, but only settled ones are written to the committed
// index. A class joins this list once its audit is done; until then its naming
// is still moving, and indexing it would invite src/ to build on ids that are
// about to change.
const SETTLED = new Set(["traits"]);

// The atlas exports each trait glyph as a 128x128 opaque tile centred in a
// larger, mostly-transparent canvas - 137 for the generic glyphs, 160 for the
// character sigils' 05_pl* tiles. Cropping back to the opaque tile ships every
// glyph at one size; the only pixels dropped are the antialiased feather that
// bleeds outside it.
async function solidGlyphBox(sourcePath) {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width,
    minY = height,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * channels + 3] >= 128) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * A bonus sprite hangs a small "up" arrow off its box's bottom-right corner, so
 * the box sits above-left of the sprite's own centre - centre the raw sprite and
 * the box floats off the text. Re-canvas onto a square with the box centred and
 * the arrow overhanging into transparent margin, so the card centres the file
 * and the box lands on the text. The box's right and bottom edges are read off a
 * top-left band the arrow never reaches.
 */
async function centeredBonusCanvas(sourcePath) {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const opaque = (x, y) => data[(y * width + x) * channels + 3] >= 128;
  let cL = width,
    cT = height,
    cR = -1,
    cB = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (opaque(x, y)) {
        if (x < cL) cL = x;
        if (x > cR) cR = x;
        if (y < cT) cT = y;
        if (y > cB) cB = y;
      }
  const band = 18;
  const hasInk = (pixels) => pixels.some((on) => on);
  let boxR = cL;
  for (let x = width - 1; x >= 0; x--) {
    const col = [];
    for (let y = cT; y <= cT + band; y++) col.push(opaque(x, y));
    if (hasInk(col)) { boxR = x; break; }
  }
  let boxB = cT;
  for (let y = height - 1; y >= 0; y--) {
    const row = [];
    for (let x = cL; x <= cL + band; x++) row.push(opaque(x, y));
    if (hasInk(row)) { boxB = y; break; }
  }
  const boxW = boxR - cL + 1;
  const boxH = boxB - cT + 1;
  const side = Math.max(boxW + 2 * (cR - boxR), boxH + 2 * (cB - boxB));
  const left = Math.round((side - boxW) / 2) - cL;
  const top = Math.round((side - boxH) / 2) - cT;
  return sharp({
    create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: sourcePath, left, top }])
    .png()
    .toBuffer();
}

/** Convert one PNG to WebP, skipping work already committed. */
async function convert(sourcePath, destinationUrl, resizeWidth, cropToGlyph = false) {
  if (!existsSync(sourcePath)) {
    missing.push(sourcePath.split("/").pop());
    return false;
  }
  if (existsSync(destinationUrl)) return true;
  let pipeline = sharp(sourcePath);
  if (cropToGlyph) pipeline = pipeline.extract(await solidGlyphBox(sourcePath));
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
// Accents and apostrophes both go before the dash pass, or the dash pass eats
// them as separators: "Königsschild" would slug to "k-nigsschild" and the
// game's possessive character sigils to "mage-s-warpath".
// Duplicated verbatim in scripts/extract.mjs - the icon index and the catalog
// are keyed by this, and they only join because the two agree. Change both.
const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
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
      true,
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

// ------------------------------------------------------------------ bonus
// public/icons/bonus/<bonus-type-id>.webp - the over-mastery and summon equip
// bonus glyphs, `cmn_iclb_s_*` in common_icon_lb. The stat -> sprite pairing is
// in no table; it is read out of the meditation UI image descriptors and
// recorded in docs/overmasteries.md, the source for this hand-authored map. The
// bonus-type id is already a slug, so the card builds the path and needs no index.
const bonusDirectory = new URL("bonus/", ICONS_DIR);
await mkdir(bonusDirectory, { recursive: true });
const BONUS_SPRITES = {
  "attack-power-up": "s_01",
  "health-up": "s_02",
  "critical-hit-rate-up": "s_03",
  "stun-power-up": "s_04",
  "skill-damage-up": "s_08",
  "skybound-art-damage-up": "s_06",
  "chain-burst-damage-up": "s_07",
  "normal-attack-damage-cap-up": "s_11",
  "skill-damage-cap-up": "s_13",
  "skybound-art-damage-cap-up": "s_14",
  "skill-healing-cap-up": "s_15",
};
let bonusCount = 0;
for (const [id, sprite] of Object.entries(BONUS_SPRITES)) {
  const source = `${atlas("common_icon_lb")}/cmn_iclb_${sprite}.png`;
  const destination = new URL(`${id}.webp`, bonusDirectory);
  if (!existsSync(source)) {
    missing.push(`${sprite}.png`);
    continue;
  }
  if (!existsSync(destination))
    await writeFile(
      destination,
      await sharp(await centeredBonusCanvas(source))
        .webp({ quality: WEBP_QUALITY })
        .toBuffer(),
    );
  bonusCount++;
}
console.log(`bonus: ${bonusCount} bonus types`);

// ------------------------------------------------------------------ skills
// public/icons/skills/<character>/<skill>.webp. Both halves come from the game
// and the card already holds both - the character, and `skill.id` out of
// src/data/characters/<character>.json, which is the name slug - so it builds
// the path itself and skills need no index at all.
//
// The character in the path is what settles Gran and Djeeta: they have their
// own art for 7 of the captain's 16 skills and share the other 9. Djeeta's
// folder gets all 16, nine of them copies of Gran's file, and nothing
// downstream has to know which is which. The copies cost ~55K.
//
// `ReqCharaId1` is the owner, not the icon's prefix - Djeeta's Phalanx row
// points at Gran's `0000_03` art, so keying the folder off the filename would
// file her shared skills under him.
const skillsDirectory = new URL("skills/", ICONS_DIR);
const characterName = new Map();
for (const row of database.prepare("select * from chara").all()) {
  const id = Object.values(row).find((v) => typeof v === "string" && /^PL\d{4}$/.test(v));
  const name = english(row.CharaName);
  if (id && name) characterName.set(id.slice(2), SKILL_CHARACTERS[id.slice(2)] ?? slug(name));
}

let skillCount = 0;
for (const row of database
  .prepare(
    // PL2000 is excluded: `chara` gives it CharaName "Id" with an empty
    // IconFileName and Id's own Skybound Art, so it is his second form rather
    // than a character. 2400-2900 stay - DLC characters the game already names
    // (Gallanza, Maglielle, Beatrix, Eustace, Fraux, Fediel).
    `select IconFileName, ReqCharaId1, Unk5 from ability
     where IconFileName != '' and IconFileName not like '2000%'`,
  )
  .all()) {
  // Unnamed rows are the NPC copies (AB_NP*), which carry art but no skill.
  const name = english(row.Unk5);
  const character = characterName.get(row.ReqCharaId1.slice(2));
  if (!name || !character) continue;
  const directory = new URL(`${character}/`, skillsDirectory);
  await mkdir(directory, { recursive: true });
  if (
    await convert(
      `${atlas("common_icon_ability")}/cmn_icablt_pl${row.IconFileName}.png`,
      new URL(`${slug(name)}.webp`, directory),
      SKILL_ICON_WIDTH,
    )
  )
    skillCount++;
}
console.log(`skills: ${skillCount} rows -> ${(await readdir(skillsDirectory)).length} character folders`);

// ---------------------------------------------------------- character art
// Variant _0 is the whole illustration - the wiki's _2 is this same art cropped
// mid-shin onto a wider canvas - so every other framing derives from it and
// only this one ships. A grid or portrait crop is regenerated from the archive
// when its size is settled, not stored alongside.
//
// 900px against a 3608x3660 native: the card's box draws it at 869 (70% of
// 1080, background-sized to 115%), so this is the tallest anything needs today.
//
// NOTE: this writes public/art/, NOT public/portraits/. The committed portraits
// are the wiki's _2, and every character's portraitY is hand-tuned to that
// framing - swapping the source re-frames the card, editor and grid, so the
// switch is a visual decision, not this script's to make.
const ART_DIR = new URL("../public/art/", import.meta.url);
const CARD_ART_HEIGHT = 900;
const charaRoot = `${EXTRACT_DIR}/ui/layouts/common/image_chara/noatlastextures`;

const characters = JSON.parse(
  await readFile(new URL("characters.json", DATA_DIR)),
);
await mkdir(ART_DIR, { recursive: true });
let artCount = 0;
for (const character of characters) {
  const stem = `cmn_imgchr_${character.artId}`;
  const source = `${charaRoot}/${stem}/${stem}_0.png`;
  if (!existsSync(source)) {
    missing.push(`${stem}_0.png`);
    continue;
  }
  const destination = new URL(`${character.id}.webp`, ART_DIR);
  if (!existsSync(destination))
    await writeFile(
      destination,
      await sharp(source)
        .resize({ height: CARD_ART_HEIGHT })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer(),
    );
  artCount++;
}
console.log(`art: ${artCount} characters`);

// ---------------------------------------------------------- summon icons
// public/icons/summon/<id>.webp - the equipped-summon portraits, diamond-cropped
// menu art. summon_info keys each by IconIdMaybe (the cmn_icsmn_<hex> sprite) and
// names it via a TXT_SMN_* key; the name slug is our summon id, so the card
// builds the path and needs no index. Only the catalog's 74 ship; the game's few
// story-only summons (Proto Bahamut, Excavallion) are not equippable. Names span
// two lines in the table, so they are joined with a space, not truncated to the
// first line like the single-line names english() handles.
const summonsDirectory = new URL("summon/", ICONS_DIR);
await mkdir(summonsDirectory, { recursive: true });
const summonName = (key) => String(text.get(key) ?? "").replace(/\s+/g, " ").trim();
const summonCatalog = JSON.parse(await readFile(new URL("summons.json", DATA_DIR)));
const summonIds = new Set(summonCatalog.map((s) => s.id));
const summonsSeen = new Set();
for (const row of database
  .prepare("select IconIdMaybe, SummonName from summon_info where IconIdMaybe != ''")
  .all()) {
  const id = slug(summonName(row.SummonName));
  if (!summonIds.has(id)) continue;
  if (
    await convert(
      `${atlas("common_icon_summon")}/cmn_icsmn_${row.IconIdMaybe}.png`,
      new URL(`${id}.webp`, summonsDirectory),
      null,
    )
  )
    summonsSeen.add(id);
}
const summonsMissing = [...summonIds].filter((id) => !summonsSeen.has(id));
console.log(`summons: ${summonsSeen.size}/${summonIds.size} portraits`);
if (summonsMissing.length)
  console.warn(`  no icon for: ${summonsMissing.join(", ")}`);

// ------------------------------------------------------------- weapon art
// public/weapons/<character>/<weapon>.webp - the same derived path as skills,
// so the card reaches art from the character plus the weapon id, which is the
// name slug. No index entry for the same reason.
//
// Only transcendable rows ship. `WeaponSkillLevelRebuildId1` is present solely
// on a weapon's final form, which is what a maxed build holds: for Ascension
// and Terminus that is the awakened row, so the file is named
// "gambanteinn-staff-of-hope" rather than "gambanteinn". The intermediate
// awakening rows and the un-awakened base carry the same art anyway - only
// three weapons in the game re-art on awakening. See
// docs/weapons.md.
// GBFRDataTools cannot always reverse a string hash, so a few rows carry
// `Name` as "DA853EF8" where their siblings carry "TXT_WEP_NAME_PL2900_04".
// The text table does hold the entry, under the readable key - deriving it from
// the row's own Key is what brings Fediel's Defender ("Hedera") back.
const weaponName = (row) =>
  english(/^[0-9A-F]{8}$/.test(row.Name) ? `TXT_WEP_NAME_${row.Key.slice(4)}` : row.Name);

const seenWeapon = new Map();
for (const row of database
  .prepare(
    `select Key, Name, CharaId, IconFileNameId from weapon
     where IconFileNameId != '' and WeaponSkillLevelRebuildId1 != ''`,
  )
  .all()) {
  const name = weaponName(row);
  const character = characterName.get(row.CharaId.slice(2));
  if (!name || !character) continue;
  const id = `${character}/${slug(name)}`;
  // `_A0`/`_A1` rows repeat a weapon verbatim - same name, same art - so they
  // collapse. Two rows sharing a name but not art would be a real clash.
  if (seenWeapon.has(id)) {
    if (seenWeapon.get(id) !== row.IconFileNameId)
      console.warn(`  weapon clash: ${id} is both ${seenWeapon.get(id)} and ${row.IconFileNameId}`);
    continue;
  }
  const directory = new URL(`${character}/`, WEAPONS_DIR);
  await mkdir(directory, { recursive: true });
  const sprite = `cmn_imgequ_wp${row.IconFileNameId}`;
  if (
    await convert(
      `${equip}/${sprite}/${sprite}.png`,
      new URL(`${slug(name)}.webp`, directory),
      WEAPON_ART_WIDTH,
    )
  )
    seenWeapon.set(id, row.IconFileNameId);
}
console.log(
  `weapons: ${seenWeapon.size} weapons across ${(await readdir(WEAPONS_DIR)).length} characters`,
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
