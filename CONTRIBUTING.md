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

## Commits and branches

`pnpm install` installs Git hooks with prek, configured in `.pre-commit-config.yaml`. Two of them check commits and branches:

| Hook | What it checks |
| --- | --- |
| `commit-msg` | The message of the commit being created |
| `pre-push` | The name of the remote branch the push creates or updates, and the message of every pushed commit that no remote-tracking branch contains yet |

prek runs `pre-push` once per push, for the first ref with new commits. It does not check a push that only gives already pushed commits a new branch name, or refs after the first in a multi-ref push.

Hooks can be skipped, so CI checks every pull request again in the `conventions` job of `.github/workflows/pull-request.yml`: the head branch name, every commit that the base branch does not have yet, and the title. Editing the title or the base branch re-runs the job. A squash merge uses the title as the commit subject and appends ` (#<number>)`, so the title must pass the commit message rules both on its own and with that suffix. With a two-digit pull request number, that leaves at most 66 characters for the title.

Commit messages follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) with the rules in `commitlint.config.js`:

- Type: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, or `test`.
- Scope: optional, lowercase.
- Subject: starts in lowercase and does not end with a period.
- Every header, body, and footer line is at most 72 characters. A blank line comes before the body and before the footer.
- Messages that Git writes itself, such as `Merge branch ...`, `Revert "..."`, and `fixup!`, are accepted.

Branch names follow [Conventional Branch 1.1.0](https://conventionalbranch.org/v1.1.0/), using only these types:

| Type      | Use for                                              |
| --------- | ---------------------------------------------------- |
| `feat`    | New features or enhancements                         |
| `bugfix`  | Bug fixes                                            |
| `hotfix`  | Urgent fixes                                         |
| `release` | Release preparation                                  |
| `chore`   | Maintenance: dependencies, docs, CI, and refactoring |

The description uses lowercase letters and digits joined by single hyphens or dots, for example `feat/issue-123-add-login-page`. `main`, `master`, and `develop` take no type. Do not use the spec's `feature` and `fix` types or AI agent types such as `claude`.

Check a message or name before committing or pushing:

| Command                                  | Checks                           |
| ---------------------------------------- | -------------------------------- |
| `pnpm exec commitlint --edit <file>`     | A commit message saved in a file |
| `sh scripts/check-branch-name.sh <name>` | A branch name                    |

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
