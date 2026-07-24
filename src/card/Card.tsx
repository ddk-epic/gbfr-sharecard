import { useEffect, useRef } from "react";
import type { Build, StyleId, StyleRank } from "../domain/build";
import { CHARACTER_LEVEL, RANKS, STYLES, WEAPON_LEVEL } from "../domain/build";
import { STYLE_RANK_BUDGETS, stylePerkStates } from "../domain/derive";
import {
  bonusTypeById,
  bonusValueText,
  characterById,
  characterCatalog,
  portraitUrl,
  summonById,
  traitName,
  weaponById,
  wrightstoneName,
} from "../data";
import "./Card.css";

const STYLE_COLOR_VARS: Record<StyleId, string> = {
  insight: "var(--insight)",
  essence: "var(--essence)",
  crux: "var(--crux)",
};

const STYLE_RANK_LABELS: Record<StyleRank, string> = {
  r1: "Style Rank 1",
  r2: "Style Rank 2",
  r3: "Style Rank 3",
  ex: "Style Rank EX",
};

/** Figure-space pad so single-digit trait levels stay column-aligned. */
const padLevel = (level: number) => String(level).padStart(2, " ");

/**
 * Read-only, exactly 1920x1080, never scaled itself - on-screen fitting is the
 * wrapper's job and the PNG export captures this node.
 */
