#!/usr/bin/env python3
# INSTRUMENT — COFF-6 office-corpus measurement (2026-08-03, session COFF-6 worker).
# Commits no product code; this is the probe that produced the MEASUREMENTS.md entry
# "the real Oakland office corpus". Keep it re-runnable.
#
# Modes:
#   census <bucket>          — enumerate a public S3 bucket (Oakland's site assets live
#                              in cao-94612), print extension counts and full size
#                              percentiles per office extension. Network, paced.
#   sample <bucket> <dir>    — download the stratified random sample used on 2026-08-03
#                              (fixed seed 20260803: 40 docx, 30 xlsx, 12 pptx/pptm,
#                              6 doc, 4 xls, 1 ppt) plus the deliberate tail (top-3
#                              docx and top-3 xlsx by container size) into <dir>.
#                              Network, paced; the sampling method is part of the
#                              instrument.
#   analyze <dir>            — inspect every file in <dir> with python zipfile + XML:
#                              classify (OOXML flavour / OLE2 / ODF / plain-ZIP / other),
#                              count external hyperlinks, formulas, tracked changes,
#                              comments, speaker notes, hidden sheets. No network.
#   control                  — NEGATIVE CONTROL: build a plain ZIP, rename it .xlsx,
#                              assert the classifier reports NOT-OOXML. Exits 1 if the
#                              instrument would have counted it.
#
# Added 2026-09-14 by CAP-7, over the SAME corpus this file already defines:
#   drivelinks [pdfN]        — COUNT the links in this corpus whose target host is
#                              docs.google.com / drive.google.com / sheets.google.com /
#                              slides.google.com, BY KIND read from the URL shape and by
#                              WHERE the link lives (itself an asset, or inside a body).
#                              Census over the bucket keys, the html/htm and csv and
#                              OOXML bodies, and Legistar's attachment hyperlinks; a
#                              fixed-seed random SAMPLE of pdfN PDFs (default 1000 of
#                              27,783 — the PDF half is 133.6 GB and cannot be a census).
#                              Network, paced. Bodies are streamed and DELETED after
#                              reading; peak disk is one file.
#   drivederive [hits]       — every DERIVED figure (de-duplicated occurrences, distinct
#                              targets, source documents, the by-kind and by-where
#                              tables) read back out of drivelinks' hit log. No network,
#                              runs in a second, and is what makes each number in
#                              MEASUREMENTS.md traceable to a line.
#   drivecontrol             — NEGATIVE CONTROL for drivelinks: planted fixtures with a
#                              KNOWN number of Drive links of each kind in each body
#                              type, a fixture with none, an unknown Drive shape that
#                              must land in `other`, and non-Drive google.com links
#                              (maps / search / fonts / a lookalike host) that must NOT
#                              be counted. Exits 1 on any mismatch. No network.
#
# Classification is by bytes, not extension: PK\x03\x04 + [Content_Types].xml part =
# OOXML (flavour from which document part exists); PK + "mimetype" part = ODF;
# D0 CF 11 E0 A1 B1 1A E1 = OLE2 (legacy .doc/.xls/.ppt); PK without either = plain ZIP.

import sys, os, io, re, json, time, zipfile, zlib, random, collections
import urllib.request, urllib.parse
import xml.etree.ElementTree as ET

OLE2_MAGIC = b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'

def classify(path):
    """Return (kind, flavour). kind in {ooxml, odf, ole2, zip, other, empty}."""
    with open(path, 'rb') as f:
        head = f.read(8)
    if not head:
        return ('empty', None)
    if head.startswith(OLE2_MAGIC):
        return ('ole2', None)
    if not head.startswith(b'PK\x03\x04'):
        return ('other', None)
    try:
        z = zipfile.ZipFile(path)
        names = set(z.namelist())
    except zipfile.BadZipFile:
        return ('other', None)
    if 'mimetype' in names:
        try:
            mt = z.read('mimetype').decode('ascii', 'replace')
            if mt.startswith('application/vnd.oasis.opendocument'):
                return ('odf', mt.rsplit('.', 1)[-1])
        except KeyError:
            pass
    if '[Content_Types].xml' not in names:
        return ('zip', None)          # a ZIP is just a file a body might publish
    if 'word/document.xml' in names:
        return ('ooxml', 'docx')
    if 'xl/workbook.xml' in names:
        return ('ooxml', 'xlsx')
    if 'ppt/presentation.xml' in names:
        return ('ooxml', 'pptx')
    return ('ooxml', 'unknown-part-map')

def _count_tag(xml_bytes, localname):
    n = 0
    for _, el in ET.iterparse(io.BytesIO(xml_bytes)):
        if el.tag.rsplit('}', 1)[-1] == localname:
            n += 1
        el.clear()
    return n

