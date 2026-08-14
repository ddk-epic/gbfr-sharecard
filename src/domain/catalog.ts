import type {
  BonusTypeId,
  CellId,
  CharacterId,
  SkillId,
  StyleId,
  StyleRank,
  SummonId,
  TraitId,
} from "./build";

export type ElementId =
  "fire" | "water" | "earth" | "wind" | "light" | "dark" | "plain";

export type Character = {
  id: CharacterId; // slug, e.g. "io"
  name: string;
  artId: string;
  /** `gem.PlayerReq`, gating the character's own sigils. Gran and Djeeta share
      The Captain's `PL0000`; Id's differs from its artId. */
  playerId: string;
  portrait: string; // path
  portraitX: number; // framing x-offset (px off centre)
  portraitY: number; // framing y-offset (px off centre)
  element: string;
  enabled: boolean;
};

export type TraitCategory =
  "basic" | "attack" | "defense" | "special" | "support";

export type TraitDef = {
  id: TraitId;
  name: string;
  /** Abbreviated display name override. */
  short?: string;
  maxLevel: number;
  category?: TraitCategory;
  /** Can be a sigil's own trait - 188 of the 200, the rest weapon traits. */
  firstTrait?: true;
  /** Can sit in a sigil's second slot behind any first trait - 90 traits, a
      superset of `wrightstoneSub`. */
  secondTrait?: true;
  /** The style's other character trait, by id. A character trait may sit second
      only behind this one, in either order. Set on the 56 paired traits, two
      per style. */
  pairsWith?: TraitId;
  /** In the archive's one random-trait pool, which a wrightstone's two subs
      draw from. 72 traits. */
  wrightstoneSub?: true;
  /** Every gem granting this trait first is single-trait. A property of those
      sigils, not the trait: it can still be a `secondTrait` on someone else's
      sigil, as Crabmiration is. */
  noSecondSlot?: true;
  /** Character-locked sigil, by `Character.playerId`. */
  character?: string;
};

export type BonusTypeDef = {
  id: BonusTypeId;
  name: string;
  unit: "flat" | "percent";
  overMastery: number[];
};

/** Summons roll equip bonuses from one of three value tables. */
export type EquipTierGroup = "legendary" | "mid" | "low";

export type SummonEquipTiers = Record<
  EquipTierGroup,
  Record<BonusTypeId, number[]>
>;

export type SummonDef = {
  id: SummonId;
  name: string;
  traits: TraitId[]; // the main traits this summon can roll
  equipTier: EquipTierGroup;
};

/** Fixed carries `trait`; `pool` lets the player pick, `pool[0]` default, with
 *  `@signature` standing for the per-character trait. `levels` keys a sequence
 *  in weapon-levels.json. */
export type WeaponSlot = { levels: string; trait?: TraitId; pool?: TraitId[] };

/** `atk` is the maxed series constant; `hp` is the maxed value at zero hp-offset. */
export type WeaponSeries = {
  id: string;
  name: string;
  atk: number;
  hp: number;
  slots: WeaponSlot[];
};

/** Named T0-T7 level sequences shared by the series' slots. */
export type WeaponLevels = Record<string, number[]>;

export type WeaponEntry = { name: string; awakened?: string };

/** A pool slot always carries its picked trait, so no resolved row is empty. */
export type ResolvedWeaponSlot = {
  kind: "fixed" | "pool";
  trait: TraitId;
  pool: TraitId[]; // pool: options with @signature resolved; fixed: []
  level: number;
};

export type ResolvedWeapon = {
  name: string;
  seriesName: string;
  atk: number;
  hp: number;
  slots: ResolvedWeaponSlot[];
};

export type WrightstonePrefixMap = Record<TraitId, string>; // main trait -> display prefix

/** `label` is the short UI string, `description` the full in-game text.
 *  `perkRank` is the perk tier (I-III) the cell is gated behind, read off the
 *  description's "<Style> Rank I/II/III:" prefix; absent when ungated. */
export type MasterTraitCell = {
  id: CellId;
  label: string;
  description: string;
  perkRank?: 1 | 2 | 3;
};

/** `title` is the character-specific half of the style's in-game heading
 *  ("Insight: Pure Concentration"). */
export type MasterTraitSections = Record<
  StyleId,
  { title: string } & Record<StyleRank, MasterTraitCell[]>
>;

/** Selection counts activating style perks 1..3 */
export const PERK_THRESHOLDS: number[] = [3, 6, 6];

export type CharacterCatalog = {
  id: string;
  skills: { id: SkillId; name: string; element: ElementId }[];
  masterTraits: MasterTraitSections;
  weapons: Record<string, WeaponEntry>; // keyed by series-row id, the character's owned series
  weaponHpOffset: number; // added to series.hp; one integer per character (Terminus exempt)
  weaponSignatureTrait?: TraitId; // the per-character Ascension/Terminus slot-2 trait
};
