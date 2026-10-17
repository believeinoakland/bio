#!/bin/bash
# usage: run.sh VARIANT LATENCY_MS CPU_QUOTA_US(or max) RUNS   -> JSON lines on stdout
# CPU limit: cgroup v1 cpu controller cfs quota (period 100000): 100000=1 vCPU, 50000=1/2, 6250=1/16, max=none (4 CPUs)
H=/tmp/claude-0/-home-user-bio/4d2f0f0d-4f7d-5449-bba1-a0983b3c5029/scratchpad/h1
V=$1; LAT=$2; Q=$3; RUNS=${4:-5}
MODE=tools; [ "$V" = V4 ] && MODE=judge
PORT=$((20000 + RANDOM % 10000))
node $H/scripts/fakeserver.mjs $PORT $LAT $MODE >/dev/null & FP=$!
sleep 1
echo 100000 > /sys/fs/cgroup/cpu/h1/cpu.cfs_period_us
if [ "$Q" = max ]; then echo -1 > /sys/fs/cgroup/cpu/h1/cpu.cfs_quota_us; else echo $Q > /sys/fs/cgroup/cpu/h1/cpu.cfs_quota_us; fi
for i in $(seq $RUNS); do
  curl -s localhost:$PORT/__reset >/dev/null
  echo 0 > /sys/fs/cgroup/cpuacct/h1/cpuacct.usage
  R=$( ( echo $BASHPID > /sys/fs/cgroup/cpu/h1/tasks; echo $BASHPID > /sys/fs/cgroup/cpuacct/h1/tasks
     CGA=/sys/fs/cgroup/cpuacct/h1 exec node $H/scripts/bench.mjs $H $V $PORT ) 2>&1 | tail -1)
  LOG=$(curl -s localhost:$PORT/__log)
  echo "$R" | python3 -c "
import sys,json
l=json.loads('''$LOG''')
main=[x for x in l if x['url'].startswith('/v1/messages') and (x.get('tools') or 'haiku' not in (x.get('model') or ''))]
try: o=json.loads(sys.stdin.read())
except Exception as e: o={'raw':'parse fail'}
o['api_main']=len(main); o['api_all']=len(l); o['msgs']=[x.get('msgs') for x in main]; o['bytes']=[x['bytes'] for x in main]
print(json.dumps(o))"
done
kill $FP
