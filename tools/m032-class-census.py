#!/usr/bin/env python3
# INSTRUMENT — M0-32, the census of DOCUMENT CLASSES over COFF-6's corpus
# (2026-09-14, session m032-class-census). Commits no product code; this is the
# probe that produced the MEASUREMENTS.md entry named in the header of `derive`.
# `EXTRACTION-BREADTH-DESIGN.md` §7 row 1 is the scope; §2 is the decision it feeds.
#
# THE CORPUS IS NOT RE-DEFINED HERE. `tools/measure-office-corpus.py` is COFF-6's
# own probe and already holds this corpus's definition; CAP-7 extended that file
# rather than standing a second tool beside it (M-13, 2026-09-14). This file is a
# SECOND TOOL because the spawn brief asked for a census script named for the item,
# and it pays that debt by IMPORTING the population — `_bucket_keys`, `_get`, and
# the Legistar matter shape — instead of copying it. If the corpus moves, it moves
# in one file and this one follows.
#
# Modes:
#   list                  — re-list the population (bucket keys + Legistar
#                           attachments, with each matter's MatterTypeName) into
#                           .m032-pen/population.jsonl. Network, paced.
#   names                 — classify EVERY population item by NAME evidence alone.
#                           No network. A CENSUS: every item lands in exactly one
#                           bucket and the buckets sum to the corpus.
#   bodies [n]            — fetch and classify a fixed-seed random sample of n
#                           TEXT-BEARING items by BODY evidence. Network, paced;
#                           bodies are streamed and deleted, peak disk is one file.
#                           RESUMABLE, and the sample order is shuffled BEFORE it is
#                           walked, so any prefix that completes is itself a uniform
#                           random sample of the stratum rather than a biased head.
#   media [n]             — bound the census's largest blind spot: sample n image
#                           keys and report how many carry PAGE-SHAPED dimensions
#                           (a scan) rather than photo/graphic shape. Network, paced.
#   derive                — every derived figure, read back out of the logs. No
#                           network, runs in a second, so each number in
#                           MEASUREMENTS.md is traceable to a line.
#   classhash             — FW-22. The sha256 of the CLASSIFICATION PATH alone, read
#                           out of the AST, so "the thresholds did not move" is a
#                           digest rather than a reading of the edit history.
#   control               — NEGATIVE CONTROLS, exits 1 on any mismatch. No network.
#                           Includes the CONSERVATION arm and the NEUTERING arm the
#                           M0-32 queue row demands.
#   readsample [k] [m] [s]— D-66. A: a fixed-seed draw of k documents the body sample
#                           judged budget_dataset, re-read, with what each HOLDS.
#                           B: a fixed-seed draw of m spreadsheet keys (seed s+1) run
#                           through the PLANE's format registry (`d66-office-read.mjs`).
#
# D-66 (2026-09-24, BREADTH §2 row 5) ADDED A SIXTH CLASS, `budget_dataset`, and
# three things beside it, each stated at its site: `text_in_xlsx` (a workbook read as
# rows, values included — the generic OOXML walk dropped every number); the dataset
# arm asked of a body the PROSE gate refuses (`judge`); and escalation of an
# unreadable PDF to the PLANE's reader (`plane_text`, FW-20's instrument unchanged),
# with this instrument's own tier-1 verdict kept beside it (`classes_t1`) so the
# M-18 comparison survives. `M032_PLANE=0` reproduces M-18's reader exactly.
# Figures: `docs/development/measurements/M-126.md`.
#
# NEGATIVE CONTROL: (D-66, 2026-09-24, instrument sha 89cd305c… before each arm,
#   restored by cp and verified by sha256 AND cmp, 109,241 bytes) — N1: money density
#   made unnecessary for the budget arm -> `control` exit 1 at exactly "a memo ABOUT the
#   budget ... is NOT budget_dataset — money density is necessary" (1 of 53). N2: commas
#   read as cells in ANY body, not only a CSV by signature -> exit 1 at exactly "a
#   thousands separator is not a delimiter ..." (1 of 53); DECLARED to fail the
#   comma-prose arm too and it did NOT — that arm is fenced twice (signature + exact
#   comma width), a finding about the arm, recorded rather than smoothed. N4 (liveness
#   only, TWO variables moved on purpose): both fences off -> both arms fail by name.
#   N5 (the row's liar, on a COPY of the recorded 1,000): budget_dataset taken from the
#   FILENAME (30 rows changed) -> exit 1 at the declared "ON THE REAL SAMPLE the body
#   count and the name count DIFFER" (body 20, name 20, both 20), AND at two ARM 5
#   neutering arms not declared (6 filename-counted documents had unreadable bodies).
#   The real record: body 18, name 20, both 4 — 85 arms, 0 failed. See M-126.
#
# FW-22 (2026-09-24, BOB #32) ADDED A SEVENTH CLASS, `financial_report`, and put its
# predicate INSIDE the budget type: an ACFR/CAFR or an agency's audited statements is
# not a budget, so `budget_arm` requires `not is_financial_report`, with
# `budget_arm_d66` kept beside it as the baseline the recount is measured against.
# Also: `M032_HALVES` (the recount must be of D-66's sample, so the Legistar half,
# reachable again today and absent from D-66's population, is excluded by name);
# `classhash` (the digest of the classification path, the claim M-126 could not make);
# read sample half C (the new class, read). Figures:
# `docs/development/measurements/M-143.md`.
#
# NEGATIVE CONTROL: (FW-22, 2026-09-24; instrument FROZEN at sha 80d76f6d... 19:13:20Z
#   BEFORE the 1,000-document walk, which loaded that file at start; classification
#   path `161d2ff9...` (38 defs, 26,117 B) IDENTICAL in the frozen file and in this
#   one, by `classhash`, so the post-walk additions provably moved no threshold.
#   Restored by cp from uniquely-named per-arm pristine copies, verified by sha256 AND
#   cmp, 137,263 bytes, floored at 100,000. Baseline 110 arms, 0 failed.) —
#   N1, THE ROW'S ARM: BOB #32's conjunct folded back into budget in the RE-DERIVATION
#   the recount is computed from (`_fw22_budget`) -> exit 1 at exactly "ON THE REAL
#   SAMPLE the RECOUNT MOVES: at least one document D-66 counted as budget_dataset is
#   an audited financial statement and is now counted apart" (1 of 110), and nothing
#   else. N2: the same conjunct folded back in the RECOGNISER (`budget_arm`) -> exit 1
#   at exactly "...and is NOT budget_dataset - BOB #32's exclusion" (1 of 110), leaving
#   ARM 1's planted financial_report, ARM 5's neutering arms and N1's real-sample arm
#   untouched, as declared: that arm reads the RECORDED families and cannot see a
#   recogniser edit. UNPLANNED AND KEPT: `classhash` told the two arms apart — N1 left
#   the digest at 161d2ff9..., N2 moved it to 7e311aa6... . Restored: 110 arms, 0
#   failed, exit 0. TWO DEFECTS THE ARMS FOUND BEFORE THE FREEZE, both now standing
#   arms: `[ac]afr` matches cafr and aafr and NEVER ACFR (the spelling Oakland has
#   used since FY2021); and an arm written `'<family>' in fams[c]` tested a DICT's
#   KEYS, reporting families that never fired and unable to fail.
#
# FW-24 (2026-09-25) RAN THE CENSUS OVER THE WHOLE CORPUS, both halves named
# (`M032_HALVES=bucket,legistar`, the same population as unset): 2,000 of 29,607
# text-bearing items, seed 20260924, a NEW draw. Classification path unchanged
# (`161d2ff9...`); one `derive` print corrected (the paired header's literal 600).
# Figures: `docs/development/measurements/M-176.md`.
#
# NEGATIVE CONTROL: (FW-24, 2026-09-25, instrument sha d7434895... before the arm,
#   restored by cp from a uniquely-named pristine copy, verified by sha256 AND cmp,
#   145,557 bytes, floored at 100,000. Baseline on the whole-corpus sample 110 arms,
#   0 failed.) N1 re-driven on that sample: BOB #32's conjunct folded back into
#   `_fw22_budget` -> exit 1 at exactly "ON THE REAL SAMPLE the RECOUNT MOVES ..."
#   (1 of 110), and `derive` prints the recounted budget arm at 20 not 14 with the six
#   named financial reports gone from the moved list. Restored: 110 arms, 0 failed.
#
# WHAT A CLASS IS, AND WHY IT IS NOT A LIST OF SPELLINGS. Each class is defined by
# what makes a document that class IN PRINCIPLE, and the recogniser implements the
# principle as a THRESHOLD OVER INDEPENDENT EVIDENCE FAMILIES — never one literal.
# A document must satisfy a class's stated threshold; the families that fired are
# recorded per document, so every count is auditable back to its evidence.
#
#   agenda        — issued BEFORE a meeting, it lists what a body WILL take up.
#                   Families: self-naming in the masthead · a prospective meeting
#                   block (body + date + time + place) · the order-of-business spine
#                   (call to order / roll call / public comment / adjournment) ·
#                   numbered items in the prospective voice.
#   minutes       — issued AFTER a meeting, it records what a body DID.
#                   Families: self-naming in the masthead · outcome language (moved
#                   / seconded / ayes / noes / motion carried) · the retrospective
#                   frame (called to order at H:MM ... adjourned at H:MM) ·
#                   an attendance roster (present: / absent:).
#   staff_report  — written BY staff TO a body, recommending an action.
#                   Families: a memorandum header (TO/FROM/SUBJECT/DATE) · a
#                   recommendation section · the agenda-report template's headings
#                   (executive summary / background / analysis / fiscal impact /
#                   public outreach / coordination / action requested) · addressed
#                   to the body by its formal style.
#   ordinance_res — an instrument of law, enacted or proposed.
#                   Families: an enacting formula (BE IT ORDAINED / RESOLVED) · a
#                   recital chain (two or more WHEREAS clauses) · an instrument
#                   number (ORDINANCE/RESOLUTION NO. ... C.M.S.) · codification
#                   language (section ... is hereby amended / repealed).
#   directory     — its BODY IS a roster of people or offices with contact points.
#                   Families: contact-point DENSITY (a count and a rate, not a
#                   word) · a roster shape (many short lines, little narrative) ·
#                   self-naming (directory / roster / contact list).
#   financial_report
#                 — it REPORTS THE ACTUALS of a period that has ENDED, on an
#                   auditor's authority: an ACFR/CAFR, an agency's audited
#                   statements, a single-audit report. Families: self-naming in a
#                   title line · an auditor's opinion · the audited-statement spine
#                   (the GAAP statements, the notes, MD&A, RSI) · a period that has
#                   ENDED. **BOB #32 ruled on 2026-09-24 that the BUDGET type does
#                   not admit these** (`EXTRACTION-BREADTH-DESIGN.md` §2 row 5): a
#                   budget is a PLAN for money not yet spent and a statement reports
#                   what was, so they are a separate type, counted apart.
#   other         — usable text was read and NO class threshold was met. A positive
#                   finding about a readable document.
#   UNCLASSIFIED  — no usable evidence was obtained. NEVER folded into `other`, and
#                   always broken out BY REASON, each reason named.
#
# A document may satisfy TWO thresholds — an agenda packet carries its own staff
# reports and resolutions. Such a document is reported as MULTI-CLASS, counted once
# in the conservation identity and listed by the combination it matched. It is never
# silently added to both class totals.

import sys, os, io, re, json, time, zipfile, zlib, random, collections, struct
import importlib.util
import urllib.request, urllib.parse
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
PEN = os.environ.get('M032_PEN', os.path.join(os.getcwd(), '.m032-pen'))
# D-66: `M032_PLANE=0` reproduces M-18's reader exactly (no escalation to the plane).
PLANE = os.environ.get('M032_PLANE', '1') != '0'


def _office():
    """COFF-6's probe, loaded by path — the corpus definition lives THERE."""
    p = os.path.join(HERE, 'measure-office-corpus.py')
    spec = importlib.util.spec_from_file_location('m032_office_probe', p)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# ---------------------------------------------------------------------------
# THE POPULATION STRATA — by declared media kind, because 43,283 keys cannot all
# be fetched. `media` is the stratum this census does NOT classify; its size is
# printed every run and the `media` mode bounds what is hiding inside it.
# ---------------------------------------------------------------------------
TEXT_EXT = {'pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'pptm', 'docm',
            'xlsm', 'csv', 'html', 'htm', 'rtf', 'txt', 'odt', 'ods', 'odp', 'xml'}
IMAGE_EXT = {'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'tif', 'tiff',
             'bmp', 'heic', 'jp2', 'ico'}
AV_EXT = {'mp4', 'mp3', 'm4a', 'wmv', 'avi', 'mov', 'wav', 'mpg', 'mpeg', 'webm'}
ARCHIVE_EXT = {'zip', 'gz', 'tar', 'rar', '7z'}

CLASSES = ['agenda', 'minutes', 'staff_report', 'ordinance_res', 'directory',
           'budget_dataset',      # D-66 (2026-09-24): Bob's fifth named type
           'financial_report']    # FW-22 (2026-09-24, BOB #32): counted APART from it


def ext_of(key):
    n = key.rsplit('/', 1)[-1]
    e = n.rsplit('.', 1)[-1].lower() if '.' in n else ''
    return e if len(e) <= 5 else ''


def stratum_of(key):
    e = ext_of(key)
    if e in TEXT_EXT:
        return 'text-bearing'
    if e in IMAGE_EXT:
        return 'media · image'
    if e in AV_EXT:
        return 'media · audio/video'
    if e in ARCHIVE_EXT:
        return 'container · archive'
    return 'unknown media kind'


# ---------------------------------------------------------------------------
# TEXT — what each container yields, and an HONEST `usable` verdict. A document
# whose bytes we hold but whose text we cannot read is UNCLASSIFIED WITH A REASON,
# never `other` and never scored zero against a class.
# ---------------------------------------------------------------------------
# A PDF string is only TEXT when a text-showing operator shows it. The first draft
# of this reader took every `(...)` byte-run in any stream that merely CONTAINED
# `Tj`, and on the first thirteen documents of the real sample it produced up to
# 24.5 MB of binary garbage for a single 40-page report — every one of which the
# function-word test in `usable()` then refused. The refusal was correct and is why
# nothing was mis-scored, but the extraction was wrong, so it is anchored here to
# the operators that actually paint glyphs: `Tj` `'` `"` for a single string and
# `TJ` for an array of them.
# Line structure matters: the title-line and memorandum-header families cannot see a
# masthead in one undifferentiated run of words. A PDF's painting operators carry no
# line breaks, so the cursor-moving operators (`Td` `TD` `T*` `ET`) are read as the
# line breaks they visually are. This is approximate — it is the structure a tier-1
# reader can recover — and it is why the roster-shape family is RECORDED but is
# deliberately NOT part of the `directory` threshold.
# The tokens are found by three INDEPENDENT linear scans and then joined by
# position. An earlier draft expressed the same rule as one regex with a nested
# alternation inside the `TJ` array (`(?: \(...\) | <...> | [^][] )*`), whose
# branches all matched a single ordinary byte — classic catastrophic backtracking.
# On the first real PDF it did not finish in five minutes. Three linear scans and a
# bisect cannot backtrack at all, which is the point.
_LIT = re.compile(rb'\((?:\\.|[^()\\])*\)', re.S)
_SHOW_OP = re.compile(rb"(?:TJ|Tj|'|\")")
_BRK_OP = re.compile(rb'(?:T\*|ET|TD|Td)')
_ESC_OCT = re.compile(rb'\\([0-7]{1,3})')
SHOW_WINDOW = 1200      # a literal is TEXT when a painting operator follows within


def _unescape(s):
    s = re.sub(rb'\\[nrtbf]', b' ', s)
    s = _ESC_OCT.sub(lambda g: bytes([int(g.group(1), 8) & 0xFF]), s)
    return re.sub(rb'\\(.)', lambda g: g.group(1), s)


def _pdf_strings(buf):
    import bisect
    shows = [m.start() for m in _SHOW_OP.finditer(buf)]
    if not shows:
        return []
    brks = [m.start() for m in _BRK_OP.finditer(buf)]
    out, prev_end = [], 0
    for lit in _LIT.finditer(buf):
        a, b = lit.start(), lit.end()
        i = bisect.bisect_left(shows, b)
        if i >= len(shows) or shows[i] - b > SHOW_WINDOW:
            continue                      # a byte-run in an image or font stream
        j = bisect.bisect_left(brks, prev_end)
        if j < len(brks) and brks[j] < a and out and out[-1] != b'\n':
            out.append(b'\n')
        out.append(_unescape(lit.group(0)[1:-1]))
        prev_end = b
    return out


def text_in_pdf(data, inflate_budget=200_000_000, text_cap=4_000_000):
    """Text a PDF carries in its content streams — the strings its text-showing
    operators paint. A tier-1 reader by construction: it CANNOT read a scan with no
    text layer, and it cannot resolve a subsetted font's custom encoding (the bytes
    are glyph indices, not characters). Both come back failing `usable()` and are
    reported as unclassified WITH THAT REASON, never as a confident zero."""
    parts, spent, got = [], 0, 0
    for m in re.finditer(rb'stream\r?\n', data):
        if spent > inflate_budget or got > text_cap:
            break
        end = data.find(b'endstream', m.end())
        if end < 0:
            continue
        raw = data[m.end():end]
        try:
            dec = zlib.decompressobj().decompress(raw)
        except Exception:
            dec = b''
        if not dec:
            # An UNCOMPRESSED content stream is legal and some generators emit one.
            # It is admitted only when the bytes LOOK like a content stream — an
            # earlier draft admitted any raw stream that happened to contain `Tj`,
            # which let a compressed image's bytes through as "text".
            head = raw[:4000]
            printable = sum(32 <= b < 127 or b in (9, 10, 13) for b in head)
            if head and printable / len(head) > 0.9 and (b'Tj' in raw or b'TJ' in raw):
                dec = raw
        if not dec:
            continue
        spent += len(dec)
        if b'Tj' not in dec and b'TJ' not in dec:
            continue
        got_parts = _pdf_strings(dec)
        got += sum(len(p) for p in got_parts)
        parts += got_parts
        # The painting operators carry no line breaks; `Td`/`TD`/`T*`/`ET` move the
        # cursor, and a newline per text object is what lets the roster-shape and
        # title-line families see a document's lines at all.
        parts.append(b'\n')
    # Joined with NOTHING, deliberately. A kerned line is painted as a TJ array of
    # many short runs — often one glyph each — so joining the runs with a space
    # turns "OAKLAND" into "O A K L A ND" and no word-based family can see it. The
    # spaces that belong to the text are inside the strings the PDF already paints.
    txt = b''.join(parts).decode('latin-1', 'replace')
    if txt.count('\x00') > len(txt) / 4:                 # UTF-16BE-ish glyph text
        txt = txt.replace('\x00', '')
    return txt


