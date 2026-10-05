import os, re, glob
base = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(base, '..', 'C9.md')
order = ['WHAT','TIME','ORGANISATIONS','LAW','COURTS','ANALYSIS','QUESTIONS','DOCTRINE','CROSS']
sec = {k: [] for k in order}
for f in sorted(glob.glob(os.path.join(base, '[0-9]*.md'))):
    cur = None
    for line in open(f, encoding='utf-8'):
        line = line.rstrip('\n')
        if line.startswith('@@FILE'):
            continue
        m = re.match(r'^@@(\w+)', line)
        if m:
            cur = m.group(1); continue
        if cur and line.strip():
            sec[cur].append(line)
cert = open(os.path.join(base, 'certificate.txt'), encoding='utf-8').read().strip()
files = "src/action-design/{ACTION-PLAN,INVENTORY,MATRIX,sources_build-state,sources_canon-constructs,sources_canon-mission,sources_code}.md.txt; src/NOTIFICATIONS.txt"
heads = {'TIME':'TIME','ORGANISATIONS':'ORGANISATIONS','LAW':'LAW','COURTS':'COURTS','ANALYSIS':'ANALYSIS','QUESTIONS':'QUESTIONS','DOCTRINE':'DOCTRINE'}
parts = [f"# C9: {files}", "## Reading certificate", cert, "## What these documents are (3–6 lines each)"]
parts += sec['WHAT'] or ['none']
for k in ['TIME','ORGANISATIONS','LAW','COURTS','ANALYSIS','QUESTIONS','DOCTRINE']:
    parts.append(f"## {heads[k]}")
    parts += sec[k] or ['none']
parts.append("## Cross-construct observations (connections between constructs these documents make or imply)")
parts += sec['CROSS'] or ['none']
open(out, 'w', encoding='utf-8').write('\n'.join(parts) + '\n')
print(out, sum(len(v) for v in sec.values()), 'bullet lines')
