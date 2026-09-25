#!/usr/bin/env python3
"""M-157 (D-504) item (2): (i) is Oakland's c3xp-qcgn a copy of the Alameda County Assessor's parcel
layer, and of WHICH vintage; (ii) is a historical roll published, and does it resolve M-132's 33
Legistar APNs that the c3xp-qcgn roll did not hold?

  M157_DIR=<dir> python3 tools/m157-apn-vintage.py          # needs corpus/ (M-132's fetchers) + county/
  python3 tools/m157-apn-vintage.py --selftest              # the planted-lineage control (synthetic)

ONE KEY FOR EVERY SOURCE. The sources spell the sort key three ways (c3xp `085A380000118`, the county
`37A 278901101`, some county rows 11 or 12 characters), so no sort column is trusted: every source's
PRINTED APN (`10-787-33`, `2-97-51-1`, Legistar's padded `011-0836-017-00`) is parsed into book, page,
parcel, sub, and each NUMERIC part is read as an integer. That removes zero-padding and never folds a
digit (M-119's rule; M-132 (c) draws the same line). A value that does not parse is COUNTED and printed,
never dropped.

What it cannot see: a parcel retired before roll year 2005-06 (the earliest inactivation table the county
publishes); a Legistar APN written in any form but the padded one M-132's join reads; an inactivation the
county recorded under a parent key spelled differently from the parcel's own.
"""
import csv, glob, json, os, re, sys
from datetime import datetime, timezone

D = os.environ.get("M157_DIR", os.getcwd())
# Book is digits with an optional letter (37A) OR a bare letter (O-305-3-10: the county's lineage tables use it).
APN = re.compile(r"^\s*0*(\d{1,3}[A-Z]?|[A-Z])-0*(\d{1,4})-0*(\d{1,3}[A-Z]?)(?:-0*(\d{1,2}))?\s*$")
# The county names the same three fields four ways across its tables (measured: 8,821 rows of 2009-10, 2020-21
# and 2024-25 went unparsed on the first run, and those three roll years vanished from every tally, silently).
PARENT = ("parent_apn", "parent_parcel", "parent_parcel_number")
CHILD = ("child_apn", "child_parcel_number")
WHEN = ("inactivation_date", "end_date", "parent_parcel_end_date")


def first(low, names):
    return next((low[n] for n in names if low.get(n) not in (None, "")), None)
PAD = re.compile(r"\b(\d{3}-\d{4}-\d{3}(?:-\d{1,2})?)\b")  # M-132's Legistar pattern, unchanged
YEAR = re.compile(r"(\d{4})_(?:to_)?(\d{4})$")


def key(v):
    m = APN.match(str(v or "").upper())
    if not m:
        return None
    b, p, c, s = m.groups()
    return f"{b.lstrip('0') or '0'}-{int(p)}-{c.lstrip('0') or '0'}-{int(s or 0)}"


def load_lineage(county):
    """-> {parent_key: [(roll_year_start, table, child_key, date_iso)]}, bad count."""
    out, bad = {}, 0
    for f in sorted(glob.glob(os.path.join(county, "*.json"))):
        name = os.path.basename(f)[:-5]
        m = YEAR.search(name)
        if not m or name.startswith("_"):
            continue
        y0 = int(m.group(1))
        for r in json.load(open(f)):
            low = {k.lower(): v for k, v in r.items()}
            pk = key(first(low, PARENT))
            ck = key(first(low, CHILD))
            dt = first(low, WHEN)
            iso = datetime.fromtimestamp(dt / 1000, timezone.utc).date().isoformat() if isinstance(dt, (int, float)) else None
            if not pk:
                bad += 1
                continue
            out.setdefault(pk, []).append((y0, name, ck, iso))
    return out, bad


def classify(k, snap, cur, lineage):
    rec = sorted(lineage.get(k, []))
    first = rec[0] if rec else None
    return {"in_2012_snapshot": k in snap, "in_current": k in cur,
            "retired_roll_year": first[0] if first else None,
            "retired_table": first[1] if first else None,
            "children": sorted({r[2] for r in rec if r[2]}),
            "children_current": sorted({r[2] for r in rec if r[2] and r[2] in cur})}


def selftest():
    arms = []
    arms.append(("padded LEG form folds onto printed form", key("011-0836-017-00") == key("11-836-17")))
    arms.append(("sub-parcel kept: 48-6298-3-2 != 48-6298-3", key("48-6298-3-2") != key("48-6298-3")))
    arms.append(("lettered book kept: 37A-2789-11-1 != 37-2789-11-1", key("37A-2789-11-1") != key("37-2789-11-1")))
    arms.append(("a digit is never folded: 11-836-17 != 11-836-71", key("11-836-17") != key("11-836-71")))
    arms.append(("letter-only book parses: O-305-3-10", key("O-305-3-10") == "O-305-3-10"))
    # The spellings are written out, NOT read from PARENT: the first draft iterated PARENT itself, so narrowing
    # PARENT narrowed the arm with it and the control came back GREEN with the fix removed (M-157, recorded).
    arms.append(("each measured county spelling is read",
                 all(key(first({n: "8-644-12"}, PARENT)) == key("8-644-12")
                     for n in ("parent_apn", "parent_parcel", "parent_parcel_number"))))
    arms.append(("unparseable is None, not a key", key("2000-58") is None and key("") is None))
    lin = {key("8-644-12"): [(2006, "T2006", key("8-644-40"), "2006-07-01")]}
    snap, cur = {key("1-1-1")}, {key("1-1-1"), key("8-644-40")}
    c = classify(key("8-644-12"), snap, cur, lin)
    arms.append(("planted retired parcel found with its roll year", c["retired_roll_year"] == 2006))
    arms.append(("planted child found current", c["children_current"] == [key("8-644-40")]))
    c2 = classify(key("9-9-9"), snap, cur, lin)
    arms.append(("an unplanted APN is NOT given a retirement", c2["retired_roll_year"] is None and not c2["in_current"]))
    for n, ok in arms:
        print(("PASS " if ok else "FAIL ") + n)
    ok = all(a[1] for a in arms)
    print(f"SELFTEST {'GREEN' if ok else 'RED'} {sum(a[1] for a in arms)}/{len(arms)}")
    return 0 if ok else 1


