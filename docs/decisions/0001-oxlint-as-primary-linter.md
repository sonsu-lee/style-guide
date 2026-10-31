# 0001: Use Oxlint as the primary linter and ESLint only where Oxlint cannot run a rule

- Status: accepted
- Date: 2026-10-31

## Context and problem statement

I want my lint rules, including custom rules and type-safety rules, to be installable as packages. Oxlint is much faster than ESLint and runs ESLint-compatible JS plugins, but JS plugins do not receive TypeScript type information.

## Considered options

1. Oxlint only
2. ESLint only
3. Oxlint as the primary linter, ESLint for what Oxlint cannot run

## Decision outcome

Option 3.

- Oxlint runs built-in rules, including type-aware rules through tsgolint, and custom AST rules through `jsPlugins`.
- ESLint runs only custom rules that need type information, and external plugins that do not work through `jsPlugins`.
- Packages are split by the linter that runs them: `oxlint-plugin` and `oxlint-config` now; `eslint-plugin` and `eslint-config` when the first typed custom rule appears.
- Rule namespaces differ (`sonsu-lee`, `sonsu-lee-eslint`), so a rule ID shows which linter runs it.

### Consequences

- Good: most rules, including typescript-eslint's type-aware rules, run at Oxlint speed.
- Good: projects that only use Oxlint do not install typescript-eslint or TypeScript 6.
- Bad: a project that needs typed custom rules runs two linters and needs TypeScript 6 for ESLint, because typescript-eslint rejects TypeScript 7.

## More information

- tsgolint covers 59 of 61 type-aware typescript-eslint rules: [Type-Aware Linting](https://oxc.rs/docs/guide/usage/linter/type-aware).
- JS plugins lack type information: [JS Plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins).
- Local checks: [oxlint-constraints.md](../reference/oxlint-constraints.md).
