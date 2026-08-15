// Generate the weapon catalog from the game archive.
//   node scripts/weapons.mjs [extract-dir] [--write]
//
// Emits (with --write):
//   src/catalog/weapon-series.json  - one row per base series: id, name, atk, hp, slots[5]
//   src/catalog/weapon-levels.json  - named per-step level sequences, referenced by slots
//   patches src/catalog/characters/<id>.json in place with weapons / hpOffset / signatureTrait
//
// atk/hp are the MAXED totals (level 150 + awakening + transcendence + plus), hp at a
// zero-offset character (Zeta); per-character hp is series.hp + character.hpOffset.
// See docs/weapons.md - every number below is cross-checked against it before writing.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { readTextTables } from "./msgpack.mjs";

const EXTRACT = process.argv[2]?.startsWith("--")
  ? "../gbfr-extract"
  : (process.argv[2] ?? "../gbfr-extract");
const WRITE = process.argv.includes("--write");
const DATA = new URL("../src/catalog/", import.meta.url);

const text = await readTextTables(`${EXTRACT}/system/table/text/en`, { readFile, readdir });
const en = (k) => String(text.get(k) ?? "").split("\n")[0].trim();
const db = new DatabaseSync(`${EXTRACT}/tables.sqlite`);

// --- trait id resolution: skill Key -> English name -> traits.json slug ---------------
const traits = JSON.parse(await readFile(new URL("traits.json", DATA)));
const traitIdByName = new Map(traits.map((t) => [t.name, t.id]));
const skillName = new Map();
for (const r of db.prepare("select Key,Name from skill").all()) skillName.set(r.Key, en(r.Name));

const missing = new Set();
const traitId = (skillKey) => {
  const name = skillName.get(skillKey) ?? skillKey;
  const id = traitIdByName.get(name);
  if (!id) missing.add(`${skillKey} = ${JSON.stringify(name)}`);
  return id ?? skillKey;
};

// --- character slug by CharaId (PL0400 -> artId 0400 -> characters.json) ---------------
const characters = JSON.parse(await readFile(new URL("characters.json", DATA)));
const slugByArtId = new Map(characters.map((c) => [c.artId, c.id]));
const charaSlug = (charaId) => slugByArtId.get(charaId.replace(/^PL/, "")) ?? null;

// --- the 8-rung ladder: first 8 physical columns of weapon_skill_level_rebuild --------
// Transcension0..5, then Unk7 (the rung the headers leave unnamed), then Transcension6
// which carries the T7 value. The last three columns are zero on referenced rows.
const RUNGS = [
  "Transcension0SkillLevel", "Transcension1SkillLevel", "Transcension2SkillLevel",
  "Transcension3SkillLevel", "Transcension4SkillLevel", "Transcension5SkillLevel",
  "Unk7", "Transcension6SkillLevel",
];
const rungs = (row) => RUNGS.map((c) => row[c]);

const slotGroup = db.prepare("select * from weapon_skill_level_rebuild where Unk13=?");

// --- maxed stats: level 150 + summed awakening + summed transcendence + summed plus ----
const maxLevel = db.prepare("select Attack,Hp from weapon_status where Key=? order by Level desc limit 1");
const sumTable = (table) => db.prepare(`select * from ${table} where Key=?`);
const awakeSum = sumTable("weapon_status_awake");
const rebuildSum = sumTable("weapon_status_rebuild");
const plusSum = sumTable("weapon_status_plus");
const sum = (rows, atkCol) => rows.reduce(
  (a, r) => ({ atk: a.atk + (r[atkCol] ?? 0), hp: a.hp + (r.Hp ?? 0) }), { atk: 0, hp: 0 });

// The level 1-150 ladder is keyed on the base (awakening-0) chain row; awakening,
// transcendence and plus ids live on the final row passed in as `w`.
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

