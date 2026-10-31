import type { OxlintConfig } from "oxlint";

// Only fields inherited through `extends`: rules, plugins, jsPlugins, overrides, categories.
export const base: OxlintConfig = {
  categories: { correctness: "error" },
};
