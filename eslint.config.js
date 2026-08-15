import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  // Unlinted trees, mirroring .gitignore.
  { ignores: ["dist", "node_modules", "research", "tmp", ".wayfinder"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        fetch: "readonly",
        console: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        process: "readonly",
      },
    },
  },
  // layer boundaries: catalog -> domain -> {assets, components/ui}
  // -> components/build -> screens -> app.
  // One block per layer: flat config replaces a rule instead of merging it,
  // so a file matching two blocks would keep only the last block's patterns.
  ...[
    {
      layer: "src/catalog/**",
      deny: [
        "@/domain/*",
        "@/infra/*",
        "@/assets/*",
        "@/components/*",
        "@/screens/*",
        "@/app/*",
        "react",
        "react-dom",
      ],
      why: "catalog is the leaf layer; ids belong in catalog/ids.ts.",
    },
    {
      layer: "src/domain/**",
      deny: [
        "@/infra/*",
        "@/components/*",
        "@/screens/*",
        "@/app/*",
        "react",
        "react-dom",
      ],
      why: "domain is framework-free; it may not import UI or storage.",
    },
    {
      layer: "src/assets/**",
      deny: [
        "@/domain/*",
        "@/infra/*",
        "@/components/*",
        "@/screens/*",
        "@/app/*",
      ],
      why: "assets only addresses art; it sits below the domain.",
    },
    {
      layer: "src/components/ui/**",
      deny: [
        "@/domain/*",
        "@/catalog/*",
        "@/infra/*",
        "@/components/build/*",
        "@/screens/*",
        "@/app/*",
      ],
      why: "components/ui is generic chrome; anything speaking the game's vocabulary belongs in components/build.",
    },
    {
      layer: "src/components/build/**",
      deny: ["@/infra/*", "@/screens/*", "@/app/*"],
      why: "components may not reach up into screens, app or storage.",
    },
    {
      layer: "src/screens/card/**",
      deny: ["@/screens/editor/*", "@/screens/character-select/*", "@/app/*"],
      why: "screens never import each other; shared pieces belong in components/build.",
    },
    {
      layer: "src/screens/editor/**",
      deny: ["@/screens/card/*", "@/screens/character-select/*", "@/app/*"],
      why: "screens never import each other; shared pieces belong in components/build.",
    },
    {
      layer: "src/screens/character-select/**",
      deny: ["@/screens/card/*", "@/screens/editor/*", "@/app/*"],
      why: "screens never import each other; shared pieces belong in components/build.",
    },
  ].map(({ layer, deny, why }) => ({
    files: [layer],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: deny, message: why }] },
      ],
    },
  })),
  prettier,
);
