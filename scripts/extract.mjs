// One-off catalog extraction: reads the game archive and writes the committed
// JSON under src/catalog/. Re-run only when the game updates.
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
//   wrightstone-prefixes.json - four hand-authored prefix pairs; the source is
//                               item_pendulum joined to item, one named stone
//                               per main trait. See docs/wrightstones.md
//   characters.json           - hand-authored; elements and playerId are
//                               already committed. This script only checks that
//                               every playerId still matches a gem.PlayerReq
//   master traits             - hand-authored per character in src/catalog/characters/
//
// Game data © Cygames.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { readTextTables } from "./msgpack.mjs";

const OUT_DIR = new URL("../src/catalog/", import.meta.url);
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
const writeJson = async (name, data) =>
  writeText(name, JSON.stringify(data, null, 2) + "\n");
const writeText = async (name, text) => {
  await writeFile(new URL(name, OUT_DIR), text);
  console.log(`wrote src/catalog/${name}`);
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
    .prepare(
      "select Key, max(Level) as maxLevel from skill_status group by Key",
    )
    .all()
    .map((row) => [row.Key, row.maxLevel]),
);

// The glyph's first two digits are the trait's group. `05_pl*` is a character
// sigil rather than a group, so those take no category.
const TRAIT_CATEGORIES = {
  "01": "basic",
  "02": "attack",
  "03": "defense",
  "04": "support",
  "05": "special",
};
const categoryOf = (icon) =>
  icon.startsWith("05_pl") ? undefined : TRAIT_CATEGORIES[icon.slice(0, 2)];

// What a trait may do, from the gem table. Each question takes its own column:
// `SkillId1` licenses the first slot, synthesis licenses the second, and
// `skill_lot` licenses a wrightstone sub. The lots below are cut from the
// answers. See docs/sigils.md.
// Three two-trait crab gems sit in the table but ship in no build of the game -
// Crabs Are Forever+, Immortal Shell+, In a Pinch+. Their five traits exist only
// as one-trait sigils, so the rows are dropped before any lot reads them. There
// is no obtainability column to test; the keys are the only handle.
const PHANTOM_GEMS = new Set(["426AD20E", "66CB28BA", "76786869"]);
const allGems = database.prepare("select * from gem").all();
const gems = allGems.filter((gem) => !PHANTOM_GEMS.has(gem.Key));
if (allGems.length - gems.length !== PHANTOM_GEMS.size)
  throw new Error("a phantom gem key no longer matches a gem row");
// First slot only. Reading `SkillId2` in here too would happen to give the same
// 188 today - no trait is second-only - but it would offer a second-only trait
// as a first trait the moment the game adds one.
const firstKeys = new Set();
const characterByKey = new Map();
const pairedKeys = new Set(); // grants a second trait, fixed or rolled
for (const gem of gems) {
  if (!gem.SkillId1) continue;
  firstKeys.add(gem.SkillId1);
  if (gem.PlayerReq) characterByKey.set(gem.SkillId1, gem.PlayerReq);
  if (gem.SkillId2 || gem.SkillTypeLotIdForRandom2ndSkill !== -1)
    pairedKeys.add(gem.SkillId1);
}
// One pool, cut into groups; every lot draws a subset of the same 72. Only
// wrightstones still draw on it directly - a sigil's second slot is wider.
const wrightstoneSubKeys = new Set(
  database
    .prepare("select SkillId from skill_lot")
    .all()
    .map((row) => row.SkillId),
);

// A lot id resolves to every trait its weighted groups can hand out.
const lotGroups = new Map();
for (const row of database
  .prepare("select Key, SkillId from skill_lot")
  .all()) {
  if (!lotGroups.has(row.Key)) lotGroups.set(row.Key, []);
  lotGroups.get(row.Key).push(row.SkillId);
}
const lotKeys = new Map();
for (const row of database.prepare("select * from skill_type_lot").all()) {
  const keys = new Set();
  for (let slot = 1; slot <= 6; slot += 1)
    if (row[`SkillLotId${slot}`] && row[`ChancePercent${slot}`] > 0)
      for (const key of lotGroups.get(row[`SkillLotId${slot}`]) ?? [])
        keys.add(key);
  lotKeys.set(row.Key, keys);
}

