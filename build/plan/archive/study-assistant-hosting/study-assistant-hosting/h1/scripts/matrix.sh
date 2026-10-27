#!/bin/bash
H=/tmp/claude-0/-home-user-bio/4d2f0f0d-4f7d-5449-bba1-a0983b3c5029/scratchpad/h1
for Q in max 100000 50000; do for L in 0 3000; do for V in V0 V1 V2 V3 V4; do
  $H/scripts/run.sh $V $L $Q 5 > $H/raw/${V}_lat${L}_q${Q}.jsonl 2>&1
done; done; done
echo done > $H/raw/DONE