def main():
    if "--selftest" in sys.argv:
        sys.exit(selftest())
    county = os.path.join(D, "county")
    man = json.load(open(os.path.join(county, "_manifest.json")))
    short = {n: m for n, m in man.items() if m.get("fetched") != m.get("server_count")}
    print(f"COUNTY TABLES {len(man)} · SHORT {len(short)} {sorted(short)}")
    snap_rows = list(csv.DictReader(open(os.path.join(D, "corpus/0204-asr-parcel-roll.csv"))))
    snap = {key(r["apn"]) for r in snap_rows} - {None}
    snap_bad = sum(1 for r in snap_rows if key(r["apn"]) is None)
    cur_rows = json.load(open(os.path.join(county, "Parcels.json")))
    cur = {key(r["APN"]) for r in cur_rows} - {None}
    cur_bad = sum(1 for r in cur_rows if key(r["APN"]) is None)
    lineage, lin_bad = load_lineage(county)
    assert len(snap) > 100000 and len(cur) > 100000 and len(lineage) > 1000, "empty corpus proves nothing"
    print(f"c3xp-qcgn rows {len(snap_rows)} keys {len(snap)} unparsed {snap_bad}")
    print(f"county current rows {len(cur_rows)} keys {len(cur)} unparsed {cur_bad}")
    print(f"county lineage parents {len(lineage)} unparsed-parent rows {lin_bad}")

    # (i) the copy test
    both, only_snap, only_cur = snap & cur, snap - cur, cur - snap
    print(f"\n(i) COPY TEST: c3xp ∩ current {len(both)} · c3xp only {len(only_snap)} · current only {len(only_cur)}")
    yrs = {}
    for k in only_snap:
        rec = lineage.get(k)
        y = min(r[0] for r in rec) if rec else None
        yrs[y] = yrs.get(y, 0) + 1
    print("  c3xp-only keys by the roll year the county retired them (None = no retirement published):")
    for y in sorted(yrs, key=lambda x: (x is None, x)):
        print(f"    {y}: {yrs[y]}")
    retired_snap = {k: min(r[0] for r in lineage[k]) for k in snap if k in lineage}
    pre = sum(1 for y in retired_snap.values() if y < 2012)
    print(f"  c3xp keys the county retired in a roll year BEFORE 2012: {pre} of {len(retired_snap)} c3xp keys with any retirement")
    born = {}
    for recs in lineage.values():
        for y0, _, ck, _ in recs:
            if ck:
                born.setdefault(ck, y0)
    cy = {}
    for k in only_cur:
        y = born.get(k)
        cy[y] = cy.get(y, 0) + 1
    print("  current-only keys by the roll year they were CREATED as a child (None = no lineage published):")
    for y in sorted(cy, key=lambda x: (x is None, x)):
        print(f"    {y}: {cy[y]}")

    # (ii) Legistar's APNs against every vintage
    matters = json.load(open(os.path.join(D, "corpus/0200-leg-matters-all.json")))
    leg = {}
    for r in matters:
        t = " ".join(str(r.get(k) or "") for k in ("MatterTitle", "MatterName"))
        for v in set(PAD.findall(t)):
            leg.setdefault(key(v), []).append((v, r.get("MatterFile"), (r.get("MatterIntroDate") or "")[:10]))
    leg.pop(None, None)
    res = {k: classify(k, snap, cur, lineage) for k in leg}
    ins = sum(1 for c in res.values() if c["in_2012_snapshot"])
    print(f"\n(ii) LEGISTAR: {len(matters)} matters, {len(leg)} distinct APN keys (M-132's padded pattern)")
    print(f"  in c3xp-qcgn (2012): {ins} · absent {len(leg) - ins}")
    print(f"  in the county's CURRENT layer: {sum(1 for c in res.values() if c['in_current'])}")
    absent = {k: c for k, c in res.items() if not c["in_2012_snapshot"]}
    buckets = {"retirement published": [], "in current layer, not in 2012 snapshot": [], "no trace in any published vintage": []}
    for k, c in sorted(absent.items()):
        if c["retired_roll_year"] is not None:
            buckets["retirement published"].append(k)
        elif c["in_current"]:
            buckets["in current layer, not in 2012 snapshot"].append(k)
        else:
            buckets["no trace in any published vintage"].append(k)
    for b, ks in buckets.items():
        print(f"  ABSENT-FROM-2012, {b}: {len(ks)}")
        for k in ks:
            v, f, dt = leg[k][0]
            c = res[k]
            extra = (f" retired roll-year {c['retired_roll_year']} → children {c['children'][:4]} (current: {len(c['children_current'])})"
                     if c["retired_roll_year"] is not None else "")
            print(f"    {v} ({f}, {dt}){extra}")
    retired_in_snap = [k for k, c in res.items() if c["in_2012_snapshot"] and not c["in_current"]]
    print(f"  in the 2012 snapshot but NOT current (retired since): {len(retired_in_snap)}")
    json.dump({"res": res, "leg": {k: leg[k] for k in leg}}, open(os.path.join(D, "apn-vintage.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
