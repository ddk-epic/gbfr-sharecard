import { CHARACTER_LEVEL, type Build } from "../../../domain/build";
import { Portrait } from "../../../card/Portrait";
import { LvlBadge } from "../../../card/LvlBadge";
import { MasterlevelBadge } from "../../../card/MasterLvlBadge";
import { NameBadge } from "../../../card/NameBadge";
import { PwrBadge } from "../../../card/PwrBadge";
import { StatusPanel } from "../../../card/StatusPanel";

/** Mirrors Portrait's own PORTRAIT_BLEED_RIGHT, which it keeps private. */
const PORTRAIT_BLEED_RIGHT = 130;

/** Power placeholder. */
const POWER = 56252;

/** The PwrIcon offset. */
const PWR_TOP = -150;

/** The vertical fill and blur hold to 20%, then fade away. */
const LAYER_FADE = "linear-gradient(to bottom, #000 20%, transparent)";

/** Card column 1 - portrait, badges, name and the Status panel. */
export function EditorIdentityCol({
  build,
  width,
  onChangeStatus,
}: {
  build: Build;
  width: number;
  onChangeStatus: (next: Build["status"]) => void;
}) {
  return (
    <div className="relative flex h-full flex-col justify-end gap-5.75">
      <div
        aria-hidden
        className="absolute inset-0 rounded-lg bg-white/30 backdrop-blur-xs"
        style={{ maskImage: LAYER_FADE }}
      />
      <Portrait
        characterId={build.characterId}
        seam={width - PORTRAIT_BLEED_RIGHT}
      />
      <LvlBadge level={CHARACTER_LEVEL} size={189} inset={-10} />
      <MasterlevelBadge size={130} top={-4} left={137} />
      <div className="relative">
        <PwrBadge power={POWER} size={110} top={PWR_TOP} left={10} />
      </div>
      <NameBadge characterId={build.characterId} className="relative" />
      <div className="relative z-2">
        <StatusPanel status={build.status} onChange={onChangeStatus} />
      </div>
    </div>
  );
}
