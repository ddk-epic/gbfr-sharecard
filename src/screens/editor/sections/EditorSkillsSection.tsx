import type { Build, CharacterId } from "../../../domain/build";
import type { ElementId } from "../../../domain/catalog";
import { characterCatalog, elementIconUrl, skillIconUrl } from "../../../data";
import { Heading, ReverseSlantedBar, SectionPanel } from "../../../ui";
import { EmptySlot } from "../controls";

type SkillDef = ReturnType<typeof characterCatalog>["skills"][number];

const skillNameSize = (name: string) => (name.length <= 18 ? 25 : 22);

const ELEMENT_COLOR: Record<ElementId, string> = {
  fire: "#ff5c5c",
  water: "#55b3ff",
  earth: "#DB9546",
  wind: "#3ad973",
  light: "#ffdc4d",
  dark: "#bd5cff",
  plain: "#e2e2e2",
};

export function EditorSkillsSection({
  characterId,
  skills,
  onOpen,
}: {
  characterId: CharacterId;
  skills: Build["skills"];
  onOpen: (el: Element) => void;
}) {
  const skillById = new Map(
    characterCatalog(characterId).skills.map((s) => [s.id, s]),
  );

  return (
    <SectionPanel shadow className="relative flex flex-col">
      <Heading size="lg" className="mb-2">
        Skills
      </Heading>
      <div className="divide-line-soft -mb-2 grid grid-cols-1 divide-y">
        {skills.map((skill, i) => {
          const def = skill ? skillById.get(skill) : undefined;
          return def ? (
            <SkillCell key={i} characterId={characterId} def={def} />
          ) : (
            <SkillSlot key={i} />
          );
        })}
      </div>
      <button
        type="button"
        aria-label="Edit skills"
        className="hover:bg-band/15 absolute inset-0 z-10 cursor-pointer rounded-lg"
        onClick={(e) => onOpen(e.currentTarget)}
      />
    </SectionPanel>
  );
}

function SkillCell({
  characterId,
  def,
}: {
  characterId: CharacterId;
  def: SkillDef;
}) {
  return (
    <div className="flex min-h-0 items-center px-3.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div
          className="leading-[1.3] font-semibold tracking-wide"
          style={{
            fontSize: skillNameSize(def.name),
          }}
        >
          {def.name}
        </div>
        <div className="font-med relative flex items-center gap-1.5 self-start py-0.5 pr-4 pl-1">
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
        </div>
      </div>
      <div className="flex-none p-0.5">
        <img
          src={skillIconUrl(characterId, def.id)}
          className="size-17"
          alt={def.name}
        />
      </div>
    </div>
  );
}

function SkillSlot() {
  return (
    <div className="flex min-h-0 items-center py-1">
      <EmptySlot className="h-16 flex-1 text-xl" label="add skill" />
    </div>
  );
}
