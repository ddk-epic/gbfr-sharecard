import type { Build, CellId, StyleId, StyleRank } from "../domain/build";
import { RANKS, STYLES } from "../domain/build";
import { STYLE_RANK_BUDGETS, stylePerkStates } from "../domain/derive";
import { PERK_THRESHOLDS, type MasterTraitCell } from "../domain/catalog";
import { characterCatalog } from "../data";
import { Heading } from "../ui";

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

/** One style rank section. */
function MasterTraitStyleRank({
  rank,
  cells,
  selected,
}: {
  rank: StyleRank;
  cells: MasterTraitCell[];
  selected: CellId[];
}) {
  return (
    <div className="flex flex-none flex-col">
      {/** Label */}
      <div className="text-deep-label flex justify-between pb-2 text-lg tracking-[0.08em] uppercase">
        <span>{STYLE_RANK_LABELS[rank]}</span>
        <span>{STYLE_RANK_BUDGETS[rank]} pts</span>
      </div>
      {/** Cells */}
      <div className="grid grid-cols-2 gap-1.75 pb-4.5">
        {cells.map((cell) => (
          <div
            key={cell.id}
            data-opt
            className={`flex h-[46px] items-center overflow-hidden rounded-sm px-2.25 py-1 text-lg ${cell.label.length >= 19 && "px-1.75 text-[20px] leading-[1.02]"} ${
              selected.includes(cell.id)
                ? "to-deep-3/30 bg-linear-135 from-white/18 text-white shadow-[inset_0_0_0_1px_var(--deep-ring)]"
                : "bg-deep-cell text-deep-mute"
            }`}
          >
            <span>{cell.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MasterTraitsSection({ build }: { build: Build }) {
  const catalog = characterCatalog(build.characterId);
  const perks = stylePerkStates(build.masterTraits, PERK_THRESHOLDS);
  const perkSummary = STYLES.map(
    (style) =>
      `${STYLE_LABEL[style]} Perk ${perks[style].lastIndexOf(true) + 1}`,
  ).join(" · ");

  return (
    <div className="flex h-full min-h-0 flex-col gap-3.75">
      <Heading
        tone="deep"
        size="lg"
        className="flex flex-none items-baseline justify-between"
      >
        <span>Master Traits</span>
        <span className="text-deep-label text-lg font-semibold tracking-[0.02em] normal-case text-shadow-none">
          {perkSummary}
        </span>
      </Heading>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.25">
        {STYLES.map((style) => (
          <div
            className={`styleCol text-deep-ink relative flex min-h-0 flex-col overflow-hidden rounded-lg border-t-4 p-4 ${STYLE_BORDER[style]}`}
            key={style}
          >
            <h4 className="flex-none pb-6 text-2xl font-bold text-white [text-shadow:0_1px_4px_rgba(10,50,70,0.55)]">
              {STYLE_LABEL[style]}: {catalog.masterTraits[style].title}
            </h4>
            {RANKS.map((rank) => (
              <MasterTraitStyleRank
                key={rank}
                rank={rank}
                cells={catalog.masterTraits[style][rank]}
                selected={build.masterTraits[style][rank]}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
