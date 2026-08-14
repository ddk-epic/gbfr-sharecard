import type { Build } from "./build";
import type { CharacterId } from "@/catalog/ids";

const SAVE_DEBOUNCE_MS = 300;

const storageKey = (characterId: CharacterId) =>
  `gbfr-sharecard:build:${characterId}`;

/** Source of truth while the tab lives; localStorage is a subscriber. */
const builds = new Map<CharacterId, Build | null>();
/** Characters whose build has changed in memory but is not yet written out. */
const dirty = new Set<CharacterId>();
let saveTimer: ReturnType<typeof setTimeout> | undefined;

export function readBuild(characterId: CharacterId): Build | null {
  const known = builds.get(characterId);
  if (known !== undefined) return known;
  const build = hydrate(characterId);
  builds.set(characterId, build);
  return build;
}

export function hasBuild(characterId: CharacterId): boolean {
  return readBuild(characterId) !== null;
}

export function writeBuild(build: Build): void {
  builds.set(build.characterId, build);
  dirty.add(build.characterId);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, SAVE_DEBOUNCE_MS);
  armFlushOnExit();
}

/** Discard-and-start-fresh on schemaVersion mismatch or parse failure. No migration. */
function hydrate(characterId: CharacterId): Build | null {
  try {
    const raw = localStorage.getItem(storageKey(characterId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Build;
    if (parsed.schemaVersion !== 3 || parsed.characterId !== characterId)
      return null;
    return parsed;
  } catch {
    return null;
  }
}

// Per character: switching mid-debounce must not drop the write owed to the
// character being left.
function flush(): void {
  for (const characterId of dirty) {
    const build = builds.get(characterId);
    if (!build) continue;
    // A full quota or a blocked store loses this write; the in-memory build is
    // still the one the app reads, so the tab carries on unaffected.
    try {
      localStorage.setItem(storageKey(characterId), JSON.stringify(build));
    } catch {
      // discard
    }
  }
  dirty.clear();
}

let armed = false;

// A reload inside the debounce window would lose the edit.
// pagehide fires for both navigation and bfcache; unload does not.
// Armed on first write: importing this module must not need a DOM.
function armFlushOnExit(): void {
  if (armed) return;
  armed = true;
  addEventListener("pagehide", flush);
}
