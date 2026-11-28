# style-guide

English | [한국어](README.ko.md) | [日本語](README.ja.md)

Shared lint and formatter configs, plus custom lint rules.

This repository publishes the Oxlint preset and custom rules I use across my JavaScript and TypeScript projects.

## Why

- **Fast by default.** Oxlint runs the built-in rules, including type-aware rules through tsgolint. ESLint is used only for rules Oxlint cannot run.
- **One call to configure.** `preset()` returns a complete Oxlint config, including the ignore patterns and settings that Oxlint's `extends` would drop.
- **Rules, not formatting.** Formatting belongs to oxfmt, so the lint preset never fights the formatter.

## Getting started

```sh
pnpm add -D oxlint oxlint-tsgolint @sonsu-lee/oxlint-config
```

```ts
// oxlint.config.ts
import { preset } from '@sonsu-lee/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig(preset({ node: true }, { rules: { 'no-console': 'off' } }));
```

TypeScript with type-aware rules is on by default, which needs `oxlint-tsgolint`. Pass `typescript: false` for a JavaScript project.

| Package | Description |
| --- | --- |
| [`@sonsu-lee/oxlint-config`](packages/oxlint-config) | Oxlint preset factory |
| [`@sonsu-lee/oxlint-plugin`](packages/oxlint-plugin) | Custom lint rules, run by Oxlint as a JS plugin |
| [`@sonsu-lee/eslint-config`](packages/eslint-config) | ESLint flat config for custom rules that read types |
| [`@sonsu-lee/eslint-plugin`](packages/eslint-plugin) | Typed rules, including `no-ignored-rejection` |

Install ESLint only for custom rules that read types. Oxlint runs its built-in type-aware rules without ESLint.

How the packages fit together: [ARCHITECTURE.md](ARCHITECTURE.md). Why they are built this way: [docs/decisions](docs/decisions).

## What a diagnostic means

| Severity | Action                                                     |
| -------- | ---------------------------------------------------------- |
| Error    | Fix the violation before merging.                          |
| Warning  | Review the code; keep it if the alternative is no clearer. |

Warnings alone do not fail the lint command. See [ADR 0006](docs/decisions/0006-rule-severity-and-policy-rules.md).

## Getting help

Open an issue on [GitHub Issues](https://github.com/sonsu-lee/style-guide/issues).

## Maintainers and contributing

Maintained by [@sonsu-lee](https://github.com/sonsu-lee). This is a personal configuration: suggestions are welcome, but pull requests that change the intended style may be declined. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and conventions.

## License

[MIT](LICENSE) © Sonsu Lee
