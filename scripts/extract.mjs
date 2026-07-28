// One-off catalog extraction: reads the game archive and writes the committed
// JSON under src/data/. Re-run only when the game updates.
//
//   node scripts/extract.mjs [extract-dir]
//
// The extract dir is produced by GBFRDataTools and is not committed; see
// docs/archive.md for the two commands and for why the archive is the authority
// over the calculator sheet, the wiki and the PE patch tool, all of which this
// script used to fetch.
//
// The one remaining external source is Nenkai's relink-modding datamine page,
// which carries summon traits and equip bonus tiers. Those are not in the
// archive's tables in any form that has been verified, and the datamined page
// is trusted.
//
// NOT generated here:
//   weapons.json              - rebuilt from the archive on series; see docs/weapons.md
//   wrightstone-prefixes.json - four hand-authored prefix pairs, no source
//   characters.json           - hand-authored; elements are already committed
//   master traits             - hand-authored per character in src/data/characters/
//
// Game data © Cygames.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { readTextTables } from "./msgpack.mjs";

const OUT_DIR = new URL("../src/data/", import.meta.url);
const EXTRACT_DIR = process.argv[2] ?? "../gbfr-extract";
const SUMMON_DOC_URL =
  "https://raw.githubusercontent.com/Nenkai/relink-modding/main/docs/resources/summon_trait_chances.md";

// equip tier tables, ordered by descending Attack Power Up ceiling
const EQUIP_TIER_GROUPS = ["legendary", "mid", "low"];

// Must stay identical to `slug` in scripts/icons.mjs - the icon index is keyed
// by it, and the two only join because they agree. Accents and apostrophes both
// go before the dash pass, or the dash pass eats them as separators:
// "Konigsschild" would slug to "k-nigsschild" and "Mage's" to "mage-s".
const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const fetchText = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
};
const writeJson = async (name, data) => {
  await writeFile(new URL(name, OUT_DIR), JSON.stringify(data, null, 2) + "\n");
  console.log(`wrote src/data/${name}`);
};

/**
 * The datamine page lists each summon as a `### Name` heading followed by a
 * fenced block of `* Trait (chance%)` main traits and `* Bonus (chance%)`
 * equip bonuses whose `- +value (chance%)` lines carry the roll tiers.
 */
