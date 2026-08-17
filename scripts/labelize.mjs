// Master-trait cell labels: description -> the short text a cell can hold.
// A cell is ~150px wide (one line at full size, two at the shrunk size), so the
// label carries identity only - subject, stat, sign, value. Caveats, drawbacks
// and stacking rules are dropped; the full description stays on the cell for
// the tooltip.
//
// Rules are ordered and each fires only on its own shape. Anything still over
// HARD goes through the ladder at the end. This is a first pass: run it to seed
// the labels of a hand-authored character file, then tune by hand.
//
//   node scripts/labelize.mjs            fill empty labels in characters/*.json
//   node scripts/labelize.mjs --force    re-derive every label, discarding edits
//   node scripts/labelize.mjs --dry      print what it would write

export const SOFT = 18; // fits one line
export const HARD = 34; // fits two lines at the shrunk size

// Io-specific. When more characters land, move these to a `short` field on the
// character's skills[] and pass them in.
const SKILL_SHORTS = [
  [/Flowery Seven/g, "F7"],
  [/Stargaze/g, "SG"],
  [/Concentration/g, "Concen"],
  [/Mystic Vortex/g, "Vortex"],
  [/Gravity Well/g, "Gravity"],
  [/Healing Winds/g, "Heal Winds"],
];

