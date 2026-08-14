import { useState } from "react";
import type { SummonSlot } from "../../domain/build";
import { IdentityCol } from "./sections/IdentityCol";
import { EDITOR_ZOOM, type PageProps } from "./controls";
import { anchorOf, type Anchor } from "./Popover";
import { SkillsSection } from "./sections/SkillsSection";
import { OverMasterySection } from "./sections/OverMasterySection";
import { SummonsSection } from "./sections/SummonsSection";
import { SkillsPopover } from "./sections/SkillsPopover";
import { OverMasteryPopover } from "./sections/OverMasteryPopover";
import { SummonsPopover } from "./sections/SummonsPopover";

const DESIGN_WIDTH = 560;
const ZOOM = EDITOR_ZOOM;

/** Wider than the section column at the same zoom. */
const IDENTITY_WIDTH = DESIGN_WIDTH * 1.15;

/** Only one popover is ever open at any time. */
type Open =
  | { kind: "skills"; anchor: Anchor }
  | { kind: "overMastery"; anchor: Anchor }
  | { kind: "summon"; index: number; anchor: Anchor };

const setAt = <T,>(slots: T[], index: number, value: T) =>
  slots.map((slot, i) => (i === index ? value : slot));

export function SkillsPage({ build, onChange }: PageProps) {
  const [open, setOpen] = useState<Open | null>(null);
  const close = () => setOpen(null);

  return (
    <div className="flex h-full gap-2.5">
      <div className="flex-none" style={{ width: IDENTITY_WIDTH, zoom: ZOOM }}>
        <IdentityCol
          build={build}
          width={IDENTITY_WIDTH}
          onChangeStatus={(status) => onChange({ ...build, status })}
        />
      </div>

      <div
        className="flex flex-none flex-col gap-3"
        style={{ width: DESIGN_WIDTH, zoom: ZOOM }}
      >
        <SkillsSection
          characterId={build.characterId}
          skills={build.skills}
          onOpen={(el) => setOpen({ kind: "skills", anchor: anchorOf(el) })}
        />
        <OverMasterySection
          overMastery={build.overMastery}
          onOpen={(el) =>
            setOpen({ kind: "overMastery", anchor: anchorOf(el) })
          }
        />
        <SummonsSection
          summons={build.summons}
          onOpen={(index, el) =>
            setOpen({ kind: "summon", index, anchor: anchorOf(el) })
          }
        />
      </div>

      {open?.kind === "skills" && (
        <SkillsPopover
          characterId={build.characterId}
          skills={build.skills}
          anchor={open.anchor}
          onChange={(skills) => onChange({ ...build, skills })}
          onClose={close}
        />
      )}
      {open?.kind === "overMastery" && (
        <OverMasteryPopover
          overMastery={build.overMastery}
          anchor={open.anchor}
          onChange={(overMastery) => onChange({ ...build, overMastery })}
          onClose={close}
        />
      )}
      {open?.kind === "summon" && (
        <SummonsPopover
          slot={build.summons[open.index]}
          anchor={open.anchor}
          onChange={(next: SummonSlot | null) =>
            onChange({
              ...build,
              summons: setAt(build.summons, open.index, next),
            })
          }
          onClose={close}
        />
      )}
    </div>
  );
}