def _col_index(ref):
    """`AB12` -> 27 (0-based column). A cell with no ref sits after the last."""
    n = 0
    for ch in ref:
        if not ch.isalpha():
            break
        n = n * 26 + (ord(ch.upper()) - 64)
    return n - 1


def text_in_xlsx(z):
    """D-66 (2026-09-24). A workbook read as ROWS: one line per `<row>`, its cells
    joined by TAB in column order, VALUES INCLUDED. The generic OOXML walk below
    read only `<t>` elements — the shared-string table and inline strings — so a
    NUMBER, which a sheet stores as `<v>`, never reached the text at all, and a
    workbook arrived as an undifferentiated run of its column headings. A dataset
    judged from that body would be judged from its labels alone. `norm()` folds
    the tabs back to spaces, so the M0-32 families see the same words they always
    did plus the numbers; only the budget-or-dataset family reads the tabs."""
    names = z.namelist()
    shared = []
    if 'xl/sharedStrings.xml' in names:
        try:
            cur = None
            for ev, el in ET.iterparse(io.BytesIO(z.read('xl/sharedStrings.xml')),
                                       events=('start', 'end')):
                tag = el.tag.rsplit('}', 1)[-1]
                if ev == 'start' and tag == 'si':
                    cur = []
                elif ev == 'end' and tag == 't' and cur is not None:
                    cur.append(el.text or '')
                elif ev == 'end' and tag == 'si':
                    shared.append(''.join(cur or []))
                    cur = None
                    el.clear()
        except ET.ParseError:
            pass
    sheets = sorted((n for n in names if re.match(r'xl/worksheets/sheet\d+\.xml$', n)),
                    key=lambda s: int(re.search(r'(\d+)\.xml$', s).group(1)))
    out = []
    for sh in sheets:
        at = len(out)
        out.append('')
        ncell = nform = 0
        try:
            row, ctype, cref, val, inl = None, None, '', None, []
            for ev, el in ET.iterparse(io.BytesIO(z.read(sh)), events=('start', 'end')):
                tag = el.tag.rsplit('}', 1)[-1]
                if ev == 'start':
                    if tag == 'row':
                        row = {}
                    elif tag == 'c':
                        ctype, cref, val, inl = el.get('t'), el.get('r') or '', None, []
                    continue
                if tag == 'v':
                    val = el.text
                elif tag == 'f':
                    nform += 1
                elif tag == 't':
                    inl.append(el.text or '')
                elif tag == 'c' and row is not None:
                    if ctype == 's' and val is not None and val.isdigit() \
                            and int(val) < len(shared):
                        s = shared[int(val)]
                    elif ctype == 'inlineStr':
                        s = ''.join(inl)
                    else:
                        s = val
                    if s not in (None, ''):
                        ncell += 1
                        ci = _col_index(cref) if cref else len(row)
                        row[ci] = s.replace('\t', ' ').replace('\n', ' ')
                    el.clear()
                elif tag == 'row' and row is not None:
                    if row:
                        w = max(row) + 1
                        out.append('\t'.join(row.get(i, '') for i in range(w)))
                    row = None
                    el.clear()
        except (ET.ParseError, KeyError):
            pass
        # The marker carries the sheet's FORMULA share: a calculator or an
        # application template computes its cells; a published dataset holds them.
        out[at] = f'[{sh.rsplit("/", 1)[-1][:-4]} cells={ncell} formulas={nform}]'
    return '\n'.join(out)


def text_in_ooxml(path):
    try:
        z = zipfile.ZipFile(path)
    except Exception:
        return ''
    if 'xl/workbook.xml' in z.namelist():
        return text_in_xlsx(z)
    out = []
    for n in z.namelist():
        ln = n.lower()
        if not (ln.endswith('.xml') and (
                ln.startswith(('word/', 'ppt/', 'xl/')) or ln.endswith('content.xml'))):
            continue
        if '/media/' in ln or ln.endswith('.rels'):
            continue
        try:
            data = z.read(n)
        except Exception:
            continue
        try:
            for _, el in ET.iterparse(io.BytesIO(data)):
                tag = el.tag.rsplit('}', 1)[-1]
                if tag in ('t', 'p') and el.text:
                    out.append(el.text)
                if tag in ('p', 'tr', 'br'):
                    out.append('\n')
                el.clear()
        except ET.ParseError:
            out.append(re.sub(r'<[^>]+>', ' ', data.decode('utf-8', 'replace')))
    return ' '.join(out)


def text_in_odf(path):
    try:
        z = zipfile.ZipFile(path)
        data = z.read('content.xml')
    except Exception:
        return ''
    out = []
    try:
        for _, el in ET.iterparse(io.BytesIO(data)):
            tag = el.tag.rsplit('}', 1)[-1]
            if el.text:
                out.append(el.text)
            if tag in ('p', 'h', 'table-row'):
                out.append('\n')
            el.clear()
    except ET.ParseError:
        out.append(re.sub(r'<[^>]+>', ' ', data.decode('utf-8', 'replace')))
    return ' '.join(out)


def text_in_html(s):
    s = re.sub(r'(?is)<(script|style)\b.*?</\1>', ' ', s)
    s = re.sub(r'(?i)<br\s*/?>|</(p|div|tr|li|h[1-6])>', '\n', s)
    # D-66: a table cell ends in a TAB, so a row keeps its cells apart for the
    # dataset family. `norm()` folds it to the space the tag removal gave before.
    s = re.sub(r'(?i)</t[dh]>', '\t', s)
    s = re.sub(r'<[^>]+>', ' ', s)
    return (s.replace('&nbsp;', ' ').replace('&amp;', '&')
             .replace('&lt;', '<').replace('&gt;', '>').replace('&#39;', "'"))


def text_in_ole2(data):
    """Legacy .doc/.xls/.ppt. No OLE2 parser in the stdlib; the runs of readable
    text are recovered from the bytes. Deliberately weak, and the `usable` test
    below is what keeps a weak read from becoming a confident zero."""
    out = []
    for m in re.finditer(rb'(?:[\x20-\x7e]{6,})', data):
        out.append(m.group(0).decode('latin-1'))
    wide = data.replace(b'\x00', b'')
    if len(wide) < len(data) * 0.9:
        for m in re.finditer(rb'(?:[\x20-\x7e]{12,})', wide):
            out.append(m.group(0).decode('latin-1'))
    return ' '.join(out)


LETTERS = re.compile(r'[A-Za-z]')
WORD = re.compile(r'[A-Za-z][A-Za-z\'-]{1,}')
# A small closed class of English function words: their RATE is what separates real
# prose from glyph soup, and it needs no vocabulary of the subject matter.
STOP = {'the', 'of', 'and', 'to', 'in', 'a', 'for', 'on', 'by', 'is', 'that',
        'with', 'as', 'at', 'be', 'or', 'from', 'this', 'an', 'shall', 'city'}


def usable(text):
    """(ok, reason, rate). An honest verdict on whether a class question can be ASKED
    of this text at all. Three ways it is not: nothing extracted; too little to carry
    a masthead; or extracted bytes that are not English words (a subsetted font's
    custom encoding, or a scan's OCR-less glyph stream).

    The RATE is returned as well as the verdict, because the verdict is a line drawn
    through a continuum: a document whose fonts are PARTLY subsetted comes back partly
    readable, passes this test, and could be scored `other` when the evidence for its
    class sat in the part that did not decode. That contamination is bounded by
    reporting the rate distribution of the `other` pile rather than by pretending the
    line is sharp."""
    letters = len(LETTERS.findall(text))
    if letters < 40:
        return False, 'no text layer (fewer than 40 letters extracted)', 0.0
    words = WORD.findall(text.lower())
    if len(words) < 60:
        return False, 'text too short to classify (fewer than 60 words)', 0.0
    rate = sum(1 for w in words if w in STOP) / len(words)
    if rate < 0.04:
        return (False, 'extracted bytes are not English text '
                       '(function-word rate %.3f)' % rate, rate)
    return True, '', rate


# ---------------------------------------------------------------------------
# THE BODY RECOGNISER — evidence families per class. Each returns a bool; the
# class threshold is stated beside it and is fixed BEFORE the corpus was read.
# ---------------------------------------------------------------------------
def norm(text):
    return re.sub(r'[ \t\xa0]+', ' ', text.replace('\r', '\n')).lower()


PHONE = re.compile(r'\(?\b\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b')
EMAIL = re.compile(r'\b[\w.+-]+@[\w-]+\.[\w.-]+\b')
TIME = re.compile(r'\b\d{1,2}:\d{2}\s*(?:a\.?m\.?|p\.?m\.?)')
DATE = re.compile(r'\b(?:january|february|march|april|may|june|july|august|'
                  r'september|october|november|december)\s+\d{1,2},?\s+\d{4}\b'
                  r'|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b')
BODYNAME = re.compile(r'\b(?:city council|council of the city|board|commission|'
                      r'committee|authority|agency|task force|advisory\s+\w+)\b')


def _head(n, frac=0.18, floor=1500):
    return n[:max(floor, int(len(n) * frac))]


# SELF-NAMING is a document CALLING ITSELF a kind in a TITLE POSITION — not the same
# word appearing anywhere in the head. An agenda's item "4. Approval of the Minutes
# of the previous meeting" is a REFERENCE to minutes, not a claim to be minutes, and
# a head-substring test reads the two as identical. So the test is: a SHORT line near
# the top that carries the word and is not an act performed UPON that kind.
# A title line disqualifies itself by marking the kind as something ACTED UPON
# ("Approval of the Minutes"), as a PART of this document ("Agenda Item 5",
# "Agenda Review"), or as a thing REFERRED to ("re: the Ordinance"). Measured on the
# real corpus before the sample was taken: two of three known minutes documents were
# also reading as agendas because a body line "Agenda Review" is short enough to be a
# title, and a minutes document reviews the agenda at every meeting there is.
_TITLE_VERB = re.compile(r'\b(?:approv|adopt|accept|receiv|review|attach|'
                         r'see\b|enclos|per the|copy of|draft of|pursuant|'
                         r'item\b|items\b|no\.|number\b|re:|regarding|'
                         r'amend|update on|report on)')


def titles(n, k=30, maxwords=14):
    out = []
    for line in n.split('\n')[:k * 3]:
        s = line.strip(' \t.:-*0123456789)')
        w = WORD.findall(s)
        if 0 < len(w) <= maxwords:
            out.append(s)
        if len(out) >= k:
            break
    return out


def self_names(n, pat):
    """A title line names THIS document's kind. A disqualifier only counts when it
    MODIFIES the kind word — just before it ("Approval of the Minutes") or right
    after it ("Agenda Review", "Agenda Item 5"). Scanning the whole line instead was
    measured wrong on the real corpus: it threw away "Staff Reports and
    Attachments", where `attach` sits three words away and modifies nothing."""
    # The MASTHEAD, not any title line anywhere. A set of minutes carries the bare
    # heading "Agenda" over its list of items partway down, which is a section of the
    # minutes and not a claim to be an agenda; restricting the window to the opening
    # block is what separates the two. Lines with no word in them (a fragment like
    # "4:0" from a PDF's kerned time stamp) never enter `titles`, so the window is
    # twelve REAL lines rather than twelve fragments.
    for t in titles(n, k=12):
        for m in re.finditer(pat, t):
            before = t[max(0, m.start() - 18):m.start()]
            after = t[m.end():m.end() + 10]
            if not _TITLE_VERB.search(before) and not _TITLE_VERB.search(after):
                return True
    return False


def fam_agenda(n):
    h = _head(n)
    f = {}
    f['self-naming (title line)'] = self_names(
        n, r'\bagenda\b') and not re.search(r'\bagenda report\b', h[:300])
    f['meeting block (body+date+time)'] = bool(
        BODYNAME.search(h) and DATE.search(h) and TIME.search(h))
    spine = sum(bool(re.search(p, n)) for p in (
        r'\bcall to order\b', r'\broll call\b', r'\bpublic (?:comment|forum|speakers)\b',
        r'\badjourn', r'\bconsent (?:calendar|agenda|items)\b',
        r'\bopen forum\b', r'\bclosed session\b', r'\bapproval of (?:the )?(?:minutes|agenda)\b'))
    f['order-of-business spine (>=3)'] = spine >= 3
    # PROSPECTIVE VOICE is the only agenda-specific family. The meeting block and the
    # order-of-business spine are MEETING-DOCUMENT evidence that minutes carry just as
    # strongly — minutes follow the agenda's own order of business — so neither may
    # fire `agenda` on its own. This was caught by ARM 1 on the planted fixtures
    # BEFORE any corpus was read: the minutes fixture matched `agenda` through
    # block + numbered items, and a numbered item is not a tense.
    # A COUNT, not a presence. Minutes mention once that a body "will consider"
    # something next month; an agenda is written in that voice throughout. Measured:
    # a single occurrence was making two of three known minutes documents read as
    # agendas as well, through frame + one passing phrase.
    f['prospective voice (>=2 occurrences)'] = len(re.findall(
        r'\b(?:will (?:consider|receive|hear|be (?:heard|considered))|'
        r'to be (?:heard|considered|taken up)|subject to change|'
        r'action(?:s)? to be taken|items? to be (?:heard|considered)|'
        r'shall (?:consider|hear)|is scheduled to (?:consider|hear))', n)) >= 2
    return f


def fam_minutes(n):
    f = {}
    f['self-naming (title line)'] = self_names(
        n, r'\b(?:minutes|record of (?:the )?proceedings|'
           r'(?:action |meeting )?summary of (?:the )?proceedings)\b')
    f['outcome language'] = sum(bool(re.search(p, n)) for p in (
        r'\bmoved by\b|\bmotion (?:by|made|was made)\b', r'\bsecond(?:ed)?(?: by)?\b',
        r'\bayes?\b\s*[:\-]|\bnoes?\b\s*[:\-]|\babstain', r'\bmotion (?:carried|passed|failed)\b',
        r'\bunanimously\b', r'\bvote[ds]?\b.{0,30}\b(?:approve|adopt|deny)')) >= 2
    f['retrospective frame'] = bool(
        re.search(r'\b(?:called to order|convened)\b.{0,80}?\d{1,2}:\d{2}', n, re.S)
        and re.search(r'\badjourn(?:ed|ment)\b.{0,80}?\d{1,2}:\d{2}', n, re.S))
    f['attendance roster'] = bool(
        re.search(r'\b(?:members? )?present\s*[:\-]', n)
        and re.search(r'\b(?:members? )?(?:absent|excused)\s*[:\-]', n))
    return f


TEMPLATE_HEADS = (r'\bexecutive summary\b', r'\bbackground\s*(?:/|and)?\s*legislative history\b|\bbackground\b',
                  r'\banalysis(?: and policy alternatives)?\b', r'\bfiscal impact\b',
                  r'\bpublic outreach(?:/interest)?\b', r'\bcoordination\b',
                  r'\bsustainable opportunities\b', r'\baction requested\b',
                  r'\bstrategic plan alignment\b')


def fam_staff_report(n):
    h = _head(n, 0.25, 2500)
    f = {}
    hdr = sum(bool(re.search(p, h)) for p in (
        r'^\s*to\s*[:\-]', r'^\s*from\s*[:\-]', r'^\s*subject\s*[:\-]',
        r'^\s*date\s*[:\-]')) if True else 0
    hdr = sum(bool(re.search(p, h, re.M)) for p in (
        r'^\s*to\s*[:\-]', r'^\s*from\s*[:\-]', r'^\s*subject\s*[:\-]', r'^\s*date\s*[:\-]'))
    f['self-naming (title line)'] = self_names(
        n, r'\b(?:staff report|agenda report|council report|informational report|'
           r'report to the (?:council|board|commission))\b')
    f['memorandum header (>=3 of TO/FROM/SUBJECT/DATE)'] = hdr >= 3
    f['recommendation section'] = bool(re.search(
        r'\b(?:staff recommends|recommendation\s*[:\-]|it is recommended|'
        r'recommended action|action requested)\b', n))
    f['agenda-report template (>=3 headings)'] = sum(
        bool(re.search(p, n)) for p in TEMPLATE_HEADS) >= 3
    f['addressed to the body by style'] = bool(re.search(
        r'\bhonorable (?:mayor|chair|president)|\bhonorable members\b|'
        r'\bcity administrator\b.{0,40}\bapprov|\bagenda report\b', n))
    return f


def fam_ordinance_res(n):
    f = {}
    f['enacting formula'] = bool(re.search(
        r'\bbe it (?:further )?(?:ordained|resolved)\b|\bdoes ordain as follows\b|'
        r'\bnow,? therefore,? be it\b', n))
    wh = len(re.findall(r'\bwhereas\b', n))
    f['recital chain (>=2 whereas)'] = wh >= 2
    # A document that CITES an instrument quotes a recital or two. A document that
    # IS one carries the whole chain. Four is where citation stops being a plausible
    # explanation, and it is what recognises a badly-scanned ordinance whose enacting
    # formula and instrument number did not survive the scan (measured: an Oakland
    # 2017 chapter amendment, 11 recitals, "C.M.S." OCR'd to "iwvi.s.").
    f['recital chain (>=4 whereas) — the instrument itself'] = wh >= 4
    f['instrument number'] = bool(re.search(
        r'\b(?:ordinance|resolution)\s+(?:no\.?|number)\s*[\w.-]*\d', n)
        or re.search(r'\bc\.?\s?m\.?\s?s\.?\b', n))
    f['codification language'] = bool(re.search(
        r'\bis hereby (?:amended|repealed|added|enacted)\b|'
        r'\bsection\s+[\d.]+\s+(?:of|is)\b.{0,40}\b(?:amended|repealed|added)\b', n))
    return f