def analyze_file(path):
    kind, flavour = classify(path)
    r = {'file': os.path.basename(path), 'size': os.path.getsize(path),
         'kind': kind, 'flavour': flavour}
    if kind != 'ooxml' or flavour == 'unknown-part-map':
        return r
    z = zipfile.ZipFile(path)
    names = z.namelist()
    # external hyperlinks: uniform across all three — .rels Relationship
    # Type=".../hyperlink" TargetMode="External"
    ext_links = 0
    for n in names:
        if n.endswith('.rels'):
            try:
                root = ET.fromstring(z.read(n))
            except ET.ParseError:
                continue
            for rel in root:
                if rel.get('Type', '').endswith('/hyperlink') and \
                   rel.get('TargetMode') == 'External':
                    ext_links += 1
    r['ext_links'] = ext_links
    if flavour == 'docx':
        doc = z.read('word/document.xml')
        r['tracked'] = sum(_count_tag(doc, t) for t in ('ins', 'del', 'moveFrom', 'moveTo'))
        r['comments'] = _count_tag(z.read('word/comments.xml'), 'comment') \
            if 'word/comments.xml' in names else 0
    elif flavour == 'xlsx':
        r['formulas'] = sum(_count_tag(z.read(n), 'f') for n in names
                            if re.match(r'xl/worksheets/sheet[^/]*\.xml$', n))
        hidden = 0
        for sheet in ET.fromstring(z.read('xl/workbook.xml')).iter():
            if sheet.tag.rsplit('}', 1)[-1] == 'sheet' and \
               sheet.get('state') in ('hidden', 'veryHidden'):
                hidden += 1
        r['hidden_sheets'] = hidden
        r['comments'] = sum(_count_tag(z.read(n), 'comment') for n in names
                            if re.match(r'xl/comments[^/]*\.xml$', n)) \
                      + sum(_count_tag(z.read(n), 'threadedComment') for n in names
                            if n.startswith('xl/threadedComments/'))
    elif flavour == 'pptx':
        notes, substantive = 0, 0
        for n in names:
            if re.match(r'ppt/notesSlides/notesSlide\d+\.xml$', n):
                notes += 1
                text = ''.join(el.text or '' for _, el in
                               ET.iterparse(io.BytesIO(z.read(n)))
                               if el.tag.rsplit('}', 1)[-1] == 't')
                if len(text.strip()) > 20:
                    substantive += 1
        r['notes_parts'] = notes
        r['notes_substantive'] = substantive
        r['comments'] = sum(_count_tag(z.read(n), 'cm') for n in names
                            if n.startswith('ppt/comments/'))
    return r

def pct(sorted_vals, p):
    return sorted_vals[min(len(sorted_vals) - 1, int(len(sorted_vals) * p))]

def cmd_analyze(d):
    rows = [analyze_file(os.path.join(d, f)) for f in sorted(os.listdir(d))
            if os.path.isfile(os.path.join(d, f))]
    print(json.dumps(rows, indent=1))
    return rows

def cmd_census(bucket):
    NS = '{http://s3.amazonaws.com/doc/2006-03-01/}'
    token, keys, reqs = None, [], 0
    while True:
        q = {'list-type': '2', 'max-keys': '1000'}
        if token:
            q['continuation-token'] = token
        with urllib.request.urlopen(
                f'https://{bucket}.s3.amazonaws.com/?' + urllib.parse.urlencode(q),
                timeout=30) as resp:
            root = ET.fromstring(resp.read())
        reqs += 1
        for c in root.findall(NS + 'Contents'):
            keys.append((c.find(NS + 'Key').text, int(c.find(NS + 'Size').text)))
        tok = root.find(NS + 'NextContinuationToken')
        if root.find(NS + 'IsTruncated').text != 'true' or tok is None:
            break
        token = tok.text
        time.sleep(0.25)
    exts = collections.defaultdict(list)
    for k, s in keys:
        name = k.rsplit('/', 1)[-1]
        ext = name.rsplit('.', 1)[-1].lower() if '.' in name else '(none)'
        exts[ext if len(ext) <= 5 else '(none)'].append(s)
    print(f'keys={len(keys)} requests={reqs}')
    for e, sizes in sorted(exts.items(), key=lambda kv: -len(kv[1])):
        sizes.sort()
        line = f'{e:8s} n={len(sizes):6d}'
        if e in ('docx', 'xlsx', 'pptx', 'docm', 'xlsm', 'pptm',
                 'doc', 'xls', 'ppt', 'odt', 'ods', 'odp'):
            line += (f'  p50={pct(sizes, .5)}  p90={pct(sizes, .9)}'
                     f'  p95={pct(sizes, .95)}  p99={pct(sizes, .99)}  max={sizes[-1]}')
        print(line)

def _bucket_keys(bucket):
    NS = '{http://s3.amazonaws.com/doc/2006-03-01/}'
    token, keys, reqs = None, [], 0
    while True:
        q = {'list-type': '2', 'max-keys': '1000'}
        if token:
            q['continuation-token'] = token
        with urllib.request.urlopen(
                f'https://{bucket}.s3.amazonaws.com/?' + urllib.parse.urlencode(q),
                timeout=30) as resp:
            root = ET.fromstring(resp.read())
        reqs += 1
        for c in root.findall(NS + 'Contents'):
            keys.append({'key': c.find(NS + 'Key').text,
                         'size': int(c.find(NS + 'Size').text)})
        tok = root.find(NS + 'NextContinuationToken')
        if root.find(NS + 'IsTruncated').text != 'true' or tok is None:
            return keys
        token = tok.text
        time.sleep(0.25)

