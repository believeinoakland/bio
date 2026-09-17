#!/bin/sh
# M0-35 probe runner. Log inside THIS worktree, with provenance and the probe's OWN exit.
W=/Users/sparky/Downloads/ClaudeCodeBIO/.claude/worktrees/agent-af799694331ecc8d3
LOG="$W/$1"
shift
cd "$W" || exit 9
echo "provenance: HEAD=$(git rev-parse HEAD) worktree=agent-af799694331ecc8d3 item=M0-35 started=$(date -u +%FT%TZ)" > "$LOG"
node bio-plane/test/m035-cpu-currency-probe.mjs "$@" >> "$LOG" 2>&1
echo "PROBE_OWN_EXIT=$?" >> "$LOG"