// A condition keeps its colon, a subject loses it - that contrast is the only
// structural cue that survives compression.
const CONDITIONS = [
  [/^While inflicted with (\w+)[,:]\s*/, (m) => `${m[1]}: `],
  [/^While inside (.+?)'s AoE[,:]\s*/, (m) => `${m[1]} AoE: `],
  [/^While charging (.+?)[,:]\s*/, (m) => `${m[1]} charge: `],
  [/^While in critical condition[,:]\s*/, () => "Low HP: "],
  [/^Upon performing a perfect dodge[,:]\s*/, () => "Dodge: "],
  [/^Against foes of the weaker element[,:]\s*/, () => "Weak elem: "],
  // summon-gated traits (Katalina's Ares, and any future summon-skill character)
  [/^While (\w+) is summoned[,:]\s*/, (m) => `${m[1]} summoned: `],
  [/^While (\w+) isn't summoned[,:]\s*/, (m) => `${m[1]} not summoned: `],
  [/^When (\w+) is dismissed[,:]\s*/, (m) => `${m[1]} dismissed: `],
  [/^Upon summoning (\w+)[,:]\s*/, (m) => `${m[1]} summon: `],
  // stacking-counter gates (Narmaya's butterfly count; any future counter)
  [/^While at (\w+) count (\d+)[,:]\s*/, (m) => `${m[1]} ${m[2]}: `],
  [/^Upon activating (?:her|his|their) SBA[,:]\s*/, () => "SBA: "],
  [/^Upon activating a link attack or Skybound Art[,:]\s*/, () => "Link/SBA: "],
  [/^Upon countering with (.+?)[,:]\s*/, (m) => `${m[1]} counter: `],
  [/^Upon blocking with a (.+?) attack[,:]\s*/, (m) => `${m[1]} block: `],
  // stance/buff gates - the trailing noun is redundant once it's a prefix
  [/^While in (.+?) stance[,:]\s*/, (m) => `${m[1]}: `],
  [/^While buffed by (.+?)[,:]\s*/, (m) => `${m[1]}: `],
  // gauge-fill gates (Rackam's Heat gauge; any future gauge mechanic)
  [/^When the (\w+) gauge becomes full[,:]\s*/, (m) => `Full ${m[1]}: `],
  [/^When all skills are on cooldown[,:]\s*/, () => "All CD: "],
  // "Shield from landing X gains Shield Strength +N" - the mechanism is the
  // subject; "gains Shield Strength" just repeats what the remaining text says
  [/^Shield from landing (.+?) gains?\s+/, (m) => `${m[1]}: `],
];

// Whole-description templates, not a prefix - these scaling cells have no
// leftover clause to keep processing, so they short-circuit labelize().
const BOOST_BY_SUMMON_COUNT =
  /^Boosts (.+?) by a max of ([+-]?\d+%) based on the number of times (\w+) has been summoned during the quest$/;
// "Boosts <name>'s <stat> by a max of <N%> based on <whatever>" - the name is
// redundant on a per-character file and the "based on" clause is the same
// caveat-dropping rule as everywhere else, just too varied in wording to be
// worth a keyword prefix the way the summon-count case gets one.
const BOOST_BY_CONDITION =
  /^Boosts \w+'s (.+?) by a max of ([+-]?\d+%) based on .+$/;
// "<subject> gain(s) up to an additional/a max of <stat> <N%> based on <gauge>"
// (Rackam's Heat gauge scaling) - same shape as the two above, different verb
const GAIN_UP_TO_BASED_ON =
  /^.+? gains? (?:up to an additional|a max of) ([\w ]+?) ([+-]?\d+%) based on .+$/;

const SIGIL_TYPES = {
  "Basic Stats": "Basic",
  Attack: "Attack",
  "Defense- or Support": "Def/Sup",
};

const FILLER = [
  [/\s+from [A-Z][\w ]*$/, ""], // "+5% from Superstar" - source attribution
  [/\s*\bnow grants (.+?) instead of .*$/, "→$1"], // Heal Winds -> Shield
  [/\s+to (?:the entire party|all allies)$/, " (party)"], // party-wide vs. implied self
  // "DEF Up grants an additional DEF +5%" - the buff name repeats the stat it
  // already carries; keep the "additional" marker, drop the redundant mention
  [
    /\b(?:ATK|DEF) (?:Up|Down) (?:grants?|gains?) an additional ((?:ATK|DEF) [+-]?\d+%)/i,
    "add. $1",
  ],
  [/\b(?:gains?|grants) an additional\s+/i, ""],
  [/\bIo also gains\s+/, ""], // the character's own name adds nothing
  [/\balso (?:gains?|inflicts)\s+/, ""],
  [/\bgains?\s+/, ""],
  [/^Gains?\s+/, ""], // clause-initial "Gain(s)" after a condition prefix
  [/\binflicts\s+/, ""],
  [/^Inflicts\s+/, ""], // clause-initial "Inflicts" after a condition prefix
  [/\bGrants\s+/i, ""],
  [/(\w) \+ (\w)/g, "$1+$2"], // skill combos: "Freeze + Fire" -> "Freeze+Fire"
  [/\s+and\s+(?=[A-Z])/, " "], // sibling effects run together
  // "<buff> reduces DMG taken by an additional N%" - the buff name is the
  // subject, the mechanism is implied by it already being a defensive buff
  [/(.+?) reduces DMG taken by an additional ([+-]?\d+%)/, "$1 -$2"],
];

const TERMS = [
  [/Critical Hit Rate/g, "Crit Rate"],
  [/Critical Hit DMG/g, "Crit DMG"],
  [/Critical Gauge Depletion/g, "Crit Gauge"],
  [/Guard Break Resistance/g, "Guard Break"],
  [/Charged Attacks/g, "Charged"],
  [/Normal Attacks/g, "Normal"],
  [/Primal bursts/g, "Primal Burst"],
  [/Cooldown/g, "CD"],
  [/Duration/g, "Dur"],
  [/Stackable/g, "Stack"],
  [/DMG Dealt/g, "DMG"],
  // descriptions spell the buff arrows out; labels take the glyph back - any
  // stat or named buff (ATK, DEF, DMG Cap, Hostility, ...), never a mix
  [/\b(ATK|DEF|DMG Cap|DMG|[A-Z][a-z]+) Up\b/g, "$1↑"],
  [/\b(ATK|DEF|DMG Cap|DMG|[A-Z][a-z]+) Down\b/g, "$1↓"],
  ...SKILL_SHORTS,
  [/(\d+),?000\b/g, "$1k"], // 15,000 -> 15k · 3000 -> 3k
  [/\s*sec\.?/g, "s"],
  [/\s*per effect lvl(?: to \w+ attacks)?$/, "/lvl"], // "...to Charged attacks" tail is redundant with the trait's own gate
  [/Supplementary DMG/g, "Supp DMG"],
  [/Shield Strength/g, "Shield Str"],
];

// Applied in order, only while the label still overflows. Values are never
// dropped - only the words around them.
const LADDER = [
  (t) => t.replace(/\s*\([^)]*\)\s*$/, ""), // trailing caveat
  (t) => t.replace(/\bDMG Cap\b/, "Cap"),
  (t) => t.replace(/\s+(?:AoE|Dur)\b/, ""), // qualifier nouns
];

/** description -> cell label. Deterministic; no per-cell special cases.
 *  `selfName`, if given, drops that exact character's own name - possessive
 *  ("Narmaya's attacks drain HP") or as the subject of "gains"
 *  ("Rackam gains Stout Heart") - anywhere in the clause, not just the start:
 *  a per-character file always means the subject, so naming it is noise.
 *  Never applied to other proper-noun possessives (skill names etc), since
 *  it only ever matches this exact name. */
export function labelize(description, selfName) {
  let text = description.trim();

  // 0. summon-count scaling has no leftover clause to keep processing
  const boost = text.match(BOOST_BY_SUMMON_COUNT);
  if (boost) {
    const [, stat, amount, subject] = boost;
    return `${subject} summons: ${stat} ${amount} max`;
  }
  const boostCond = text.match(BOOST_BY_CONDITION);
  if (boostCond) {
    const [, stat, amount] = boostCond;
    return `${stat} ${amount} max`;
  }
  const gainUpTo = text.match(GAIN_UP_TO_BASED_ON);
  if (gainUpTo) {
    const [, stat, amount] = gainUpTo;
    return `${stat.replace(/ Dealt$/, "")} ${amount} max`;
  }
  // "All of <name>'s skills gain Skill Cooldown -N%." - a global per-skill CD
  // trait every character likely has in r1; the name is redundant here too
  if (selfName) {
    const allSkillsCd = text.match(
      new RegExp(`^All of ${selfName}'s skills gain Skill Cooldown ([+-]?\\d+%)\\.?$`),
    );
    if (allSkillsCd) return `Skill CD ${allSkillsCd[1]}`;
  }

  // 1. strip the perk gate ("Insight Rank II:"). Its tier rides on the cell's
  //    perkRank field (see perkRankOf), not the label; the style name is
  //    redundant with the column the cell renders in.
  const gate = text.match(/^(?:Insight|Essence|Crux) Rank I{1,3}:\s*/);
  if (gate) text = text.slice(gate[0].length);

  // 2. first sentence only - the rest is stacking/exclusivity boilerplate - and
  //    drop the "but <drawback>" tail
  text = text.split(/\.(?:\s|$)/)[0].replace(/\s+but\s.*$/, "");

  // 3. "in exchange for X" is the trait; the lead-in is flavor
  text = text.replace(/^.*\sin exchange for\s+/, "");

  // 4. per-sigil scaling: "E per T-type sigil equipped (max N)" -> "E xT"
  text = text.replace(
    /\s*per (.+?)-type sigils? equipped/,
    (_, type) => ` ×${SIGIL_TYPES[type] ?? type}`,
  );

  // 5. parens: values come out bare, anything left trailing is a caveat
  text = text.replace(/\((\d[^)]*)\)/g, "$1").replace(/\s*\([^)]*\)\s*$/, "");

  // 6a. condition clause -> keyword prefix, colon kept
  let condition = "";
  for (const [re, fmt] of CONDITIONS) {
    const m = text.match(re);
    if (m) {
      condition = fmt(m);
      text = text.slice(m[0].length);
      break;
    }
  }

  // 6b. subject clause -> colon dropped. A subject the stat already implies
  //     (Charged Attacks + Charge Time) just repeats itself.
  const subject = text.match(/^([^:]{1,22}):\s*(.+)$/s);
  if (subject) {
    const [, head, rest] = subject;
    const stem = head.split(" ")[0].slice(0, 6);
    text = rest.includes(stem) ? rest : `${head} ${rest}`;
  } else if (!condition) {
    text = text.replace(/^Charged Attacks (?=Charge Time)/, "");
  }

  // 6c. the character's own name, wherever it sits in what's left - the
  // final capitalize-first-letter pass fixes up a lowercase remainder
  if (selfName) {
    text = text.replace(new RegExp(`\\b${selfName}'s\\s+`, "g"), "");
    text = text.replace(new RegExp(`\\b${selfName} gains?\\s+`, "gi"), "");
  }

  // 7. filler, then the term dictionary over the assembled label - the
  //    condition prefix names skills too
  for (const [re, out] of FILLER) text = text.replace(re, out);
  let label = (condition + text).replace(/\s+/g, " ").trim();
  for (const [re, out] of TERMS) label = label.replace(re, out);
  // a kept subject already says which charge this is
  if (subject) label = label.replace(/ Charge Time\b/, " Charge");
  // a trailing "per stack" is redundant once "Stack" already named the mechanic
  if (/\bStack\b/.test(label)) label = label.replace(/\s+per stack$/i, "");
  for (const trim of LADDER) {
    if (label.length <= HARD) break;
    label = trim(label);
  }
  // last resort: a *subject* prefix (not a condition we built on purpose) can
  // go if nothing else freed up room
  if (label.length > HARD && !condition)
    label = label.replace(/^[^:]{1,14}:\s*/, "");
  // a condition can carry mid-sentence case from the source text ("butterfly
  // count") - a label is always its own sentence
  label = label.replace(/^[a-z]/, (c) => c.toUpperCase());
  return label;
}

