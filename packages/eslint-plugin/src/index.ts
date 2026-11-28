import type { TSESLint } from '@typescript-eslint/utils';
import type { ESLint } from 'eslint';

import { noIgnoredRejection } from './rules/no-ignored-rejection.ts';

const typedPlugin: TSESLint.FlatConfig.Plugin = {
  meta: { name: '@sonsu-lee/eslint-plugin' },
  rules: { 'no-ignored-rejection': noIgnoredRejection },
};

// ESLint and typescript-eslint declare incompatible RuleContext types. The rule uses only
// sourceCode and report(), which both supported ESLint versions supply.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Bridge the two plugin declarations.
const plugin: ESLint.Plugin = typedPlugin as TSESLint.FlatConfig.Plugin & ESLint.Plugin;

export default plugin;
