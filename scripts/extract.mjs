// One-off catalog extraction: pulls every machine-readable source and writes
// the committed JSON under src/data/. Re-run only when game data changes.
// Source and access notes: research/game-data.md.
//
//   node scripts/extract.mjs
//
// Master traits are NOT generated here - they are hand-authored from in-game
// screenshots in src/data/characters/*.json.
//
// Sources: GBFR-PE-Patch-Tool (trait names, max levels, wrightstone items) ·
// Nenkai relink-modding datamine (summon traits, equip bonus tiers) ·
// community calculator sheet (sigil/wrightstone pools, weapon constants) ·
// relink.gbf.wiki CC BY-NC-SA (weapon names, elements) · game facts © Cygames.

import { readFile, writeFile } from "node:fs/promises";

const OUT_DIR = new URL("../src/data/", import.meta.url);
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const CALCULATOR_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1RnNLfdqFCW7zWvfHnQsNRJoi7EtIjdOUg-uYB0xsZHQ/gviz/tq?tqx=out:csv&sheet=";
const WIKI_API_URL = "https://relink.gbf.wiki/api.php";
const PE_TOOL_RAW_URL =
  "https://raw.githubusercontent.com/BitterG/GBFR-PE-Patch-Tool/master/data/";
const SUMMON_DOC_URL =
  "https://raw.githubusercontent.com/Nenkai/relink-modding/main/docs/resources/summon_trait_chances.md";

// equip tier tables, ordered by descending Attack Power Up ceiling
const EQUIP_TIER_GROUPS = ["legendary", "mid", "low"];

// The calculator sheet is hand-maintained and abbreviates some trait names;
// the PE tool carries the datamined ones. Map calculator -> PE.
const PE_NAME_ALIASES = {
  "Attack Power": "ATK",
  "Damage Cap": "DMG Cap",
  "Charged Attack": "Charged Attack DMG",
  "Combo Finisher": "Combo Finisher DMG",
  "Critical Damage": "Critical Hit DMG",
  "Supplementary Damage": "Supplementary DMG",
  Throw: "Throw DMG",
  "DEF↓ Resistance": "Defense Down Resistance",
};

// Absent from both sources.
const MANUAL_MAX_LEVELS = { Divergence: 15 };

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const fetchText = async (url) => {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
};
const fetchJson = async (url) => JSON.parse(await fetchText(url));
const readJson = async (name) =>
  JSON.parse(await readFile(new URL(name, OUT_DIR)));
const writeJson = async (name, data) => {
  await writeFile(new URL(name, OUT_DIR), JSON.stringify(data, null, 2) + "\n");
  console.log(`wrote src/data/${name}`);
};

/** Minimal CSV parser (quoted fields, embedded commas/quotes). */
function parseCsv(text) {
  const rows = [];
  let row = [],
    field = "",
    inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') inQuotes = false;
      else field += char;
    } else if (char === '"') inQuotes = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else field += char;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

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

// ---------------------------------------------------------------- fetch all
// The wiki sits behind Cloudflare and intermittently refuses API traffic;
// committed values stand in so a blocked run still produces complete output.
const wikiQuery = (params, fallback) =>
  fetchJson(`${WIKI_API_URL}?${params}&format=json`)
    .then((j) => j.cargoquery.map((r) => r.title))
    .catch(() => fallback);

const [constantsCsv, weaponsCsv] = await Promise.all(
  ["Constants", "WeaponConstants"].map((tab) =>
    fetchText(CALCULATOR_CSV_URL + tab).then(parseCsv),
  ),
);
const [wikiIoWeapons, wikiCharacters, peWrightstones, peTraits, summonDoc] =
  await Promise.all([
    wikiQuery(
      "action=cargoquery&tables=weapons&fields=name,series,charaID&where=charaID=%224%22&limit=50",
      null,
    ),
    wikiQuery(
      "action=cargoquery&tables=characters&fields=name,element&limit=50",
      null,
    ),
    fetchJson(PE_TOOL_RAW_URL + "wrightstones.json"),
    fetchJson(PE_TOOL_RAW_URL + "traits.json"),
    fetchText(SUMMON_DOC_URL),
  ]);
