import { useSyncExternalStore } from "react";

/** The face every hand-set label is measured and drawn in. */
const FAMILY = "'GBFR UI Medium'";

/** Every glyph the card's labels measure: the trait prefix, word, unit, digits. */
const GLYPHS = "T.Lvl%0123456789";

let ready = false;
let started = false;
const listeners = new Set<() => void>();

/** Loads the label face once, then flips ready and wakes every subscriber. */
function start() {
  if (started) return;
  started = true;
  void document.fonts
    .load(`16px ${FAMILY}`, GLYPHS)
    .then(() => document.fonts.ready)
    .then(() => {
      ready = true;
      listeners.forEach((wake) => wake());
    })
    .catch((err: unknown) => {
      console.warn(`${FAMILY} failed to load; labels omitted`, err);
    });
}

/**
 * True once the label face is loaded and safe to measure. One shared load backs
 * every label, so measuring can then run synchronously in render rather than in
 * a per-component effect.
 */
export function useCardFontsReady(): boolean {
  return useSyncExternalStore(
    (wake) => {
      start();
      listeners.add(wake);
      return () => listeners.delete(wake);
    },
    () => ready,
    () => false,
  );
}
