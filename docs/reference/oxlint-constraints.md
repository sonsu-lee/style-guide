# Oxlint constraints

Upstream behavior the design depends on. Checked with oxlint 1.90.0, oxlint-tsgolint 7.0.2005, eslint 10.14.0, and eslint-plugin-oxlint 1.90.0 on 2026-10-31. Re-check when upgrading Oxlint.

Evidence: **experiment** = reproduced locally with a minimal config; **docs** = official documentation; **issue** = upstream issue tracker.

## `extends` inheritance

Each field was placed alone in an extended config, with an empty root config. `oxlint.config.ts` and `.oxlintrc.json` behaved the same. (experiment)

| Field | Inherited through `extends` | Upstream |
|---|---|---|
| `rules`, `plugins`, `jsPlugins`, `overrides`, `categories` | Yes | |
| `globals` | No | [oxc#16662](https://github.com/oxc-project/oxc/issues/16662) |
| `env` | No | [oxc#20087](https://github.com/oxc-project/oxc/issues/20087) |
| `settings` | No | [oxc#28047](https://github.com/oxc-project/oxc/issues/28047) |
| `ignorePatterns` | No | [oxc#10223](https://github.com/oxc-project/oxc/issues/10223), [oxc#16079](https://github.com/oxc-project/oxc/issues/16079) |
| `options.typeAware` | Root config only (docs) | |

This looks like an implementation gap, not a design choice:

- The docs describe `extends` as inheriting configs merged first to last, with no excluded fields. (docs)
- Fix PR [oxc#24337](https://github.com/oxc-project/oxc/pull/24337) says `Oxlintrc::merge` copies `settings`, `env`, and `globals` only from the extending config. As of 2026-10-31 it is neither reviewed nor merged. (issue)
- The `ignorePatterns` issue has been open since 2025-04 with no merged fix. (issue)

Related: [oxc#20067](https://github.com/oxc-project/oxc/issues/20067) reports extended rules taking precedence over root rules. Locally, root `rules` did override extended rules. (experiment)

## Plugins

| Config | Enabled plugins |
|---|---|
| No `plugins` field | Default set: `unicorn`, `typescript`, `oxc`, plus ESLint core rules |
| Root `plugins: ["eslint"]` | Only the listed plugins; defaults are removed |
| `plugins` only inside `extends` | Default set plus the listed plugins; defaults cannot be removed |
| Root `plugins: []` and `extends` with `["typescript"]` | Only the plugins listed in `extends` |

ESLint core rules stayed available in every case. (experiment)

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

## ESLint interop

- typescript-eslint refuses to run with TypeScript 7. (experiment)
- `eslint-plugin-oxlint`'s `buildFromConfigFile("./oxlint.config.ts")` turns off rules that come from `extends`, but not rules run through `jsPlugins`. (experiment)

## Rules that conflict with NestJS

| Rule | Behavior in Nest code |
|---|---|
| `typescript/consistent-type-imports` | Reports a class imported only for constructor injection, even with `emitDecoratorMetadata` enabled. Applying the fix makes the injection metadata `Object` and breaks DI at runtime |
| `typescript/no-extraneous-class` | Reports `@Module({}) export class AppModule {}`; `allowWithDecorator: true` avoids it |
| `class-methods-use-this` | Reports controller and service methods that do not use `this` |

(experiment)
