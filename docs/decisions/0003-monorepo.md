# 0003: Keep all packages in one pnpm workspace repository

- Status: accepted
- Date: 2026-10-31
- Supersedes: an earlier plan to keep each package in its own repository (not recorded as an ADR)

## Context and problem statement

The first plan was one repository per package, following `antfu/eslint-plugin-antfu` and `antfu/eslint-config`. Users install npm packages, so the repository layout does not change how they use the packages; the choice is about maintenance cost.

While building the first scaffold, these facts appeared:

- `oxlint-config` depends on `oxlint-plugin`. With separate repositories, the plugin must be published before the config can use it, and local development needs `pnpm link`, which cannot be committed.
- A preset can reference `jsPlugins` only by package name, so the config cannot be tested locally against the plugin's source without linking.
- `oxlint` and `@oxlint/plugins` must be upgraded together in every package.
- A formatter config is planned, and lint and format have a boundary rule (lint does not enforce what oxfmt does) that is best verified in one place.

## Considered options

1. One repository per package
2. One pnpm workspace repository with `packages/*`
3. A parent repository with each package as a Git submodule

## Decision outcome

Option 2, in the repository `sonsu-lee/style-guide`.

- Packages depend on each other with `workspace:^`; pnpm rewrites it to a version range on publish.
- Shared tool versions live in the workspace catalog.
- All packages share one version number. Switch to per-package versioning (for example changesets) if a package needs its own release cadence.
- The repository name covers lint, formatter, and future TypeScript configs; `@vercel/style-guide` used the same name for the same scope.

### Consequences

- Good: a rule and the preset that enables it change in one commit and are tested together.
- Good: one place to upgrade Oxlint.
- Bad: stars, issues, and README pages are shared instead of per package. npm pages remain per package.

Submodules were rejected: they add commit-pointer updates and `--recurse-submodules` clones without solving the dependency problem.

## More information

- typescript-eslint and eslint-stylistic are pnpm monorepos. `antfu/eslint-config` was a six-package monorepo until 2023-09-21, when it moved the plugin to its own repository during the flat config rewrite.
