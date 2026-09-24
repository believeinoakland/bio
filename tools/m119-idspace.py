#!/usr/bin/env python3
"""M-119 (D-74): which identifier values does Oakland reuse across its systems?

Framework §8.3's five identifier classes, matched over a corpus of texts already
extracted from captures held in the record (see measurements/M-119.md for how the
corpus is made: op=image + op=capture, every blob checked against its sha256, pypdf
for PDF text). This script only MATCHES; it fetches nothing.

  python3 tools/m119-idspace.py <corpus-dir>            the measurement
  python3 tools/m119-idspace.py --selftest              the negative control (synthetic)
  python3 tools/m119-idspace.py <corpus-dir> --plant    the control arm on the real corpus

A value COUNTS as shared only when the SAME normalised string is found in two
different SYSTEMS and the two occurrences' labels agree (a fund or project name,
or a resolution/ordinance/contract context). Normalisation is deliberately narrow:
whitespace, dots and case in the marker ("C.M.S." = "CMS"), never digits. A
leading-zero variant ("03100" against "3100") is a DIFFERENT value and is printed as
a NEAR-MISS for a person to judge, never counted.
"""
import csv, json, os, re, sys
from collections import defaultdict

# file prefix -> system; the institution is the City of Oakland unless named.
SYSTEMS = [
    ("LEG", "Legistar (Granicus): webapi JSON, calendar page, attachment PDFs",
     ("0002-", "0109-", "0110-", "0111-", "0112-", "0113-", "0114-", "0115-", "0116-", "0117-",
      "0118-", "0119-", "0200-")),
    ("FIN", "Finance Department publications: ACFRs, adopted budget books, oaklandca.gov finance pages",
     ("0100-", "0103-", "0104-", "0106-acfr", "0106-revenue", "0107-", "0301-",
      "0201-", "0202-", "0203-")),
    ("ODP", "Open Data portal (Socrata data.oaklandca.gov): FY13-15 adopted budget line items",
     ("0105-", "0205-")),
    ("AUD", "Office of the City Auditor: 2022 sewer franchise fee report", ("0099-",)),
    # D-453 (2026-09-24) added the 02xx- prefixes: the WIDER corpus fetched live from the
    # sources themselves once egress opened, rather than from the 31 bundles M-119 could reach.
    ("ASR", "Alameda County ASSESSOR's parcel roll as republished by Oakland (data.oaklandca.gov "
            "c3xp-qcgn) — the APN's ISSUER is the county, so an ASR<->LEG pair is CROSS-INSTITUTION",
     ("0204-",)),
    ("OGV", "OpenGov (oaklandca.opengov.com) transfer series", ("0101-",)),
    ("EXT", "NOT an Oakland system: Supreme Court of California opinion (SCOCAL)", ("0108-",)),
]
CLASSES = ["contract", "project", "resord", "apn", "fund"]
STOP = {"fund", "funds", "the", "of", "and", "for", "city", "oakland", "general", "service", "services",
        "special", "revenue", "project", "program", "a", "to", "in", "&", "-", "fy", "cip"}

# Legistar writes MatterEnactmentNumber in several forms: a bare number, 'NNNNN CMS',
# 'NNNNN C.M.S.', 'NNNNN C.M.S', and 'CMS NNNNN'. CORRECTED by D-453 (2026-09-24): this
# path used re.fullmatch(r"\d{4,5}") and so DROPPED 8,470 of 17,692 enactment numbers
# (47.9%, of which 7,370 C.M.S.-suffixed) when run over the whole matter set. The old
# assertion was wrong because it tested the FIELD as if it were bare digits, while the
# marker's spelling is exactly what normalisation is supposed to fold (as it already does
# in RX["resord"] for running text).
RX_ENACT = re.compile(r"^\s*(?:C\.?\s?M\.?\s?S\.?\s*)?(\d{4,5})\s*(?:C\.?\s?M\.?\s?S\b\.?)?\s*$")

def enactment_value(en):
    """The 4-5 digit enactment number in a MatterEnactmentNumber field, or None.
    Folds the C.M.S. marker's spelling; NEVER folds digits."""
    m = RX_ENACT.match(en or "")
    return m.group(1) if m else None

