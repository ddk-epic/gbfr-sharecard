import { Fragment } from "react";
import type { Build } from "../domain/build";
import type { StatIconId } from "../data";
import { StatIcon, SectionPanel } from "../ui";

const LABEL_FONT = "font-med";
const VALUE_FONT = "font-med";
const VALUE_WEIGHT =
  "[-webkit-text-stroke:0.4px_currentColor] [paint-order:stroke]";

const VALUE_BOX = {
  5: "w-[5ch]",
  6: "w-[6ch]",
};

const VALUE_INK = `tracking-tight tabular-nums ${VALUE_FONT} ${VALUE_WEIGHT}`;

/* The number input. It lies transparent over the span. */
const FIELD = `${VALUE_INK} caret-ink-strong absolute -inset-x-0.5 -inset-y-1.5 rounded-[5px] border border-transparent bg-transparent text-right text-transparent outline-none group-hover:border-line focus:border-band focus:bg-white/20 [&::-webkit-inner-spin-button]:appearance-none`;

const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v || 0));

type Status = Build["status"];

type Row = {
  key: keyof Status;
  stat: StatIconId;
  label: string;
  ink: string;
  unit?: string;
  max: number;
};

const LEFT: Row[] = [
  { key: "hp", stat: "hp", label: "HP", ink: "text-hp", max: 999999 },
  { key: "atk", stat: "atk", label: "ATK", ink: "text-atk", max: 999999 },
];

const RIGHT: Row[] = [
  {
    key: "critRate",
    stat: "crit",
    label: "Crit. Hit Rate",
    ink: "text-ui",
    unit: "%",
    max: 100,
  },
  {
    key: "stunPower",
    stat: "stun",
    label: "Stun Power",
    ink: "text-ui",
    max: 99999,
  },
];

export function StatusPanel({
  status,
  className = "",
  onChange,
}: {
  status: Status;
  className?: string;
  /** Editor-only: each value becomes an inline field, edited in place. */
  onChange?: (next: Status) => void;
}) {
  return (
    <SectionPanel
      shadow
      className={`${className} pr-4 pl-4 ${onChange ? "group" : ""}`}
    >
      <div className="grid grid-cols-[9fr_11fr] gap-x-5">
        <Half rows={LEFT} status={status} digits={6} onChange={onChange} />
        <Half
          rows={RIGHT}
          status={status}
          digits={5}
          className="pr-4"
          onChange={onChange}
        />
      </div>
    </SectionPanel>
  );
}

function Half({
  rows,
  status,
  digits,
  className = "",
  onChange,
}: {
  rows: Row[];
  status: Status;
  digits: keyof typeof VALUE_BOX;
  className?: string;
  onChange?: (next: Status) => void;
}) {
  return (
    <div
      className={`grid min-w-0 grid-cols-[auto_auto_1fr] content-center items-baseline gap-x-1 gap-y-4.5 ${className}`}
    >
      {rows.map((row) => (
        <Fragment key={row.stat}>
          <span className="relative w-7 self-stretch">
            <span className="absolute inset-0 flex items-center justify-center">
              <StatIcon stat={row.stat} scale={0.4} />
            </span>
          </span>
          <span
            className={`text-xl ${LABEL_FONT} whitespace-nowrap ${row.ink}`}
          >
            {row.label}
          </span>
          <span
            className={`relative justify-self-end text-right text-[28px] ${VALUE_BOX[digits]}`}
          >
            <span className={`${VALUE_INK} ${row.ink}`}>{status[row.key]}</span>
            {onChange && (
              <input
                type="number"
                aria-label={row.label}
                min={0}
                max={row.max}
                className={FIELD}
                value={status[row.key]}
                onChange={(e) =>
                  onChange({
                    ...status,
                    [row.key]: clamp(Number(e.target.value), row.max),
                  })
                }
              />
            )}
            {row.unit && (
              <i className="font-med absolute bottom-px left-full pl-0.5 text-[65%] not-italic">
                {row.unit}
              </i>
            )}
          </span>
        </Fragment>
      ))}
    </div>
  );
}
