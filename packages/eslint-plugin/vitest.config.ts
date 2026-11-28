import { defineConfig } from 'vitest/config';

export default defineConfig({
  // RuleTester registers tests through the test framework's globals.
  test: { globals: true },
});