def fam_directory(n):
    f = {}
    contacts = len(set(PHONE.findall(n))) + len(set(EMAIL.findall(n)))
    words = max(1, len(WORD.findall(n)))
    f['contact-point density (>=10 and >=0.4/100w)'] = (
        contacts >= 10 and contacts / words * 100 >= 0.4)
    lines = [l for l in n.split('\n') if l.strip()]
    short = sum(1 for l in lines if len(WORD.findall(l)) <= 8)
    f['roster shape (>=20 lines, >=70% short)'] = (
        len(lines) >= 20 and short / max(1, len(lines)) >= 0.7)
    f['self-naming (title line)'] = self_names(
        n, r'\b(?:directory|roster|contact list|staff list|phone list|'
           r'list of (?:members|staff|officials))\b')
    f['_contacts'] = contacts
    return f


# BUDGET OR DATASET — D-66, 2026-09-24; Bob's fifth named type (BREADTH §2 row 5).
# ONE class with TWO arms, because Bob named one type and the row counts one; the
# arm that fired is recorded per document, so the count can be split after the fact
# and never has to be re-run to answer "how many were budgets".
#
#   budget   — its body SETS OUT OR REPORTS THE ALLOCATION OF PUBLIC MONEY over a
#              fiscal period: amounts in the body's own tables, a fiscal period
#              named throughout, and the ledger's own vocabulary. A memo ABOUT the
#              budget, a commission that advises on it, a staff report with a
#              fiscal-impact paragraph — each is a REFERENCE to a budget, the same
#              reference-vs-membership line M0-32 drew five times, and each is
#              held below the money-density family, not below a word.
#   dataset  — its body IS A TABLE OF RECORDS: many rows sharing one column shape,
#              a header naming the columns, and the table is most of the document.
#              A calculator, a form or a template has cells but not records.
#
# WHAT THIS CAN SEE: a dataset only where the reader keeps cells apart — a CSV, a
# workbook read by `text_in_xlsx`, an HTML table. A dataset printed into a PDF
# reaches this instrument as unseparated strings and is INVISIBLE to the dataset
# arm (the budget arm, which reads amounts and not cells, is not blind there).
# Legacy .xls is read as printable runs and is equally invisible to it.
MONEY = re.compile(r'\$\s?\d[\d,]*(?:\.\d+)?|\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b')
FISCAL = re.compile(r'\bfy\s?-?\s?\'?\d{2,4}\b|\bfiscal years?\s+\d{4}\b|'
                    r'\bfiscal years?\s+\(?fy\)?\s*\d{2,4}\b')
LEDGER = (r'\bappropriat', r'\bexpenditures?\b', r'\brevenues?\b', r'\bfund balance\b',
          r'\bgeneral purpose fund\b|\bgeneral fund\b', r'\bfte\b|\bfull[- ]time equivalent',
          r'\bpersonnel\b', r'\bo\s?&\s?m\b|\boperations and maintenance\b',
          r'\btransfers? (?:in|out)\b', r'\bcarry[- ]?forward', r'\bencumbran')
_BUDGET_TITLE = (r'\b(?:(?:proposed|adopted|biennial|mid-?\s?cycle|operating|capital|'
                 r'annual|amended|recommended)\s+)?budget(?!\s+(?:advisory|'
                 r'commission|committee|process|priorit|question|webinar|basics|'
                 r'survey|town hall|hearing|workshop))\b|'
                 r'\bcapital improvement program\b|\bfinancial plan\b')
# FW-22 (2026-09-24, BOB #32) — AN AUDITED FINANCIAL STATEMENT IS NOT A BUDGET.
# A budget is a PLAN for money not yet spent; a financial report states the ACTUALS of
# a period that has ENDED, on an auditor's authority. D-66 measured two of its eight
# budgets to be exactly that (M-126 rows 14 and 15: the 2010 CAFR and the Redevelopment
# Agency's FY 2007-08 statements) and named the question; Bob answered it.
#
# THE EXCLUSION IS PART OF WHAT `budget` IS, not a by-product of this class existing.
# `budget_arm` consults `is_financial_report` directly, so neutering `financial_report`
# does NOT re-admit an ACFR to the budget count — which is what keeps ARM 5's "neutering
# one class touches no other" TRUE rather than convenient. The DATASET arm is untouched
# on purpose: a dataset is a FORM (a table of records), not a subject, and a workbook of
# audited figures is honestly both — such a document is reported MULTI-CLASS, never
# silently added to two totals.
_FR_TITLE = (r'\b(?:comprehensive annual|annual comprehensive)\s+financial report\b|'
             # `(?:cafr|acfr)`, NOT `[ac]afr`: that class matches cafr and aafr
             # and never ACFR, the spelling Oakland has used since FY2021. ARM 8's
             # name arm caught it.
             r'\b(?:cafr|acfr)\b|\bsingle audit report\b|'
             r'\b(?:audited|basic|annual) financial (?:reports?|statements?)\b|'
             r'\bfinancial statements?\s+(?:and|with)\s+(?:the\s+)?'
             r'(?:report of the\s+)?independent auditors?\b|'
             r'\bindependent auditors?.{0,3} reports?\b')
_FR_OPINION = (r'\bindependent auditors?.{0,3} report\b', r'\bwe have audited\b',
               r'\bin our opinion\b',
               r'\bpresent(?:s)? fairly, in all material respects\b',
               r'\bgovernment auditing standards\b',
               r'\bauditing standards generally accepted\b')
_FR_SPINE = (r'\bstatements? of net (?:position|assets)\b',
             r'\bstatements? of activities\b',
             r'\bstatements? of revenues?,? expenditures?,? and changes in fund '
             r'(?:balance|equity)',
             r'\bstatements? of cash flows\b',
             r'\bnotes to (?:the )?(?:basic )?financial statements\b',
             r'\bmanagement.{0,3}s discussion and analysis\b',
             r'\brequired supplementary information\b', r'\bbalance sheets?\b',
             r'\bgovernmental accounting standards board\b|\bgasb\b',
             r'\bgenerally accepted accounting principles\b')
_FR_ENDED = re.compile(r'\b(?:fiscal )?years? ended\b|\byears? then ended\b|'
                       r'\bas of june 30,? \d{4}\b')
_EMPTYISH = {'', '0', '0.0', '-', '#DIV/0!', '#REF!', '#N/A', '#VALUE!', '#NAME?', '#NUM!'}
_NUMCELL = re.compile(r'^\s*[-+(]?\$?\s?[\d,]*\.?\d+%?\)?\s*$')


def _table_shape(text):
    """(record rows, width, share of the block's lines, header ok) for the BEST
    block. A workbook is judged SHEET BY SHEET (`text_in_xlsx` marks each with a
    `[sheetN]` line): calibration's Major Projects List is one 131-row table on
    sheet 1 and a 135-line helper column on sheet 2, and judged as one body the
    helper column halved the table's share. Any other body is one block."""
    blocks, cur, computed = [], [], [False]
    for l in text.split('\n'):
        m = re.fullmatch(r'\[sheet\d+(?: cells=(\d+) formulas=(\d+))?\]', l.strip())
        if m:
            blocks.append(cur)
            cur = []
            cells, forms = int(m.group(1) or 0), int(m.group(2) or 0)
            computed.append(bool(cells) and forms / cells > 0.3)
        else:
            cur.append(l)
    blocks.append(cur)
    best = (0, 0, 0.0, False, False)
    for b, comp in zip(blocks, computed):
        r = _block_shape(b)
        if comp:
            # A COMPUTED sheet (> 30% of its filled cells are formulas) is a
            # calculator or a template, never records — calibration: the NOFA
            # workbook's sales-price sheet and the capital-improvement interest
            # calculator both passed every other family.
            r = r[:4] + (False,)
        if r[0] >= 20 and r[3] and r[2] >= 0.6 and r[4]:
            return r
        if r[0] > best[0]:
            best = r
    return best


def _block_shape(lines):
    """A line's CELLS are its TAB-separated fields. COMMAS are cells only in a body
    that IS a CSV by its own signature — at least 80% of its lines parse to one
    field count >= 3 — and in such a body a row must have exactly that count.
    Anywhere else a comma is punctuation or a thousands separator, never a cell:
    calibration's mid-cycle budget PDF read as 819 "rows" when `1,234,567` was split,
    and the control's comma-prose arm read ordinary sentences as rows; a first
    repair (masking `d,ddd`) then merged `B2300000,100 Broadway` inside a REAL CSV.
    The table's WIDTH is the modal cell count over lines with >= 3 cells; a TAB row
    is a record row at half that width or more, because a sheet row stops at its
    last filled cell (calibration: one table read as widths 23/22/21)."""
    import csv as _csv
    lines = [l for l in lines if l.strip()]
    raw = []
    for l in lines:
        try:
            raw.append(len(next(_csv.reader([l]))) if ',' in l and '\t' not in l else 0)
        except Exception:
            raw.append(0)
    rc = collections.Counter(w for w in raw if w >= 3)
    csv_width = rc.most_common(1)[0][0] if rc else 0
    is_csv = bool(csv_width) and rc[csv_width] >= 0.8 * len(lines)
    widths, tabbed = [], []
    for l, rw in zip(lines, raw):
        tabbed.append('\t' in l)
        if '\t' in l:
            n = len(l.split('\t'))
        elif is_csv and rw:
            n = rw
        else:
            n = 1
        widths.append(n if n >= 3 else 0)
    wc = collections.Counter(w for w in widths if w)
    if not wc:
        return 0, 0, 0.0, False, False
    width = wc.most_common(1)[0][0]

    def is_row(i):
        w = widths[i]
        return bool(w) and (w >= 0.5 * width if tabbed[i] else w == width)
    rows = sum(1 for i in range(len(lines)) if is_row(i))
    first = next(i for i in range(len(lines)) if is_row(i))
    l = lines[first]
    hcells = l.split('\t') if '\t' in l else next(_csv.reader([l]))
    filled = [c for c in hcells if c.strip()]
    header = (len(filled) >= 0.6 * width
              and sum(1 for c in filled if not _NUMCELL.match(c)) >= 0.8 * len(filled))
    # RECORDS, not a form. Calibration's NOFA application workbook has sheets of
    # 30-80 rows of one shape that are BLANK TEMPLATE ROWS (`\t\t\t\t0`, repeated)
    # or labelled lines computing `0` and `#DIV/0!`: cells, but no observations.
    # A record row is DISTINCT and CARRIES at least two values that are not blank,
    # zero or a spreadsheet error.
    recs = [lines[i] for i in range(len(lines)) if is_row(i)]

    def carries(l):
        cells = l.split('\t') if '\t' in l else next(_csv.reader([l]))
        return sum(1 for c in cells if c.strip() not in _EMPTYISH) >= 2
    distinct = len(set(r.strip() for r in recs)) / max(1, len(recs))
    carrying = sum(1 for r in recs if carries(r)) / max(1, len(recs))
    return rows, width, rows / max(1, len(lines)), header, (distinct >= 0.8 and carrying >= 0.6)


def fam_financial_report(n):
    f = {}
    words = max(1, len(WORD.findall(n)))
    money = len(MONEY.findall(n))
    f['money density (>=40 amounts and >=4/100w)'] = (
        money >= 40 and money / words * 100 >= 4)
    f['self-naming (title line)'] = self_names(n, _FR_TITLE)
    f["an auditor's opinion (>=2 of 6)"] = sum(
        bool(re.search(p, n)) for p in _FR_OPINION) >= 2
    f['the audited-statement spine (>=3 of 10)'] = sum(
        bool(re.search(p, n)) for p in _FR_SPINE) >= 3
    f['a period that has ENDED (>=2)'] = len(_FR_ENDED.findall(n)) >= 2
    f['_money'] = money
    return f


def financial_report_arm(f):
    # MONEY DENSITY IS NECESSARY, for D-66's own reason and its receipt: a staff report
    # TRANSMITTING the ACFR self-names in its subject line and holds no statements of
    # its own. What a financial report has that a memo about one lacks is its tables of
    # actuals. Then ONE of three: it names itself; an auditor's opinion is in the body;
    # or the statement spine is joined by A PERIOD THAT HAS ENDED. That last conjunct IS
    # the plan/actuals line Bob drew, and it is what stops a budget book's fund-balance
    # schedules (a balance sheet, governmental funds, GASB in its notes — three spine
    # hits) from reading as a financial report: a budget names a period that has NOT
    # ended. The spine ALONE is not enough, and ARM 8 drives that arm both ways.
    return f['money density (>=40 amounts and >=4/100w)'] and (
        f['self-naming (title line)'] or f["an auditor's opinion (>=2 of 6)"]
        or (f['the audited-statement spine (>=3 of 10)']
            and f['a period that has ENDED (>=2)']))


def is_financial_report(n):
    """The predicate BOB #32's ruling puts INSIDE the budget type's definition. Called
    from `budget_arm`, so the exclusion holds whether or not the class is neutered."""
    return financial_report_arm(fam_financial_report(n))


def fam_budget_dataset(n, raw=None):
    f = {}
    words = max(1, len(WORD.findall(n)))
    money = len(MONEY.findall(n))
    f['money density (>=40 amounts and >=4/100w)'] = (
        money >= 40 and money / words * 100 >= 4)
    f['fiscal period named (>=3)'] = len(FISCAL.findall(n)) >= 3
    f['ledger vocabulary (>=3 of 11)'] = sum(
        bool(re.search(p, n)) for p in LEDGER) >= 3
    f['self-naming (title line)'] = self_names(n, _BUDGET_TITLE)
    rows, width, share, header, records = _table_shape(raw if raw is not None else n)
    f['record table (>=20 rows of one width >=3)'] = rows >= 20
    f['header row names the columns'] = header
    f['the table is the body (>=60% of lines)'] = share >= 0.6
    f['rows are distinct records carrying values'] = records
    # FW-22 (BOB #32): the budget type does NOT admit an audited financial statement.
    # Recorded as a FAMILY, so every document's count is auditable back to it and the
    # recount can be re-derived from the log without a second network run.
    f['not an audited financial statement (BOB #32)'] = not is_financial_report(n)
    f['_money'] = money
    f['_rows'] = rows
    return f


def budget_arm(f):
    # MONEY DENSITY IS NECESSARY. The first draft let self-naming + a fiscal period +
    # ledger words carry a document with no amounts in it, and calibration caught it
    # at once: the Finance Director's SUPPLEMENTAL memo on the FY 2024-25 mid-cycle
    # General Purpose Fund deficit (15 amounts in 17,477 characters) read as a budget.
    # It is a memo ABOUT one — a reference, not membership — and its subject line is
    # exactly the self-naming a memo about a budget carries. What a budget has that a
    # memo about it lacks is its own table of amounts.
    # FW-22: and it is not an audited financial statement (BOB #32, 2026-09-24) —
    # `budget_arm_d66` below is the SAME arm without that conjunct, kept so the recount
    # is a difference this instrument prints rather than one a reader must take on faith.
    return budget_arm_d66(f) and f.get(
        'not an audited financial statement (BOB #32)', True)


def budget_arm_d66(f):
    """D-66's budget arm as it stood before BOB #32 — the baseline the recount is
    measured AGAINST, and the only thing `derive`'s recount line subtracts."""
    money = f['money density (>=40 amounts and >=4/100w)']
    return money and (f['self-naming (title line)'] or (
        f['fiscal period named (>=3)'] and f['ledger vocabulary (>=3 of 11)']))


def dataset_arm(f):
    return (f['record table (>=20 rows of one width >=3)']
            and f['header row names the columns']
            and f['the table is the body (>=60% of lines)']
            and f['rows are distinct records carrying values'])


# THE THRESHOLDS. Each is the class's PRINCIPLE expressed over its families, stated
# here rather than spread through the recogniser so a reader can see what the count
# means.
#
# HOW THEY WERE ARRIVED AT, stated plainly because it bears on how much the numbers
# are worth. They were first fixed against the planted fixtures of ARM 1/ARM 2 alone.
# They were then CALIBRATED against TWELVE hand-checked real documents (three each of
# four classes, drawn by fixed seed from filenames that assert a kind) — and five
# defects were found and corrected that way, every one of them a REFERENCE to a kind
# being mistaken for MEMBERSHIP of it, or the reverse. Each correction is recorded at
# its own site and each is now a standing arm in `control`. So these thresholds are
# NOT pre-registered against the corpus: they were tuned on twelve of its documents.
# They were NOT touched after the 600-document sample was drawn, and the sample is
# disjoint from the twelve only by chance, not by construction. Calibration on
# twelve, measurement on 600: the reader should discount accordingly, and the
# name-vs-body agreement table in `derive` is the independent check.
def meets(cls, f):
    if cls == 'agenda':
        # Prospective is the whole distinction. A meeting frame alone is shared with
        # minutes, so it must be joined by the future voice or by the document
        # naming itself in a title line.
        frame = f['meeting block (body+date+time)'] or f['order-of-business spine (>=3)']
        return f['self-naming (title line)'] or (frame and f['prospective voice (>=2 occurrences)'])
    if cls == 'minutes':
        return f['self-naming (title line)'] or sum(
            (f['outcome language'], f['retrospective frame'], f['attendance roster'])) >= 2
    if cls == 'staff_report':
        return (f['self-naming (title line)']
                or f['agenda-report template (>=3 headings)'] or sum(
                    (f['memorandum header (>=3 of TO/FROM/SUBJECT/DATE)'],
                     f['recommendation section'],
                     f['addressed to the body by style'])) >= 2)
    if cls == 'ordinance_res':
        # An instrument NUMBER is a reference, not the instrument: every agenda in
        # this corpus lists "Resolution No. NNNNN C.M.S." items. So a number must be
        # joined by the instrument's own body language before it counts.
        return (f['enacting formula']
                or f['recital chain (>=4 whereas) — the instrument itself']
                or sum((f['instrument number'], f['recital chain (>=2 whereas)'],
                        f['codification language'])) >= 2)
    if cls == 'directory':
        return f['contact-point density (>=10 and >=0.4/100w)'] or (
            f['self-naming (title line)'] and f['_contacts'] >= 5)
    if cls == 'financial_report':
        # FW-22, BOB #32 (2026-09-24). Set against the planted fixtures and the SIX
        # named real documents of ARM 8 BEFORE the sample was re-walked, and not
        # touched after — the same discount M0-32 states above applies.
        return financial_report_arm(f)
    if cls == 'budget_dataset':
        # D-66. Set against the planted fixtures and FIVE named real documents
        # (listed in `control` ARM 7) BEFORE the sample was drawn, and not touched
        # after — the same discount M0-32 states above applies.
        return budget_arm(f) or dataset_arm(f)
    raise KeyError(cls)


FAMS = {'agenda': fam_agenda, 'minutes': fam_minutes, 'staff_report': fam_staff_report,
        'ordinance_res': fam_ordinance_res, 'directory': fam_directory,
        'budget_dataset': fam_budget_dataset,
        'financial_report': fam_financial_report}