// --- series identity, keyed off the slot-1 lead trait ---------------------------------
const SERIES = {
  "HP": "defender", "Stun Power": "stunner", "Critical Hit Rate": "stinger",
  "Weak Point DMG": "executioner", "ATK": "ascension", "Catastrophe Nova": "terminus",
};
const SERIES_NAME = {
  defender: "Defender", stunner: "Stunner", stinger: "Stinger",
  executioner: "Executioner", ascension: "Ascension", terminus: "Terminus",
};
const SERIES_ORDER = ["defender", "stunner", "stinger", "executioner", "ascension", "terminus"];
const AWAKENS = new Set(["ascension", "terminus"]);

// A transcendable weapon carries the rebuild ids on its (final) row and has art.
const transcendable = db
  .prepare("select * from weapon where IconFileNameId!='' and WeaponSkillLevelRebuildId1!=''")
  .all();

const seriesOf = (w) => {
  const lead = skillName.get(slotGroup.all(w.WeaponSkillLevelRebuildId1)[0]?.Unk12);
  return SERIES[lead] ?? null;
};

// --- level-sequence naming: dedupe sequences, mint readable ids -----------------------
const levels = {}; // id -> number[8]
const levelIdBySeq = new Map();
function levelId(slotIndex, seriesId, seq) {
  const key = JSON.stringify(seq);
  if (levelIdBySeq.has(key)) return levelIdBySeq.get(key);
  const plain = `slot${slotIndex}`;
  const id = plain in levels ? `slot${slotIndex}-${seriesId}` : plain;
  levels[id] = seq;
  levelIdBySeq.set(key, id);
  return id;
}

// --- build a series row from one character's weapon (Zeta = zero hp offset) ------------
function buildSeries(w, seriesId) {
  const slots = [1, 2, 3, 4, 5].map((i) => {
    const rows = slotGroup.all(w[`WeaponSkillLevelRebuildId${i}`]);
    const seq = rungs(rows[0]);
    const slot = { levels: levelId(i, seriesId, seq) };
    let pool = rows.map((r) => traitId(r.Unk12));
    // Ascension/Terminus slot 2 ends with the per-character signature trait.
    if (AWAKENS.has(seriesId) && i === 2) pool = [...pool.slice(0, -1), "@signature"];
    if (pool.length === 1) slot.trait = pool[0];
    else slot.pool = pool;
    return slot;
  });
  const { atk, hp } = maxedStats(w, seriesId);
  return { id: seriesId, name: SERIES_NAME[seriesId], atk, hp, slots };
}

// --- awakening name chain: base name (awake 0) + awakened name (final, suffixed) -------
const wname = (r) => en(/^[0-9A-F]{8}$/.test(r.Name) ? `TXT_WEP_NAME_${r.Key.slice(4)}` : r.Name);
const chainRow0 = db.prepare(
  "select * from weapon where CharaId=? and IconFileNameId=? and LastAwakeningLevel=0");
function weaponNames(w, seriesId) {
  const awakened = wname(w);
  if (!AWAKENS.has(seriesId)) return { name: awakened };
  const base = chainRow0.get(w.CharaId, w.IconFileNameId);
  return { name: base ? wname(base) : awakened, awakened };
}

// --- anchor (Zeta) builds the series rows; every character contributes hpOffset --------
const ANCHOR = "PL1600"; // Zeta, hp offset 0
const anchorWeapons = transcendable.filter((w) => w.CharaId === ANCHOR);
const series = [];
const anchorHpBySeries = {};
for (const seriesId of SERIES_ORDER) {
  const w = anchorWeapons.find((x) => seriesOf(x) === seriesId);
  if (!w) throw new Error(`anchor missing series ${seriesId}`);
  series.push(buildSeries(w, seriesId));
  anchorHpBySeries[seriesId] = maxedStats(w, seriesId).hp;
}