/** The style-rank perk tier a description is gated behind, as 1-3, or undefined. */
export function perkRankOf(description) {
  const gate = description.match(/^(?:Insight|Essence|Crux) Rank (I{1,3}):/);
  return gate ? gate[1].length : undefined;
}

// Hand-tuned labels that no text rule should generalize from - each one needed
// outside knowledge (game mechanics, or a deliberate call to drop a value) to
// reach, not a sentence shape another cell will ever repeat. Applied after
// derivation, so --force can reseed everything else without losing these.
const OVERRIDES = {
  "narmaya.json": {
    "insight.r2.7": "Zone Attack Charge Speed +20%",
  },
  "cagliostro.json": {
    "insight.r2.5": "Collapse ++ ATK +5% Cap +10%",
    "insight.r3.13": "Collapse ++ ATK +5% Cap +10%",
    "insight.r3.14": "Combo Finisher Debuff +10%",
    "essence.r3.15": "Instant Collapse: Cap +30%",
    "crux.r2.5": "Rhizomata: Phantasmagoria to all",
    "crux.r2.6": "Phantasmagoria Dur +10%",
    "crux.r3.14": "Phantasmagoria grants Cap↑", // value varies by tier, not worth showing
    "crux.r3.15": "Collapse ++: 20% chance to reset CD",
    "crux.ex.21": "Phantasmagoria grants Cap↑",
  },
  "rackam.json": {
    "essence.ex.23": "Wild Gunsmoke: add. ATK +5% / Dur +10%", // two effects in one cell
    "crux.r2.5": "Post-Collateral: HP +10%",
  },
  "charlotta.json": {
    "insight.ex.21": "Noble Order: +50k dmg buffer",
    "insight.r3.14": "Noble Order ATK +10% Cap +10%",
    "essence.r3.13": "Diamond Cutter Cap +20%/lvl",
    "essence.r3.15": "Charged block window +10%",
    "essence.ex.21": "Diamond Cutter Cap +20%/lvl",
    "crux.r3.15": "Enhanced Noble Stance: Cap +30%",
  },
  "io.json": {
    "essence.ex.21": "Freeze+Lightning Debuff +10%",
  },
  "katalina.json": {
    "crux.r2.5": "Blade Blue ATK +3% Cap +5%/lvl",
    "crux.r3.14": "Blade Blue ATK +3% Cap +5%/lvl",
  },
};

