import { CHARACTER_LEVEL, type Build } from "@/domain/build";
import { Portrait } from "@/components/build/Portrait";
import { LvlBadge } from "@/components/build/LvlBadge";
import { MasterlevelBadge } from "@/components/build/MasterLvlBadge";
import { NameBadge } from "@/components/build/NameBadge";
import { PwrBadge } from "@/components/build/PwrBadge";
import { StatusPanel } from "@/components/build/StatusPanel";
import { deriveStatus } from "@/domain/status";
import { derivePower } from "@/domain/power";

/** Mirrors Portrait's own PORTRAIT_BLEED_RIGHT, which it keeps private. */
const PORTRAIT_BLEED_RIGHT = 130;

/** The PwrIcon offset. */
const PWR_TOP = -150;

/** The vertical fill and blur hold to 20%, then fade away. */
const LAYER_FADE = "linear-gradient(to bottom, #000 20%, transparent)";

/** Card column 1 - portrait, badges, name and the Status panel. */
export function IdentityCol({ build, width }: { build: Build; width: number }) {
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
      <MasterlevelBadge
        level={build.masterLevel}
        size={130}
        top={-4}
        left={137}
      />
      <div className="relative">
        <PwrBadge
          power={derivePower(build)}
          size={110}
          top={PWR_TOP}
          left={10}
        />
      </div>
      <NameBadge characterId={build.characterId} className="relative" />
      <div className="relative z-2">
        <StatusPanel status={deriveStatus(build)} />
      </div>
    </div>
  );
}
