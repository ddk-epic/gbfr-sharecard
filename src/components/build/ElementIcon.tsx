import type { ElementId } from "@/catalog/types";
import { elementIconUrl } from "@/assets/urls";

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
