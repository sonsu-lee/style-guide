import type { OxlintConfig } from 'oxlint';

// base's categories decide which typescript rules run, except these.
export const typescript: OxlintConfig = {
  plugins: ['typescript'],
  rules: {
    // Deprecated; `no-wrapper-object-types` and `no-unsafe-function-type` report the same code.
    'typescript/ban-types': 'off',
  },
};
