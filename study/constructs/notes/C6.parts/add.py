#!/usr/bin/env python3
# Append bullets under construct headings of notes/C6.md.
# Input (stdin): blocks starting with a line "@@ HEADING" followed by bullet lines.
import sys, re
path = 'notes/C6.md'
text = open(path).read()
heads = ['## Reading certificate','## What these documents are (3–6 lines each)','## TIME','## ORGANISATIONS','## LAW','## COURTS','## ANALYSIS','## QUESTIONS','## DOCTRINE','## Cross-construct observations (connections between constructs these documents make or imply)']
blocks = {}
cur = None
for line in sys.stdin.read().splitlines():
    m = re.match(r'^@@ (.+)$', line)
    if m:
        name = m.group(1).strip()
        cur = [h for h in heads if h.split(' ',1)[1].startswith(name)][0]
        blocks.setdefault(cur, [])
        continue
    if cur and line.strip():
        blocks[cur].append(line)
for h, lines in blocks.items():
    i = text.index(h)
    # find next heading
    nxt = len(text)
    for h2 in heads:
        j = text.find(h2, i+len(h))
        if j != -1 and j < nxt:
            nxt = j
    seg = text[i:nxt].rstrip('\n')
    seg = seg + '\n' + '\n'.join(lines) + '\n\n'
    text = text[:i] + seg + text[nxt:]
open(path,'w').write(text)
print('ok', {k.split(' ',1)[1][:12]: len(v) for k,v in blocks.items()})
