import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';

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

interface EslintResult {
  filePath: string;
  messages: { severity: 1 | 2; line: number; ruleId: string | null; message: string }[];
}

export function runEslint(appDir: string): Finding[] {
  if (!existsSync(join(appDir, 'eslint.config.mjs'))) return [];
  const eslintBin = join(
    dirname(createRequire(import.meta.url).resolve('eslint/package.json')),
    'bin',
    'eslint.js',
  );
  const { stdout, stderr, status, error } = spawnSync(
    process.execPath,
    [eslintBin, '--format', 'json', 'src'],
    { cwd: appDir, encoding: 'utf8' },
  );
  if (error) throw error;
  let results: EslintResult[];
  try {
    results = JSON.parse(stdout);
  } catch (cause) {
    throw new Error(`eslint did not print JSON in ${appDir}:\n${stdout}${stderr}`, { cause });
  }
  if (status !== 0 && status !== 1) throw new Error(`eslint failed in ${appDir}: ${stderr}`);
  return results.flatMap(({ filePath, messages }) =>
    messages.map(({ ruleId: code, line, severity, message }): Finding => {
      if (code === null) throw new Error(`${filePath}: ${message}`);
      let grade: Finding['severity'] = 'warning';
      if (severity === 2) grade = 'error';
      return { file: relative(appDir, filePath), line, severity: grade, code };
    }),
  );
}
