import type { BonusTypeId } from "@/catalog/ids";
import { bonusIconUrl } from "@/assets/urls";
import { bonusTypeById } from "@/catalog";
import { bonusValueText } from "@/domain/naming";
import { GLYPH_TO_TEXT_RATIO } from "./TraitIcon";

/** Scales back up for the transparent margin the generator centres the box in (icons.mjs): 86px canvas, 62px box. */
const MARGIN_COMPENSATION = 86 / 62;
/** Icon side, in em, so the box matches a trait glyph and tracks the text. */
export const BONUS_ICON_EM = `${GLYPH_TO_TEXT_RATIO * MARGIN_COMPENSATION}em`;

/** Zero-width strut carrying a BonusIcon's height, so a bonus-less row matches
    a filled one. */
export function BonusIconStrut() {
  return (
    <span
      aria-hidden
      className="w-0 flex-none"
      style={{ height: BONUS_ICON_EM }}
    />
  );
}

/** A bonus's icon, name and value; the name and value never break apart. */
export function BonusLine({
  bonusType,
  value,
}: {
  bonusType: BonusTypeId;
  value: number;
}) {
  return (
    <>
      <BonusIcon bonusType={bonusType} className="-ml-1" />
      <span className="space-x-0.75 whitespace-nowrap">
        <span>{bonusTypeById.get(bonusType)?.name} </span>
        <span className="font-med">{bonusValueText(bonusType, value)}</span>
      </span>
    </>
  );
}

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
