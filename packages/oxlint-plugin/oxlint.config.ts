import { defineConfig } from "oxlint";

// Lint this package with its own unpublished rules. Register new rules in `rules`.
export default defineConfig({
  jsPlugins: [{ name: "sonsu-lee", specifier: "./src/index.ts" }],
  rules: {},
  ignorePatterns: ["dist"],
});
