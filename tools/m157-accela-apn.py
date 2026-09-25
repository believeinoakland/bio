#!/usr/bin/env python3
"""M-157 (D-504) item (1): APN <-> permit, the half of M-132 scope (c) that Accela held.

  M157_DIR=<dir> python3 tools/m157-accela-apn.py probe <parcel-no> [<parcel-no> ...]   # one search each, printed
  M157_DIR=<dir> python3 tools/m157-accela-apn.py join                                  # every Legistar APN key

Drives Oakland's Accela Citizen Access (aca-prod.accela.com/OAKLAND, the city's own permit system per its
SB 272 catalogue, M-132 (b)) the way a browser does: GET the Building module's record search, carry the
ASP.NET form state it hands back (__VIEWSTATE and every hidden field), fill ONE field, "Parcel No.", and post
the page's own Search button (`ctl00$PlaceHolderMain$btnNewSearch`). Anonymous; nothing is submitted but a
search; one request at a time, 2.0s between searches, the project's identifying User-Agent.

WHAT IS COUNTED. A search answers one of: a result grid (records, counted from the grid's rows and its
"Showing 1-N of M" line where present), a single record opened directly (one match), or a stated "no
records" message. Anything else is recorded as UNREAD with the page's title -- never as zero. The grid's
record numbers and addresses are kept so the referent can be read.

What it cannot see: modules other than Building unless cross-module search is on (it is left as the page
defaults it); records Accela does not expose to anonymous search; a parcel number Accela spells differently
from the forms tried (the probe arm measures which forms it accepts before the join uses one).
"""
import html, http.cookiejar, json, os, re, sys, time, urllib.parse, urllib.request

D = os.environ.get("M157_DIR", os.getcwd())
UA = "BIO-CivicOS-measurement/1.0 (civic records research)"
BASE = "https://aca-prod.accela.com/OAKLAND/Cap/CapHome.aspx?module=Building&TabName=Building"
FIELD = "ctl00$PlaceHolderMain$generalSearchForm$txtGSParcelNo"
BUTTON = "ctl00$PlaceHolderMain$btnNewSearch"
INPUT = re.compile(r"<input\b[^>]*>", re.I)
ATTR = lambda tag, a: (re.search(a + r'="([^"]*)"', tag) or [None, None])[1]


def opener():
    cj = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))


def fetch(op, url, data=None):
    req = urllib.request.Request(url, data=data, headers={"User-Agent": UA,
                                 **({"Content-Type": "application/x-www-form-urlencoded",
                                     # Accela refuses a POST without them ("Potential cross-site request forgery
                                     # attacks. The Referer and Origin headers are missing", measured 01:21Z);
                                     # a browser sends both, naming the page's own origin
                                     "Referer": url, "Origin": "https://aca-prod.accela.com"} if data else {})})
    with op.open(req, timeout=90) as r:
        return r.status, r.geturl(), r.read().decode("utf-8", "replace")


def form_state(page):
    st = {}
    for tag in INPUT.findall(page):
        n, t = ATTR(tag, "name"), (ATTR(tag, "type") or "text").lower()
        if not n or t in ("submit", "button", "image", "checkbox", "radio"):
            continue
        st[n] = html.unescape(ATTR(tag, "value") or "")
    # a <select> posts its selected option (else its first); omitting them is what a browser never does
    for m in re.finditer(r'<select\b[^>]*name="([^"]+)"[^>]*>(.*?)</select>', page, re.S | re.I):
        opts = re.findall(r'<option\b([^>]*)value="([^"]*)"', m.group(2))
        sel = [v for a, v in opts if "selected" in a] or [v for _, v in opts[:1]]
        if sel:
            st[m.group(1)] = html.unescape(sel[0])
    return st


