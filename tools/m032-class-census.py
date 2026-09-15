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
#   control               — NEGATIVE CONTROLS, exits 1 on any mismatch. No network.
#                           Includes the CONSERVATION arm and the NEUTERING arm the
#                           M0-32 queue row demands.
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

CLASSES = ['agenda', 'minutes', 'staff_report', 'ordinance_res', 'directory']


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


def text_in_ooxml(path):
    try:
        z = zipfile.ZipFile(path)
    except Exception:
        return ''
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
    raise KeyError(cls)


FAMS = {'agenda': fam_agenda, 'minutes': fam_minutes, 'staff_report': fam_staff_report,
        'ordinance_res': fam_ordinance_res, 'directory': fam_directory}


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
        f = FAMS[c](n)
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
    p = os.path.join(PEN, 'population.jsonl')
    if not os.path.exists(p):
        sys.exit(f'no population at {p} — run `list` first')
    return [json.loads(l) for l in open(p)]


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
    mo = _office()
    data = mo._get(rec['url'], timeout=300)
    if data is None:
        return '', 'fetch failed (network or 404)'
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
        kind, _flav = mo.classify(tmp)
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
            text, reason = _fetch_text(rec, tmp)
            rate = 0.0
            if not reason:
                ok, why, rate = usable(text)
                reason = '' if ok else why
            cs, fams = ([], {}) if reason else classify_body(text)
            f.write(json.dumps({
                'id': rec['id'], 'name': rec['name'], 'half': rec['half'],
                'ext': ext_of(rec['name']), 'size': rec.get('size'),
                'matter_type': rec.get('matter_type'),
                'chars': len(text), 'fw_rate': round(rate, 4), 'classes': cs,
                'reason': reason or 'usable text read, no class threshold met',
                'fams': {c: [k for k, v in d.items() if v] for c, d in fams.items()},
                'name_classes': classify_name(rec['name'])}) + '\n')
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
    print('\nIS THE ORDER REAL? A PAIRED comparison of each adjacent pair — the two '
          'counts come\n  from the same 600 documents, so only the DISCORDANT ones '
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
            nu = [{'id': r['id'], 'classes': [x for x in r['classes'] if x != c],
                   'reason': r.get('reason', '')} for i, r in corpus]
            nt = tally(nu)
            held = bt['single'][c] + sum(v for k, v in bt['multi'].items()
                                         if c in k.split(' + '))
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
            chk(f'neuter `{c}`: the {only_c} documents that were ONLY this class '
                f'become `other`', d_other == only_c, f'other moved by {d_other}')
            chk(f'neuter `{c}`: NOTHING becomes unclassified (a neutered matcher '
                f'cannot make a document unreadable)', d_unc == 0, f'moved {d_unc}')
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
    chk('the planted corpus is non-empty', len(FIX) == 5, f'{len(FIX)} fixtures')
    chk('every class has a fixture', set(FIX) == set(CLASSES))
    if os.path.exists(bp):
        chk('the real body sample is non-empty',
            len([1 for _ in open(bp)]) >= 50, f'{len([1 for _ in open(bp)])} rows')

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
        cmd_bodies(int(sys.argv[2]) if len(sys.argv) > 2 else 600)
    elif m == 'media':
        cmd_media(int(sys.argv[2]) if len(sys.argv) > 2 else 120)
    elif m == 'derive':
        sys.exit(0 if cmd_derive() else 1)
    elif m == 'control':
        cmd_control()
    else:
        sys.exit('unknown mode ' + m)