export function Card({ build }: { build: Build }) {
  const character = characterById.get(build.characterId);
  const catalog = characterCatalog(build.characterId);
  const weapon = build.weapon;
  const weaponDef = weapon ? weaponById.get(weapon.weaponId) : undefined;
  const perks = stylePerkStates(build.masterTraits, catalog.perkThresholds);
  const perkSummary = STYLES.map(
    (style) =>
      `${catalog.styleNames[style]} Perk ${perks[style].lastIndexOf(true) + 1}`,
  ).join(" · ");
  const skillNames = new Map(catalog.skills.map((s) => [s.id, s.name]));

  // Cells are uniform height, so labels that overflow get shrunk after layout.
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cardRef.current?.querySelectorAll(".opt").forEach((el) => {
      if (el.scrollHeight > el.clientHeight + 1) el.classList.add("long");
    });
  });

  return (
    <div className="shareCard" ref={cardRef}>
      <div className="c1">
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
          <span className="orb" style={{ width: 20, height: 20 }} />
          {character?.name ?? build.characterId}
        </div>
        <div className="stack">
          <section>
            <div className="stat2x2">
              <StatCell className="s-hp" label="HP" value={build.status.hp} />
              <StatCell
                className="s-atk"
                label="ATK"
                value={build.status.atk}
              />
              <StatCell
                className="s-crit"
                label="Crit. Hit Rate"
                value={build.status.critRate}
                unit="%"
              />
              <StatCell
                className="s-stun"
                label="Stun Power"
                value={build.status.stunPower}
              />
            </div>
          </section>
          <section>
            <h3>Skills</h3>
            {build.skills.map((skill, i) => (
              <div className="skillRow" key={i}>
                <span className="orb" />
                {skill ? skillNames.get(skill) : <span className="dim">-</span>}
                <span className="diamond" />
              </div>
            ))}
          </section>
        </div>
      </div>

      <div className="c2">
        <h3>Weapon</h3>
        <div className="wpanel">
          {weapon && weaponDef ? (
            <>
              <div className="wrow">
                <span className="wname">{weaponDef.name}</span>
                <span className="dim wmeta">
                  {weaponDef.series} · Lv. {WEAPON_LEVEL}
                </span>
              </div>
              <div className="wimg" />
              <div className="wbase">
                <span className="s-hp">
                  <span className="sIcon" />
                  <span className="lvl">{weaponDef.defaultHp}</span>
                </span>
                <span className="s-atk">
                  <span className="sIcon" />
                  <span className="lvl">{weaponDef.defaultAtk}</span>
                </span>
                <span className="s-crit">
                  <span className="sIcon" />
                  <span className="lvl">
                    {weapon.critRate}
                    <i className="suf">%</i>
                  </span>
                </span>
                <span className="s-stun">
                  <span className="sIcon" />
                  <span className="lvl">{weapon.stun}</span>
                </span>
              </div>
              {weaponDef.rows.map((row, i) => (
                <div className="trow" key={i}>
                  <span className="icon sm" />
                  <span>
                    {row.options ? (
                      <>
                        {weapon.rotatedTrait ? (
                          traitName(weapon.rotatedTrait)
                        ) : (
                          <span className="dim">-</span>
                        )}{" "}
                        <span className="swap">⇄</span>
                      </>
                    ) : (
                      traitName(row.trait)
                    )}
                  </span>
                  <span className="lvl">T.Lvl {padLevel(row.level)}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="dim">no weapon</div>
          )}
          <div className="imh">
            <span>Imbued Traits</span>
            <span>{wrightstoneName(build.wrightstone?.main.trait)}</span>
          </div>
          {build.wrightstone ? (
            [
              build.wrightstone.main,
              build.wrightstone.sub1,
              build.wrightstone.sub2,
            ]
              .filter((row) => row !== null)
              .map((row, i) => (
                <div className="trow" key={i}>
                  <span className="icon sm" />
                  <span>{traitName(row.trait)}</span>
                  <span className="lvl">T.Lvl {padLevel(row.level)}</span>
                </div>
              ))
          ) : (
            <div className="trow">
              <span className="icon sm" />
              <span className="dim">-</span>
            </div>
          )}
        </div>
        <h3>Sigils</h3>
        <div className="sigilStack">
          {build.sigils.map((slot, i) => (
            <div className="sigil" key={i}>
              <div className="cell">
                <span className="icon" />
                <span className={slot ? "" : "dim"}>
                  {slot ? traitName(slot.primaryTrait) : "-"}
                </span>
              </div>
              <div className="cell sec">
                <span className="icon sm" />
                <span>
                  {slot?.secondaryTrait ? traitName(slot.secondaryTrait) : ""}
                </span>
              </div>
              <div className="lvl">{slot ? slot.level : ""}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="c3">
        <h3 className="mtH">
          Master Traits<span>{perkSummary}</span>
        </h3>
        <div className="mtGrid">
          {STYLES.map((style) => (
            <div
              className="styleCol"
              key={style}
              style={{ "--sc": STYLE_COLOR_VARS[style] } as React.CSSProperties}
            >
              <h4>{catalog.styleNames[style]}</h4>
              {RANKS.map((rank) => (
                <div key={rank}>
                  <div className="rank">
                    <span>{STYLE_RANK_LABELS[rank]}</span>
                    <span>{STYLE_RANK_BUDGETS[rank]} pts</span>
                  </div>
                  <div className="opts">
                    {catalog.masterTraits[style][rank].map((cell) => (
                      <div
                        key={cell.id}
                        className={`opt ${
                          build.masterTraits[style][rank].includes(cell.id)
                            ? "on"
                            : ""
                        }`}
                      >
                        <span className="icon sm" />
                        {cell.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="bottomRow">
          <div>
            <h3>Over Mastery</h3>
            <div className="wpanel">
              {build.overMastery.map((line, i) => (
                <div className="kvline" key={i}>
                  {line ? (
                    <>
                      {bonusTypeById.get(line.bonusType)?.name}
                      <span className="lvl">
                        {bonusValueText(line.bonusType, line.value)}
                      </span>
                    </>
                  ) : (
                    <span className="dim">-</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>Summons</h3>
            <div className="sGrid">
              {build.summons.map((slot, i) => (
                <div className="summonCard" key={i}>
                  <div className="r">
                    <span className="icon sm" />
                    <b>{slot ? summonById.get(slot.summonId)?.name : "-"}</b>
                  </div>
                  <div className="halves">
                    <div className="r">
                      <span className="dim">
                        {slot?.trait ? traitName(slot.trait) : "-"}
                      </span>
                      {slot && <span className="lvl">{slot.traitLevel}</span>}
                    </div>
                    <div className="r">
                      <span className="dim">
                        {slot?.equipBonus
                          ? bonusTypeById.get(slot.equipBonus.bonusType)?.name
                          : "-"}
                      </span>
                      {slot?.equipBonus && (
                        <span className="lvl">
                          {bonusValueText(
                            slot.equipBonus.bonusType,
                            slot.equipBonus.value,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="brand">
        gbfr-sharecard · ddk-epic.github.io/gbfr-sharecard
      </div>
    </div>
  );
}

function StatCell({
  className,
  label,
  value,
  unit,
}: {
  className: string;
  label: string;
  value: number;
  unit?: string;
}) {
  return (
    <div className={`stat ${className}`}>
      <span className="sIcon" />
      <span className="lbl">{label}</span>
      <span className="lvl">
        {value}
        {unit && <i className="suf">{unit}</i>}
      </span>
    </div>
  );
}
