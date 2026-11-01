import type { OxlintConfig } from 'oxlint';

import { base } from './configs/base.ts';
import { nestjs } from './configs/nestjs.ts';
import { node } from './configs/node.ts';
import { react } from './configs/react.ts';
import { typeAware } from './configs/type-aware.ts';
import { typescript } from './configs/typescript.ts';
import { vitest } from './configs/vitest.ts';
import { defaultIgnores } from './ignores.ts';

export interface Options {
  /** Paths to ignore in addition to the defaults. */
  ignores?: string[];
  /** TypeScript rules. Default `true`. */
  typescript?: boolean;
  /**
   * Rules that need type information; needs `oxlint-tsgolint` and `typescript`. Only the root config
   * can enable this, so the preset sets it. Defaults to the value of `typescript`.
   */
  typeAware?: boolean;
  /** Node.js globals and rules. */
  node?: boolean;
  /** Browser globals. */
  browser?: boolean;
  /** React and React Hooks rules. */
  react?: boolean;
  /** Vitest rules for test files. */
  vitest?: boolean;
  /** Adjusts the TypeScript rules for NestJS. Needs `typescript` and turns on `node`. */
  nestjs?: boolean;
}

// Resolves which profiles are on. TypeScript with type-aware rules is the default; `typescript:
// false` turns both off. typeAware and nestjs need typescript, and nestjs turns on node, so an
// explicit `false` for one of those is a mistake.
function selectProfiles(options: Options): Required<Omit<Options, 'ignores'>> {
  const isTypeScript = options.typescript ?? true;
  const selected = {
    typescript: isTypeScript,
    typeAware: options.typeAware ?? isTypeScript,
    node: options.node ?? options.nestjs ?? false,
    browser: options.browser ?? false,
    react: options.react ?? false,
    vitest: options.vitest ?? false,
    nestjs: options.nestjs ?? false,
  };
  if (!selected.typescript && (selected.typeAware || selected.nestjs)) {
    throw new Error('typeAware and nestjs need the typescript profile, but typescript is false.');
  }
  if (!selected.node && selected.nestjs) {
    throw new Error('nestjs needs the node profile, but node is false.');
  }
  return selected;
}

/**
 * Returns a complete root config.
 * Oxlint's `extends` does not inherit ignorePatterns, env, globals, or settings,
 * so they are set here instead of in configs/. Do not put the result inside another config's `extends`.
 */
export function preset(options: Options = {}, userConfig: OxlintConfig = {}): OxlintConfig {
  // 1. Resolve the profiles. A user `options.typeAware` decides whether tsgolint runs, so the
  //    typeAware profile, which replaces core rules with type-aware ones, follows it too.
  const selected = selectProfiles(options);
  const isTypeAware = userConfig.options?.typeAware ?? selected.typeAware;

  // 2. Combine the inherited configs. Later configs win, so a framework profile comes after the
  //    language and runtime profiles it adjusts, and user extends go last so they take precedence.
  const profiles: [boolean, OxlintConfig][] = [
    [selected.typescript, typescript],
    [isTypeAware, typeAware],
    [selected.node, node],
    [selected.react, react],
    [selected.vitest, vitest],
    [selected.nestjs, nestjs],
  ];
  const extendsConfigs: OxlintConfig[] = [
    base,
    ...profiles.filter(([isSelected]) => isSelected).map(([, config]) => config),
    ...(userConfig.extends ?? []),
  ];

  // 3. Layer user values over the defaults for fields that are not inherited. User values win.
  return {
    ...userConfig,
    // An empty root list removes Oxlint's default plugins; each config in `extends` adds its own.
    plugins: userConfig.plugins ?? [],
    extends: extendsConfigs,
    env: {
      ...(selected.node ? { node: true } : {}),
      ...(selected.browser ? { browser: true } : {}),
      ...userConfig.env,
    },
    ignorePatterns: [
      ...defaultIgnores,
      ...(options.ignores ?? []),
      ...(userConfig.ignorePatterns ?? []),
    ],
    options: { ...userConfig.options, typeAware: isTypeAware },
  };
}
