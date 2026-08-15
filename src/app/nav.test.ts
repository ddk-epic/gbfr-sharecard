import { describe, expect, test } from "vitest";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { rootRoute } from "./root-route";
import { indexRoute } from "./App";

/**
 * Where beforeLoad sends this URL, or null when it is already canonical.
 * Committing the redirect would take a mounted router, so this reads the one
 * beforeLoad raised - and refuses to call a redirect it cannot read "no
 * redirect", which would pass every canonical case for free.
 */
async function redirectFor(url: string): Promise<string | null> {
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: [url] }),
  });
  await router.load();
  const redirect: unknown = router.state.redirect;
  if (redirect === undefined) return null;
  const href = (redirect as { options?: { href?: unknown } }).options?.href;
  if (typeof href !== "string")
    throw new Error(`unreadable router redirect: ${JSON.stringify(redirect)}`);
  return href;
}

describe("URL canonicalisation", () => {
  test.each([
    ["unknown character", "/?character=bogus&screen=editor", "/"],
    ["not-yet-added character", "/?character=vaseraga&screen=card", "/"],
    ["screen with no character", "/?screen=editor", "/"],
    ["unknown screen", "/?character=io&screen=nope", "/"],
    ["character with no screen", "/?character=io", "/"],
    [
      "stray param",
      "/?character=io&screen=editor&page=99",
      "/?character=io&screen=editor",
    ],
    [
      "junk param",
      "/?character=io&screen=card&page=abc",
      "/?character=io&screen=card",
    ],
  ])("%s is rewritten", async (_, url, expected) => {
    expect(await redirectFor(url)).toBe(expected);
  });

  test.each([
    ["the grid", "/"],
    ["the editor", "/?character=io&screen=editor"],
    ["the card", "/?character=io&screen=card"],
  ])("%s is left alone", async (_, url) => {
    expect(await redirectFor(url)).toBeNull();
  });

  // A target that itself redirects would loop until the router gives up.
  test("every rewrite lands somewhere final", async () => {
    const targets = [
      "/?character=bogus&screen=editor",
      "/?screen=editor",
      "/?character=io",
      "/?character=io&screen=editor&page=99",
    ];
    for (const url of targets) {
      const target = await redirectFor(url);
      expect(await redirectFor(target!)).toBeNull();
    }
  });
});
