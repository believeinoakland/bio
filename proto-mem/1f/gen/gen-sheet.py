#!/usr/bin/env python3
"""proto-mem/1f (THROWAWAY): deterministic workbook generator for L2 (XLSX and ODS).
No copyrighted content: pseudo-words from a seeded xorshift. Same arguments => byte-identical file (zip entries get a fixed 1980-01-01 date).
  gen-sheet.py --fmt=xlsx|ods --out=FILE --rows=N --cols=C [--sheets=S] [--seed=1] [--textcols=K] [--ratio-bomb=1]
Columns: the first K (default C//2, at least 1) are text (XLSX: shared strings; ODS: string cells), the next is a DATE stored as a number with a date style
(XLSX: serial + numFmt 14; ODS: office:value-type="date"), the rest are numbers. The last row of the last sheet's first text cell holds the truth token
TRUTH-<seed>-<fmt>-<rows>x<cols>x<sheets>. Prints one JSON line {file, bytes, sha256, cells, rows, cols, sheets, token}.
--ratio-bomb=1 (ods only): a tiny file whose content.xml expands ~1000:1 (rows=N repeated empty-ish cells), for the zip-expansion refusal.
Memory: streams; never holds a sheet."""
import sys, zipfile, hashlib, json

a = dict(x[2:].split('=', 1) if '=' in x else (x[2:], '1') for x in sys.argv[1:])
fmt = a.get('fmt', 'xlsx'); out = a['out']; rows = int(a.get('rows', 1000)); cols = int(a.get('cols', 8)); sheets = int(a.get('sheets', 1))
seed = int(a.get('seed', 1)); textcols = int(a.get('textcols', max(1, cols // 2)))
token = f"TRUTH-{seed}-{fmt}-{rows}x{cols}x{sheets}"
st = [(seed * 2654435761) & 0xFFFFFFFF or 1]
def rnd():
    s = st[0]
    s ^= (s << 13) & 0xFFFFFFFF; s ^= s >> 17; s ^= (s << 5) & 0xFFFFFFFF
    st[0] = s & 0xFFFFFFFF
    return st[0] / 4294967296.0
syl = ["ka", "to", "mi", "ren", "sol", "vi", "dar", "ne", "pho", "lu", "ba", "cri", "tem", "or", "an", "gue", "shi", "ros", "ment", "tion"]
vocab = []
for _ in range(6000):
    w = ''.join(syl[int(rnd() * len(syl))] for _ in range(2 + int(rnd() * 2)))
    vocab.append(w)
def colname(i):
    s = ''
    i += 1
    while i:
        i, r = divmod(i - 1, 26); s = chr(65 + r) + s
    return s
def zinfo(name, stored=False):
    zi = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
    zi.compress_type = zipfile.ZIP_STORED if stored else zipfile.ZIP_DEFLATED
    zi.external_attr = 0o600 << 16
    return zi
cells = 0

def xlsx():
    global cells
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        # shared strings: one per vocabulary word plus the truth token (index len(vocab))
        sst = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="%d" uniqueCount="%d">' % (len(vocab) + 1, len(vocab) + 1)]
        sst += ['<si><t>%s</t></si>' % w for w in vocab] + ['<si><t>%s</t></si>' % token, '</sst>']
        z.writestr(zinfo('[Content_Types].xml'), '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + ''.join('<Override PartName="/xl/worksheets/sheet%d.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' % (i + 1) for i in range(sheets)) + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>')
        z.writestr(zinfo('_rels/.rels'), '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        z.writestr(zinfo('xl/workbook.xml'), '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + ''.join('<sheet name="Sheet%d" sheetId="%d" r:id="rId%d"/>' % (i + 1, i + 1, i + 1) for i in range(sheets)) + '</sheets></workbook>')
        z.writestr(zinfo('xl/_rels/workbook.xml.rels'), '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + ''.join('<Relationship Id="rId%d" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet%d.xml"/>' % (i + 1, i + 1) for i in range(sheets)) + '<Relationship Id="rId%d" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId%d" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>' % (sheets + 1, sheets + 2))
        z.writestr(zinfo('xl/styles.xml'), '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>')
        z.writestr(zinfo('xl/sharedStrings.xml'), '\n'.join(sst))
        for si in range(sheets):
            with z.open(zinfo('xl/worksheets/sheet%d.xml' % (si + 1)), 'w', force_zip64=True) as f:
                f.write(('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:%s%d"/><sheetData>' % (colname(cols - 1), rows)).encode())
                buf = []
                for r in range(1, rows + 1):
                    last = (si == sheets - 1 and r == rows)
                    row = ['<row r="%d">' % r]
                    for c in range(cols):
                        ref = '%s%d' % (colname(c), r)
                        if c < textcols:
                            idx = len(vocab) if (last and c == 0) else int(rnd() * len(vocab))
                            row.append('<c r="%s" t="s"><v>%d</v></c>' % (ref, idx))
                        elif c == textcols:
                            row.append('<c r="%s" s="1"><v>%d</v></c>' % (ref, 40000 + int(rnd() * 8000)))
                        else:
                            row.append('<c r="%s"><v>%.2f</v></c>' % (ref, rnd() * 10000))
                        cells += 1
                    row.append('</row>')
                    buf.append(''.join(row))
                    if len(buf) >= 500:
                        f.write(''.join(buf).encode()); buf = []
                f.write((''.join(buf) + '</sheetData></worksheet>').encode())

def ods():
    global cells
    NS = 'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0"'
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        z.writestr(zinfo('mimetype', stored=True), 'application/vnd.oasis.opendocument.spreadsheet')
        z.writestr(zinfo('META-INF/manifest.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>')
        with z.open(zinfo('content.xml'), 'w', force_zip64=True) as f:
            f.write(('<?xml version="1.0" encoding="UTF-8"?>\n<office:document-content %s office:version="1.2"><office:automatic-styles><number:date-style style:name="N84"><number:year number:style="long"/><number:text>-</number:text><number:month number:style="long"/><number:text>-</number:text><number:day number:style="long"/></number:date-style><style:style style:name="ce1" style:family="table-cell" style:data-style-name="N84"/></office:automatic-styles><office:body><office:spreadsheet>' % NS).encode())
            for si in range(sheets):
                f.write(('<table:table table:name="Sheet%d"><table:table-column table:number-columns-repeated="%d"/>' % (si + 1, cols)).encode())
                buf = []
                for r in range(1, rows + 1):
                    last = (si == sheets - 1 and r == rows)
                    row = ['<table:table-row>']
                    for c in range(cols):
                        if a.get('ratio-bomb'):
                            row.append('<table:table-cell office:value-type="string"><text:p>a</text:p></table:table-cell>')
                        elif c < textcols:
                            w = token if (last and c == 0) else vocab[int(rnd() * len(vocab))]
                            row.append('<table:table-cell office:value-type="string"><text:p>%s</text:p></table:table-cell>' % w)
                        elif c == textcols:
                            d = 40000 + int(rnd() * 8000)
                            row.append('<table:table-cell table:style-name="ce1" office:value-type="date" office:date-value="%04d-%02d-%02d"/>' % (2000 + d % 30, 1 + d % 12, 1 + d % 28))
                        else:
                            row.append('<table:table-cell office:value-type="float" office:value="%.2f"><text:p>n</text:p></table:table-cell>' % (rnd() * 10000))
                        cells += 1
                    row.append('</table:table-row>')
                    buf.append(''.join(row))
                    if len(buf) >= 500:
                        f.write(''.join(buf).encode()); buf = []
                f.write((''.join(buf) + '</table:table>').encode())
            f.write(b'</office:spreadsheet></office:body></office:document-content>')

(xlsx if fmt == 'xlsx' else ods)()
h = hashlib.sha256()
with open(out, 'rb') as fh:
    for blk in iter(lambda: fh.read(1 << 20), b''):
        h.update(blk)
import os
print(json.dumps({'file': out, 'fmt': fmt, 'bytes': os.path.getsize(out), 'sha256': h.hexdigest(), 'cells': cells, 'rows': rows, 'cols': cols, 'sheets': sheets, 'token': token}))
