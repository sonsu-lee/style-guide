import plugin from '@sonsu-lee/eslint-plugin';
import * as parser from '@typescript-eslint/parser';
import type { Linter } from 'eslint';

export function preset(...userConfigs: Linter.Config[]): Linter.Config[] {
  return [
    { name: 'sonsu-lee/ignores', ignores: ['**/dist/**', '**/coverage/**'] },
    {
      name: 'sonsu-lee/typed',
      files: ['**/*.{ts,tsx,mts,cts}'],
      languageOptions: { parser, parserOptions: { projectService: true } },
      // ESLint sees `eslint-disable` comments for Oxlint rules as unused.
      linterOptions: { reportUnusedDisableDirectives: 'off' },
      plugins: { 'sonsu-lee-eslint': plugin },
      rules: { 'sonsu-lee-eslint/no-ignored-rejection': 'error' },
    },
    ...userConfigs,
  ];
}
