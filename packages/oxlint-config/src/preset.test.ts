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

  it('keeps root plugins from the user', () => {
    const config = preset({}, { plugins: ['jsdoc'] });

    expect(config.plugins).toEqual(['jsdoc']);
  });

  it('merges env by key over the profile environments, and user values win', () => {
    const config = preset({ node: true, browser: true }, { env: { browser: false, jest: true } });

    expect(config.env).toEqual({ node: true, browser: false, jest: true });
  });

  it('enables type-aware linting unless TypeScript or type-aware linting is turned off', () => {
    expect(preset().options?.typeAware).toBe(true);
    expect(preset({ typescript: false }).options?.typeAware).toBe(false);
    expect(preset({ typeAware: false }).options?.typeAware).toBe(false);
    expect(preset({}, { options: { typeAware: false } }).options?.typeAware).toBe(false);
  });

  it('applies the same profiles when userConfig sets typeAware as when options do', () => {
    // The typeAware profile turns off core rules that tsgolint replaces, so it must follow the
    // value that decides whether tsgolint runs.
    expect(preset({}, { options: { typeAware: false } })).toEqual(preset({ typeAware: false }));
    expect(preset({ typeAware: false }, { options: { typeAware: true } })).toEqual(
      preset({ typeAware: true }),
    );
  });

  it('rejects turning off a profile that another option needs', () => {
    expect(() => preset({ typeAware: true, typescript: false })).toThrow(/typescript/u);
    expect(() => preset({ nestjs: true, typescript: false })).toThrow(/typescript/u);
    expect(() => preset({ nestjs: true, node: false })).toThrow(/node/u);
  });
});