# An APN is written two ways in Oakland's record: Legistar pads every part
# (011-0836-017-00) while the assessor's roll does not (11-836-17, sub-parcel omitted
# when zero). The roll's OWN canonical column apn_sort is book(3)+' '+page(4)parcel(3)
# sub(2) -- verified against the roll: apn 48-6298-3-2 has apn_sort '048 629800302'. So
# both forms fold onto that key. Zero-padding a part is NOT folding a digit: it is the
# roll's own spelling of the same part. An absent sub-parcel becomes 00 because the roll
# itself writes it that way (apn 48-6313-23 -> '048 631302300').
def apn_key(v):
    parts = (v or "").strip().split("-")
    if len(parts) < 3 or len(parts) > 4 or not all(x.isdigit() for x in parts):
        return None
    b, pg, pc = parts[0], parts[1], parts[2]
    sub = parts[3] if len(parts) > 3 else "0"
    if len(b) > 3 or len(pg) > 4 or len(pc) > 3 or len(sub) > 2:
        return None
    return f"{int(b):03d} {int(pg):04d}{int(pc):03d}{int(sub):02d}"

def col(row, *names):
    """A CSV column looked up by NAME rather than by one literal spelling. D-453
    (2026-09-24): Socrata's CSV EXPORT heads the column 'Fund Code' while its API heads
    the same column 'fund_code', so a reader pinned to one spelling reads the other as an
    empty dataset -- silently, which is the failure mode this project calls a matcher
    'looking in the wrong place'. Compared on letters and digits only."""
    want = {re.sub(r"[^a-z0-9]", "", n.lower()) for n in names}
    for k, v in row.items():
        if k and re.sub(r"[^a-z0-9]", "", k.lower()) in want:
            return v
    return None

def system_of(fn):
    for code, _, pre in SYSTEMS:
        if fn.startswith(pre):
            return code
    return None

def words(s):
    return {w for w in re.findall(r"[a-z]{3,}", (s or "").lower()) if w not in STOP}

RX = {
    "resord": [re.compile(r"\b(\d{4,5})\s*C\.?\s?M\.?\s?S\b\.?")],
    "apn": [re.compile(r"\b(\d{3}-\d{4}-\d{3}(?:-\d{1,2})?)\b"),
            re.compile(r"\bAPN\s*(?:No\.?|#)?\s*:?\s*([0-9][0-9-]{6,}[0-9])")],
    "contract": [re.compile(r"(?i)\b(?:contract|agreement|purchase\s+order|p\.\s?o\.)\s*(?:no\.?|number|#)\s*:?\s*"
                            r"([A-Z0-9][A-Z0-9\-]{1,}\d)\b")],
    "project": [re.compile(r"\b([A-Z]\d{5,6})\b"),
                re.compile(r"(?i)\bproject\s*(?:no\.?|number|#|code)?\s*:?\s*([A-Z]?\d{5,7})\b")],
    # code-then-name, name-then-code, and the bare "Fund 3100" / "Fund No. 3100"
    "fund": [re.compile(r"\b(\d{4,5})\s*[-–:]?\s*((?:[A-Z][\w&'/.]*\s+){0,6}?Fund)\b"),
             re.compile(r"((?:[A-Z][\w&'/.]*\s+){1,6}Fund)\s*(?:No\.?|#)?\s*\(\s*(\d{4,5})\s*\)"),
             re.compile(r"\b(Fund)\s*(?:No\.?|#|Number)?\s*\(?\s*(\d{4,5})\b")],
}

def ctx(text, a, b, n=60):
    return re.sub(r"\s+", " ", text[max(0, a - n): b + n])

