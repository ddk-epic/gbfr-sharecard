/**
 * A label of GBFR UI text on one baseline, in badge units. Pieces carry their
 * own size, so a small "T." and a full-size number sit in one label.
 */
import { BADGE } from "./lvl-badge";

/** The word every level display is built around; also the hand-kerned trio. */
export const LVL_WORD = "Lvl";

export type LabelPiece = {
  text: string;
  /** Font size against the label's base size. */
  scale: number;
  /** Badge units before the piece. */
  lead?: number;
  /** Badge units between two characters, by the left one's index. */
  track?: number;
  /** Keyline width against the base - absolute, so it does not follow `scale`. */
  outline?: number;
  /** Set in the word ink ramp rather than the number's full-cap ink. */
  word?: boolean;
};

export type LaidPiece = {
  text: string;
  positions: number[];
  size: number;
  outline: number;
  word: boolean;
};

/**
 * A laid-out label; `inkLeft`/`inkRight` bound its ink, which is what a box is
 * drawn from. `penEnd` is the pen after the last advance - where a following
 * piece would lead off.
 */
export type LaidLabel = {
  pieces: LaidPiece[];
  inkLeft: number;
  inkRight: number;
  penEnd: number;
};

let ctx: CanvasRenderingContext2D | null = null;

/** One offscreen 2D context, shared by every label's synchronous measuring. */
export function labelCtx(): CanvasRenderingContext2D | null {
  ctx ??= document.createElement("canvas").getContext("2d");
  return ctx;
}

/** Fits a size whose cap height is `cap` badge units; null if the face has no ink. */
export function fitSize(
  ctx: CanvasRenderingContext2D,
  family: string,
  cap: number,
): number | null {
  let size = cap / 0.71;
  for (let i = 0; i < 4; i++) {
    ctx.font = `${size}px ${family}`;
    const capInk = ctx.measureText("L").actualBoundingBoxAscent;
    if (!capInk) return null;
    size *= cap / capInk;
  }
  return size;
}

/**
 * One pen across every piece, each at its own size. Digits step by the widest
 * digit's advance and centre in that slot - faux tabular figures, so a level is
 * one width whatever its digits. Hand kerning rides the "Lvl" trio wherever in
 * a piece it sits.
 */
export function layoutLabel(
  ctx: CanvasRenderingContext2D,
  family: string,
  baseSize: number,
  pieces: LabelPiece[],
): LaidLabel {
  const { kern1, kern2 } = BADGE.lvl;
  let pen = 0;
  let inkLeft = Infinity;
  let inkRight = -Infinity;
  const laid: LaidPiece[] = [];

  for (const piece of pieces) {
    const size = baseSize * piece.scale;
    ctx.font = `${size}px ${family}`;
    const slotWidth = Math.max(
      ...[..."0123456789"].map((d) => ctx.measureText(d).width),
    );
    const lvlAt = piece.text.indexOf(LVL_WORD);
    const positions: number[] = [];
    pen += piece.lead ?? 0;

    for (let i = 0; i < piece.text.length; i++) {
      const ch = piece.text[i];
      const metrics = ctx.measureText(ch);
      const digit = ch >= "0" && ch <= "9";
      if (lvlAt >= 0 && i === lvlAt + 1) pen += kern1 * piece.scale;
      if (lvlAt >= 0 && i === lvlAt + 2) pen += kern2 * piece.scale;
      const x = pen + (digit ? (slotWidth - metrics.width) / 2 : 0);
      positions.push(x);
      inkLeft = Math.min(inkLeft, x - metrics.actualBoundingBoxLeft);
      inkRight = Math.max(inkRight, x + metrics.actualBoundingBoxRight);
      pen += digit ? slotWidth : metrics.width;
      // Between the letters only, so the piece's trailing edge stays its ink.
      if (i < piece.text.length - 1) pen += (piece.track ?? 0) * piece.scale;
    }

    laid.push({
      text: piece.text,
      positions,
      size,
      outline: piece.outline ?? 1,
      word: piece.word ?? false,
    });
  }

  // Ink both ends, never the advance: padding off the advance carries the last
  // digit's side bearing on the right only, and reads lopsided. Reserving a
  // fixed width is the caller's job - it lays a reference label and merges.
  return { pieces: laid, inkLeft, inkRight, penEnd: pen };
}
