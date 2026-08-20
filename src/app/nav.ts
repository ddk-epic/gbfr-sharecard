import { asCharacterId } from "@/catalog";
import type { CharacterId } from "@/catalog/ids";
import { EDITOR_VIEWS, type EditorView } from "@/screens/editor/views";

export type { EditorView };

export type View = "select" | EditorView | "card";

export type Nav =
  | { view: "select" }
  | { view: Exclude<View, "select">; character: CharacterId };

export const SELECT = { view: "select" } as const;

const LINKABLE: readonly string[] = [...EDITOR_VIEWS, "card"];

export function decodeNav(raw: Record<string, unknown>): Nav {
  const character = asCharacterId(raw.c);
  const view = raw.v;
  if (!character || typeof view !== "string" || !LINKABLE.includes(view))
    return SELECT;
  return { view: view as Exclude<View, "select">, character };
}

export const encodeNav = (nav: Nav): Record<string, string> =>
  nav.view === "select" ? {} : { c: nav.character, v: nav.view };

/** Whether the params already match encodeNav's output exactly. */
export function isCanonical(raw: Record<string, unknown>): boolean {
  const canonical = encodeNav(decodeNav(raw));
  const keys = Object.keys(raw);
  return (
    keys.length === Object.keys(canonical).length &&
    keys.every((key) => raw[key] === canonical[key])
  );
}

/** The track slot a view sits on. The editor's panes all share slot 1. */
export const depthOf = (nav: Nav) =>
  nav.view === "select" ? 0 : nav.view === "card" ? 2 : 1;
