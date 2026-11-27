import type { Config } from 'stylelint';

const tailwindAtRules = [
  'theme',
  'source',
  'utility',
  'variant',
  'custom-variant',
  'apply',
  'reference',
  'config',
  'plugin',
];

const config: Config = {
  extends: ['stylelint-config-recommended'],
  rules: {
    // The CSS prelude check rejects Tailwind utility names in @apply.
    'at-rule-prelude-no-invalid': [true, { ignoreAtRules: ['apply'] }],
    // Tailwind CSS v4 directives.
    'at-rule-no-unknown': [true, { ignoreAtRules: tailwindAtRules }],
  },
  overrides: [
    {
      // CSS Modules syntax.
      files: ['**/*.module.css'],
      rules: {
        'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global', 'local'] }],
        'property-no-unknown': [true, { ignoreProperties: ['composes'] }],
        'at-rule-no-unknown': [true, { ignoreAtRules: [...tailwindAtRules, 'value'] }],
      },
    },
  ],
};

export default config;
