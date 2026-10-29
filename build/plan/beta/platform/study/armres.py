import json,glob,sys,time,calendar,collections,statistics as st
from tq import q
pref,a,b=sys.argv[1],sys.argv[2],sys.argv[3]
tot=bad=0; kinds=collections.Counter(); walls=[]
for f in sorted(glob.glob(f'door-{pref}*.json')):
    for r in json.load(open(f)):
        if not r['ops']: continue
        tot+=1
        if r['ok']: walls.append(r['wall'])
        else:
            bad+=1; kinds[tuple((o['op'],o['status']) for o in r['ops'])]+=1
print(f'{pref}: {bad} of {tot} uploads failed ({100*bad/tot:.1f}%); page wait p50 {st.median(walls):.0f} ms, p90 {sorted(walls)[int(len(walls)*.9)]:.0f} ms; failures {dict(kinds)}')
d=time.strftime('%Y-%m-%d',time.gmtime()); tt=lambda s: calendar.timegm(time.strptime(d+' '+s,'%Y-%m-%d %H:%M:%S'))*1000
f=[{"key":"$metadata.service","operation":"eq","type":"string","value":"plat-s1"},{"key":"$metadata.error","operation":"exists","type":"string"}]
out={};h=tt(b)
while True:
    es=q(tt(a),h,f,limit=100)['result']['events']['events']
    for e in es: out[e['$metadata']['id']]=e
    if len(es)<100: break
    h=min(e['timestamp'] for e in es)-1
mem=sorted([e for e in out.values() if 'memory limit' in (e['$metadata'].get('message') or '')],key=lambda e:e['timestamp'])
cl=[]
for e in mem:
    if cl and e['timestamp']-cl[-1][-1]['timestamp']<=2000: cl[-1].append(e)
    else: cl.append([e])
mins=(tt(b)-tt(a))/60000
al=sum(1 for k in cl if k[0]['$workers']['eventType']=='alarm')
ov=sum(1 for e in out.values() if 'overloaded' in (e['$metadata'].get('message') or '').lower())
print(f'  window {a}-{b}Z ({mins:.1f} min): {len(cl)} resets ({al} in the alarm, {len(cl)-al} on requests) = {len(cl)/mins:.2f} a minute; {sum(len(k) for k in cl)} requests killed; "overloaded" lines {ov}')
