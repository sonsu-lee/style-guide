import { defineConfig } from 'oxfmt';

// Every option that affects files in this repository is set, defaults included,
// so upgrading oxfmt cannot change the output through a changed default.
export default defineConfig({
  // Differs from the oxfmt defaults.
  singleQuote: true,
  // Never hard-wrap Markdown prose; tables wider than printWidth stay compact instead of padded.
  proseWrap: 'never',
  sortImports: {
    groups: [
      'builtin',
      'external',
      ['internal', 'subpath'],
      ['parent', 'sibling', 'index'],
      'style',
      'unknown',
    ],
    newlinesBetween: true,
    order: 'asc',
    ignoreCase: true,
    internalPattern: ['~/', '@/', '#'],
    customGroups: [],
    partitionByNewline: false,
    partitionByComment: false,
    sortSideEffects: false,
  },

  // oxfmt 0.75.0 defaults.
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',
  insertFinalNewline: true,
  semi: true,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
  objectWrap: 'preserve',
  experimentalOperatorPosition: 'end',
  embeddedLanguageFormatting: 'auto',
  jsdoc: false,
  sortPackageJson: { sortScripts: false },
  sortTailwindcss: false,
});
