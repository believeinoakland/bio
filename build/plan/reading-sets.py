# Measures each module job's reading set (N739, K2053): its requirements whole, the public parts of the modules it uses, its code.
# Run from the product root: python3 build/plan/reading-sets.py
import json,os,re,sys
d=json.load(open('build/modules.json'));ms=d if isinstance(d,list) else d['modules']
by={m['id']:m for m in ms}
SKIP=('node_modules','dist','vendor','assets','.git')
EXT=('.mjs','.js','.html','.ts','.css','.sql','.rs')
def size(p):
    if os.path.isfile(p): return os.path.getsize(p) if p.endswith(EXT) else 0
    t=0
    for r,ds,fs in os.walk(p):
        ds[:]=[x for x in ds if x not in SKIP]
        for f in fs:
            if f.endswith(EXT) and not f.endswith('.bundled.mjs'): t+=os.path.getsize(os.path.join(r,f))
    return t
def req(m):
    p=f'build/requirements/{m}.md'
    return open(p).read() if os.path.exists(p) else ''
def public(m):
    s=req(m); i=s.find('\n## Private'); return s if i<0 else s[:i]
rows=[]
for m in ms:
    own=len(req(m['id']).encode()); pub=sum(len(public(u).encode()) for u in m.get('uses',[]))
    # code: most specific path owning each file is approx: sum paths
    code=sum(size(p) for p in m['paths'])
    rows.append(((own+pub+code)//1000,m['id'],m['layer'],own,pub,code,len(m.get('uses',[]))))
rows.sort(reverse=True)
print('KB id layer own_req used_public code n_uses')
for r in rows: print(*r)
print('over 300 KB:',sum(r[0]>300 for r in rows))
import statistics
print('median',statistics.median(r[0] for r in rows),'n',len(rows))