def classify_body(text, neuter=None):
    """-> (matched classes, per-class families). `neuter` disables ONE class's whole
    family set — the queue row's negative control: that class must read zero and the
    documents it held must reappear in `other`, never vanish."""
    n = norm(text)
    fired, fams = [], {}
    for c in CLASSES:
        if neuter == c:
            fams[c] = {}
            continue
        f = FAMS[c](n, text) if c == 'budget_dataset' else FAMS[c](n)
        fams[c] = {k: v for k, v in f.items() if not k.startswith('_')}
        if meets(c, f):
            fired.append(c)
    return fired, fams


# ---------------------------------------------------------------------------
# THE NAME RECOGNISER — the census layer. The PRINCIPLE is narrower than the body
# recogniser's and is stated as such: a filename classifies a document only when it
# ASSERTS the class in its own words. Morphological stems, so a spelling this file
# never saw ("Agendas", "AGENDA-PACKET", "agenda_final_v2") still lands; a filename
# that names no kind is UNCLASSIFIED, never `other`. `bodies` MEASURES this layer's
# recall and precision against the body recogniser rather than assuming either.
# ---------------------------------------------------------------------------
NAME_RULES = {
    'agenda': r'agenda(?!\s*report)',
    'minutes': r'minute(?:s)?\b|\bmins?\b|action[-_ ]?summary',
    'staff_report': r'staff[-_ ]?report|agenda[-_ ]?report|report[-_ ]?to[-_ ]?(?:council|board|'
                    r'commission)|council[-_ ]?report|informational[-_ ]?report|memo(?:randum)?\b',
    'ordinance_res': r'ordinance|\bordin\b|\bord[-_ ]?no\b|resolution|\breso\b|\bres[-_ ]?no\b|'
                     r'\bc\.?m\.?s\.?\b',
    'directory': r'director(?:y|ies)|roster|contact[-_ ]?list|phone[-_ ]?list|staff[-_ ]?list',
    # D-66. What a filename asserting a budget or a dataset says in its own words.
    # MEASURED against the bodies in `derive`, never used to count — the row's
    # "how a liar passes it" is exactly a count taken from this line.
    'budget_dataset': r'budget|appropriation|capital[-_ ]?improvement[-_ ]?program|'
                      r'financial[-_ ]?plan|data[-_ ]?set|\bdata\b',
    # FW-22. Same standing as the line above: MEASURED against the bodies in `derive`,
    # never counted. `financial[-_ ]?plan` stays with budget, where BOB #32 left it.
    'financial_report': r'\b(?:cafr|acfr)\b|comprehensive[-_ ]?annual[-_ ]?financial|'
                        r'annual[-_ ]?comprehensive[-_ ]?financial|'
                        r'financial[-_ ]?statement|audited[-_ ]?financial|'
                        r'single[-_ ]?audit|audit(?:or)?[-_ ]?report',
}


def classify_name(name, neuter=None):
    s = re.sub(r'[_%]+', ' ', name.rsplit('/', 1)[-1]).lower()
    s = re.sub(r'\.[a-z0-9]{1,5}$', '', s)
    return [c for c, pat in NAME_RULES.items()
            if c != neuter and re.search(pat, s)]


# ---------------------------------------------------------------------------
# CONSERVATION — the identity the queue row demands, computed in ONE place so the
# printed table and the assertion cannot drift apart.
# ---------------------------------------------------------------------------
OTHER_REASON = 'usable text read, no class threshold met'


def _reason_family(s):
    """`other` and UNCLASSIFIED are different facts and are never merged. Among the
    unclassified, the function-word rate is folded back into ONE named reason: the
    rate is diagnostic, and leaving it in the key split a single finding across 35
    rows that each looked negligible."""
    if s.startswith('extracted bytes are not English text'):
        return 'extracted bytes are not English text (a custom font encoding, or a scan)'
    return s


def tally(records, key='classes'):
    t = {'single': collections.Counter(), 'multi': collections.Counter(),
         'unclassified': collections.Counter(), 'n': 0}
    for r in records:
        t['n'] += 1
        cs = r[key]
        if not cs:
            reason = r.get('reason', 'no class evidence in the name')
            if reason == OTHER_REASON:
                # READ, and positively of no named class. This is a class, not a gap.
                t['single']['other'] += 1
            else:
                t['unclassified'][_reason_family(reason)] += 1
        elif len(cs) == 1:
            t['single'][cs[0]] += 1
        else:
            t['multi'][' + '.join(sorted(cs))] += 1
    return t


def print_tally(label, t, note=''):
    single = sum(t['single'].values())
    multi = sum(t['multi'].values())
    unc = sum(t['unclassified'].values())
    named = single - t['single']['other']
    print(f'\n{label} — n = {t["n"]:,}{(" · " + note) if note else ""}')
    print(f'  {"class":22s}{"single-class":>14s}{"in multi":>10s}{"any":>8s}')
    print('  ' + '-' * 54)
    for c in CLASSES:
        anyc = t['single'][c] + sum(v for k, v in t['multi'].items() if c in k.split(' + '))
        print(f'  {c:22s}{t["single"][c]:14d}{anyc - t["single"][c]:10d}{anyc:8d}')
    print('  ' + '-' * 54)
    print(f'  {"other (READ, no class)":22s}{t["single"]["other"]:14d}'
          f'   <- a class, not a gap')
    print(f'\n  MULTI-CLASS documents ({multi}) — counted ONCE, listed by combination:')
    for k, v in t['multi'].most_common():
        print(f'    {v:6d}  {k}')
    if not multi:
        print('    (none)')
    print(f'\n  UNCLASSIFIED ({unc}) — BY REASON, each named, none scored zero:')
    for k, v in t['unclassified'].most_common():
        print(f'    {v:6d}  {k}')
    if not unc:
        print('    (none)')
    print(f'\n  CONSERVATION: named-class {named} + other {t["single"]["other"]} '
          f'+ multi {multi} + unclassified {unc} '
          f'= {single + multi + unc}  (corpus {t["n"]})  '
          f'{"OK" if single + multi + unc == t["n"] else "*** DOES NOT CONSERVE ***"}')
    return single + multi + unc == t['n']


# ---------------------------------------------------------------------------
# MODES
# ---------------------------------------------------------------------------
def cmd_list(bucket='cao-94612'):
    mo = _office()
    os.makedirs(PEN, exist_ok=True)
    out = os.path.join(PEN, 'population.jsonl')
    n = 0
    with open(out, 'w') as f:
        keys = mo._bucket_keys(bucket)
        print(f'bucket s3://{bucket}: {len(keys)} keys '
              f'(COFF-6 read 43,282 on 2026-08-03; CAP-7 read 43,283 on 2026-09-14)')
        for k in keys:
            f.write(json.dumps({'half': 'bucket', 'id': k['key'], 'name': k['key'],
                                'size': k['size'], 'stratum': stratum_of(k['key']),
                                'url': f'https://{bucket}.s3.amazonaws.com/'
                                       + urllib.parse.quote(k['key'])}) + '\n')
            n += 1

        # The Legistar half, COFF-6's second source, in COFF-6's own matter shape.
        # Its MatterTypeName is the one piece of PUBLISHER-DECLARED class metadata
        # in this corpus and is carried through as independent ground truth.
        api = 'https://webapi.legistar.com/v1/oakland'
        matters, seen = [], set()
        recent = mo._get(api + '/matters?' + urllib.parse.urlencode(
            {'$top': '200', '$orderby': 'MatterLastModifiedUtc desc'}), timeout=60)
        if recent:
            matters += json.loads(recent)
        for yr in (2015, 2016):
            flt = (f"MatterIntroDate ge datetime'{yr}-01-01' and "
                   f"MatterIntroDate lt datetime'{yr}-07-01'")
            old = mo._get(api + '/matters?' + urllib.parse.urlencode(
                {'$top': '25', '$filter': flt}), timeout=60)
            if old:
                matters += json.loads(old)
        natt = 0
        for m in matters:
            if m['MatterId'] in seen:
                continue
            seen.add(m['MatterId'])
            raw = mo._get(f"{api}/matters/{m['MatterId']}/attachments", timeout=60)
            time.sleep(0.25)
            if raw is None:
                continue
            for a in json.loads(raw):
                natt += 1
                nm = a.get('MatterAttachmentName') or ''
                f.write(json.dumps({
                    'half': 'legistar', 'id': f"matter {m['MatterId']} att "
                                              f"{a.get('MatterAttachmentId')}",
                    'name': nm, 'size': None,
                    'stratum': stratum_of(nm) if '.' in nm else 'text-bearing',
                    'matter_type': m.get('MatterTypeName'),
                    'url': a.get('MatterAttachmentHyperlink') or ''}) + '\n')
                n += 1
        print(f'legistar: {natt} attachments over {len(seen)} matters '
              f'(COFF-6 read 792 over 250 on 2026-08-03)')
    print(f'population written to {out}: {n} items')


def load_pop():
    """FW-22: `M032_HALVES=bucket` restricts the population to the bucket half.

    THE RECOUNT MUST BE OF D-66'S SAMPLE, not of a fresh draw. D-66's population was
    the bucket alone — `webapi.legistar.com` refused that container's CONNECT (M-126)
    — and on 2026-09-24 ~19:00Z it ANSWERED this one, 766 attachments over 250 matters.
    Left in, those rows change the population, so `random.sample` at the same seed
    draws DIFFERENT documents and the recount would not be a recount. Naming the half
    reproduces D-66's stratum exactly: 28,915 text-bearing items with a url, the figure
    M-126 states. That the Legistar half is reachable today is a finding, recorded in
    FW-22's measurement; it is not this row's to fold in."""
    p = os.path.join(PEN, 'population.jsonl')
    if not os.path.exists(p):
        sys.exit(f'no population at {p} — run `list` first')
    rows = [json.loads(l) for l in open(p)]
    halves = os.environ.get('M032_HALVES', '')
    if halves:
        keep = set(halves.split(','))
        rows = [r for r in rows if r['half'] in keep]
    return rows


def cmd_names(neuter=None, quiet=False):
    pop = load_pop()
    strata = collections.Counter(r['stratum'] for r in pop)
    if not quiet:
        print(f'POPULATION — {len(pop):,} items '
              f'({sum(1 for r in pop if r["half"] == "bucket"):,} bucket keys + '
              f'{sum(1 for r in pop if r["half"] == "legistar"):,} Legistar attachments)')
        print('\nSTRATA — the census classifies the TEXT-BEARING stratum; every other '
              'stratum is NAMED and counted, never folded into a class:')
        for s, c in strata.most_common():
            print(f'  {s:24s} {c:7,d}')
    recs = []
    for r in pop:
        if r['stratum'] != 'text-bearing':
            recs.append({'id': r['id'], 'classes': [],
                         'reason': f'not classified: stratum `{r["stratum"]}` '
                                   f'(this census does not open it)'})
            continue
        cs = classify_name(r['name'], neuter=neuter)
        recs.append({'id': r['id'], 'name': r['name'], 'classes': cs,
                     'reason': 'text-bearing, but the FILENAME asserts no document kind'})
    if not quiet:
        with open(os.path.join(PEN, 'name-class.jsonl'), 'w') as f:
            for r in recs:
                f.write(json.dumps(r) + '\n')
        ok = print_tally('NAME CENSUS over the WHOLE corpus', tally(recs),
                         'evidence = the key path / attachment name only')
        text_only = [r for r in recs if 'name' in r]
        print_tally('NAME CENSUS restricted to the TEXT-BEARING stratum',
                    tally(text_only), 'the population a body read could reach')
        if not ok:
            sys.exit('census does not conserve')
    return recs


def _fetch_text(rec, tmp):
    """(text, reason_if_unreadable). Streams, writes at most one file, deletes it."""
    text, reason, _data = _fetch_text_bytes(rec, tmp)
    return text, reason


def _fetch_text_bytes(rec, tmp):
    """(text, reason, bytes-or-None) — the bytes kept so a PDF this instrument's own
    tier-1 reader cannot read can be handed to the plane's reader (D-66)."""
    data = _office()._get(rec['url'], timeout=300)
    if data is None:
        return '', 'fetch failed (network or 404)', None
    text, reason = _text_of(rec, data, tmp)
    return text, reason, data


# THE PLANE'S READER, for a PDF this instrument cannot read (D-66, 2026-09-24).
# This file's PDF reader is a crude tier 1 with no ToUnicode support, and M-18
# stated its 190 of 600 unclassified as "a fact about THIS instrument ... NOT
# evidence about what the plane's own reader can do". M-121 then measured the
# plane's fleet reading 293 of 300 PDFs. A budget is the class that instrument
# most under-reads: calibration's two mid-cycle budget PDFs both came back "not
# English text" here and both read at the plane's own tier 1 in 12 s.
#
# So an UNUSABLE PDF is re-read by the plane — FW-20's committed instrument
# `bio-plane/scripts/fw20-decode-census.mjs`, called UNCHANGED, which boots the
# real plane, the committed pdf-worker bundle (tier 2) and the OCR member (tier 3,
# one page per invocation) in miniflare, drives `op=acquire`, and with
# FW20_TEXT_DIR set writes the text `op=pdfstructure` holds. One process per
# document so a hang costs one document, bounded by PLANE_TIMEOUT_S. Both verdicts
# are recorded: `classes_t1` is this instrument alone (M-18's reader, comparable
# with M-18), `classes` is the verdict on the best text obtained.
PLANE_SCRIPT = os.path.join(HERE, '..', 'bio-plane', 'scripts', 'fw20-decode-census.mjs')
PLANE_TIMEOUT_S = 300
UNUSABLE_PDF = ('no text layer', 'text too short', 'extracted bytes are not English')


LAST_PLANE_ROW = {}
# D-536: M032_KEEP=1 keeps each escalated PDF's bytes in <pen>/plane-keep/<sha>.pdf so `reread` can hand
# the SAME bytes to the plane a second time. Off by default: M-143's walk kept nothing.
KEEP = os.environ.get('M032_KEEP', '0') == '1'


def plane_text(rec, data):
    """(text, reader, reason). Never raises; a failure is a REASON, named."""
    import hashlib, subprocess
    sha = hashlib.sha256(data).hexdigest()
    pdir, tdir = os.path.join(PEN, 'plane-pdf'), os.path.join(PEN, 'plane-text')
    os.makedirs(pdir, exist_ok=True)
    os.makedirs(tdir, exist_ok=True)
    pdf = os.path.join(pdir, sha + '.pdf')
    man = os.path.join(pdir, sha + '.json')
    with open(pdf, 'wb') as f:
        f.write(data)
    if KEEP:
        kdir = os.path.join(PEN, 'plane-keep')
        os.makedirs(kdir, exist_ok=True)
        kp = os.path.join(kdir, sha + '.pdf')
        if not os.path.exists(kp):
            with open(kp, 'wb') as f:
                f.write(data)
    with open(man, 'w') as f:
        json.dump([{'key': rec['name'], 'sha': sha, 'bytes': len(data)}], f)
    row, reason = None, ''
    try:
        p = subprocess.run(['node', PLANE_SCRIPT, man, pdir],
                           cwd=os.path.join(HERE, '..', 'bio-plane'),
                           env=dict(os.environ, FW20_TEXT_DIR=tdir),
                           capture_output=True, text=True, timeout=PLANE_TIMEOUT_S)
        for line in p.stdout.splitlines():
            if line.startswith('{"key"'):
                row = json.loads(line)
        if p.returncode != 0 and row is None:
            reason = f'plane reader exited {p.returncode}'
    except subprocess.TimeoutExpired:
        reason = f'plane reader timed out after {PLANE_TIMEOUT_S} s'
    finally:
        for x in (pdf, man):
            if os.path.exists(x):
                os.remove(x)
    tp = os.path.join(tdir, sha + '.txt')
    text = ''
    if os.path.exists(tp):
        text = open(tp, encoding='utf-8', errors='replace').read()
        os.remove(tp)
    for x in (sha + '.i2.json', sha + '.plain.txt'):
        ip = os.path.join(tdir, x)
        if os.path.exists(ip):
            os.remove(ip)
    # D-536: the row's provenance rides beside the text, so `read_one` can record WHICH tier and member
    # produced the text this census classified, and `reread` can attribute a moved class.
    LAST_PLANE_ROW.clear()
    if row is not None:
        LAST_PLANE_ROW.update(row)
    if row is None:
        return '', 'plane (no row)', reason or 'plane reader returned no row'
    if row.get('err'):
        return text, 'plane (acquire refused)', 'plane acquire: ' + str(row['err'])[:160]
    # D-557: the text above is the text the acquire READING classified (its `text_units`), and the label
    # names the tiers of the producers of exactly those pages, never the document's `text_tier` — which
    # labelled 34 documents "tier 3" that were judged on EMPTY plain text (M-152). No text judged, no tier.
    # The label is the census row's own (`judged.reader`), composed in ONE place.
    label = (row.get('judged') or {}).get('reader') or 'plane (no text judged)'
    text, reflowed = reflow(text)
    return text, label + (' REFLOWED' if reflowed else ''), ''


def hashlib_sha(data):
    import hashlib
    return hashlib.sha256(data).hexdigest()


def reflow(text):
    """(text, reflowed?). THE PLANE'S TIER-1 PAGE TEXT BREAKS A LINE AT EVERY
    POSITIONING OPERATOR (`pdfstructure.mjs`, the per-page interpreter: `Td` `TD`
    `Tm` `T*` each push "\n"), so a PDF that places every glyph with its own `Tm`
    arrives ONE GLYPH PER LINE — calibration's `Budget-Basics-FY21-23` read 18,551
    characters and fewer than 60 words. That is a defect in the plane, reported
    under D-66 with its fix; here the instrument only undoes it, and says so on the
    record: a body whose non-empty lines are >= 60% single characters has its line
    breaks removed. A space glyph is its own line in such text, so words survive."""
    lines = [l for l in text.split('\n') if l != '']
    if len(lines) >= 50 and sum(1 for l in lines if len(l) <= 1) >= 0.6 * len(lines):
        return re.sub(r'\n(?!\f)', '', text), True
    return text, False


