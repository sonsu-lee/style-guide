import type { OxlintConfig } from "oxlint";
import { base } from "./configs/base.ts";
import { defaultIgnores } from "./ignores.ts";

export interface Options {
  /** Paths to ignore in addition to the defaults. */
  ignores?: string[];
  /** Enable rules that need type information. Only the root config can enable this, so the preset sets it. */
  typeAware?: boolean;
}

/**
 * Returns a complete root config.
 * Oxlint's `extends` does not inherit ignorePatterns, env, globals, or settings,
 * so they are set here instead of in configs/. Do not put the result inside another config's `extends`.
 */
export function preset(options: Options = {}, userConfig: OxlintConfig = {}): OxlintConfig {
  // 1. Combine the inherited configs; user extends go last so they take precedence.
  const extendsConfigs: OxlintConfig[] = [base, ...(userConfig.extends ?? [])];

  // 2. Layer user values over the defaults for fields that are not inherited. User values win.
  return {
    ...userConfig,
    extends: extendsConfigs,
    ignorePatterns: [...defaultIgnores, ...(options.ignores ?? []), ...(userConfig.ignorePatterns ?? [])],
    options: { typeAware: options.typeAware ?? false, ...userConfig.options },
  };
}
