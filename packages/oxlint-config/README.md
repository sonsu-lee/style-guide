# @sonsu-lee/oxlint-config

Oxlint preset. Pick the profiles you need and override anything per project.

## Install

```sh
pnpm add -D oxlint oxlint-tsgolint @sonsu-lee/oxlint-config
```

Type-aware rules are on by default and run through `oxlint-tsgolint`. Your tsconfig must be compatible with TypeScript 7; the installed `typescript` package may be older. For a JavaScript project, pass `typescript: false` and skip `oxlint-tsgolint`.

## Usage

```ts
// oxlint.config.ts
import { preset } from '@sonsu-lee/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig(
  preset({ node: true, vitest: true, ignores: ['gen/**'] }, { rules: { 'no-console': 'off' } }),
);
```

Use `preset()` as the root config. Do not put it inside another config's `extends`: Oxlint does not inherit `ignorePatterns`, `env`, `globals`, or `settings` through `extends`, so those settings would be lost.

## API

### `preset(options?, userConfig?)`

Returns a complete Oxlint root config. Oxlint's `correctness`, `suspicious`, `perf`, and `pedantic` categories are on for the plugins of every selected profile; `style`, `restriction`, and `nursery` are off.

| Option | Default | Description |
| --- | --- | --- |
| `ignores` | `[]` | Paths to ignore in addition to `**/dist/**` and `**/coverage/**` |
| `typescript` | `true` | TypeScript plugin |
| `typeAware` | same as `typescript` | Type-aware rules, replacing the core rules they overlap with. Needs `typescript` |
| `node` | `false` | Node.js plugin and globals |
| `browser` | `false` | Browser globals |
| `react` | `false` | React and React Hooks plugin |
| `vitest` | `false` | Vitest plugin for `*.test.*`, `*.spec.*`, and `*.e2e-spec.*` files |
| `nestjs` | `false` | Allows code the NestJS CLI generates. Needs `typescript` and turns on `node` |

Passing `typescript: false` with `typeAware: true` or `nestjs: true`, or `node: false` with `nestjs: true`, throws an error. Why the preset uses these categories, and when a profile changes a rule, is described in [ADR 0005](../../docs/decisions/0005-profile-rule-sources.md).

`userConfig` is merged as follows:

| Field            | Behavior                                                       |
| ---------------- | -------------------------------------------------------------- |
| `ignorePatterns` | Appended after the defaults and `ignores`                      |
| `extends`        | Applied after the preset, so it takes precedence               |
| `plugins`        | Added to the plugins that the selected profiles enable         |
| `env`            | Merged by key over the profiles' environments; user values win |
| `options`        | Overrides the preset                                           |
| Other fields     | Used as given                                                  |

A config in `extends` that omits `plugins` turns Oxlint's default plugins (`unicorn`, `typescript`, `oxc`) back on, so set `plugins: []` or list the plugins it needs.

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[MIT](LICENSE) © Sonsu Lee
