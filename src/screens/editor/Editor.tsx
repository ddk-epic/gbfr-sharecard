import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Build } from "@/domain/build";
import { traitLevelTotals } from "@/domain/status";
import { traitById } from "@/catalog";
import { traitName } from "@/domain/naming";
import { EDITOR_ZOOM, type PaneProps } from "./controls";
import { SkillsPane } from "./panes/SkillsPane";
import { GearPane } from "./panes/GearPane";
import { MasterTraitsPane } from "./panes/MasterTraitsPane";
import { BackButton, Cta, Heading } from "@/components/ui";
import { EDITOR_VIEWS, type EditorView } from "./views";

const PANE_LABELS: Record<EditorView, string> = {
  skills: "Skills & Summons",
  gear: "Gear & Sigils",
  mt: "Master Traits",
};

/** The pager chevrons stand in for a 150px glyph. Half the box is padding,
    so the drawn chevron is ARROW_SIZE/2 tall. */
const ARROW_SIZE = 150;

/** Clears the stage edge including the checklist popover docked to the right. */
const FLIP_OFFSET_PX = 1900;
const FLIP_MS = 120;

const WINDOW_MIN_WIDTH: Record<EditorView, string> = {
  skills: "w-auto",
  gear: "w-[46%]",
  mt: "w-auto",
};

const TAB =
  "cursor-pointer rounded-[5px] px-6.5 py-2.25 text-[14.5px] font-bold tracking-[0.09em] uppercase";

const ARROW_BUTTON =
  "text-ink-strong/35 hover:text-ink-strong flex flex-1 cursor-pointer items-center leading-none";

/** Windowed 3-pane carousel. */
export function Editor({
  build,
  onChange,
  view,
  onView,
  onBack,
  onGenerate,
}: PaneProps & {
  view: EditorView | undefined;
  onView: (view: EditorView) => void;
  onBack: () => void;
  onGenerate: () => void;
}) {
  const [pane, setPane] = useState<EditorView>(view ?? "skills");
  const [checklistOpen, setChecklistOpen] = useState(true);
  const windowRef = useRef<HTMLDivElement>(null);
  const flippingRef = useRef(false);
  const paneIndex = EDITOR_VIEWS.indexOf(pane);

  // snaps to pane without animation
  if (view && view !== pane && !flippingRef.current) setPane(view);

  const flipTo = (target: number, direction?: number) => {
    const wrapped = (target + EDITOR_VIEWS.length) % EDITOR_VIEWS.length;
    const next = EDITOR_VIEWS[wrapped];
    if (flippingRef.current || next === pane) return;
    const dir = direction ?? (wrapped > paneIndex ? 1 : -1);
    const win = windowRef.current!;
    flippingRef.current = true;
    onView(next);
    win.style.transition = `transform ${FLIP_MS}ms ease-in`;
    win.style.transform = `translateX(${-dir * FLIP_OFFSET_PX}px)`;
    setTimeout(() => {
      // Swapped while off-screen, so the window takes its new width unseen.
      setPane(next);
      win.style.transition = "none";
      win.style.transform = `translateX(${dir * FLIP_OFFSET_PX}px)`;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          win.style.transition = `transform ${FLIP_MS}ms ease-out`;
          win.style.transform = "translateX(0)";
          setTimeout(() => {
            flippingRef.current = false;
            win.style.transition = "none";
          }, FLIP_MS + 10);
        }),
      );
    }, FLIP_MS + 5);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key === "ArrowLeft") flipTo(paneIndex - 1, -1);
      if (e.key === "ArrowRight") flipTo(paneIndex + 1, 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const paneProps = { build, onChange };
  return (
    <div>
      <div className="absolute inset-0 z-1 flex flex-col items-center justify-center gap-2.5">
        {/* Header: back button + centered tabs. */}
        <div className="flex w-full items-center px-10">
          <div className="flex flex-1 justify-start">
            <BackButton inline label="Character" onClick={onBack} />
          </div>
          <div className="flex items-center justify-center gap-2">
            {EDITOR_VIEWS.map((paneView, i) => (
              <button
                key={paneView}
                className={`${TAB} ${
                  paneView === pane
                    ? "from-band via-band-soft text-ink-strong bg-linear-90 from-0% via-60% to-[#b9d7e8] to-100%"
                    : "text-dim bg-white/55 shadow-[inset_0_0_0_1px_var(--line-soft)] hover:bg-white/90"
                }`}
                onClick={() => flipTo(i)}
              >
                {PANE_LABELS[paneView]}
              </button>
            ))}
          </div>
          <div className="flex-1" aria-hidden />
        </div>
        {/* Body */}
        <div className="flex h-[76%] w-full items-stretch" data-popover-bounds>
          <button
            className={`${ARROW_BUTTON} justify-start pl-27.5 hover:bg-linear-90 hover:from-white/40 hover:to-white/0`}
            aria-label="previous pane"
            onClick={() => flipTo(paneIndex - 1, -1)}
          >
            <ChevronLeft size={ARROW_SIZE} strokeWidth={1} aria-hidden />
          </button>
          <div
            ref={windowRef}
            className={`relative h-full flex-none ${WINDOW_MIN_WIDTH[pane]}`}
          >
            {pane === "skills" && <SkillsPane {...paneProps} />}
            {pane === "gear" && <GearPane {...paneProps} />}
            {pane === "mt" && <MasterTraitsPane {...paneProps} />}
            {pane !== "mt" &&
              (checklistOpen ? (
                <TraitChecklist
                  build={build}
                  onClose={() => setChecklistOpen(false)}
                />
              ) : (
                <button
                  className="from-band to-band-soft text-ink-strong absolute top-2.5 left-full z-3 cursor-pointer rounded-r-lg bg-linear-to-b px-1.75 py-3 text-[14px] font-bold tracking-[0.08em] shadow-[2px_2px_10px_rgba(23,60,90,0.25)] [writing-mode:vertical-rl] hover:from-[#8cc2dd] hover:to-[#b0d2e5]"
                  onClick={() => setChecklistOpen(true)}
                >
                  Σ Checklist
                </button>
              ))}
          </div>
          <button
            className={`${ARROW_BUTTON} justify-end pr-27.5 hover:bg-linear-270 hover:from-white/40 hover:to-white/0`}
            aria-label="next pane"
            onClick={() => flipTo(paneIndex + 1, 1)}
          >
            <ChevronRight size={ARROW_SIZE} strokeWidth={1} aria-hidden />
          </button>
        </div>
        <Cta onClick={onGenerate}>
          <span>Generate Card</span>
          <ChevronDown size={16} aria-hidden />
        </Cta>
      </div>
    </div>
  );
}

