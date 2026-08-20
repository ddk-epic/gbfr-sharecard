import { Fragment } from "react";
import { RotateCcw } from "lucide-react";
import type { Build } from "@/domain/build";
import type { CellId, PerkRank, StyleId, StyleRank } from "@/catalog/ids";
import { PERK_RANKS, RANKS, STYLES } from "@/catalog/ids";
import { STYLE_RANK_BUDGETS, stylePerkStates } from "@/domain/master-traits";
import { PERK_THRESHOLDS, type MasterTraitCell } from "@/catalog/types";
import { sboardRankIconUrl, starBgUrl, starIconUrl } from "@/assets/urls";
import { characterCatalog } from "@/catalog";
import {
  Heading,
  nameTracking,
  Tooltip,
  traitLabelFit,
  type TooltipPlacement,
} from "@/components/ui";

const STYLE_BORDER: Record<StyleId, string> = {
  insight: "border-t-insight",
  essence: "border-t-essence",
  crux: "border-t-crux",
};

/** For the lightened style colors in the heading. */
const STYLE_SOFT: Record<StyleId, string> = {
  insight: "color-mix(in srgb, var(--insight) 65%, white)",
  essence: "color-mix(in srgb, var(--essence) 65%, white)",
  crux: "color-mix(in srgb, var(--crux) 65%, white)",
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

export type CellInteraction = (
  cell: MasterTraitCell,
  style: StyleId,
  rank: StyleRank,
) => {
  onClick?: () => void;
  /** Shown on hover; omit for no tooltip. */
  tooltip?: string;
  className?: string;
};

/** One Style Rank section. */
function MasterTraitStyleRank({
  style,
  rank,
  cells,
  selected,
  perkHit,
  cellInteraction,
  tooltipPlacement,
}: {
  style: StyleId;
  rank: StyleRank;
  cells: MasterTraitCell[];
  selected: CellId[];
  perkHit: boolean;
  cellInteraction?: CellInteraction;
  tooltipPlacement: TooltipPlacement;
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
      <div className="grid grid-cols-2 gap-1.25">
        {cells.map((cell, i) => {
          const fit = traitLabelFit(cell.label, cell.perkRank);
          const interaction = cellInteraction?.(cell, style, rank);
          return (
            <Tooltip
              key={cell.id}
              text={interaction?.tooltip}
              placement={tooltipPlacement}
              align={i % 2 === 1 ? "end" : "start"}
            >
              <div
                onClick={interaction?.onClick}
                className={`flex h-[46px] items-center overflow-hidden rounded-sm px-2.25 py-1 text-lg ${fit.wraps ? "px-1.75 text-[20px] leading-[1.02]" : ""} ${
                  selected.includes(cell.id)
                    ? `bg-linear-135 from-white/18 text-white ${perkHit ? "to-purple-400/50 shadow-[inset_0_0_0_1px_var(--color-purple-300)]" : "to-deep-3/30 shadow-[inset_0_0_0_1px_var(--deep-ring)]"}`
                    : "bg-deep-cell text-deep-mute"
                } ${interaction?.className ?? ""}`}
              >
                <span
                  style={{ letterSpacing: fit.tracking }}
                  className="[-webkit-text-stroke:3px_var(--deep-5)] [paint-order:stroke]"
                >
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
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

function StyleHeading({ style, title }: { style: StyleId; title: string }) {
  return (
    <h4 className="flex flex-none flex-col items-center gap-2 py-3">
      <span
        className="font-med text-2xl text-white [-webkit-text-stroke:3px_var(--ui)] [paint-order:stroke] [text-shadow:0_1px_5px_rgba(10,50,70,0.55)]"
        style={{ letterSpacing: nameTracking(title) }}
      >
        {title}
      </span>
      <span
        className="font-med text-xs tracking-[0.2em] uppercase"
        style={{ color: STYLE_SOFT[style] }}
      >
        {STYLE_LABEL[style]}
      </span>
    </h4>
  );
}

function ClearStyleButton({
  label,
  disabled,
  onClear,
}: {
  label: string;
  disabled: boolean;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      title={`clear ${label}`}
      aria-label={`clear ${label}`}
      disabled={disabled}
      onClick={onClear}
      className={`text-deep-mute absolute top-4.5 right-3 rounded-sm p-1 ${
        disabled
          ? "cursor-default opacity-35"
          : "cursor-pointer hover:text-white"
      }`}
    >
      <RotateCcw size={20} aria-hidden />
    </button>
  );
}

function MasterTraitStyleColumn({
  style,
  title,
  cellsByRank,
  selectedByRank,
  perks,
  cellInteraction,
  onClear,
  tooltipPlacement,
}: {
  style: StyleId;
  title: string;
  cellsByRank: Record<StyleRank, MasterTraitCell[]>;
  selectedByRank: Record<StyleRank, CellId[]>;
  perks: Record<PerkRank, boolean>;
  cellInteraction?: CellInteraction;
  onClear?: () => void;
  tooltipPlacement: TooltipPlacement;
}) {
  return (
    <div
      className={`styleCol text-deep-ink relative flex min-h-0 flex-col rounded-lg border-t-4 px-4 pt-2 ${STYLE_BORDER[style]}`}
    >
      <StyleHeading style={style} title={title} />
      {onClear && (
        <ClearStyleButton
          label={STYLE_LABEL[style]}
          disabled={RANKS.every((rank) => selectedByRank[rank].length === 0)}
          onClear={onClear}
        />
      )}
      <div className="flex min-h-0 flex-1 flex-col justify-between pb-4.5">
        {RANKS.map((rank) => (
          <MasterTraitStyleRank
            key={rank}
            style={style}
            rank={rank}
            cells={cellsByRank[rank]}
            selected={selectedByRank[rank]}
            perkHit={rank !== "ex" && perks[rank]}
            cellInteraction={cellInteraction}
            tooltipPlacement={tooltipPlacement}
          />
        ))}
      </div>
    </div>
  );
}

export function MasterTraitsSection({
  build,
  cellInteraction,
  onClearStyle,
  tooltipPlacement = "top",
}: {
  build: Build;
  cellInteraction?: CellInteraction;
  onClearStyle?: (style: StyleId) => void;
  tooltipPlacement?: TooltipPlacement;
}) {
  const catalog = characterCatalog(build.characterId);
  const perks = stylePerkStates(build.masterTraits, PERK_THRESHOLDS);
  const perkStars = (style: StyleId) =>
    PERK_RANKS.filter((rank) => perks[style][rank]).length;

  return (
    <div className="text-ui flex h-full min-h-0 flex-col gap-3.75">
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
        {STYLES.map((style) => (
          <MasterTraitStyleColumn
            key={style}
            style={style}
            title={catalog.masterTraits[style].title}
            cellsByRank={catalog.masterTraits[style]}
            selectedByRank={build.masterTraits[style]}
            perks={perks[style]}
            cellInteraction={cellInteraction}
            onClear={onClearStyle && (() => onClearStyle(style))}
            tooltipPlacement={tooltipPlacement}
          />
        ))}
      </div>
    </div>
  );
}
