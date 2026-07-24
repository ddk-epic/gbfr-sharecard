import { useState } from "react";
import { Stage, STAGE_HEIGHT } from "./Stage";
import { CharacterSelect } from "../screens/CharacterSelect";
import { Editor } from "../screens/editor/Editor";
import { CardScreen } from "../screens/CardScreen";
import { emptyBuild, type Build } from "../domain/build";
import { loadBuild, saveBuild } from "../domain/storage";

type ScreenIndex = 0 | 1 | 2;

/**
 * One route, three screens on a single vertical track (select, editor, card).
 * Every transition is the same scroll-down motion: the arriving screen fades
 * in and the slash background stays fixed.
 */
export function App() {
  const [screen, setScreen] = useState<ScreenIndex>(0);
  const [build, setBuild] = useState<Build | null>(null);

  const pickCharacter = (characterId: string) => {
    setBuild(loadBuild(characterId) ?? emptyBuild(characterId));
    setScreen(1);
  };

  const updateBuild = (next: Build) => {
    setBuild(next);
    saveBuild(next);
  };

  return (
    <Stage>
      <div className="shell">
        <div
          className="track"
          style={{ transform: `translateY(${-STAGE_HEIGHT * screen}px)` }}
        >
          <div className="scr">
            <div className={`fadeWrap ${screen === 0 ? "on" : ""}`}>
              <CharacterSelect onCharacterPick={pickCharacter} />
            </div>
          </div>
          <div className="scr s1">
            <div className={`fadeWrap ${screen === 1 ? "on" : ""}`}>
              {build && (
                <Editor
                  build={build}
                  onChange={updateBuild}
                  onBack={() => setScreen(0)}
                  onGenerate={() => setScreen(2)}
                />
              )}
            </div>
          </div>
          <div className="scr s2">
            <div className={`fadeWrap ${screen === 2 ? "on" : ""}`}>
              {build && (
                <CardScreen build={build} onBack={() => setScreen(1)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}
