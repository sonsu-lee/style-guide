import type { OxlintConfig } from 'oxlint';

export const typeAware: OxlintConfig = {
  plugins: ['typescript'],
  rules: {
    // `pedantic` turns this on with defaults that allow numbers in conditions. Numbers are not
    // allowed here because `0` is a real value that is easy to treat as missing, and React renders
    // `{count && <List />}` as `0`. Strings stay allowed: `""` is their only falsy value, and an
    // empty string usually means missing. Nullable booleans are allowed as in antfu/eslint-config.
    'typescript/strict-boolean-expressions': [
      'error',
      { allowNumber: false, allowNullableBoolean: true },
    ],
    // Reports every parameter whose type is not deeply readonly, including ordinary option objects,
    // library types, and NestJS constructor injection. typescript-eslint keeps it out of every
    // shared config except `all`.
    'typescript/prefer-readonly-parameter-types': 'off',
    // The typescript plugin has type-aware versions of these core rules, and both report the same
    // code. tsgolint also lints JavaScript files outside the tsconfig, so they are off everywhere.
    // typescript-eslint's `recommended-type-checked` turns them off too.
    'no-implied-eval': 'off',
    'prefer-promise-reject-errors': 'off',
    'require-await': 'off',
    // strict-boolean-expressions above already reports `if (items.length)`.
    'unicorn/explicit-length-check': 'off',
    // Type-aware rules outside the categories above, chosen one by one.
    // In typescript-eslint `strict-type-checked`: catch callbacks get `unknown`, as `catch` blocks do.
    'typescript/use-unknown-in-catch-callback-variable': 'error',
    // In typescript-eslint `stylistic-type-checked`: use the API that states the intent.
    // `prefer-find` is left out because `unicorn/prefer-array-find` already reports the same code.
    'typescript/prefer-optional-chain': 'error',
    'typescript/prefer-string-starts-ends-with': 'error',
  },
};
