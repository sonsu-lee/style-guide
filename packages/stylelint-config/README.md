# @sonsu-lee/stylelint-config

Shared Stylelint config for CSS, CSS Modules, and Tailwind CSS v4. Use oxfmt for formatting.

## Install

```sh
pnpm add -D stylelint @sonsu-lee/stylelint-config
```

In `stylelint.config.mjs`:

```js
export default { extends: ['@sonsu-lee/stylelint-config'] };
```

Run `pnpm exec stylelint '**/*.css'`.

## What it catches

- The browser ignores `colr: red` and `padding: 10pixels`. Stylelint reports the unknown property and unit.
- A later `margin: 0` resets an earlier `margin-top: 8px` in the same block. Stylelint reports the shorthand override.
- A misspelled `@tailwnd` is reported, while Tailwind CSS v4 directives such as `@theme` and `@apply` are allowed. CSS Modules syntax such as `:global` and `composes` is allowed only in `*.module.css`.

The preset extends `stylelint-config-recommended`. It does not configure property ordering or support SCSS.
