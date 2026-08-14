import type { BonusTypeId } from "@/catalog/ids";
import { bonusIconUrl } from "../../data";

/** Gear-row's trait glyph against its text: size-7 (1.75rem) over text-2xl (1.5rem). */
const GLYPH_TO_TEXT = 7 / 6;
/** Scales back up for the transparent margin the generator centres the box in (icons.mjs): 86px canvas, 62px box. */
const MARGIN_COMPENSATION = 86 / 62;
/** Icon side, in em, so the box matches a trait glyph and tracks the text. */
export const BONUS_ICON_EM = `${GLYPH_TO_TEXT * MARGIN_COMPENSATION}em`;

export function BonusIcon({
  bonusType,
  className = "",
}: {
  bonusType: BonusTypeId;
  className?: string;
}) {
  return (
    <img
      src={bonusIconUrl(bonusType)}
      className={`flex-none ${className}`}
      style={{ width: BONUS_ICON_EM, height: BONUS_ICON_EM }}
      alt=""
    />
  );
}
