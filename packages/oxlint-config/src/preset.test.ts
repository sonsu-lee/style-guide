import { describe, expect, it } from 'vitest';

import { preset } from './preset.ts';

describe('preset', () => {
  it('keeps the default ignores when the user adds more', () => {
    const config = preset({ ignores: ['gen/**'] }, { ignorePatterns: ['tmp/**'] });

    expect(config.ignorePatterns).toEqual(['**/dist/**', '**/coverage/**', 'gen/**', 'tmp/**']);
  });

  it('places user extends after the preset configs so they take precedence', () => {
    const userBase = { rules: { 'no-console': 'error' as const } };
    const config = preset({}, { extends: [userBase] });

    expect(config.extends?.at(-1)).toBe(userBase);
  });

  it('keeps root rules from the user', () => {
    const config = preset({}, { rules: { 'no-console': 'off' } });

    expect(config.rules).toEqual({ 'no-console': 'off' });
  });

  it('enables type-aware linting only when requested, and lets the user override it', () => {
    expect(preset().options?.typeAware).toBe(false);
    expect(preset({ typeAware: true }).options?.typeAware).toBe(true);
    expect(preset({ typeAware: true }, { options: { typeAware: false } }).options?.typeAware).toBe(
      false,
    );
  });
});
