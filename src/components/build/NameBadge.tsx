import { useId, type ReactNode } from "react";
import type { CharacterId } from "@/catalog/ids";
import { characterById } from "../../data";
import { ElementIcon } from "./ElementIcon";

/** Element orb + character name on a deep-blue banner. */
export function NameBadge({
  characterId,
  className = "",
}: {
  characterId: CharacterId;
  className?: string;
}) {
  const character = characterById.get(characterId);
  return (
    <div
      className={`z-2 flex items-center justify-center gap-3.5 bg-[linear-gradient(90deg,transparent,rgba(5,63,99,0.95)_30%,rgba(5,63,99,0.95)_70%,transparent)] px-5.5 py-1.5 text-4xl font-bold text-white ${className}`}
    >
      {character && (
        <Keyline className="-my-4 -mr-1 pt-0.5">
          <ElementIcon element={character.element} className="size-11" />
        </Keyline>
      )}
      <span className="tracking-wider [-webkit-text-stroke:6px_var(--ui)] [paint-order:stroke]">
        {character?.name ?? characterId}
      </span>
    </div>
  );
}

/**
 * Wraps its children in a uniform outline: dilates their combined alpha once
 * (feMorphology) and tints it.
 */
function Keyline({
  children,
  radius = 1.5,
  color = "var(--ui)",
  className = "",
}: {
  children: ReactNode;
  radius?: number;
  color?: string;
  className?: string;
}) {
  // useId() emits colons that are invalid in a CSS url(#...) reference.
  const id = `keyline-${useId().replace(/:/g, "")}`;
  return (
    <span className={className} style={{ filter: `url(#${id})` }}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id={id}>
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius={radius}
            result="d"
          />
          <feFlood style={{ floodColor: color }} />
          <feComposite in2="d" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>
      {children}
    </span>
  );
}
