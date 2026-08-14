import { useState } from "react";
import type { SummonSlot } from "../../domain/build";
import { IdentityCol } from "./sections/IdentityCol";
import { EDITOR_ZOOM, type PageProps } from "./controls";
import { anchorOf, type Anchor } from "./Popover";
import { SkillsSection } from "../../components/build/SkillsSection";
import { OverMasterySection } from "../../components/build/OverMasterySection";
import { SummonsSection } from "../../components/build/SummonsSection";
import { SkillsPopover } from "./sections/SkillsPopover";
import { OverMasteryPopover } from "./sections/OverMasteryPopover";
import { SummonsPopover } from "./sections/SummonsPopover";
import { EmptySlot } from "./controls";
import { traitIconBox } from "../../components/ui";

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
        <div className="relative">
          <SkillsSection
            characterId={build.characterId}
            skills={build.skills}
            arrangement="list"
            density="loose"
            renderEmpty={() => (
              <div className="flex min-h-0 items-center py-1">
                <EmptySlot className="h-16 flex-1 text-xl" label="add skill" />
              </div>
            )}
          />
          <button
            type="button"
            aria-label="Edit skills"
            className="hover:bg-band/15 absolute inset-0 z-10 cursor-pointer rounded-lg"
            onClick={(e) =>
              setOpen({ kind: "skills", anchor: anchorOf(e.currentTarget) })
            }
          />
        </div>
        <div className="relative">
          <OverMasterySection
            overMastery={build.overMastery}
            density="loose"
            renderEmpty={() => (
              <EmptySlot
                className="flex-1 py-0.75 text-base"
                label="add bonus"
              />
            )}
          />
          <button
            type="button"
            aria-label="Edit over mastery"
            className="hover:bg-band/15 absolute inset-0 z-10 cursor-pointer rounded-lg"
            onClick={(e) =>
              setOpen({
                kind: "overMastery",
                anchor: anchorOf(e.currentTarget),
              })
            }
          />
        </div>
        <SummonsSection
          summons={build.summons}
          arrangement="list"
          density="loose"
          renderEmpty={() => ({
            name: (
              <div className="mb-2 block w-60">
                <span className="block px-3 pt-px pb-0.5 text-xl font-bold select-none">
                  &nbsp;
                </span>
              </div>
            ),
            trait: (
              <div className="text-dim/70 flex min-w-0 items-center">
                <span
                  aria-hidden
                  className="w-0 flex-none overflow-hidden pl-1"
                >
                  <span className={`block ${traitIconBox(18)}`} />
                </span>
                <span className="text-base tracking-[0.08em] uppercase">
                  no trait
                </span>
              </div>
            ),
            overlay: (
              <EmptySlot
                className="absolute inset-0 text-xl"
                label="add summon"
              />
            ),
          })}
          wrapCell={(index, cell) => (
            <div className="relative py-px">
              {cell}
              <button
                type="button"
                aria-label={`Edit summon ${index + 1}`}
                className="hover:bg-band/15 absolute inset-0 z-10 cursor-pointer rounded-md"
                onClick={(e) =>
                  setOpen({
                    kind: "summon",
                    index,
                    anchor: anchorOf(e.currentTarget),
                  })
                }
              />
            </div>
          )}
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
