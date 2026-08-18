import type { CharacterId } from "@/catalog/ids";
import { portraitUrl } from "@/assets/urls";
import { characterPortraitOffset } from "@/assets/art-metrics";

/**
 * The full-height backdrop layer: the character art, spanning column 1 top to
 * bottom behind every section (z-0), bleeding to the card's real edges.
 */
const PORTRAIT_PAD = 20;
const PORTRAIT_BLEED_LEFT = 10;
const PORTRAIT_BLEED_RIGHT = 130;
/** Opacity the left/right fade reaches at the end of its bleed (0 = fully gone). */
const PORTRAIT_BLEED_OPACITY = 0;
/** Bottom fade: solid down to this line (%), then to this opacity at the edge. */
const PORTRAIT_FADE_START = 65;
const PORTRAIT_FADE_OPACITY = 0.3;
/** Global art zoom: background height as a % of the box. */
const PORTRAIT_SCALE = 135;

export function Portrait({
  characterId,
  seam,
}: {
  characterId: CharacterId;
  /** Column 1's right edge (inset + first column width): the art aligns to it. */
  seam: number;
}) {
  const artW = seam + 2 * PORTRAIT_BLEED_RIGHT;
  const bleedEnd = `rgba(0,0,0,${PORTRAIT_BLEED_OPACITY})`;
  const maskH = `linear-gradient(to right, ${bleedEnd} ${PORTRAIT_BLEED_RIGHT - PORTRAIT_BLEED_LEFT}px, #000 ${PORTRAIT_PAD + PORTRAIT_BLEED_RIGHT}px, #000 ${seam - PORTRAIT_PAD + PORTRAIT_BLEED_RIGHT}px, ${bleedEnd} ${artW}px)`;
  const maskV = `linear-gradient(#000 ${PORTRAIT_FADE_START}%, rgba(0,0,0,${PORTRAIT_FADE_OPACITY}) 100%)`;

  const { x: portraitX, y: portraitY } = characterPortraitOffset(characterId);

  return (
    <div
      className="absolute top-0 z-0"
      style={{
        left: -PORTRAIT_BLEED_RIGHT,
        width: artW,
        height: "100%",
        backgroundImage: `url('${portraitUrl(characterId)}')`,
        backgroundPosition: `calc(50% + ${portraitX}px) calc(50% + ${portraitY}px)`,
        backgroundSize: `auto ${PORTRAIT_SCALE}%`,
        // Two mask layers combined per-pixel: a pixel shows only where both keep it.
        maskImage: `${maskH}, ${maskV}`,
        maskComposite: "intersect",
      }}
    />
  );
}
