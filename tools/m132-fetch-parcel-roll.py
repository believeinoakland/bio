#!/usr/bin/env python3
"""Download the WHOLE apn column of Oakland's Parcels dataset (c3xp-qcgn) as the
assessor-roll side of the corpus — unbiased, not the matched subset. Polite: 50k/page."""
import os
D = os.environ.get("M132_DIR", os.getcwd())
import csv, json, sys, time, urllib.parse, urllib.request
UA = "BIO-CivicOS-measurement/1.0 (civic records research)"
rows, off = [], 0
while True:
    qs = urllib.parse.urlencode({"$select": "apn,apn_sort,book,page,parcel,sub_parcel",
                                 "$limit": "50000", "$offset": str(off), "$order": "apn_sort"})
    url = "https://data.oaklandca.gov/resource/c3xp-qcgn.json?" + qs
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=300) as r:
        got = json.loads(r.read().decode())
    if not got: break
    rows.extend(got)
    sys.stderr.write(f"offset={off} got={len(got)} total={len(rows)}\n"); sys.stderr.flush()
    if len(got) < 50000: break
    off += 50000
    time.sleep(1.5)
w = csv.DictWriter(open(os.path.join(D, "corpus/0204-asr-parcel-roll.csv"), 'w', newline=''),
                   fieldnames=["apn", "apn_sort", "book", "page", "parcel", "sub_parcel"])
w.writeheader()
for x in rows:
    w.writerow({k: x.get(k, "") for k in ["apn", "apn_sort", "book", "page", "parcel", "sub_parcel"]})
sys.stderr.write(f"ROLL DONE rows={len(rows)}\n")
