import type { Character } from "../domain/catalog";
import { CHARACTERS, portraitUrl } from "../data";
import { hasBuild } from "../domain/storage";
import "./CharacterSelect.css";

/** Roster slots kept for characters that have not been added yet. */
const UNREVEALED_SLOTS = 6;

export function CharacterSelect({
  onCharacterPick,
}: {
  onCharacterPick: (characterId: string) => void;
}) {
  return (
    <div className="selWrap">
      <div className="brand">
        <span className="mark">GBFR</span>
        <span className="what">Build Card Maker</span>
      </div>
      <div className="win">
        <h3>Character Select</h3>
        <div className="grid">
          {CHARACTERS.map((character) => (
            <CharacterTile
              key={character.id}
              character={character}
              onCharacterPick={onCharacterPick}
            />
          ))}
          {Array.from({ length: UNREVEALED_SLOTS }, (_, slot) => (
            <div key={`unrevealed-${slot}`} className="tile off blank">
              <div className="soon">Soon</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CharacterTile({
  character,
  onCharacterPick,
}: {
  character: Character;
  onCharacterPick: (characterId: string) => void;
}) {
  return (
    <div
      className={`tile ${character.enabled ? "" : "off"}`}
      onClick={
        character.enabled ? () => onCharacterPick(character.id) : undefined
      }
    >
      <div
        className="art"
        style={{
          backgroundImage: `url('${portraitUrl(character.id)}')`,
          backgroundPosition: `center ${character.portraitY}%`,
        }}
      />
      <div className="fade" />
      {character.enabled && hasBuild(character.id) && (
        <span className="built">Saved</span>
      )}
      <div className="nm">{character.name}</div>
      {!character.enabled && <div className="soon">Soon</div>}
    </div>
  );
}
