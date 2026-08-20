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
    ["unknown character", "/?c=bogus&v=skills", "/"],
    ["not-yet-added character", "/?c=vaseraga&v=card", "/"],
    ["view with no character", "/?v=skills", "/"],
    ["unknown view", "/?c=io&v=nope", "/"],
    ["the editor screen, which is no longer a view", "/?c=io&v=editor", "/"],
    ["character with no view", "/?c=io", "/"],
    ["the old spelling", "/?character=io&screen=editor", "/"],
    ["stray param", "/?c=io&v=gear&page=99", "/?c=io&v=gear"],
    ["junk param", "/?c=io&v=card&page=abc", "/?c=io&v=card"],
  ])("%s is rewritten", async (_, url, expected) => {
    expect(await redirectFor(url)).toBe(expected);
  });

  test.each([
    ["the grid", "/"],
    ["the skills pane", "/?c=io&v=skills"],
    ["the gear pane", "/?c=io&v=gear"],
    ["the master traits pane", "/?c=io&v=mt"],
    ["the card", "/?c=io&v=card"],
  ])("%s is left alone", async (_, url) => {
    expect(await redirectFor(url)).toBeNull();
  });

  // A target that itself redirects would loop until the router gives up.
  test("every rewrite lands somewhere final", async () => {
    const targets = [
      "/?c=bogus&v=skills",
      "/?v=skills",
      "/?c=io",
      "/?character=io&screen=editor",
      "/?c=io&v=gear&page=99",
    ];
    for (const url of targets) {
      const target = await redirectFor(url);
      expect(await redirectFor(target!)).toBeNull();
    }
  });
});