def extract_text(text, fn, sysc, out):
    for m in RX["resord"][0].finditer(text):
        out["resord"].append((m.group(1), ctx(text, m.start(), m.end()), fn, sysc))
    for rx in RX["apn"]:
        for m in rx.finditer(text):
            # D-453: fold onto the assessor roll's own canonical key so Legistar's padded
            # form and the roll's unpadded form are the SAME value. A string the key
            # function refuses is kept verbatim, never silently dropped.
            k = apn_key(m.group(1)) or m.group(1)
            out["apn"].append((k, ctx(text, m.start(), m.end()), fn, sysc))
    for m in RX["contract"][0].finditer(text):
        out["contract"].append((m.group(1).upper(), ctx(text, m.start(), m.end()), fn, sysc))
    seenp = set()
    for rx in RX["project"]:
        for m in rx.finditer(text):
            v = m.group(1).upper()
            if (v, m.start(1)) in seenp:
                continue
            seenp.add((v, m.start(1)))
            out["project"].append((v, ctx(text, m.start(), m.end()), fn, sysc))
    r1, r2, r3 = RX["fund"]
    for m in r1.finditer(text):
        out["fund"].append((m.group(1), m.group(2), fn, sysc))
    for m in r2.finditer(text):
        out["fund"].append((m.group(2), m.group(1), fn, sysc))
    for m in r3.finditer(text):
        out["fund"].append((m.group(2), ctx(text, m.start(), m.end(), 50), fn, sysc))

def load(corpus, plant=False):
    out = {c: [] for c in CLASSES}
    reach = defaultdict(lambda: {"files": 0, "chars": 0, "rows": 0, "unreadable": []})
    for fn in sorted(os.listdir(corpus)):
        sysc = system_of(fn)
        if not sysc:
            continue
        p = os.path.join(corpus, fn)
        raw = open(p, encoding="utf-8", errors="replace").read()
        r = reach[sysc]
        r["files"] += 1
        r["chars"] += len(raw)
        if len(raw.strip()) < 200:
            r["unreadable"].append(f"{fn} ({len(raw.strip())} chars)")
        if fn.endswith(".csv"):
            rows = list(csv.DictReader(open(p, encoding="utf-8", errors="replace")))
            r["rows"] += len(rows)
            for x in rows:
                # D-453: the assessor roll (0204-) carries apn + the roll's own apn_sort.
                av = (col(x, "apn") or "").strip()
                if av:
                    srt = (col(x, "apn_sort") or "").strip()
                    k = apn_key(av) or srt or av
                    out["apn"].append((k, f"parcel roll row apn={av} apn_sort={srt}", fn, sysc))
                fc = (col(x, "Fund Code") or "").strip()
                pc = (col(x, "Project Code") or "").strip()
                if fc:
                    out["fund"].append((fc, col(x, "Fund Description") or "", fn, sysc))
                if pc and pc != "0000000":
                    out["project"].append((pc, col(x, "Project Description") or "", fn, sysc))
            continue
        if fn.endswith(".json") and raw.lstrip().startswith("["):
            arr = json.loads(raw)
            r["rows"] += len(arr)
            for x in arr:
                en = (x.get("MatterEnactmentNumber") or "").strip() if isinstance(x, dict) else ""
                ev = enactment_value(en)
                if ev:
                    out["resord"].append((ev, f"MatterEnactmentNumber {en} of {x.get('MatterFile')} "
                                          f"{x.get('MatterTypeName')}: {(x.get('MatterTitle') or '')[:90]}", fn, sysc))
                text = " ".join(str(x.get(k) or "") for k in ("MatterTitle", "MatterName", "Name", "AttachmentName")) \
                    if isinstance(x, dict) else str(x)
                extract_text(text, fn, sysc, out)
            continue
        extract_text(raw, fn, sysc, out)
    if plant:
        # CONTROL ARM on the real corpus: one shared value planted in two systems, and
        # a leading-zero look-alike planted beside it. The first MUST match; the
        # second MUST NOT.
        extract_text("Resolution No. 99917 C.M.S. and Fund 9917 Plantedcontrol Fund", "PLANT-a", "LEG", out)
        extract_text("pursuant to 99917 CMS; Fund (09917) Plantedcontrol Fund", "PLANT-b", "FIN", out)
    return out, reach

def label_agrees(a, b):
    return bool(words(a) & words(b))

