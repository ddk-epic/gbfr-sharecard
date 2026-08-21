import type { TraitId } from "@/catalog/ids";
import { traitIconUrl } from "@/assets/urls";

const TRAIT_ICON_SIZE = {
  16: "size-5.5",
  18: "size-6",
  22: "size-7",
  em: "size-[1.35em]",
};

export type TraitIconSize = keyof typeof TRAIT_ICON_SIZE;

export const traitIconBox = (size: TraitIconSize = "em") =>
  TRAIT_ICON_SIZE[size];

export function TraitIcon({
  trait,
  size = "em",
  placeholder = false,
}: {
  trait: TraitId | null;
  size?: TraitIconSize;
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
