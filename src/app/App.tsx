import { useState } from "react";
import {
  createRoute,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { rootRoute } from "./root-route";
import { Stage, STAGE_HEIGHT } from "./Stage";
import {
  decodeNav,
  depthOf,
  encodeNav,
  isCanonical,
  SELECT,
  type Nav,
} from "./nav";
import { CharacterSelect } from "../screens/CharacterSelect";
import { Editor } from "../screens/editor/Editor";
import { CardScreen } from "../screens/CardScreen";
import { emptyBuild, type Build, type CharacterId } from "../domain/build";
import { readBuild, writeBuild } from "../domain/storage";

/**
 * No `validateSearch` on the route: on read the router merges its result over
 * the raw params, so it can add but never reject; on write it re-runs against
 * the destination and injects `screen=select` back into the URL.
 */
const rawSearch = (search: unknown) => search as Record<string, unknown>;

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: App,
  // Replaces, to keep the junk URL out of history. encodeNav's output is
  // canonical, so this settles in one hop.
  beforeLoad: ({ search }) => {
    const raw = rawSearch(search);
    if (!isCanonical(raw))
      throw redirect({
        to: "/",
        search: encodeNav(decodeNav(raw)),
        replace: true,
      });
  },
});

/**
 * What the screens draw, as distinct from where the user is. The URL commits
 * instantly; the track takes a scroll to arrive, so the screen being left still
 * has to render. Advances only when a *different* character arrives.
 */
type Scene = { character: CharacterId; build: Build };

const sceneFor = (nav: Nav): Scene | null =>
  nav.screen === "select"
    ? null
    : {
        character: nav.character,
        build: readBuild(nav.character) ?? emptyBuild(nav.character),
      };

function useScene(nav: Nav) {
  const [scene, setScene] = useState(() => sceneFor(nav));
  // In render, not an effect: an effect commits one frame of the outgoing
  // character first.
  if (nav.screen !== "select" && nav.character !== scene?.character)
    setScene(sceneFor(nav));

  const editBuild = (build: Build) => {
    setScene({ character: build.characterId, build });
    writeBuild(build);
  };
  return [scene, editBuild] as const;
}

/**
 * One route, three screens on a single vertical track (select, editor, card).
 * Every transition is the same scroll-down motion: the arriving screen fades
 * in and the slash background stays fixed. The URL says which screen that is.
 */
export function App() {
  const nav = decodeNav(rawSearch(indexRoute.useSearch()));
  const navigate = useNavigate();
  const history = useRouter().history;
  const [scene, editBuild] = useScene(nav);

  const go = (next: Nav) => navigate({ to: "/", search: encodeNav(next) });
  /**
   * Only `go` pushes, so history is always a stack of increasing depth and a
   * pop lands on the screen below. Deep links start at the bottom of the stack
   * with nothing to pop to, so those rewrite the entry instead of stranding the
   * user on the page they arrived from.
   */
  const goBack = (next: Nav) =>
    history.canGoBack()
      ? history.back()
      : navigate({ to: "/", search: encodeNav(next), replace: true });
  const depth = depthOf(nav);

  return (
    <Stage>
      <div className="shell">
        <div
          className="track"
          style={{ transform: `translateY(${-STAGE_HEIGHT * depth}px)` }}
        >
          <div className="scr">
            <div className={`fadeWrap ${depth === 0 ? "on" : ""}`}>
              <CharacterSelect
                onCharacterPick={(character) =>
                  go({ screen: "editor", character })
                }
              />
            </div>
          </div>
          <div className="scr s1">
            <div className={`fadeWrap ${depth === 1 ? "on" : ""}`}>
              {scene && (
                <Editor
                  build={scene.build}
                  onChange={editBuild}
                  onBack={() => goBack(SELECT)}
                  onGenerate={() =>
                    go({ screen: "card", character: scene.character })
                  }
                />
              )}
            </div>
          </div>
          <div className="scr s2">
            <div className={`fadeWrap ${depth === 2 ? "on" : ""}`}>
              {scene && (
                <CardScreen
                  build={scene.build}
                  onBack={() =>
                    goBack({ screen: "editor", character: scene.character })
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}