// Sigil synthesis: two eligible sigils go in, one comes out holding two of the
// four input traits - the first rolled from all four, the second from the
// remaining three. Either slot can take any of them, so the traits an eligible
// sigil can carry are exactly the traits a synthesised sigil can hold in its
// SECOND slot. The screen asks for "legendary (+) mark sigils", which is rarity
// V with a `+` name.
// `CanGemMix` names the opposite of what it reads as: it marks the sigils
// synthesis REFUSES. Set on every unique sigil - the character ones, the
// Lucilius trio, the curios - and clear on the farmable generic `<Trait> V+`,
// so eligibility is `CanGemMix` CLEAR. See docs/sigils.md.
const isLegendaryPlus = (gem) =>
  gem.Rarity === 5 && (english(gem.Name) ?? "").endsWith("+");
const secondKeys = new Set();
for (const gem of gems) {
  if (gem.CanGemMix || !isLegendaryPlus(gem) || !gem.SkillId1) continue;
  secondKeys.add(gem.SkillId1);
  if (gem.SkillId2) secondKeys.add(gem.SkillId2);
  for (const key of lotKeys.get(gem.SkillTypeLotIdForRandom2ndSkill) ?? [])
    secondKeys.add(key);
}
// The rolled 72 are all reachable this way, so the second slot is a superset of
// the wrightstone pool. If that ever stops holding, the pools have diverged and
// the second slot needs to union them rather than stand alone.
const unreachableRolls = [...wrightstoneSubKeys].filter(
  (key) => !secondKeys.has(key),
);
if (unreachableRolls.length)
  throw new Error(
    `roll pool traits outside the synthesis pool: ${unreachableRolls.join(", ")}`,
  );

// A character trait is never freely offerable as a second trait, however wide
// synthesis gets. Each style owns two paired traits and a Warpath, and the pair
// is the only character combination that exists: one of the two can follow the
// other, in either order. A Warpath leads only - every `Warpath+` rolls its
// second from lot 15 - and so do Ain and the two Boundaries.
// The pairing is read off the gems that carry two character traits at once (the
// `_90` awakenings), which is exactly 28, one per style. Deriving it from the
// `SKILL_<style>_00/_01` key order would miss the six DLC styles, whose `_00`
// and `_02` rows carry unresolved key hashes.
const characterKeys = new Set(characterByKey.keys());
const pairedWith = new Map();
for (const gem of gems) {
  if (!characterKeys.has(gem.SkillId1) || !characterKeys.has(gem.SkillId2))
    continue;
  pairedWith.set(gem.SkillId1, gem.SkillId2);
  pairedWith.set(gem.SkillId2, gem.SkillId1);
}
const styles = new Set(
  [...pairedWith.keys()].map((key) => characterByKey.get(key)),
);
if (styles.size !== 28)
  throw new Error(`expected 28 paired styles, found ${styles.size}`);

// So the free second-trait pool is the character-locked traits taken back out.
for (const key of characterKeys) secondKeys.delete(key);

// Six traits only ever arrive on sigils that pin their second slot rather than
// offer it: Alpha, Beta and Gamma pin DMG Cap, and Ain and the two Boundaries
// pin Regen. Three conditions have to hold together for the slot to be settled -
// every sigil carrying the trait first agrees on one second trait, none of them
// rolls, and synthesis refuses them, so no other sigil can carry the trait.
// Drop any one and the slot reopens: a `Warpath+` rolls on lot 15, an awakening
// shares its trait with a `+` that rolls, and a generic `<Trait> V+` goes in the
// pot. `IsLuciliusGem` would name the first three but not the second three - it
// is 1 on Alpha/Beta/Gamma and 2 on every character sigil, Warpaths included.
const secondsByKey = new Map(); // first trait -> distinct fixed seconds
const rollsByKey = new Set(); // first trait -> some sigil rolls its second
const offeredKeys = new Set(); // first trait -> synthesis accepts some sigil
for (const gem of gems) {
  if (!gem.SkillId1) continue;
  if (gem.SkillTypeLotIdForRandom2ndSkill !== -1) rollsByKey.add(gem.SkillId1);
  if (!gem.CanGemMix) offeredKeys.add(gem.SkillId1);
  if (!gem.SkillId2) continue;
  if (!secondsByKey.has(gem.SkillId1))
    secondsByKey.set(gem.SkillId1, new Set());
  secondsByKey.get(gem.SkillId1).add(gem.SkillId2);
}
const missingMaxLevel = [];
const traitRows = database
  .prepare("select Key, Name, IconId1 from skill where IconId1 != ''")
  .all()
  .map((row) => ({ key: row.Key, name: english(row.Name), icon: row.IconId1 }))
  .filter((row) => row.name);

