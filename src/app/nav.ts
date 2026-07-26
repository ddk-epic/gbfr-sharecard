// Where the user is, kept in the URL so a reload lands on the same screen.

import { asCharacterId } from "../data";
import type { CharacterId } from "../domain/build";

/**
 * The one route's search params. Only the select screen has no character.
 * The editor's open tab is deliberately absent - presentation state.
 */
export type Nav =
  | { screen: "select" }
  | { screen: "editor"; character: CharacterId }
  | { screen: "card"; character: CharacterId };

export const SELECT = { screen: "select" } as const;

/** Unparseable input decodes to the character select grid, never throws. */
export function decodeNav(raw: Record<string, unknown>): Nav {
  const character = asCharacterId(raw.character);
  if (!character) return SELECT;
  if (raw.screen === "editor" || raw.screen === "card")
    return { screen: raw.screen, character };
  return SELECT;
}

export const encodeNav = (nav: Nav): Record<string, string> =>
  nav.screen === "select"
    ? {}
    : { character: nav.character, screen: nav.screen };

/** Whether the params already match encodeNav's output exactly. */
export function isCanonical(raw: Record<string, unknown>): boolean {
  const canonical = encodeNav(decodeNav(raw));
  const keys = Object.keys(raw);
  return (
    keys.length === Object.keys(canonical).length &&
    keys.every((key) => raw[key] === canonical[key])
  );
}

export const depthOf = (nav: Nav) =>
  nav.screen === "card" ? 2 : nav.screen === "editor" ? 1 : 0;