def _text_of(rec, data, tmp):
    e = ext_of(rec['name']) or ext_of(rec.get('url', ''))
    try:
        if e == 'pdf' or data[:5] == b'%PDF-':
            return text_in_pdf(data), ''
        if e in ('html', 'htm', 'xml'):
            return text_in_html(data.decode('utf-8', 'replace')), ''
        if e in ('csv', 'txt'):
            return data.decode('utf-8', 'replace'), ''
        if e == 'rtf':
            return re.sub(r'\\[a-z]+-?\d*\s?|[{}]', ' ',
                          data.decode('latin-1')), ''
        with open(tmp, 'wb') as f:
            f.write(data)
        kind, _flav = _office().classify(tmp)
        if kind == 'ooxml':
            return text_in_ooxml(tmp), ''
        if kind == 'odf':
            return text_in_odf(tmp), ''
        if kind == 'ole2':
            return text_in_ole2(data), ''
        return '', f'container kind `{kind}` carries no reader in this instrument'
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


def judge(text, reason=''):
    """-> (classes, families, function-word rate, gate). The ONE place a body is
    judged, so `bodies`, `readsample` and `control` cannot drift apart.

    THE PROSE GATE IS A PROSE GATE (D-66). `usable()` refuses text whose function-
    word rate is below 0.04 — right for glyph soup, and equally true of a CSV of
    figures, which has almost no function words BECAUSE it is a dataset. So a body
    the gate refuses is still asked ONE question, the dataset arm's, which reads
    cell STRUCTURE and no words. If it fires, the document is `budget_dataset` and
    `gate` says it was judged past the prose gate; if not, it keeps its unusable
    reason exactly as before. No other class is ever asked of such a body. A fetch
    failure or an unread container is never asked anything."""
    if reason:
        return [], {}, 0.0, ''
    ok, why, rate = usable(text)
    if ok:
        cs, fams = classify_body(text)
        return cs, fams, rate, 'prose'
    f = fam_budget_dataset(norm(text), text)
    if dataset_arm(f):
        return (['budget_dataset'],
                {'budget_dataset': {k: v for k, v in f.items() if not k.startswith('_')}},
                rate, 'dataset arm past the prose gate: ' + why)
    return [], {}, rate, why


def read_one(rec, tmp):
    """-> (record, text). ONE document read and judged — the same path for `bodies`,
    `readsample` and calibration, so none of them can drift from the others."""
    text, reason, data = _fetch_text_bytes(rec, tmp)
    cs, fams, rate, gate = judge(text, reason)
    t1 = {'classes_t1': cs, 'reason_t1': reason or (
        OTHER_REASON if gate in ('prose', '') or cs else gate)}
    reader = 'instrument tier 1'
    plane_prov = None
    if (PLANE and not cs and data is not None and not reason
            and (ext_of(rec['name']) == 'pdf' or data[:5] == b'%PDF-')
            and gate.startswith(UNUSABLE_PDF)):
        ptext, reader, preason = plane_text(rec, data)
        plane_prov = {'sha': hashlib_sha(data),
                      'structure_provenance': LAST_PLANE_ROW.get('structure_provenance'),
                      'reading_provenance': LAST_PLANE_ROW.get('reading_provenance'),
                      # D-557: what was judged — units, chars, producers' tiers, digest agreement.
                      'judged': LAST_PLANE_ROW.get('judged')}
        if preason:
            reason = preason
        else:
            text = ptext
            cs, fams, rate, gate = judge(text, '')
    return ({**t1, 'reader': reader,
             'id': rec['id'], 'name': rec['name'], 'half': rec['half'],
             'ext': ext_of(rec['name']), 'size': rec.get('size'),
             'matter_type': rec.get('matter_type'),
             'chars': len(text), 'fw_rate': round(rate, 4), 'classes': cs,
             'gate': gate,
             'reason': reason or (OTHER_REASON if gate in ('prose', '') or cs else gate),
             'fams': {c: [k for k, v in d.items() if v] for c, d in fams.items()},
             'name_classes': classify_name(rec['name']),
             **({'plane_prov': plane_prov} if plane_prov else {})}, text)


def cmd_bodies(n=600, seed=20260914):
    pop = [r for r in load_pop() if r['stratum'] == 'text-bearing' and r.get('url')]
    random.seed(seed)
    sample = random.sample(pop, min(n, len(pop)))
    random.shuffle(sample)          # any completed PREFIX is itself a uniform sample
    out = os.path.join(PEN, 'body-class.jsonl')
    done = set()
    if os.path.exists(out):
        for l in open(out):
            try:
                done.add(json.loads(l)['id'])
            except Exception:
                pass
    print(f'BODY SAMPLE — {len(sample)} of {len(pop):,} text-bearing items '
          f'(seed {seed}); {len(done)} already read, {len(sample) - len(done)} to go.\n'
          f'The sample order is SHUFFLED before the walk, so a partial run is a '
          f'uniform random sample of the stratum and not a biased head.', flush=True)
    tmp = os.path.join(PEN, 'body.tmp')
    t0, nread, byts = time.time(), 0, 0
    with open(out, 'a') as f:
        for i, rec in enumerate(sample):
            if rec['id'] in done:
                continue
            row, text = read_one(rec, tmp)
            f.write(json.dumps(row) + '\n')
            f.flush()
            nread += 1
            byts += len(text)
            time.sleep(0.25)
            if nread % 25 == 0:
                print(f'  {nread} read ({time.time() - t0:.0f}s)', flush=True)
    print(f'{nread} newly read in {time.time() - t0:.0f}s -> {out}')


def _img_dims(data):
    """(w, h) from the header alone — no decode, no dependency."""
    if data[:8] == b'\x89PNG\r\n\x1a\n' and data[12:16] == b'IHDR':
        return struct.unpack('>II', data[16:24])
    if data[:2] == b'\xff\xd8':
        i = 2
        while i < len(data) - 9:
            if data[i] != 0xFF:
                i += 1
                continue
            mk = data[i + 1]
            if mk in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB):
                h, w = struct.unpack('>HH', data[i + 5:i + 9])
                return w, h
            if mk in (0xD8, 0xD9) or 0xD0 <= mk <= 0xD7:
                i += 2
                continue
            seg = struct.unpack('>H', data[i + 2:i + 4])[0]
            i += 2 + seg
    if data[:6] in (b'GIF87a', b'GIF89a'):
        return struct.unpack('<HH', data[6:10])
    return None


def cmd_media(n=120, seed=20260914):
    """Bound the blind spot: how much of the image stratum is a SCANNED PAGE?"""
    pop = [r for r in load_pop() if r['stratum'] == 'media · image' and r.get('url')
           and ext_of(r['name']) in ('jpg', 'jpeg', 'png', 'gif')]
    random.seed(seed + 1)
    sample = random.sample(pop, min(n, len(pop)))
    mo = _office()
    rows = []
    for i, r in enumerate(sample):
        data = mo._get(r['url'], timeout=120)
        time.sleep(0.2)
        if data is None:
            rows.append({'id': r['id'], 'verdict': 'fetch failed'})
            continue
        d = _img_dims(data[:200000])
        if not d:
            rows.append({'id': r['id'], 'verdict': 'no dimensions in header'})
            continue
        w, h = d
        ar = h / w if w else 0
        page = (1.20 <= ar <= 1.45 and min(w, h) >= 900)   # letter 1.294, legal 1.647
        rows.append({'id': r['id'], 'w': w, 'h': h, 'ar': round(ar, 3),
                     'verdict': 'PAGE-SHAPED (a scan is possible)' if page
                                else 'not page-shaped (photo/graphic)'})
        if (i + 1) % 25 == 0:
            print(f'  {i + 1}/{len(sample)}', flush=True)
    with open(os.path.join(PEN, 'media-probe.jsonl'), 'w') as f:
        for r in rows:
            f.write(json.dumps(r) + '\n')
    c = collections.Counter(r['verdict'] for r in rows)
    print(f'\nIMAGE STRATUM PROBE — {len(rows)} of {len(pop):,} image keys '
          f'(seed {seed + 1})')
    for k, v in c.most_common():
        print(f'  {v:5d}  {k}   ({100 * v / len(rows):.1f}%)')
    page = c['PAGE-SHAPED (a scan is possible)']
    print(f'\n  Page-shaped rate {100 * page / len(rows):.1f}% of the image stratum '
          f'-> at most ~{round(len(pop) * page / len(rows)):,} of {len(pop):,} image '
          f'keys could be scanned pages this census does not classify.')
    print('  The heuristic reads the HEADER only: aspect ratio 1.20-1.45 and the '
          'short side >= 900px. It cannot tell a scanned page from a tall poster, '
          'so this is an UPPER bound on the blind spot, not an estimate of it.')


def _office_read(data, ct=None):
    """What the PLANE's format registry does with these bytes — `tools/d66-office-read.mjs`,
    which calls `detectFormat` and the matched entry's `text()`. One JSON object."""
    import subprocess, tempfile
    with tempfile.NamedTemporaryFile(dir=PEN, suffix='.bin', delete=False) as f:
        f.write(data)
        path = f.name
    try:
        p = subprocess.run(['node', os.path.join(HERE, 'd66-office-read.mjs'), path]
                           + ([ct] if ct else []), capture_output=True, text=True,
                           timeout=120)
        line = [l for l in p.stdout.splitlines() if l.startswith('{')]
        return json.loads(line[-1]) if line else {'error': (p.stderr or '')[-200:]}
    except Exception as e:
        return {'error': str(e)[:200]}
    finally:
        os.remove(path)


_CT = {'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
       'xls': 'application/vnd.ms-excel', 'csv': 'text/csv',
       'ods': 'application/vnd.oasis.opendocument.spreadsheet'}
SHEET_EXT = ('xlsx', 'xls', 'csv', 'ods', 'xlsm')


def holds(row, text):
    """What a document HOLDS, read off its body: the arm that fired, its title
    lines, the fiscal periods it names, its amounts, and its table's shape."""
    f = fam_budget_dataset(norm(text), text) if text else {}
    rows, width, share, header, records = _table_shape(text) if text else (0, 0, 0, 0, 0)
    fy = collections.Counter(re.sub(r'\s+', ' ', m.strip()) for m in FISCAL.findall(norm(text)))
    hdr = ''
    for l in text.split('\n'):
        cells = l.split('\t') if '\t' in l else l.split(',')
        if sum(1 for c in cells if c.strip()) >= 3 and not l.startswith('[sheet'):
            hdr = ' | '.join(c.strip()[:24] for c in cells if c.strip())[:220]
            break
    fr = fam_financial_report(norm(text)) if text else {}
    return {
        'arm': [a for a, ok in (('budget', f and budget_arm(f)),
                                ('dataset', f and dataset_arm(f)),
                                # FW-22: and whether BOB #32's type took it, so a read
                                # sample says which of the three arms a document is in.
                                ('financial report', fr and financial_report_arm(fr)),
                                ) if ok],
        'budget_arm_d66': bool(f) and budget_arm_d66(f),
        'fr_families': [k for k, v in fr.items() if v and not k.startswith('_')],
        'titles': [t[:90] for t in titles(norm(text), k=4)],
        'fiscal_periods': [k for k, _ in fy.most_common(4)],
        'amounts': f.get('_money', 0), 'table_rows': rows, 'table_width': width,
        'first_row_of_cells': hdr,
        'sheets': len(re.findall(r'^\[sheet\d+', text, re.M)),
    }


def cmd_readsample(k=25, m=45, seed=20260924):
    """D-66's READ SAMPLE, two halves, each a fixed-seed draw stated with its N.
    A · up to k documents the BODY SAMPLE judged budget_dataset: re-read, and what
        each holds recorded (`holds`), plus the plane's office entry for a sheet.
    B · m keys drawn from the SPREADSHEET keys of the whole population (xlsx, xlsm,
        xls, csv, ods): does the plane's registry read each, and does this census
        judge it a dataset? This answers BREADTH §2's "a dataset may already be
        read as a spreadsheet by the office entries" by measurement.
    C · FW-22: EVERY document the body sample judged `financial_report`, re-read the
        same way, so BOB #32's new class is READ and not only counted — and half A,
        drawn from the RECOUNTED budget_dataset set, no longer holds them."""
    tmp = os.path.join(PEN, 'rs.tmp')
    body = [json.loads(l) for l in open(os.path.join(PEN, 'body-class.jsonl'))]
    pop = {r['id']: r for r in load_pop()}
    hit = sorted([r for r in body if 'budget_dataset' in r['classes']], key=lambda r: r['id'])
    random.seed(seed)
    a = random.sample(hit, min(k, len(hit)))
    sheets = sorted([r for r in pop.values() if ext_of(r['name']) in SHEET_EXT],
                    key=lambda r: r['id'])
    random.seed(seed + 1)
    b = random.sample(sheets, min(m, len(sheets)))
    print(f'READ SAMPLE A — {len(a)} of the {len(hit)} budget_dataset documents in the '
          f'body sample (seed {seed}).\nREAD SAMPLE B — {len(b)} of the '
          f'{len(sheets):,} spreadsheet keys in the population (seed {seed + 1}).', flush=True)
    c = sorted([r for r in body if 'financial_report' in r['classes']],
               key=lambda r: r['id'])
    print(f'READ SAMPLE C — all {len(c)} financial_report documents in the body sample '
          f'(FW-22; not a draw, the whole class).', flush=True)
    for half, recs in (('A', a), ('B', b), ('C', c)):
        if not recs:
            continue            # a half drawn with N = 0 is not run, and not rewritten
        out = os.path.join(PEN, f'readsample-{half}.jsonl')
        with open(out, 'w') as f:
            for r in recs:
                rec = pop[r['id']]
                row, text = read_one(rec, tmp)
                row['half_rs'] = half
                row['holds'] = holds(row, text)
                if ext_of(rec['name']) in SHEET_EXT:
                    data = _office()._get(rec['url'], timeout=300)
                    row['office'] = (_office_read(data, _CT.get(ext_of(rec['name'])))
                                     if data is not None else {'error': 'fetch failed'})
                f.write(json.dumps(row) + '\n')
                f.flush()
                o = row.get('office', {})
                print(f"  [{half}] {rec['name'][:70]:70s} {','.join(row['classes']) or '-':28s} "
                      f"arm={'+'.join(row['holds']['arm']) or '-':15s} "
                      f"office={o.get('format', '-')}{'/read' if o.get('ok') else ''}",
                      flush=True)
                time.sleep(0.25)
        print(f'-> {out}')


def _bd_fams(r):
    return set(r.get('fams', {}).get('budget_dataset', []))


def _d66_budget(r):
    """D-66's budget arm, re-derived from the families the row RECORDED — the
    baseline the recount is measured against (FW-22)."""
    f = _bd_fams(r)
    return ('money density (>=40 amounts and >=4/100w)' in f
            and ('self-naming (title line)' in f
                 or ('fiscal period named (>=3)' in f
                     and 'ledger vocabulary (>=3 of 11)' in f)))


def _fw22_budget(r):
    """The same arm with BOB #32's conjunct."""
    return _d66_budget(r) and (
        'not an audited financial statement (BOB #32)' in _bd_fams(r))


