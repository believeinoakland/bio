#!/usr/bin/env python3
"""M-157 (D-504) item (3): the new-form project number (100xxxx) sought in the CIP line-item TABLES,
not budget-book prose (M-132 (d) named this as the next measurement).

  M157_DIR=<dir> python3 tools/m157-cip-join.py fetch   # CIP PDFs from cao-94612 -> text + provenance
  M157_DIR=<dir> python3 tools/m157-cip-join.py join    # needs <dir>/corpus/0200-leg-matters-all.json
  python3 tools/m157-cip-join.py --selftest             # the planted-join control (synthetic)

WHY A SECOND MATCHER. tools/m119-idspace.py's project pattern catches a 100xxxx value only after a
"Project No."/"Project #" cue; a CIP table writes the number bare in a column, so that pattern cannot
see a table at all (which is why M-132 found 9 FIN values in 3,148 pages). This one reads the bare
7-digit form 100dddd -- and so ALSO sees any bare 7-digit amount or count beginning 100. It cannot
tell those apart by pattern; it therefore prints each shared value's CIP line and Legistar title so
the referent is read, and it counts a value as SHARED only when found on both sides.

What it cannot see: a scanned page with no text layer (per-file chars are printed); a number split
across a line break by extraction; a C-form<->new-form crosswalk that is not written on one line.
"""
import hashlib, json, os, re, sys, time, urllib.request

D = os.environ.get("M157_DIR", os.getcwd())
UA = "BIO-CivicOS-measurement/1.0 (civic records research)"
BASE = "https://cao-94612.s3.us-west-2.amazonaws.com/"
SEL = [
    ("0302-cip-fy1921-program", "documents/FY-2019-21-Capital-Improvement-Program.pdf"),
    ("0302-cip-fy2123-adopted", "documents/FY-21-23-Adopted-CIP-Book-7.28.22.pdf"),
    ("0302-cip-fy2325-adopted", "documents/FY23-25-Adopted-CIP_07.09.2024.pdf"),
    ("0302-cip-fy2527-proposed", "documents/FY25-27-Proposed-CIP-Budget_05.05.2025_Reduced.pdf"),
    ("0302-cip-bydistrict-2021", "documents/CIP-Projects-By-Council-District_21-0513-1.pdf"),
    ("0302-kk-projects-2023", "documents/Attachment-D-List-of-all-Measure-KK-Funded-Facilities-Projects-by-Tranche-and-Phase-as-of-June-30-2023.pdf"),
]
# Corrected during M-157: the lookahead first read (?![\d,]), which let a SUFFIXED value through --
# Legistar's "1003439A" (Fire Station #12, a sub-project) joined the CIP's "1003439" as if the same string.
# A letter suffix makes a different identifier; it is now refused here and reported as SUFFIXED below.
NEW = re.compile(r"(?<![\dA-Za-z,.$])(100\d{4})(?![\dA-Za-z,])")
SUFFIXED = re.compile(r"(?<![\dA-Za-z,.$])(100\d{4})([A-Za-z])\b")
CUE = re.compile(r"(?i)\bproject\s*(?:no\.?|number|#|code|id)?\s*:?\s*\(?(100\d{4})\b")
CFORM = re.compile(r"\b([CP]\d{5,6})\b")


