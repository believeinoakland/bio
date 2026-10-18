import json,glob,statistics as st,re,os
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rows(f):
    out=[]
    for l in open(f):
        try: out.append(json.loads(l))
        except: pass
    return out
def ms(v):
    v=[x for x in v if x is not None]
    if not v: return 'n/a'
    return f"{st.median(v)/1000:.2f} ({min(v)/1000:.2f}-{max(v)/1000:.2f})"
def sec(v):
    v=[x for x in v if x is not None]
    if not v: return 'n/a'
    return f"{st.median(v):.2f} ({min(v):.2f}-{max(v):.2f})"
cpus={'max':'4 CPUs, no quota','100000':'1 CPU quota','50000':'1/2 vCPU quota','6250':'1/16 vCPU quota (lite)'}
for L in ['0','3000']:
  print(f"\n#### Model latency {int(L)/1000:g} s per turn\n")
  print("| CPU | variant | n | first msg s | end s (from ask) | API req (main) | CPU s per conv (user+sys) |\n|---|---|---|---|---|---|---|")
  for Q in cpus:
    for V in ['V0','V1','V2','V3','V4']:
      f=f"{H}/raw/{V}_lat{L}_q{Q}.jsonl"
      if not os.path.exists(f): continue
      R=rows(f)
      if not R: continue
      if V=='V2':
        first=[r['convs'][0] for r in R if 'convs' in r]
        later=[c for r in R if 'convs' in r for c in r['convs'][1:]]
        print(f"| {cpus[Q]} | V2 conv 1 | {len(first)} | {ms([c['first_ms'] for c in first])} | {ms([c['end_ms'] for c in first])} | 3 | {sec([c['cpu_s'] for c in first])} |")
        print(f"| {cpus[Q]} | V2 conv 2-5 | {len(later)} | {ms([c['first_ms'] for c in later])} | {ms([c['end_ms'] for c in later])} | 3 | {sec([c['cpu_s'] for c in later])} |")
        print(f"| {cpus[Q]} | V2 whole process (5 conv) | {len(R)} | - | {ms([r['convs'][-1]['end_ms']+0 and sum(c['end_ms'] for c in r['convs']) for r in R if 'convs' in r])} | {sorted(set(r['api_main'] for r in R))} | {sec([r['cpu_s'] for r in R])} |")
        continue
      extra=''
      cp=[r.get('cpu_s') for r in R]
      if V=='V1':
        print(f"| {cpus[Q]} | V1 (startup, not in 'end') | {len(R)} | startup {ms([r.get('startup_ms') for r in R])} | - | - | startup {sec([r.get('startup_cpu_s') for r in R])} |")
        cp=[r.get('ask_cpu_s') for r in R]
      print(f"| {cpus[Q]} | {V}{' (ask→end)' if V=='V1' else ''} | {len(R)} | {ms([r.get('first_ms') for r in R])} | {ms([r.get('end_ms') for r in R])} | {sorted(set(r['api_main'] for r in R))} | {sec(cp)} |")
