import { useState } from "react";
import type { SummonSlot } from "../../domain/build";
import { EditorIdentityCol } from "./sections/EditorIdentityCol";
import { EDITOR_ZOOM, type PageProps } from "./controls";
import { anchorOf, type Anchor } from "./Popover";
import { EditorSkillsSection } from "./sections/EditorSkillsSection";
import { EditorOverMasterySection } from "./sections/EditorOverMasterySection";
import { EditorSummonsSection } from "./sections/EditorSummonsSection";
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
        <EditorIdentityCol
          build={build}
          width={IDENTITY_WIDTH}
          onChangeStatus={(status) => onChange({ ...build, status })}
        />
      </div>

      <div
        className="flex flex-none flex-col gap-3"
        style={{ width: DESIGN_WIDTH, zoom: ZOOM }}
      >
        <EditorSkillsSection
          characterId={build.characterId}
          skills={build.skills}
          onOpen={(el) => setOpen({ kind: "skills", anchor: anchorOf(el) })}
        />
        <EditorOverMasterySection
          overMastery={build.overMastery}
          onOpen={(el) =>
            setOpen({ kind: "overMastery", anchor: anchorOf(el) })
          }
        />
        <EditorSummonsSection
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
