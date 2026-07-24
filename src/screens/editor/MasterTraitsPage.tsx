import { useEffect, useRef } from "react";
import type { CellId, StyleId, StyleRank } from "../../domain/build";
import { RANKS, STYLES } from "../../domain/build";
import {
  STYLE_RANK_BUDGETS,
  stylePerkStates,
  styleRankBudgetSpent,
} from "../../domain/derive";
import { characterCatalog } from "../../data";
import type { PageProps } from "./controls";

const STYLE_COLOR_VARS: Record<StyleId, string> = {
  insight: "var(--insight)",
  essence: "var(--essence)",
  crux: "var(--crux)",
};

const STYLE_RANK_LABELS: Record<StyleRank, string> = {
  r1: "Style Rank 1",
  r2: "Style Rank 2",
  r3: "Style Rank 3",
  ex: "Style Rank EX",
};

export function MasterTraitsPage({ build, onChange }: PageProps) {
  const catalog = characterCatalog(build.characterId);
  const rankSpent = styleRankBudgetSpent(build.masterTraits);
  const perks = stylePerkStates(build.masterTraits, catalog.perkThresholds);
  const perkSummary = STYLES.map((style) => {
    const highest = perks[style].lastIndexOf(true) + 1;
    return `${catalog.styleNames[style]} Perk ${highest}`;
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
    gridRef.current?.querySelectorAll(".opt").forEach((el) => {
      if (el.scrollHeight > el.clientHeight + 1) el.classList.add("long");
    });
  });

  return (
    <div className="page">
      <div className="pg3">
        <h3 className="mtH">
          Master Traits<span>{perkSummary}</span>
        </h3>
        <div className="mtGrid" ref={gridRef}>
          {STYLES.map((style) => (
            <div
              className="styleCol"
              key={style}
              style={{ "--sc": STYLE_COLOR_VARS[style] } as React.CSSProperties}
            >
              <h4>{catalog.styleNames[style]}</h4>
              {RANKS.map((rank) => (
                <div key={rank}>
                  <div className="rank">
                    <span>{STYLE_RANK_LABELS[rank]}</span>
                    <span>
                      {rankSpent[rank]}/{STYLE_RANK_BUDGETS[rank]} pts
                    </span>
                  </div>
                  <div className="opts">
                    {catalog.masterTraits[style][rank].map((cell) => (
                      <div
                        key={cell.id}
                        className={`opt ${
                          build.masterTraits[style][rank].includes(cell.id)
                            ? "on"
                            : ""
                        }`}
                        title={cell.description}
                        onClick={() => toggleCell(style, rank, cell.id)}
                      >
                        <span className="icon sm" />
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