def cmd_sample(bucket, outdir):
    import random
    os.makedirs(outdir, exist_ok=True)
    keys = _bucket_keys(bucket)
    by_ext = {}
    for k in keys:
        name = k['key'].rsplit('/', 1)[-1]
        ext = name.rsplit('.', 1)[-1].lower() if '.' in name else ''
        by_ext.setdefault(ext, []).append(k)
    random.seed(20260803)                       # the 2026-08-03 sample, reproducibly
    plan = {'docx': 40, 'xlsx': 30, 'pptx': 12, 'doc': 6, 'xls': 4,
            'ppt': 1, 'pptm': 1}
    picks = []
    for ext, n in plan.items():
        pool = by_ext.get(ext, [])
        picks += [(ext, k) for k in (pool if len(pool) <= n else random.sample(pool, n))]
    for ext in ('docx', 'xlsx'):                # deliberate tail: largest containers
        for k in sorted(by_ext.get(ext, []), key=lambda k: -k['size'])[:3]:
            picks.append((ext + '-tail', k))
    for i, (ext, k) in enumerate(picks):
        fn = f"{ext}-{i:03d}-" + k['key'].rsplit('/', 1)[-1][-60:].replace(' ', '_')
        path = os.path.join(outdir, fn)
        if os.path.exists(path) and os.path.getsize(path) == k['size']:
            continue
        url = f'https://{bucket}.s3.amazonaws.com/' + urllib.parse.quote(k['key'])
        with urllib.request.urlopen(url, timeout=300) as r, open(path, 'wb') as f:
            f.write(r.read())
        time.sleep(0.4)
        if i % 15 == 0:
            print(i, flush=True)
    print(f'sampled {len(picks)} files into {outdir}')

def cmd_control():
    import tempfile
    d = tempfile.mkdtemp()
    fake = os.path.join(d, 'masquerade.xlsx')     # a plain ZIP renamed .xlsx
    with zipfile.ZipFile(fake, 'w') as z:
        z.writestr('readme.txt', 'just a zip, not a workbook')
    kind, flavour = classify(fake)
    print(f'negative control: renamed plain ZIP as .xlsx -> classified ({kind}, {flavour})')
    if kind == 'ooxml':
        print('FAIL: instrument counted a plain ZIP as OOXML')
        sys.exit(1)
    print('PASS: reported NOT-OOXML, would not be counted')

# ---------------------------------------------------------------------------
# CAP-7 (2026-09-14) — Google Drive links in this same corpus, counted.
#
# WHAT A "LINK" IS HERE, stated because the number means nothing without it. A
# link is ONE URL OCCURRENCE. It is counted STRUCTURALLY wherever the body has a
# structure that says "this is a link" (an html href/src, an OOXML .rels
# relationship with TargetMode="External", a Legistar MatterAttachmentHyperlink),
# and counted as a TEXT MENTION wherever it is only prose (a URL written into a
# cell, a paragraph, a csv field, a PDF content stream). Both are reported, never
# summed into one headline, because a mention is not a link a capture would follow.
#
# WHAT THE MATCHER CANNOT SEE, and it is the load-bearing sentence: a URL that is
# not spelled with an http(s) scheme; a URL inside a PDF stream filtered with
# anything but Flate (LZW, ASCII85 chains, encrypted); a URL inside a legacy OLE2
# .doc/.xls/.ppt (139 assets — no OLE2 reader, COFF-6's own deferral); a URL
# inside an image, a video or a zip member; and — the big one — any URL in the
# 27,783 PDFs NOT drawn into the fixed-seed sample. A shortened link (bit.ly,
# goo.gl, a city vanity redirect) that RESOLVES to Drive is invisible here: this
# counts targets as written, and follows nothing.

DRIVE_HOSTS = ('docs.google.com', 'drive.google.com',
               'sheets.google.com', 'slides.google.com')
KINDS = ('document', 'spreadsheet', 'presentation', 'folder', 'file',
         'open-id', 'other')
URL_RE = re.compile(r'https?://[^\s"\'<>()\[\]{}\\^`|]+', re.I)
HREF_RE = re.compile(r'(?:href|src)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))', re.I)

def drive_kind(url):
    """None if the target host is not one of the four Drive hosts; else the KIND
    read from the URL shape. Host match is EXACT on the parsed hostname, so
    `www.google.com/maps`, `fonts.googleapis.com` and a lookalike
    `drive.google.com.example.org` are all NOT Drive."""
    try:
        # `&amp;` survives into a URL read out of an XML text part; normalise it
        # so a query-shaped kind (`/open?id=`) is not missed by an escaped `&`.
        p = urllib.parse.urlsplit(
            url.strip().rstrip('.,;:!?)\'"').replace('&amp;', '&'))
    except ValueError:
        return None
    host = (p.hostname or '').lower().rstrip('.')
    if host not in DRIVE_HOSTS:
        return None
    path, q = p.path or '', p.query or ''
    if '/document/' in path:      return 'document'
    if '/spreadsheets/' in path:  return 'spreadsheet'
    if '/presentation/' in path:  return 'presentation'
    if '/drive/folders/' in path: return 'folder'
    if '/file/d/' in path:        return 'file'
    if path.rstrip('/').endswith('/open') and re.search(r'(^|&)id=', q):
        return 'open-id'
    return 'other'                # a Drive host in a shape this list does not know

