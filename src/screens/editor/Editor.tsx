import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Build } from "../../domain/build";
import { traitLevelTotals } from "../../domain/derive";
import { traitName } from "../../data";
import type { PageProps } from "./controls";
import { SkillsPage } from "./SkillsPage";
import { GearPage } from "./GearPage";
import { MasterTraitsPage } from "./MasterTraitsPage";
import { BackButton, Cta, Heading, Icon, Lvl, Panel, TraitRow } from "../../ui";

const PAGE_LABELS = ["Skills & Summons", "Gear & Sigils", "Master Traits"];

/** The pager chevrons stand in for a 150px glyph. Half the box is padding,
    so the drawn chevron is ARROW/2 tall. */
const ARROW = 150;

/** Clears the stage edge including the checklist popover docked to the right. */
const FLIP_OFFSET_PX = 1900;
const FLIP_MS = 120;

/* 60% = 3 column units, 40% = 2, 46% = unit + 1.3-unit sigils. The unit width
   is constant, so only the window resizes between pages. */
const WINDOW_WIDTH = ["w-[40%]", "w-[46%]", "w-[60%]"];

const TAB =
  "cursor-pointer rounded-[5px] px-6.5 py-2.25 text-[14.5px] font-bold tracking-[0.09em] uppercase";

const ARR =
  "text-ink-strong/35 hover:text-ink-strong flex-1 cursor-pointer leading-none";

/**
 * Windowed 3-page carousel. A page flip rolls the whole window off one side
 * and back in from the opposite side; content never slides inside the frame.
 */
export function Editor({
  build,
  onChange,
  onBack,
  onGenerate,
}: PageProps & { onBack: () => void; onGenerate: () => void }) {
  const [page, setPage] = useState(0);
  const [checklistOpen, setChecklistOpen] = useState(true);
  const windowRef = useRef<HTMLDivElement>(null);
  const flippingRef = useRef(false);

  const flipTo = (target: number, direction?: number) => {
    const next = (target + PAGE_LABELS.length) % PAGE_LABELS.length;
    if (flippingRef.current || next === page) return;
    const dir = direction ?? (next > page ? 1 : -1);
    const win = windowRef.current!;
    flippingRef.current = true;
    win.style.transition = `transform ${FLIP_MS}ms ease-in`;
    win.style.transform = `translateX(${-dir * FLIP_OFFSET_PX}px)`;
    setTimeout(() => {
      // Swapped while off-screen, so the window takes its new width unseen.
      setPage(next);
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
      if (e.key === "ArrowLeft") flipTo(page - 1, -1);
      if (e.key === "ArrowRight") flipTo(page + 1, 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const pageProps = { build, onChange };
  return (
    <div>
      <BackButton onClick={onBack}>
        <ChevronLeft size={16} aria-hidden />
        Character
      </BackButton>
      <div className="absolute inset-0 z-1 flex flex-col items-center justify-center gap-3.5">
        <div className="flex items-center justify-center gap-2">
          {PAGE_LABELS.map((label, i) => (
            <button
              key={label}
              className={`${TAB} ${
                i === page
                  ? "from-band via-band-soft text-ink-strong bg-linear-90 from-0% via-60% to-[#b9d7e8] to-100%"
                  : "text-dim bg-white/55 shadow-[inset_0_0_0_1px_var(--color-line-soft)] hover:bg-white/90"
              }`}
              onClick={() => flipTo(i)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex h-[76%] w-full items-stretch">
          {/* flex-1 so the whole area flanking the window is a hit target */}
          <button
            className={`${ARR} pl-27.5 text-left hover:bg-linear-90 hover:from-white/40 hover:to-white/0`}
            aria-label="previous page"
            onClick={() => flipTo(page - 1, -1)}
          >
            <ChevronLeft size={ARROW} strokeWidth={1} aria-hidden />
          </button>
          <div
            ref={windowRef}
            className={`relative h-full flex-none ${WINDOW_WIDTH[page]}`}
          >
            <Panel pad="none" className="h-full w-full overflow-hidden">
              {page === 0 && <SkillsPage {...pageProps} />}
              {page === 1 && <GearPage {...pageProps} />}
              {page === 2 && <MasterTraitsPage {...pageProps} />}
            </Panel>
            {page !== 2 &&
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
            className={`${ARR} pr-27.5 text-right hover:bg-linear-270 hover:from-white/40 hover:to-white/0`}
            aria-label="next page"
            onClick={() => flipTo(page + 1, 1)}
          >
            <ChevronRight size={ARROW} strokeWidth={1} aria-hidden />
          </button>
        </div>
        <Cta onClick={onGenerate}>
          Generate Card
          <ChevronDown size={16} aria-hidden />
        </Cta>
      </div>
    </div>
  );
}

/** Sigil + wrightstone trait level sums. Editor-only, never on the card. */
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
    <div className="border-line absolute top-0 left-[calc(100%+14px)] z-3 w-70 rounded-[10px] border bg-white/94 px-3.5 py-3 shadow-[0_10px_34px_rgba(23,60,90,0.3)] backdrop-blur-xs">
      <Heading className="flex items-center justify-between">
        Trait Checklist
        <button
          className="text-dim hover:text-ink-strong cursor-pointer px-0.5"
          title="close"
          aria-label="close"
          onClick={onClose}
        >
          <X size={16} aria-hidden />
        </button>
      </Heading>
      <div className="text-dim mt-1 mb-0.5 flex items-center justify-between gap-2 text-[12px] tracking-[0.07em] uppercase">
        <span>sigils + wrightstone</span>
      </div>
      {totals.length === 0 && (
        <TraitRow size="sm">
          <Icon sm />
          <span className="text-dim">no traits yet</span>
        </TraitRow>
      )}
      {totals.map(([trait, level]) => (
        <TraitRow size="sm" key={trait}>
          <Icon sm />
          <span>{traitName(trait)}</span>
          <Lvl>{level}</Lvl>
        </TraitRow>
      ))}
    </div>
  );
}
