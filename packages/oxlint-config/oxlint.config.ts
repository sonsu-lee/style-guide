import { defineConfig } from 'oxlint';

import { preset } from './src/index.ts';

// Lint this package with its own preset.
export default defineConfig(preset({ node: true, vitest: true }));
