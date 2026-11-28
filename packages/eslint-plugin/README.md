# @sonsu-lee/eslint-plugin

Type-aware ESLint rules for TypeScript projects. Use [`@sonsu-lee/eslint-config`](../eslint-config/README.md) to enable these rules together, or configure the plugin directly as shown below.

## Install

```sh
pnpm add -D eslint typescript@6 @sonsu-lee/eslint-plugin
pnpm add -D @typescript-eslint/parser
```

## Use

In `eslint.config.mjs`, register the plugin for files included in a `tsconfig.json`:

```js
import plugin from '@sonsu-lee/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: { parser, parserOptions: { projectService: true } },
    plugins: { 'sonsu-lee-eslint': plugin },
    rules: { 'sonsu-lee-eslint/no-ignored-rejection': 'error' },
  },
];
```

## Rules

| Rule | Reports |
| --- | --- |
| [`sonsu-lee-eslint/no-ignored-rejection`](docs/rules/no-ignored-rejection.md) | Empty rejection handlers and discarded `undefined` or `null` fallbacks. |
