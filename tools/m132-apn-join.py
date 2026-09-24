#!/usr/bin/env python3
"""D-453 scope (c): do Legistar's APNs resolve in the Alameda County assessor's parcel
roll as republished by Oakland (dataset c3xp-qcgn)? Normalises both sides to the roll's
own canonical key apn_sort = book(3) + ' ' + page(4)parcel(3)sub(2)."""
import os
D = os.environ.get("M132_DIR", os.getcwd())
import json, re, sys, time, urllib.parse, urllib.request
UA = "BIO-CivicOS-measurement/1.0 (civic records research)"
PAD = re.compile(r'\b(\d{3}-\d{4}-\d{3}(?:-\d{1,2})?)\b')

def key_from_padded(v):
    p = v.split('-')
    b, pg, pc = p[0], p[1], p[2]
    sub = p[3] if len(p) > 3 else '0'
    return f"{int(b):03d} {int(pg):04d}{int(pc):03d}{int(sub):02d}"

d = json.load(open(os.path.join(D, "corpus/0200-leg-matters-all.json")))
leg = {}
for r in d:
    t = ' '.join(str(r.get(k) or '') for k in ('MatterTitle', 'MatterName'))
    for v in set(PAD.findall(t)):
        leg.setdefault(key_from_padded(v), []).append((v, r.get('MatterFile'),
            (r.get('MatterIntroDate') or '')[:10], (r.get('MatterTitle') or '')[:90]))
print(f"LEG: {len(leg)} distinct APNs (as canonical keys) from 32,976 matters")

keys = sorted(leg)
found = {}
for i in range(0, len(keys), 40):
    chunk = keys[i:i+40]
    inlist = ",".join("'" + k + "'" for k in chunk)
    qs = urllib.parse.urlencode({"$select": "apn,apn_sort",
                                 "$where": f"apn_sort in({inlist})", "$limit": "5000"})
    q = "https://data.oaklandca.gov/resource/c3xp-qcgn.json?" + qs
    req = urllib.request.Request(q, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        rows = json.loads(r.read().decode())
    for x in rows:
        found.setdefault(x['apn_sort'], set()).add(x['apn'])
    sys.stderr.write(f"  queried {i+len(chunk)}/{len(keys)}, matched so far {len(found)}\n")
    sys.stderr.flush()
    time.sleep(1.5)

print(f"\nSHARED (APN present in BOTH Legistar and the assessor roll): {len(found)} of {len(leg)}")
for k in sorted(found):
    v, f, dt, ti = leg[k][0]
    print(f"  {k} | LEG wrote {v} in matter {f} ({dt}) | roll writes {'/'.join(sorted(found[k]))}")
    print(f"      «{ti}»")
missing = [k for k in keys if k not in found]
print(f"\nNOT FOUND in the roll: {len(missing)}")
for k in missing[:20]:
    print(f"  {k} (LEG wrote {leg[k][0][0]} in {leg[k][0][1]})")
json.dump({"leg_keys": {k: leg[k] for k in leg}, "found": {k: sorted(v) for k, v in found.items()}},
          open(os.path.join(D, "apn-join.json"), 'w'), indent=1)
