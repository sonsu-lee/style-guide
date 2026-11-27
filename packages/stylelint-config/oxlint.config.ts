import { preset } from '@sonsu-lee/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig(preset({ node: true, vitest: true }));