def cmd_derive():
    names = [json.loads(l) for l in open(os.path.join(PEN, 'name-class.jsonl'))]
    print('=' * 78)
    print('M0-32 — DOCUMENT-CLASS CENSUS over COFF-6\'s corpus. Every figure below '
          'is re-derived\nfrom the logs in ' + PEN + ', so none of it needs a second '
          'network run.')
    print('=' * 78)
    ok1 = print_tally('NAME CENSUS over the WHOLE corpus', tally(names),
                      'evidence = the key path / attachment name only')
    text_only = [r for r in names if 'name' in r]
    ok2 = print_tally('NAME CENSUS restricted to the TEXT-BEARING stratum',
                      tally(text_only), 'the population a body read could reach')

    bp = os.path.join(PEN, 'body-class.jsonl')
    if not os.path.exists(bp):
        print('\n(no body sample yet)')
        return ok1 and ok2
    bodies = [json.loads(l) for l in open(bp)]
    ok3 = print_tally('BODY SAMPLE', tally(bodies),
                      f'evidence = the document text; {len(bodies)} of '
                      f'{len(text_only):,} text-bearing items')

    # ---- D-66: what the fifth class is made of, and what reader found it --------
    if any('reader' in r for r in bodies):
        readers = collections.Counter(r.get('reader', '?').split(' REFLOWED')[0] for r in bodies)
        print('\nREADER — which reader produced the text each document was judged on (D-66):')
        for k, v in readers.most_common():
            print(f'    {v:5d}  {k}')
        print(f'    {sum(1 for r in bodies if "REFLOWED" in r.get("reader", "")):5d}  '
              f'of them plane text REFLOWED (one glyph per line; D-481)')
        t1 = [{'id': r['id'], 'classes': r.get('classes_t1', r['classes']),
               'reason': r.get('reason_t1', r['reason'])} for r in bodies]
        print_tally('BODY SAMPLE, THIS INSTRUMENT\'S TIER 1 ALONE (M-18\'s reader, '
                    'comparable with M-18)', tally(t1), 'no escalation to the plane')
        bd = [r for r in bodies if 'budget_dataset' in r['classes']]
        fam = lambda r: set(r['fams'].get('budget_dataset', []))
        def arm_of(r):
            f = fam(r)
            b = ('money density (>=40 amounts and >=4/100w)' in f and (
                'self-naming (title line)' in f or ('fiscal period named (>=3)' in f
                                                   and 'ledger vocabulary (>=3 of 11)' in f)))
            d = {'record table (>=20 rows of one width >=3)', 'header row names the columns',
                 'the table is the body (>=60% of lines)',
                 'rows are distinct records carrying values'} <= f
            return 'budget + dataset' if b and d else 'budget' if b else 'dataset' if d else '??'
        arms = collections.Counter(arm_of(r) for r in bd)
        print(f'\nBUDGET OR DATASET — {len(bd)} documents in the body sample, by the ARM '
              f'that fired\n  (re-derived from the recorded families; `??` would be a '
              f'record the families cannot explain):')
        for k, v in arms.most_common():
            print(f'    {v:5d}  {k}')
        print(f'    {sum(1 for r in bd if str(r.get("gate", "")).startswith("dataset arm past")):5d}'
              f'  of them judged PAST the prose gate (a body of figures, not prose)')
        print('  by container (the key\'s extension):')
        for k, v in collections.Counter(r['ext'] or '(none)' for r in bd).most_common():
            print(f'    {v:5d}  .{k}')
        print('  and with another class as well:')
        for k, v in collections.Counter(' + '.join(sorted(r['classes'])) for r in bd
                                        if len(r['classes']) > 1).most_common():
            print(f'    {v:5d}  {k}')
        exts = collections.Counter(r['ext'] for r in bodies)
        print('  the sample\'s spreadsheet keys, for scale: ' + ', '.join(
            f'.{e} {exts[e]}' for e in SHEET_EXT if exts[e]))

    # ---- FW-22: THE RECOUNT, and what the seventh class is made of -----------
    if any('not an audited financial statement (BOB #32)' in r['fams'].get(
            'budget_dataset', []) for r in bodies):
        print('\n' + '-' * 78)
        print('FW-22 — BOB #32, 2026-09-24: AN AUDITED FINANCIAL STATEMENT IS NOT A '
              'BUDGET.\nRe-derived from the recorded families, so the recount is a '
              'DIFFERENCE this instrument\nprints and not one a reader must take on '
              'faith. `budget_arm_d66` is D-66\'s arm\nexactly; `budget_arm` is the '
              'same arm with BOB #32\'s conjunct.')
        d66 = [r for r in bodies if _d66_budget(r)]
        moved = [r for r in bodies if _d66_budget(r) and not _fw22_budget(r)]
        keptb = [r for r in bodies if _fw22_budget(r)]
        frs = [r for r in bodies if 'financial_report' in r['classes']]
        print(f'  D-66\'s BUDGET ARM took          {len(d66):4d} documents')
        print(f'  BOB #32 excludes                {len(moved):4d} — audited financial '
              f'statements, counted apart')
        print(f'  the RECOUNTED budget arm keeps  {len(keptb):4d}')
        print(f'  FINANCIAL REPORT, counted in its own right (the arm asked of every '
              f'body, not\n  only of the ones the budget arm took): {len(frs)} — of '
              f'which {len(moved)} came from D-66\'s budget count\n  and '
              f'{len(frs) - len(set(r["id"] for r in moved) & set(r["id"] for r in frs))} '
              f'the budget arm never had.')
        print('  THE DOCUMENTS THE RECOUNT MOVED, named:')
        for r in moved or []:
            print(f"    - {r['name'][:72]}")
        if not moved:
            print('    (none — a FINDING about this sample, recorded rather than '
                  'smoothed)')
        print('  FINANCIAL REPORT — by the family that carried it:')
        fc = collections.Counter()
        for r in frs:
            for k in r['fams'].get('financial_report', []):
                fc[k] += 1
        for k, v in fc.most_common():
            print(f'    {v:5d}  {k}')
        print('  by container: ' + (', '.join(
            f'.{k or "(none)"} {v}' for k, v in collections.Counter(
                r['ext'] for r in frs).most_common()) or '(none)'))
        multi = collections.Counter(' + '.join(sorted(r['classes'])) for r in frs
                                    if len(r['classes']) > 1)
        print('  and with another class as well: ' + (', '.join(
            f'{k} ({v})' for k, v in multi.most_common()) or '(none)'))
        print('-' * 78)

    N = len(text_only)
    n = len(bodies)
    print(f'\nSCALED TO THE TEXT-BEARING STRATUM ({N:,} items) — the figure that '
          f'SETS THE ORDER.\n  A binomial standard error on n = {n}; the interval is '
          f'+/- 1.96 SE, stated because an\n  order decided inside the noise would '
          f'not be a decision.')
    t = tally(bodies)
    est = []
    for c in CLASSES:
        anyc = t['single'][c] + sum(v for k, v in t['multi'].items() if c in k.split(' + '))
        p = anyc / n if n else 0
        se = (p * (1 - p) / n) ** .5 if n else 0
        est.append((c, anyc, p, round(N * p), round(N * 1.96 * se)))
    print(f'  {"class":18s}{"in sample":>10s}{"rate":>9s}{"scaled":>10s}{"+/- 95%":>10s}')
    for c, a, p, sc, ci in sorted(est, key=lambda e: -e[1]):
        print(f'  {c:18s}{a:10d}{100 * p:8.1f}%{sc:10,d}{ci:10,d}')

    print('\nTHE ORDER THE CENSUS SETS. `meeting_agenda` and `meeting_calendar` are '
          'ALREADY\nregistered (`docprofile/doctypes/registry.mjs`), so BREADTH §2\'s '
          'order is over the four\nUNREGISTERED candidates. Agendas are counted '
          'anyway, and their rank is a control:\nif the census could not find the '
          'class the plane already reads, it is measuring nothing.')
    unreg = [e for e in est if e[0] != 'agenda']
    for i, (c, a, p, sc, ci) in enumerate(sorted(unreg, key=lambda e: -e[1]), 1):
        print(f'  {i}. {c:16s} ~{sc:,} documents (+/- {ci:,})')
    ag = [e for e in est if e[0] == 'agenda'][0]
    print(f'  [control] agenda    ~{ag[3]:,} documents — the registered class, '
          f'rank {sorted([e[1] for e in est], reverse=True).index(ag[1]) + 1} of '
          f'{len(est)} by count')

    # The two independent intervals above OVERLAP, which does not settle whether the
    # classes differ: the two counts come from the SAME 600 documents, so the honest
    # comparison is PAIRED. Only documents that are one class and not the other carry
    # any information about which is larger.
    # FW-24: the sample size was printed as a literal 600 (M-18's n) through M-126, M-143 and M-152's
    # n = 1,000 walks; it is the walk's own n.
    print('\nIS THE ORDER REAL? A PAIRED comparison of each adjacent pair — the two '
          f'counts come\n  from the same {n:,} documents, so only the DISCORDANT ones '
          'carry information.')
    memb = {c: {r['id'] for r in bodies if c in r['classes']} for c in CLASSES}
    ranked = [c for c, a, p, sc, ci in sorted(est, key=lambda e: -e[1])]
    for hi, lo in zip(ranked, ranked[1:]):
        b = len(memb[hi] - memb[lo])
        cc = len(memb[lo] - memb[hi])
        d = b - cc
        se = ((b + cc - d * d / n) ** .5) if (b + cc) else 0.0
        z = d / se if se else 0.0
        verdict = ('SEPARATED (|z| >= 1.96)' if abs(z) >= 1.96
                   else 'NOT SEPARATED — the census does not order these two')
        print(f'  {hi} > {lo}? discordant {b} vs {cc}, difference {d}, '
              f'z = {z:.2f} -> {verdict}')
    print(f'  {"class":18s}{"body":>7s}{"name":>7s}{"both":>7s}{"recall":>9s}'
          f'{"precision":>11s}')
    for c in CLASSES:
        b = {r['id'] for r in bodies if c in r['classes']}
        nm = {r['id'] for r in bodies if c in r['name_classes']}
        both = b & nm
        rc = f'{100 * len(both) / len(b):.0f}%' if b else 'n/a'
        pr = f'{100 * len(both) / len(nm):.0f}%' if nm else 'n/a'
        print(f'  {c:18s}{len(b):7d}{len(nm):7d}{len(both):7d}{rc:>9s}{pr:>11s}')
    print('  RECALL is the share of body-recognised documents whose FILENAME also '
          'said so —\n  i.e. how blind the whole-corpus name census is. PRECISION is '
          'the share of\n  name-recognised documents the body agrees with.')

    gt = [r for r in bodies if r.get('matter_type')]
    if gt:
        print(f'\nGROUND TRUTH — Legistar\'s publisher-declared MatterTypeName vs the '
              f'body recogniser\n  ({len(gt)} sampled attachments carry one):')
        m = collections.Counter()
        for r in gt:
            m[(r['matter_type'], ' + '.join(r['classes']) or '(none)')] += 1
        for (mt, cs), v in m.most_common(20):
            print(f'    {v:4d}  declared `{mt}` -> recognised `{cs}`')

    print('\nTEXT QUALITY OF THE `other` PILE — the bound on the one contamination '
          'this census\n  cannot remove. A partly subsetted PDF decodes partly; it '
          'passes the usability\n  gate and is scored `other` if its class evidence '
          'sat in the part that did not\n  decode. The function-word rate is the '
          'proxy, and the LOW band is where such a\n  document would hide:')
    oth = [r for r in bodies if not r['classes'] and not r['reason'].startswith(
        ('no text layer', 'text too short', 'extracted bytes', 'fetch failed',
         'container kind'))]
    bands = collections.Counter()
    for r in oth:
        v = r.get('fw_rate', 0)
        bands['0.04-0.08 (marginal — a partial decode would sit here)'
              if v < 0.08 else '0.08-0.15 (thin but plausible prose)'
              if v < 0.15 else '>=0.15 (ordinary English prose)'] += 1
    for k, v in sorted(bands.items()):
        print(f'    {v:5d}  {k}')
    marg = sum(v for k, v in bands.items() if k.startswith('0.04'))
    print(f'  So at most {marg} of the {len(oth)} `other` documents '
          f'({100 * marg / max(1, len(oth)):.0f}%) could be a mis-scored member of '
          f'some class.\n  This is an UPPER bound, and it is stated rather than '
          f'subtracted.')

    # ---- D-66's READ SAMPLE, if taken ----------------------------------------
    for half in ('A', 'B', 'C'):
        rp = os.path.join(PEN, f'readsample-{half}.jsonl')
        if not os.path.exists(rp):
            continue
        rs = [json.loads(l) for l in open(rp)]
        print(f'\nREAD SAMPLE {half} — N = {len(rs)}; per document: container, the census '
              f'verdict, the arm, and what the\n  PLANE\'s format registry did with the '
              f'bytes (a spreadsheet only):')
        for r in rs:
            o, h = r.get('office') or {}, r['holds']
            off = ('-' if not o else
                   f"{o.get('format')}" + (f" read: {o.get('sheets')} sheet(s), {o.get('cells')} cells"
                                          if o.get('has_text_entry') else ' (no entry)')
                   + (' — ' + o['undetermined_why'] if o.get('undetermined_why') else ''))
            print(f"    .{r['ext']:5s} {r['name'].rsplit('/', 1)[-1][:58]:58s} "
                  f"{'+'.join(r['classes']) or '-':26s} {'+'.join(h['arm']) or '-':15s} {off}")
        sh = [r for r in rs if r.get('office')]
        if sh:
            c = collections.Counter(
                (r['ext'], 'READ by an entry' if (r['office'].get('has_text_entry')
                                                 and (r['office'].get('cells') or 0) > 0)
                 else 'entry answered, 0 cells' if r['office'].get('has_text_entry')
                 else 'NO entry (undetermined)',
                 'dataset' if 'budget_dataset' in r['classes'] else 'not') for r in sh)
            print(f'  SPREADSHEETS IN HALF {half} ({len(sh)}): container × what the plane did '
                  f'× the census verdict')
            for (e, what, v), n_ in sorted(c.items()):
                print(f'    {n_:4d}  .{e:5s} {what:28s} census: {v}')

    print('\nREACH AND BLIND SPOTS — what this instrument can and cannot see:')
    for line in REACH:
        print('  ' + line)
    return ok1 and ok2 and ok3


REACH = [
    '· It reads the TEXT-BEARING stratum only. Every other stratum is counted and',
    '  NAMED above, never scored into a class. The image stratum is the big one and',
    '  the `media` mode bounds it with a measurement rather than a shrug.',
    '· A PDF with no text layer (a scan) yields nothing, and is UNCLASSIFIED with',
    '  that reason. It is NOT `other`: `other` means text was read and no class was',
    '  met. This instrument is a tier-1 reader by construction and does not OCR.',
    '· A PDF whose fonts are subsetted with a custom encoding yields glyph bytes,',
    '  not English. The function-word-rate test catches that and names it; without',
    '  the test those documents would have read as confident zeros for every class.',
    '· Legacy OLE2 (.doc/.xls/.ppt) is read by recovering printable runs from the',
    '  bytes — no stdlib OLE2 parser exists. Weak, and the usability test is what',
    '  stops a weak read becoming a wrong answer.',
    '· The name layer sees only what the publisher chose to put in a filename. Its',
    '  recall is MEASURED above, not assumed, and it is the reason the order is set',
    '  from the body sample rather than from the whole-corpus name count.',
    '· A class is a threshold over independent evidence families, so a spelling this',
    '  file never saw can still be recognised; but a document that states its kind',
    '  ONLY in a graphic (a letterhead image) is invisible to every family here.',
    '· The Legistar half is COFF-6\'s SHAPE but necessarily a different DRAW: "the',
    '  200 most recently modified matters" is not the same 200 it was on 2026-08-03',
    '  (M-13 recorded the same limit).',
]


# ---------------------------------------------------------------------------
# NEGATIVE CONTROLS
# ---------------------------------------------------------------------------
CLASSIFICATION_PATH = (
    # Every top-level name the verdict of `classify_body`/`judge` depends on. M-126
    # (D-66) had to say its post-sample edits touched no classification path "from the
    # edit history, NOT from a hash of the classification functions, which was not
    # taken". FW-22 takes it: `classhash` hashes exactly these definitions out of the
    # AST, so an edit to `derive`, `holds`, `readsample` or a comment moves nothing and
    # an edit to a threshold moves the digest. A name added to a class MUST be added
    # here, and `control` asserts every FAMS entry and every arm is in the list.
    'MONEY', 'FISCAL', 'LEDGER', '_BUDGET_TITLE', '_EMPTYISH', '_NUMCELL', '_TITLE_VERB',
    '_FR_TITLE', '_FR_OPINION', '_FR_SPINE', '_FR_ENDED', 'CLASSES',
    'LETTERS', 'WORD', 'STOP',
    'norm', '_head', 'titles', 'self_names', 'usable', 'judge',
    'fam_agenda', 'fam_minutes', 'fam_staff_report', 'fam_ordinance_res',
    'fam_directory', 'fam_budget_dataset', 'fam_financial_report',
    '_table_shape', '_block_shape', 'budget_arm', 'budget_arm_d66', 'dataset_arm',
    'financial_report_arm', 'is_financial_report', 'meets', 'FAMS', 'classify_body',
)


def cmd_reread():
    """D-536 — RE-READ, THROUGH THE PLANE, EVERY DOCUMENT THE WALK ESCALATED, AND ATTRIBUTE EACH MOVE.

    M-143 found that a re-walk of one sample is not a re-read of it: the same documents escalated in both
    walks, and the classes of several moved, because the plane's tiers did not return the same text
    twice — and nothing could say WHICH tier's text had moved. D-536 puts a provenance on the text
    `op=pdfstructure` serves (tier and member per page, and a SHA-256 of each page's text). This mode
    hands each escalated document's KEPT bytes (`M032_KEEP=1` on the walk) to the plane a second time,
    re-judges the new text by the SAME `judge`, and for every document whose class moved says which
    tier's text changed — by the plane's own `compareProvenance`, one rule, not a second spelling here.
    Writes <pen>/reread.jsonl and prints the report. The thresholds are not touched (`classhash`)."""
    import subprocess
    body = [json.loads(l) for l in open(os.path.join(PEN, 'body-class.jsonl'))]
    esc = [r for r in body if r.get('plane_prov') and r['plane_prov'].get('sha')]
    kdir = os.path.join(PEN, 'plane-keep')
    out = os.path.join(PEN, 'reread.jsonl')
    done = {}
    if os.path.exists(out):
        for l in open(out):
            try:
                x = json.loads(l)
                done[x['id']] = x
            except Exception:
                pass
    print(f'RE-READ — {len(esc)} escalated documents in the walk; {len(done)} already re-read.', flush=True)
    t0 = time.time()
    with open(out, 'a') as f:
        for i, r in enumerate(esc):
            if r['id'] in done:
                continue
            kp = os.path.join(kdir, r['plane_prov']['sha'] + '.pdf')
            if not os.path.exists(kp):
                x = {'id': r['id'], 'name': r['name'], 'kept': False}
            else:
                data = open(kp, 'rb').read()
                text, reader, reason = plane_text({'name': r['name']}, data)
                cs, fams, rate, gate = judge(text, reason)
                x = {'id': r['id'], 'name': r['name'], 'kept': True,
                     'classes_before': r['classes'], 'classes_after': cs,
                     'reader_before': r['reader'], 'reader_after': reader, 'reason_after': reason,
                     # D-557: the provenance of the text JUDGED, which is the acquire reading's.
                     'prov_before': r['plane_prov'].get('reading_provenance'),
                     'prov_after': LAST_PLANE_ROW.get('reading_provenance')}
            f.write(json.dumps(x) + '\n')
            f.flush()
            done[x['id']] = x
            if (i + 1) % 25 == 0:
                print(f'  {i + 1} re-read ({time.time() - t0:.0f}s)', flush=True)
    rows = [done[r['id']] for r in esc if r['id'] in done]
    kept = [x for x in rows if x.get('kept')]
    pairs = [{'id': x['id'], 'a': x.get('prov_before'), 'b': x.get('prov_after')} for x in kept]
    pj = os.path.join(PEN, 'reread-pairs.json')
    json.dump(pairs, open(pj, 'w'))
    rp = os.path.join(HERE, '..', 'bio-plane', 'src', 'readingprov.mjs')
    js = ('import { readFileSync } from "node:fs"; import { compareProvenance } from "' + os.path.abspath(rp)
          + '"; const ps = JSON.parse(readFileSync(process.argv[1], "utf8")); '
          + 'console.log(JSON.stringify(ps.map((p) => ({ id: p.id, ...compareProvenance(p.a, p.b) }))));')
    p = subprocess.run(['node', '--input-type=module', '-e', js, pj], capture_output=True, text=True)
    if p.returncode != 0:
        sys.exit('reread: the comparison failed: ' + p.stderr[:400])
    cmp = {c['id']: c for c in json.loads(p.stdout)}
    moved = [x for x in kept if sorted(x['classes_before']) != sorted(x['classes_after'])]
    states = {}
    for x in kept:
        st = cmp[x['id']]['state']
        states[st] = states.get(st, 0) + 1
    print(f'\nRE-READ OF {len(rows)} ESCALATED DOCUMENTS — {len(kept)} with kept bytes, '
          f'{len(rows) - len(kept)} without (walked before M032_KEEP)')
    print('  the text the plane served, second read against first: '
          + ', '.join(f'{k} {v}' for k, v in sorted(states.items())))
    print(f'  CLASS MOVED on {len(moved)} document(s):')
    for x in moved:
        c = cmp[x['id']]
        print(f"    {x['name']}: {x['classes_before']} -> {x['classes_after']} — {c['state']}: {c['says']}")
    silent = [x for x in moved if cmp[x['id']]['state'] not in ('differs',)]
    print(f'  moved with the text NOT attributed to a tier: {len(silent)}'
          + ('' if not silent else ' — ' + ', '.join(x['name'] for x in silent)))
    return 0


