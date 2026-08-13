import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import type { Build } from "../../domain/build";

export const EDITOR_ZOOM = 0.64;
export const GEAR_ZOOM = 0.6;

export type PageProps = {
  build: Build;
  onChange: (next: Build) => void;
};

/* Stepper placeholder strut. */
const STEP =
  "min-w-0 flex-1 py-0.75 text-center text-[0.85em] font-semibold tabular-nums";

/** Ladder toggle bar. */
export function Stepper({
  values,
  value,
  onChange,
  format = String,
  empty = "-",
}: {
  values: number[];
  value: number | null;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  /** Stands in when there is no ladder to offer yet. */
  empty?: string;
}) {
  return (
    <div className="border-line flex overflow-hidden rounded-[5px] border">
      {values.length === 0 ? (
        <span
          className={`${STEP} text-dim/70 bg-white/70 tracking-[0.08em] uppercase`}
        >
          {empty}
        </span>
      ) : (
        values.map((step, i) => (
          <button
            key={step}
            type="button"
            aria-pressed={step === value}
            className={`border-line cursor-pointer ${STEP} ${
              i > 0 ? "border-l" : ""
            } ${
              step === value
                ? "from-band via-band-soft text-ink-strong bg-linear-160 to-[#b9d7e8]"
                : "text-dim bg-white/70 hover:bg-white"
            }`}
            onClick={() => onChange(step)}
          >
            {format(step)}
          </button>
        ))
      )}
    </div>
  );
}

export function IconTile({
  icon,
  name,
  selected = false,
  disabled = false,
  contain = false,
  badge,
  onClick,
}: {
  icon: string;
  name: string;
  selected?: boolean;
  disabled?: boolean;
  /** Art trimmed to a long bounding box (weapons): fit it whole, don't crop. */
  contain?: boolean;
  /** Slot number once picked, so order is readable from the grid. */
  badge?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={name}
      disabled={disabled}
      aria-pressed={selected}
      className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-md px-1 py-1.5 text-center ${
        selected
          ? "bg-band/70"
          : "hover:bg-band/35 disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
      }`}
      onClick={onClick}
    >
      <img
        src={icon}
        alt=""
        className={`size-[3.5em] flex-none object-center ${
          contain ? "object-contain" : "object-cover"
        }`}
      />
      <span className="text-ui text-[0.85em]">{name}</span>
      {badge !== undefined && (
        <span className="absolute top-0.5 right-0.75 grid size-[1.25em] place-items-center rounded-full bg-gray-600/80 pt-0.75 text-[0.85em] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

/** Empty slot placeholder. */
export function EmptySlot({
  className = "",
  label = "add",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={`text-dim/70 flex items-center justify-center gap-2 rounded-lg bg-white ${className}`}
    >
      <Plus className="size-[1.6em]" strokeWidth={2.5} aria-hidden />
      <span className="text-[1em] tracking-[0.08em] uppercase">{label}</span>
    </span>
  );
}
