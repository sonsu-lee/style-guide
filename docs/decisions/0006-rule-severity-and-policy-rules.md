# 0006: Grade rules by the action a diagnostic requires

- Status: Accepted
- Date: 2026-11-27

## Context and problem statement

Oxlint's categories select rules but do not tell a consumer whether every finding requires a change. Treating a review suggestion as an error makes lint fail even when keeping the original code is the better choice.

## Considered options

1. Keep every enabled rule at error.
2. Distinguish errors, warnings, and guidance that a linter cannot check.
3. Replace the category defaults by choosing every rule individually.

## Decision outcome

Use errors for violations the code establishes and consumers should always fix. Use warnings when there is a concrete reason to review a finding but the suggested change is not always better. Shared commands do not pass `--max-warnings 0`.

Use the framework's official severity in framework profiles. Explain exceptions beside the rule. Enable rules outside the categories individually, with the reason beside each rule. Keep design guidance that syntax cannot establish outside this repository.

## Consequences

A run with only warnings succeeds. Every rule change needs a consumer scenario in `packages/scenarios` that distinguishes reported code from allowed code. [ADR 0005](0005-profile-rule-sources.md) still applies to rules not addressed here.

## More information

[Issue #23](https://github.com/sonsu-lee/style-guide/issues/23)
