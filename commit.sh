#!/bin/bash

BRANCH="bachata-updates_8"
REMOTE="origin"
COMMIT_MSG="Automated commit"

# Checkout existing branch or create new one
git checkout "$BRANCH" 2>/dev/null || git checkout -b "$BRANCH"

git add --all
git commit --no-verify -m "$COMMIT_MSG"
git push "$REMOTE" "$BRANCH" --force-with-lease

# For merging BRANCH with the main
# git status
# git checkout main
# git pull origin main
# git merge bce84-multilanguage-xxx
# git push origin main