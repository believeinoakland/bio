#!/bin/sh
# Copy the study's working files into the branch worktree, commit and push if anything changed.
# Usage: sh sync.sh <study working folder> <git worktree of study/constructs>
S=${1:?study folder}; W=${2:?worktree}; D="$W/study/constructs"
mkdir -p "$D" "$D/prior"
python3 "$S/status.py" >/dev/null 2>&1
for f in RESUME.md STATE.md constructs-brief.md READING-PROTOCOL.md READING-PROTOCOL-MODULES.md ANALYSIS-PROTOCOL.md REVIEW-PROTOCOL.md SYNTHESIS-PROTOCOL.md U41.md NEXT-BOB-PROMPT.md make-src.sh status.py build-digests.py sync.sh units.json; do
  [ -f "$S/$f" ] && cp "$S/$f" "$D/$f"
done
for d in prompts notes digest studies reviews synthesis; do
  [ -d "$S/$d" ] && mkdir -p "$D/$d" && cp -R "$S/$d/." "$D/$d/"
done
for f in u41-area1-2.md u41-area3-4.md u41-area5-6.md capabilities.html; do [ -f "$S/$f" ] && cp "$S/$f" "$D/prior/$f"; done
cd "$W" || exit 1
git add -A study/constructs
if git diff --cached --quiet; then exit 0; fi
git commit -q -m "study/constructs: checkpoint $(date -u +%H:%MZ) — $(grep -c '| done |' study/constructs/STATE.md) units done

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011hHu2q95wRxsT1o7P9BR46"
for i in 1 2 3 4; do git push -q -u origin study/constructs && exit 0; sleep $((i*2)); done
echo "push failed" >&2; exit 1