def analyse(out):
    res = {}
    for c in CLASSES:
        by = defaultdict(lambda: defaultdict(list))
        for v, lab, fn, s in out[c]:
            by[v][s].append((lab, fn))
        per_sys = defaultdict(set)
        for v, d in by.items():
            for s in d:
                per_sys[s].add(v)
        shared, value_only, near = [], [], []
        oak = lambda d: [s for s in d if s != "EXT"]
        for v, d in sorted(by.items()):
            ss = oak(d)
            if len(ss) < 2:
                continue
            if c == "fund":
                # a fund code counts only when two systems' LABELS agree on the referent
                pairs = []
                for i, a in enumerate(ss):
                    for b in ss[i + 1:]:
                        for la, fa in d[a]:
                            hit = next(((lb, fb) for lb, fb in d[b] if label_agrees(la, lb)), None)
                            if hit:
                                pairs.append((a, la, fa, b, hit[0], hit[1]))
                                break
                (shared if pairs else value_only).append((v, ss, pairs[:1] or
                    [(ss[0], d[ss[0]][0][0], d[ss[0]][0][1], ss[1], d[ss[1]][0][0], d[ss[1]][0][1])]))
            else:
                a, b = ss[0], ss[1]
                shared.append((v, ss, [(a, d[a][0][0], d[a][0][1], b, d[b][0][0], d[b][0][1])]))
        # CORRECTED by D-453 (2026-09-24): this was a nested scan over every pair of
        # distinct values -- O(n^2). It is unnoticeable on M-119's 31-bundle corpus and
        # does not terminate on a corpus holding the assessor's 394,597-row parcel roll
        # (~1.5e11 comparisons). Grouping by the zero-stripped key is the same relation
        # in one pass. The old code was not WRONG, it was unrunnable at scale, which for
        # an instrument is the same defect.
        groups = defaultdict(list)
        for v in by:
            groups[v.lstrip("0")].append(v)
        for z, vs in groups.items():
            if len(vs) < 2:
                continue
            for v in vs:
                for w in vs:
                    if w != v and len(w) > len(v):
                        near.append((v, w, sorted(by[v]), sorted(by[w])))
        occ = {v: {s: len(x) for s, x in d.items()} for v, d in by.items()}
        res[c] = {"per_sys": per_sys, "shared": shared, "value_only": value_only, "near": near, "occ": occ}
    return res

def report(out, reach, res):
    print("SYSTEMS READ (files, chars, structured rows):")
    for code, desc, _ in SYSTEMS:
        r = reach.get(code)
        if not r:
            print(f"  {code}: NOT IN CORPUS — {desc}")
            continue
        print(f"  {code}: files={r['files']} chars={r['chars']} rows={r['rows']} — {desc}")
        for u in r["unreadable"]:
            print(f"      UNREAD (no text layer / empty shell): {u}")
    for c in CLASSES:
        R = res[c]
        print(f"\nCLASS {c}: occurrences={len(out[c])}")
        for code, _, _ in SYSTEMS:
            if code in reach:
                print(f"  N distinct values in {code}: {len(R['per_sys'].get(code, ()))}")
        print(f"  SHARED (same value, two Oakland systems{', labels agree' if c == 'fund' else ''}): {len(R['shared'])}")
        for v, ss, pr in R["shared"]:
            a, la, fa, b, lb, fb = pr[0]
            print(f"    {v} in {'+'.join(ss)}: {a}[{fa}] «{la[:110]}» || {b}[{fb}] «{lb[:110]}»")
        if R["value_only"]:
            print(f"  VALUE-ONLY (same string, labels do NOT agree — not counted): {len(R['value_only'])}")
            for v, ss, pr in R["value_only"][:12]:
                a, la, fa, b, lb, fb = pr[0]
                print(f"    {v} in {'+'.join(ss)}: «{la[:60]}» vs «{lb[:60]}»")
        if R["near"]:
            print(f"  NEAR-MISS (leading-zero variants, never counted): {len(R['near'])}")
            for v, w, sa, sb in R["near"][:8]:
                print(f"    {v} [{','.join(sa)}] ~ {w} [{','.join(sb)}]")