def is_google_not_drive(url):
    """The over-strictness witness: a google.com URL the counter must REFUSE."""
    try:
        host = (urllib.parse.urlsplit(url).hostname or '').lower().rstrip('.')
    except ValueError:
        return False
    return (host.endswith('google.com') or host.endswith('googleapis.com')
            or host.endswith('goo.gl')) and host not in DRIVE_HOSTS

def urls_in_text(s):
    return [m.group(0) for m in URL_RE.finditer(s)]

def urls_in_html(s):
    s = s.replace('&amp;', '&')
    out = []
    for m in HREF_RE.finditer(s):
        out.append(m.group(1) or m.group(2) or m.group(3) or '')
    return [u for u in out if u.lower().startswith(('http://', 'https://'))]

def urls_in_ooxml(path):
    """(structural rels-External targets, text-mention urls in the xml parts)."""
    rels, text = [], []
    try:
        z = zipfile.ZipFile(path)
    except Exception:
        return rels, text
    for n in z.namelist():
        try:
            data = z.read(n)
        except Exception:
            continue
        if n.endswith('.rels'):
            try:
                root = ET.fromstring(data)
                for rel in root:
                    if rel.get('TargetMode') == 'External':
                        rels.append(rel.get('Target', ''))
            except ET.ParseError:
                # A .rels part that will not parse must not read as ZERO LINKS.
                # Found by this file's own drivecontrol on 2026-09-14: the first
                # fixture wrote a raw `&` into a Target, ET refused the whole
                # part, and the rels arm scored 0 of 14 while looking clean. A
                # malformed part in the wild would have done the same silently,
                # so the fallback reads the Targets out of the raw bytes.
                txt = data.decode('utf-8', 'replace')
                for m in re.finditer(r'Target\s*=\s*"([^"]*)"[^>]*TargetMode\s*=\s*"External"'
                                     r'|TargetMode\s*=\s*"External"[^>]*Target\s*=\s*"([^"]*)"',
                                     txt):
                    rels.append((m.group(1) or m.group(2) or '').replace('&amp;', '&'))
        elif n.lower().endswith('.xml'):
            text += urls_in_text(data.decode('utf-8', 'replace'))
    return rels, text

def urls_in_pdf(data, inflate_budget=400_000_000):
    """Text-mention URLs a PDF carries: the raw bytes, every Flate stream this can
    inflate, and a UTF-16LE pass when the file holds wide-character text."""
    out = urls_in_text(data.decode('latin-1'))
    if b'h\x00t\x00t\x00p\x00' in data:
        out += urls_in_text(data.replace(b'\x00', b'').decode('latin-1'))
    spent = 0
    for m in re.finditer(rb'stream\r?\n', data):
        if spent > inflate_budget:
            break
        end = data.find(b'endstream', m.end())
        if end < 0:
            continue
        try:
            dec = zlib.decompressobj().decompress(data[m.end():end])
        except Exception:
            continue
        spent += len(dec)
        if dec:
            out += urls_in_text(dec.decode('latin-1'))
    return out

class Tally:
    """where -> kind -> OCCURRENCE count, and beside it the two figures a decision
    actually needs: how many DOCUMENTS carry at least one, and how many DISTINCT
    Drive targets they point at. An occurrence count alone cannot tell one
    spreadsheet linked 14 times from 14 spreadsheets linked once."""
    def __init__(self, hits_path=None):
        self.rows = collections.defaultdict(lambda: collections.Counter())
        self.reach = {}
        self.refused = collections.Counter()
        self.docs = collections.defaultdict(set)      # where -> {source doc}
        self.urls = collections.defaultdict(set)       # where -> {distinct target}
        self.examples = collections.defaultdict(list)
        self.hits = open(hits_path, 'w') if hits_path else None
    def add(self, where, urls, doc=None):
        for u in urls:
            k = drive_kind(u)
            if k:
                self.rows[where][k] += 1
                self.urls[where].add(u.strip())
                if doc is not None:
                    self.docs[where].add(doc)
                if self.hits:
                    self.hits.write(json.dumps(
                        {'where': where, 'kind': k, 'url': u.strip(), 'doc': doc}) + '\n')
                if len(self.examples[where]) < 4:
                    self.examples[where].append(u[:150])
            elif is_google_not_drive(u):
                self.refused[where] += 1
    def report(self):
        if self.hits:
            self.hits.flush()
        print('\nDRIVE LINK OCCURRENCES BY WHERE AND KIND')
        head = (f'{"where":34s}' + ''.join(f'{k:>13s}' for k in KINDS)
                + f'{"TOTAL":>8s}{"docs":>7s}{"distinct":>10s}')
        print(head)
        print('-' * len(head))
        grand = collections.Counter()
        for where in sorted(self.rows):
            c = self.rows[where]
            grand.update(c)
            print(f'{where:34s}' + ''.join(f'{c[k]:13d}' for k in KINDS)
                  + f'{sum(c.values()):8d}{len(self.docs[where]):7d}'
                  + f'{len(self.urls[where]):10d}')
        print('-' * len(head))
        print(f'{"ALL":34s}' + ''.join(f'{grand[k]:13d}' for k in KINDS)
              + f'{sum(grand.values()):8d}')
        print('  (a `where` with no row found NONE; every population read is in REACH below)')
        print('\nREACH — what was actually read, and a row missing above found ZERO')
        for where in sorted(self.reach):
            print(f'  {where:32s} {self.reach[where]}')
        print('\nOVER-STRICTNESS WITNESS — google/googleapis/goo.gl links SEEN and REFUSED')
        for where in sorted(self.refused):
            print(f'  {where:32s} {self.refused[where]}')
        print(f'  {"TOTAL refused":32s} {sum(self.refused.values())}')
        print('\nEXAMPLES OF LINKS THAT WERE COUNTED (not refused — these are Drive)')
        for where in sorted(self.examples):
            for u in self.examples[where]:
                print(f'  [{where}] {u}')
        return grand

