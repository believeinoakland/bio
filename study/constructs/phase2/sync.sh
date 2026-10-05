#!/bin/sh
# Copy the second study's working files (not src/) into the branch worktree; commit and push if anything changed.
# Usage: sh sync.sh <phase2 working folder> <git worktree of study/constructs>
S=${1:?phase2 folder}; W=${2:?worktree}; D="$W/study/constructs/phase2"
mkdir -p "$D"; python3 "$S/status.py" >/dev/null 2>&1
for f in "$S"/*.md "$S"/*.py "$S"/*.sh "$S"/units.json; do [ -f "$f" ] && cp "$f" "$D/"; done
for d in prompts notes digest studies reviews synthesis; do [ -d "$S/$d" ] && mkdir -p "$D/$d" && cp -R "$S/$d/." "$D/$d/"; done
rm -f "$D/make-src2.sh"
cd "$W" || exit 1; git add -A study/constructs/phase2
git diff --cached --quiet && exit 0
git commit -q -m "study/constructs/phase2: checkpoint $(date -u +%H:%MZ), $(grep -c '| done |' study/constructs/phase2/STATE.md) units done

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XqHWUury8tr5g7P4ydCUGx"
for i in 1 2 3 4; do git push -q origin study/constructs && exit 0; sleep $((i*2)); done; echo "push failed" >&2; exit 1
