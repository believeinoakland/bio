#!/usr/bin/env python3
"""Fetch selected City of Oakland finance PDFs from the cao-94612 bucket and extract
text with pypdf. Records per file: HTTP status, bytes, sha256, pages, page failures.
Polite: one at a time, 2s between, plain UA."""
import os
D = os.environ.get("M132_DIR", os.getcwd())
import hashlib, json, os, sys, time, urllib.request
from pypdf import PdfReader

UA = "BIO-CivicOS-measurement/1.0 (civic records research)"
BASE = "https://cao-94612.s3.us-west-2.amazonaws.com/"
OUT = os.path.join(D, "corpus")
RAW = os.path.join(D, "raw")
os.makedirs(OUT, exist_ok=True); os.makedirs(RAW, exist_ok=True)

# prefix 0201- = FIN (finance publications). Selected from the bucket listing.
SEL = [
 ("0201-acfr-2024","documents/2024-City-of-Oakland-ACFR_final-121324.pdf"),
 ("0201-acfr-2023","documents/2023-City-of-Oakland-ACFR_Final-122723.pdf"),
 ("0201-acfr-2022","documents/City-of-Oakland-FY22-ACFR.pdf"),
 ("0201-acfr-2021","documents/City-of-Oakland-Annual-Comprehensive-Financial-Report-FY2021.pdf"),
 ("0201-cafr-2020","documents/CAFR-2020.pdf"),
 ("0201-cafr-2019","documents/City-of-Oakland-CAFR-YE-6.30.2019-FINAL-12.13.2019.pdf"),
 ("0201-cafr-2018","documents/CAFR-2018.pdf"),
 ("0201-cafr-2017","documents/CAFR-2017.pdf"),
 ("0201-cafr-2009","documents/CAFR-2009.pdf"),
 ("0201-cafr-2002","documents/CAFR-2002.pdf"),
 ("0202-cip-fy2527","documents/FY25-27-Proposed-CIP-Budget_05.05.2025_Reduced.pdf"),
 ("0202-cip-fy1921","documents/FY19-21-CIP-Adopted-Budget-Revised-FINAL.pdf"),
 ("0203-budget-fy2325","documents/FY23-25-Adopted-Budget-Book-FINAL-Reduced-Size.pdf"),
 ("0203-budget-fy2527","documents/FY25-27-Proposed-Budget-Book-FINAL-Reduced-Size.pdf"),
 ("0203-budget-fy2425","documents/FY24-25-Adopted-Budget-Book-FINAL-Reduced-Size.pdf"),
]
prov = []
for tag, key in SEL:
    dst = os.path.join(RAW, tag + ".pdf")
    rec = {"tag": tag, "key": key, "url": BASE + key,
           "fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    try:
        req = urllib.request.Request(BASE + key, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=300) as r:
            rec["http"] = r.status
            body = r.read()
        open(dst, "wb").write(body)
        rec["bytes"] = len(body)
        rec["sha256"] = hashlib.sha256(body).hexdigest()
    except Exception as e:
        rec["http"] = f"ERROR {e}"; prov.append(rec)
        sys.stderr.write(f"{tag}: {rec['http']}\n"); sys.stderr.flush(); continue
    try:
        rd = PdfReader(dst)
        pages, fails, chunks = len(rd.pages), 0, []
        for p in rd.pages:
            try: chunks.append(p.extract_text() or "")
            except Exception: fails += 1
        text = "\n".join(chunks)
        open(os.path.join(OUT, tag + ".txt"), "w").write(text)
        rec.update(pages=pages, page_failures=fails, chars=len(text))
    except Exception as e:
        rec["extract"] = f"ERROR {e}"
    prov.append(rec)
    sys.stderr.write(f"{tag}: http={rec.get('http')} bytes={rec.get('bytes')} "
                     f"pages={rec.get('pages')} chars={rec.get('chars')} fails={rec.get('page_failures')}\n")
    sys.stderr.flush()
    json.dump(prov, open(os.path.join(D, "fin-provenance.json"), "w"), indent=1)
    time.sleep(2)
sys.stderr.write("FETCH_FIN DONE\n")
