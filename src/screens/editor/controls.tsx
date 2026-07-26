import type { ReactNode } from "react";
import type { Build, TraitId } from "../../domain/build";
import type { TraitDef } from "../../domain/catalog";

/** Every editor page edits the whole Build and hands back a new one. */
export type PageProps = {
  build: Build;
  onChange: (next: Build) => void;
};

/* Spaces are percent-encoded so the URI survives Tailwind's arbitrary-value
   parsing, which reads a bare space as the end of the class. */
const SELECT_ARROW =
  "bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%228%22%20height=%226%22%3E%3Cpath%20d=%22M0%200h8L4%206z%22%20fill=%22%235f7188%22/%3E%3C/svg%3E')] bg-position-[right_5px_center] bg-no-repeat";

/* A prop, not a className override: the strip restates the base fill and
   border, which utilities resolve by generation order rather than string order. */
const SELECT_TONE = {
  default: "border-line bg-white/92",
  strip: "border-white/45 bg-white/18 font-bold text-white",
};

const SELECT = `min-w-0 cursor-pointer appearance-none rounded-[4px] border py-px pr-4.5 pl-1.5 text-ellipsis ${SELECT_ARROW}`;

const NUM_WIDTH = {
  md: "w-16",
  sm: "w-13",
  stat: "w-19",
  wbase: "w-15.5",
  full: "w-full",
};

const NUM =
  "rounded-[4px] border border-line bg-white/92 py-px px-1.5 text-right tabular-nums [&::-webkit-inner-spin-button]:opacity-100";

/** Clamped numeric input - the editor's stepper affordance. */
export function NumInput({
  value,
  onChange,
  min = 0,
  max = 999999,
  width = "md",
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  width?: keyof typeof NUM_WIDTH;
  className?: string;
}) {
  return (
    <input
      type="number"
      className={`${NUM} ${NUM_WIDTH[width]} ${className}`}
      value={value}
      min={min}
      max={max}
      onChange={(e) =>
        onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))
      }
    />
  );
}

/** Dropdown wearing the editor's field styling; options are the caller's. */
export function Select({
  value,
  onChange,
  children,
  tone = "default",
  disabled = false,
  className = "",
}: {
  value: string | number;
  onChange: (v: string) => void;
  children: ReactNode;
  tone?: keyof typeof SELECT_TONE;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <select
      className={`${SELECT} ${SELECT_TONE[tone]} ${className}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );
}

/** Trait select over a catalog pool; the empty option clears the slot. */
export function TraitSelect({
  value,
  onChange,
  pool,
  noneLabel = "-",
  className = "",
}: {
  value: TraitId | null;
  onChange: (v: TraitId | null) => void;
  pool: TraitDef[];
  noneLabel?: string;
  className?: string;
}) {
  return (
    <Select
      className={className}
      value={value ?? ""}
      onChange={(v) => onChange(v || null)}
    >
      <option value="">{noneLabel}</option>
      {pool.map((trait) => (
        <option key={trait.id} value={trait.id}>
          {trait.name}
        </option>
      ))}
    </Select>
  );
}

/**
 * Summon equip bonuses roll from a fixed set of values, so the field offers
 * exactly those - a value the summon cannot roll stays unrepresentable.
 */
export function TierSelect({
  value,
  onChange,
  tiers,
  format = String,
  className = "",
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  tiers: number[];
  format?: (v: number) => string;
  className?: string;
}) {
  return (
    <Select
      className={className}
      value={value ?? ""}
      onChange={(v) => onChange(v ? Number(v) : null)}
      disabled={tiers.length === 0}
    >
      <option value="">-</option>
      {tiers.map((tier) => (
        <option key={tier} value={tier}>
          {format(tier)}
        </option>
      ))}
    </Select>
  );
}