def selftest():
    """Synthetic negative control. Declared before running:
    MUST match: fund 3100 planted in LEG and FIN with agreeing labels; resolution
    89688 spelled 'C.M.S.' in one system and 'CMS' in the other (over-strictness arm).
    MUST NOT match: fund 3100 against 03100 (leading zero); APN 011-0836-018-00
    against 011-0836-018-01; fund 2010 where one side is a YEAR ('2010 General Fund'
    against '2010 Measure Q Fund' — label disagreement)."""
    out = {c: [] for c in CLASSES}
    extract_text("Sewer Service Fund (3100); Resolution No. 89688 C.M.S.; APN 011-0836-018-00; "
                 "2010 Library Measure Q Fund", "a", "LEG", out)
    extract_text("3100 Sewer Service Fund; per 89688 CMS; Fund (03100) Sewer Service Fund; "
                 "APN 011-0836-018-01; 2010 General Purpose Fund", "b", "FIN", out)
    res = analyse(out)
    got = {c: {v for v, _, _ in res[c]["shared"]} for c in CLASSES}
    near = {c: {(v, w) for v, w, _, _ in res[c]["near"]} for c in CLASSES}
    checks = [
        ("planted fund 3100 MATCHES", "3100" in got["fund"]),
        ("C.M.S. vs CMS spelling MATCHES (over-strictness)", "89688" in got["resord"]),
        # Corrected 2026-09-23 (M-119 arm B): this check first read `"03100" not in got["fund"]`,
        # which cannot fail — a matcher that folds the zero files 03100 UNDER "3100", so the key
        # "03100" never exists. It is asserted on what lands under 3100 instead: FIN wrote 3100
        # exactly once, so a count of 2 means the look-alike was folded in.
        ("03100 does NOT match 3100", res["fund"]["occ"].get("3100", {}).get("FIN") == 1),
        ("03100~3100 printed as NEAR-MISS", ("3100", "03100") in near["fund"]),
        ("APN -00 vs -01 does NOT match", not got["apn"]),
        ("fund 2010 with disagreeing labels does NOT count", "2010" not in got["fund"]),
        # D-453 (2026-09-24), the two new normalisations, each with its over-strictness arm.
        ("enactment field 'NNNNN CMS' normalises (was dropped)", enactment_value("85405 CMS") == "85405"),
        ("enactment field 'NNNNN C.M.S.' normalises", enactment_value("85405 C.M.S.") == "85405"),
        ("enactment field 'CMS NNNNN' normalises", enactment_value("CMS 85405") == "85405"),
        ("a non-enactment field is REFUSED, not coerced", enactment_value("2000-58") is None),
        ("roll form 48-6298-3-2 and padded 048-6298-003-02 are ONE key",
         apn_key("48-6298-3-2") == apn_key("048-6298-003-02") == "048 629800302"),
        ("an absent sub-parcel pads to 00 as the roll writes it",
         apn_key("48-6313-23") == "048 631302300"),
        ("a different sub-parcel is a DIFFERENT key",
         apn_key("48-6298-3-2") != apn_key("48-6298-3-3")),
        ("apn_key REFUSES a string that is not an APN", apn_key("2026-09-24") is None),
        ("a CSV column is found under the export's spelling",
         col({"Fund Code": "3100"}, "Fund Code") == "3100"),
        ("...and under the API's spelling (over-strictness)",
         col({"fund_code": "3100"}, "Fund Code") == "3100"),
        ("an absent column is None, not a coerced empty",
         col({"something_else": "x"}, "Fund Code") is None),
    ]
    ok = all(x for _, x in checks)
    for n, x in checks:
        print(("PASS " if x else "FAIL ") + n)
    print(f"SELFTEST {'GREEN' if ok else 'RED'} {sum(x for _, x in checks)}/{len(checks)}")
    return 0 if ok else 1

if __name__ == "__main__":
    if "--selftest" in sys.argv:
        sys.exit(selftest())
    corpus = sys.argv[1]
    o, r = load(corpus, plant="--plant" in sys.argv)
    total = sum(len(v) for v in o.values())
    assert total > 100, f"corpus yielded {total} occurrences — an empty corpus proves nothing"
    report(o, r, analyse(o))
    print(f"\nTOTAL occurrences {total}")
