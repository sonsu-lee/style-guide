# 0005: Take profile rules from Oxlint categories until rules are chosen one by one

- Status: accepted
- Date: 2026-11-01

## Context and problem statement

[#8](https://github.com/sonsu-lee/style-guide/issues/8) adds stack profiles to `preset()`, so each profile needs rules. Neither Oxlint's categories nor each stack's ESLint preset is a source this style guide should treat as authoritative; both are someone else's opinion. Choosing every rule against this repository's own criteria is the goal, but those criteria do not exist yet.

## Considered options

1. Oxlint categories as a starting point, adjusted rule by rule later
2. Each stack's recommended ESLint preset, copied rule by rule into the profile
3. Write the criteria first and choose every rule against them before adding profiles

## Decision outcome

Option 1.

- Type-aware linting is on by default, so the profiles assume type information. base turns on `correctness`, `suspicious`, `perf`, and `pedantic` for the plugins of every profile.
- `style` stays off: its rules hold opposing preferences, and some, such as `sort-imports`, overlap with the formatter ([0004](0004-format-with-oxfmt.md)). It reported 74 problems on this package.
- `restriction` stays off: it bans language features such as optional chaining and is meant to be picked from. `nursery` stays off because its rules are unstable.
- A profile changes a rule only when the rule reports the same code as another rule, or reports code that the stack's official docs or generated templates write, or to choose the options of a rule the categories turn on. The reason goes next to the change.
- Changes made this way so far: the core rules with type-aware versions are off, as in typescript-eslint's `recommended-type-checked`; `typescript/strict-boolean-expressions` disallows numbers and allows nullable booleans; `typescript/prefer-readonly-parameter-types` is off; `typescript/ban-types` is off as a deprecated duplicate; React turns off `react/hooks` and `react/react-in-jsx-scope` and allows concise arrow handlers that return `void`; Vitest accepts supertest's `.expect()` as an assertion and allows type assertions and long `describe` callbacks in tests; NestJS allows decorated empty classes and `void bootstrap()` in `main.ts`. The code comments give the reasons.
- Because tsgolint is always available, a few type-aware rules outside these categories are on: `typescript/use-unknown-in-catch-callback-variable` from typescript-eslint `strict-type-checked`, and `typescript/prefer-optional-chain` and `typescript/prefer-string-starts-ends-with` from `stylistic-type-checked`. `typescript/prefer-find` is left out because `unicorn/prefer-array-find` reports the same code. Choosing other rules is [#23](https://github.com/sonsu-lee/style-guide/issues/23).
- Option 2 was rejected because Oxlint cannot extend an ESLint preset, so every rule would be copied by hand while still resting on an outside opinion.
- Option 3 was rejected for now because it blocks profiles until every rule is reviewed.

### Consequences

- Good: profiles have useful rules now, and the list follows Oxlint's own classification.
- Bad: upgrading Oxlint can add or move rules without a change in this repository.
- Bad: rules the stacks treat as basic are off because Oxlint puts them in `style` or `restriction`, for example `typescript/no-explicit-any`, `no-var`, `prefer-const`, and `vitest/no-identical-title`.
- Bad: rules that a stack's preset turns off can be on, for example `react/no-unsafe`.
- Choosing rules against this repository's own criteria is left for later; it replaces this decision when done.

## More information

- [Oxlint rule categories](https://oxc.rs/docs/guide/usage/linter/config.html#enable-groups-of-rules-with-categories)
- Oxlint behavior the profiles depend on: [oxlint-constraints.md](../reference/oxlint-constraints.md).
