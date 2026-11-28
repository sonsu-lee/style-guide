import type { OxlintConfig } from 'oxlint';

// Follows the `core-web-vitals` config of `@next/eslint-plugin-next`. base's categories make every
// nextjs rule an error; these are the rules that config ships as warnings.
export const nextjs: OxlintConfig = {
  plugins: ['nextjs'],
  rules: {
    'nextjs/google-font-display': 'warn',
    'nextjs/google-font-preconnect': 'warn',
    'nextjs/next-script-for-ga': 'warn',
    'nextjs/no-async-client-component': 'warn',
    'nextjs/no-before-interactive-script-outside-document': 'warn',
    'nextjs/no-css-tags': 'warn',
    'nextjs/no-head-element': 'warn',
    'nextjs/no-img-element': 'warn',
    'nextjs/no-page-custom-font': 'warn',
    'nextjs/no-styled-jsx-in-document': 'warn',
    'nextjs/no-title-in-document-head': 'warn',
    'nextjs/no-typos': 'warn',
    'nextjs/no-unwanted-polyfillio': 'warn',
    // `eslint-config-next` turns this off.
    'react/jsx-no-target-blank': 'off',
  },
};
