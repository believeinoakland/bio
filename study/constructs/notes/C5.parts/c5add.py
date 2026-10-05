import sys,re
note='notes/C5.md'
src=open(sys.argv[1]).read()
heads=['## Reading certificate','## What these documents are (3–6 lines each)','## TIME','## ORGANISATIONS','## LAW','## COURTS','## ANALYSIS','## QUESTIONS','## DOCTRINE','## Cross-construct observations (connections between constructs these documents make or imply)']
short={'CERT':0,'WHAT':1,'TIME':2,'ORG':3,'LAW':4,'COURTS':5,'ANALYSIS':6,'QUESTIONS':7,'DOCTRINE':8,'CROSS':9}
blocks={};cur=None
for line in src.splitlines():
    m=re.match(r'^@@(\w+)\s*$',line)
    if m: cur=short[m.group(1)]; blocks.setdefault(cur,[]); continue
    if cur is not None and line.strip(): blocks[cur].append(line)
text=open(note).read()
lines=text.split('\n')
# find heading indices
for idx in sorted(blocks,reverse=True):
    h=heads[idx]
    i=lines.index(h)
    # end of section = next heading or EOF
    j=i+1
    while j<len(lines) and not lines[j].startswith('## '): j+=1
    # strip trailing blank lines in section
    k=j
    while k>i+1 and lines[k-1].strip()=='' : k-=1
    lines[k:k]=blocks[idx]
open(note,'w').write('\n'.join(lines))
print({heads[k][:20]:len(v) for k,v in blocks.items()})
