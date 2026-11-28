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
      // Leave unused-directive reporting off in the two-linter setup. Use `oxlint-disable` for
      // Oxlint-only rules: ESLint still reports an unknown rule ID in an `eslint-disable`.
      linterOptions: { reportUnusedDisableDirectives: 'off' },
      plugins: { 'sonsu-lee-eslint': plugin },
      rules: { 'sonsu-lee-eslint/no-ignored-rejection': 'error' },
    },
    ...userConfigs,
  ];
}
