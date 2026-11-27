import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import stylelint from 'stylelint';
import { expect, test } from 'vitest';

import config from './index.ts';

const fixtures = new URL('../fixtures/', import.meta.url);
const files = (await readdir(fixtures)).filter((file) => file.endsWith('.css'));

function expectedDiagnostics(source: string): string[] {
  return source.split('\n').flatMap((line, index) => {
    const marker = /^\s*\/\* expect: error ([\w-]+) \*\//u.exec(line);
    if (!marker) {
      return [];
    }
    return [`${index + 2} error ${marker[1]}`];
  });
}

test.each(files)('matches all expected CSS diagnostics in %s', async (file) => {
  const fixture = new URL(file, fixtures);
  const source = await readFile(fixture, 'utf8');

  const { results } = await stylelint.lint({ files: [fileURLToPath(fixture)], config });
  const actual = results.flatMap(({ warnings }) =>
    warnings.map(({ line, rule, severity }) => `${line} ${severity} ${rule}`),
  );

  expect(actual.toSorted()).toEqual(expectedDiagnostics(source).toSorted());
});
