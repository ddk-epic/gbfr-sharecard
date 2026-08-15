import type { TraitId } from "@/catalog/ids";
import { traitIconUrl } from "@/assets/urls";

/** `em` tracks the caller's text size; the rest are fixed px presets. */
const TRAIT_ICON_SIZE = {
  16: "size-5.5",
  18: "size-6",
  22: "size-7",
  em: "size-[1.55em]",
};

export type TraitIconSize = keyof typeof TRAIT_ICON_SIZE;

/** The glyph's box alone, for a caller holding the indent without drawing. */
export const traitIconBox = (size: TraitIconSize = 16) => TRAIT_ICON_SIZE[size];

export function TraitIcon({
  trait,
  size = 16,
  placeholder = false,
}: {
  trait: TraitId | null;
  size?: TraitIconSize;
  /** Empty or icon-less traits hold the glyph's box, so rows keep their height. */
  placeholder?: boolean;
}) {
  const url = trait ? traitIconUrl(trait) : null;
  if (url)
    return (
      <img src={url} alt="" className={`flex-none ${TRAIT_ICON_SIZE[size]}`} />
    );
  return placeholder ? (
    <span aria-hidden className={`flex-none ${TRAIT_ICON_SIZE[size]}`} />
  ) : null;
}