if (!wikiIoWeapons) console.warn("wiki unavailable - keeping committed weapon names");
if (!wikiCharacters) console.warn("wiki unavailable - keeping committed elements");

// ------------------------------------------- trait names (PE tool authority)
// PE is datamined and carries a max level for every trait it knows; the
// calculator only fills the few it lacks. Canonicalising early keeps weapon
// and summon rows referencing the same ids as the trait catalog.
const peTraitList = peTraits.traits ?? peTraits;
const peTraitBySlug = new Map(peTraitList.map((t) => [slug(t.displayName), t]));
const peTraitOf = (name) =>
  peTraitBySlug.get(slug(PE_NAME_ALIASES[name] ?? name));
const canonical = (name) => peTraitOf(name)?.displayName ?? name;
const traitId = (name) => slug(canonical(name));

// --------------------- sigil / wrightstone pools + max levels (calculator)
// Constants layout: parallel dropdown columns after the header row -
// col1 sigil trait pool, col2 wrightstone trait pool, col3 + col7 max levels.
const headerIndex = constantsCsv.findIndex(
  (r) => r[1] === "Main Sigil Dropdown",
);
const sigilPool = new Set(),
  wrightstonePool = new Set(),
  calculatorMaxLevels = new Map();
for (const r of constantsCsv.slice(headerIndex + 1)) {
  if (r[1] && r[1] !== "None") sigilPool.add(canonical(r[1]));
  if (r[2] && r[2] !== "None") wrightstonePool.add(canonical(r[2]));
  if (r[3] && r[3] !== "None" && r[7] && !isNaN(+r[7]))
    calculatorMaxLevels.set(canonical(r[3]), +r[7]);
}

// --------------------------------------- weapons.json (calculator + wiki)
// WeaponConstants: one row per series; comma-lists are player-choice pools.
// Io display names come from the wiki's cargo `weapons` table (charaID 4).
const committedWeapons = await readJson("weapons.json").catch(() => []);
const ioWeaponNameBySeries = wikiIoWeapons
  ? Object.fromEntries(
      wikiIoWeapons.map((w) => [w.series.replace(" Weapon", ""), w.name]),
    )
  : Object.fromEntries(committedWeapons.map((w) => [w.series, w.name]));

const weaponRows = weaponsCsv
  .slice(1)
  .filter(
    (r) => r[0] && r[0] !== "Current Weapon" && !r[0].includes("(Base Game)"),
  )
  .filter((r) => isNaN(+r[0]));
const weaponTraitNames = new Set();
const weapons = weaponRows.map((r) => {
  const rows = [];
  for (let t = 0; t < 5; t++) {
    const cell = r[3 + t],
      level = +r[8 + t] || 0;
    if (!cell) continue;
    if (cell.includes(",")) {
      const options = cell.split(",").map((s) => s.trim());
      options.forEach((o) => weaponTraitNames.add(canonical(o)));
      rows.push({ options: options.map(traitId), level });
    } else {
      weaponTraitNames.add(canonical(cell));
      rows.push({ trait: traitId(cell), level });
    }
  }
  const series = r[0];
  // Terminus: the choice pool is the rotatable SECOND trait slot
  if (series === "Terminus") {
    const poolIndex = rows.findIndex((row) => row.options);
    if (poolIndex > 1) rows.splice(1, 0, ...rows.splice(poolIndex, 1));
  }
  const name = ioWeaponNameBySeries[series] ?? series;
  return {
    id: slug(name),
    name,
    series,
    characterId: "io",
    defaultAtk: +r[1] || 0, // max-level (Endless Ragnarok era) values
    defaultHp: +r[2] || 0,
    rows,
  };
});

// ------------------- summons.json + summon-equip-tiers.json (Nenkai datamine)
const topTierSummons = collapseToTopTier(parseSummonDoc(summonDoc));
const summonTraitNames = new Set();
for (const summon of topTierSummons)
  summon.traits.forEach((t) => summonTraitNames.add(canonical(t)));

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

