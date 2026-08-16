import { Fragment } from "react";
import type { Status } from "@/domain/status";
import type { StatIconId } from "@/assets/urls";
import { StatIcon } from "@/components/build/StatIcon";
import { SectionPanel } from "@/components/ui";

const LABEL_FONT = "font-med";
const VALUE_FONT = "font-med";
const VALUE_WEIGHT =
  "[-webkit-text-stroke:0.4px_currentColor] [paint-order:stroke]";

const VALUE_BOX = {
  5: "w-[5ch]",
  6: "w-[6ch]",
};

const VALUE_INK = `tracking-tight tabular-nums ${VALUE_FONT} ${VALUE_WEIGHT}`;

type Row = {
  key: keyof Status;
  stat: StatIconId;
  label: string;
  ink: string;
  unit?: string;
};

const LEFT: Row[] = [
  { key: "hp", stat: "hp", label: "HP", ink: "text-hp" },
  { key: "atk", stat: "atk", label: "ATK", ink: "text-atk" },
];

const RIGHT: Row[] = [
  {
    key: "critRate",
    stat: "crit",
    label: "Crit. Hit Rate",
    ink: "text-ui",
    unit: "%",
  },
  { key: "stunPower", stat: "stun", label: "Stun Power", ink: "text-ui" },
];

/** Read-only everywhere: the four stats are derived from the Build. */
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