def _get(url, timeout=300, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'civicos-measure/CAP-7'})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as e:
            if i == tries - 1:
                print(f'    FETCH FAILED {url[:90]} :: {e}', flush=True)
                return None
            time.sleep(1.0 + i)

def cmd_drivelinks(bucket='cao-94612', pdf_n=1000, workdir='.cap7-pen'):
    os.makedirs(workdir, exist_ok=True)
    hits_path = os.path.join(workdir, 'drive-hits.jsonl')
    t = Tally(hits_path)
    t0 = time.time()
    print(f'every counted link is written to {hits_path} '
          f'(where · kind · url · source document), so a reader re-derives any '
          f'figure below without a second 45-minute run', flush=True)

    # --- the population, re-listed the way COFF-6 listed it -----------------
    keys = _bucket_keys(bucket)
    print(f'population: {len(keys)} keys in s3://{bucket} '
          f'(COFF-6 read 43,282 on 2026-08-03)', flush=True)

    # 1 · ASSET — is a bucket key ITSELF a Drive link? A key is a path, so this
    #     can only fire if the city stored a URL as a key. Measured, not assumed.
    t.reach['asset · bucket key'] = f'{len(keys)} keys, CENSUS'
    for k in keys:
        if k['key'].lower().startswith(('http://', 'https://')):
            t.add('asset · bucket key', [k['key']], doc=k['key'])

    by_ext = collections.defaultdict(list)
    for k in keys:
        n = k['key'].rsplit('/', 1)[-1]
        by_ext[n.rsplit('.', 1)[-1].lower() if '.' in n else ''].append(k)

    def stream_bodies(label, pool, handler):
        n, byts = 0, 0
        for k in pool:
            url = f'https://{bucket}.s3.amazonaws.com/' + urllib.parse.quote(k['key'])
            data = _get(url)
            if data is None:
                continue
            n += 1
            byts += len(data)
            handler(k, data)
            time.sleep(0.25)
            if n % 50 == 0:
                print(f'    {label} {n}/{len(pool)} ({byts/1e6:.0f} MB, '
                      f'{time.time()-t0:.0f}s)', flush=True)
        t.reach[label] = f'{n}/{len(pool)} read, {byts:,} bytes'

    # 2 · BODY — html/htm page bodies (census)
    html_pool = by_ext['html'] + by_ext['htm']
    print(f'\nhtml/htm bodies: {len(html_pool)}', flush=True)
    stream_bodies('body · html page', html_pool,
                  lambda k, d: (t.add('body · html page (href/src)',
                                      urls_in_html(d.decode('utf-8', 'replace')), k['key']),
                                t.add('body · html page (text mention)',
                                      urls_in_text(d.decode('utf-8', 'replace')), k['key'])))

    # 3 · BODY — csv bodies (census). Plain text; mentions only, no structure.
    print(f'\ncsv bodies: {len(by_ext["csv"])}', flush=True)
    stream_bodies('body · csv', by_ext['csv'],
                  lambda k, d: t.add('body · csv (text mention)',
                                     urls_in_text(d.decode('utf-8', 'replace')), k['key']))

    # 4 · BODY — every OOXML office document in the population (census)
    ooxml_pool = (by_ext['docx'] + by_ext['xlsx'] + by_ext['pptx']
                  + by_ext['pptm'] + by_ext['docm'] + by_ext['xlsm'])
    print(f'\nOOXML bodies: {len(ooxml_pool)} '
          f'({sum(k["size"] for k in ooxml_pool)/1e6:.0f} MB)', flush=True)
    tmp = os.path.join(workdir, 'body.tmp')
    def ooxml_handler(k, d):
        with open(tmp, 'wb') as f:
            f.write(d)
        rels, text = urls_in_ooxml(tmp)
        t.add('body · ooxml (rels External)', rels, k['key'])
        t.add('body · ooxml (text mention)', text, k['key'])
        os.remove(tmp)
    stream_bodies('body · ooxml', ooxml_pool, ooxml_handler)

    # 5 · BODY — PDFs. 27,783 of them and 133.6 GB: a fixed-seed random SAMPLE,
    #     the same discipline COFF-6 used for its per-artefact figures.
    pdfs = by_ext['pdf']
    random.seed(20260914)
    pdf_pool = pdfs if len(pdfs) <= pdf_n else random.sample(pdfs, pdf_n)
    print(f'\npdf bodies: SAMPLE {len(pdf_pool)} of {len(pdfs)} '
          f'(seed 20260914; the population is '
          f'{sum(k["size"] for k in pdfs)/1e9:.1f} GB and cannot be a census)', flush=True)
    stream_bodies('body · pdf SAMPLE', pdf_pool,
                  lambda k, d: t.add('body · pdf SAMPLE (text mention)',
                                     urls_in_pdf(d), k['key']))
    t.reach['body · pdf SAMPLE'] += (f' — SAMPLE {len(pdf_pool)}/{len(pdfs)} '
                                     f'({100*len(pdf_pool)/max(1,len(pdfs)):.1f}%)')

    # 6 · ASSET — Legistar attachments, COFF-6's second source and the one place
    #     an attachment can BE a link rather than an uploaded file.
    print('\nlegistar attachments', flush=True)
    api = 'https://webapi.legistar.com/v1/oakland'
    matters, seen = [], set()
    recent = _get(api + '/matters?' + urllib.parse.urlencode(
        {'$top': '200', '$orderby': 'MatterLastModifiedUtc desc'}), timeout=60)
    if recent:
        matters += json.loads(recent)
    for yr in (2015, 2016):
        f = (f"MatterIntroDate ge datetime'{yr}-01-01' and "
             f"MatterIntroDate lt datetime'{yr}-07-01'")
        old = _get(api + '/matters?' + urllib.parse.urlencode(
            {'$top': '25', '$filter': f}), timeout=60)
        if old:
            matters += json.loads(old)
    natt, nhyper = 0, 0
    for m in matters:
        if m['MatterId'] in seen:
            continue
        seen.add(m['MatterId'])
        raw = _get(f"{api}/matters/{m['MatterId']}/attachments", timeout=60)
        time.sleep(0.25)
        if raw is None:
            continue
        for a in json.loads(raw):
            natt += 1
            if a.get('MatterAttachmentIsHyperlink'):
                nhyper += 1
            link = a.get('MatterAttachmentHyperlink') or ''
            if link:
                t.add('asset · legistar attachment', [link],
                      f"matter {m['MatterId']} att {a.get('MatterAttachmentId')}")
    t.reach['asset · legistar attachment'] = (
        f'{natt} attachments over {len(seen)} matters '
        f'(COFF-6 read 792 over 250 on 2026-08-03); '
        f'{nhyper} carry MatterAttachmentIsHyperlink')

    grand = t.report()
    print(f'\nelapsed {time.time()-t0:.0f}s')
    print(f'\nHEADLINE — Google Drive links found in COFF-6\'s corpus: '
          f'{sum(grand.values())}')
    return grand

