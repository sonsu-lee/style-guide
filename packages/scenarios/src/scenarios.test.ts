import { globSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import { runEslint, runOxlint } from './lint.ts';
import { formatFinding, parseMarkers } from './markers.ts';
const apps = join(import.meta.dirname, '../apps');
for (const app of readdirSync(apps, { withFileTypes: true })) {
  if (!app.isDirectory()) continue;
  it(`reports exactly the marked diagnostics for ${app.name}`, () => {
    const cwd = join(apps, app.name);
    const expected = globSync('src/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}', { cwd }).flatMap((file) =>
      parseMarkers(file, readFileSync(join(cwd, file), 'utf8')),
    );
    const actual = runOxlint(cwd);
    const findings = [...actual.findings, ...runEslint(cwd)];
    expect(findings.map(formatFinding).toSorted()).toEqual(expected.map(formatFinding).toSorted());
    expect(actual.status).toBe(
      Number(expected.some(({ severity, code }) => severity === 'error' && code.endsWith(')'))),
    );
  });
}