// ------------------------------------------------------------------ cli
// Character files are hand-authored from in-game screenshots; this fills the
// label and perkRank fields, never the description they derive from.
const { pathToFileURL } = await import("node:url");
const entryPoint = process.argv[1];
if (entryPoint && import.meta.url === pathToFileURL(entryPoint).href) {
  const { readdir, readFile, writeFile } = await import("node:fs/promises");
  const force = process.argv.includes("--force");
  const dry = process.argv.includes("--dry");
  const dir = new URL("../src/catalog/characters/", import.meta.url);

  // keep the hand-authored layout: one cell per line, scalar arrays inline
  const serialize = (value) =>
    JSON.stringify(value, null, 2)
      .replace(
        /\{\n\s*([^{}[\]]+?)\n\s*\}/g,
        (_, body) => `{ ${body.trim().replace(/\s*\n\s*/g, " ")} }`,
      )
      .replace(
        /\[\n\s*((?:\d+,\n\s*)*\d+)\n\s*\]/g,
        (_, body) => `[${body.replace(/\s*\n\s*/g, " ")}]`,
      ) + "\n";

  for (const file of (await readdir(dir)).filter((f) => f.endsWith(".json"))) {
    const path = new URL(file, dir);
    const character = JSON.parse(await readFile(path));
    const selfName = character.id[0].toUpperCase() + character.id.slice(1);
    const overrides = OVERRIDES[file] ?? {};
    let derived = 0,
      kept = 0,
      overridden = 0;
    const long = [];
    for (const ranks of Object.values(character.masterTraits))
      for (const [key, cells] of Object.entries(ranks)) {
        if (key === "title") continue;
        for (const cell of cells) {
          if (overrides[cell.id]) {
            cell.label = overrides[cell.id];
            overridden++;
          } else if (cell.label && !force) kept++;
          else {
            cell.label = labelize(cell.description, selfName);
            derived++;
          }
          // Legacy labels carried the gate as a "(I)" prefix; it now lives in
          // perkRank, read from the description (the archive truth).
          cell.label = cell.label.replace(/^\(I{1,3}\)\s*/, "");
          const rank = perkRankOf(cell.description);
          if (rank) cell.perkRank = rank;
          else delete cell.perkRank;
          if (cell.label.length > SOFT) long.push(cell.label);
        }
      }
    if (!dry) await writeFile(path, serialize(character));
    console.log(
      `${file}: ${derived} derived, ${kept} kept, ${overridden} overridden${dry ? " (dry run)" : ""}`,
    );
    // over SOFT wraps to two lines - legible, but the first place to hand-tune
    for (const label of long)
      console.log(`  ${String(label.length).padStart(3)}  ${label}`);
  }
}
