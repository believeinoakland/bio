import sys,json,re
# usage: m1_add.py addfile ; addfile has blocks "@@SECTION name\n text"
note='/tmp/claude-0/-home-user-bio/62d9ce7a-c95e-5869-b16e-033733a2e769/scratchpad/constructs/phase2/notes/M1.md'
s=open(note).read()
blocks=open(sys.argv[1]).read().split('@@SECTION ')[1:]
order=['## Reading certificate','## What these documents are','## Modules','## PEOPLE','## EVENTS','## MONEY','## THE SIX AS THEY MEET THE THREE','## DOCTRINE','## Cross-construct observations']
for b in blocks:
    name,_,text=b.partition('\n')
    name=name.strip()
    # find heading line starting with name
    i=s.find('\n'+name)
    if i<0: raise SystemExit('no heading '+name)
    # find next heading after i
    j=s.find('\n## ',i+1)
    if j<0: j=len(s)
    s=s[:j].rstrip('\n')+'\n'+text.rstrip('\n')+'\n\n'+s[j+1:] if j<len(s) else s.rstrip('\n')+'\n'+text.rstrip('\n')+'\n'
open(note,'w').write(s)
