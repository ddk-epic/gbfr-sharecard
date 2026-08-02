import type { CSSProperties } from "react";
import { parchmentUrl } from "../data";

/**
 * Parchment backdrop and its diagonal cut, shared by the card and the page
 * shell. Two independent layers: the mask window (outer) owns the cut; the
 * texture layer (inner) sizes/offsets/squeezes on its own. Neither drags the
 * other.
 *
 * Cut geometry (body plate + detached bottom spike) traced from the art's baked
 * diagonal, 1392x1813 source. Mask not clip-path: the spike is an island past
 * the cone gap. Cone + spike are x-offsets from the body edge, so re-angling the
 * edge carries them along; the edge pivots about where it crosses `pivotY`.
 */
const ART_W = 1392;
const ART_H = 1813;
// The art's own edge, before re-angling: (1390,0) -> (622,1813), ~23deg.
const EDGE_TOP_X = 1390;
const EDGE_BOT_X = 622;
// Spike geometry, as x-offsets from the body edge (measured off the art).
const SPIKE_TOP_Y = 453; // begins 25% down; nothing above
const SPIKE_APEX_OFF = 8; // tip, past the edge at SPIKE_TOP_Y
const SPIKE_INNER_OFF = 26; // cone gap at the bottom
const SPIKE_OUTER_OFF = 78; // edge -> spike outer, at the bottom

function parchmentMask(angleDeg: number, pivotY: number) {
  const anchorX = EDGE_TOP_X + ((EDGE_BOT_X - EDGE_TOP_X) * pivotY) / ART_H;
  const tan = Math.tan((angleDeg * Math.PI) / 180);
  const topX = anchorX + tan * pivotY;
  const botX = topX - tan * ART_H;
  const edge = (y: number) => topX + ((botX - topX) * y) / ART_H;
  const apexX = edge(SPIKE_TOP_Y) + SPIKE_APEX_OFF;
  const innerX = botX + SPIKE_INNER_OFF;
  const outerX = botX + SPIKE_OUTER_OFF;
  const f = (n: number) => n.toFixed(1);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${ART_W} ${ART_H}' preserveAspectRatio='none'>` +
    `<polygon points='0,0 ${f(topX)},0 ${f(botX)},${ART_H} 0,${ART_H}' fill='#fff'/>` +
    `<polygon points='${f(apexX)},${SPIKE_TOP_Y} ${f(outerX)},${ART_H} ${f(innerX)},${ART_H}' fill='#fff'/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export type ParchmentBackdropProps = {
  /** Body-edge angle from vertical. */
  angle?: number;
  /** Edge pivot: ART_H = bottom, 0 = top. */
  pivotY?: number;
  /** Mask window width; the span the angle maps into. */
  maskW?: number;
  width?: number;
  /** Texture offset inside the window, px. */
  offsetX?: number;
  offsetY?: number;
  /** 1 = natural, <1 = narrower. */
  squeezeX?: number;
  className?: string;
  style?: CSSProperties;
};

export function ParchmentBackdrop({
  angle = 14,
  pivotY = 2900,
  maskW = 1106,
  width = 928,
  offsetX = -10,
  offsetY = 0,
  squeezeX = 1,
  className = "absolute top-0 left-0 z-0 h-full overflow-hidden",
  style,
}: ParchmentBackdropProps) {
  const mask = parchmentMask(angle, pivotY);
  return (
    <div
      aria-hidden
      className={className}
      style={{
        width: maskW,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        ...style,
      }}
    >
      <div
        className="absolute top-0 left-0 h-full"
        style={{
          width,
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          backgroundImage: `url("${parchmentUrl}")`,
          backgroundSize: `${squeezeX * 100}% 100%`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left top",
        }}
      />
    </div>
  );
}
