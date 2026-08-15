import type { TraitId } from "@/catalog/ids";
import { traitIconUrl } from "@/assets/urls";

const TRAIT_ICON_SIZE = { 16: "size-5.5", 18: "size-6", 22: "size-7" };

export type TraitIconSize = keyof typeof TRAIT_ICON_SIZE;

/** The glyph's box alone, for a caller holding the indent without drawing. */
export const traitIconBox = (size: TraitIconSize = 16) => TRAIT_ICON_SIZE[size];

export function TraitIcon({
  trait,
  size = 16,
}: {
  trait: TraitId;
  size?: TraitIconSize;
}) {
  const url = traitIconUrl(trait);
  return url ? (
    <img src={url} className={`flex-none ${TRAIT_ICON_SIZE[size]}`} />
  ) : null;
}

/** The `-` a trait cell shows when there is no trait; sized to TraitIcon's box. */
export function EmptyTraitIcon({ size = 16 }: { size?: TraitIconSize }) {
  return (
    <span
      className={`text-dim inline-flex flex-none items-center justify-center ${TRAIT_ICON_SIZE[size]}`}
    >
      -
    </span>
  );
}
