import type { OxlintConfig } from 'oxlint';

// Built only when selected: the plugin is an optional peer dependency, and resolving it fails in
// projects that do not use TanStack Query.
export function tanstackQuery(): OxlintConfig {
  let specifier: string;
  try {
    // A file:// URL, for the reason given in base.ts.
    specifier = import.meta.resolve('@tanstack/eslint-plugin-query');
  } catch (error) {
    throw new Error('tanstackQuery needs @tanstack/eslint-plugin-query, but it is not installed.', {
      cause: error,
    });
  }
  return {
    plugins: [],
    jsPlugins: [{ name: '@tanstack/query', specifier }],
    rules: {
      // A query key that leaves out a value the query function reads makes different data share
      // one cache entry.
      '@tanstack/query/exhaustive-deps': 'error',
      // A client created during render replaces the cache on every render.
      '@tanstack/query/stable-query-client': 'error',
    },
  };
}
