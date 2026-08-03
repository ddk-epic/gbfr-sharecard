import type { Build, CharacterId } from "../domain/build";
import type { ElementId } from "../domain/catalog";
import { characterCatalog, elementIconUrl, skillIconUrl } from "../data";
import { Heading, ReverseSlantedBar } from "../ui";
import { nameTracking } from "./name-tracking";

const skillNameSize = (name: string) => (name.length <= 18 ? 24 : 22);

const ELEMENT_COLOR: Record<ElementId, string> = {
  fire: "#d9542f",
  water: "#2f83d1",
  earth: "#b3823a",
  wind: "#3f9e5f",
  light: "#d1a52f",
  dark: "#8a5cc4",
  plain: "#8497a3",
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
      <Heading size="lg">Skills</Heading>
      <div className="relative mt-1 grid grid-cols-2 grid-rows-2 gap-x-4">
        <span
          aria-hidden
          className="bg-line-soft pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
        />
        <span
          aria-hidden
          className="bg-line-soft pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
        />
        {skills.map((skill, i) => {
          const def = skill ? skillById.get(skill) : undefined;
          // Bottom row (i >= 2) drops its bottom padding so it rests on the
          // section's own padding rather than stacking on it.
          if (!def)
            return (
              <div
                key={i}
                className={`flex min-h-0 items-center justify-center ${i >= 2 ? "pt-1" : "py-1"}`}
              >
                <span className="text-dim text-2xl">-</span>
              </div>
            );
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
                {/* One line; tracking + a size step keep long names in; pb-0.5
                    keeps descenders under the clip box. */}
                <span
                  className="pb-0.5 leading-[1.3] font-semibold"
                  style={{
                    fontSize: skillNameSize(def.name),
                    letterSpacing: nameTracking(def.name),
                  }}
                >
                  {def.name}
                </span>
                <span className="relative flex items-center gap-1.5 self-start py-0.5 pr-4 pl-1">
                  <ReverseSlantedBar className="-translate-x-1.5" />
                  <img
                    src={elementIconUrl(def.element)}
                    className="relative size-4.5 flex-none"
                    alt=""
                  />
                  <span
                    className="relative text-sm capitalize"
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
