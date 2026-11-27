# 0007: Lint CSS with Stylelint

- Status: accepted
- Date: 2026-11-27

## Context and problem statement

Oxlint does not lint CSS. Without a CSS linter, a typo such as `colr: red` can pass lint and be ignored by the browser. CSS linting should catch defects without taking over formatting from oxfmt.

## Considered options

1. Leave CSS without lint checks.
2. Use Stylelint with `stylelint-config-recommended`.
3. Use Stylelint with `stylelint-config-standard`.
4. Use Biome to lint CSS.

## Decision outcome

Use `stylelint-config-recommended` through `@sonsu-lee/stylelint-config`. It checks for problems such as invalid units and shorthand overrides. Unlike `stylelint-config-standard`, it does not impose notation conventions. The preset keeps the recommended rules and makes narrow exceptions for Tailwind CSS v4 directives and CSS Modules syntax. This also keeps CSS linting separate from the existing formatter instead of introducing another combined tool.

### Consequences

- Projects opt in to CSS linting separately from Oxlint.
- oxfmt still handles formatting. The preset does not order properties or support SCSS.

## More information

- [Stylelint recommended config](https://github.com/stylelint/stylelint-config-recommended)
- [ADR 0004: Format with oxfmt](0004-format-with-oxfmt.md)
