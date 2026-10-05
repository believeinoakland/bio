import os
P='/tmp/claude-0/-home-user-bio/cff08118-2267-58b9-b5ac-fdc5ba0d3e81/scratchpad/'
order=['HEAD','CERT','WHAT','MODULES','TIME','ORGANISATIONS','LAW','COURTS','ANALYSIS','QUESTIONS','DOCTRINE','CROSS']
titles={'CERT':'## Reading certificate','WHAT':'## What these documents are (3–6 lines each)','MODULES':'## Modules','TIME':'## TIME','ORGANISATIONS':'## ORGANISATIONS','LAW':'## LAW','COURTS':'## COURTS','ANALYSIS':'## ANALYSIS','QUESTIONS':'## QUESTIONS','DOCTRINE':'## DOCTRINE','CROSS':'## Cross-construct observations (connections between constructs these documents make or imply)'}
out=[]
for k in order:
    f=P+'notes/M2.parts/'+k+'.md'
    body=open(f).read().rstrip('\n') if os.path.exists(f) else ''
    if k=='HEAD':
        out.append(body); continue
    out.append(titles[k]); out.append(body if body else 'none'); 
    out.append('')
open(P+'notes/M2.md','w').write('\n'.join(out).rstrip('\n')+'\n')
print(sum(1 for _ in open(P+'notes/M2.md')),'lines')
