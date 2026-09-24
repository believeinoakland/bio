#!/usr/bin/env python3
import urllib.parse
"""List the City of Oakland cao-94612 S3 bucket, keeping keys that look like
budget books / ACFRs / finance reports. Polite: paged, 1s between pages, bounded."""
import re, sys, time, urllib.request, xml.etree.ElementTree as ET
UA="BIO-CivicOS-measurement/1.0 (civic records research)"
NS="{http://s3.amazonaws.com/doc/2006-03-01/}"
BASE="https://cao-94612.s3.us-west-2.amazonaws.com/"
want=re.compile(r"(budget|acfr|cafr|financial|annual.?report|comprehensive)",re.I)
tok=None; pages=0; kept=[]; total=0
while pages < 120:
    url=f"{BASE}?list-type=2&max-keys=1000" + (f"&continuation-token={urllib.parse.quote(tok)}" if tok else "")
    req=urllib.request.Request(url, headers={"User-Agent":UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        x=ET.fromstring(r.read())
    for c in x.findall(NS+"Contents"):
        k=c.find(NS+"Key").text; s=int(c.find(NS+"Size").text); total+=1
        if want.search(k) and k.lower().endswith(".pdf"):
            kept.append((k,s))
    pages+=1
    t=x.find(NS+"NextContinuationToken")
    if x.find(NS+"IsTruncated").text!="true" or t is None: break
    tok=t.text; time.sleep(1.0)
import urllib.parse
sys.stderr.write(f"pages={pages} keys_seen={total} kept={len(kept)}\n")
for k,s in sorted(kept, key=lambda z:-z[1]):
    print(f"{s}\t{k}")
