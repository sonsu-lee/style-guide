import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import type { Finding } from './markers.ts';

const oxlintBin = join(
  dirname(createRequire(import.meta.url).resolve('oxlint/package.json')),
  'bin',
  'oxlint',
);
interface Diagnostic {
  filename: string;
  code: string;
  severity: Finding['severity'];
  labels: { span: { line: number } }[];
}
export function runOxlint(appDir: string): { findings: Finding[]; status: number } {
  const { stdout, stderr, status, error } = spawnSync(
    process.execPath,
    [oxlintBin, '--format', 'json', 'src'],
    { cwd: appDir, encoding: 'utf8' },
  );
  if (error) throw error;
  let report: { diagnostics: Diagnostic[] };
  try {
    report = JSON.parse(stdout);
  } catch (cause) {
    throw new Error(`oxlint did not print JSON in ${appDir}:\n${stdout}${stderr}`, { cause });
  }
  if (status === null) throw new Error(`oxlint terminated in ${appDir}: ${stderr}`);
  return {
    status,
    findings: report.diagnostics.map(({ filename: file, code, severity, labels }) => ({
      file,
      code,
      severity,
      line: labels[0].span.line,
    })),
  };
}
