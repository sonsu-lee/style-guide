# Contributing

## Setup

```sh
pnpm install
```

Toolchain versions are pinned in the repository:

| Where | What | Read by |
| --- | --- | --- |
| `.node-version` | Node.js major version (`24`) | fnm, mise (after `mise settings add idiomatic_version_file_enable_tools node`), `actions/setup-node`. nvm does not read it |
| `package.json` `packageManager` | Exact pnpm version | pnpm, Corepack, mise, nodeup |
| `package.json` `devEngines.runtime` | Node.js range (`^24.22.2`, `onFail: "download"`) | pnpm downloads that Node.js and uses it for `pnpm run` scripts. A bare `node` in your shell still comes from your version manager unless you run `pnpm shim add node` |

| Command             | What it does                                           |
| ------------------- | ------------------------------------------------------ |
| `pnpm test`         | Unit tests in every package                            |
| `pnpm typecheck`    | `tsc` in every package                                 |
| `pnpm lint`         | Each package lints itself with its own preset or rules |
| `pnpm format`       | Formats every file in the repository with oxfmt        |
| `pnpm format:check` | Fails if `pnpm format` would change any file           |
| `pnpm build`        | Builds every package with tsdown                       |

## Adding a rule

Follow the decision flow in [ARCHITECTURE.md](ARCHITECTURE.md#where-a-new-rule-goes) first. Write a custom rule only when no built-in or existing plugin rule covers it.

1. `packages/oxlint-plugin/docs/rules/<rule-id>.md`: describe the code the rule reports and the code it allows.
2. `packages/oxlint-plugin/src/rules/<rule-id>.ts`: implement the rule with `createOnce`.
   - Reset per-file state in `before()`. `before()` is not guaranteed to run for every file, so code that must always run goes in a `Program` visitor.
   - Use the `Rule` and `ESTree` types from `@oxlint/plugins`.
3. `packages/oxlint-plugin/src/rules/<rule-id>.test.ts`: turn the documented examples into `RuleTester` cases from `oxlint/plugins-dev`.
4. Register the rule in `src/index.ts` and in the package's `oxlint.config.ts`.

Rule guidelines:

- Document what the rule cannot see, for example "resolves only aliases in the same file".
- Add an autofix only when the fixed code is guaranteed to behave the same.
- Number the steps in comments when the order of logic matters. Write comments in English.

## Naming

| Target | Format | Example |
| --- | --- | --- |
| Rule ID | kebab-case; `no-` for bans, `require-` or `prefer-` for requirements | `no-double-assertion` |
| Rule export | camelCase of the rule ID | `noDoubleAssertion` |
| messageId | camelCase noun for the problem | `doubleAssertion` |
| Profile config file | `src/configs/<profile>.ts`, kebab-case | `type-aware.ts` |
| Preset option | camelCase of the profile, boolean | `typeAware: true` |

| Term | Meaning | Avoid |
| --- | --- | --- |
| `node` | The AST node being visited | `n`, `astNode` |
| `context` | Rule context | `ctx` |
| `check` | Visitor shared by several node types | `handle`, `visit` |
| `isXxx` | Boolean check or type guard | `checkXxx` |
| `xxxCount` | A count | `numXxx` |
| `current` | Node followed in a loop | `cur`, `tmp` |
| `config` | Linter config object | `cfg`, `conf` |
| `options` | First argument of `preset` | `opts` |
| `userConfig` | Second argument of `preset` | `overrides` (clashes with the Oxlint field) |

Add a term to this table before using a new one.

## Verification

| Target | How |
| --- | --- |
| Rules | `RuleTester` valid and invalid cases |
| `preset` merging | Each row of the merge table in ARCHITECTURE.md has a test |
| Published files | Install the `pnpm pack` tarballs in a scratch project and run Oxlint, including a project that installs only the preset |
| Upstream constraints | Re-run the checks in [docs/reference/oxlint-constraints.md](docs/reference/oxlint-constraints.md) when upgrading Oxlint |

## Decisions

Record a decision that is hard to reverse as a new file in [docs/decisions](docs/decisions). Do not rewrite an accepted decision; add a new one and mark the old one as superseded.
