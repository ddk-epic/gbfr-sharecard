// Generate the skill catalog from the game archive.
//   node scripts/skills.mjs [extract-dir] [--write]
//
// Patches src/data/characters/<id>.json in place with skills: [{id, name}].
// `name` is the game's own English skill name; `id` is that name slugged the
// same way icons.mjs names the icon file, so it always resolves
// public/icons/skills/<character>/<id>.webp without an index.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { readTextTables } from "./msgpack.mjs";

const EXTRACT = process.argv[2]?.startsWith("--")
  ? "../gbfr-extract"
  : (process.argv[2] ?? "../gbfr-extract");
const WRITE = process.argv.includes("--write");
const DATA = new URL("../src/data/", import.meta.url);
const ICONS_DIR = new URL("../public/icons/skills/", import.meta.url);

const text = await readTextTables(`${EXTRACT}/system/table/text/en`, { readFile, readdir });
const en = (k) => String(text.get(k) ?? "").split("\n")[0].trim();
const db = new DatabaseSync(`${EXTRACT}/tables.sqlite`);

// Duplicated verbatim from icons.mjs/extract.mjs - the icon filename and the
// catalog id only join because every script slugs a name the same way.
const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// --- character slug by CharaId (PL0400 -> artId 0400 -> characters.json) ---------------
const characters = JSON.parse(await readFile(new URL("characters.json", DATA)));
const slugByArtId = new Map(characters.map((c) => [c.artId, c.id]));
const charaSlug = (charaId) => slugByArtId.get(charaId.replace(/^PL/, "")) ?? null;

// --- same `ability` query icons.mjs uses to extract skill icons -----------------------
// IconFileName like '2000%' is Id's second form, not a character - see icons.mjs.
const skillsByChar = new Map(); // character slug -> [{id, name}]
for (const row of db
  .prepare(
    `select ReqCharaId1, Unk5 from ability
     where IconFileName != '' and IconFileName not like '2000%'`,
  )
  .all()) {
  const name = en(row.Unk5);
  const character = charaSlug(row.ReqCharaId1);
  if (!name || !character) continue;
  const list = skillsByChar.get(character) ?? [];
  const id = slug(name);
  if (!list.some((s) => s.id === id)) list.push({ id, name });
  skillsByChar.set(character, list);
}

// --- self-check: every id must already have a committed icon, nothing missing ---------
let ok = true;
for (const [character, skills] of skillsByChar) {
  let files;
  try {
    files = await readdir(new URL(`${character}/`, ICONS_DIR));
  } catch {
    continue; // no icon folder extracted for this character yet - not this ticket's roster
  }
  const iconIds = new Set(files.map((f) => f.replace(/\.webp$/, "")).sort());
  const gotIds = new Set(skills.map((s) => s.id));
  const missingIcon = [...gotIds].filter((id) => !iconIds.has(id));
  const missingSkill = [...iconIds].filter((id) => !gotIds.has(id));
  if (missingIcon.length || missingSkill.length) {
    ok = false;
    console.error(
      `${character}: mismatch vs public/icons/skills/${character}/` +
        (missingIcon.length ? ` - no icon for: ${missingIcon.join(", ")}` : "") +
        (missingSkill.length ? ` - no archive skill for: ${missingSkill.join(", ")}` : ""),
    );
  }
}

console.log(`characters with skills: ${skillsByChar.size}`);
if (!ok) {
  console.error("\nself-check FAILED - not writing");
  process.exit(1);
}
console.log("self-check passed");

if (WRITE) {
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

  for (const c of characters) {
    const url = new URL(`characters/${c.id}.json`, DATA);
    let cat;
    try {
      cat = JSON.parse(await readFile(url));
    } catch {
      continue;
    }
    const skills = skillsByChar.get(c.id);
    if (!skills) continue;
    const { id, ...rest } = cat;
    delete rest.skills;
    const patched = { id, skills, ...rest };
    await writeFile(url, serialize(patched));
    console.log(`patched characters/${c.id}.json`);
  }
}
