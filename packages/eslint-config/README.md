# @sonsu-lee/eslint-config

Run the `sonsu-lee-eslint` rules that need TypeScript types and cannot run in Oxlint. Keep `@sonsu-lee/oxlint-config` for the rest of your lint rules.

## Install

```sh
pnpm add -D eslint typescript@6 @sonsu-lee/eslint-config
```

Install TypeScript 6 rather than 7: the typescript-eslint parser does not support TypeScript 7. The preset uses the parser's project service to read types from the `tsconfig.json` that includes each linted file.

## Use

Create `eslint.config.mjs`:

```js
import { preset } from '@sonsu-lee/eslint-config';

export default preset();
```

Run `oxlint && eslint` so ESLint runs after Oxlint. The preset enables the typed ESLint rules only for `.ts`, `.tsx`, `.mts`, and `.cts` files and ignores `dist` and `coverage` directories. Pass project-specific ESLint config objects to `preset()` to apply them last.

Use `// oxlint-disable-next-line <rule> -- <reason>` for rules that run only in Oxlint. ESLint reports an unknown rule ID if you name an Oxlint-only rule in an `eslint-disable` comment, even though the preset turns off unused-disable reporting.
