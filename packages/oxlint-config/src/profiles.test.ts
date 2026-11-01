import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { preset, type Options } from './preset.ts';

const oxlintBin = join(
  dirname(createRequire(import.meta.url).resolve('oxlint/package.json')),
  'bin',
  'oxlint',
);

const testFile = [
  "import { expect, it } from 'vitest';",
  '',
  "it('adds', () => {",
  '  expect(1 + 1).toBe(2);',
  '});',
  "it.only('subtracts', () => {",
  '  expect(2 - 1).toBe(1);',
  '});',
  '',
].join('\n');

// Each file breaks rules that a single profile enables. base.js breaks a base rule,
// helpers.ts has the same code as math.test.ts but is not a test file, and app.module.ts is a
// Nest module that the nestjs profile allows.
const fixtures: Record<string, string> = {
  'src/base.js': 'export const list = new Array(3);\n',
  'src/types.ts': "export const label: String = 'label';\n",
  'src/app.module.ts': [
    'declare function Module(metadata: object): ClassDecorator;',
    '',
    '@Module({})',
    'export class AppModule {}',
    '',
  ].join('\n'),
  'src/component.tsx': [
    "import { useState } from 'react';",
    '',
    'export function Counter({ visible }: { visible: boolean }) {',
    '  if (visible) {',
    '    const [count] = useState(0);',
    '    return (',
    '      <a href="https://example.com" target="_blank">',
    '        {count}',
    '      </a>',
    '    );',
    '  }',
    '  return null;',
    '}',
    '',
  ].join('\n'),
  'src/math.test.ts': testFile,
  'src/helpers.ts': testFile,
  'src/exports.js': 'exports = {};\n',
  'src/process.js': 'process = {};\n',
  'src/window.js': 'window = {};\n',
};

let projectDir: string;

beforeAll(() => {
  projectDir = mkdtempSync(join(tmpdir(), 'oxlint-config-'));
  for (const [path, content] of Object.entries(fixtures)) {
    mkdirSync(dirname(join(projectDir, path)), { recursive: true });
    writeFileSync(join(projectDir, path), content);
  }
});

afterAll(() => {
  rmSync(projectDir, { recursive: true, force: true });
});

// Writes the preset as the fixture project's config and returns what Oxlint prints.
function runOxlint(options: Options, args: string[]): string {
  writeFileSync(
    join(projectDir, 'oxlint.config.ts'),
    `export default ${JSON.stringify(preset(options))};\n`,
  );
  return spawnSync(process.execPath, [oxlintBin, ...args], { cwd: projectDir, encoding: 'utf8' })
    .stdout;
}

// Returns each diagnostic as "<file> <code>", sorted.
function lint(options: Options): string[] {
  const report = JSON.parse(runOxlint(options, ['--format', 'json', 'src'])) as {
    diagnostics: { filename: string; code: string }[];
  };
  return report.diagnostics.map(({ filename, code }) => `${filename} ${code}`).toSorted();
}

// Each option and the full, sorted list of diagnostics it gives on the fixtures. Type-aware rules
// need a TypeScript project and oxlint-tsgolint, so they are off here.
const cases: { options: Options; expected: string[] }[] = [
  { options: { typescript: false }, expected: ['src/base.js unicorn(no-new-array)'] },
  {
    options: { typeAware: false },
    expected: [
      'src/app.module.ts typescript(no-extraneous-class)',
      'src/base.js unicorn(no-new-array)',
      'src/types.ts typescript(no-wrapper-object-types)',
    ],
  },
  {
    options: { typescript: false, react: true },
    expected: [
      'src/base.js unicorn(no-new-array)',
      'src/component.tsx react(jsx-no-target-blank)',
      'src/component.tsx react-hooks(rules-of-hooks)',
    ],
  },
  {
    options: { typescript: false, vitest: true },
    expected: ['src/base.js unicorn(no-new-array)', 'src/math.test.ts vitest(no-focused-tests)'],
  },
  {
    options: { typescript: false, node: true },
    expected: [
      'src/base.js unicorn(no-new-array)',
      'src/exports.js node(no-exports-assign)',
      'src/process.js eslint(no-global-assign)',
    ],
  },
  {
    options: { typescript: false, browser: true },
    expected: ['src/base.js unicorn(no-new-array)', 'src/window.js eslint(no-global-assign)'],
  },
  {
    options: { typeAware: false, nestjs: true },
    expected: [
      'src/base.js unicorn(no-new-array)',
      'src/exports.js node(no-exports-assign)',
      'src/process.js eslint(no-global-assign)',
      'src/types.ts typescript(no-wrapper-object-types)',
    ],
  },
];

describe('preset profiles', () => {
  it.each(cases)('reports what $options enables', ({ options, expected }) => {
    expect(lint(options)).toEqual(expected);
  });
});
