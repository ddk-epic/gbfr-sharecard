import type { Build, TraitId } from "../../domain/build";
import type { TraitDef } from "../../domain/catalog";

/** Every editor page edits the whole Build and hands back a new one. */
export type PageProps = {
  build: Build;
  onChange: (next: Build) => void;
};

/** Clamped numeric input - the editor's stepper affordance. */
export function NumInput({
  value,
  onChange,
  min = 0,
  max = 999999,
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      className={`num ${className}`}
      value={value}
      min={min}
      max={max}
      onChange={(e) =>
        onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))
      }
    />
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
    <select
      className={`sel ${className}`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">{noneLabel}</option>
      {pool.map((trait) => (
        <option key={trait.id} value={trait.id}>
          {trait.name}
        </option>
      ))}
    </select>
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
    <select
      className={`sel ${className}`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={tiers.length === 0}
    >
      <option value="">-</option>
      {tiers.map((tier) => (
        <option key={tier} value={tier}>
          {format(tier)}
        </option>
      ))}
    </select>
  );
}
