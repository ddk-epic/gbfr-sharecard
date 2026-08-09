import { Fragment } from "react";
import type { Build, CellId, StyleId, StyleRank } from "../domain/build";
import { RANKS, STYLES } from "../domain/build";
import { STYLE_RANK_BUDGETS } from "../domain/derive";
import { PERK_THRESHOLDS, type MasterTraitCell } from "../domain/catalog";
import {
  characterCatalog,
  sboardRankIconUrl,
  starBgUrl,
  starIconUrl,
} from "../data";
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

const STYLE_RANK_NUM: Record<StyleRank, string> = {
  r1: "1",
  r2: "2",
  r3: "3",
  ex: "EX",
};

/** N level Style Rank stars */
function Stars({
  count,
  className = "",
}: {
  count: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex align-middle ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`relative ml-[-0.08em] inline-block h-[0.8em] w-[0.8em]`}
        >
          <img
            src={starBgUrl}
            alt=""
            className="absolute top-1/2 left-1/2 h-[0.72em] w-[0.72em] max-w-none -translate-x-1/2 -translate-y-1/2"
          />
          <img
            src={starIconUrl}
            alt=""
            className="absolute top-1/2 left-1/2 h-[0.72em] w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        </span>
      ))}
    </span>
  );
}

function RankIcon({ rank }: { rank: StyleRank }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.7em]">
      <img
        src={sboardRankIconUrl(rank)}
        alt=""
        className="absolute top-1/2 left-1/2 h-[1.7em] w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
      />
    </span>
  );
}

/** One Style Rank section. */
function MasterTraitStyleRank({
  rank,
  cells,
  selected,
  perkHit,
}: {
  rank: StyleRank;
  cells: MasterTraitCell[];
  selected: CellId[];
  perkHit: boolean;
}) {
  return (
    <div className="relative flex flex-col">
      {/** Rank Label */}
      <div className="text-deep-label flex items-center pb-1.75 text-lg tracking-[0.06em] uppercase">
        <span className="mr-auto pl-0.5">
          <span className="text-deep-mute text-[0.8em]">Style Rank </span>
          {STYLE_RANK_NUM[rank]}
        </span>
        <RankIcon rank={rank} />
        <span>
          <span className="inline-block pl-2.5 text-right">
            {selected.length}
          </span>
          <span className="text-deep-mute text-[0.8em]">
            /{STYLE_RANK_BUDGETS[rank]}
          </span>
        </span>
      </div>
      {/** Cells */}
      <div className="grid grid-cols-2 gap-1.5 pb-4.5">
        {cells.map((cell) => {
          // wrap when text length + star (2 weight each) larger than 18
          const wrapRule = cell.label.length + (cell.perkRank ?? 0) * 2 >= 19;
          return (
            <div
              key={cell.id}
              className={`flex h-[46px] items-center overflow-hidden rounded-sm px-2.25 py-1 text-lg ${wrapRule && "px-1.75 text-[20px] leading-[1.02]"} ${
                selected.includes(cell.id)
                  ? `bg-linear-135 from-white/18 text-white ${perkHit ? "to-purple-400/35 shadow-[inset_0_0_0_1px_var(--color-purple-400)]" : "to-deep-3/30 shadow-[inset_0_0_0_1px_var(--deep-ring)]"}`
                  : "bg-deep-cell text-deep-mute"
              }`}
            >
              <span className="[-webkit-text-stroke:3px_var(--deep-5)] [paint-order:stroke]">
                {cell.perkRank && (
                  <Stars
                    count={cell.perkRank}
                    className="translate-y-[-0.1em]"
                  />
                )}
                {cell.perkRank && " "}
                {cell.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MasterTraitsSection({ build }: { build: Build }) {
  const catalog = characterCatalog(build.characterId);
  // A rank's perk activates only when its own threshold and every
  // earlier rank's perk is active too (dependent chain).
  const activePerks = (style: StyleId) => {
    let prev = true;
    return RANKS.map((rank, i) => {
      const threshold = PERK_THRESHOLDS[i];
      prev =
        prev &&
        threshold !== undefined &&
        build.masterTraits[style][rank].length >= threshold;
      return prev;
    });
  };
  const perkStars = (style: StyleId) =>
    activePerks(style).filter(Boolean).length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3.75">
      <Heading
        tone="deep"
        size="lg"
        className="flex flex-none items-baseline justify-between"
      >
        <span>Master Traits</span>
        <div className="my-[-0.3em] flex items-center gap-x-2.5 font-sans text-lg tracking-[0.02em] normal-case [-webkit-text-stroke:3px_var(--deep-5)] [paint-order:stroke]">
          {STYLES.map((style, i) => (
            <Fragment key={style}>
              {i > 0 && <span className="text-deep-mute/80">·</span>}
              <span className="flex items-center gap-x-1.5">
                <span>{STYLE_LABEL[style]}</span>
                <Stars count={perkStars(style)} className="text-[1.3em]" />
              </span>
            </Fragment>
          ))}
        </div>
      </Heading>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.25">
        {STYLES.map((style) => {
          const perks = activePerks(style);
          return (
            <div
              className={`styleCol text-deep-ink relative flex min-h-0 flex-col overflow-hidden rounded-lg border-t-4 p-4 ${STYLE_BORDER[style]}`}
              key={style}
            >
              <h4 className="flex-none pb-4 text-2xl font-bold text-white [text-shadow:0_1px_5px_rgba(10,50,70,0.55)]">
                {STYLE_LABEL[style]}: {catalog.masterTraits[style].title}
              </h4>
              {RANKS.map((rank, i) => (
                <MasterTraitStyleRank
                  key={rank}
                  rank={rank}
                  cells={catalog.masterTraits[style][rank]}
                  selected={build.masterTraits[style][rank]}
                  perkHit={perks[i]}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
