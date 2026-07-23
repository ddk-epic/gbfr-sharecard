import { CHARACTER_LEVEL } from "../../domain/build";
import { characterById, portraitUrl } from "../../data";
import { NumInput, type PageProps } from "./controls";

const STATUS_FIELDS = [
  ["hp", "HP", "s-hp"],
  ["atk", "ATK", "s-atk"],
  ["critRate", "Crit. Hit Rate", "s-crit"],
  ["stunPower", "Stun Power", "s-stun"],
] as const;

/** Portrait, level, name and the Status 2x2; stays put across editor pages. */
export function IdentityCol({ build, onChange }: PageProps) {
  const character = characterById.get(build.characterId);
  return (
    <div className="pcol">
      <div
        className="p"
        style={{
          backgroundImage: `url('${portraitUrl(build.characterId)}')`,
          backgroundPosition: `center ${character?.portraitY ?? 20}%`,
        }}
      />
      <div className="lvlChip">
        Lvl <b>{CHARACTER_LEVEL}</b>
      </div>
      <div className="nb">
        <span className="orb" style={{ width: 18, height: 18 }} />
        {character?.name ?? build.characterId}
      </div>
      <section>
        <div className="stat2x2">
          {STATUS_FIELDS.map(([key, label, className]) => (
            <div className={`stat ${className}`} key={key}>
              <span className="sIcon" />
              <span className="lbl">{label}</span>
              <NumInput
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
