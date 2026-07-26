import { useEffect, useRef, type ReactNode } from "react";
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
import {
  BaseStat,
  Diamond,
  Heading,
  Icon,
  Lvl,
  Orb,
  StatIcon,
  TraitRow,
  Wpanel,
} from "../ui";

const STYLE_BORDER: Record<StyleId, string> = {
  insight: "border-t-insight",
  essence: "border-t-essence",
  crux: "border-t-crux",
};

const STYLE_RANK_LABELS: Record<StyleRank, string> = {
  r1: "Style Rank 1",
  r2: "Style Rank 2",
  r3: "Style Rank 3",
  ex: "Style Rank EX",
};

/** Heading to body is 7px under the 11px column gap. */
const COL_HEADING = "-mb-1";

const SECTION =
  "rounded-lg bg-white/78 px-3.5 py-3 shadow-[0_1px_6px_rgba(23,60,90,0.12)] backdrop-blur-[3px]";

const PLATE =
  "rounded-[5px] bg-white/85 shadow-[inset_0_0_0_1px_var(--color-line-soft)]";

const CELL = "flex min-w-0 items-center gap-1.75";

const CLIP = "overflow-hidden text-ellipsis whitespace-nowrap";

const OPT =
  "flex h-8.5 items-center gap-1.5 overflow-hidden rounded-sm px-1.75 py-0.75 text-[13.5px] leading-[1.12] data-long:gap-1 data-long:px-1.25 data-long:py-0.5 data-long:text-[11.5px] data-long:leading-[1.06]";

/** Figure-space pad so single-digit trait levels stay column-aligned. */
const padLevel = (level: number | string) => String(level).padStart(2, " ");