function parseSummonDoc(markdown) {
  const entries = [];
  let entry = null,
    section = null,
    bonus = null;
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    let match;
    if ((match = line.match(/^###\s+(.+)$/))) {
      entry = { name: match[1].trim(), traits: [], equip: {} };
      entries.push(entry);
      section = null;
      continue;
    }
    if (!entry) continue;
    if (line === "[Main Traits]") {
      section = "traits";
      continue;
    }
    if (line === "[Equip Bonuses]") {
      section = "equip";
      continue;
    }
    if ((match = line.match(/^\*\s+(.+?)\s+\([\d.]+%\)/))) {
      const name = match[1].replace(/\s+Lv\d+$/, "").trim();
      if (section === "traits") entry.traits.push(name);
      if (section === "equip") {
        bonus = name;
        entry.equip[name] = [];
      }
      continue;
    }
    if (section === "equip" && bonus && line.startsWith("-")) {
      for (const value of line.matchAll(/\+([\d,]+)/g))
        entry.equip[bonus].push(+value[1].replace(/,/g, ""));
    }
  }
  return entries;
}

const ROMAN_VALUES = { I: 1, II: 2, III: 3, IV: 4 };
/** "Furycane III" -> { base: "Furycane", tier: 3 }; untiered names stay tier 0. */
const splitTier = (name) => {
  const match = name.match(/^(.*?)\s+(I{1,3}|IV)$/);
  return match
    ? { base: match[1], tier: ROMAN_VALUES[match[2]] }
    : { base: name, tier: 0 };
};

/** Only the highest tier of each family matters - lower ones are strictly worse. */
function collapseToTopTier(entries) {
  const byBase = new Map();
  for (const entry of entries) {
    const { base, tier } = splitTier(entry.name);
    const kept = byBase.get(base);
    if (!kept || tier > kept.tier) byBase.set(base, { ...entry, base, tier });
  }
  return [...byBase.values()];
}

// ------------------------------------------------------------------ archive
const text = await readTextTables(`${EXTRACT_DIR}/system/table/text/en`, {
  readFile,
  readdir,
});
const database = new DatabaseSync(`${EXTRACT_DIR}/tables.sqlite`);
const english = (key) => text.get(key) ?? null;

// --------------------------------------------------------------- traits.json
// A trait is a `skill` row that carries a glyph and resolves to a name - the
// same selection scripts/icons.mjs makes, so the ids match icon-index.json.
// Rows without a glyph are internal (combat states, phantom placeholders).
const maxLevelByKey = new Map(
  database
    .prepare("select Key, max(Level) as maxLevel from skill_status group by Key")
    .all()
    .map((row) => [row.Key, row.maxLevel]),
);

const missingMaxLevel = [];
const traits = database
  .prepare("select Key, Name from skill where IconId1 != ''")
  .all()
  .map((row) => ({ key: row.Key, name: english(row.Name) }))
  .filter((row) => row.name)
  .map(({ key, name }) => {
    const maxLevel = maxLevelByKey.get(key);
    if (maxLevel == null) missingMaxLevel.push(`${name} (${key})`);
    return { id: slug(name), name, maxLevel: maxLevel ?? null };
  })
  .sort((a, b) => a.name.localeCompare(b.name));
if (missingMaxLevel.length)
  throw new Error(`no skill_status rows for: ${missingMaxLevel.join(", ")}`);

// Summon traits arrive as display names from a third-party page; the archive
// decides what they resolve to. Normalising past punctuation is enough - the
// page copies the game's wording.
const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
const traitIdByName = new Map(traits.map((t) => [normalize(t.name), t.id]));
const unresolvedTraits = new Set();
const traitId = (name) => {
  const id = traitIdByName.get(normalize(name));
  if (!id) unresolvedTraits.add(name);
  return id ?? slug(name);
};

// ----------------------------------------------------------- bonus-types.json
// Over-mastery is "meditation" in the archive. Only the largest of the three
// tiers ships, and it offers every stat once - so its category rows are the
// whole roster, with no weighting to carry over. See docs/overmasteries.md.
const MEDITATION_TIER = 2;
// Whether a stat is flat or a percentage is in its own format string -
// "Attack +{0}" against "Critical Hit Rate +{0}%". Do not infer it from the
// stat-type index: Stun Power is type 3 like the percentage stats but formats
// without a `%`, so it is flat.
const isPercent = (format) => /%(?!\w)/.test(format);

// `limit_bonus_meditation_weight` is ten rows by three columns: one row per
// level, one column per tier, each column summing to 10000 basis points. Levels
// 1 and 2 carry zero weight in every tier, so only 8 of the 10 can be rolled -
// take the levels this tier actually reaches rather than assuming a range.
const rollableLevels = database
  .prepare("select rowid, * from limit_bonus_meditation_weight")
  .all()
  .filter((row) => row[`WeightLv${MEDITATION_TIER + 1}`] > 0)
  .map((row) => row.rowid);

const paramOf = database.prepare(
  "select * from limit_bonus_param where Key = ?",
);
const bonusTypes = database
  .prepare(
    "select Key from limit_bonus_meditation_category where MeditationWeightId = ?",
  )
  .all(MEDITATION_TIER)
  .map((row) => {
    const param = paramOf.get(row.Key);
    if (!param) throw new Error(`no limit_bonus_param row for ${row.Key}`);
    const name = english(param.FullName) ?? param.FullName;
    const format = english(param.NameFormat);
    if (!format) throw new Error(`no format string for ${row.Key}`);
    // Stun Power is stored fractionally in the archive - 0.1 where the other
    // stats hold 1 - and carries `Unk19` = 10 where everything else holds 1.
    // Normalising by it puts every stat on whole numbers, and lands Stun Power
    // on the same 2-20 ladder the percentage stats use. The catalog stores the
    // whole numbers; nothing downstream has to know a fraction was involved.
    const values = [...new Set(rollableLevels.map((n) => param[`Lv${n}Value`]))]
      .map((value) => Math.round(value * param.Unk19))
      .sort((a, b) => a - b);
    return {
      id: slug(name),
      name,
      unit: isPercent(format) ? "percent" : "flat",
      overMastery: values,
    };
  });
if (bonusTypes.length !== 11)
  throw new Error(`expected 11 over-mastery stats, got ${bonusTypes.length}`);

// ------------------- summons.json + summon-equip-tiers.json (Nenkai datamine)
const topTierSummons = collapseToTopTier(
  parseSummonDoc(await fetchText(SUMMON_DOC_URL)),
);

const equipSignature = (summon) =>
  Object.entries(summon.equip)
    .map(([bonus, values]) => `${bonus}:${[...new Set(values)].join(",")}`)
    .sort()
    .join("|");
const signatureToSummons = new Map();
for (const summon of topTierSummons) {
  const signature = equipSignature(summon);
  if (!signatureToSummons.has(signature)) signatureToSummons.set(signature, []);
  signatureToSummons.get(signature).push(summon);
}
const atkCeiling = (summon) =>
  Math.max(...(summon.equip["Attack Power Up"] ?? [0]));
const rankedSignatures = [...signatureToSummons.entries()].sort(
  (a, b) => atkCeiling(b[1][0]) - atkCeiling(a[1][0]),
);
if (rankedSignatures.length !== EQUIP_TIER_GROUPS.length)
  throw new Error(
    `expected ${EQUIP_TIER_GROUPS.length} equip tier tables, found ${rankedSignatures.length}`,
  );

// Equip bonuses are the same stats as over-masteries, so they key by bonus type
// id. The datamine page predates the game's wording for one of them.
const EQUIP_BONUS_ALIASES = { "Healing Cap Up": "Skill Healing Cap Up" };
const bonusTypeIdByName = new Map(bonusTypes.map((b) => [normalize(b.name), b.id]));
const bonusTypeId = (name) => {
  const id = bonusTypeIdByName.get(
    normalize(EQUIP_BONUS_ALIASES[name] ?? name),
  );
  if (!id) throw new Error(`equip bonus not in limit_bonus_param: ${name}`);
  return id;
};

const summonEquipTiers = {};
const equipTierBySummon = new Map();
rankedSignatures.forEach(([, group], index) => {
  const tierName = EQUIP_TIER_GROUPS[index];
  const table = {};
  for (const [bonus, values] of Object.entries(group[0].equip))
    table[bonusTypeId(bonus)] = [...new Set(values)].sort((a, b) => a - b);
  summonEquipTiers[tierName] = table;
  for (const summon of group) equipTierBySummon.set(summon.base, tierName);
});

const summons = topTierSummons
  .map((summon) => ({
    id: slug(summon.base),
    name: summon.base,
    traits: summon.traits.map(traitId),
    equipTier: equipTierBySummon.get(summon.base),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// ---------------------------------------------------------------- write all
await writeJson("traits.json", traits);
await writeJson("bonus-types.json", bonusTypes);
await writeJson("summons.json", summons);
await writeJson("summon-equip-tiers.json", summonEquipTiers);

if (unresolvedTraits.size)
  console.warn(
    `\n${unresolvedTraits.size} summon trait names not in the archive, kept as slugs:\n  ` +
      [...unresolvedTraits].join(", "),
  );
console.log(
  `\ntraits ${traits.length} · over-mastery stats ${bonusTypes.length} · summons ${summons.length}`,
);