def cmd_drivederive(path='.cap7-pen/drive-hits.jsonl'):
    """Every DERIVED figure, read back out of drivelinks' hit log. No network, so
    the derivation is re-runnable in a second rather than in 45 minutes, and the
    numbers in MEASUREMENTS.md are traceable to a line each."""
    H = [json.loads(l) for l in open(path)]
    fam = lambda h: h['where'].split(' (')[0]
    print(f'{len(H)} hit record(s) in {path}')

    print('\nDE-DUPLICATION — the ooxml rows are TWO EXTRACTORS OVER ONE BODY, so the '
          'raw row total double-counts')
    oox = [h for h in H if fam(h) == 'body · ooxml']
    rels = {(h['doc'], h['url']) for h in oox if 'rels' in h['where']}
    text = {(h['doc'], h['url']) for h in oox if 'text' in h['where']}
    print(f'  ooxml .rels External (a real hyperlink) : {len([h for h in oox if "rels" in h["where"]])} occurrence(s)')
    print(f'  ooxml text mention (printed in the body): {len([h for h in oox if "text" in h["where"]])} occurrence(s)')
    print(f'  (doc,url) pairs seen ONLY structurally  : {len(rels - text)}')
    print(f'  (doc,url) pairs seen ONLY as text       : {len(text - rels)}')
    print(f'  ooxml bodies, DE-DUPLICATED             : {len(text | rels)} link(s), '
          f'{len(rels)} of them a structural hyperlink')
    ded = [h for h in H if fam(h) != 'body · ooxml'] + \
          [h for h in oox if 'text' in h['where']] + \
          [h for h in oox if 'rels' in h['where'] and (h['doc'], h['url']) not in text]

    print('\nTHE FIGURE, DE-DUPLICATED')
    print(f'  link occurrences        : {len(ded)}')
    print(f'  distinct Drive targets  : {len({h["url"] for h in ded})}')
    print(f'  source documents with >=1: {len({h["doc"] for h in ded})}')
    print('\n  by KIND — occurrences | distinct targets')
    seen = {}
    for h in ded:
        seen[h['url']] = h['kind']
    occ = collections.Counter(h['kind'] for h in ded)
    dis = collections.Counter(seen.values())
    for k in KINDS:
        print(f'    {k:14s} {occ[k]:6d} | {dis[k]:6d}')
    print(f'    {"TOTAL":14s} {sum(occ.values()):6d} | {sum(dis.values()):6d}')
    print('\n  by WHERE — occurrences | distinct targets | source documents')
    for w in sorted({fam(h) for h in ded}):
        g = [h for h in ded if fam(h) == w]
        print(f'    {w:28s} {len(g):5d} | {len({h["url"] for h in g}):5d} '
              f'| {len({h["doc"] for h in g}):5d}')

    print('\n  source documents, and how many occurrences each carries')
    for d, n in collections.Counter(h['doc'] for h in ded).most_common():
        print(f'    {n:4d}  {d}')

