# Oxlint constraints

Upstream behavior the design depends on. Checked with oxlint 1.90.0, oxlint-tsgolint 7.0.2005, eslint 10.14.0, and eslint-plugin-oxlint 1.90.0 on 2026-10-31 and 2026-11-01. Re-check when upgrading Oxlint.

Evidence: **experiment** = reproduced locally with a minimal config; **docs** = official documentation; **issue** = upstream issue tracker.

## `extends` inheritance

Each field was placed alone in an extended config, with an empty root config. `oxlint.config.ts` and `.oxlintrc.json` behaved the same. (experiment)

| Field | Inherited through `extends` | Upstream |
| --- | --- | --- |
| `rules`, `plugins`, `jsPlugins`, `overrides`, `categories` | Yes |  |
| `globals` | No | [oxc#16662](https://github.com/oxc-project/oxc/issues/16662) |
| `env` | No | [oxc#20087](https://github.com/oxc-project/oxc/issues/20087) |
| `settings` | No | [oxc#28047](https://github.com/oxc-project/oxc/issues/28047) |
| `ignorePatterns` | No | [oxc#10223](https://github.com/oxc-project/oxc/issues/10223), [oxc#16079](https://github.com/oxc-project/oxc/issues/16079) |
| `options.typeAware` | Root config only (docs) |  |

This looks like an implementation gap, not a design choice:

- The docs describe `extends` as inheriting configs merged first to last, with no excluded fields. (docs)
- Fix PR [oxc#24337](https://github.com/oxc-project/oxc/pull/24337) says `Oxlintrc::merge` copies `settings`, `env`, and `globals` only from the extending config. As of 2026-10-31 it is neither reviewed nor merged. (issue)
- The `ignorePatterns` issue has been open since 2025-04 with no merged fix. (issue)

Related: [oxc#20067](https://github.com/oxc-project/oxc/issues/20067) reports extended rules taking precedence over root rules. Locally, root `rules` did override extended rules. (experiment)

## Plugins

| Config | Enabled plugins |
| --- | --- |
| No `plugins` field | Default set: `unicorn`, `typescript`, `oxc`, plus ESLint core rules |
| Root `plugins: ["eslint"]` | Only the listed plugins; defaults are removed |
| `plugins` only inside `extends` | Default set plus the listed plugins; defaults cannot be removed |
| Root `plugins: []` and `extends` with `["typescript"]` | Only the plugins listed in `extends` |
| Root `plugins: []` and an extended config without `plugins` | Default set plus the plugins other extended configs list |

An extended config with `plugins: []` adds nothing. ESLint core rules stayed available in every case. (experiment)

## Categories, overrides, and rule names

- `categories` in any extended config apply to the plugins of every config, regardless of order. (experiment)
- A plugin enabled only in `overrides` gets category rules for the matching files only when at least one plugin is enabled outside `overrides`. (experiment)
- A rule of a plugin enabled only in `overrides` can be configured only in an override that lists that plugin in `plugins`. A later override, extended or root, that sets the rule without listing the plugin had no effect, even with `'off'`. (experiment)
- Brace globs work in override `files`, for example `**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}`. (experiment)
- In `extends`, a later config wins: a later `'off'` beats an earlier `'error'`. Root `rules` win over every extended config. (experiment)
- A rule name that does not exist fails config loading: `Rule 'no-such-rule' not found in plugin 'typescript'`. (experiment)
- With the typescript plugin enabled, core `correctness` rules did not report TypeScript overloads, declaration merging, or abstract classes, so the `off` entries of typescript-eslint's `eslint-recommended` are not needed. (experiment)
- Oxlint loads an `oxlint.config.ts` in a subdirectory as a nested config even when the subdirectory matches `ignorePatterns`. A nested config with `options.typeAware` fails loading. A config passed with `-c` under another file name is not picked up this way. (experiment)

## Environments

- Root `env: { node: true }` or `{ browser: true }` keeps the ECMAScript built-in globals. `no-global-assign` (a `correctness` rule) reports `process = {}` with `node` and `window = {}` with `browser`. (experiment)

## Rule reporting

- `react/rules-of-hooks` reports with the diagnostic code `react-hooks(rules-of-hooks)`. (experiment)
- In `*.e2e-spec.ts`, `vitest/no-focused-tests` reports a global `it.only` only when `it` is imported from `vitest`; `vitest/no-identical-title` reports in both cases. In `*.spec.ts`, both rules report. (experiment)
- With type-aware linting on, core `require-await` and `typescript/require-await` both reported the same async function. `no-implied-eval` and `prefer-promise-reject-errors` are the other core rules that have a type-aware typescript version, and all of them are in the categories the preset turns on. (experiment)
- `typescript/ban-types` is deprecated and reports `String` together with `typescript/no-wrapper-object-types`. `react/hooks` overlaps with `react/rules-of-hooks`, and `react/react-in-jsx-scope` reports JSX without `React` in scope; both are in `suspicious`. (experiment, docs)
- `--print-config` shows a rule turned off in an extended config as `"allow"`, not as a missing key. (experiment)
- `vitest/expect-expect` with `assertFunctionNames: ['request.**.expect']` accepts supertest chains such as `request(server).get('/').expect(200)`. (experiment)

## JS plugins

- Relative specifiers such as `./plugin.js` are rejected inside a config provided through `extends`. Package names work. (experiment)
- A scoped package registered without an alias gets the namespace `@<scope>`. Register it as `{ name, specifier }`. (experiment)
- The same JS plugin registered by several extended configs reports each problem once. (experiment)
- JS plugins do not receive TypeScript type information. (docs)
- A rule written with `createOnce` and wrapped in `eslintCompatPlugin` reported the same location in ESLint 10. (experiment)
- Performance: in 2025-10 a user reported built-in rules taking 500–700 ms and the same run with JS plugins taking up to 8 s; an Oxc team member called this expected and planned work on it ([antfu/eslint-config#767](https://github.com/antfu/eslint-config/issues/767)). Not re-measured with the current version.

## Type-aware linting

- tsgolint supports 59 of the 61 type-aware typescript-eslint rules; `naming-convention` and `prefer-destructuring` are missing. (docs)
- tsgolint bundles a TypeScript 7 compiler. Type-aware rules ran in a project that installs `typescript@6.0.3`. The tsconfig must not use options removed in TypeScript 7. (experiment, docs)
- With type-aware linting off, type-aware rules in the config are skipped without an error. (experiment)
- With `options.typeAware: true`, `--print-config` works without `oxlint-tsgolint`. Linting fails with `Failed to find tsgolint executable`. (experiment)
- tsgolint also lints JavaScript files outside the tsconfig `include`: `typescript/require-await` reported a `.js` file in a project whose tsconfig includes only `src/**/*.ts`. (experiment)

## ESLint interop

- typescript-eslint refuses to run with TypeScript 7. (experiment)
- `eslint-plugin-oxlint`'s `buildFromConfigFile("./oxlint.config.ts")` turns off rules that come from `extends`, but not rules run through `jsPlugins`. (experiment)

## Rules that conflict with NestJS

The `ts` and `ts-esm` templates of the NestJS CLI 12 (`@nestjs/schematics` 12.0.12) generate an `.oxlintrc.json` with `typescript/no-explicit-any: off`, `typescript/no-floating-promises: error`, and `env.node: true`, and lint with `oxlint --type-aware src/ test/`. Test files are `*.spec.ts` and `*.e2e-spec.ts`, and the Vitest template uses `globals: true`. (docs: package contents)

| Rule | Behavior in Nest code |
| --- | --- |
| `typescript/consistent-type-imports` | Reports a class imported only for constructor injection, even with `emitDecoratorMetadata` enabled. Applying the fix makes the injection metadata `Object` and breaks DI at runtime |
| `typescript/no-extraneous-class` | Reports `@Module({}) export class AppModule {}`; `allowWithDecorator: true` avoids it |
| `class-methods-use-this` | Reports controller and service methods that do not use `this` |

(experiment)
