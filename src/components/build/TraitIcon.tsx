import type { TraitId } from "@/catalog/ids";
import { traitIconUrl } from "@/assets/urls";

export const GLYPH_TO_TEXT_RATIO = 7 / 6;

const BOX = {
  width: `${GLYPH_TO_TEXT_RATIO}em`,
  height: `${GLYPH_TO_TEXT_RATIO}em`,
};

/** Empty glyph box, for a placeholder indent. */
export function TraitIconStrut({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`flex-none ${className}`} style={BOX} />;
}

export function TraitIcon({
  trait,
  placeholder = false,
}: {
  trait: TraitId | null;
  placeholder?: boolean;
}) {
  const url = trait ? traitIconUrl(trait) : null;
  if (url) return <img src={url} alt="" className="flex-none" style={BOX} />;
  return placeholder ? <TraitIconStrut /> : null;
}
