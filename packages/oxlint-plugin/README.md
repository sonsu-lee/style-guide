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
import { defineConfig } from 'oxlint';

export default defineConfig({
  jsPlugins: [{ name: 'sonsu-lee', specifier: '@sonsu-lee/oxlint-plugin' }],
  rules: { 'sonsu-lee/no-double-assertion': 'error' },
});
```

Register the plugin with `name: "sonsu-lee"`. Without an alias, Oxlint derives the namespace `@sonsu-lee` from the scoped package name.

With Yarn PnP, Oxlint cannot resolve a plugin by package name. Pass the resolved URL instead: `specifier: import.meta.resolve('@sonsu-lee/oxlint-plugin')`.

## Rules

| Rule | Description |
| --- | --- |
| [no-double-assertion](docs/rules/no-double-assertion.md) | Disallow chaining type assertions, such as `value as unknown as Foo` |
| [prefer-named-conditions](docs/rules/prefer-named-conditions.md) | Review mixed operators, inline callbacks, and groups of unnamed predicates |
| [require-effect-reason](docs/rules/require-effect-reason.md) | Require a synchronization reason on React Effect calls |
| [no-machine-context-mutation](docs/rules/no-machine-context-mutation.md) | Report writes to machine context |
| [no-machine-in-render](docs/rules/no-machine-in-render.md) | Report machine or actor creation directly during render |
| [no-unstable-actor-selector](docs/rules/no-unstable-actor-selector.md) | Review object or array selectors without a comparator |
| [prefer-machine-setup](docs/rules/prefer-machine-setup.md) | Review bare `createMachine` calls |
| [require-invoke-on-error](docs/rules/require-invoke-on-error.md) | Review invokes with a success transition but no failure transition |

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[MIT](LICENSE) © Sonsu Lee
