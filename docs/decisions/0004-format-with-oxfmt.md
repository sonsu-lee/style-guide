# 0004: Format with oxfmt and keep formatting out of lint rules

- Status: accepted
- Date: 2026-10-31

## Context and problem statement

`@antfu/eslint-config` formats JavaScript and TypeScript with ESLint Stylistic rules and formats other files by running Prettier or dprint inside ESLint. This preset needs its own position on formatting.

## Considered options

1. Format through lint rules (ESLint Stylistic, run in Oxlint as a JS plugin)
2. Format with a dedicated formatter, oxfmt, and keep lint rules free of formatting

## Decision outcome

Option 2.

- Oxlint implements no stylistic rules, because ESLint removed them from core and moved them to the eslint.style community project ([oxc#481](https://github.com/oxc-project/oxc/issues/481)).
- ESLint deprecated its formatting rules in v8.53.0 and recommends a source code formatter ([ESLint blog, 2023-10-26](https://eslint.org/blog/2023/10/deprecating-formatting-rules/)).
- oxfmt targets Prettier-compatible output and includes import sorting, Tailwind class sorting, and package.json sorting ([Oxfmt](https://oxc.rs/docs/guide/usage/formatter)).
- Running ESLint Stylistic in Oxlint would require a JS plugin, which costs load time.

### Consequences

- Good: lint presets contain only rules; formatting is deterministic and fast.
- Rule: lint presets do not enable rules that overlap with oxfmt, such as `sort-imports`. The `style` category is not enabled as a whole.
- Layout rules a formatter does not cover (for example blank lines between declarations) may still be custom lint rules.
- Formatter settings are shared through a separate `oxfmt-config` package only when a shared setting appears.
