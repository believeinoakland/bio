#!/usr/bin/env python3
"""Harvest EVERY Oakland Legistar matter (no title filter) — D-453 scope (a) and (d).
Polite: 1000/page, 1.5s between pages, plain UA, bounded retries. Writes one JSON array."""
import json, sys, time, urllib.request, urllib.error

UA = "BIO-CivicOS-measurement/1.0 (civic records research)"
BASE = "https://webapi.legistar.com/v1/oakland/matters"
SEL = ",".join(["MatterId","MatterFile","MatterName","MatterTitle","MatterTypeName",
                "MatterStatusName","MatterIntroDate","MatterAgendaDate","MatterPassedDate",
                "MatterEnactmentDate","MatterEnactmentNumber","MatterBodyName"])

def get(url, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=90) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except Exception as e:
            if i == tries - 1:
                raise
            sys.stderr.write(f"  retry {i+1} after {e}\n"); sys.stderr.flush()
            time.sleep(2 ** (i + 1))

all_rows, skip, page = [], 0, 1000
while True:
    url = f"{BASE}?$top={page}&$skip={skip}&$select={SEL}"
    rows = get(url)
    if not rows:
        break
    all_rows.extend(rows)
    sys.stderr.write(f"skip={skip} got={len(rows)} total={len(all_rows)}\n"); sys.stderr.flush()
    if len(rows) < page:
        break
    skip += page
    time.sleep(1.5)

json.dump(all_rows, open(sys.argv[1], "w"))
en = [r for r in all_rows if (r.get("MatterEnactmentNumber") or "").strip()]
sys.stderr.write(f"DONE matters={len(all_rows)} with_enactment={len(en)}\n")