// per-character weapon block (name/awakened, signatureTrait) and hpOffset ---------------
function characterBlock(slug) {
  const mine = transcendable.filter((w) => charaSlug(w.CharaId) === slug);
  const weapons = {};
  let hpOffset = null;
  let signatureTrait = null;
  for (const seriesId of SERIES_ORDER) {
    const w = mine.find((x) => seriesOf(x) === seriesId);
    if (!w) continue;
    weapons[seriesId] = weaponNames(w, seriesId);
    // hp offset is constant across non-Terminus series; assert agreement.
    if (seriesId !== "terminus") {
      const off = maxedStats(w, seriesId).hp - anchorHpBySeries[seriesId];
      if (hpOffset === null) hpOffset = off;
      else if (hpOffset !== off) throw new Error(`${slug} hpOffset disagrees: ${hpOffset} vs ${off} (${seriesId})`);
    }
    if (AWAKENS.has(seriesId)) {
      const sig = traitId(slotGroup.all(w.WeaponSkillLevelRebuildId2).at(-1).Unk12);
      if (signatureTrait && signatureTrait !== sig) throw new Error(`${slug} signature disagrees`);
      signatureTrait = sig;
    }
  }
  return { hpOffset, weapons, signatureTrait };
}

// --- self-check against docs/weapons.md before writing anything -----------------------
const EXPECT = { // zero-offset (Zeta) maxed totals, docs/weapons.md#what-a-maxed-weapon-reaches
  defender: [9201, 4302], stunner: [19858, 3786], stinger: [19497, 3269],
  executioner: [20518, 3097], ascension: [19711, 4478], terminus: [20583, 1159],
};
let ok = true;
for (const s of series) {
  const [atk, hp] = EXPECT[s.id];
  if (s.atk !== atk || s.hp !== hp) {
    ok = false;
    console.error(`MISMATCH ${s.id}: got ${s.atk}/${s.hp}, expect ${atk}/${hp}`);
  }
}
const io = characterBlock("io");
if (io.hpOffset !== -13) { ok = false; console.error(`Io hpOffset ${io.hpOffset}, expect -13`); }
if (io.signatureTrait !== "charged-attack-dmg") {
  ok = false; console.error(`Io signature ${io.signatureTrait}, expect charged-attack-dmg`);
}
if (missing.size) { ok = false; console.error(`unmapped traits:\n  ${[...missing].join("\n  ")}`); }

console.log(`series: ${series.length}, level sequences: ${Object.keys(levels).length}`);
console.log(`Io: hpOffset ${io.hpOffset}, signature ${io.signatureTrait}, weapons ${Object.keys(io.weapons).join("/")}`);
console.log(JSON.stringify(series.find((s) => s.id === "terminus"), null, 2));
console.log(`levels:`, JSON.stringify(levels));

if (!ok) { console.error("\nself-check FAILED - not writing"); process.exit(1); }
console.log("\nself-check passed");

if (WRITE) {
  const j = (v) => JSON.stringify(v, null, 2) + "\n";
  await writeFile(new URL("weapon-series.json", DATA), j(series));
  await writeFile(new URL("weapon-levels.json", DATA), j(levels));
  // patch each existing character catalog in place
  for (const c of characters) {
    const url = new URL(`characters/${c.id}.json`, DATA);
    let cat;
    try { cat = JSON.parse(await readFile(url)); } catch { continue; }
    const { hpOffset, weapons, signatureTrait } = characterBlock(c.id);
    // key order: id, skills, weapon block, then the rest (masterTraits, ...)
    const { id, skills, ...rest } = cat;
    for (const k of ["weapons", "weaponHpOffset", "weaponSignatureTrait", "hpOffset", "signatureTrait"])
      delete rest[k];
    const patched = {
      id, skills, weapons, weaponHpOffset: hpOffset,
      ...(signatureTrait ? { weaponSignatureTrait: signatureTrait } : {}),
      ...rest,
    };
    await writeFile(url, j(patched));
    console.log(`patched characters/${c.id}.json`);
  }
  console.log("wrote weapon-series.json, weapon-levels.json");
}
