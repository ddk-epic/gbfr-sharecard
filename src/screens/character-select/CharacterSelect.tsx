import type { CharacterId } from "@/catalog/ids";
import type { Character } from "@/catalog/types";
import { thumbUrl } from "@/assets/urls";
import { CHARACTERS } from "@/catalog";
import { hasBuild } from "@/infra/storage";
import { Heading, Panel } from "@/components/ui";

const SOON =
  "absolute inset-0 flex items-center justify-center text-[30px] font-extrabold tracking-[0.14em] uppercase text-[#05283f]";

export function CharacterSelect({
  onCharacterPick,
}: {
  onCharacterPick: (characterId: CharacterId) => void;
}) {
  // Viewport is shorter than the 1080px stage; this block stays under ~900px.
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5">
      <div className="flex w-[66%] items-baseline justify-center gap-3">
        <span className="text-ink-strong text-[40px] leading-none font-extrabold tracking-[0.06em] [text-shadow:0_2px_10px_rgba(23,60,90,0.22)]">
          GBFR
        </span>
        <span className="text-gold-deep text-[16px] font-semibold tracking-[0.18em] uppercase">
          Build Card Maker
        </span>
      </div>
      <Panel className="w-[66%]">
        <Heading>Character Select</Heading>
        <div className="grid grid-cols-8 gap-2.5">
          {CHARACTERS.map((character) => (
            <CharacterTile
              key={character.id}
              character={character}
              onCharacterPick={onCharacterPick}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function CharacterTile({
  character,
  onCharacterPick,
}: {
  character: Character;
  onCharacterPick: (characterId: CharacterId) => void;
}) {
  const on = character.enabled;
  return (
    <div
      className={`group relative aspect-square overflow-hidden rounded-lg bg-white/85 shadow-[inset_0_0_0_1px_var(--line-soft)] ${
        on
          ? "cursor-pointer hover:shadow-[inset_0_0_0_2px_var(--gold),0_2px_12px_rgba(23,60,90,0.3)]"
          : "cursor-default"
      }`}
      onClick={on ? () => onCharacterPick(character.id) : undefined}
    >
      {/* Pre-cut, pre-baked square thumbnail. */}
      <div
        className={`absolute inset-0 bg-cover bg-center ${
          on ? "" : "opacity-40 brightness-[1.06] grayscale"
        }`}
        style={{ backgroundImage: `url('${thumbUrl(character.id)}')` }}
      />
      {/* own layer, so its 28px is fixed regardless of the name's font size */}
      <div
        className={`absolute bottom-0 left-0 h-7 w-full bg-linear-to-b from-transparent ${
          on
            ? "via-gold/55 to-gold-deep/92 via-35%"
            : "to-[rgba(70,90,105,0.7)]"
        }`}
      />
      {on && hasBuild(character.id) && (
        <span className="from-gold to-gold-deep absolute top-1 right-1 rounded bg-linear-90 px-1.75 py-px text-[11px] font-bold tracking-[0.04em] text-white shadow-[0_1px_4px_rgba(90,30,0,0.3)] [text-shadow:0_1px_2px_rgba(90,30,0,0.55)]">
          Saved
        </span>
      )}
      {/* stroke under fill, so the glyph weight is unchanged */}
      <div
        className={`absolute bottom-0 left-0 w-full overflow-hidden px-1.25 pt-3 pb-0.75 text-center text-[16.5px] font-semibold text-ellipsis whitespace-nowrap [paint-order:stroke_fill] ${
          on
            ? "text-[#f3f9f3] [-webkit-text-stroke:2px_var(--ink-strong)] [text-shadow:0_1px_2px_rgba(90,30,0,0.55)]"
            : "text-line [-webkit-text-stroke:2px_#38505f] [text-shadow:0_1px_2px_rgba(10,40,60,0.6)]"
        }`}
      >
        {character.name}
      </div>
      {!on && (
        <div
          className={`${SOON} opacity-0 transition-opacity duration-100 group-hover:opacity-45`}
        >
          Soon
        </div>
      )}
    </div>
  );
}
