#!/bin/bash
cd /tmp/claude-0/-home-user/59f38d1e-7059-58bf-b787-4365a1d33ffd/scratchpad || exit 1
node signin.cjs admin.tok && node signin.cjs member.tok member || exit 2
date -u +%H:%M:%S > ramp-start.txt
NOSTOP=1 node ramp3.cjs "$1" 180 5,10,15,25 > ramp-$1.log 2>&1
date -u +%H:%M:%S > ramp-end.txt
