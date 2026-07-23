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
];

const SIGIL_TYPES = {
  "Basic Stats": "Basic",
  Attack: "Attack",
  "Defense- or Support": "Def/Sup",
};

const FILLER = [
  [/\s+from [A-Z][\w ]*$/, ""], // "+5% from Superstar" - source attribution
  [/\s*\bnow grants (.+?) instead of .*$/, "→$1"], // Heal Winds -> Shield
  [/\bgains? an additional\s+/, ""],
  [/\bIo also gains\s+/, ""], // the character's own name adds nothing
  [/\balso (?:gains?|inflicts)\s+/, ""],
  [/\bgains?\s+/, ""],
  [/\binflicts\s+/, ""],
  [/\bGrants\s+/i, ""],
  [/(\w) \+ (\w)/g, "$1+$2"], // skill combos: "Freeze + Fire" -> "Freeze+Fire"
  [/\s+and\s+(?=[A-Z])/, " "], // sibling effects run together
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
  // descriptions spell the buff arrows out; labels take the glyph back
  [/\b(ATK|DEF) Up\b/g, "$1↑"],
  [/\b(ATK|DEF) Down\b/g, "$1↓"],
  ...SKILL_SHORTS,
  [/(\d+),?000\b/g, "$1k"], // 15,000 -> 15k · 3000 -> 3k
  [/\s*sec\.?/g, "s"],
];

// Applied in order, only while the label still overflows. Values are never
// dropped - only the words around them.
const LADDER = [
  (t) => t.replace(/\s*\([^)]*\)\s*$/, ""), // trailing caveat
  (t) => t.replace(/\bDMG Cap\b/, "Cap"),
  (t) => t.replace(/\s+(?:AoE|Dur)\b/, ""), // qualifier nouns
  (t) => t.replace(/^(\([IV]+\) )?[^:]{1,14}:\s*/, "$1"), // condition prefix
];

/** description -> cell label. Deterministic; no per-cell special cases. */
export function labelize(description) {
  let text = description.trim();

  // 1. perk gate -> roman-numeral marker. The style name is redundant with the
  //    column the cell renders in.
  let marker = "";
  const gate = text.match(/^(?:Insight|Essence|Crux) Rank (I{1,3}):\s*/);
  if (gate) {
    marker = `(${gate[1]}) `;
    text = text.slice(gate[0].length);
  }

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

  // 7. filler, then the term dictionary over the assembled label - the
  //    condition prefix names skills too
  for (const [re, out] of FILLER) text = text.replace(re, out);
  let label = (marker + condition + text).replace(/\s+/g, " ").trim();
  for (const [re, out] of TERMS) label = label.replace(re, out);
  // a kept subject already says which charge this is
  if (subject) label = label.replace(/ Charge Time\b/, " Charge");
  for (const trim of LADDER) {
    if (label.length <= HARD) break;
    label = trim(label);
  }
  return label;
}

// ------------------------------------------------------------------ cli
// Character files are hand-authored from in-game screenshots; this only fills
// the label field, never the description it derives from.
const { pathToFileURL } = await import("node:url");
const entryPoint = process.argv[1];
if (entryPoint && import.meta.url === pathToFileURL(entryPoint).href) {
  const { readdir, readFile, writeFile } = await import("node:fs/promises");
  const force = process.argv.includes("--force");
  const dry = process.argv.includes("--dry");
  const dir = new URL("../src/data/characters/", import.meta.url);

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
    let derived = 0,
      kept = 0;
    const long = [];
    for (const ranks of Object.values(character.masterTraits))
      for (const cells of Object.values(ranks))
        for (const cell of cells) {
          if (cell.label && !force) kept++;
          else {
            cell.label = labelize(cell.description);
            derived++;
          }
          if (cell.label.length > SOFT) long.push(cell.label);
        }
    if (!dry) await writeFile(path, serialize(character));
    console.log(
      `${file}: ${derived} derived, ${kept} kept${dry ? " (dry run)" : ""}`,
    );
    // over SOFT wraps to two lines - legible, but the first place to hand-tune
    for (const label of long)
      console.log(`  ${String(label.length).padStart(3)}  ${label}`);
  }
}
