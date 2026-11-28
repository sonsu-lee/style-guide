import { defineConfig } from 'oxlint';

// Lint this package with its own unpublished rules. Register new rules in `rules`.
export default defineConfig({
  jsPlugins: [{ name: 'sonsu-lee', specifier: './src/index.ts' }],
  rules: {
    'sonsu-lee/no-double-assertion': 'error',
    'sonsu-lee/prefer-named-conditions': 'warn',
    'sonsu-lee/require-effect-reason': 'error',
    'sonsu-lee/no-machine-context-mutation': 'error',
    'sonsu-lee/no-machine-in-render': 'error',
    'sonsu-lee/no-unstable-actor-selector': 'warn',
    'sonsu-lee/prefer-machine-setup': 'warn',
    'sonsu-lee/require-invoke-on-error': 'warn',
  },
  ignorePatterns: ['dist'],
});