function EmptyTraitRow() {
  return (
    <TraitRow size="lg">
      <Icon sm />
      <span className="text-dim">-</span>
      <Lvl tone="dim">T.Lvl {padLevel("-")}</Lvl>
    </TraitRow>
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
  const wrightstoneRows = [
    build.wrightstone?.main ?? null,
    build.wrightstone?.sub1 ?? null,
    build.wrightstone?.sub2 ?? null,
  ];

  // Cells are uniform height, so labels that overflow get shrunk after layout.
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cardRef.current?.querySelectorAll("[data-opt]").forEach((el) => {
      if (el.scrollHeight > el.clientHeight + 1)
        el.setAttribute("data-long", "");
    });
  });

  return (
    <div
      className="shareCard text-ui relative flex h-[1080px] w-[1920px] overflow-hidden bg-linear-160 from-[#f4f8fc] from-0% via-[#e8eff7] via-60% to-[#dfe9f4] to-100% font-sans"
      ref={cardRef}
    >
      <div className="relative z-1 flex w-107.5 flex-col justify-end">
        <div
          className="p absolute inset-x-0 top-0 h-[70%] bg-size-[auto_115%] bg-top"
          style={{
            backgroundImage: `url('${portraitUrl(build.characterId)}')`,
            backgroundPosition: `center ${character?.portraitY ?? 20}%`,
          }}
        />
        <LvlBadge level={CHARACTER_LEVEL} inset={10} />
        <div className="nb relative z-2 mx-3.5 mb-4 flex items-center justify-center gap-2.5 px-4 py-1.5 text-[28px] font-bold text-white">
          <Orb size={20} />
          {character?.name ?? build.characterId}
        </div>
        <div className="relative z-2 flex flex-col gap-4.25 px-3.5 pb-14">
          <section className={SECTION}>
            <div className="grid grid-flow-col grid-cols-2 grid-rows-2 gap-x-2.5 gap-y-1.5">
              <StatCell tone="hp" label="HP" value={build.status.hp} />
              <StatCell tone="atk" label="ATK" value={build.status.atk} />
              <StatCell
                tone="ui"
                label="Crit. Hit Rate"
                value={build.status.critRate}
                unit="%"
              />
              <StatCell
                tone="ui"
                label="Stun Power"
                value={build.status.stunPower}
              />
            </div>
          </section>
          <section className={SECTION}>
            <Heading>Skills</Heading>
            {build.skills.map((skill, i) => (
              <div
                className="border-line-soft flex items-center gap-2 border-b py-1.5 text-[16.5px] last:border-b-0 last:pb-0"
                key={i}
              >
                <Orb />
                {skill ? (
                  skillNames.get(skill)
                ) : (
                  <span className="text-dim">-</span>
                )}
                <Diamond />
              </div>
            ))}
          </section>
        </div>
      </div>

      <div className="relative z-1 flex w-115 flex-col gap-2.75 p-3.5">
        <Heading className={COL_HEADING}>Weapon</Heading>
        <Wpanel shadow fill>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-[19px] font-bold ${weaponDef ? "" : "text-dim"}`}
            >
              {weaponDef?.name ?? "No Weapon"}
            </span>
            <span className="text-dim text-[12px] whitespace-nowrap">
              {weaponDef?.series ?? "-"} · Lv. {WEAPON_LEVEL}
            </span>
          </div>
          {/* placeholder until per-weapon art exists */}
          <div className="mt-0.5 mb-1 min-h-35 flex-1 rounded-[10px] bg-linear-115 from-[rgba(106,147,181,0.26)] to-[rgba(106,147,181,0.05)]" />
          <div className="mt-1 mb-1.5 flex items-baseline gap-1 text-[14.5px]">
            <BaseStat tone="hp">
              <WeaponStat tone="hp" filled={!!weaponDef}>
                {weaponDef?.defaultHp ?? "-"}
              </WeaponStat>
            </BaseStat>
            <BaseStat>
              <WeaponStat tone="atk" filled={!!weaponDef}>
                {weaponDef?.defaultAtk ?? "-"}
              </WeaponStat>
            </BaseStat>
            <BaseStat>
              <WeaponStat
                tone="ui"
                filled={!!weapon}
                unit={weapon ? "%" : undefined}
              >
                {weapon ? weapon.critRate : "-"}
              </WeaponStat>
            </BaseStat>
            <BaseStat>
              <WeaponStat tone="ui" filled={!!weapon}>
                {weapon?.stun ?? "-"}
              </WeaponStat>
            </BaseStat>
          </div>
          {weapon && weaponDef
            ? weaponDef.rows.map((row, i) => (
                <TraitRow
                  size="lg"
                  flush={i === weaponDef.rows.length - 1}
                  key={i}
                >
                  <Icon sm />
                  <span>
                    {row.options ? (
                      <>
                        {weapon.rotatedTrait ? (
                          traitName(weapon.rotatedTrait)
                        ) : (
                          <span className="text-dim">-</span>
                        )}{" "}
                        <ArrowLeftRight
                          className="text-essence align-[-0.12em]"
                          size="1em"
                        />
                      </>
                    ) : (
                      traitName(row.trait)
                    )}
                  </span>
                  <Lvl>T.Lvl {padLevel(row.level)}</Lvl>
                </TraitRow>
              ))
            : Array.from({ length: WEAPON_TRAIT_ROWS }, (_, i) => (
                <EmptyTraitRow key={i} />
              ))}
          <div className="text-dim mt-3.75 mb-0.5 flex justify-between text-[13px] tracking-[0.07em] uppercase">
            <span>Imbued Traits</span>
            <span>{wrightstoneName(build.wrightstone?.main.trait)}</span>
          </div>
          {wrightstoneRows.map((row, i) =>
            row ? (
              <TraitRow size="lg" key={i}>
                <Icon sm />
                <span>{traitName(row.trait)}</span>
                <Lvl>T.Lvl {padLevel(row.level)}</Lvl>
              </TraitRow>
            ) : (
              <EmptyTraitRow key={i} />
            ),
          )}
        </Wpanel>
        <Heading className={COL_HEADING}>Sigils</Heading>
        <div className="flex flex-col gap-[3.5px]">
          {build.sigils.map((slot, i) => (
            <div
              className={`${PLATE} grid grid-cols-[1fr_1fr_30px] items-center gap-2 px-2.25 py-[5.5px] text-[16.5px]`}
              key={i}
            >
              <div className={CELL}>
                <Icon />
                <span className={`${CLIP} ${slot ? "" : "text-dim"}`}>
                  {slot ? traitName(slot.primaryTrait) : "-"}
                </span>
              </div>
              <div className={`${CELL} text-dim`}>
                <Icon sm />
                <span className={CLIP}>
                  {slot?.secondaryTrait ? traitName(slot.secondaryTrait) : ""}
                </span>
              </div>
              <Lvl className="text-right">{slot ? slot.level : ""}</Lvl>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-1 flex flex-1 flex-col gap-2.75 p-3.5">
        <Heading
          tone="slash"
          className={`${COL_HEADING} flex items-baseline justify-between`}
        >
          Master Traits
          <span className="text-[13.5px] font-semibold tracking-[0.02em] text-[#3d6478] normal-case text-shadow-none">
            {perkSummary}
          </span>
        </Heading>
        <div className="grid grid-cols-3 gap-2.5">
          {STYLES.map((style) => (
            <div
              className={`styleCol relative flex flex-col gap-1.75 rounded-lg border-t-[3px] px-3 py-2.75 text-[#f2fafd] ${STYLE_BORDER[style]}`}
              key={style}
            >
              <h4 className="text-[19.5px] font-bold text-white [text-shadow:0_1px_3px_rgba(10,50,70,0.55)]">
                {catalog.styleNames[style]}
              </h4>
              {RANKS.map((rank) => (
                <div key={rank} className="flex flex-col gap-1.75">
                  <div className="mt-2.75 flex justify-between text-[14px] tracking-[0.08em] text-[#d5eef8] uppercase">
                    <span>{STYLE_RANK_LABELS[rank]}</span>
                    <span>{STYLE_RANK_BUDGETS[rank]} pts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.25">
                    {catalog.masterTraits[style][rank].map((cell) => (
                      <div
                        key={cell.id}
                        data-opt
                        className={`${OPT} ${
                          build.masterTraits[style][rank].includes(cell.id)
                            ? "to-slash-3/30 bg-linear-135 from-white/18 text-white shadow-[inset_0_0_0_1px_#b8ecf8]"
                            : "bg-[rgba(11,46,61,0.3)] text-[#a8d4e4]"
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
        <div className="grid grid-cols-[330px_1fr] items-start gap-4">
          <div>
            <Heading>Over Mastery</Heading>
            <Wpanel shadow>
              {build.overMastery.map((line, i) => (
                <div
                  className="border-line-soft flex items-baseline gap-2 border-b py-[4.5px] text-[16.5px] last:border-b-0 last:pb-0"
                  key={i}
                >
                  {line ? (
                    <>
                      {bonusTypeById.get(line.bonusType)?.name}
                      <Lvl className="ml-auto">
                        {bonusValueText(line.bonusType, line.value)}
                      </Lvl>
                    </>
                  ) : (
                    <span className="text-dim">-</span>
                  )}
                </div>
              ))}
            </Wpanel>
          </div>
          <div>
            <Heading>Summons</Heading>
            <div className="grid grid-cols-2 gap-1.75">
              {build.summons.map((slot, i) => (
                <div
                  className={`${PLATE} flex flex-col gap-0.75 px-2.75 py-2 text-[16.5px]`}
                  key={i}
                >
                  <div className="from-gold via-gold-deep to-gold-dark -mx-2.75 -mt-2 mb-0.75 flex min-w-0 items-center gap-1.5 rounded-t-md bg-linear-90 from-0% via-55% to-100% px-2.75 py-1.25">
                    <Icon tone="summon" sm />
                    <b className="text-[17.5px] font-bold text-white [text-shadow:0_1px_2px_rgba(90,30,0,0.55)]">
                      {slot ? summonById.get(slot.summonId)?.name : "-"}
                    </b>
                  </div>
                  <div className="grid grid-cols-[6fr_5fr] gap-3">
                    <div className="border-line-soft flex min-w-0 items-baseline gap-1.5 border-r pr-2.5">
                      <span className={`${CLIP} text-ui`}>
                        {slot?.trait ? traitName(slot.trait) : "-"}
                      </span>
                      {slot && <Lvl className="ml-1">{slot.traitLevel}</Lvl>}
                    </div>
                    <div className="flex min-w-0 items-baseline gap-1.5">
                      <span className={`${CLIP} text-dim`}>
                        {slot?.equipBonus
                          ? bonusTypeById.get(slot.equipBonus.bonusType)?.name
                          : "-"}
                      </span>
                      {slot?.equipBonus && (
                        <Lvl tone="dim" className="ml-1">
                          {bonusValueText(
                            slot.equipBonus.bonusType,
                            slot.equipBonus.value,
                          )}
                        </Lvl>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute right-4 bottom-2 z-5 text-[11.5px] tracking-wider text-[#7c8da3]">
        gbfr-sharecard · ddk-epic.github.io/gbfr-sharecard
      </div>
    </div>
  );
}

/** A c1 status box: label left, number right with its unit hung outside. */
function StatCell({
  tone,
  label,
  value,
  unit,
}: {
  tone: "hp" | "atk" | "ui";
  label: string;
  value: number;
  unit?: string;
}) {
  return (
    <div className={`${PLATE} flex items-baseline gap-2 px-2.5 py-1`}>
      <StatIcon
        tone={tone === "hp" ? "hp" : "default"}
        className="mr-0.5 self-center"
      />
      <span className="text-dim text-[13.5px]">{label}</span>
      <Lvl
        size="stat"
        tone={tone}
        unit={unit}
        className={`ml-auto ${tone === "ui" ? "mr-2.25" : ""}`}
      >
        {value}
      </Lvl>
    </div>
  );
}

/** A weapon base stat; `filled` is false when no weapon is equipped. */
function WeaponStat({
  children,
  tone,
  filled,
  unit,
}: {
  children: ReactNode;
  tone: "hp" | "atk" | "ui";
  filled: boolean;
  unit?: string;
}) {
  return (
    <Lvl
      size="wbase"
      tone={filled ? tone : "dim"}
      unit={unit}
      className={`ml-auto ${tone === "ui" ? "mr-2.25" : ""}`}
    >
      {children}
    </Lvl>
  );
}