# --- the negative control for the counter, run in one step ------------------

def _fixture_pdf(path, urls, compress):
    """A PDF-shaped file whose URLs sit in a Flate stream (compress=True) or in
    the raw object bytes. Not a valid PDF to a reader; valid to this matcher,
    which is the point — the matcher is what is under test."""
    body = ('\n'.join(f'/A << /URI ({u}) >>' for u in urls)).encode()
    with open(path, 'wb') as f:
        f.write(b'%PDF-1.4\n')
        if compress:
            f.write(b'5 0 obj\nstream\n' + zlib.compress(body) + b'\nendstream\nendobj\n')
        else:
            f.write(b'5 0 obj\n' + body + b'\nendobj\n')
        f.write(b'\n%%EOF\n')

def _fixture_ooxml(path, rels_urls, text_urls, escape=True):
    """A real OOXML part escapes `&` as `&amp;`; escape=False plants the MALFORMED
    part that caught the silent-zero defect above, so the arm stays re-runnable."""
    esc = (lambda u: u.replace('&', '&amp;')) if escape else (lambda u: u)
    with zipfile.ZipFile(path, 'w') as z:
        z.writestr('[Content_Types].xml', '<Types/>')
        z.writestr('word/document.xml',
                   '<d>' + ''.join(f'<t>{esc(u)}</t>' for u in text_urls) + '</d>')
        rels = ''.join(
            f'<Relationship Id="r{i}" Type="http://x/hyperlink" '
            f'Target="{esc(u)}" TargetMode="External"/>'
            for i, u in enumerate(rels_urls))
        z.writestr('word/_rels/document.xml.rels', f'<Relationships>{rels}</Relationships>')