def cmd_classhash():
    """The digest of the CLASSIFICATION PATH alone — the claim M-126 could not make."""
    import ast, hashlib
    src = open(os.path.abspath(__file__), encoding='utf-8').read()
    tree = ast.parse(src)
    seg, missing = [], []
    for name in CLASSIFICATION_PATH:
        node = None
        for nd in tree.body:
            if isinstance(nd, (ast.FunctionDef, ast.ClassDef)) and nd.name == name:
                node = nd
            elif isinstance(nd, ast.Assign) and any(
                    isinstance(t, ast.Name) and t.id == name for t in nd.targets):
                node = nd
        if node is None:
            missing.append(name)
            continue
        seg.append(name + '\n' + ast.get_source_segment(src, node))
    if missing:
        sys.exit('classhash: NOT IN THE FILE: ' + ', '.join(missing))
    blob = '\n'.join(seg).encode()
    print(f'classification path: {len(CLASSIFICATION_PATH)} definitions, '
          f'{len(blob):,} bytes')
    print('sha256 ' + hashlib.sha256(blob).hexdigest())
    return 0


def cmd_control():
    fails, arms = [], 0

    def chk(label, cond, detail=''):
        nonlocal arms
        arms += 1
        print(f'  [{"PASS" if cond else "FAIL"}] {label}{(" :: " + detail) if detail else ""}')
        if not cond:
            fails.append(label)

    print('M0-32 NEGATIVE CONTROLS — each arm declares what MUST happen before it runs.\n')

    # ---- 1 · the recogniser fires on planted documents of each class ----------
    print('ARM 1 — a planted document of each class MUST be recognised as that class.')
    FIX = {
        'agenda': """
            CITY OF OAKLAND
            SPECIAL MEETING AGENDA OF THE PUBLIC WORKS COMMISSION
            Wednesday, March 12, 2025, 6:00 p.m. -- Hearing Room One
            1. Call to Order
            2. Roll Call
            3. Open Forum / Public Comment
            4. Consent Calendar
            5. Item 1: The Commission will consider a report on street paving and
               shall take action to be heard by the Council of the City of Oakland.
            6. Adjournment
            This agenda is subject to change of the order of business at the
            discretion of the chair, and the city shall post it in advance.
        """,
        'minutes': """
            DRAFT MINUTES OF THE REGULAR MEETING
            OF THE OAKLAND CIVIL SERVICE BOARD
            The meeting was called to order at 5:35 p.m. on June 4, 2025.
            Members Present: Chair Adams, Vice Chair Brown, Member Chen.
            Members Absent: Member Diaz (excused).
            Item 3. Moved by Member Chen, seconded by Vice Chair Brown, to approve
            the report of the staff on the classification of positions in the city.
            Ayes: 3  Noes: 0  Abstain: 0. The motion carried unanimously by a vote
            of the board, and the item was approved as presented to the members.
            There being no further business the meeting adjourned at 6:42 p.m.
        """,
        'staff_report': """
            TO: Honorable Mayor and City Council
            FROM: Department of Transportation
            SUBJECT: Paving Program Contract Award
            DATE: April 2, 2025
            EXECUTIVE SUMMARY
            Staff recommends that the Council adopt a resolution awarding a
            contract for the paving of streets in the city.
            BACKGROUND
            The program was established by the council and is administered by the
            department in coordination with other agencies of the city.
            ANALYSIS
            The bids were reviewed and the lowest responsive bidder is identified.
            FISCAL IMPACT
            Funds are available in the Measure KK fund for this purpose.
            PUBLIC OUTREACH
            Notice was provided to the public and to the affected neighborhoods.
            COORDINATION
            This report was reviewed by the Office of the City Attorney.
            ACTION REQUESTED
            That the Council adopt the resolution as recommended by the staff.
        """,
        'ordinance_res': """
            RESOLUTION NO. 90210 C.M.S.
            INTRODUCED BY COUNCILMEMBER SMITH
            A RESOLUTION AUTHORIZING THE CITY ADMINISTRATOR TO ENTER INTO AN
            AGREEMENT FOR THE PAVING OF STREETS IN THE CITY OF OAKLAND
            WHEREAS, the city is responsible for the maintenance of its streets; and
            WHEREAS, the council of the city has appropriated funds for that
            purpose in the budget adopted by this body; and
            NOW, THEREFORE, BE IT RESOLVED that the City Administrator is hereby
            authorized to execute the agreement on behalf of the city; and be it
            FURTHER RESOLVED that Section 2.04.020 of the Oakland Municipal Code
            is hereby amended to read as follows.
        """,
        'directory': """
            CITY OF OAKLAND STAFF DIRECTORY AND CONTACT LIST
            This is the roster of the offices of the city and their contact points.
            Office of the Mayor  (510) 238-3141  mayor@oaklandca.gov
            City Administrator  (510) 238-3301  admin@oaklandca.gov
            City Attorney  (510) 238-3601  attorney@oaklandca.gov
            City Auditor  (510) 238-3378  auditor@oaklandca.gov
            City Clerk  (510) 238-3611  clerk@oaklandca.gov
            Finance  (510) 238-3859  finance@oaklandca.gov
            Fire  (510) 238-3856  fire@oaklandca.gov
            Police  (510) 777-3333  police@oaklandca.gov
            Public Works  (510) 615-5566  pwa@oaklandca.gov
            Planning  (510) 238-3941  planning@oaklandca.gov
            Parks  (510) 238-7275  parks@oaklandca.gov
            Library  (510) 238-3134  library@oaklandca.gov
        """,
        # D-66: a budget's own schedule — amounts in its table, the fiscal period
        # throughout, the ledger's vocabulary. Generated, so the density is real.
        'budget_dataset': (
            "CITY OF OAKLAND FY 2025-27 ADOPTED BUDGET\n"
            "Summary of Appropriations by Fund, FY 2025-26 and FY 2026-27\n"
            "General Purpose Fund expenditures, revenues, fund balance and FTE\n"
            + ''.join(f"Fund {1000 + i} Department {i} Personnel "
                      f"${(i + 3) * 104729:,} ${(i + 5) * 98311:,} {i + 2}.00 FTE\n"
                      for i in range(60))),
        # FW-22, BOB #32. PLANTED TO BE TAKEN BY D-66'S BUDGET ARM — it carries the FY
        # tokens and the ledger vocabulary a real ACFR carries, which is exactly how
        # M-126's rows 14 and 15 were counted as budgets. So the ONLY thing keeping it
        # out of the budget count is the exclusion, and ARM 8's fold-back moves one
        # variable. Generated, so the money density is real.
        'financial_report': (
            "CITY OF OAKLAND, CALIFORNIA\n"
            "COMPREHENSIVE ANNUAL FINANCIAL REPORT\n"
            "For the Fiscal Year Ended June 30, 2010 (FY 2009-10)\n"
            "INDEPENDENT AUDITOR'S REPORT\n"
            "We have audited the accompanying financial statements of the governmental "
            "activities and each major fund of the City of Oakland as of and for the "
            "year ended June 30, 2010.\n"
            "In our opinion, the financial statements referred to above present fairly, "
            "in all material respects, the respective financial position of the city.\n"
            "MANAGEMENT'S DISCUSSION AND ANALYSIS\n"
            "STATEMENT OF NET POSITION\n"
            "STATEMENT OF ACTIVITIES\n"
            "BALANCE SHEET - GOVERNMENTAL FUNDS\n"
            "NOTES TO THE BASIC FINANCIAL STATEMENTS\n"
            "REQUIRED SUPPLEMENTARY INFORMATION\n"
            "Schedule of revenues, expenditures and fund balance, General Fund, "
            "FY 2009-10 and FY 2008-09, in thousands:\n"
            + ''.join(f"Fund {1000 + i} General Fund revenues expenditures "
                      f"{(i + 3) * 104729:,} {(i + 5) * 98311:,} {(i + 7) * 41113:,}\n"
                      for i in range(60))),
    }
    for c, txt in FIX.items():
        got, _ = classify_body(txt)
        chk(f'planted {c} is recognised', c in got, f'got {got or "[]"}')

    # ---- 2 · OVER-STRICTNESS: a spelling the file never saw must still land ----
    print('\nARM 2 — OVER-STRICTNESS. Correct documents in spellings this file does '
          'NOT enumerate\n  MUST still be recognised (the principle, not the literal), '
          'and a document of NO\n  class MUST NOT be forced into one.')
    odd_minutes = """
        SUMMARY OF PROCEEDINGS -- OAKLAND BICYCLIST AND PEDESTRIAN ADVISORY
        COMMISSION.  The commission convened at 6:04 p.m.
        Present: Ahmed, Bell, Cruz.  Absent: Duarte.
        A motion was made by Bell and second by Cruz that the board approve the
        item as presented to the members of the commission by the staff of the
        city, and on a roll call the ayes: 3, noes: 0, the motion carried.
        The commission adjourned at 7:12 p.m. with no further business before it.
    """
    got, _ = classify_body(odd_minutes)
    chk('a minutes document that never uses the word "minutes" is recognised',
        'minutes' in got, f'got {got}')
    odd_ord = """
        ORDINANCE AMENDING THE OAKLAND MUNICIPAL CODE
        The Council of the City of Oakland does ordain as follows:
        Section 1. Chapter 8.60 of the code is hereby added to read as set out in
        this instrument, and the provisions of it shall apply to the whole of the
        city on and after the effective date of this enactment by the council.
    """
    got, _ = classify_body(odd_ord)
    chk('an ordinance with no WHEREAS and no number is recognised by its enacting '
        'formula', 'ordinance_res' in got, f'got {got}')
    neutral = """
        OAKLAND PARKS AND RECREATION SUMMER CAMP BROCHURE
        Summer camp registration for the children of the city opens in the month
        of March. The programs of the department are held at sites across the
        city and are open to all of the residents of the city and to the families
        of the workers in it. A fee is charged for each of the sessions and a
        scholarship is available to those who apply for one before the deadline
        that is set by the department for the season of the year in question.
        Please bring a lunch and a bottle of water to the site on the first day.
    """
    got, _ = classify_body(neutral)
    chk('a brochure is forced into NO class (it is `other`)', got == [], f'got {got}')

    # --- DISCRIMINATION. These three arms are the instrument's own findings from
    # --- ARM 1's first run, turned into standing controls. Each is a REFERENCE to
    # --- another class being mistaken for membership of it.
    print('\n  DISCRIMINATION — a REFERENCE to another kind is not MEMBERSHIP of it.')
    chk('minutes are NOT also read as an agenda (a meeting block and numbered items '
        'are shared meeting evidence, not a tense)',
        'agenda' not in classify_body(FIX['minutes'])[0],
        f'got {classify_body(FIX["minutes"])[0]}')
    agenda_citing = """
        REGULAR MEETING AGENDA
        OAKLAND PUBLIC WORKS COMMISSION -- Monday, July 8, 2024, 5:00 p.m.
        1. Call to Order
        2. Roll Call
        3. Approval of the Minutes of the meeting of June 10, 2024
        4. Public Comment
        5. The commission will consider Resolution No. 89432 C.M.S. and
           Ordinance No. 13701 C.M.S., copies of which are attached for review
           by the members of the commission before the item is to be heard.
        6. Adjournment
    """
    got, _ = classify_body(agenda_citing)
    chk('an agenda whose item 3 is "Approval of the Minutes" is NOT read as minutes',
        'minutes' not in got, f'got {got}')
    chk('an agenda LISTING "Resolution No. NNNNN C.M.S." is NOT read as an '
        'ordinance/resolution', 'ordinance_res' not in got, f'got {got}')
    chk('...and that same agenda IS still read as an agenda', 'agenda' in got, f'got {got}')
    got = classify_name('documents/Agenda-Packet-FINAL_2024-05-13-183322_wmcf.pdf')
    chk('the NAME layer reads a spelling variant it never enumerated',
        got == ['agenda'], f'got {got}')
    got = classify_name('documents/Some-Unrelated-Brochure.pdf')
    chk('the NAME layer refuses a filename that asserts no kind', got == [], f'got {got}')

    # ---- 3 · usability: a text we cannot read is NOT a confident zero ---------
    print('\nARM 3 — an UNREADABLE body MUST be unclassified WITH A REASON, and MUST '
          'NOT read as\n  `other` (which would claim we read it and found nothing).')
    ok, why, _r = usable('')
    chk('empty text is not usable', not ok, why)
    ok, why, _r = usable('\x03\x11\x07\x02' * 400 + ' qxz vbn mlk ' * 60)
    chk('glyph soup with no function words is not usable', not ok, why)
    ok, why, _r = usable(FIX['minutes'] * 2)
    chk('real prose IS usable (over-strictness on the usability gate)', ok, why or 'usable')

    # ---- 4 · MULTI-CLASS is reported, never silently double-counted -----------
    print('\nARM 4 — a document matching TWO classes MUST be reported as multi-class '
          'and counted\n  ONCE in the conservation identity.')
    packet = FIX['agenda'] + FIX['staff_report'] + FIX['ordinance_res']
    got, _ = classify_body(packet)
    chk('an agenda packet matches more than one class', len(got) >= 2, f'got {got}')
    recs = [{'id': 'p', 'classes': got}, {'id': 'a', 'classes': ['agenda']},
            {'id': 'u', 'classes': [], 'reason': 'x'}]
    t = tally(recs)
    chk('the multi-class document is in `multi`, not added to each class total',
        sum(t['multi'].values()) == 1 and t['single']['agenda'] == 1,
        f'single={dict(t["single"])} multi={dict(t["multi"])}')
    chk('conservation holds: single + multi + unclassified == n',
        sum(t['single'].values()) + sum(t['multi'].values())
        + sum(t['unclassified'].values()) == t['n'])

    # ---- 5 · THE QUEUE ROW'S ARM: neuter one class's matcher -----------------
    print('\nARM 5 — THE M0-32 ROW\'S NEGATIVE CONTROL. With ONE class\'s matcher '
          'neutered, that\n  class MUST read ZERO and the documents it held MUST '
          'reappear — the census\n  CONSERVES DOCUMENTS. Driven on the REAL body '
          'sample if one exists, else on the\n  planted corpus. Each class neutered '
          'ALONE, the others held open.')
    bp = os.path.join(PEN, 'body-class.jsonl')
    if os.path.exists(bp):
        raw = [json.loads(l) for l in open(bp)]
        corpus = [(r['id'], r) for r in raw]
        src = f'the REAL body sample ({len(raw)} documents)'
    else:
        corpus, src = [], 'the planted corpus'
    print(f'  corpus: {src}')
    if corpus:
        base = [{'id': i, 'classes': r['classes'],
                 'reason': r.get('reason', '')} for i, r in corpus]
        bt = tally(base)
        for c in CLASSES:
            # Re-derive from the RECORDED family hits: a class is neutered by
            # dropping it from every document's class list. What the document is
            # otherwise still stands, so a single-class document becomes `other`
            # (unclassified-by-threshold) and a multi-class one loses one arm.
            # D-66: a document the DATASET ARM judged PAST THE PROSE GATE was never
            # readable prose; neutered, it returns to its unusable reason — it is
            # UNCLASSIFIED again, not `other`. The arm declares that before it runs.
            def _past(r):
                return str(r.get('gate', '')).startswith('dataset arm past the prose gate')
            nu = [{'id': r['id'], 'classes': [x for x in r['classes'] if x != c],
                   'reason': (r['gate'].split(': ', 1)[1]
                              if _past(r) and r['classes'] == [c] else r.get('reason', ''))}
                  for i, r in corpus]
            nt = tally(nu)
            held = bt['single'][c] + sum(v for k, v in bt['multi'].items()
                                         if c in k.split(' + '))
            past = sum(1 for i, r in corpus if _past(r) and r['classes'] == [c])
            only_c = bt['single'][c]          # documents whose ONLY class was c
            anyc = nt['single'][c] + sum(v for k, v in nt['multi'].items()
                                         if c in k.split(' + '))
            chk(f'neuter `{c}`: the class reads ZERO', anyc == 0, f'got {anyc}')
            # Where the {held} documents MUST go, stated before the arm is read: the
            # {only_c} that were only this class become `other` (they were READ and
            # now meet no threshold), the rest keep another class. NOTHING may become
            # unclassified — unclassified means the text could not be read, and
            # neutering a matcher does not make a document unreadable. An earlier
            # version of this arm asserted `rise + (held - rise) == held`, which is
            # true for every possible value of `rise` and therefore asserted nothing.
            d_other = nt['single']['other'] - bt['single']['other']
            d_unc = sum(nt['unclassified'].values()) - sum(bt['unclassified'].values())
            chk(f'neuter `{c}`: the {only_c - past} documents that were ONLY this '
                f'class and READ AS PROSE become `other`', d_other == only_c - past,
                f'other moved by {d_other}')
            chk(f'neuter `{c}`: exactly the {past} judged past the prose gate become '
                f'unclassified again, and nothing else does', d_unc == past,
                f'moved {d_unc}')
            def classified(x):
                return (sum(v for k, v in x['single'].items() if k != 'other')
                        + sum(x['multi'].values()))
            chk(f'neuter `{c}`: exactly {only_c} documents STOP being classified — '
                f'the other {held - only_c} keep another class',
                classified(nt) == classified(bt) - only_c,
                f'classified {classified(bt)} -> {classified(nt)}, '
                f'expected {classified(bt) - only_c}')
            chk(f'neuter `{c}`: documents CONSERVED — n unchanged and the three '
                f'buckets still sum to it',
                nt['n'] == bt['n']
                and sum(nt['single'].values()) + sum(nt['multi'].values())
                + sum(nt['unclassified'].values()) == nt['n'],
                f'n {bt["n"]}->{nt["n"]}')
    # And the SAME arm on the recogniser itself, which is where a real neutering
    # would happen: a class whose families are switched off must fire on nothing.
    for c in CLASSES:
        got, _ = classify_body(FIX[c], neuter=c)
        chk(f'neuter `{c}` in the RECOGNISER: its own planted fixture no longer '
            f'matches it', c not in got, f'got {got}')
        others = [x for x in CLASSES if x != c]
        got2, _ = classify_body(FIX[c], neuter=None)
        chk(f'neuter `{c}` affects NO other class (over-strictness)',
            set(classify_body(FIX[c], neuter=c)[0]) == set(got2) - {c},
            f'{sorted(set(got2) - {c})} vs {sorted(classify_body(FIX[c], neuter=c)[0])}')

    # ---- 6 · the fixture corpus is NON-EMPTY (the headline-over-nothing trap) --
    print('\nARM 6 — assertions MUST NOT pass over an empty corpus.')
    chk('the planted corpus is non-empty', len(FIX) == len(CLASSES) >= 6,
        f'{len(FIX)} fixtures')
    # FW-22: a hash over a list that has fallen behind the code is a hash of nothing.
    # The FUNCTION names, not the class names: `tuple(FAMS)` is ('agenda', ...) and
    # would have certified a list holding none of the recognisers. The arm caught that
    # on its first run, which is the whole reason it is here.
    missing = [n for n in ('FAMS', 'meets', 'classify_body', 'judge', 'usable',
                           'budget_arm', 'dataset_arm', 'financial_report_arm',
                           'is_financial_report')
               + tuple(f.__name__ for f in FAMS.values())
               if n not in CLASSIFICATION_PATH]
    chk('every recogniser the verdict depends on is in CLASSIFICATION_PATH, so '
        '`classhash` cannot certify a threshold it never read', not missing,
        f'missing {missing}')
    chk('every class has a fixture', set(FIX) == set(CLASSES))
    if os.path.exists(bp):
        chk('the real body sample is non-empty',
            len([1 for _ in open(bp)]) >= 50, f'{len([1 for _ in open(bp)])} rows')

    # ---- 7 · D-66: BUDGET OR DATASET — the arms its row and calibration demand --
    print('\nARM 7 — D-66, BUDGET OR DATASET. Each arm is a calibration finding made '
          'on a NAMED real\n  document BEFORE the sample was drawn, planted here so it '
          'stands without the network.\n  Calibration set (2026-09-24, s3://cao-94612): '
          'FY23-25 Proposed Budget Book [budget];\n  FY 2020-21 Midcycle Budget '
          'Amendments [budget + staff report]; the SUPPLEMENTAL FY 2024-25\n  GPF-deficit '
          'memo [NOT budget]; Budget Basics FY21-23 [NOT budget]; FY 2020-21 Budget Q&A\n'
          '  [NOT budget]; Item 8 COH staff report on budget recs [NOT budget]; Major '
          'Projects List\n  Mar 2020 [dataset]; Paving Plan Survey Responses [dataset]; '
          'CallNatures Public [dataset];\n  data/20230605update.csv [dataset]; NOFA '
          '2019-20 application workbook [NOT dataset];\n  Capital Improvement Calculator '
          '(.xlsx) [dataset: its sheet 3 is the amortization\n  schedule, a published '
          'reference table]; the same calculator as legacy .xls [invisible].')
    csv_rows = 'permit,address,units,issued\n' + ''.join(
        f'B{2300000 + i},{100 + i} Broadway,{i % 7 + 1},2023-06-{i % 28 + 1:02d}\n'
        for i in range(40))
    got = judge(csv_rows)
    chk('a CSV of records (almost no function words) IS budget_dataset, judged PAST '
        'the prose gate', got[0] == ['budget_dataset'] and got[3].startswith('dataset arm'),
        f'got {got[0]} gate={got[3][:40]}')
    ok, why, _r = usable(csv_rows)
    chk('...and the prose gate still refuses it (the gate is unchanged, only asked '
        'one more question)', not ok, why)
    got = judge('\x03\x11\x07\x02' * 400 + ' qxz vbn mlk ' * 60)
    chk('glyph soup is NOT a dataset past the prose gate (it stays unclassified)',
        got[0] == [] and got[3].startswith('extracted bytes'), f'got {got[0]} {got[3][:40]}')
    memo = """
        TO: HONORABLE MAYOR & CITY COUNCIL
        FROM: Director of Finance
        SUBJECT: SUPPLEMENTAL - Fiscal Year 2024-25 Midcycle Budget General Purpose Fund Deficit
        DATE: April 11, 2024
        Staff recommends that the Council receive this informational report on the
        FY 2024-25 midcycle budget. The General Purpose Fund faces a deficit of
        $176.8 million, driven by revenues below projection and expenditures above
        it; the fund balance and reserves in FY 2023-24 and FY 2024-25 are discussed,
        with appropriations and personnel costs reviewed in the attachments.
    """ * 3
    got, fams = classify_body(memo)
    chk('a memo ABOUT the budget (subject line, fiscal period, ledger words, few '
        'amounts) is NOT budget_dataset — money density is necessary',
        'budget_dataset' not in got, f'got {got}')
    chk('...and it IS read as the staff report it is', 'staff_report' in got, f'got {got}')
    got, _ = classify_body(FIX['budget_dataset'].replace('ADOPTED BUDGET',
                                                         'SCHEDULE OF APPROPRIATIONS'))
    chk('OVER-STRICTNESS: a budget schedule that never names itself a budget is still '
        'budget_dataset (money + fiscal period + ledger)', 'budget_dataset' in got,
        f'got {got}')
    amounts = [f'{w} {i + 1},{i * 7 % 1000:03d},{i * 13 % 1000:03d} {i * 31 + 9},{i % 1000:03d}'
               + (f' {i},{i:03d}' if i % 3 else '') for i, w in
               enumerate(['Personnel', 'O&M', 'Transfers', 'Capital'] * 10)]
    chk('a thousands separator is not a delimiter: a PDF column of amounts '
        '(`Personnel 1,007,013 9,000`) is not a CSV and has no cells',
        _block_shape(amounts)[0] == 0, f'{_block_shape(amounts)}')
    words = ['council', 'staff', 'public', 'auditor', 'mayor', 'clerk', 'board', 'city']
    comma_prose = ''.join(
        f'In year {2000 + i}, the {words[i % 8]} heard the {words[(i + 3) % 8]}, the '
        f'{words[(i + 5) % 8]}' + ', and the residents' * (i % 3) + f', then spent '
        f'{i + 1},{i % 10}00,000 dollars on item {i}.\n' for i in range(40))
    got, fams = classify_body(comma_prose)
    chk('PROSE WITH COMMAS (distinct sentences, varying clause counts) is NOT a dataset',
        'budget_dataset' not in got, f'got {got} fams {fams.get("budget_dataset")}')
    template = ('[sheet1 cells=200 formulas=10]\nUnit\tAMI\tRent\tTotal\n'
                + '\t\t\t\t0\n' * 40)
    got = judge('Instructions for applicants to the NOFA are below and apply to all '
                'of the units in the project and the city of the applicant. ' * 8
                + '\n' + template)
    chk('a blank TEMPLATE (repeated empty rows computing 0) is NOT a dataset',
        'budget_dataset' not in got[0], f'got {got[0]}')
    computed = ('[sheet1 cells=300 formulas=250]\nPeriod\tRate\tInterest\tBalance\n'
                + ''.join(f'{i}\t0.0{i % 9 + 1}\t{i * 13}\t{10000 - i * 97}\n'
                          for i in range(1, 60)))
    got = judge(computed)
    chk('a COMPUTED sheet (> 30% formulas) is NOT a dataset, however table-shaped',
        'budget_dataset' not in got[0], f'got {got[0]}')
    held = computed.replace('formulas=250', 'formulas=0')
    got = judge(held)
    chk('...and the SAME table with its values held (0 formulas) IS one — the formula '
        'share is the only variable moved', got[0] == ['budget_dataset'], f'got {got[0]}')
    html_table = text_in_html('<table><tr><th>Name</th><th>Beat</th><th>Phone</th></tr>'
                              + ''.join(f'<tr><td>Officer {i}</td><td>{i % 35}X</td>'
                                        f'<td>ext {4000 + i}</td></tr>' for i in range(30))
                              + '</table>')
    got = judge(html_table)
    chk('OVER-STRICTNESS: an HTML table of records is a dataset (cells kept apart by '
        'the reader)', got[0] == ['budget_dataset'], f'got {got[0]}')
    import zipfile as _zf
    buf = io.BytesIO()
    with _zf.ZipFile(buf, 'w') as z:
        z.writestr('xl/workbook.xml', '<workbook/>')
        z.writestr('xl/sharedStrings.xml',
                   '<sst xmlns="x"><si><t>Beat</t></si><si><t>Calls</t></si></sst>')
        z.writestr('xl/worksheets/sheet1.xml',
                   '<worksheet xmlns="x"><sheetData><row><c r="A1" t="s"><v>0</v></c>'
                   '<c r="B1" t="s"><v>1</v></c></row><row><c r="A2"><v>7</v></c>'
                   '<c r="C2"><f>A2*2</f><v>14</v></c></row></sheetData></worksheet>')
    x = text_in_xlsx(_zf.ZipFile(buf))
    chk('text_in_xlsx keeps NUMBERS (`<v>`), shared strings, column position and the '
        'formula count', x == '[sheet1 cells=4 formulas=1]\nBeat\tCalls\n7\t\t14',
        repr(x))
    glyph = ('F\ni\ns\nc\na\nl\n \nY\ne\na\nr\n \n' * 10)
    rt, did = reflow(glyph)
    chk('reflow undoes ONE-GLYPH-PER-LINE plane text', did and 'Fiscal Year' in rt,
        repr(rt[:30]))
    rt2, did2 = reflow(FIX['minutes'] * 5)
    chk('reflow leaves ordinary text alone (over-strictness)', not did2 and rt2 == FIX['minutes'] * 5)

    print('\n  THE ROW\'S LIAR — counting by FILENAME. The body decides; the name is '
          'measured, never counted.')
    agenda_named_budget = 'documents/FY2025-27-Adopted-Budget-Hearing.pdf'
    chk('a filename asserting a budget IS read as one by the NAME layer',
        'budget_dataset' in classify_name(agenda_named_budget),
        f'{classify_name(agenda_named_budget)}')
    got, _ = classify_body(FIX['agenda'])
    chk('...and the agenda BODY behind that name is NOT budget_dataset',
        'budget_dataset' not in got and 'agenda' in got, f'got {got}')
    chk('a budget BODY behind a filename naming no kind IS budget_dataset',
        'budget_dataset' not in classify_name('documents/Attachment-A_2024-06-10.pdf')
        and 'budget_dataset' in classify_body(FIX['budget_dataset'])[0])
    if os.path.exists(bp):
        raw = [json.loads(l) for l in open(bp)]
        body = {r['id'] for r in raw if 'budget_dataset' in r['classes']}
        name = {r['id'] for r in raw if 'budget_dataset' in r.get('name_classes', [])}
        chk('ON THE REAL SAMPLE the body count and the name count DIFFER — the name is '
            'not the evidence', body != name,
            f'body {len(body)}, name {len(name)}, both {len(body & name)}')

    # ---- 8 · FW-22: AN AUDITED FINANCIAL STATEMENT IS NOT A BUDGET ------------
    print('\nARM 8 — FW-22, BOB #32 (2026-09-24). The seventh class, and the RECOUNT '
          'it forces.\n  Calibration set, ELEVEN named real documents read from '
          's3://cao-94612 on 2026-09-24\n  BEFORE the sample was walked and not '
          'touched after: OAK025620 [the 2010 CAFR];\n  OAK071404 [the Redevelopment '
          "Agency's FY 2007-08 statements]; CAFR-2017; ORSA FY22\n  Audited Financial "
          'Statements [read at plane tier 2]; OAK063800 [the FY 2015-17 proposed\n  '
          'budget packet — NOT a financial report]; FY 2020-21 Midcycle Amendments '
          '[NOT];\n  FY25-27 Errata Budget Book [NOT]; Budget PPT June 2021 [NOT]; '
          'Semi-Annual Grants\n  Report [NOT]; INFO-MEMO on the FY23 ACFR '
          'presentation [NOT — a memo ABOUT one];\n  CAFR.htm [a landing page, 1,760 '
          'chars — NOT]. TWO MISSES, both to the reader and\n  not to a threshold: '
          '2024-Single-Audit-Report and CAFR-2020 have NO TEXT LAYER and are\n  '
          'invisible to this instrument. Recorded in the measurement and in REACH, '
          'not smoothed.')
    fr_fix = FIX['financial_report']
    got, _ = classify_body(fr_fix)
    chk('the planted ACFR IS financial_report', 'financial_report' in got, f'got {got}')
    chk('...and is NOT budget_dataset — BOB #32\'s exclusion',
        'budget_dataset' not in got, f'got {got}')
    _ff = fam_budget_dataset(norm(fr_fix), fr_fix)
    chk("...and D-66'S ARM WOULD HAVE TAKEN IT, so the fixture is not vacuous and the "
        "fold-back moves ONE variable", budget_arm_d66(_ff),
        f'D-66 arm {budget_arm_d66(_ff)}, FW-22 arm {budget_arm(_ff)}')
    no_title = fr_fix.replace('COMPREHENSIVE ANNUAL FINANCIAL REPORT\n', '')
    got, _ = classify_body(no_title)
    chk('OVER-STRICTNESS: an audited statement that never names itself a CAFR is still '
        "financial_report (the auditor's opinion carries it — measured in the wild on "
        'CAFR-2017, whose title lines are only "city of oakland | california")',
        'financial_report' in got, f'got {got}')
    got, _ = classify_body(FIX['budget_dataset'])
    chk('DISCRIMINATION: a budget is NOT a financial report',
        'financial_report' not in got and 'budget_dataset' in got, f'got {got}')
    sched = FIX['budget_dataset'] + (
        '\nBALANCE SHEET\nGOVERNMENTAL FUNDS\nThe fund statements are prepared in '
        'accordance with GASB Statement No. 54 and with generally accepted accounting '
        'principles as they apply to governmental units.\n')
    got, fams = classify_body(sched)
    # `classify_body` hands back a DICT of every family with its verdict, so `in` and
    # `sorted()` over it report families that did NOT fire — an arm written that way
    # cannot fail. Read the VALUES. (Found by this arm on its first run.)
    fired = lambda d: sorted(k for k, v in d.items() if v)
    chk('DISCRIMINATION, THE HARD ONE: a budget carrying a balance sheet, governmental '
        'funds and GASB (THREE spine hits) is STILL NOT a financial report — its period '
        'has not ENDED',
        'financial_report' not in got and 'budget_dataset' in got,
        f'got {got} fired {fired(fams.get("financial_report", {}))}')
    chk('...and the spine family DID fire, so the arm above turned on the ENDED '
        'conjunct and not on a family that never armed',
        'the audited-statement spine (>=3 of 10)' in fired(fams.get('financial_report', {})),
        f'fired {fired(fams.get("financial_report", {}))}')
    ended = sched + ('For the fiscal year ended June 30, 2024 the general fund closed; '
                     'for the year ended June 30, 2023 it did likewise.\n')
    got, _ = classify_body(ended)
    chk('...and the SAME text with a period that HAS ended IS a financial report — the '
        'ENDED conjunct is the only variable moved', 'financial_report' in got, f'got {got}')
    about = """
        TO: HONORABLE MAYOR & CITY COUNCIL
        FROM: Director of Finance
        SUBJECT: INFORMATIONAL MEMORANDUM - Fiscal Year 2023 Annual Comprehensive
        Financial Report (ACFR) Presentation
        DATE: March 19, 2024
        Staff will present the FY 2023 ACFR to the Finance and Management Committee.
        The independent auditor issued an unmodified opinion. The city closed the year
        with a general fund balance of $123,456,789 and expenditures of $1,987,654,321.
    """ * 3
    got, _ = classify_body(about)
    chk('a memo ABOUT the ACFR (self-naming subject, an opinion cited, few amounts) is '
        'NOT financial_report — money density is necessary here for D-66\'s reason',
        'financial_report' not in got, f'got {got}')
    chk('...and it IS read as the staff report it is', 'staff_report' in got, f'got {got}')
    got = classify_name('documents/2024-City-of-Oakland-ACFR_final-121324.pdf')
    chk('the NAME layer reads an ACFR filename', 'financial_report' in got, f'got {got}')
    chk('the NAME layer refuses a filename that asserts no kind',
        'financial_report' not in classify_name('documents/Attachment-A_2024-06-10.pdf'))
    if os.path.exists(bp):
        raw = [json.loads(l) for l in open(bp)]
        d66 = [r for r in raw if _d66_budget(r)]
        moved = [r for r in raw if _d66_budget(r) and not _fw22_budget(r)]
        frs = [r for r in raw if 'financial_report' in r['classes']]
        chk('ON THE REAL SAMPLE the RECOUNT MOVES: at least one document D-66 counted '
            'as budget_dataset is an audited financial statement and is now counted '
            'apart', len(moved) >= 1,
            f'D-66 budget arm {len(d66)}, moved {len(moved)}, recounted '
            f'{len(d66) - len(moved)}')
        chk('ON THE REAL SAMPLE every document the recount moved IS in the new class '
            '— it is counted APART, never dropped',
            all('financial_report' in r['classes'] for r in moved),
            f'{sum(1 for r in moved if "financial_report" not in r["classes"])} of '
            f'{len(moved)} moved out of both counts')
        chk('ON THE REAL SAMPLE the new class is non-empty', len(frs) >= 1,
            f'{len(frs)} financial_report documents')
        chk('ON THE REAL SAMPLE the recounted budget arm is exactly D-66\'s minus the '
            'moved documents — nothing else changed',
            len([r for r in raw if _fw22_budget(r)]) == len(d66) - len(moved),
            f'{len([r for r in raw if _fw22_budget(r)])} vs {len(d66)} - {len(moved)}')

    print(f'\n{arms} arms driven, {len(fails)} failed.')
    if fails:
        for f in fails:
            print('  FAILED: ' + f)
        sys.exit(1)
    print('negative controls: all arms as declared.')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__ or 'modes: list names bodies media derive control')
    m = sys.argv[1]
    if m == 'list':
        cmd_list()
    elif m == 'names':
        cmd_names()
    elif m == 'bodies':
        cmd_bodies(int(sys.argv[2]) if len(sys.argv) > 2 else 600,
                   int(sys.argv[3]) if len(sys.argv) > 3 else 20260914)
    elif m == 'media':
        cmd_media(int(sys.argv[2]) if len(sys.argv) > 2 else 120)
    elif m == 'readsample':
        cmd_readsample(*(int(x) for x in sys.argv[2:5]))
    elif m == 'derive':
        sys.exit(0 if cmd_derive() else 1)
    elif m == 'control':
        cmd_control()
    elif m == 'reread':
        sys.exit(cmd_reread())
    elif m == 'classhash':
        sys.exit(cmd_classhash())
    else:
        sys.exit('unknown mode ' + m)
