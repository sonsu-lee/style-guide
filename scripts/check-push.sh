#!/bin/sh
# Pre-push check run by prek. prek passes the pushed ref in environment
# variables instead of Git's stdin, and runs hooks only once per push, for the
# first ref with new commits. A push that only renames already pushed commits,
# and refs after the first, are not checked here.
failed=0

# 1. Check the branch name on the remote, which differs from the local name in
#    pushes such as `git push origin HEAD:feat/x`. Tags have no branch name.
case "$PRE_COMMIT_REMOTE_BRANCH" in
  refs/heads/*)
    sh scripts/check-branch-name.sh "${PRE_COMMIT_REMOTE_BRANCH#refs/heads/}" || failed=1
    ;;
esac

# 2. Commits on a remote-tracking branch were already published; check the
#    rest, oldest first.
for commit in $(git rev-list --reverse "$PRE_COMMIT_TO_REF" --not --remotes); do
  if ! git log -1 --format=%B "$commit" | pnpm exec commitlint; then
    echo "Commit $(git rev-parse --short "$commit") does not follow Conventional Commits." >&2
    failed=1
  fi
done

exit "$failed"