// `pairsWith` names the partner by trait id, so the key has to resolve first.
const idByKey = new Map(traitRows.map((row) => [row.key, slug(row.name)]));

// Resolved here because `idByKey` is the set of keys that become catalog traits.
// Two unnamed keys also pin a second trait - more crab leftovers - and they have
// no trait row to carry the flag.
const fixedSecondByKey = new Map();
for (const [key, seconds] of secondsByKey) {
  if (!idByKey.has(key) || !idByKey.has([...seconds][0])) continue;
  if (seconds.size !== 1 || rollsByKey.has(key) || offeredKeys.has(key))
    continue;
  fixedSecondByKey.set(key, [...seconds][0]);
}
if (fixedSecondByKey.size !== 6)
  throw new Error(
    `expected 6 pinned second traits, found ${fixedSecondByKey.size}`,
  );

// Eligibility lives in sigil-lots.json, so a trait row is display data only.
const traits = traitRows
  .map(({ key, name, icon }) => {
    const maxLevel = maxLevelByKey.get(key);
    if (maxLevel == null) missingMaxLevel.push(`${name} (${key})`);
    return {
      id: slug(name),
      name,
      maxLevel: maxLevel ?? null,
      category: categoryOf(icon),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));
if (missingMaxLevel.length)
  throw new Error(`no skill_status rows for: ${missingMaxLevel.join(", ")}`);

// `short` has no archive source - it is a display override, kept across runs.
const shortByTrait = new Map(
  JSON.parse(await readFile(new URL("traits.json", OUT_DIR), "utf8"))
    .filter((trait) => trait.short)
    .map((trait) => [trait.id, trait.short]),
);
for (const trait of traits) {
  const short = shortByTrait.get(trait.id);
  if (short) trait.short = short;
}

// Every playable character must match a gem.PlayerReq, or the editor offers
// them no character sigils.
const characterLocks = new Set(characterByKey.values());
const unlockedCharacters = JSON.parse(
  await readFile(new URL("characters.json", OUT_DIR), "utf8"),
)
  .filter((character) => !characterLocks.has(character.playerId))
  .map((character) => `${character.name} (${character.playerId})`);
if (unlockedCharacters.length)
  throw new Error(`no gem.PlayerReq matches: ${unlockedCharacters.join(", ")}`);

// ----------------------------------------------------- sigil-lots.json
const PINNED_LOTS = { "dmg-cap": "lucilius", regen: "boundary" };
const SECOND_ELIGIBLE = ["standard", "synthesisOnly"];

const pinnedByLot = new Map();
for (const secondKey of fixedSecondByKey.values()) {
  const target = idByKey.get(secondKey);
  const lot = PINNED_LOTS[target];
  if (!lot) throw new Error(`no lot named for pinned second trait: ${target}`);
  pinnedByLot.set(lot, target);
}

// Order matters: a pinned trait is also paired, and a single-trait sigil never
// reaches the second-slot tests below it.
const lotOf = (key) => {
  if (!firstKeys.has(key)) return "weaponOnly";
  if (!pairedKeys.has(key)) return "singleTraitOnly";
  if (fixedSecondByKey.has(key))
    return PINNED_LOTS[idByKey.get(fixedSecondByKey.get(key))];
  if (!secondKeys.has(key)) return "firstTraitOnly";
  return wrightstoneSubKeys.has(key) ? "standard" : "synthesisOnly";
};

const lotRules = {
  standard: {
    firstSlot: true,
    eligibleSecondTraits: SECOND_ELIGIBLE,
    wrightstoneSub: true,
  },
  synthesisOnly: { firstSlot: true, eligibleSecondTraits: SECOND_ELIGIBLE },
  firstTraitOnly: { firstSlot: true, eligibleSecondTraits: SECOND_ELIGIBLE },
  singleTraitOnly: { firstSlot: true },
  lucilius: {
    firstSlot: true,
    eligibleSecondTraits: [pinnedByLot.get("lucilius")],
  },
  boundary: {
    firstSlot: true,
    eligibleSecondTraits: [pinnedByLot.get("boundary")],
  },
  weaponOnly: {},
};

const traitsByLot = new Map(Object.keys(lotRules).map((lot) => [lot, []]));
for (const row of traitRows)
  traitsByLot.get(lotOf(row.key)).push(slug(row.name));

const lots = Object.fromEntries(
  Object.entries(lotRules).map(([lot, rules]) => [
    lot,
    { ...rules, traits: traitsByLot.get(lot).sort() },
  ]),
);

// One tuple per style, read off the same `_90` awakenings `pairedWith` came from.
const pairs = [
  ...new Map(
    [...pairedWith].map(([key, partner]) => [
      [key, partner].sort().join(),
      [idByKey.get(key), idByKey.get(partner)].sort(),
    ]),
  ).values(),
].sort();

const traitsByStyle = {};
for (const [key, playerId] of characterByKey) {
  (traitsByStyle[playerId] ??= []).push(idByKey.get(key));
}
for (const owned of Object.values(traitsByStyle)) owned.sort();

const sigilLots = {
  lots,
  pairs,
  styles: Object.fromEntries(Object.entries(traitsByStyle).sort()),
};

const lotted = Object.values(lots).reduce((n, lot) => n + lot.traits.length, 0);
if (lotted !== traits.length)
  throw new Error(`${lotted} traits in lots, ${traits.length} in the catalog`);
if (pairs.length !== 28)
  throw new Error(`expected 28 pairs, found ${pairs.length}`);
const traitIds = new Set(traits.map((trait) => trait.id));
const collisions = Object.keys(lots).filter((lot) => traitIds.has(lot));
if (collisions.length)
  throw new Error(`lot names shadow trait ids: ${collisions.join(", ")}`);

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
const bonusTypeIdByName = new Map(
  bonusTypes.map((b) => [normalize(b.name), b.id]),
);
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

// ---------------------------------------------------- trait-stats.json
// Hand-written because neither half is derivable: the stat clause sits in the
// `LevelValue` column its format string names ("ATK +{1:.1f}%" is LevelValue2),
// and of the ~50 traits with an ATK percentage clause only these reach the
// displayed number. See docs/stats.md.
const STAT_TRAIT_SOURCES = [
  { key: "SKILL_000_00", stat: "atk", unit: "flat", column: 1 },
  { key: "SKILL_001_00", stat: "hp", unit: "flat", column: 1 },
  { key: "SKILL_003_00", stat: "crit", unit: "flat", column: 1 },
  { key: "SKILL_004_00", stat: "stun", unit: "flat", column: 1 },
  { key: "1E1CECCE", stat: "atk", unit: "percent", column: 1 }, // Catastrophe Nova
  { key: "235D86EF", stat: "atk", unit: "percent", column: 1 }, // Supernova
  { key: "SKILL_158_00", stat: "atk", unit: "percent", column: 1 }, // Glass Cannon
  { key: "SKILL_027_00", stat: "atk", unit: "percent", column: 2 }, // Tyranny
  { key: "SKILL_027_00", stat: "hp", unit: "percent", column: 1, sign: -1 }, // Tyranny's malus
];

const ladderOf = database.prepare(
  "select * from skill_status where Key = ? order by Level",
);
const traitStats = {};
for (const source of STAT_TRAIT_SOURCES) {
  const id = idByKey.get(source.key);
  if (!id)
    throw new Error(`stat trait key resolves to no trait: ${source.key}`);
  const rows = ladderOf.all(source.key);
  if (!rows.length) throw new Error(`no skill_status rows for ${source.key}`);
  // The ladder is indexed by level, so a gap would silently shift every value.
  rows.forEach((row, index) => {
    if (row.Level !== index + 1)
      throw new Error(`${source.key} skips level ${index + 1}`);
  });
  (traitStats[id] ??= []).push({
    stat: source.stat,
    unit: source.unit,
    values: rows.map(
      (row) => (source.sign ?? 1) * row[`LevelValue${source.column}`],
    ),
  });
}

// ------------------------------------------------ character-stats.json
const STAT_BY_PARAM_TYPE = { 0: "atk", 1: "hp", 2: "crit", 3: "stun" };

const masteryParams = new Map(
  database
    .prepare("select * from limit_bonus_param")
    .all()
    .map((param) => [param.Key, param]),
);
const masteryBonuses = new Map(
  database
    .prepare("select * from limit_bonus")
    .all()
    .map((bonus) => [bonus.Key, bonus]),
);

// `LimitBonusParamIndex` is a level into the param's own value ladder, not an
// index into ParamId1/2/3 - it runs to 7 where there are only ever 3 params.
const tallyNodes = (nodes, totals) => {
  for (const node of nodes) {
    const bonus = masteryBonuses.get(node.LimitBonusId);
    if (!bonus) continue;
    for (const paramId of [bonus.ParamId1, bonus.ParamId2, bonus.ParamId3]) {
      const param = paramId && masteryParams.get(paramId);
      if (!param) continue;
      // The `Attack +{0}%` mastery nodes are type 114, and are confirmed in
      // game not to reach the displayed ATK. Only the four flat types count.
      const stat = STAT_BY_PARAM_TYPE[param.DisplayNumberMultiplier];
      if (!stat) continue;
      totals[stat] += param[`Lv${node.LimitBonusParamIndex + 1}Value`] ?? 0;
    }
  }
  return totals;
};

// `ap_tree_rebuild` mirrors its own rungs 1-6 at rung 7 with re-priced values,
// so summing both double-counts; at T7 the rung-7 rows are the whole section.
const NODE_TREES = [
  "select * from ap_tree_atk where CharaId = ?",
  "select * from ap_tree_def where CharaId = ?",
  "select * from ap_tree_wep where CharaId = ?",
  "select * from ap_tree_rebuild where CharaId = ? and ReqWepTranscensionLevel = 7",
].map((sql) => database.prepare(sql));
const baseStatus = database.prepare(
  "select * from chara_status where Key = ? and Level = 100",
);

const characterStats = {};
for (const character of JSON.parse(
  await readFile(new URL("characters.json", OUT_DIR), "utf8"),
)) {
  const base = baseStatus.get(character.playerId);
  if (!base) throw new Error(`no level-100 row for ${character.playerId}`);
  const masteries = { hp: 0, atk: 0, crit: 0, stun: 0 };
  for (const tree of NODE_TREES)
    tallyNodes(tree.all(character.playerId), masteries);
  // Stun stays in the archive's tenths; the derivation scales it once, at the end.
  for (const stat of Object.keys(masteries))
    masteries[stat] = +masteries[stat].toFixed(2);
  characterStats[character.id] = {
    base: { hp: base.Hp, atk: base.Attack },
    masteries,
  };
}

// Prettier keeps an object collapsed when the source has no line break after
// its `{`, so a stat block written on one line survives a format pass.
const inline = (stats) =>
  `{ ${Object.entries(stats)
    .map(([stat, value]) => `"${stat}": ${value}`)
    .join(", ")} }`;
const characterStatsText = `{\n${Object.entries(characterStats)
  .map(
    ([id, { base, masteries }]) =>
      `  "${id}": {\n    "base": ${inline(base)},\n    "masteries": ${inline(masteries)}\n  }`,
  )
  .join(",\n")}\n}\n`;

// The four stats close to the unit on a maxed Io, so drift here is a regression.
const io = characterStats.io;
const IO_EXPECTED = {
  base: { hp: 3156, atk: 666 },
  masteries: { hp: 56500, atk: 8802, crit: 78, stun: 10.9 },
};
if (JSON.stringify(io) !== JSON.stringify(IO_EXPECTED))
  throw new Error(
    `Io no longer matches the confirmed build: ${JSON.stringify(io)}`,
  );

// ---------------------------------------------------------------- write all
await writeJson("traits.json", traits);
await writeJson("sigil-lots.json", sigilLots);
await writeJson("bonus-types.json", bonusTypes);
await writeJson("summons.json", summons);
await writeJson("summon-equip-tiers.json", summonEquipTiers);
await writeJson("trait-stats.json", traitStats);
await writeText("character-stats.json", characterStatsText);

if (unresolvedTraits.size)
  console.warn(
    `\n${unresolvedTraits.size} summon trait names not in the archive, kept as slugs:\n  ` +
      [...unresolvedTraits].join(", "),
  );
console.log(
  `\ntraits ${traits.length} · over-mastery stats ${bonusTypes.length} · summons ${summons.length}`,
);
