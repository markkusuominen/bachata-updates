#!/bin/bash

BRANCH="bachata-updates_8"
REMOTE="origin"
COMMIT_MSG="Automated commit"

git checkout main
git pull origin main
git merge "$BRANCH"
git push origin main
git checkout "$BRANCH"

# For merging BRANCH with the main
# git status
# git checkout main
# git pull origin main
# git merge bce84-multilanguage-xxx
# git push origin main
# checkout back