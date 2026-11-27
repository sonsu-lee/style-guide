import type { OxlintConfig } from 'oxlint';

// base's categories decide which react and react-hooks rules run, except these.
export const react: OxlintConfig = {
  plugins: ['react'],
  rules: {
    // Overlaps with `react/rules-of-hooks`; upstream react-hooks ships it disabled for that reason.
    'react/hooks': 'off',
    // eslint-plugin-react-hooks ships these as warnings in its recommended config.
    'react/exhaustive-deps': 'warn',
    'react/incompatible-library': 'warn',
    // Disabled upstream: the recommended rules already report missing dependencies and
    // synchronous setState in an Effect.
    'react/exhaustive-effect-dependencies': 'off',
    'react/memo-dependencies': 'off',
    'react/no-deriving-state-in-effects': 'off',
    // The JSX transform that React 17 introduced does not need React in scope.
    'react/react-in-jsx-scope': 'off',
    // Type-aware. React handlers such as `onClick={() => setCount(count + 1)}` return the setter's
    // `void` from a concise arrow function.
    'typescript/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
  },
};
