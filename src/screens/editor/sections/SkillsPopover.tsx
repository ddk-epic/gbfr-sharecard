import type { Build } from "../../../domain/build";
import type { CharacterId } from "@/catalog/ids";
import { characterCatalog, skillIconUrl } from "../../../data";
import { IconTile } from "../controls";
import { Popover, PopoverHeading, POPOVER_BASE, type Anchor } from "../Popover";

const WIDTH = 26 * POPOVER_BASE;

export function SkillsPopover({
  characterId,
  skills,
  anchor,
  onChange,
  onClose,
}: {
  characterId: CharacterId;
  skills: Build["skills"];
  anchor: Anchor;
  onChange: (next: Build["skills"]) => void;
  onClose: () => void;
}) {
  const catalog = characterCatalog(characterId);
  const full = skills.every((skill) => skill !== null);

  const toggle = (id: string) => {
    const picked = skills.indexOf(id);
    if (picked >= 0) return onChange(setAt(skills, picked, null));
    const empty = skills.indexOf(null);
    if (empty >= 0) onChange(setAt(skills, empty, id));
  };

  return (
    <Popover anchor={anchor} width={WIDTH} label="Skills" onClose={onClose}>
      <PopoverHeading>
        <div className="flex justify-between">
          <span>Skills</span>
          <span>
            {skills.filter(Boolean).length}/{skills.length}
          </span>
        </div>
      </PopoverHeading>
      <div className="grid grid-cols-4 gap-0.5">
        {catalog.skills.map((skill) => {
          const picked = skills.indexOf(skill.id);
          return (
            <IconTile
              key={skill.id}
              icon={skillIconUrl(characterId, skill.id)}
              name={skill.name}
              selected={picked >= 0}
              disabled={full && picked < 0}
              badge={picked >= 0 ? picked + 1 : undefined}
              onClick={() => toggle(skill.id)}
            />
          );
        })}
      </div>
    </Popover>
  );
}

const setAt = <T,>(slots: T[], index: number, value: T) =>
  slots.map((slot, i) => (i === index ? value : slot));