def fetch():
    from pypdf import PdfReader
    raw, out = os.path.join(D, "raw"), os.path.join(D, "cip")
    os.makedirs(raw, exist_ok=True); os.makedirs(out, exist_ok=True)
    prov = []
    for tag, key in SEL:
        rec = {"tag": tag, "key": key, "fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
        try:
            with urllib.request.urlopen(urllib.request.Request(BASE + key, headers={"User-Agent": UA}), timeout=600) as r:
                rec["http"] = r.status; body = r.read()
        except Exception as e:
            rec["http"] = f"ERROR {e}"; prov.append(rec); sys.stderr.write(f"{tag}: {rec['http']}\n"); continue
        dst = os.path.join(raw, tag + ".pdf"); open(dst, "wb").write(body)
        rec.update(bytes=len(body), sha256=hashlib.sha256(body).hexdigest())
        rd = PdfReader(dst); pages, fails, chunks = len(rd.pages), 0, []
        for p in rd.pages:
            try: chunks.append(p.extract_text() or "")
            except Exception: fails += 1; chunks.append("")
        text = "\n".join(chunks); open(os.path.join(out, tag + ".txt"), "w").write(text)
        rec.update(pages=pages, page_failures=fails, chars=len(text)); prov.append(rec)
        sys.stderr.write(f"{tag}: http={rec['http']} bytes={rec['bytes']} pages={pages} fails={fails} chars={len(text)}\n")
        json.dump(prov, open(os.path.join(D, "cip-provenance.json"), "w"), indent=1)
        time.sleep(2)


def extract_cip(texts):
    """texts: {tag: text} -> {value: [(tag, line)]}; bare new-form values on each line."""
    got = {}
    for tag, t in texts.items():
        for line in t.splitlines():
            for m in NEW.finditer(line):
                got.setdefault(m.group(1), []).append((tag, line.strip()[:160]))
    return got


def extract_leg(matters):
    bare, cued, cform = {}, {}, {}
    for r in matters:
        t = " ".join(str(r.get(k) or "") for k in ("MatterTitle", "MatterName"))
        ref = (r.get("MatterFile"), (r.get("MatterIntroDate") or "")[:10], (r.get("MatterTitle") or "")[:200])
        for m in NEW.finditer(t): bare.setdefault(m.group(1), []).append(ref)
        for m in CUE.finditer(t): cued.setdefault(m.group(1), []).append(ref)
        for m in CFORM.finditer(t): cform.setdefault(m.group(1), []).append(ref)
    return bare, cued, cform


def join(cip, bare, cued):
    return sorted(set(cip) & set(bare)), sorted(set(cip) & set(cued))


def selftest():
    cip = extract_cip({"T": "1009901 Planted Control Project  $250,000\n"
                            "Total 1,009,902 and $1009903 are amounts\n1009904 CIP-only project\n"
                            "10099050 eight digits\n1009907 CIP parent\n"})
    leg = [{"MatterFile": "NC-1", "MatterTitle": "Resolution for the Planted Control Project (Project No. 1009901)"},
           {"MatterFile": "NC-2", "MatterTitle": "Legistar-only project (Project No. 1009906) and 1,009,902 dollars"},
           {"MatterFile": "NC-3", "MatterTitle": "Sub-project (No. 1009907A) of a CIP parent"}]
    bare, cued, _ = extract_leg(leg)
    s_bare, s_cued = join(cip, bare, cued)
    arms = [("planted 1009901 SHARED (bare)", s_bare == ["1009901"]),
            ("planted 1009901 SHARED (cued)", s_cued == ["1009901"]),
            ("comma amount 1,009,902 NOT extracted", "1009902" not in cip and "1009902" not in bare),
            ("$-prefixed 1009903 NOT extracted", "1009903" not in cip),
            ("CIP-only 1009904 NOT shared", "1009904" in cip and "1009904" not in s_bare),
            ("LEG-only 1009906 NOT shared", "1009906" in cued and "1009906" not in s_cued),
            ("suffixed 1009907A NOT joined to 1009907", "1009907" not in s_bare and "1009907" in cip),
            ("eight digits NOT extracted", not any(v.startswith("100990") and v not in ("1009901", "1009904", "1009907") for v in cip))]
    for n, ok in arms: print(("PASS " if ok else "FAIL ") + n)
    ok = all(a[1] for a in arms)
    print(f"SELFTEST {'GREEN' if ok else 'RED'} {sum(a[1] for a in arms)}/{len(arms)}")
    return 0 if ok else 1


def main():
    if "--selftest" in sys.argv: sys.exit(selftest())
    if "fetch" in sys.argv: return fetch()
    cdir = os.path.join(D, "cip")
    texts = {f[:-4]: open(os.path.join(cdir, f)).read() for f in sorted(os.listdir(cdir)) if f.endswith(".txt")}
    matters = json.load(open(os.path.join(D, "corpus/0200-leg-matters-all.json")))
    assert len(matters) > 1000 and texts, "empty corpus proves nothing"
    cip = extract_cip(texts)
    bare, cued, cform = extract_leg(matters)
    s_bare, s_cued = join(cip, bare, cued)
    print(f"CORPUS: {len(texts)} CIP texts, {sum(len(t) for t in texts.values())} chars; {len(matters)} Legistar matters")
    for tag, t in texts.items():
        vs = {v for v, occ in cip.items() for (g, _) in occ if g == tag}
        print(f"  {tag}: chars {len(t)} · distinct new-form {len(vs)}")
    print(f"CIP distinct new-form (bare): {len(cip)}")
    print(f"LEG distinct new-form: bare {len(bare)} · cued (a Project-No.-style cue; close to, NOT identical with, M-119's pattern) {len(cued)}")
    print(f"SHARED CIP<->LEG: vs bare {len(s_bare)} · vs cued {len(s_cued)}")
    for v in s_bare:
        tag, line = cip[v][0]
        f, dt, ti = bare[v][0]
        print(f"  {v} | CIP {tag}: «{line[:110]}»\n          | LEG {f} ({dt}): «{ti[:150]}»")
    # crosswalk candidates: a CIP line carrying BOTH a C/P-form and a new-form value
    xw = []
    for tag, t in texts.items():
        for line in t.splitlines():
            if NEW.search(line) and CFORM.search(line):
                xw.append((tag, line.strip()[:160]))
    suf = {}
    for r in matters:
        for m in SUFFIXED.finditer(r.get("MatterTitle") or ""):
            if m.group(1) in cip: suf.setdefault(m.group(1) + m.group(2), r.get("MatterFile"))
    print(f"SUFFIXED LEG values whose base is a CIP value (NOT counted as shared): {len(suf)} {sorted(suf.items())}")
    print(f"CROSSWALK CANDIDATES (a CIP line with both forms): {len(xw)}")
    for tag, line in xw[:40]: print(f"  {tag}: «{line}»")
    json.dump({"cip": cip, "shared_bare": s_bare, "shared_cued": s_cued, "xw": xw},
              open(os.path.join(D, "cip-join.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
