export interface Finding {
  file: string;
  line: number;
  severity: 'error' | 'warning';
  code: string;
}

export function parseMarkers(file: string, source: string): Finding[] {
  const findings: Finding[] = [];
  const lines = source.split('\n');
  let nextCode = 0;
  for (const [index, line] of lines.entries()) {
    const match = /^\s*(?:\/\/|\{\/\*)\s*expect:\s+(error|warning)\s+(\S+)/u.exec(line);
    if (!match) continue;
    // 1. Stacked markers and intervening comments refer to the same code line.
    nextCode = Math.max(nextCode, index + 1);
    while (nextCode < lines.length && /^\s*(?:$|\/\/|\/\*|\*|\{\/\*)/u.test(lines[nextCode]))
      nextCode++;
    if (nextCode === lines.length)
      throw new Error(`expect marker without a following code line: ${file}:${index + 1}`);
    // 2. Report one-based line numbers, like the linters.
    findings.push({
      file,
      line: nextCode + 1,
      severity: match[1] as Finding['severity'],
      code: match[2],
    });
  }
  return findings;
}

export function formatFinding({ file, line, severity, code }: Finding): string {
  return `${file}:${line} ${severity} ${code}`;
}
