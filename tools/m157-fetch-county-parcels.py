#!/usr/bin/env python3
"""M-157 (D-504) item (2)/(4): fetch the Alameda County Assessor's OWN parcel publications from
the county's ArcGIS organisation behind data.acgov.org (org ROBnTHSNjoZ2Wm1P) -- the current parcel
layer's key column, and EVERY "Parcels Inactivated in Roll Year" and "Deleted Parcel List" table the
services directory lists -- so a Legistar APN can be tested against the roll of the right VINTAGE.

  M157_DIR=<dir> python3 tools/m157-fetch-county-parcels.py

Enumerates the services directory rather than a list of names (a list goes stale; the directory is
the source's own). Every call is a GET; 1.0s between pages; one request at a time. Writes
<dir>/county/<service>.json (rows, key fields only) and <dir>/county/_manifest.json (per service:
layer id, fields, server count, rows fetched). A service whose fetched rows != its server count is
printed as SHORT, never silently accepted.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

D = os.environ.get("M157_DIR", os.getcwd())
OUT = os.path.join(D, "county")
os.makedirs(OUT, exist_ok=True)
UA = "BIO-CivicOS-measurement/1.0 (civic records research)"
ROOT = "https://services5.arcgis.com/ROBnTHSNjoZ2Wm1P/arcgis/rest/services"
WANT = re.compile(r"^(Parcels|Parcels_Inactivated_in_Roll_Year_\d{4}_\d{4}|Assessor_Office_Deleted_Parcel_List_\d{4}_to_\d{4})$")
KEYF = re.compile(r"apn|sort|parcel|date", re.I)


def get(url, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except Exception as e:
            if i == tries - 1:
                raise
            sys.stderr.write(f"  retry {i+1} after {e}\n")
            time.sleep(2 ** (i + 1))


services = [s["name"] for s in get(f"{ROOT}?f=json")["services"]]
todo = sorted(n for n in set(services) if WANT.match(n))
sys.stderr.write(f"DIRECTORY {len(services)} services; {len(todo)} wanted\n")
manifest = {}
for name in todo:
    svc = get(f"{ROOT}/{name}/FeatureServer?f=json")
    lyr = (svc.get("layers") or []) + (svc.get("tables") or [])
    if len(lyr) != 1:
        manifest[name] = {"error": f"{len(lyr)} layers"}
        continue
    lid = lyr[0]["id"]
    meta = get(f"{ROOT}/{name}/FeatureServer/{lid}?f=json")
    fields = [f["name"] for f in meta.get("fields", [])]
    oid = meta.get("objectIdField") or next((f["name"] for f in meta.get("fields", []) if f["type"] == "esriFieldTypeOID"), None)
    keep = [f for f in fields if KEYF.search(f)] if name != "Parcels" else ["APN", "APN_SORT"]
    count = get(f"{ROOT}/{name}/FeatureServer/{lid}/query?where=1%3D1&returnCountOnly=true&f=json")["count"]
    step = meta.get("maxRecordCount") or 2000
    rows, off = [], 0
    while off < count:
        qs = urllib.parse.urlencode({"where": "1=1", "outFields": ",".join(keep), "returnGeometry": "false",
                                     "orderByFields": oid, "resultOffset": off, "resultRecordCount": step, "f": "json"})
        got = get(f"{ROOT}/{name}/FeatureServer/{lid}/query?{qs}")
        feats = got.get("features") or []
        if not feats:
            break
        rows.extend(f["attributes"] for f in feats)
        off += len(feats)
        time.sleep(1.0)
    json.dump(rows, open(os.path.join(OUT, name + ".json"), "w"))
    manifest[name] = {"layer": lid, "fields": fields, "kept": keep, "server_count": count, "fetched": len(rows)}
    flag = "" if len(rows) == count else "  SHORT"
    sys.stderr.write(f"{name}: layer {lid} count {count} fetched {len(rows)}{flag}\n")
json.dump(manifest, open(os.path.join(OUT, "_manifest.json"), "w"), indent=1)
sys.stderr.write("COUNTY DONE\n")
