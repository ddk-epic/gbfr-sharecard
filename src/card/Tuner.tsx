import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import {
  CARD_H,
  CARD_LAYOUT,
  CARD_W,
  columnWidths,
  formatLayout,
  SOFT_RANGE,
  type CardLayout,
} from "./layout";
import type { Strain } from "./Card";

/**
 * The layout tuner. Dev-only - `import.meta.env.DEV` guards its mount, so it
 * never reaches a build. It drives the same CardLayout the card always renders
 * from, which is why there is no tuning mode to drift from the shipped one.
 *
 * Nothing is stored: Copy emits a replacement for CARD_LAYOUT, and pasting it
 * into layout.ts is what makes a session permanent. Vite reloads the module and
 * the sliders read the committed numbers back, so the file is the single truth.
 *
 * Portalled to the body because the Stage scales its subtree - a fixed panel
 * inside a transformed ancestor is positioned against that ancestor, and would
 * be shrunk along with the card it is measuring.
 */
export function Tuner({
  layout,
  onChange,
  strain,
  onStrainToggle,
  counts,
}: {
  layout: CardLayout;
  onChange: (layout: CardLayout) => void;
  strain: boolean;
  onStrainToggle: (on: boolean) => void;
  counts: Strain;
}) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const widths = columnWidths(layout);
  const set = <K extends keyof CardLayout>(key: K, value: CardLayout[K]) =>
    onChange({ ...layout, [key]: value });
  const setCol = (i: number, value: number) =>
    onChange({
      ...layout,
      cols: layout.cols.map((c, n) => (n === i ? value : c)) as [
        number,
        number,
        number,
      ],
    });

  const onCopy = () => {
    void navigator.clipboard.writeText(formatLayout(layout)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  const dirty = JSON.stringify(layout) !== JSON.stringify(CARD_LAYOUT);
  const squeezed = Math.round((1 - layout.slack) * SOFT_RANGE);
  /** Card height less both insets and the floor lift - the grid's own height. */
  const bottom = CARD_H - 2 * layout.inset - layout.floor;

  return createPortal(
    <div
      className={`fixed top-4 right-4 z-50 flex flex-col gap-2 rounded-lg bg-[#0d2033]/95 p-3 font-mono text-[11px] text-[#cfe6f2] shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${open ? "w-84" : "w-56"}`}
    >
      {/* The screens all stay mounted in one scroll track, so the panel hangs
          over every one of them - collapsed is the resting state. */}
      <button
        className="flex cursor-pointer items-center gap-2 text-left"
        onClick={() => setOpen(!open)}
      >
        <ChevronDown
          size={12}
          aria-hidden
          className={`flex-none transition-transform ${open ? "" : "-rotate-90"}`}
        />
        <b className="text-[12px] tracking-wider text-white">CARD LAYOUT</b>
        <span
          className={`ml-auto ${dirty ? "text-[#f5b942]" : "text-[#6f96ad]"}`}
        >
          {dirty ? "uncommitted" : open ? "matches source" : ""}
        </span>
      </button>

      {open && (
        <>
          <Row
            label="inset"
            value={layout.inset}
            min={0}
            max={40}
            onChange={(v) => set("inset", v)}
          />
          <Row
            label="gap 1·2"
            value={layout.gap1}
            min={0}
            max={80}
            onChange={(v) => set("gap1", v)}
          />
          <Row
            label="gap 2·3"
            value={layout.gap2}
            min={0}
            max={80}
            onChange={(v) => set("gap2", v)}
          />

          <div className="mt-1 text-[#6f96ad]">columns — % / px</div>
          {(["portrait", "gear", "traits"] as const).map((name, i) => (
            <Row
              key={name}
              label={name}
              value={layout.cols[i]}
              min={5}
              max={80}
              unit="%"
              note={`${Math.round(widths[i])}px`}
              onChange={(v) => setCol(i, v)}
            />
          ))}
          <div className="text-[#6f96ad]">
            tracks sum{" "}
            {Math.round(widths[0] + widths[1] + widths[2]) +
              2 * layout.inset +
              layout.gap1 +
              layout.gap2}
            {" / "}
            {CARD_W}
          </div>

          <div className="mt-1 text-[#6f96ad]">lines</div>
          <Row
            label="upper"
            value={layout.upper}
            min={400}
            max={940}
            note={`${bottom - layout.upper - layout.rowGap}px below`}
            onChange={(v) => set("upper", v)}
          />
          <Row
            label="row gap"
            value={layout.rowGap}
            min={0}
            max={48}
            onChange={(v) => set("rowGap", v)}
          />
          <Row
            label="floor lift"
            value={layout.floor}
            min={0}
            max={160}
            onChange={(v) => set("floor", v)}
          />
          <Row
            label="slack"
            value={layout.slack}
            min={0}
            max={1}
            step={0.01}
            note={squeezed ? `−${squeezed}px` : `0 / ${SOFT_RANGE}px`}
            onChange={(v) => set("slack", v)}
          />
          {/* note is the box's measured height - if it stops tracking the value, the
          column is resizing it and the slider is not the thing that is broken. */}
          <Row
            label="art box"
            value={layout.artH}
            min={20}
            max={400}
            note={`${counts.artPx}px real`}
            onChange={(v) => set("artH", v)}
          />
          <Row
            label="mt cell"
            value={layout.cellH}
            min={20}
            max={40}
            onChange={(v) => set("cellH", v)}
          />

          <label className="mt-1 flex items-center gap-2">
            <input
              type="checkbox"
              checked={strain}
              onChange={(e) => onStrainToggle(e.target.checked)}
            />
            show strain
          </label>
          <div
            className={counts.clipped || counts.shrunk ? "text-[#f5b942]" : ""}
          >
            {counts.clipped} clipped · {counts.shrunk} shrunk
          </div>
          {counts.overflow > 0 && (
            <div className="text-[#ef4444]">
              master traits overflow the row - lower the cell or the slack
            </div>
          )}

          <div className="mt-1 flex gap-2">
            <button
              className="flex-1 cursor-pointer rounded bg-[#1d4a68] px-2 py-1 text-white hover:bg-[#2a638b]"
              onClick={onCopy}
            >
              {copied ? "copied" : "copy layout.ts"}
            </button>
            <button
              className="cursor-pointer rounded px-2 py-1 text-[#8fb4c8] hover:text-white"
              onClick={() => onChange(CARD_LAYOUT)}
            >
              reset
            </button>
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}

function Row({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  note,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  note?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-18 flex-none">{label}</span>
      <input
        type="range"
        className="min-w-0 flex-1"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-14 flex-none text-right text-white">
        {step < 1 ? value.toFixed(2) : value}
        {unit}
      </span>
      {note && <span className="w-12 flex-none text-right">{note}</span>}
    </label>
  );
}
