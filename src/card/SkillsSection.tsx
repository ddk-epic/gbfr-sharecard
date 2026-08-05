import type { Build, CharacterId } from "../domain/build";
import type { ElementId } from "../domain/catalog";
import { characterCatalog, elementIconUrl, skillIconUrl } from "../data";
import { Heading, ReverseSlantedBar } from "../ui";
import { nameTracking } from "./name-tracking";

const skillNameSize = (name: string) => (name.length <= 18 ? 24 : 22);

const ELEMENT_COLOR: Record<ElementId, string> = {
  fire: "#ff5c5c",
  water: "#55b3ff",
  earth: "#DB9546",
  wind: "#3ad973",
  light: "#ffdc4d",
  dark: "#bd5cff",
  plain: "#e2e2e2",
};

export function SkillsSection({
  characterId,
  skills,
  className = "",
}: {
  characterId: CharacterId;
  skills: Build["skills"];
  className?: string;
}) {
  const skillById = new Map(
    characterCatalog(characterId).skills.map((s) => [s.id, s]),
  );

  return (
    <section className={`${className} flex flex-col overflow-hidden`}>
      <Heading size="lg" className="mb-1">
        Skills
      </Heading>
      <div className="relative grid grid-cols-2 grid-rows-2 gap-x-4">
        {/** Cross divider */}
        <span
          aria-hidden
          className="bg-line-soft pointer-events-none absolute inset-y-0.5 left-1/2 w-px -translate-x-1/2"
        />
        <span
          aria-hidden
          className="bg-line-soft pointer-events-none absolute inset-x-1.5 top-1/2 h-px -translate-y-1/2"
        />
        {skills.map((skill, i) => {
          const def = skill ? skillById.get(skill) : undefined;
          // Bottom row (i >= 2) drops its bottom padding so it rests on the
          // section's own padding rather than stacking on it.
          if (!def) return <SkillGhost key={i} bottom={i >= 2} />;
          return (
            <div
              key={i}
              className={`flex min-h-0 items-center ${i >= 2 ? "pt-1.5" : "py-1.5"}`}
            >
              <img
                src={skillIconUrl(characterId, def.id)}
                className="size-16 flex-none"
                alt=""
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                {/* pb-0.5 keeps descenders under the clip box. */}
                <span
                  className="pb-0.5 leading-[1.3] font-semibold"
                  style={{
                    fontSize: skillNameSize(def.name),
                    letterSpacing: nameTracking(def.name),
                  }}
                >
                  {def.name}
                </span>
                <span className="font-med relative flex items-center gap-1.5 self-start py-0.5 pr-4 pl-1">
                  <ReverseSlantedBar className="-translate-x-1.5" />
                  <img
                    src={elementIconUrl(def.element)}
                    className="relative size-4.5 flex-none"
                    alt=""
                  />
                  <span
                    className="relative text-sm capitalize [-webkit-text-stroke:1.5px_var(--ui)] [paint-order:stroke] [text-shadow:0_1px_3px_var(--dim)]"
                    style={{ color: ELEMENT_COLOR[def.element] }}
                  >
                    {def.element}
                  </span>
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** An empty skill slot ghost placeholder. */
function SkillGhost({ bottom }: { bottom: boolean }) {
  return (
    <div
      className={`flex min-h-0 items-center ${bottom ? "pt-1.5" : "py-1.5"}`}
    >
      <span className="grid size-16 flex-none place-items-center">
        <span className="bg-slanted-bar size-11 rotate-45 rounded-sm" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="bg-slanted-bar h-4 w-4/5 rounded-sm" />
        <span className="bg-slanted-bar h-2.5 w-2/5 rounded-sm" />
      </span>
    </div>
  );
}
