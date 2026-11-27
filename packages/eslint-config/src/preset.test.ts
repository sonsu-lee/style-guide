import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

import { preset } from './preset.ts';

const rule = 'sonsu-lee-eslint/no-ignored-rejection';

describe('preset', () => {
  it('enables the rejection rule for TypeScript only', async () => {
    const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: preset() });

    const typescript: unknown = await eslint.calculateConfigForFile('src/order.ts');
    const javascript: unknown = await eslint.calculateConfigForFile('src/order.js');
    expect(typescript).toMatchObject({ rules: { [rule]: [2] } });
    expect(javascript).not.toHaveProperty(['rules', rule]);
  });

  it('lets later user configs override its rules', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: preset({ rules: { [rule]: 'warn' } }),
    });

    const typescript: unknown = await eslint.calculateConfigForFile('src/order.ts');
    expect(typescript).toMatchObject({ rules: { [rule]: [1] } });
  });

  it('ignores build and coverage output at any depth', async () => {
    const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: preset() });

    await expect(eslint.isPathIgnored('packages/orders/dist/order.ts')).resolves.toBe(true);
    await expect(eslint.isPathIgnored('packages/orders/coverage/order.ts')).resolves.toBe(true);
    await expect(eslint.isPathIgnored('packages/orders/src/order.ts')).resolves.toBe(false);
  });
});
