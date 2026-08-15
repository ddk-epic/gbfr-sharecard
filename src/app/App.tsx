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
import { CharacterSelect } from "@/screens/character-select/CharacterSelect";
import { Editor } from "@/screens/editor/Editor";
import { CardScreen } from "@/screens/card/CardScreen";
import { emptyBuild, type Build } from "@/domain/build";
import { type CharacterId } from "@/catalog/ids";
import { readBuild, writeBuild } from "@/infra/storage";
import { defaultWeapon } from "@/domain/weapons";
import { ParchmentBackdrop } from "@/components/ui";

/**
 * No `validateSearch` on the route: on read the router merges its result over
 * the raw params, so it can add but never reject; on write it re-runs against
 * the destination and injects `screen=select` back into the URL.
 */
const rawSearch = (search: unknown) => search as Record<string, unknown>;

/** One screen per track slot, each a full stage height below the last. */
const SCREEN_TOP = ["top-0", "top-[1080px]", "top-[2160px]"];

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
        build:
          readBuild(nav.character) ??
          emptyBuild(nav.character, defaultWeapon(nav.character)),
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
 * Every transition is the same scroll-down motion: the arriving screen fades in.
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

  // Index is the track slot, so this order is the scroll order.
  const screens = [
    <CharacterSelect
      onCharacterPick={(character) => go({ screen: "editor", character })}
    />,
    scene && (
      <Editor
        build={scene.build}
        onChange={editBuild}
        onBack={() => goBack(SELECT)}
        onGenerate={() => go({ screen: "card", character: scene.character })}
      />
    ),
    scene && (
      <CardScreen
        build={scene.build}
        onBack={() => goBack({ screen: "editor", character: scene.character })}
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
          {screens.map((screen, i) => (
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
          ))}
        </div>
      </div>
    </Stage>
  );
}
