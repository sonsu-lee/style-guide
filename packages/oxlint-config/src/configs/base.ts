import type { OxlintConfig } from 'oxlint';

// Only fields inherited through `extends`: rules, plugins, jsPlugins, overrides, categories.
// Every config in `extends` sets `plugins`: Oxlint adds its default plugins for one that omits it.
// These are those defaults without `typescript`, which the typescript profile adds.
// The categories apply to the plugins of every profile. `style` and `restriction` hold opposing
// preferences and bans on language features, and `nursery` is unstable, so they stay off.
export const base: OxlintConfig = {
  plugins: ['unicorn', 'oxc'],
  categories: {
    correctness: 'error',
    suspicious: 'error',
    perf: 'error',
    pedantic: 'error',
  },
};
