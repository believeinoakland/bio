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
# Classification is by bytes, not extension: PK\x03\x04 + [Content_Types].xml part =
# OOXML (flavour from which document part exists); PK + "mimetype" part = ODF;
# D0 CF 11 E0 A1 B1 1A E1 = OLE2 (legacy .doc/.xls/.ppt); PK without either = plain ZIP.

import sys, os, io, re, json, time, zipfile, collections
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

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__ or 'usage: census <bucket> | analyze <dir> | control')
    if sys.argv[1] == 'census':
        cmd_census(sys.argv[2] if len(sys.argv) > 2 else 'cao-94612')
    elif sys.argv[1] == 'sample':
        cmd_sample(sys.argv[2] if len(sys.argv) > 2 else 'cao-94612',
                   sys.argv[3] if len(sys.argv) > 3 else 'office-corpus-sample')
    elif sys.argv[1] == 'analyze':
        cmd_analyze(sys.argv[2])
    elif sys.argv[1] == 'control':
        cmd_control()
    else:
        sys.exit('unknown mode ' + sys.argv[1])
