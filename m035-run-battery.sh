#!/bin/sh
# M0-35 worker's own battery runner. Log goes inside THIS worktree (WORKER.md:
# a generic /tmp name is not yours). Writes a provenance line and the battery's
# OWN exit, never a wrapper's.
W=/Users/sparky/Downloads/ClaudeCodeBIO/.claude/worktrees/agent-af799694331ecc8d3
LOG="$W/$1"
cd "$W" || exit 9
echo "provenance: HEAD=$(git rev-parse HEAD) worktree=agent-af799694331ecc8d3 item=M0-35 label=$1 started=$(date -u +%FT%TZ)" > "$LOG"
cd "$W/bio-plane" || exit 9
npm run test:battery >> "$LOG" 2>&1
echo "BATTERY_OWN_EXIT=$?" >> "$LOG"
echo "finished=$(date -u +%FT%TZ)" >> "$LOG"
