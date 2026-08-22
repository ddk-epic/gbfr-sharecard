// Create a new character's catalog file from the game archive in one pass.
//   node scripts/new-character.mjs <character-id> [extract-dir] [--write]
//
// Writes src/catalog/characters/<id>.json with id, skills, weapons,
// weaponHpOffset and weaponSignatureTrait - everything skills.mjs and
// weapons.mjs derive from the archive, without their side effect of
// rewriting every other already-committed character file.
//
// <character-id> must already have a row in characters.json (artId,
// playerId). Refuses to touch a file that already exists - re-run
// skills.mjs / weapons.mjs --write instead to refresh an existing one.
//
// masterTraits is not written here - it's hand-transcribed from screenshots
// per docs/master-traits.md and is not in the archive in usable form.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { readTextTables } from "./msgpack.mjs";

const id = process.argv[2];
if (!id) {
  console.error("usage: node scripts/new-character.mjs <character-id> [extract-dir] [--write]");
  process.exit(1);
}
const EXTRACT = process.argv[3]?.startsWith("--") ? "../gbfr-extract" : (process.argv[3] ?? "../gbfr-extract");
const WRITE = process.argv.includes("--write");
const DATA = new URL("../src/catalog/", import.meta.url);
const ICONS_DIR = new URL("../public/icons/skills/", import.meta.url);
const OUT_FILE = new URL(`characters/${id}.json`, DATA);

// Duplicated verbatim from icons.mjs/extract.mjs/skills.mjs/weapons.mjs -
// the icon filename and the catalog id only join because every script slugs
// a name the same way.
const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Duplicated verbatim from icons.mjs/skills.mjs - `ability.Element` indexes
// into this, same order icons.mjs extracted public/icons/elements/ in.
const ELEMENTS = ["fire", "water", "earth", "wind", "light", "dark", "plain"];

const text = await readTextTables(`${EXTRACT}/system/table/text/en`, { readFile, readdir });
const en = (k) => String(text.get(k) ?? "").split("\n")[0].trim();
const db = new DatabaseSync(`${EXTRACT}/tables.sqlite`);

const characters = JSON.parse(await readFile(new URL("characters.json", DATA)));
const character = characters.find((c) => c.id === id);
if (!character) throw new Error(`${id} has no row in characters.json - add one first`);

