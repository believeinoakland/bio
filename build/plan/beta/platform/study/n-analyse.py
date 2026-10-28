import json,glob,re,time,calendar,collections,statistics as st
from tq import q
d=time.strftime('%Y-%m-%d',time.gmtime()); 
def tt(s,day=None):
    return calendar.timegm(time.strptime((day or d)+' '+s,'%Y-%m-%d %H:%M:%S'))*1000
f=[{"key":"$metadata.service","operation":"eq","type":"string","value":"plat-s1"},{"key":"$metadata.error","operation":"exists","type":"string"}]
def pull(a,b):
    out={};h=b
    while True:
        es=q(a,h,f,limit=100)['result']['events']['events']
        for e in es: out[e['$metadata']['id']]=e
        if len(es)<100: break
        h=min(e['timestamp'] for e in es)-1
    return list(out.values())
rows=[]
for fn in sorted(glob.glob('ramp-nstep*-m*.json')):
    s=json.load(open(fn))[0]; m=re.search(r'nstep(\d+)-m(\d+)',fn)
    # step windows cross midnight? the run is 20:39-22:37 same UTC day
    a,b=tt(s['start']),tt(s['end']); ev=pull(a,b)
    mem=sorted([e for e in ev if 'memory limit' in (e['$metadata'].get('message') or '')],key=lambda e:e['timestamp'])
    cl=[]
    for e in mem:
        if cl and e['timestamp']-cl[-1][-1]['timestamp']<=2000: cl[-1].append(e)
        else: cl.append([e])
    mins=(b-a)/60000
    real=s['errors']  # all non-subscription errors now (body fixed)
    rows.append(dict(i=int(m.group(1)),N=int(m.group(2)),mins=mins,frames=s['frames'],req=s['requests'],err=real,errpct=s['errPct'],st=s['errStatuses'],resets=len(cl),killed=sum(len(k) for k in cl),
        ov=sum(1 for e in ev if 'overloaded' in (e['$metadata'].get('message') or '').lower()),
        up=s['uploads'],member=s['member'],admin=s['admin']))
json.dump(rows,open('n-analysis.json','w'),indent=1)
print('members | rep: errors of requests (%), resets (per min), killed')
for N in sorted({r['N'] for r in rows}):
    rr=[r for r in rows if r['N']==N]
    print(f"{N:>2} | "+' | '.join(f"{r['err']}/{r['req']} ({r['errpct']}%) {r['resets']} ({r['resets']/r['mins']:.2f}/min) k{r['killed']}" for r in rr)+f"  | total {sum(r['err'] for r in rr)}/{sum(r['req'] for r in rr)} = {100*sum(r['err'] for r in rr)/sum(r['req'] for r in rr):.2f}%, resets {sum(r['resets'] for r in rr)} in {sum(r['mins'] for r in rr):.1f} min = {sum(r['resets'] for r in rr)/sum(r['mins'] for r in rr):.2f}/min")
print()
print('member frame ms pooled over the 3 reps: screen p50 of medians / worst p90')
for N in sorted({r['N'] for r in rows}):
    rr=[r for r in rows if r['N']==N]; out=[]
    for sc in ('home','queue','project','projects'):
        med=[r['member'][sc][1] for r in rr if r['member'].get(sc)]; p90=[r['member'][sc][2] for r in rr if r['member'].get(sc)]
        out.append(f"{sc} {st.median(med):.0f}/{max(p90):.0f}" if med else f"{sc} -")
    print(f"{N:>2} | "+'  '.join(out))
print('upload failures (status !=200) by N:',{N:sum(1 for r in rows if r['N']==N for u in r['up'] if u[0]!=200) for N in sorted({r['N'] for r in rows})})
