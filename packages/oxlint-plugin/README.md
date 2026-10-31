# @sonsu-lee/oxlint-plugin

Custom lint rules for Oxlint, also usable from ESLint.

The plugin is wrapped with `eslintCompatPlugin`, so the same rules run in Oxlint and ESLint. Rules use only the AST and scope analysis; rules that need TypeScript type information do not belong here.

## Install

Most projects should use [`@sonsu-lee/oxlint-config`](../oxlint-config), which registers this plugin. To use the plugin on its own:

```sh
pnpm add -D oxlint @sonsu-lee/oxlint-plugin
```

## Usage

```ts
// oxlint.config.ts
import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "sonsu-lee", specifier: "@sonsu-lee/oxlint-plugin" }],
  rules: {},
});
```

Register the plugin with `name: "sonsu-lee"`. Without an alias, Oxlint derives the namespace `@sonsu-lee` from the scoped package name.

## Rules

None yet.

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[MIT](LICENSE) © Sonsu Lee
