import type { ReactNode } from "react";
import { STAT_ICON_ART } from "@/assets/art-metrics";
import { statIconUrl, type StatIconId } from "@/assets/urls";
import { SlantedBar } from "@/components/ui";

/** Px per source px: the glyphs differ in size and the game scales, not boxes. */
const STAT_ICON_SCALE = 0.27;

export function StatIcon({
  stat,
  scale = STAT_ICON_SCALE,
  className = "",
}: {
  stat: StatIconId;
  scale?: number;
  className?: string;
}) {
  const art = STAT_ICON_ART[stat];
  return (
    <img
      src={statIconUrl(stat)}
      alt=""
      className={`flex-none ${className}`}
      style={{ width: art.w * scale, height: art.h * scale }}
    />
  );
}

/** One base-stat plate: icon, then the caller's value field. */
export function BaseStat({
  children,
  stat,
  iconScale,
  iconOffset = 17,
  padRight = 16,
  noPadY = false,
  grow = true,
  height,
}: {
  children: ReactNode;
  stat: StatIconId;
  iconScale?: number;
  iconOffset?: number;
  padRight?: number;
  noPadY?: boolean;
  /** Share the row's width evenly with its siblings. */
  grow?: boolean;
  /** Fixed plate height; unset sizes to content. */
  height?: number;
}) {
  return (
    <span
      className={`relative inline-flex min-w-0 items-center ${grow ? "flex-1" : "flex-none"} ${noPadY ? "" : "py-0.75"}`}
      style={{ paddingRight: padRight, height }}
    >
      <SlantedBar />
      <span
        className="relative flex flex-none justify-center"
        style={{ width: iconOffset * 2 }}
      >
        <StatIcon stat={stat} scale={iconScale} />
      </span>
      <span
        className={`relative flex min-w-0 flex-1 items-center ${height === undefined ? "" : "self-baseline"}`}
      >
        {children}
      </span>
    </span>
  );
}