def cmd_drivecontrol():
    import tempfile
    d = tempfile.mkdtemp()
    fails = []
    def check(name, got, want):
        ok = got == want
        print(f'  {"PASS" if ok else "FAIL"}  {name}: got {got}, want {want}')
        if not ok:
            fails.append(name)

    # ARM 1 — a planted fixture with a KNOWN number of each kind, one body type
    #         at a time, each arm ALONE.
    planted = {
        'document':     ['https://docs.google.com/document/d/1AAA/edit'],
        'spreadsheet':  ['https://docs.google.com/spreadsheets/d/1BBB/edit#gid=0',
                         'https://sheets.google.com/spreadsheets/d/1CCC/view'],
        'presentation': ['https://slides.google.com/presentation/d/1DDD/edit',
                         'https://docs.google.com/presentation/d/1EEE/pub',
                         'https://docs.google.com/presentation/d/1FFF/'],
        'folder':       ['https://drive.google.com/drive/folders/1GGG'],
        'file':         ['https://drive.google.com/file/d/1HHH/view?usp=sharing',
                         'https://drive.google.com/file/d/1III/preview'],
        # ARM 3 — Drive hosts in shapes this list does not know MUST land in
        #         `other` and must never be smuggled into a kind.
        'other':        ['https://drive.google.com/uc?export=download&id=1KKK',
                         'https://docs.google.com/forms/d/e/1LLL/viewform',
                         'https://drive.google.com/a/oaklandca.gov/somethingnew',
                         'https://docs.google.com/'],
    }
    planted['open-id'] = ['https://drive.google.com/open?id=1JJJ']
    want = {k: len(v) for k, v in planted.items()}
    all_drive = [u for v in planted.values() for u in v]

    # ARM 4 — over-strictness: google links that are NOT Drive, and a lookalike
    #         host, must NOT be counted, in every body type.
    decoys = ['https://www.google.com/maps/place/Oakland+City+Hall',
              'https://maps.google.com/?q=Oakland',
              'https://www.google.com/search?q=oakland+budget',
              'https://fonts.googleapis.com/css2?family=Inter',
              'https://drive.google.com.example.org/document/d/1XXX/edit',
              'https://sites.google.com/view/oakland-thing',
              'https://goo.gl/maps/abc123']

    print('ARM 1+3+4 · html body (href/src), each kind planted, decoys mixed in')
    html = '<html>' + ''.join(f'<a href="{u}">x</a>' for u in all_drive + decoys) + '</html>'
    t = Tally(); t.add('h', urls_in_html(html))
    for k in KINDS:
        check(f'html kind {k}', t.rows['h'][k], want.get(k, 0))
    check('html decoys refused', t.refused['h'], len(decoys) - 1)   # the lookalike is not a google host
    check('html total', sum(t.rows['h'].values()), len(all_drive))

    print('ARM 1+3+4 · ooxml body (.rels External) and its text parts')
    p = os.path.join(d, 'planted.docx')
    _fixture_ooxml(p, all_drive + decoys, all_drive + decoys)
    rels, text = urls_in_ooxml(p)
    tr = Tally(); tr.add('r', rels)
    tt = Tally(); tt.add('t', text)
    for k in KINDS:
        check(f'ooxml rels kind {k}', tr.rows['r'][k], want.get(k, 0))
        check(f'ooxml text kind {k}', tt.rows['t'][k], want.get(k, 0))

    print('ARM 6 · a MALFORMED .rels must not read as zero links (the defect this '
          'control found on 2026-09-14, kept as an arm)')
    p = os.path.join(d, 'malformed.docx')
    _fixture_ooxml(p, all_drive + decoys, [], escape=False)
    rels, _ = urls_in_ooxml(p)
    tm = Tally(); tm.add('m', rels)
    check('malformed rels total', sum(tm.rows['m'].values()), len(all_drive))

    print('ARM 1+3+4 · pdf body, raw objects and a Flate stream')
    for compress in (False, True):
        p = os.path.join(d, f'planted-{int(compress)}.pdf')
        _fixture_pdf(p, all_drive + decoys, compress)
        tp = Tally(); tp.add('p', urls_in_pdf(open(p, 'rb').read()))
        for k in KINDS:
            check(f'pdf {"flate" if compress else "raw"} kind {k}',
                  tp.rows['p'][k], want.get(k, 0))

    print('ARM 1+4 · legistar attachment record (the link IS the asset)')
    tl = Tally()
    tl.add('l', [a['MatterAttachmentHyperlink'] for a in
                 [{'MatterAttachmentHyperlink': u} for u in all_drive + decoys]])
    check('legistar total', sum(tl.rows['l'].values()), len(all_drive))

    print('ARM 2 · a fixture with NO Drive links returns ZERO, every body type')
    clean_html = ('<html>' + ''.join(f'<a href="{u}">x</a>' for u in decoys)
                  + '<p>https://oaklandca.gov/files/assets/a.pdf</p></html>')
    z = Tally(); z.add('z', urls_in_html(clean_html)); z.add('z', urls_in_text(clean_html))
    check('clean html total', sum(z.rows['z'].values()), 0)
    p = os.path.join(d, 'clean.docx')
    _fixture_ooxml(p, decoys, decoys)
    rels, text = urls_in_ooxml(p)
    zz = Tally(); zz.add('z', rels); zz.add('z', text)
    check('clean ooxml total', sum(zz.rows['z'].values()), 0)
    p = os.path.join(d, 'clean.pdf')
    _fixture_pdf(p, decoys, True)
    zp = Tally(); zp.add('z', urls_in_pdf(open(p, 'rb').read()))
    check('clean pdf total', sum(zp.rows['z'].values()), 0)

    print('ARM 5 · the fixtures are NON-EMPTY (a green over an empty corpus is not a green)')
    check('planted drive urls', len(all_drive), 14)
    check('planted decoys', len(decoys), 7)
    check('kinds covered', len([k for k in KINDS if want.get(k, 0) > 0]), len(KINDS))

    if fails:
        print(f'\nFAIL: {len(fails)} assertion(s) — ' + '; '.join(fails))
        sys.exit(1)
    print('\nPASS: every arm as declared.')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__ or 'usage: census <bucket> | analyze <dir> | control '
                            '| drivelinks [pdfN] | drivecontrol')
    if sys.argv[1] == 'census':
        cmd_census(sys.argv[2] if len(sys.argv) > 2 else 'cao-94612')
    elif sys.argv[1] == 'sample':
        cmd_sample(sys.argv[2] if len(sys.argv) > 2 else 'cao-94612',
                   sys.argv[3] if len(sys.argv) > 3 else 'office-corpus-sample')
    elif sys.argv[1] == 'analyze':
        cmd_analyze(sys.argv[2])
    elif sys.argv[1] == 'control':
        cmd_control()
    elif sys.argv[1] == 'drivelinks':
        cmd_drivelinks(pdf_n=int(sys.argv[2]) if len(sys.argv) > 2 else 1000)
    elif sys.argv[1] == 'drivederive':
        cmd_drivederive(sys.argv[2] if len(sys.argv) > 2 else '.cap7-pen/drive-hits.jsonl')
    elif sys.argv[1] == 'drivecontrol':
        cmd_drivecontrol()
    else:
        sys.exit('unknown mode ' + sys.argv[1])
