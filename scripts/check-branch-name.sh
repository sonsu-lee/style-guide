#!/bin/sh
# Check a branch name against Conventional Branch 1.1.0, limited to the types
# this repository uses. The pattern is the spec.json regex with the type list
# narrowed and `(?:` written as `(`, because POSIX grep -E has no `(?:`.
# https://conventionalbranch.org/v1.1.0/spec.json
#
# Usage: sh scripts/check-branch-name.sh <branch-name>

if [ "$#" -ne 1 ]; then
  echo "Usage: sh scripts/check-branch-name.sh <branch-name>" >&2
  exit 2
fi

pattern='^(main|master|develop|(feat|bugfix|hotfix|release|chore)/[a-z0-9]+(\.[a-z0-9]+)*(-[a-z0-9]+(\.[a-z0-9]+)*)*)$'

if printf '%s\n' "$1" | grep -Eq "$pattern"; then
  exit 0
fi

cat >&2 <<EOF
Branch name '$1' does not follow Conventional Branch.
Use <type>/<description>, for example feat/issue-123-add-login-page.
  type: feat, bugfix, hotfix, release, or chore
  description: lowercase letters and digits, joined by single hyphens or dots
main, master, and develop take no type. See CONTRIBUTING.md.
EOF
exit 1
