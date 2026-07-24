import { useEffect, useRef, useState } from "react";
import type { Build } from "../../domain/build";
import { traitLevelTotals } from "../../domain/derive";
import { traitName } from "../../data";
import type { PageProps } from "./controls";
import { SkillsPage } from "./SkillsPage";
import { GearPage } from "./GearPage";
import { MasterTraitsPage } from "./MasterTraitsPage";
import "./Editor.css";

const PAGE_LABELS = ["Skills & Summons", "Gear & Sigils", "Master Traits"];

/** Clears the stage edge including the checklist popover docked to the right. */
const FLIP_OFFSET_PX = 1900;
const FLIP_MS = 120;

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
    <div className="editor">
      <button className="back" onClick={onBack}>
        ‹ Character
      </button>
      <div className="mainWrap">
        <div className="tabs">
          {PAGE_LABELS.map((label, i) => (
            <button
              key={label}
              className={`tab ${i === page ? "on" : ""}`}
              onClick={() => flipTo(i)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="carouselRow">
          <button className="arr prev" onClick={() => flipTo(page - 1, -1)}>
            ‹
          </button>
          <div
            ref={windowRef}
            className={`winWrap ${page === 0 ? "narrow" : page === 1 ? "gear" : ""}`}
          >
            <div className="viewport">
              {page === 0 && <SkillsPage {...pageProps} />}
              {page === 1 && <GearPage {...pageProps} />}
              {page === 2 && <MasterTraitsPage {...pageProps} />}
            </div>
            {page !== 2 &&
              (checklistOpen ? (
                <TraitChecklist
                  build={build}
                  onClose={() => setChecklistOpen(false)}
                />
              ) : (
                <button
                  className="chkTab"
                  onClick={() => setChecklistOpen(true)}
                >
                  Σ Checklist
                </button>
              ))}
          </div>
          <button className="arr next" onClick={() => flipTo(page + 1, 1)}>
            ›
          </button>
        </div>
        <button className="cta gen" onClick={onGenerate}>
          Generate Card<span className="ar">▼</span>
        </button>
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
    <div className="chkPop">
      <h3>
        Trait Checklist
        <button className="chkClose" title="close" onClick={onClose}>
          ✕
        </button>
      </h3>
      <div className="imh">
        <span>sigils + wrightstone</span>
      </div>
      {totals.length === 0 && (
        <div className="trow">
          <span className="icon sm" />
          <span className="dim">no traits yet</span>
        </div>
      )}
      {totals.map(([trait, level]) => (
        <div className="trow" key={trait}>
          <span className="icon sm" />
          <span>{traitName(trait)}</span>
          <span className="lvl">{level}</span>
        </div>
      ))}
    </div>
  );
}
