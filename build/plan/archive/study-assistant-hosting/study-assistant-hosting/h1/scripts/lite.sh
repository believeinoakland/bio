#!/bin/bash
H=/tmp/claude-0/-home-user-bio/4d2f0f0d-4f7d-5449-bba1-a0983b3c5029/scratchpad/h1
for V in V0 V1 V3 V2; do $H/scripts/run.sh $V 0 6250 3 > $H/raw/${V}_lat0_q6250.jsonl 2>&1; done
echo done > $H/raw/LITEDONE
