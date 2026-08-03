import type { ElementId } from "../domain/catalog";
import { elementIconUrl } from "../data";

/** Element icon, case-insensitive. */
export function ElementIcon({
  element,
  className = "",
}: {
  element: string;
  className?: string;
}) {
  return (
    <img
      src={elementIconUrl(element.toLowerCase() as ElementId)}
      className={`flex-none ${className}`}
      alt=""
    />
  );
}
