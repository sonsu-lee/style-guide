# @sonsu-lee/oxlint-config

Oxlint preset. Pick the profiles you need and override anything per project.

## Install

```sh
pnpm add -D oxlint @sonsu-lee/oxlint-config
```

For `typeAware: true`, also install `oxlint-tsgolint`. Your tsconfig must be compatible with TypeScript 7; the installed `typescript` package may be older.

## Usage

```ts
// oxlint.config.ts
import { defineConfig } from "oxlint";
import { preset } from "@sonsu-lee/oxlint-config";

export default defineConfig(
  preset(
    { typeAware: true, ignores: ["gen/**"] },
    { rules: { "no-console": "off" } },
  ),
);
```

Use `preset()` as the root config. Do not put it inside another config's `extends`: Oxlint does not inherit `ignorePatterns`, `env`, `globals`, or `settings` through `extends`, so those settings would be lost.

## API

### `preset(options?, userConfig?)`

Returns a complete Oxlint root config.

| Option | Default | Description |
|---|---|---|
| `ignores` | `[]` | Paths to ignore in addition to `**/dist/**` and `**/coverage/**` |
| `typeAware` | `false` | Run rules that need type information |

`userConfig` is merged as follows:

| Field | Behavior |
|---|---|
| `ignorePatterns` | Appended after the defaults and `ignores` |
| `extends` | Applied after the preset, so it takes precedence |
| `options` | Overrides the preset |
| Other fields | Used as given |

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[MIT](LICENSE) © Sonsu Lee
