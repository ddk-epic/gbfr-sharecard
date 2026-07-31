import { useEffect, useRef } from "react";
import type { CellId, StyleId, StyleRank } from "../../domain/build";
import { RANKS, STYLES } from "../../domain/build";
import {
  STYLE_RANK_BUDGETS,
  stylePerkStates,
  styleRankBudgetSpent,
} from "../../domain/derive";
import { PERK_THRESHOLDS } from "../../domain/catalog";
import { characterCatalog } from "../../data";
import type { PageProps } from "./controls";
import { Heading, Icon } from "../../ui";

const STYLE_BORDER: Record<StyleId, string> = {
  insight: "border-t-insight",
  essence: "border-t-essence",
  crux: "border-t-crux",
};

const STYLE_LABEL: Record<StyleId, string> = {
  insight: "Insight",
  essence: "Essence",
  crux: "Crux",
};

const STYLE_RANK_LABELS: Record<StyleRank, string> = {
  r1: "Style Rank 1",
  r2: "Style Rank 2",
  r3: "Style Rank 3",
  ex: "Style Rank EX",
};

const OPT =
  "flex h-8.5 cursor-pointer items-center gap-1.5 overflow-hidden rounded-[4px] px-1.75 py-0.75 text-[13px] leading-[1.12] data-long:gap-1 data-long:px-1.25 data-long:py-0.5 data-long:text-[11px] data-long:leading-[1.06]";

export function MasterTraitsPage({ build, onChange }: PageProps) {
  const catalog = characterCatalog(build.characterId);
  const rankSpent = styleRankBudgetSpent(build.masterTraits);
  const perks = stylePerkStates(build.masterTraits, PERK_THRESHOLDS);
  const perkSummary = STYLES.map((style) => {
    const highest = perks[style].lastIndexOf(true) + 1;
    return `${STYLE_LABEL[style]}: ${catalog.masterTraits[style].title} Perk ${highest}`;
  }).join(" · ");

  const toggleCell = (style: StyleId, rank: StyleRank, id: CellId) => {
    const selected = build.masterTraits[style][rank];
    onChange({
      ...build,
      masterTraits: {
        ...build.masterTraits,
        [style]: {
          ...build.masterTraits[style],
          [rank]: selected.includes(id)
            ? selected.filter((x) => x !== id)
            : [...selected, id],
        },
      },
    });
  };

  // Cells are uniform height, so labels that overflow get shrunk after layout.
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gridRef.current?.querySelectorAll("[data-opt]").forEach((el) => {
      if (el.scrollHeight > el.clientHeight + 1)
        el.setAttribute("data-long", "");
    });
  });

  return (
    <div className="grid h-full grid-cols-2 gap-3.5 overflow-hidden px-4 py-3.5">
      <div className="col-span-full flex min-w-0 flex-col gap-3.5">
        <Heading tone="deep" className="flex items-baseline justify-between">
          Master Traits
          <span className="text-deep-label text-[13.5px] font-semibold tracking-[0.02em] normal-case text-shadow-none">
            {perkSummary}
          </span>
        </Heading>
        <div
          className="grid flex-1 grid-cols-3 items-start gap-3"
          ref={gridRef}
        >
          {STYLES.map((style) => (
            <div
              className={`styleCol text-deep-ink flex flex-col gap-1.75 rounded-lg border-t-[3px] px-3 py-3.5 ${STYLE_BORDER[style]}`}
              key={style}
            >
              <h4 className="text-[17.5px] text-white [text-shadow:0_1px_3px_rgba(10,50,70,0.55)]">
                {STYLE_LABEL[style]}: {catalog.masterTraits[style].title}
              </h4>
              {RANKS.map((rank) => (
                <div key={rank} className="flex flex-col gap-1.75">
                  <div className="text-deep-label mt-4.25 flex justify-between text-[12px] tracking-[0.08em] uppercase">
                    <span>{STYLE_RANK_LABELS[rank]}</span>
                    <span>
                      {rankSpent[rank]}/{STYLE_RANK_BUDGETS[rank]} pts
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.25">
                    {catalog.masterTraits[style][rank].map((cell) => (
                      <div
                        key={cell.id}
                        data-opt
                        className={`${OPT} ${
                          build.masterTraits[style][rank].includes(cell.id)
                            ? "to-deep-3/30 bg-linear-135 from-white/18 text-white shadow-[inset_0_0_0_1px_var(--deep-ring)]"
                            : "bg-deep-cell text-deep-mute hover:shadow-[inset_0_0_0_1px_#7fd4f8]"
                        }`}
                        title={cell.description}
                        onClick={() => toggleCell(style, rank, cell.id)}
                      >
                        <Icon tone="style" sm />
                        {cell.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
