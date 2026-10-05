# Insert bullets into notes/D2.md: input file has lines "@@ SECTION" followed by bullets; each block is appended at the end of that section.
import sys,re
note='/tmp/claude-0/-home-user-bio/cff08118-2267-58b9-b5ac-fdc5ba0d3e81/scratchpad/notes/D2.md'
src=open(sys.argv[1]).read()
blocks={}
cur=None
for line in src.split('\n'):
    if line.startswith('@@ '):
        cur=line[3:].strip(); blocks.setdefault(cur,[])
    elif cur is not None and line.strip():
        blocks[cur].append(line)
text=open(note).read()
order=['TIME','ORGANISATIONS','LAW','COURTS','ANALYSIS','QUESTIONS','DOCTRINE','Cross-construct observations']
for sec,lines in blocks.items():
    i=order.index(sec)
    nxt='\n## '+order[i+1] if i+1<len(order) else None
    if nxt is None:
        text=text.rstrip('\n')+'\n'+'\n'.join(lines)+'\n'
    else:
        pos=text.index(nxt)
        text=text[:pos].rstrip('\n')+'\n'+'\n'.join(lines)+'\n'+text[pos:]
open(note,'w').write(text)
print({k:len(v) for k,v in blocks.items()})
