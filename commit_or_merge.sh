#!/bin/bash

# Usage: ./git-helper.sh [commit|merge] [branch-name] [commit-message]
# Example: ./git-helper.sh commit bachata_paradox_30 "WIP: update translations"
# Example: ./git-helper.sh merge bachata_paradox_30 "Automated merge"

ACTION="$1"
BRANCH="${2:-bachata-updates_8}"
REMOTE="origin"
COMMIT_MSG="${3:-Automated commit}"

if [ "$ACTION" = "commit" ]; then
  # Commit and push to branch
  git checkout "$BRANCH" 2>/dev/null || git checkout -b "$BRANCH"
  git add --all
  git commit --no-verify -m "$COMMIT_MSG"
  git push "$REMOTE" "$BRANCH" --force-with-lease

elif [ "$ACTION" = "merge" ]; then
  # Merge to main and push
  git checkout main
  git pull "$REMOTE" main
  git merge "$BRANCH" -m "$COMMIT_MSG"
  git push "$REMOTE" main
  git checkout "$BRANCH"
else
  echo "Usage: $0 [commit|merge] [branch-name] [commit-message]"
  exit 1
fi