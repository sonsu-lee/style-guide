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
  jsPlugins: [
    {
      // Without an alias, Oxlint derives the namespace `@sonsu-lee` from the scoped package name.
      name: 'sonsu-lee',
      // Oxlint resolves a package name from the project's root config, where a project that
      // installs only this preset may not see the plugin. A file:// URL resolved from this
      // package always points at the plugin installed with it.
      specifier: import.meta.resolve('@sonsu-lee/oxlint-plugin'),
    },
  ],
  rules: {
    'sonsu-lee/no-double-assertion': 'error',
    // A returned `undefined` can be a recovery value. Do not suggest an empty block instead:
    // sonsu-lee-eslint/no-ignored-rejection reports empty rejection handlers.
    'unicorn/no-useless-undefined': ['error', { checkArrowFunctionBody: false }],
    // Outside the categories, chosen individually under ADR 0006. Use branches in JSX too.
    'no-ternary': 'error',
    // Reports a subset of no-ternary.
    'no-unneeded-ternary': 'off',
    // Name boolean conversions with Boolean(value); numeric and string shorthand stay allowed.
    'no-implicit-coercion': ['error', { boolean: true, number: false, string: false }],
  },
};
