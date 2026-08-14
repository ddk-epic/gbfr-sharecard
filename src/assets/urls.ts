// Addresses for the art under public/. These bake in Vite's BASE_URL and the
// filename conventions the scripts/ exporters write, so they are a deployment
// concern rather than game data - which is why they sit outside catalog/.

import type {
  BonusTypeId,
  CharacterId,
  StyleRank,
  SummonId,
  TraitId,
} from "@/catalog/ids";
import type { ElementId } from "@/catalog/types";
import { characterById } from "@/catalog";
import iconIndexJson from "./icon-index.json";

export const portraitUrl = (characterId: CharacterId) =>
  `${import.meta.env.BASE_URL}${characterById.get(characterId)?.portrait ?? ""}`;

export const thumbUrl = (characterId: CharacterId) =>
  `${import.meta.env.BASE_URL}thumbnails/${characterId}.webp`;

export const parchmentUrl = `${import.meta.env.BASE_URL}card/parchment.webp`;

export const masterlevelArtUrl = (file: string) =>
  `${import.meta.env.BASE_URL}masterlevel/${file}.webp`;

export const pwrArtUrl = (file: string) =>
  `${import.meta.env.BASE_URL}pwr/${file}.webp`;

export const elementIconUrl = (element: ElementId) =>
  `${import.meta.env.BASE_URL}icons/elements/${element}.webp`;

export const skillIconUrl = (characterId: CharacterId, skillId: string) =>
  `${import.meta.env.BASE_URL}icons/skills/${characterId}/${skillId}.webp`;

/** The bonus-type id is the filename; over-mastery and summon equip bonuses share these. */
export const bonusIconUrl = (bonusType: BonusTypeId) =>
  `${import.meta.env.BASE_URL}icons/bonus/${bonusType}.webp`;

/** The summon id is already the name slug, which is the filename. */
export const summonIconUrl = (summonId: SummonId) =>
  `${import.meta.env.BASE_URL}icons/summon/${summonId}.webp`;

/** Weapon art carries no index: the exporter names each file after the
    weapon's display name, so the slugged name is the filename. */
const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const weaponArtUrl = (characterId: CharacterId, name: string) =>
  `${import.meta.env.BASE_URL}weapons/${characterId}/${slug(name)}.webp`;

export type StatIconId = "hp" | "atk" | "crit" | "stun" | "power";
export const statIconUrl = (stat: StatIconId) =>
  `${import.meta.env.BASE_URL}icons/stats/${stat}.webp`;

/** Master-trait board glyphs: rank badge by Style Rank, plus the level star and its backing. */
export const sboardRankIconUrl = (rank: StyleRank) =>
  `${import.meta.env.BASE_URL}icons/sboard/rank-${rank}.webp`;
export const starIconUrl = `${import.meta.env.BASE_URL}icons/sboard/star.webp`;
export const starBgUrl = `${import.meta.env.BASE_URL}icons/sboard/star-bg.webp`;

const TRAIT_GLYPHS = iconIndexJson.traits as Record<string, string>;
export const traitIconUrl = (trait: TraitId): string | null => {
  const glyph = TRAIT_GLYPHS[trait];
  return glyph ? `${import.meta.env.BASE_URL}icons/traits/${glyph}.webp` : null;
};
