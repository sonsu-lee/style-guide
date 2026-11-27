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
- A misspelled `@tailwnd` is reported, while Tailwind CSS v4 directives such as `@theme` and `@apply` are allowed. Functional utilities can use `--value()` in declarations because Stylelint's declaration-value rule skips `@utility` blocks; Tailwind handles those values.

## CSS Modules

The preset allows `:global`, `:local`, `composes`, and `@value` declarations only in `*.module.css`. Stylelint does not substitute local or imported `@value` tokens when it validates CSS declarations. For example, `@value accent: #246` is allowed, but `color: accent` is reported by `declaration-property-value-no-unknown`. The rule stays on so it can still catch typos in CSS values.

The preset extends `stylelint-config-recommended`. It does not configure property ordering or support SCSS.
