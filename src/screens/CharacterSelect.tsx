import type { Character } from "../domain/catalog";
import { CHARACTERS, portraitUrl } from "../data";
import { hasBuild } from "../domain/storage";
import "./CharacterSelect.css";

export function CharacterSelect({
  onCharacterPick,
}: {
  onCharacterPick: (characterId: string) => void;
}) {
  return (
    <div className="selWrap">
      <div className="win">
        <h3>Character Select</h3>
        <div className="sub">Pick a character to start building.</div>
        <div className="grid">
          {CHARACTERS.map((character) => (
            <CharacterTile
              key={character.id}
              character={character}
              onCharacterPick={onCharacterPick}
            />
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
