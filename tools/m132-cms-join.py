#!/usr/bin/env python3
"""D-453 scope (a): the C.M.S. numbers the ACFRs / budget books cite, looked up by
number in the WHOLE Legistar matter set (32,976 matters, no title filter) — the pair
M-119 named 'the single most promising unmeasured pair'.
Normalises the enactment field the way the text pattern does: M-119's JSON path
accepted only a bare \\d{4,5} and so missed every 'NNNNN CMS'-suffixed value."""
import os
D = os.environ.get("M132_DIR", os.getcwd())
import glob, json, os, re, sys
from collections import defaultdict

CMS = re.compile(r"\b(\d{4,5})\s*C\.?\s?M\.?\s?S\b\.?")
BARE = re.compile(r"^\s*(\d{4,5})\s*$")
ENCMS = re.compile(r"^\s*(?:C\.?\s?M\.?\s?S\.?\s*)?(\d{4,5})\s*(?:C\.?\s?M\.?\s?S\b\.?)?\s*$")

# --- Legistar side: every enactment number, normalised ---
mats = json.load(open(os.path.join(D, "corpus/0200-leg-matters-all.json")))
leg = defaultdict(list)
raw_forms = defaultdict(int)
m119_accepted = 0
for r in mats:
    e = (r.get("MatterEnactmentNumber") or "").strip()
    if not e:
        continue
    raw_forms[re.sub(r"\d", "9", e)] += 1
    if BARE.match(e):
        m119_accepted += 1
    m = ENCMS.match(e)
    if m:
        leg[m.group(1)].append((r.get("MatterFile"), r.get("MatterTypeName"),
                                (r.get("MatterEnactmentDate") or r.get("MatterPassedDate") or "")[:10],
                                (r.get("MatterTitle") or r.get("MatterName") or "")[:120]))
print(f"LEG enactment numbers: {sum(raw_forms.values())} occurrences, "
      f"{len(leg)} distinct normalised 4-5 digit values")
print(f"  M-119's JSON path (bare \\d{{4,5}} only) would have accepted {m119_accepted} "
      f"of {sum(raw_forms.values())} — it MISSED {sum(raw_forms.values())-m119_accepted}")

# --- FIN side: C.M.S. citations in the finance publications ---
fin = defaultdict(list)
per_file = {}
for p in sorted(glob.glob(os.path.join(D, "corpus/020[123]-*.txt"))):
    fn = os.path.basename(p)
    t = open(p, encoding="utf-8", errors="replace").read()
    vals = set()
    for m in CMS.finditer(t):
        v = m.group(1)
        vals.add(v)
        fin[v].append((fn, re.sub(r"\s+", " ", t[max(0, m.start()-90):m.end()+60])))
    per_file[fn] = (len(t), len(vals))
print("\nFIN files read (chars, distinct C.M.S. values):")
for fn, (c, n) in per_file.items():
    flag = "   <<< NO TEXT LAYER" if c < 1000 else ""
    print(f"  {fn}: chars={c} cms_values={n}{flag}")
print(f"\nFIN distinct C.M.S. values cited: {len(fin)}")

hit = sorted(set(fin) & set(leg))
miss = sorted(set(fin) - set(leg))
print(f"\nSHARED (a C.M.S. number cited by FIN that IS a Legistar enactment number): "
      f"{len(hit)} of {len(fin)}")
for v in hit:
    f0, ctx = fin[v][0]
    lf, lt, ld, lti = leg[v][0]
    print(f"  {v} | FIN[{f0}] «{ctx[:150]}»")
    print(f"       LEG matter {lf} ({lt}, enacted {ld}) «{lti[:110]}»")
print(f"\nCITED BY FIN, NOT a Legistar enactment number: {len(miss)}")
for v in miss:
    f0, ctx = fin[v][0]
    print(f"  {v} | FIN[{f0}] «{ctx[:120]}»")
json.dump({"hit": hit, "miss": miss,
           "fin": {k: v[0][0] for k, v in fin.items()},
           "leg_sample": {k: leg[k][0] for k in hit}},
          open(os.path.join(D, "cms-join.json"), 'w'), indent=1)
