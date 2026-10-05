import sys, re
# usage: python3 add.py < input ; input has blocks starting with "@@SECTION" lines
path='/tmp/claude-0/-home-user-bio/cff08118-2267-58b9-b5ac-fdc5ba0d3e81/scratchpad/notes/C7.md'
doc=open(path).read()
cur=None; buf={}
for line in sys.stdin.read().splitlines():
    m=re.match(r'^@@(\w+)\s*$',line)
    if m:
        cur=m.group(1); buf.setdefault(cur,[]); continue
    if cur and line.strip():
        buf[cur].append(line)
for sec,lines in buf.items():
    marker='<!--END %s-->'%sec
    assert marker in doc, sec
    doc=doc.replace(marker,'\n'.join(lines)+'\n'+marker)
open(path,'w').write(doc)
print({k:len(v) for k,v in buf.items()})
