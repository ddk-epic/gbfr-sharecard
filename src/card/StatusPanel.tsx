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

type Status = Build["status"];

type Row = {
  stat: StatIconId;
  label: string;
  ink: string;
  unit?: string;
  value: (s: Status) => number;
};

const LEFT: Row[] = [
  { stat: "hp", label: "HP", ink: "text-hp", value: (s) => s.hp },
  { stat: "atk", label: "ATK", ink: "text-atk", value: (s) => s.atk },
];

const RIGHT: Row[] = [
  {
    stat: "crit",
    label: "Crit. Hit Rate",
    ink: "text-ui",
    unit: "%",
    value: (s) => s.critRate,
  },
  {
    stat: "stun",
    label: "Stun Power",
    ink: "text-ui",
    value: (s) => s.stunPower,
  },
];

export function StatusPanel({
  status,
  className = "",
}: {
  status: Status;
  className?: string;
}) {
  return (
    <SectionPanel shadow className={`${className} pr-4 pl-4`}>
      <div className="grid grid-cols-[9fr_11fr] gap-x-5">
        <Half rows={LEFT} status={status} digits={6} />
        <Half rows={RIGHT} status={status} digits={5} className="pr-4" />
      </div>
    </SectionPanel>
  );
}

function Half({
  rows,
  status,
  digits,
  className = "",
}: {
  rows: Row[];
  status: Status;
  digits: keyof typeof VALUE_BOX;
  className?: string;
}) {
  return (
    <div
      className={`grid min-w-0 grid-cols-[auto_auto_1fr] content-center items-baseline gap-x-1 gap-y-5.5 ${className}`}
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
            <span
              className={`tracking-tight tabular-nums ${row.ink} ${VALUE_FONT} ${VALUE_WEIGHT}`}
            >
              {row.value(status)}
            </span>
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
