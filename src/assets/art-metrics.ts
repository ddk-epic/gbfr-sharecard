import type { CharacterId, SummonId } from "@/catalog/ids";
import type { StatIconId } from "./urls";

export const STAT_ICON_ART: Record<StatIconId, { w: number; h: number }> = {
  hp: { w: 67, h: 67 },
  atk: { w: 85, h: 85 },
  crit: { w: 80, h: 84 },
  stun: { w: 79, h: 76 },
  power: { w: 127, h: 128 },
};

/** <x>% of the frame width. */
export const SUMMON_PORTRAIT_WIDTH = 120;

/** Y offset, px down. */
const SUMMON_PORTRAIT_OFFSET = 18;

/** Y offset override. */
const SUMMON_PORTRAIT_OFFSET_BY_ID: Record<SummonId, number> = {
  ahriman: 12,
  "ancient-dragon": 6,
  beelzebub: 30,
  behemoth: 6,
  cat: 60,
  cobra: 30,
  "crew-alliance-rafale": 30,
  "cruel-overseer": 30,
  "dark-gyre": 0,
  "elder-wyvern": 0,
  "elusious-windwyrm": 0,
  ennugi: 6,
  "family-zathba": 30,
  "folcan-defense-corps": 6,
  gerasene: 42,
  griffin: 42,
  "hope-filled-skydwellers": 30,
  lilith: 30,
  lucilius: 30,
  "mellose-clan": 30,
  "obsidian-raptor": 42,
  "ominous-form": 30,
  quakadile: 42,
  referee: 30,
  "silent-watcher": 30,
  "silver-wolf-corps": 30,
  "sword-veil-fellowship": 30,
  "true-believers": 0,
  "vrazarek-firewyrm": 30,
  "vulkan-bolla": -18,
  "wee-pincer": 0,
  "wilinus-icewyrm": -12,
};

export const summonPortraitOffset = (summonId: SummonId) =>
  SUMMON_PORTRAIT_OFFSET_BY_ID[summonId] ?? SUMMON_PORTRAIT_OFFSET;

const CHARACTER_PORTRAIT_OFFSET = { x: 50, y: 0 };

/** Override, per axis. */
const CHARACTER_PORTRAIT_OFFSET_BY_ID: Record<
  string,
  { x?: number; y?: number }
> = {
  cagliostro: { x: 70 },
  ghandagoza: { x: 45 },
  id: { x: 70 },
  sandalphon: { y: -130 },
};

export const characterPortraitOffset = (characterId: CharacterId) => ({
  ...CHARACTER_PORTRAIT_OFFSET,
  ...CHARACTER_PORTRAIT_OFFSET_BY_ID[characterId],
});