const CHECKLIST_ROW =
  "border-line-soft text-ui flex items-center justify-between gap-2.5 border-b py-2 text-xl last:border-b-0";

function TraitChecklist({
  build,
  onClose,
}: {
  build: Build;
  onClose: () => void;
}) {
  const totals = [...traitLevelTotals(build).entries()].sort(
    (a, b) => b[1] - a[1],
  );
  return (
    <div
      data-popover-lit
      className="font-med absolute top-0 left-[calc(100%+4px)] z-3"
    >
      <div
        className="border-line w-85 rounded-lg border bg-white/90 px-3.5 py-3.5 shadow-[0_10px_34px_rgba(23,60,90,0.3)]"
        style={{ zoom: EDITOR_ZOOM }}
      >
        <Heading size="lg" className="mb-2 flex items-center justify-between">
          Trait Checklist
          <button
            className="text-dim hover:text-ink-strong -mr-4 cursor-pointer"
            title="close"
            aria-label="close"
            onClick={onClose}
          >
            <X size={20} aria-hidden />
          </button>
        </Heading>
        {totals.length === 0 && (
          <div className={`${CHECKLIST_ROW} text-dim`}>no traits yet</div>
        )}
        {totals.map(([trait, level]) => (
          <div className={CHECKLIST_ROW} key={trait}>
            <span>{traitName(trait)}</span>
            <span className="flex flex-none items-baseline gap-1">
              <span className="font-sans text-base">Lvl</span>
              <div>
                <span>{level}</span>
                <span className="font-sans text-base">
                  /{traitById.get(trait)?.maxLevel}
                </span>
              </div>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
