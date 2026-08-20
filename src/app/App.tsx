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
  type EditorView,
  type Nav,
} from "./nav";
import { CharacterSelect } from "@/screens/character-select/CharacterSelect";
import { Editor } from "@/screens/editor/Editor";
import { CardScreen } from "@/screens/card/CardScreen";
import { emptyBuild, type Build } from "@/domain/build";
import { type CharacterId } from "@/catalog/ids";
import { readBuild, writeBuild } from "@/infra/storage";
import { defaultWeapon } from "@/domain/weapons";
import { ParchmentBackdrop } from "@/components/ui";

/** Params arrive untyped, so `beforeLoad` drops junk ones and keeps the
    grid on a bare `/`. */
const rawSearch = (search: unknown) => search as Record<string, unknown>;

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: App,
  // Rewrites any URL that is not what encodeNav would have written.
  // Replaces, so the junk URL stays out of history.
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

type Scene = { character: CharacterId; build: Build };

const sceneFor = (nav: Nav): Scene | null =>
  nav.view === "select"
    ? null
    : {
        character: nav.character,
        build:
          readBuild(nav.character) ??
          emptyBuild(nav.character, defaultWeapon(nav.character)),
      };

function useScene(nav: Nav) {
  const [scene, setScene] = useState(() => sceneFor(nav));
  // In render, not an effect: an effect paints one frame of the outgoing
  // character first.
  if (nav.view !== "select" && nav.character !== scene?.character)
    setScene(sceneFor(nav));

  const editBuild = (build: Build) => {
    setScene({ character: build.characterId, build });
    writeBuild(build);
  };
  return [scene, editBuild] as const;
}

/** One route, three screens stacked on a single vertical: select, editor, card. */
export function App() {
  const nav = decodeNav(rawSearch(indexRoute.useSearch()));
  const navigate = useNavigate();
  const history = useRouter().history;
  const [scene, editBuild] = useScene(nav);

  /** navigation primitives */
  const go = (next: Nav) => navigate({ to: "/", search: encodeNav(next) });

  const goBack = (next: Nav) =>
    history.canGoBack()
      ? history.back()
      : navigate({ to: "/", search: encodeNav(next), replace: true });

  /** A pane flip stays on one depth, so it replaces the current entry instead. */
  const goPane = (next: Nav) =>
    navigate({ to: "/", search: encodeNav(next), replace: true });
  const depth = depthOf(nav);
  // A card URL names no pane, so the editor below keeps the one it is showing.
  const editorView: EditorView | undefined =
    nav.view === "select" || nav.view === "card" ? undefined : nav.view;

  const screens = [
    <CharacterSelect
      onCharacterPick={(character) => go({ view: "skills", character })}
    />,
    scene && (
      <Editor
        build={scene.build}
        onChange={editBuild}
        view={editorView}
        onView={(view) => goPane({ view, character: scene.character })}
        onBack={() => goBack(SELECT)}
        onGenerate={() => go({ view: "card", character: scene.character })}
      />
    ),
    scene && (
      <CardScreen
        build={scene.build}
        onBack={() => goBack({ view: "skills", character: scene.character })}
      />
    ),
  ];

  return (
    <Stage>
      <div className="shell text-ui absolute inset-0 overflow-hidden bg-linear-160 from-[#f4f8fc] from-0% via-[#e8eff7] via-60% to-[#dfe9f4] to-100%">
        <ParchmentBackdrop />
        <div
          className="absolute inset-0 z-1 h-[3240px] transition-transform duration-550"
          style={{ transform: `translateY(${-STAGE_HEIGHT * depth}px)` }}
        >
          {screens.map((screen, i) => {
            const SCREEN_TOP = ["top-0", "top-[1080px]", "top-[2160px]"];

            return (
              <div
                key={i}
                className={`absolute left-0 h-[1080px] w-full ${SCREEN_TOP[i]}`}
              >
                <div
                  className={`absolute inset-0 transition-opacity duration-550 ease-[ease] ${
                    depth === i ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {screen}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
}
