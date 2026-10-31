# 0002: Expose the Oxlint preset as a factory that returns a root config

- Status: accepted
- Date: 2026-10-31

## Context and problem statement

Users should pick the profiles they need (TypeScript, React, tests, and so on) and still get ignore patterns, environment globals, and plugin settings from the preset. Oxlint's `extends` does not inherit `ignorePatterns`, `env`, `globals`, or `settings`, and `options.typeAware` can only be set in the root config.

## Considered options

1. Named exports used through `extends: [base, react]`
2. Named exports and a factory, both public
3. A single factory, `preset(options, userConfig)`, that returns a complete root config

## Decision outcome

Option 3.

- Profile configs live in `src/configs/` and contain only fields that `extends` inherits. They are not exported.
- `preset()` sets the root-only fields itself, then adds the selected profile configs and the user's config.
- The call shape (options first, user overrides second) follows `@antfu/eslint-config`. The reason for a factory is different: antfu needs shared options and package detection; this preset needs it because of the `extends` inheritance gap.

### Consequences

- Good: ignore patterns, environments, and plugin settings reach users without copying.
- Good: when Oxlint fixes inheritance, fields move from `preset.ts` to `src/configs/` without changing the public API.
- Bad: the result must be used as the root config; placing it inside another `extends` silently drops fields. The README states this.
- Bad: merge rules between the preset and `userConfig` need their own tests.

## More information

- Inheritance table and upstream issues: [oxlint-constraints.md](../reference/oxlint-constraints.md#extends-inheritance).
