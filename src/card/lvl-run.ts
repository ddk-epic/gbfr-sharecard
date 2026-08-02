/**
 * A run of GBFR UI text on one baseline, in badge units. Parts carry their own
 * size, so a small "T." and a full-size number sit in one run.
 */
import { BADGE } from "./lvl-badge";

/** The word every level display is built around; also the hand-kerned trio. */
export const LVL_WORD = "Lvl";

/** Reserved digits; sigil levels between 11-15, weapon trait levels to 35. */
export const LEVEL_DIGITS = 2;

/**
 * A ghost stand-in of a leading digit.
 */
const GHOST = "\u2007";

/** Pads a level to the reserved width, so a column of them shares one x. */
export const ghosted = (digits: string) =>
  GHOST.repeat(Math.max(0, LEVEL_DIGITS - digits.length)) + digits;

export type RunPart = {
  text: string;
  /** Font size against the run's base size. */
  scale: number;
  /** Badge units before the part. */
  lead?: number;
  /** Badge units between two characters, by the left one's index. */
  track?: number;
  /** Keyline width against the base - absolute, so it does not follow `scale`. */
  outline?: number;
};

export type LaidPart = {
  text: string;
  xs: number[];
  size: number;
  outline: number;
};

/**
 * A laid-out run; `lo`/`hi` bound its ink, which is what a box is drawn from.
 * `end` is the pen after the last advance - where a following part would lead off.
 */
export type Run = { parts: LaidPart[]; lo: number; hi: number; end: number };

/** Fits a size whose cap height is `cap` badge units; null if the face has no ink. */
export function fitSize(
  ctx: CanvasRenderingContext2D,
  family: string,
  cap: number,
): number | null {
  let size = cap / 0.71;
  for (let i = 0; i < 4; i++) {
    ctx.font = `${size}px ${family}`;
    const measured = ctx.measureText("L").actualBoundingBoxAscent;
    if (!measured) return null;
    size *= cap / measured;
  }
  return size;
}

/**
 * One pen across every part, each at its own size. Digits step by the widest
 * digit's advance and centre in that slot - faux tabular figures, so a level is
 * one width whatever its digits. Hand kerning rides the "Lvl" trio wherever in
 * a part it sits.
 */
export function layoutRun(
  ctx: CanvasRenderingContext2D,
  family: string,
  base: number,
  parts: RunPart[],
): Run {
  const { kern1, kern2 } = BADGE.lvl;
  let pen = 0;
  let lo = Infinity;
  let hi = -Infinity;
  const laid: LaidPart[] = [];

  for (const part of parts) {
    const size = base * part.scale;
    ctx.font = `${size}px ${family}`;
    const figure = Math.max(
      ...[..."0123456789"].map((d) => ctx.measureText(d).width),
    );
    const trio = part.text.indexOf(LVL_WORD);
    const xs: number[] = [];
    pen += part.lead ?? 0;

    for (let i = 0; i < part.text.length; i++) {
      const ch = part.text[i];
      // No glyph, so xs stays one-per-rendered-character.
      if (ch === GHOST) {
        pen += figure;
        continue;
      }
      const m = ctx.measureText(ch);
      const digit = ch >= "0" && ch <= "9";
      if (trio >= 0 && i === trio + 1) pen += kern1 * part.scale;
      if (trio >= 0 && i === trio + 2) pen += kern2 * part.scale;
      const x = pen + (digit ? (figure - m.width) / 2 : 0);
      xs.push(x);
      lo = Math.min(lo, x - m.actualBoundingBoxLeft);
      hi = Math.max(hi, x + m.actualBoundingBoxRight);
      pen += digit ? figure : m.width;
      // Between the letters only, so the part's trailing edge stays its ink.
      if (i < part.text.length - 1) pen += (part.track ?? 0) * part.scale;
    }

    laid.push({
      text: part.text.replaceAll(GHOST, ""),
      xs,
      size,
      outline: part.outline ?? 1,
    });
  }

  // Ink both ends, never the advance: padding off the advance carries the last
  // digit's side bearing on the right only, and reads lopsided. Reserving a
  // fixed width is the caller's job - it lays a reference run and merges.
  return { parts: laid, lo, hi, end: pen };
}