def read_result(page):
    title = (re.search(r"<title>(.*?)</title>", page, re.S | re.I) or [None, ""])[1].strip()
    recs = re.findall(r'<span id="ctl00_PlaceHolderMain_dgvPermitList_gdvPermitList_ctl\d+_lblPermitNumber1?"[^>]*>([^<]+)</span>', page)
    addrs = re.findall(r'<span id="ctl00_PlaceHolderMain_dgvPermitList_gdvPermitList_ctl\d+_lblAddress"[^>]*>([^<]*)</span>', page)
    total = re.search(r"Showing\s+\d+-\d+\s+of\s+([\d,]+\+?)", page)
    if recs:
        return {"state": "GRID", "total": total.group(1) if total else str(len(recs)), "records": recs[:10], "addresses": [html.unescape(a) for a in addrs[:10]]}
    # A search that matches ONE record opens it (CapDetail.aspx) instead of a grid. Corrected during M-157:
    # this test first ran AFTER a loose "no records" pattern, which a record's detail page satisfied, so a
    # one-record answer was scored NONE (measured on "008061900401" -> BW25002087, 01:22Z). SINGLE is tested
    # first, and NONE is only the page's own notice, verbatim.
    rid = re.search(r'id="ctl00_PlaceHolderMain_lblPermitNumber"[^>]*>([^<]+)<', page)
    if rid:
        return {"state": "SINGLE", "total": "1", "records": [html.unescape(rid.group(1)).strip()]}
    if "Your search returned no results" in page:
        return {"state": "NONE", "total": "0"}
    return {"state": "UNREAD", "title": title[:120]}


START = "ctl00$PlaceHolderMain$generalSearchForm$txtGSStartDate"
# The page DEFAULTS its date window to the last ten years (measured 01:22Z: 09/23/2016-09/24/2026), so a
# search left at the default is a search of a decade, not of the record. Widened to the earliest date the
# form accepts a value for; the window used is printed with every result.
START_DATE = os.environ.get("M157_ACCELA_START", "01/01/1900")


def search(op, parcel, extra=None):
    _, _, page = fetch(op, BASE)
    st = form_state(page)
    if FIELD not in st:
        return {"state": "UNREAD", "title": "search form lacks the Parcel No. field"}
    st[FIELD] = parcel
    st[START] = START_DATE
    st.update(extra or {})
    st["__EVENTTARGET"], st["__EVENTARGUMENT"] = BUTTON, ""
    code, url, out = fetch(op, BASE, urllib.parse.urlencode(st).encode())
    if os.environ.get("M157_KEEP"):
        open(os.path.join(D, "accela", "last.html"), "w").write(out)
    r = read_result(out)
    r.update(http=code, final_url=url.split("?")[0].rsplit("/", 1)[-1], parcel=parcel, window_start=st[START])
    return r


def main():
    op = opener()
    if sys.argv[1:2] == ["probe"]:
        for p in sys.argv[2:]:
            extra = dict(kv.split("=", 1) for kv in p.split("&")[1:]) if "&" in p else None
            print(json.dumps(search(op, p.split("&")[0], extra)))
            time.sleep(2.0)
        return
    if sys.argv[1:2] == ["join"]:
        v = json.load(open(os.path.join(D, "apn-vintage.json")))
        out = {}
        keys = sorted(v["leg"])
        for i, k in enumerate(keys):
            b, pg, pc, sb = k.split("-")
            # Accela reads the ASSESSOR'S SORT spelling: measured 01:22Z on 300 Frank H Ogawa Plz, "008 061900401"
            # answers 200+ records (the same grid its address search gives), the printed "8-619-4-1" answers 2,
            # Legistar's padded "008-0619-004-01" answers 0 and the unspaced "008061900401" answers 1.
            form = f"{b.zfill(3)} {int(pg):04d}{pc.zfill(3)}{int(sb):02d}"
            r = search(op, form)
            r.update(key=k, leg=v["leg"][k][0], in_current=v["res"][k]["in_current"],
                     in_2012=v["res"][k]["in_2012_snapshot"])
            out[k] = r
            sys.stderr.write(f"{i+1}/{len(keys)} {form} {r['state']} {r.get('total','')}\n"); sys.stderr.flush()
            json.dump(out, open(os.path.join(D, "accela-join.json"), "w"), indent=1)
            time.sleep(2.0)
        return
    sys.exit("usage: probe <parcel>... | join")


if __name__ == "__main__":
    main()
