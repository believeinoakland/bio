#!/usr/bin/env python3
"""Gather each construct's section from every phase-1 note into digest/<CONSTRUCT>.md."""
import os, re, glob
S = os.path.dirname(os.path.abspath(__file__))
os.makedirs(f"{S}/digest", exist_ok=True)
SECTIONS = {"TIME": "TIME", "ORGANISATIONS": "ORGANISATIONS", "LAW": "LAW", "COURTS": "COURTS",
            "ANALYSIS": "ANALYSIS", "QUESTIONS": "QUESTIONS", "DOCTRINE": "DOCTRINE",
            "CROSS": "Cross-construct observations"}
import json
UNITS = json.load(open(f"{S}/units.json"))
notes = sorted(f"{S}/notes/{u}.md" for u in UNITS if os.path.exists(f"{S}/notes/{u}.md"))
out = {k: [] for k in SECTIONS}
missing = []
for path in notes:
    rid = os.path.basename(path)[:-3]
    text = open(path, encoding="utf-8").read()
    head = text.split("\n", 1)[0]
    cert = re.search(r"^## Reading certificate\n(.*?)(?=^## )", text, re.S | re.M)
    for key, title in SECTIONS.items():
        m = re.search(rf"^## {re.escape(title)}[^\n]*\n(.*?)(?=^## |\Z)", text, re.S | re.M)
        if not m:
            missing.append(f"{rid}: {title}")
            continue
        body = m.group(1).strip() or "none"
        out[key].append(f"## From {rid} ({head.lstrip('# ').strip()})\n\n{body}\n")
for key, parts in out.items():
    with open(f"{S}/digest/{key}.md", "w", encoding="utf-8") as f:
        f.write(f"# Digest: {key}\n\nEvery phase-1 reader's {SECTIONS[key]} section, in reader order ({len(parts)} notes).\n\n")
        f.write("\n".join(parts))
for p in sorted(glob.glob(f"{S}/digest/*.md")):
    print(f"{os.path.getsize(p):8d} {os.path.basename(p)}")
print("notes:", len(notes), "| missing sections:", missing or "none")