try {
  await readFile(OUT_FILE);
  throw new Error(`characters/${id}.json already exists - refresh it with skills.mjs / weapons.mjs --write instead`);
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

// ------------------------------------------------------------------ skills
const skills = [];
for (const row of db
  .prepare(
    `select ReqCharaId1, Unk5, Element from ability
     where IconFileName != '' and IconFileName not like '2000%' and ReqCharaId1 = ?`,
  )
  .all(character.playerId)) {
  const name = en(row.Unk5);
  if (!name) continue;
  const skillId = slug(name);
  if (skills.some((s) => s.id === skillId)) continue;
  skills.push({ id: skillId, name, element: ELEMENTS[row.Element] });
}
if (!skills.length) throw new Error(`no archive skills found for ${id} (playerId ${character.playerId})`);

let iconFiles;
try {
  iconFiles = await readdir(new URL(`${id}/`, ICONS_DIR));
} catch {
  iconFiles = null;
}
if (iconFiles) {
  const iconIds = new Set(iconFiles.map((f) => f.replace(/\.webp$/, "")).sort());
  const gotIds = new Set(skills.map((s) => s.id));
  const missingIcon = [...gotIds].filter((sid) => !iconIds.has(sid));
  const missingSkill = [...iconIds].filter((sid) => !gotIds.has(sid));
  if (missingIcon.length || missingSkill.length)
    throw new Error(
      `${id}: mismatch vs public/icons/skills/${id}/` +
        (missingIcon.length ? ` - no icon for: ${missingIcon.join(", ")}` : "") +
        (missingSkill.length ? ` - no archive skill for: ${missingSkill.join(", ")}` : ""),
    );
} else {
  console.warn(`no public/icons/skills/${id}/ folder yet - skipping the icon cross-check`);
}

// ----------------------------------------------------------------- weapons
const traits = JSON.parse(await readFile(new URL("traits.json", DATA)));
const traitIdByName = new Map(traits.map((t) => [t.name, t.id]));
const skillName = new Map();
for (const r of db.prepare("select Key,Name from skill").all()) skillName.set(r.Key, en(r.Name));
const traitId = (skillKey) => traitIdByName.get(skillName.get(skillKey) ?? skillKey) ?? skillKey;

const slugByArtId = new Map(characters.map((c) => [c.artId, c.id]));
const charaSlug = (charaId) => slugByArtId.get(charaId.replace(/^PL/, "")) ?? null;

const RUNGS = [
  "Transcension0SkillLevel", "Transcension1SkillLevel", "Transcension2SkillLevel",
  "Transcension3SkillLevel", "Transcension4SkillLevel", "Transcension5SkillLevel",
  "Unk7", "Transcension6SkillLevel",
];
const slotGroup = db.prepare("select * from weapon_skill_level_rebuild where Unk13=?");
const maxLevel = db.prepare("select Attack,Hp from weapon_status where Key=? order by Level desc limit 1");
const sumTable = (table) => db.prepare(`select * from ${table} where Key=?`);
const awakeSum = sumTable("weapon_status_awake");
const rebuildSum = sumTable("weapon_status_rebuild");
const plusSum = sumTable("weapon_status_plus");
const sum = (rows, atkCol) => rows.reduce(
  (a, r) => ({ atk: a.atk + (r[atkCol] ?? 0), hp: a.hp + (r.Hp ?? 0) }), { atk: 0, hp: 0 });

// Post-launch characters (Sandalphon, Seofon, Tweyen, Gallanza, Maglielle,
// Fraux, Fediel) carry four series, not six - no Stunner, no Executioner -
// and their Defender leads with Greater Aegis instead of HP. Same ATK/HP
// ladders as the base-roster Defender otherwise, so hpOffset still works
// unmodified. See docs/weapons.md#post-launch-characters.
const SERIES = {
  "HP": "defender", "Greater Aegis": "defender", "Stun Power": "stunner",
  "Critical Hit Rate": "stinger", "Weak Point DMG": "executioner",
  "ATK": "ascension", "Catastrophe Nova": "terminus",
};
const SERIES_ORDER = ["defender", "stunner", "stinger", "executioner", "ascension", "terminus"];
const POST_LAUNCH_SERIES_ORDER = ["defender", "stinger", "ascension", "terminus"];
const AWAKENS = new Set(["ascension", "terminus"]);

const transcendable = db
  .prepare("select * from weapon where IconFileNameId!='' and WeaponSkillLevelRebuildId1!=''")
  .all();

const seriesOf = (w) => {
  const lead = skillName.get(slotGroup.all(w.WeaponSkillLevelRebuildId1)[0]?.Unk12);
  return SERIES[lead] ?? null;
};

const chainRow0 = db.prepare(
  "select * from weapon where CharaId=? and IconFileNameId=? and LastAwakeningLevel=0");

function maxedStats(w, seriesId) {
  const ladderKey = AWAKENS.has(seriesId)
    ? chainRow0.get(w.CharaId, w.IconFileNameId).Key
    : w.Key;
  const base = maxLevel.get(ladderKey);
  const awake = sum(awakeSum.all(w.WeaponStatusAwakeId), "AttackGain");
  const rebuild = sum(rebuildSum.all(w.WeaponStatusRebuildId), "Attack");
  const plus = sum(plusSum.all(w.WeaponStatusPlusId), "Attack");
  return {
    atk: base.Attack + awake.atk + rebuild.atk + plus.atk,
    hp: base.Hp + awake.hp + rebuild.hp + plus.hp,
  };
}

// Zeta, hp offset 0 - see docs/weapons.md.
const ANCHOR = "PL1600";
const anchorWeapons = transcendable.filter((w) => w.CharaId === ANCHOR);
const anchorHpBySeries = {};
for (const seriesId of SERIES_ORDER) {
  const w = anchorWeapons.find((x) => seriesOf(x) === seriesId);
  if (!w) throw new Error(`anchor missing series ${seriesId}`);
  anchorHpBySeries[seriesId] = maxedStats(w, seriesId).hp;
}

const wname = (r) => en(/^[0-9A-F]{8}$/.test(r.Name) ? `TXT_WEP_NAME_${r.Key.slice(4)}` : r.Name);
function weaponNames(w, seriesId) {
  const awakened = wname(w);
  if (!AWAKENS.has(seriesId)) return { name: awakened };
  const base = chainRow0.get(w.CharaId, w.IconFileNameId);
  return { name: base ? wname(base) : awakened, awakened };
}

const mine = transcendable.filter((w) => charaSlug(w.CharaId) === id);
if (!mine.length) throw new Error(`no weapon rows found for ${id} (playerId ${character.playerId})`);
const weapons = {};
let weaponHpOffset = null;
let weaponSignatureTrait = null;
for (const seriesId of SERIES_ORDER) {
  const w = mine.find((x) => seriesOf(x) === seriesId);
  if (!w) continue;
  weapons[seriesId] = weaponNames(w, seriesId);
  if (seriesId !== "terminus") {
    const off = maxedStats(w, seriesId).hp - anchorHpBySeries[seriesId];
    if (weaponHpOffset === null) weaponHpOffset = off;
    else if (weaponHpOffset !== off)
      throw new Error(`${id} hpOffset disagrees: ${weaponHpOffset} vs ${off} (${seriesId})`);
  }
  if (AWAKENS.has(seriesId)) {
    const sig = traitId(slotGroup.all(w.WeaponSkillLevelRebuildId2).at(-1).Unk12);
    if (weaponSignatureTrait && weaponSignatureTrait !== sig)
      throw new Error(`${id} signature disagrees`);
    weaponSignatureTrait = sig;
  }
}
// Full six-series roster, or the post-launch four (defender/stinger/
// ascension/terminus) - anything else is a partial archive match worth
// failing loudly on rather than writing a half-populated file.
const foundSeries = Object.keys(weapons);
const isFullRoster = SERIES_ORDER.every((s) => foundSeries.includes(s));
const isPostLaunchRoster =
  foundSeries.length === POST_LAUNCH_SERIES_ORDER.length &&
  POST_LAUNCH_SERIES_ORDER.every((s) => foundSeries.includes(s));
if (!isFullRoster && !isPostLaunchRoster)
  throw new Error(`${id}: only found series ${foundSeries.join("/")}`);

// ---------------------------------------------------------------- write all
const catalog = {
  id,
  skills,
  weapons,
  weaponHpOffset,
  ...(weaponSignatureTrait ? { weaponSignatureTrait } : {}),
};

// keep the hand-authored layout: one skill/weapon per line, not one key per line
const serialize = (value) =>
  JSON.stringify(value, null, 2).replace(
    /\{\n\s*([^{}[\]]+?)\n\s*\}/g,
    (_, body) => `{ ${body.trim().replace(/\s*\n\s*/g, " ")} }`,
  ) + "\n";

console.log(`${id}: ${skills.length} skills, weapons ${Object.keys(weapons).join("/")}`);
console.log(`  hpOffset ${weaponHpOffset}, signature ${weaponSignatureTrait}`);
console.log(serialize(catalog));

if (WRITE) {
  await writeFile(OUT_FILE, serialize(catalog));
  console.log(`\nwrote characters/${id}.json - masterTraits still needs hand-transcribing`);
} else {
  console.log("\n(dry run - pass --write to create the file)");
}
