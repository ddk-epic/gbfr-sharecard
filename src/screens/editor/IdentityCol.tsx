import { CHARACTER_LEVEL } from "../../domain/build";
import { characterById, portraitUrl } from "../../data";
import { LvlBadge } from "../../card/LvlBadge";
import { NumInput, type PageProps } from "./controls";
import { Orb, StatIcon } from "../../ui";

const STATUS_FIELDS = [
  ["hp", "HP", "hp", "text-[#3fa32e]"],
  ["atk", "ATK", "default", "text-[#d9861f]"],
  ["critRate", "Crit. Hit Rate", "default", "text-value"],
  ["stunPower", "Stun Power", "default", "text-value"],
] as const;

/** Portrait, level, name and the Status 2x2; stays put across editor pages. */
export function IdentityCol({ build, onChange }: PageProps) {
  const character = characterById.get(build.characterId);
  return (
    <div className="relative flex min-w-0 flex-col justify-end">
      <div
        className="p absolute inset-x-0 top-0 h-[76%] bg-size-[auto_115%] bg-top"
        style={{
          backgroundImage: `url('${portraitUrl(build.characterId)}')`,
          backgroundPosition: `center ${character?.portraitY ?? 20}%`,
        }}
      />
      <LvlBadge level={CHARACTER_LEVEL} size={120} inset={6} />
      <div className="nb relative z-2 mx-2 mb-3 flex items-center justify-center gap-2.25 px-3.5 py-1.25 text-[22px] font-bold text-white">
        <Orb size={18} />
        {character?.name ?? build.characterId}
      </div>
      <section className="relative z-2 rounded-lg bg-white/78 px-3 py-2.5 shadow-[0_1px_6px_rgba(23,60,90,0.12)] backdrop-blur-[3px]">
        <div className="grid grid-flow-col grid-cols-2 grid-rows-2 gap-x-2 gap-y-1.5">
          {STATUS_FIELDS.map(([key, label, tone, numColor]) => (
            <div
              className="flex min-w-0 items-center gap-1.5 rounded-[5px] bg-white/85 px-2 py-1 shadow-[inset_0_0_0_1px_var(--color-line-soft)]"
              key={key}
            >
              <StatIcon tone={tone} />
              <span className="text-dim overflow-hidden text-[11px] text-ellipsis whitespace-nowrap">
                {label}
              </span>
              <NumInput
                width="stat"
                className={`ml-auto text-[15px] font-semibold ${numColor}`}
                value={build.status[key]}
                onChange={(value) =>
                  onChange({
                    ...build,
                    status: { ...build.status, [key]: value },
                  })
                }
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
