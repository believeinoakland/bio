#!/bin/bash
# the determination of N: steps (members) x 3 replicates in a fixed shuffled order; quiet room before each; 4 min a step
cd /tmp/claude-0/-home-user/59f38d1e-7059-58bf-b787-4365a1d33ffd/scratchpad || exit 1
ORDER="15 5 25 10 30 20 25 15 10 30 5 20 10 20 30 5 15 25"
i=0
for N in $ORDER; do
  i=$((i+1))
  python3 quiet-wait.py >> n-run.log 2>&1
  node signin.cjs admin.tok >/dev/null && node signin.cjs member.tok member >/dev/null || { echo "signin failed at step $i" >> n-run.log; exit 2; }
  S=$(date -u +%H:%M:%S)
  NOSTOP=1 node ramp3.cjs nstep$(printf %02d $i)-m$N 240 $N >> n-run.log 2>&1
  E=$(date -u +%H:%M:%S)
  echo "STEP $i members=$N start=$S end=$E" >> n-steps.log
done
echo "ALL DONE $(date -u +%H:%M:%S)" >> n-steps.log
