// localStorage persistence - one Build per character.

import type { Build } from "./build";

const SAVE_DEBOUNCE_MS = 300;

const storageKey = (characterId: string) =>
  `gbfr-sharecard:build:${characterId}`;

/** Discard-and-start-fresh on schemaVersion mismatch or parse failure. No migration in v1. */
export function loadBuild(characterId: string): Build | null {
  try {
    const raw = localStorage.getItem(storageKey(characterId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Build;
    if (parsed.schemaVersion !== 1 || parsed.characterId !== characterId)
      return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasBuild(characterId: string): boolean {
  return loadBuild(characterId) !== null;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

export function saveBuild(build: Build): void {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(storageKey(build.characterId), JSON.stringify(build));
  }, SAVE_DEBOUNCE_MS);
}