const summonEquipTiers = {};
const equipTierBySummon = new Map();
rankedSignatures.forEach(([, group], index) => {
  const tierName = EQUIP_TIER_GROUPS[index];
  const table = {};
  for (const [bonus, values] of Object.entries(group[0].equip))
    table[slug(bonus)] = [...new Set(values)].sort((a, b) => a - b);
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

// ------------------------------------------------------------- traits.json
// A flat roster: every trait any catalog references, with its max level.
// Which pool a trait belongs to (sigil / wrightstone / character) is not
// gated - no source classifies them reliably enough to filter on.
const allTraitNames = new Set([
  ...peTraitList.map((t) => t.displayName),
  ...sigilPool,
  ...wrightstonePool,
  ...weaponTraitNames,
  ...summonTraitNames,
]);
const missingMaxLevel = [];
const traits = [...allTraitNames].sort().map((name) => {
  const maxLevel =
    peTraitOf(name)?.maxLevel ??
    calculatorMaxLevels.get(name) ??
    MANUAL_MAX_LEVELS[name] ??
    null;
  if (maxLevel == null) missingMaxLevel.push(name);
  return { id: slug(name), name, maxLevel };
});
if (missingMaxLevel.length)
  throw new Error(`no max level for: ${missingMaxLevel.join(", ")}`);

// ------------------------------------------------------- bonus-types.json
// Over-mastery rolls are a separate system from summon equip bonuses and are
// not datamined on the summon page; ATK/HP are flat, everything else is %.
const OVER_MASTERY_RANGES = {
  "Attack Power Up": { min: 200, max: 1000 },
  "Health Up": { min: 400, max: 2000 },
  "Stun Power Up": { min: 2, max: 20 },
};
const BONUS_TYPE_NAMES = [
  "Attack Power Up",
  "Health Up",
  "Critical Hit Rate Up",
  "Stun Power Up",
  "Skill Damage Up",
  "Skybound Art Damage Up",
  "Chain Burst Damage Up",
  "Normal Attack Damage Cap Up",
  "Skill Damage Cap Up",
  "Skybound Art Damage Cap Up",
  "Healing Cap Up",
];
const FLAT_BONUS_TYPES = new Set(["Attack Power Up", "Health Up"]);
const bonusTypes = BONUS_TYPE_NAMES.map((name) => ({
  id: slug(name),
  name,
  unit: FLAT_BONUS_TYPES.has(name) ? "flat" : "percent",
  overMastery: OVER_MASTERY_RANGES[name] ?? { min: 2, max: 20 },
}));

// ------------------------------------ wrightstone-prefixes.json (PE tool)
const peTraitNameById = new Map(
  peTraitList.map((t) => [t.internalId, t.displayName]),
);
const wrightstonePrefixes = {};
for (const w of peWrightstones.wrightstones ?? []) {
  const name = peTraitNameById.get(w.defaultTraitId);
  if (name)
    wrightstonePrefixes[slug(name)] = w.displayName.replace(" Wrightstone", "");
}

// ------------------------------------- characters.json element patch (wiki)
const characters = await readJson("characters.json");
if (wikiCharacters) {
  const elementByName = new Map(wikiCharacters.map((c) => [c.name, c.element]));
  for (const c of characters)
    c.element = elementByName.get(c.name) ?? c.element ?? "";
}

// ---------------------------------------------------------------- write all
await writeJson("traits.json", traits);
await writeJson("bonus-types.json", bonusTypes);
await writeJson("summons.json", summons);
await writeJson("summon-equip-tiers.json", summonEquipTiers);
await writeJson("weapons.json", weapons);
await writeJson("wrightstone-prefixes.json", wrightstonePrefixes);
await writeJson("characters.json", characters);

console.log(
  `\ntraits ${traits.length} · summons ${summons.length} · weapons ${weapons.length}`,
);
