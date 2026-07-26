import { useEffect, useRef } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { Build, StyleId, StyleRank } from "../domain/build";
import {
  CHARACTER_LEVEL,
  RANKS,
  STYLES,
  WEAPON_LEVEL,
  WEAPON_TRAIT_ROWS,
} from "../domain/build";
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
import { LvlBadge } from "./LvlBadge";
import "./Card.css";
import { Diamond, Heading, Icon, Orb } from "../ui";

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
const padLevel = (level: number | string) => String(level).padStart(2, " ");

function EmptyTraitRow() {
  return (
    <div className="trow">
      <Icon sm />
      <span className="dim">-</span>
      <span className="lvl dim">T.Lvl {padLevel("-")}</span>
    </div>
  );
}

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
        <LvlBadge level={CHARACTER_LEVEL} inset={10} />
        <div className="nb">
          <Orb size={20} />
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
            <Heading>Skills</Heading>
            {build.skills.map((skill, i) => (
              <div className="skillRow" key={i}>
                <Orb />
                {skill ? skillNames.get(skill) : <span className="dim">-</span>}
                <Diamond />
              </div>
            ))}
          </section>
        </div>
      </div>

      <div className="c2">
        <Heading>Weapon</Heading>
        <div className="wpanel">
          <div className="wrow">
            <span className={weaponDef ? "wname" : "wname dim"}>
              {weaponDef?.name ?? "No Weapon"}
            </span>
            <span className="dim wmeta">
              {weaponDef?.series ?? "-"} · Lv. {WEAPON_LEVEL}
            </span>
          </div>
          <div className="wimg" />
          <div className="wbase">
            <span className="s-hp">
              <span className="sIcon" />
              <span className={weaponDef ? "lvl" : "lvl dim"}>
                {weaponDef?.defaultHp ?? "-"}
              </span>
            </span>
            <span className="s-atk">
              <span className="sIcon" />
              <span className={weaponDef ? "lvl" : "lvl dim"}>
                {weaponDef?.defaultAtk ?? "-"}
              </span>
            </span>
            <span className="s-crit">
              <span className="sIcon" />
              <span className={weapon ? "lvl" : "lvl dim"}>
                {weapon ? (
                  <>
                    {weapon.critRate}
                    <i className="suf">%</i>
                  </>
                ) : (
                  "-"
                )}
              </span>
            </span>
            <span className="s-stun">
              <span className="sIcon" />
              <span className={weapon ? "lvl" : "lvl dim"}>
                {weapon?.stun ?? "-"}
              </span>
            </span>
          </div>
          {weapon && weaponDef
            ? weaponDef.rows.map((row, i) => (
                <div className="trow" key={i}>
                  <Icon sm />
                  <span>
                    {row.options ? (
                      <>
                        {weapon.rotatedTrait ? (
                          traitName(weapon.rotatedTrait)
                        ) : (
                          <span className="dim">-</span>
                        )}{" "}
                        <ArrowLeftRight className="swap" size="1em" />
                      </>
                    ) : (
                      traitName(row.trait)
                    )}
                  </span>
                  <span className="lvl">T.Lvl {padLevel(row.level)}</span>
                </div>
              ))
            : Array.from({ length: WEAPON_TRAIT_ROWS }, (_, i) => (
                <EmptyTraitRow key={i} />
              ))}
          <div className="imh">
            <span>Imbued Traits</span>
            <span>{wrightstoneName(build.wrightstone?.main.trait)}</span>
          </div>
          {[
            build.wrightstone?.main ?? null,
            build.wrightstone?.sub1 ?? null,
            build.wrightstone?.sub2 ?? null,
          ].map((row, i) =>
            row ? (
              <div className="trow" key={i}>
                <Icon sm />
                <span>{traitName(row.trait)}</span>
                <span className="lvl">T.Lvl {padLevel(row.level)}</span>
              </div>
            ) : (
              <EmptyTraitRow key={i} />
            ),
          )}
        </div>
        <Heading>Sigils</Heading>
        <div className="sigilStack">
          {build.sigils.map((slot, i) => (
            <div className="sigil" key={i}>
              <div className="cell">
                <Icon />
                <span className={slot ? "" : "dim"}>
                  {slot ? traitName(slot.primaryTrait) : "-"}
                </span>
              </div>
              <div className="cell sec">
                <Icon sm />
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
        <Heading className="mtH">
          Master Traits<span>{perkSummary}</span>
        </Heading>
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
                        <Icon tone="style" sm />
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
            <Heading>Over Mastery</Heading>
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
            <Heading>Summons</Heading>
            <div className="sGrid">
              {build.summons.map((slot, i) => (
                <div className="summonCard" key={i}>
                  <div className="r">
                    <Icon tone="summon" sm />
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
