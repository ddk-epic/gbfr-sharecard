import type { ReactNode } from "react";

const LVL_TONE = {
  value: "text-value",
  hp: "text-hp",
  atk: "text-atk",
  ui: "text-ui",
  dim: "text-dim",
};

const LVL_SIZE = {
  base: "",
  stat: "text-3xl",
  wbase: "text-2xl",
  gear: "text-lg",
};

export function Lvl({
  children,
  tone = "value",
  size = "base",
  unit,
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof LVL_TONE;
  size?: keyof typeof LVL_SIZE;
  unit?: string;
  className?: string;
}) {
  return (
    <span
      className={`font-semibold tabular-nums ${unit ? "relative" : ""} ${LVL_TONE[tone]} ${LVL_SIZE[size]} ${className}`}
    >
      {children}
      {unit && (
        <i className="absolute bottom-px left-full text-[70%] not-italic">
          {unit}
        </i>
      )}
    </span>
  );
}
