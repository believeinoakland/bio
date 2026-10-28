#!/bin/bash
# usage: run-control.sh <label>: 6 batches of 12 uploads at C=3 through the Add door; records start/end
cd /tmp/claude-0/-home-user/59f38d1e-7059-58bf-b787-4365a1d33ffd/scratchpad || exit 1
node signin.cjs admin.tok >/dev/null || exit 2
date -u +%H:%M:%S > $1-start.txt
for r in a b c d e f; do node door-stages.cjs 3 12 $1$r 2>&1 | tail -1; done
date -u +%H:%M:%S > $1-end.txt
