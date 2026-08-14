import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { Build } from "../../domain/build";
import type { CharacterId } from "@/catalog/ids";
import type { ElementId } from "../../domain/catalog";
import { characterCatalog, elementIconUrl, skillIconUrl } from "../../data";
import { Heading, ReverseSlantedBar, SectionPanel } from "../ui";
import { nameTracking } from "./name-tracking";

type SkillDef = ReturnType<typeof characterCatalog>["skills"][number];
type Arrangement = "grid" | "list";
type Density = "compact" | "loose";

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

const ARRANGEMENT_LAYOUT: Record<
  Arrangement,
  { headingClass: string; listClass: string; showDivider: boolean }
> = {
  grid: {
    headingClass: "mb-1",
    listClass: "relative grid grid-cols-2 grid-rows-2",
    showDivider: true,
  },
  list: {
    headingClass: "mb-2",
    listClass: "divide-line-soft -mb-2 grid grid-cols-1 divide-y",
    showDivider: false,
  },
};

const SKILL_LAYOUT: Record<
  Density,
  {
    rowClass: string;
    iconOrder: string;
    iconPad: string;
    iconSize: string;
    textClass: string;
    trackingStyle: (name: string) => CSSProperties;
  }
> = {
  compact: {
    rowClass: "",
    iconOrder: "",
    iconPad: "p-1",
    iconSize: "size-16",
    textClass: "",
    trackingStyle: (name) => ({ letterSpacing: nameTracking(name) }),
  },
  loose: {
    rowClass: "px-3.5",
    iconOrder: "order-last",
    iconPad: "p-0.5",
    iconSize: "size-17",
    textClass: "tracking-wide",
    trackingStyle: () => ({}),
  },
};

/** An empty skill slot ghost placeholder. */
function SkillGhost() {
  return (
    <div className="flex min-h-0 items-center">
      <div className="flex-none p-1">
        <span className="grid size-16 place-items-center">
          <span className="bg-slanted-bar size-11 rotate-45 rounded-sm" />
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="bg-slanted-bar h-4 w-4/5 rounded-sm" />
        <span className="bg-slanted-bar h-2.5 w-2/5 rounded-sm" />
      </div>
    </div>
  );
}

function SkillCell({
  characterId,
  def,
  density,
}: {
  characterId: CharacterId;
  def: SkillDef;
  density: Density;
}) {
  const layout = SKILL_LAYOUT[density];
  return (
    <div className={`flex min-h-0 items-center ${layout.rowClass}`}>
      <div className={`flex-none ${layout.iconPad} ${layout.iconOrder}`}>
        <img
          src={skillIconUrl(characterId, def.id)}
          className={layout.iconSize}
          alt={def.name}
        />
      </div>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span
          className={`leading-[1.3] font-semibold ${layout.textClass}`}
          style={{
            fontSize: skillNameSize(def.name),
            ...layout.trackingStyle(def.name),
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
}

export function SkillsSection({
  characterId,
  skills,
  arrangement = "grid",
  density = "compact",
  renderEmpty = () => <SkillGhost />,
}: {
  characterId: CharacterId;
  skills: Build["skills"];
  arrangement?: Arrangement;
  density?: Density;
  renderEmpty?: (index: number) => ReactNode;
}) {
  const layout = ARRANGEMENT_LAYOUT[arrangement];
  const skillById = new Map(
    characterCatalog(characterId).skills.map((s) => [s.id, s]),
  );

  return (
    <SectionPanel shadow className="flex flex-col">
      <Heading size="lg" className={layout.headingClass}>
        Skills
      </Heading>
      <div className={layout.listClass}>
        {layout.showDivider && (
          <>
            <span
              aria-hidden
              className="bg-line-soft pointer-events-none absolute inset-y-0.5 left-1/2 w-px -translate-x-1/2"
            />
            <span
              aria-hidden
              className="bg-line-soft pointer-events-none absolute inset-x-1.5 top-1/2 h-px -translate-y-1/2"
            />
          </>
        )}
        {skills.map((skill, i) => {
          const def = skill ? skillById.get(skill) : undefined;
          return def ? (
            <SkillCell
              key={i}
              characterId={characterId}
              def={def}
              density={density}
            />
          ) : (
            <Fragment key={i}>{renderEmpty(i)}</Fragment>
          );
        })}
      </div>
    </SectionPanel>
  );
}
