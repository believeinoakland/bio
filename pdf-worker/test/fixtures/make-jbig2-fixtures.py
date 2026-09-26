"""D-622: the JBIG2 fixtures `jbig2.test.mjs` checks `jbig2decode.mjs` against.

NOT the subject's output. Every expected picture here is JBIG2DEC's decode of
the stream (jbig2dec 0.20, the decoder MuPDF and Ghostscript use; it shares no
line with `pdf-worker/src/jbig2decode.mjs`). Re-run this, never copy a failing
run's "got":

    apt-get install jbig2dec jbig2 && pip install pillow pymupdf
    python3 pdf-worker/test/fixtures/make-jbig2-fixtures.py <ordinance.pdf>

`<ordinance.pdf>` is Ordinance 13035 C.M.S. (public attachment 25725 on the
city's Legistar, sha256 2f931fa7c69ce49aa7f8d73fb0a20aad38914d074ef7e3d3aa0bd8da679b1272
when fetched 2026-09-26): seven pages, each ONE immediate text region drawing on
a symbol dictionary held in /JBIG2Globals, from a production scanner.

The streams come from three encoders, none of them the subject:
  - the scanner's own (the ordinance's pages, byte for byte);
  - jbig2enc (`jbig2`, the encoder most JBIG2 PDFs are made with): generic
    region with and without TPGDON, symbol mode, symbol mode with refinement;
  - `Enc` below, a small encoder written from T.88 for the region types and
    options no available encoder writes (every template and adaptive pixel,
    refinement templates and TPGRON, Huffman-coded dictionaries and text,
    custom tables, halftones, striped pages, intermediate regions, every
    combination operator). Its MMR data is libtiff's Group 4 (through Pillow).
A fixture is kept only when jbig2dec decodes it WITHOUT error to exactly the
bitmap the encoder meant (`intended`), so every fixture is a valid stream whose
picture two independent programs agree on. The one exception is marked
`jbig2dec_only`: where jbig2dec departs from T.88, the digest is jbig2dec's.

Writes `jbig2-variants.json` and `jbig2-scan-page.pdf` (the ordinance's page 2,
its exact image and globals streams, in a minimal one-page document).
"""
import base64, hashlib, io, json, os, re, struct, subprocess, sys, tempfile
from PIL import Image
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))

# ── bitmaps: lists of rows of 0/1, 1 = black ─────────────────────────────────

def blank(w, h, v=0): return [[v] * w for _ in range(h)]
def px(b, x, y):
    return b[y][x] if 0 <= y < len(b) and 0 <= x < (len(b[0]) if b else 0) else 0
def crop(b, x, y, w, h): return [row[x:x + w] for row in b[y:y + h]]
def compose(dst, src, x, y, op):
    for j, row in enumerate(src):
        for i, v in enumerate(row):
            X, Y = x + i, y + j
            if 0 <= X < len(dst[0]) and 0 <= Y < len(dst):
                d = dst[Y][X]
                dst[Y][X] = [d | v, d & v, d ^ v, 1 - (d ^ v), v][op]

def packed(b):
    w = len(b[0]) if b else 0
    out = bytearray()
    for row in b:
        for k in range(0, (w + 7) // 8):
            byte = 0
            for i in range(8):
                x = 8 * k + i
                if x < w and row[x]: byte |= 0x80 >> i
            out.append(byte)
    return bytes(out)

def pdf_samples_sha(pk, w, h):
    """The PDF-sense samples (JBIG2's complement) with each row's padding bits
    zeroed: what `renderPageToPixels` hashes as `pixels_sha256` at /Rotate 0."""
    rb = (w + 7) // 8
    pad = rb * 8 - w
    mask = (0xff << pad) & 0xff if pad else 0xff
    out = bytearray((~v) & 0xff for v in pk)
    for y in range(h): out[y * rb + rb - 1] &= mask
    return hashlib.sha256(bytes(out)).hexdigest()

def from_pbm(data):
    m = re.match(rb"P4\s+(?:#.*\s+)*(\d+)\s+(\d+)\s", data)
    w, h = int(m.group(1)), int(m.group(2))
    return w, h, data[m.end():m.end() + ((w + 7) // 8) * h]

def to_bitmap(w, h, pk):
    rb = (w + 7) // 8
    return [[(pk[y * rb + x // 8] >> (7 - x % 8)) & 1 for x in range(w)] for y in range(h)]

def jbig2dec(stream, globals_=None):
    """jbig2dec's picture, or None when it reports an error."""
    with tempfile.TemporaryDirectory() as d:
        g, p, o = (os.path.join(d, n) for n in ("g", "p", "o.pbm"))
        open(p, "wb").write(stream)
        args = ["jbig2dec", "-e", "-t", "pbm", "-o", o]
        if globals_ is not None:
            open(g, "wb").write(globals_); args += [g, p]
        else: args += [p]
        r = subprocess.run(args, capture_output=True)
        err = r.stderr.decode("latin1")
        if r.returncode != 0 or "FATAL" in err or "error" in err.lower() or not os.path.exists(o):
            return None, err
        return from_pbm(open(o, "rb").read()), err

# ── the MQ encoder (T.88 E.2) ────────────────────────────────────────────────

QE = [(0x5601,1,1,1),(0x3401,2,6,0),(0x1801,3,9,0),(0x0AC1,4,12,0),(0x0521,5,29,0),(0x0221,38,33,0),
      (0x5601,7,6,1),(0x5401,8,14,0),(0x4801,9,14,0),(0x3801,10,14,0),(0x3001,11,17,0),(0x2401,12,18,0),
      (0x1C01,13,20,0),(0x1601,29,21,0),(0x5601,15,14,1),(0x5401,16,14,0),(0x5101,17,15,0),(0x4801,18,16,0),
      (0x3801,19,17,0),(0x3401,20,18,0),(0x3001,21,19,0),(0x2801,22,19,0),(0x2401,23,20,0),(0x2201,24,21,0),
      (0x1C01,25,22,0),(0x1801,26,23,0),(0x1601,27,24,0),(0x1401,28,25,0),(0x1201,29,26,0),(0x1101,30,27,0),
      (0x0AC1,31,28,0),(0x09C1,32,29,0),(0x08A1,33,30,0),(0x0521,34,31,0),(0x0441,35,32,0),(0x02A1,36,33,0),
      (0x0221,37,34,0),(0x0141,38,35,0),(0x0111,39,36,0),(0x0085,40,37,0),(0x0049,41,38,0),(0x0025,42,39,0),
      (0x0015,43,40,0),(0x0009,44,41,0),(0x0005,45,42,0),(0x0001,45,43,0),(0x5601,46,46,0)]

class MQ:
    def __init__(self):
        self.A, self.C, self.CT = 0x8000, 0, 12
        self.out = bytearray([0])     # out[-1] is B; index 0 is the byte before the stream
    def encode(self, ctx, cx, d):
        i, mps = ctx.get(cx, (0, 0))
        qe, nmps, nlps, sw = QE[i]
        if d == mps:
            self.A -= qe
            if self.A & 0x8000 == 0:
                if self.A < qe: self.A = qe
                else: self.C += qe
                i = nmps; self.renorm()
            else: self.C += qe
        else:
            self.A -= qe
            if self.A < qe: self.C += qe
            else: self.A = qe
            if sw: mps = 1 - mps
            i = nlps; self.renorm()
        ctx[cx] = (i, mps)
    def renorm(self):
        while True:
            self.A <<= 1; self.C <<= 1; self.CT -= 1
            if self.CT == 0: self.byteout()
            if self.A & 0x8000: break
    def byteout(self):
        B = self.out[-1]
        if B == 0xFF:
            self.out.append(self.C >> 20); self.C &= 0xFFFFF; self.CT = 7
        elif self.C < 0x8000000:
            self.out.append(self.C >> 19); self.C &= 0x7FFFF; self.CT = 8
        else:
            self.out[-1] = B + 1
            if self.out[-1] == 0xFF:
                self.C &= 0x7FFFFFF; self.out.append(self.C >> 20); self.C &= 0xFFFFF; self.CT = 7
            else:   # B is a byte: the carry bit already went into it
                self.out.append((self.C >> 19) & 0xFF); self.C &= 0x7FFFF; self.CT = 8
    def flush(self):
        t = self.C + self.A
        self.C |= 0xFFFF
        if self.C >= t: self.C -= 0x8000
        self.C <<= self.CT; self.byteout()
        self.C <<= self.CT; self.byteout()
        data = bytes(self.out[1:])
        if data.endswith(b"\xff"): data = data[:-1]
        return data + b"\xff\xac"

# ── integer and symbol-id encoding (Annex A) ─────────────────────────────────

def ia(mq, ctx, v):
    prev = 1
    def bit(b):
        nonlocal prev
        mq.encode(ctx, prev, b)
        prev = (prev << 1) | b if prev < 256 else (((prev << 1) | b) & 511) | 256
    if v is None: s, V, n, pre, off = 1, 0, 2, [0], 0
    else:
        s, V = (1, -v) if v < 0 else (0, v)
        for lim, n, pre, off in ((4, 2, [0], 0), (20, 4, [1, 0], 4), (84, 6, [1, 1, 0], 20),
                                 (340, 8, [1, 1, 1, 0], 84), (4436, 12, [1, 1, 1, 1, 0], 340), (1 << 40, 32, [1, 1, 1, 1, 1], 4436)):
            if V < lim: break
    bit(s)
    for b in pre: bit(b)
    for k in range(n - 1, -1, -1): bit(((V - off) >> k) & 1)

def iaid(mq, ctx, v, n):
    prev = 1
    for k in range(n - 1, -1, -1):
        b = (v >> k) & 1
        mq.encode(ctx, prev, b); prev = (prev << 1) | b

# ── generic and refinement coding (6.2, 6.3), contexts as jbig2dec forms them ─

NOMINAL_AT = {0: [(3, -1), (-3, -1), (2, -2), (-2, -2)], 1: [(3, -1)], 2: [(2, -1)], 3: [(2, -1)]}
SLTP = {0: 0x9B25, 1: 0x0795, 2: 0x00E5, 3: 0x0195}

def gctx(b, x, y, t, at):
    p = lambda dx, dy: px(b, x + dx, y + dy)
    if t == 0:
        c = p(-1,0)|p(-2,0)<<1|p(-3,0)<<2|p(-4,0)<<3|p(*at[0])<<4
        c |= p(2,-1)<<5|p(1,-1)<<6|p(0,-1)<<7|p(-1,-1)<<8|p(-2,-1)<<9|p(*at[1])<<10|p(*at[2])<<11
        c |= p(1,-2)<<12|p(0,-2)<<13|p(-1,-2)<<14|p(*at[3])<<15
    elif t == 1:
        c = p(-1,0)|p(-2,0)<<1|p(-3,0)<<2|p(*at[0])<<3
        c |= p(2,-1)<<4|p(1,-1)<<5|p(0,-1)<<6|p(-1,-1)<<7|p(-2,-1)<<8
        c |= p(2,-2)<<9|p(1,-2)<<10|p(0,-2)<<11|p(-1,-2)<<12
    elif t == 2:
        c = p(-1,0)|p(-2,0)<<1|p(*at[0])<<2
        c |= p(1,-1)<<3|p(0,-1)<<4|p(-1,-1)<<5|p(-2,-1)<<6|p(1,-2)<<7|p(0,-2)<<8|p(-1,-2)<<9
    else:
        c = p(-1,0)|p(-2,0)<<1|p(-3,0)<<2|p(-4,0)<<3|p(*at[0])<<4
        c |= p(1,-1)<<5|p(0,-1)<<6|p(-1,-1)<<7|p(-2,-1)<<8|p(-3,-1)<<9
    return c

def generic_encode(mq, ctx, b, t, at, tpgdon=False, skip=None):
    """Code bitmap `b`; `b` is read as the decoder will have it (pixels not yet
    coded are never read, since every context pixel precedes the current one)."""
    w, h = len(b[0]) if b else 0, len(b)
    ltp = 0
    for y in range(h):
        if tpgdon:
            typical = b[y] == (b[y - 1] if y else [0] * w)
            mq.encode(ctx, SLTP[t], int(typical) ^ ltp); ltp = int(typical)
            if ltp: continue
        for x in range(w):
            if skip and skip[y][x]: continue
            mq.encode(ctx, gctx(b, x, y, t, at), b[y][x])

def rctx(g, r, x, y, t, dx, dy, at):
    G = lambda a, c: px(g, x + a, y + c)
    R = lambda a, c: px(r, x - dx + a, y - dy + c)
    if t == 0:
        return (G(-1,0)|G(1,-1)<<1|G(0,-1)<<2|G(*at[0])<<3|R(1,1)<<4|R(0,1)<<5|R(-1,1)<<6|R(1,0)<<7
                |R(0,0)<<8|R(-1,0)<<9|R(1,-1)<<10|R(0,-1)<<11|R(*at[1])<<12)
    return G(-1,0)|G(1,-1)<<1|G(0,-1)<<2|G(-1,-1)<<3|R(1,1)<<4|R(0,1)<<5|R(1,0)<<6|R(0,0)<<7|R(-1,0)<<8|R(0,-1)<<9

def refine_encode(mq, ctx, g, r, t, dx, dy, at, tpgron=False):
    w, h = len(g[0]) if g else 0, len(g)
    ltp = 0
    def implicit(x, y):
        i, j = x - dx, y - dy
        m = px(r, i, j)
        return m if all(px(r, i + a, j + c) == m for a in (-1, 0, 1) for c in (-1, 0, 1)) else None
    for y in range(h):
        if tpgron:
            typical = all(implicit(x, y) in (None, g[y][x]) for x in range(w))
            mq.encode(ctx, 0x100 if t == 0 else 0x40, int(typical) ^ ltp); ltp = int(typical)
        for x in range(w):
            if ltp and implicit(x, y) is not None: continue
            mq.encode(ctx, rctx(g, r, x, y, t, dx, dy, at), g[y][x])

# ── Huffman (Annex B) ────────────────────────────────────────────────────────

def L(p, r, low, kind=""): return (p, r, low, kind)
STD = {
  1: [L(1,4,0), L(2,8,16), L(3,16,272), L(3,32,65808,"high")],
  2: [L(1,0,0), L(2,0,1), L(3,0,2), L(4,3,3), L(5,6,11), L(6,32,75,"high"), L(6,0,0,"oob")],
  3: [L(8,8,-256), L(1,0,0), L(2,0,1), L(3,0,2), L(4,3,3), L(5,6,11), L(8,32,-257,"low"), L(7,32,75,"high"), L(6,0,0,"oob")],
  4: [L(1,0,1), L(2,0,2), L(3,0,3), L(4,3,4), L(5,6,12), L(5,32,76,"high")],
  5: [L(7,8,-255), L(1,0,1), L(2,0,2), L(3,0,3), L(4,3,4), L(5,6,12), L(7,32,-256,"low"), L(6,32,76,"high")],
  6: [L(5,10,-2048), L(4,9,-1024), L(4,8,-512), L(4,7,-256), L(5,6,-128), L(5,5,-64), L(4,5,-32), L(2,7,0), L(3,7,128),
      L(3,8,256), L(4,9,512), L(4,10,1024), L(6,32,-2049,"low"), L(6,32,2048,"high")],
  7: [L(4,9,-1024), L(3,8,-512), L(4,7,-256), L(5,6,-128), L(5,5,-64), L(4,5,-32), L(4,5,0), L(5,5,32), L(5,6,64),
      L(4,7,128), L(3,8,256), L(3,9,512), L(3,10,1024), L(5,32,-1025,"low"), L(5,32,2048,"high")],
  8: [L(8,3,-15), L(9,1,-7), L(8,1,-5), L(9,0,-3), L(7,0,-2), L(4,0,-1), L(2,1,0), L(5,0,2), L(6,0,3), L(3,4,4),
      L(6,1,20), L(4,4,22), L(4,5,38), L(5,6,70), L(5,7,134), L(6,7,262), L(7,8,390), L(6,10,646),
      L(9,32,-16,"low"), L(9,32,1670,"high"), L(2,0,0,"oob")],
  9: [L(8,4,-31), L(9,2,-15), L(8,2,-11), L(9,1,-7), L(7,1,-5), L(4,1,-3), L(3,1,-1), L(3,1,1), L(5,1,3), L(6,1,5),
      L(3,5,7), L(6,2,39), L(4,5,43), L(4,6,75), L(5,7,139), L(5,8,267), L(6,8,523), L(7,9,779), L(6,11,1291),
      L(9,32,-32,"low"), L(9,32,3339,"high"), L(2,0,0,"oob")],
  10: [L(7,4,-21), L(8,0,-5), L(7,0,-4), L(5,0,-3), L(2,2,-2), L(5,0,2), L(6,0,3), L(7,0,4), L(8,0,5), L(2,6,6),
       L(5,5,70), L(6,5,102), L(6,6,134), L(6,7,198), L(6,8,326), L(6,9,582), L(6,10,1094), L(7,11,2118),
       L(8,32,-22,"low"), L(8,32,4166,"high"), L(2,0,0,"oob")],
  11: [L(1,0,1), L(2,1,2), L(4,0,4), L(4,1,5), L(5,1,7), L(5,2,9), L(6,2,13), L(7,2,17), L(7,3,21), L(7,4,29),
       L(7,5,45), L(7,6,77), L(7,32,141,"high")],
  12: [L(1,0,1), L(2,0,2), L(3,1,3), L(5,0,5), L(5,1,6), L(6,1,8), L(7,0,10), L(7,1,11), L(7,2,13), L(7,3,17),
       L(7,4,25), L(8,5,41), L(8,32,73,"high")],
  13: [L(1,0,1), L(3,0,2), L(4,0,3), L(5,0,4), L(4,1,5), L(3,3,7), L(6,1,15), L(6,2,17), L(6,3,21), L(6,4,29),
       L(6,5,45), L(7,6,77), L(7,32,141,"high")],
}

def codes(lines):
    maxlen = max([l[0] for l in lines] + [0])
    count = [0] * (maxlen + 1)
    for l in lines:
        if l[0]: count[l[0]] += 1
    out, first = {}, 0
    for n in range(1, maxlen + 1):
        first = (first + count[n - 1]) * 2
        c = first
        for k, l in enumerate(lines):
            if l[0] == n: out[k] = (n, c); c += 1
    return out

class BitW:
    def __init__(self): self.bits = []
    def put(self, v, n):
        for k in range(n - 1, -1, -1): self.bits.append((v >> k) & 1)
    def align(self):
        while len(self.bits) % 8: self.bits.append(0)
    def raw(self, data):
        self.align()
        for b in data: self.put(b, 8)
    def bytes(self):
        self.align()
        return bytes(int("".join(map(str, self.bits[i:i + 8])), 2) for i in range(0, len(self.bits), 8))
    def huff(self, lines, v):
        cs = codes(lines)
        for k, (p, r, low, kind) in enumerate(lines):
            if not p: continue
            if kind == "oob":
                if v is None: self.put(cs[k][1], cs[k][0]); return
                continue
            if v is None: continue
            if (kind == "" and low <= v < low + (1 << r)) or (kind == "low" and v <= low) or (kind == "high" and v >= low):
                self.put(cs[k][1], cs[k][0])
                self.put(low - v if kind == "low" else v - low, r)
                return
        raise ValueError(f"no line codes {v}")

# ── MMR (libtiff's Group 4, through Pillow) ─────────────────────────────────

def g4(b):
    """T.6 data for bitmap b, EOFB-terminated, as libtiff writes it."""
    w, h = len(b[0]), len(b)
    im = Image.new("1", (w, h))
    # Pillow writes a "1" image's raw bit 1 (value 255) as a G4 black run, and
    # MMR's black is JBIG2's 1, so ink is written as 255.
    im.putdata([255 if v else 0 for row in b for v in row])
    buf = io.BytesIO(); im.save(buf, "TIFF", compression="group4")
    t = Image.open(io.BytesIO(buf.getvalue()))
    offs, counts = t.tag_v2[273], t.tag_v2[279]
    assert len(offs) == 1, "one strip"
    return buf.getvalue()[offs[0]:offs[0] + counts[0]]

# ── segments ─────────────────────────────────────────────────────────────────

def seg(number, typ, data, refs=(), page=1, page4=False):
    rs = 1 if number <= 256 else 2 if number <= 65536 else 4
    head = struct.pack(">IB", number, typ | (64 if page4 else 0))
    head += bytes([len(refs) << 5])
    for r in refs: head += r.to_bytes(rs, "big")
    head += struct.pack(">I", page) if page4 else bytes([page])
    return head + struct.pack(">I", len(data)) + data

def page_info(w, h, defpix=0, op=0, striped=None, flags_extra=0):
    flags = (defpix << 2) | (op << 3) | flags_extra
    striping = 0 if striped is None else 0x8000 | striped
    return struct.pack(">IIIIBH", w, h, 0, 0, flags, striping)

def region_info(w, h, x, y, op=0, extra=0): return struct.pack(">IIIIB", w, h, x, y, op | extra)
def at_bytes(at): return b"".join(struct.pack(">bb", *p) for p in at)

def generic_seg(b, t=0, at=None, tpgdon=False, mmr=False, x=0, y=0, op=0, flags_extra=0):
    at = at or NOMINAL_AT[t]
    w, h = len(b[0]), len(b)
    if mmr: return region_info(w, h, x, y, op) + bytes([1 | flags_extra]) + g4(b)
    mq = MQ(); generic_encode(mq, {}, b, t, at, tpgdon)
    return region_info(w, h, x, y, op) + bytes([(t << 1) | (8 if tpgdon else 0) | flags_extra]) + at_bytes(at) + mq.flush()

# ── symbol dictionaries and text regions ────────────────────────────────────

def classes(syms):
    """Group symbol indices into height classes, as a dictionary must list them."""
    order = sorted(range(len(syms)), key=lambda i: (len(syms[i]), len(syms[i][0])))
    out = []
    for i in order:
        if out and len(syms[out[-1][0]]) == len(syms[i]): out[-1].append(i)
        else: out.append([i])
    return order, out

def sd_arith(new, t=0, at=None, n_in=0, export=None, refagg=None, rt=0, rat=((-1, -1), (-1, -1))):
    """An arithmetic symbol dictionary. `refagg`, when given, maps a new symbol's
    index to ('ref', id, rdx, rdy) or ('agg', [(id, x, y), ...]) over the input
    symbols plus the new ones before it; otherwise every symbol is generic-coded.
    Returns (data, order): `order` is the new symbols in coded order."""
    at = at or NOMINAL_AT[t]
    order, hcs = classes(new) if refagg is None else (list(range(len(new))), [[i] for i in range(len(new))])
    total = n_in + len(new)
    idlen = 0
    while (1 << idlen) < total: idlen += 1
    mq = MQ(); gb, gr = {}, {}
    cx = {k: {} for k in ("DH", "DW", "EX", "AI", "DT", "FS", "DS", "IT", "RI", "RDW", "RDH", "RDX", "RDY", "ID")}
    coded, hc = [], 0
    for cls in hcs:
        h = len(new[cls[0]]); ia(mq, cx["DH"], h - hc); hc = h
        sw = 0
        for i in cls:
            w = len(new[i][0]); ia(mq, cx["DW"], w - sw); sw = w
            if refagg is None: generic_encode(mq, gb, new[i], t, at)
            else:
                kind = refagg[i]
                pool = in_syms_placeholder + [new[j] for j in coded]
                if kind[0] == "ref":
                    _, sid, rdx, rdy = kind
                    ia(mq, cx["AI"], 1); iaid(mq, cx["ID"], sid, idlen); ia(mq, cx["RDX"], rdx); ia(mq, cx["RDY"], rdy)
                    refine_encode(mq, gr, new[i], pool[sid], rt, rdx, rdy, rat)
                else:
                    insts = kind[1]
                    ia(mq, cx["AI"], len(insts))
                    text_arith_body(mq, cx, gr, insts, pool, idlen, strips=1, corner=1, transposed=False,
                                    dsoff=0, refine=True, rt=rt, rat=rat)
            coded.append(i)
        ia(mq, cx["DW"], None)
    flags_ex = export if export is not None else [0] * n_in + [1] * len(new)
    runs, cur, k = [], 0, 0
    while k < len(flags_ex):
        n = 0
        while k < len(flags_ex) and flags_ex[k] == cur: n += 1; k += 1
        runs.append(n); cur ^= 1
    for r in runs: ia(mq, cx["EX"], r)
    return mq.flush(), [order[k] for k in range(len(order))] if refagg is None else list(range(len(new)))

in_syms_placeholder = []

def text_arith_body(mq, cx, gr, insts, syms, idlen, strips, corner, transposed, dsoff, refine, rt, rat, refined=None):
    """Code instances [(id, S, T)] (S and T as the decoder computes them at
    6.4.5 (3c.vii)), grouped into strips, in the order given. `refined` maps an
    instance index to (bitmap, rdw, rdh, rdx, rdy)."""
    # the decoder starts at STRIPT = -DT0 * SBSTRIPS and adds DT * SBSTRIPS per strip
    ia(mq, cx["DT"], 1)
    stript = -strips
    firsts = 0
    groups = []
    for n, (sid, s, t) in enumerate(insts):
        st = (t // strips) * strips
        if groups and groups[-1][0] == st: groups[-1][1].append(n)
        else: groups.append((st, [n]))
    for st, members in groups:
        ia(mq, cx["DT"], (st - stript) // strips); stript = st
        curs = None
        for k, n in enumerate(members):
            sid, s, t = insts[n]
            ib = refined[n][0] if refined and n in refined else syms[sid]
            wi, hi = len(ib[0]), len(ib)
            pre = (wi - 1) if (not transposed and corner > 1) else (hi - 1) if (transposed and not corner & 1) else 0
            start = s - pre
            if k == 0: ia(mq, cx["FS"], start - firsts); firsts = start
            else: ia(mq, cx["DS"], start - curs - dsoff)
            if strips != 1: ia(mq, cx["IT"], t - st)
            iaid(mq, cx["ID"], sid, idlen)
            if refine:
                if refined and n in refined:
                    bm, rdw, rdh, rdx, rdy = refined[n]
                    ia(mq, cx["RI"], 1)
                    for key, v in (("RDW", rdw), ("RDH", rdh), ("RDX", rdx), ("RDY", rdy)): ia(mq, cx[key], v)
                    refine_encode(mq, gr, bm, syms[sid], rt, (rdw >> 1) + rdx, (rdh >> 1) + rdy, rat)
                else: ia(mq, cx["RI"], 0)
            post = (wi - 1) if (not transposed and corner < 2) else (hi - 1) if (transposed and corner & 1) else 0
            curs = s + post
        ia(mq, cx["DS"], None)

def place(ib, s, t, corner, transposed):
    wi, hi = len(ib[0]), len(ib)
    u, v = (t, s) if transposed else (s, t)
    return {1: (u, v), 3: (u - wi + 1, v), 0: (u, v - hi + 1), 2: (u - wi + 1, v - hi + 1)}[corner]

def text_seg_arith(w, h, insts, syms, strips=1, corner=1, transposed=False, dsoff=0, combop=0, defpix=0,
                   refined=None, rt=0, rat=((-1, -1), (-1, -1)), x=0, y=0, op=0):
    idlen = 0
    while (1 << idlen) < len(syms): idlen += 1
    refine = refined is not None
    logs = {1: 0, 2: 1, 4: 2, 8: 3}[strips]
    flags = (int(refine) << 1) | (logs << 2) | (corner << 4) | (int(transposed) << 6) | (combop << 7) | (defpix << 9)
    flags |= ((dsoff & 31) << 10) | (rt << 15)
    mq = MQ()
    cx = {k: {} for k in ("DT", "FS", "DS", "IT", "RI", "RDW", "RDH", "RDX", "RDY", "ID")}
    text_arith_body(mq, cx, {}, insts, syms, idlen, strips, corner, transposed, dsoff, refine, rt, rat, refined)
    body = struct.pack(">H", flags) + (at_bytes(rat) if refine and rt == 0 else b"") + struct.pack(">I", len(insts))
    # the intended region
    reg = blank(w, h, defpix)
    for n, (sid, s, t) in enumerate(insts):
        ib = refined[n][0] if refined and n in refined else syms[sid]
        X, Y = place(ib, s, t, corner, transposed)
        compose(reg, ib, X, Y, combop)
    return region_info(w, h, x, y, op) + body + mq.flush(), reg

def sd_huff(new, dh=4, dw=2, bmsize="mmr", custom=None, export=None, n_in=0):
    """A Huffman-coded dictionary: DH with table `dh` (4, 5 or a custom lines list),
    DW with `dw` (2, 3 or custom); each height class's collective bitmap MMR-coded
    or ("raw") uncompressed."""
    order, hcs = classes(new)
    tDH = STD[dh] if isinstance(dh, int) else dh
    tDW = STD[dw] if isinstance(dw, int) else dw
    bw = BitW(); hc = 0
    for cls in hcs:
        h = len(new[cls[0]]); bw.huff(tDH, h - hc); hc = h
        sw = 0
        for i in cls:
            w = len(new[i][0]); bw.huff(tDW, w - sw); sw = w
        bw.huff(tDW, None)
        coll = [sum((new[i][r] for i in cls), []) for r in range(h)]
        if bmsize == "raw":
            bw.huff(STD[1], 0); bw.align()
            bw.raw(packed(coll))
        else:
            data = g4(coll)
            bw.huff(STD[1], len(data)); bw.raw(data)
    flags_ex = export if export is not None else [0] * n_in + [1] * len(new)
    runs, cur, k = [], 0, 0
    while k < len(flags_ex):
        n = 0
        while k < len(flags_ex) and flags_ex[k] == cur: n += 1; k += 1
        runs.append(n); cur ^= 1
    for r in runs: bw.huff(STD[1], r)
    sel_dh = 3 if not isinstance(dh, int) else {4: 0, 5: 1}[dh]
    sel_dw = 3 if not isinstance(dw, int) else {2: 0, 3: 1}[dw]
    flags = 1 | (sel_dh << 2) | (sel_dw << 4)
    return flags, bw.bytes(), order

def table_seg(lines_spec):
    """A custom table segment (7.4.13) and the lines it defines."""
    htoob, htps, htrs, low, high, ranges, lowp, highp, oobp = lines_spec
    bw = BitW()
    bw.put(htoob | ((htps - 1) << 1) | ((htrs - 1) << 4), 8)
    bw.put(low & 0xffffffff, 32); bw.put(high & 0xffffffff, 32)
    lines, cur = [], low
    for p, r in ranges:
        bw.put(p, htps); bw.put(r, htrs); lines.append(L(p, r, cur)); cur += 1 << r
    assert cur >= high
    bw.put(lowp, htps); lines.append(L(lowp, 32, low - 1, "low"))
    bw.put(highp, htps); lines.append(L(highp, 32, high, "high"))
    if htoob: bw.put(oobp, htps); lines.append(L(oobp, 0, 0, "oob"))
    # One byte more than the lines need: jbig2dec 0.20 reads a field only when
    # MORE bits remain than it takes (`boffset + HTPS >= len` refuses), so a
    # table ending on a byte boundary is "too short" to it. T.88 lets a segment's
    # data run past what it uses; `jbig2decode.mjs` reads the table either way.
    return bw.bytes() + b"\0", lines

def text_seg_huff(w, h, insts, syms, fs=6, ds=8, dt=11, strips=1, corner=1, transposed=False, dsoff=0, custom=()):
    """A Huffman-coded text region; fs/ds/dt are standard table numbers or custom line lists."""
    t = lambda v, std: STD[v] if isinstance(v, int) else v
    sel = lambda v, std: 3 if not isinstance(v, int) else std.index(v)
    bw = BitW()
    # the symbol-id table: every symbol a code of the same length, via run codes
    n = len(syms); ln = max(1, (n - 1).bit_length())
    runlens = [0] * 35
    runlens[ln] = 1
    runlines = [L(runlens[i], 0, i) for i in range(35)]
    for i in range(35): bw.put(runlens[i], 4)
    for _ in range(n): bw.huff(runlines, ln)
    bw.align()
    symlines = [L(ln, 0, i) for i in range(n)]
    tFS, tDS, tDT = t(fs, 0), t(ds, 0), t(dt, 0)
    logs = {1: 0, 2: 1, 4: 2, 8: 3}[strips]
    bw.huff(tDT, 1); stript = -strips
    groups = []
    for k, (sid, s, tt) in enumerate(insts):
        st = (tt // strips) * strips
        if groups and groups[-1][0] == st: groups[-1][1].append(k)
        else: groups.append((st, [k]))
    firsts = 0
    for st, members in groups:
        bw.huff(tDT, (st - stript) // strips); stript = st
        curs = None
        for k, m in enumerate(members):
            sid, s, tt = insts[m]
            ib = syms[sid]; wi, hi = len(ib[0]), len(ib)
            pre = (wi - 1) if (not transposed and corner > 1) else (hi - 1) if (transposed and not corner & 1) else 0
            start = s - pre
            if k == 0: bw.huff(tFS, start - firsts); firsts = start
            else: bw.huff(tDS, start - curs - dsoff)
            if strips != 1: bw.put(tt - st, logs)
            bw.huff(symlines, sid)
            post = (wi - 1) if (not transposed and corner < 2) else (hi - 1) if (transposed and corner & 1) else 0
            curs = s + post
        bw.huff(tDS, None)
    flags = 1 | (logs << 2) | (corner << 4) | (int(transposed) << 6) | ((dsoff & 31) << 10)
    hflags = sel(fs, [6, 7]) | (sel(ds, [8, 9, 10]) << 2) | (sel(dt, [11, 12, 13]) << 4)
    body = struct.pack(">HH", flags, hflags) + struct.pack(">I", len(insts)) + bw.bytes()
    reg = blank(w, h)
    for sid, s, tt in insts:
        X, Y = place(syms[sid], s, tt, corner, transposed)
        compose(reg, syms[sid], X, Y, 0)
    return region_info(w, h, 0, 0, 0) + body, reg

# ── the source pictures ─────────────────────────────────────────────────────

def main(ordinance):
    doc = pymupdf.open(ordinance)
    pages = []
    for x in range(1, doc.xref_length()):
        o = doc.xref_object(x)
        if "/JBIG2Decode" in o:
            g = int(re.search(r"/JBIG2Globals (\d+)", o).group(1))
            pages.append((x, g, doc.xref_stream_raw(x), doc.xref_stream_raw(g)))
    (sw, sh, spk), _ = jbig2dec(pages[1][2], pages[1][3])
    scan = to_bitmap(sw, sh, spk)
    # A window of the scan with dense type, and the glyph shapes the scanner's
    # own dictionary holds (cut from the decoded page at their connected components).
    ink = max(((x, y) for y in range(300, 2800, 100) for x in range(200, 2100, 100)),
              key=lambda p: sum(map(sum, crop(scan, p[0], p[1], 160, 90))))
    text = crop(scan, ink[0], ink[1], 160, 90)
    glyphs = components(scan, ink[0], ink[1], 400, 200)[:24]

    variants = []
    def keep(name, stream, globals_=None, intended=None, features=(), expect="ok", jbig2dec_only=False, note=""):
        (res, err) = jbig2dec(stream, globals_)
        v = {"name": name, "features": list(features), "expect": expect,
             "stream_b64": base64.b64encode(stream).decode(), "globals_b64": base64.b64encode(globals_).decode() if globals_ is not None else None}
        if note: v["note"] = note
        if expect == "ok":
            if res is None and os.environ.get("JBIG2_DEBUG_DIR"):
                dd = os.environ["JBIG2_DEBUG_DIR"]
                open(os.path.join(dd, name + ".jb2"), "wb").write(stream)
                if globals_ is not None: open(os.path.join(dd, name + ".glob"), "wb").write(globals_)
            assert res is not None, f"{name}: jbig2dec refused it: {err[:400]}"
            w, h, pk = res
            if intended is not None and not jbig2dec_only:
                got = to_bitmap(w, h, pk)
                diff = [(x, y) for y in range(min(h, len(intended))) for x in range(min(w, len(intended[0]))) if got[y][x] != intended[y][x]]
                if diff and os.environ.get("JBIG2_DEBUG_DIR"):
                    dd = os.environ["JBIG2_DEBUG_DIR"]
                    open(os.path.join(dd, name + ".jb2"), "wb").write(stream)
                    if globals_ is not None: open(os.path.join(dd, name + ".glob"), "wb").write(globals_)
                    open(os.path.join(dd, name + ".want"), "w").write("\n".join("".join(map(str, r)) for r in intended))
                    open(os.path.join(dd, name + ".got"), "w").write("\n".join("".join(map(str, r)) for r in got))
                assert (w, h) == (len(intended[0]), len(intended)) and not diff, \
                    f"{name}: jbig2dec's picture is not the one encoded: {w}x{h}, {len(diff)} pixels differ, first {diff[:6]}"
            if jbig2dec_only:
                v["jbig2dec_only"] = True
            v.update(width=w, height=h, jbig2dec_sha256=hashlib.sha256(pk).hexdigest(),
                     pdf_samples_sha256=pdf_samples_sha(pk, w, h), black=sum(bin(b).count("1") for b in pk))
        else:
            v["jbig2dec"] = "refused" if res is None else "decoded"
        variants.append(v)

    def construction(name, stream, globals_, intended, features, note):
        """A fixture whose expected picture is the one ENCODED, because jbig2dec
        cannot decode it or departs from T.88 on it; jbig2dec's answer is kept
        beside it so the difference stays visible."""
        (res, err) = jbig2dec(stream, globals_)
        w, h = len(intended[0]), len(intended)
        variants.append({"name": name, "features": features, "expect": "ok", "stream_b64": base64.b64encode(stream).decode(),
            "globals_b64": base64.b64encode(globals_).decode() if globals_ is not None else None,
            "width": w, "height": h, "construction_sha256": hashlib.sha256(packed(intended)).hexdigest(),
            "pdf_samples_sha256": pdf_samples_sha(packed(intended), w, h),
            "jbig2dec_sha256": hashlib.sha256(res[2]).hexdigest() if res else None,
            "jbig2dec": "decoded" if res else f"refused: {err.strip().splitlines()[-1][:160] if err.strip() else ''}",
            "note": note})

    P = lambda w, h, **k: seg(100, 48, page_info(w, h, **k))   # never a number the globals use
    EOP = seg(99, 49, b"")

    # 1. jbig2enc — generic region, with and without TPGDON; symbol mode (+ refinement)
    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, "text.png")
        Image.frombytes("1", (160, 90), bytes(packed([[1 - v for v in r] for r in text]))).save(src)
        for name, args in (("jbig2enc-generic", []), ("jbig2enc-generic-tpgd", ["-d"])):
            out = subprocess.run(["jbig2", "-p", *args, src], capture_output=True, cwd=d).stdout
            keep(name, out, None, text, ["generic region, arithmetic, template 0"] + (["TPGDON"] if args else []))
        # (jbig2enc's refinement, -r, is broken in its releases and refuses to run)
        for name, args in (("jbig2enc-symbol", ["-s"]),):
            subprocess.run(["jbig2", "-p", *args, "-b", "out", src], capture_output=True, cwd=d, check=True)
            glob = open(os.path.join(d, "out.sym"), "rb").read()
            page = open(os.path.join(d, "out.0000"), "rb").read()
            keep(name, page, glob, None, ["symbol dictionary", "text region"],
                 note="jbig2enc's symbol mode is lossy, so its picture is jbig2dec's, not the source's")

    # 2. generic regions: every template, nominal and moved AT pixels, TPGDON, MMR
    w, h = len(text[0]), len(text)
    moved = {0: [(-2, -1), (1, -1), (4, -2), (-4, -1)], 1: [(-3, -1)], 2: [(1, -2)], 3: [(-1, -1)]}
    for t in range(4):
        for tp in (False, True):
            for label, at in (("nominal", NOMINAL_AT[t]), ("moved", moved[t])):
                keep(f"generic-t{t}-{label}{'-tpgdon' if tp else ''}",
                     P(w, h) + seg(1, 38, generic_seg(text, t, at, tp)) + EOP, None, text,
                     [f"generic region, arithmetic, template {t}"] + (["TPGDON"] if tp else []) + [f"AT {label}"])
    keep("generic-mmr", P(w, h) + seg(1, 38, generic_seg(text, mmr=True)) + EOP, None, text, ["generic region, MMR"])
    keep("generic-lossless-type39", P(w, h) + seg(1, 39, generic_seg(text)) + EOP, None, text, ["immediate lossless generic region"])
    # an odd width (not a multiple of 8) and a one-row region
    odd = crop(text, 3, 5, 101, 37)
    keep("generic-odd-width", P(101, 37) + seg(1, 38, generic_seg(odd, 1)) + EOP, None, odd, ["odd width"])
    # unknown data length (7.2.7): arithmetic ends 0xFFAC, then the row count
    hdr = struct.pack(">IB", 1, 38) + bytes([0]) + bytes([1]) + struct.pack(">I", 0xffffffff)
    unk_stream = P(w, h) + hdr + generic_seg(text, 0) + struct.pack(">I", h) + EOP
    keep("generic-unknown-length", unk_stream, None, text, ["data length unknown (7.2.7)"])

    # 3. the page: default pixel, combination operators, regions placed and clipped, striping
    a, b = crop(text, 0, 0, 80, 60), crop(text, 50, 20, 90, 60)
    for op, nm in enumerate(("or", "and", "xor", "xnor", "replace")):
        pg = blank(130, 80, 1 if op == 1 else 0)
        compose(pg, a, 0, 0, 0); compose(pg, b, 40, 20, op)
        keep(f"page-op-{nm}", P(130, 80, defpix=1 if op == 1 else 0, flags_extra=0x40)
             + seg(1, 38, generic_seg(a, 0, op=0)) + seg(2, 38, generic_seg(b, 0, x=40, y=20, op=op)) + EOP,
             None, pg, [f"region combination operator {nm}"])
    pg = blank(100, 50); compose(pg, a, 60, 10, 0)
    keep("page-clipped", P(100, 50) + seg(1, 38, generic_seg(a, 0, x=60, y=10)) + EOP, None, pg, ["region clipped by the page"])
    # a striped page of unknown height, grown by its end-of-stripe segments
    s1, s2 = crop(text, 0, 0, 160, 40), crop(text, 0, 40, 160, 50)
    striped = (seg(0, 48, page_info(160, 0xffffffff, striped=64)) + seg(1, 38, generic_seg(s1, 0))
               + seg(2, 50, struct.pack(">I", 39)) + seg(3, 38, generic_seg(s2, 0, y=40)) + seg(4, 50, struct.pack(">I", 89)) + EOP)
    keep("page-striped-unknown-height", striped, None, text, ["page of unknown height", "end of stripe"])

    # 4. refinement regions: both templates, TPGRON, moved AT, onto an intermediate region and onto the page
    target = [row[:] for row in text]
    for yy in range(10, 30):
        for xx in range(20, 60): target[yy][xx] ^= 1 if (xx + yy) % 7 == 0 else 0
    for t in (0, 1):
        for tp in (False, True):
            if t == 1 and tp:
                continue   # below, as jbig2dec_only
            rat = ((-1, -1), (-1, -1)) if t == 0 else ()
            mq = MQ(); refine_encode(mq, {}, target, text, t, 0, 0, rat, tp)
            rseg = region_info(w, h, 0, 0, 4) + bytes([t | (2 if tp else 0)]) + (at_bytes(rat) if t == 0 else b"") + mq.flush()
            keep(f"refine-t{t}{'-tpgron' if tp else ''}",
                 P(w, h) + seg(1, 38, generic_seg(text, 0)) + seg(2, 42, rseg) + EOP, None, target,
                 [f"generic refinement region, template {t}"] + (["TPGRON"] if tp else []) + ["reference is the page"])
    rat2 = ((1, -1), (0, -2))
    mq = MQ(); refine_encode(mq, {}, target, text, 0, 0, 0, rat2, True)
    rseg = region_info(w, h, 0, 0, 4) + bytes([2]) + at_bytes(rat2) + mq.flush()
    keep("refine-t0-moved-at-onto-page", P(w, h) + seg(1, 38, generic_seg(text, 0)) + seg(2, 42, rseg) + EOP, None, target,
         ["generic refinement region, template 0", "moved AT", "reference is the page"])
    # template 1 with TPGRON: jbig2dec decodes its typical-prediction bit in context
    # 0x40 where T.88 reads 0x80; the stream is coded as jbig2dec reads it.
    mq = MQ(); refine_encode(mq, {}, target, text, 1, 0, 0, (), True)
    rseg = region_info(w, h, 0, 0, 4) + bytes([3]) + mq.flush()
    keep("refine-t1-tpgron", P(w, h) + seg(1, 38, generic_seg(text, 0)) + seg(2, 42, rseg) + EOP, None, target,
         ["generic refinement region, template 1", "TPGRON (jbig2dec's context)"])
    # an intermediate generic region, refined onto the page: jbig2dec does not
    # implement type 36 (its own "NYI"), so the expected picture is the one encoded.
    mq = MQ(); refine_encode(mq, {}, target, text, 0, 0, 0, ((-1, -1), (-1, -1)))
    rseg = region_info(w, h, 0, 0, 0) + bytes([0]) + at_bytes(((-1, -1), (-1, -1))) + mq.flush()
    construction("intermediate-generic-refined", P(w, h) + seg(1, 36, generic_seg(text, 0)) + seg(2, 42, rseg, refs=(1,)) + EOP,
                 None, target, ["intermediate generic region", "refinement of an intermediate region"],
                 "jbig2dec refuses segment type 36 as not implemented")
    # a refinement region placed away from the origin, refining the page under it:
    # T.88 7.4.7.4 takes the page's region at (x, y) as the reference; jbig2dec
    # (its own TODO) takes the page from (0, 0). The expected picture is the one
    # encoded, which only T.88's reading reproduces; jbig2dec's is recorded too.
    sub = crop(text, 30, 20, 60, 40)
    subt = [row[:] for row in sub]
    for yy in range(5, 15):
        for xx in range(5, 50): subt[yy][xx] ^= 1
    mq = MQ(); refine_encode(mq, {}, subt, sub, 0, 0, 0, ((-1, -1), (-1, -1)))
    rseg = region_info(60, 40, 30, 20, 4) + bytes([0]) + at_bytes(((-1, -1), (-1, -1))) + mq.flush()
    pg = [row[:] for row in text]; compose(pg, subt, 30, 20, 4)
    construction("refine-onto-page-offset", P(w, h) + seg(1, 38, generic_seg(text, 0)) + seg(2, 42, rseg) + EOP, None, pg,
                 ["reference is the page at the region's place (T.88 7.4.7.4)"],
                 "jbig2dec takes the page from (0, 0) here (its own TODO), so its picture differs")
    assert variants[-1]["jbig2dec_sha256"] != variants[-1]["construction_sha256"], "jbig2dec now agrees: make this an ordinary fixture"

    # 5. symbol dictionaries and text regions, arithmetic
    syms = glyphs
    def layout(n, strips=1, corner=1, transposed=False):
        """Instances (id, S, T): S runs along a line, T is the strip's T plus
        CURT; each line is one strip, so T - STRIPT stays below SBSTRIPS."""
        insts, s, line = [], 2, 0
        for k in range(n):
            sid = (k * 7) % len(syms)
            ib = syms[sid]
            along = len(ib) if transposed else len(ib[0])
            if s + along > 200: s, line = 2, line + 1
            insts.append((sid, s + (along - 1 if corner in ((0, 2) if transposed else (2, 3)) else 0), 48 + 48 * line + k % strips))
            s += along + 2
        return insts
    for t in range(4):
        data, order = sd_arith(syms, t)
        dsyms = [syms[i] for i in order]
        insts = layout(20)
        tr, reg = text_seg_arith(260, 260, insts, dsyms)
        keep(f"symbols-arith-t{t}", P(260, 260) + seg(1, 6, tr, refs=(0,)) + EOP,
             seg(0, 0, struct.pack(">H", t << 10) + at_bytes(NOMINAL_AT[t]) + struct.pack(">II", len(syms), len(syms)) + data, page=0),
             reg, [f"symbol dictionary, arithmetic, template {t}", "text region, arithmetic", "globals"])
    data, order = sd_arith(syms, 0)
    dsyms = [syms[i] for i in order]
    SDSEG = seg(0, 0, struct.pack(">H", 0) + at_bytes(NOMINAL_AT[0]) + struct.pack(">II", len(syms), len(syms)) + data, page=0)
    for strips in (1, 2, 4, 8):
        for corner in range(4):
            for tp in (False, True):
                if strips not in (1, 4) and (corner, tp) != (1, False): continue
                insts = layout(18, strips, corner, tp)
                tr, reg = text_seg_arith(260, 260, insts, dsyms, strips=strips, corner=corner, transposed=tp)
                keep(f"text-strips{strips}-corner{corner}{'-transposed' if tp else ''}",
                     P(260, 260) + seg(1, 6, tr, refs=(0,)) + EOP, SDSEG, reg,
                     ["text region, arithmetic", f"SBSTRIPS {strips}", f"REFCORNER {corner}"] + (["TRANSPOSED"] if tp else []))
    for dsoff in (-3, 5):
        insts = [(sid, s + dsoff * k, t) for k, (sid, s, t) in enumerate(layout(12))]
        tr, reg = text_seg_arith(260, 260, insts, dsyms, dsoff=dsoff)
        keep(f"text-dsoffset{dsoff}", P(260, 260) + seg(1, 6, tr, refs=(0,)) + EOP, SDSEG, reg, [f"SBDSOFFSET {dsoff}"])
    for combop in (1, 2, 3):
        insts = layout(12)
        insts = insts + [(sid, s + 3, t + 2) for sid, s, t in insts[:4]]
        tr, reg = text_seg_arith(260, 260, insts, dsyms, combop=combop, defpix=1 if combop in (1, 3) else 0)
        keep(f"text-combop{combop}", P(260, 260) + seg(1, 7, tr, refs=(0,)) + EOP, SDSEG, reg,
             [f"SBCOMBOP {combop}", "SBDEFPIXEL"])
    # refinement in the text region (both templates)
    for rt in (0, 1):
        insts = layout(10)
        refined = {}
        for n in (1, 4, 7):
            sid = insts[n][0]; ib = dsyms[sid]
            bm = [row[:] + [row[-1]] for row in ib] + [[0] * (len(ib[0]) + 1)]
            bm[0][0] ^= 1
            refined[n] = (bm, 1, 1, 0, 0)
        tr, reg = text_seg_arith(260, 260, insts, dsyms, refined=refined, rt=rt,
                                 rat=((-1, -1), (-1, -1)) if rt == 0 else ())
        keep(f"text-refine-t{rt}", P(260, 260) + seg(1, 6, tr, refs=(0,)) + EOP, SDSEG, reg,
             ["text region, arithmetic, refinement", f"SBRTEMPLATE {rt}"])
    # an intermediate text region refined onto the page
    insts = layout(12)
    tr, reg = text_seg_arith(260, 260, insts, dsyms)
    tgt = [row[:] for row in reg]
    for yy in range(0, 20): tgt[yy][yy] ^= 1
    mq = MQ(); refine_encode(mq, {}, tgt, reg, 1, 0, 0, ())
    keep("text-intermediate-refined", P(260, 260) + seg(1, 4, tr, refs=(0,)) + seg(2, 42, region_info(260, 260, 0, 0, 4) + bytes([1]) + mq.flush(), refs=(1,)) + EOP,
         SDSEG, tgt, ["intermediate text region", "generic refinement region"])
    # a dictionary built on another: input symbols, a partial export
    half = len(syms) // 2
    d1, o1 = sd_arith(syms[:half], 0, export=[1] * half)
    s1 = [syms[:half][i] for i in o1]
    extra = syms[half:]
    d2, o2 = sd_arith(extra, 2, n_in=half, export=[1 if k % 3 else 0 for k in range(half)] + [1] * len(extra))
    exported = [s1[k] for k in range(half) if k % 3] + [extra[i] for i in o2]
    insts = layout(16)
    insts = [(sid % len(exported), s, t) for sid, s, t in insts]
    tr, reg = text_seg_arith(260, 260, insts, exported)
    G2 = (seg(0, 0, struct.pack(">H", 0) + at_bytes(NOMINAL_AT[0]) + struct.pack(">II", half, half) + d1, page=0)
          + seg(1, 0, struct.pack(">H", 2 << 10) + at_bytes(NOMINAL_AT[2]) + struct.pack(">II", len(exported), len(extra)) + d2, refs=(0,), page=0))
    keep("symbols-chained-partial-export", P(260, 260) + seg(2, 6, tr, refs=(1,)) + EOP, G2, reg,
         ["symbol dictionary referring to another", "export flags"])
    # refinement/aggregate dictionaries: a symbol refined from another, and one aggregated from several
    global in_syms_placeholder
    in_syms_placeholder = []
    # the input dictionary exports its symbols in coded (height-class) order
    dA, orderA = sd_arith(syms[:6], 0, export=[1] * 6)
    base = [syms[:6][i] for i in orderA]
    r1 = [row[:] for row in base[2]]; r1[0][0] ^= 1
    agg_w = len(base[0][0]) + len(base[1][0]) + 3
    agg_h = max(len(base[0]), len(base[1]))
    agg = blank(agg_w, agg_h)
    compose(agg, base[0], 0, 0, 0); compose(agg, base[1], len(base[0][0]) + 3, 0, 0)
    news = base + [r1, agg]
    # the first six new symbols refine the input dictionary's (exactly: TPGRON off,
    # every pixel coded); the seventh refines one with a pixel changed
    spec = {i: ("ref", i, 0, 0) for i in range(6)}
    in_syms_placeholder = [s for s in base]
    spec[6] = ("ref", 2, 0, 0)
    # the aggregate's instances (id, S, T): TOPLEFT, so S is the left edge and T the top
    spec[7] = ("agg", [(0, 0, 0), (1, len(base[0][0]) + 3, 0)])
    in_syms_placeholder = base
    for rt in (0, 1):
        dB, _ = sd_arith(news, 0, n_in=6, export=[0] * 6 + [1] * 8, refagg=spec, rt=rt,
                         rat=((-1, -1), (-1, -1)) if rt == 0 else ())
        outs = news
        insts = [(k, 4 + 22 * k, 4) for k in range(8)]
        tr, reg = text_seg_arith(200, 40, insts, outs)
        flags = (1 << 1) | (rt << 12)
        G3 = (seg(0, 0, struct.pack(">H", 0) + at_bytes(NOMINAL_AT[0]) + struct.pack(">II", 6, 6) + dA, page=0)
              + seg(1, 0, struct.pack(">H", flags) + at_bytes(NOMINAL_AT[0]) + (at_bytes(((-1, -1), (-1, -1))) if rt == 0 else b"")
                    + struct.pack(">II", 8, 8) + dB, refs=(0,), page=0))
        keep(f"symbols-refagg-rt{rt}", P(200, 40) + seg(2, 6, tr, refs=(1,)) + EOP, G3, reg,
             ["symbol dictionary, refinement/aggregate", f"SDRTEMPLATE {rt}"])
    in_syms_placeholder = []

    # 6. Huffman-coded dictionaries and text regions, standard and custom tables
    for dh, dw, bm in ((4, 2, "mmr"), (5, 3, "raw"), (4, 2, "raw")):
        flags, data, order = sd_huff(syms, dh, dw, bm)
        hs = [syms[i] for i in order]
        insts = layout(20)
        for fs, ds, dt in ((6, 8, 11), (7, 9, 12), (6, 10, 13)):
            if (dh, dw, bm) != (4, 2, "mmr") and (fs, ds, dt) != (6, 8, 11): continue
            tr, reg = text_seg_huff(260, 260, insts, hs, fs, ds, dt)
            keep(f"huffman-sd-b{dh}-b{dw}-{bm}-text-b{fs}-b{ds}-b{dt}",
                 P(260, 260) + seg(1, 6, tr, refs=(0,)) + EOP,
                 seg(0, 0, struct.pack(">H", flags) + struct.pack(">II", len(syms), len(syms)) + data, page=0), reg,
                 ["symbol dictionary, Huffman", f"collective bitmap {bm}", "text region, Huffman", f"tables B.{dh} B.{dw} B.{fs} B.{ds} B.{dt}"])
    flags, data, order = sd_huff(syms, 4, 2, "mmr")
    hs = [syms[i] for i in order]
    for strips, corner, tp in ((4, 0, False), (2, 3, True)):
        insts = layout(18, strips, corner, tp)
        tr, reg = text_seg_huff(260, 260, insts, hs, strips=strips, corner=corner, transposed=tp)
        keep(f"huffman-text-strips{strips}-corner{corner}{'-transposed' if tp else ''}",
             P(260, 260) + seg(1, 6, tr, refs=(0,)) + EOP,
             seg(0, 0, struct.pack(">H", flags) + struct.pack(">II", len(syms), len(syms)) + data, page=0), reg,
             ["text region, Huffman", f"SBSTRIPS {strips}", f"REFCORNER {corner}"])
    # custom tables (7.4.13) for DH and DW in the dictionary and FS, DS, DT in the text
    tdh, ldh = table_seg((0, 3, 3, 0, 64, [(1, 3), (2, 4), (3, 5), (4, 5)], 5, 5, 0))
    tdw, ldw = table_seg((1, 3, 3, -8, 64, [(2, 3), (1, 4), (3, 5), (4, 5)], 5, 6, 6))
    tfs, lfs = table_seg((0, 4, 4, -64, 512, [(1, 6), (2, 7), (3, 9)], 4, 4, 0))
    tds, lds = table_seg((1, 3, 4, -8, 256, [(2, 3), (2, 8)], 3, 3, 2))
    tdt, ldt = table_seg((0, 3, 3, -16, 64, [(1, 4), (2, 5), (3, 6)], 4, 4, 0))
    flags, data, order = sd_huff(syms, ldh, ldw, "mmr")
    hs = [syms[i] for i in order]
    insts = layout(20)
    tr, reg = text_seg_huff(260, 260, insts, hs, lfs, lds, ldt)
    GT = (seg(0, 53, tdh, page=0) + seg(1, 53, tdw, page=0)
          + seg(2, 0, struct.pack(">H", flags) + struct.pack(">II", len(syms), len(syms)) + data, refs=(0, 1), page=0))
    keep("huffman-custom-tables", seg(3, 48, page_info(260, 260)) + seg(4, 53, tfs) + seg(5, 53, tds) + seg(6, 53, tdt)
         + seg(7, 6, tr, refs=(2, 4, 5, 6)) + seg(8, 49, b""), GT, reg, ["custom Huffman table"])

    # 7. pattern dictionary and halftone region
    pats = [blank(4, 4) for _ in range(8)]
    for gval in range(8):
        for k in range(gval * 2):
            pats[gval][k % 4][(k * 3) % 4] = 1
    gw, gh = 36, 22
    grey = [[(x * 3 + y * 5 + (x * y) % 3) % 8 for x in range(gw)] for y in range(gh)]
    for hmmr in (False, True):
        for ht in ((0, 1, 2, 3) if not hmmr else (0,)):
            for skip in ((False, True) if not hmmr else (False,)):
                coll = [sum((pats[g][r] for g in range(8)), []) for r in range(4)]
                if hmmr:
                    pd = bytes([1]) + bytes([4, 4]) + struct.pack(">I", 7) + g4(coll)
                else:
                    at = [(-4, 0), (-3, -1), (2, -2), (-2, -2)] if ht == 0 else [(-4, 0)]
                    mq = MQ(); generic_encode(mq, {}, coll, ht, at)
                    pd = bytes([ht << 1]) + bytes([4, 4]) + struct.pack(">I", 7) + mq.flush()
                hx, hy = (-2 * 256, 1 * 256) if skip else (0, 0)
                W, H = 130, 84
                reg = blank(W, H)
                place_ = lambda m, n: ((hx + m * 0 + n * 4 * 256) >> 8, (hy + m * 4 * 256 - n * 0) >> 8)
                sk = [[0] * gw for _ in range(gh)]
                for m in range(gh):
                    for n in range(gw):
                        X, Y = place_(m, n)
                        if skip and (X + 4 <= 0 or X >= W or Y + 4 <= 0 or Y >= H): sk[m][n] = 1
                        compose(reg, pats[grey[m][n]], X, Y, 0)
                planes = [[[(grey[m][n] >> j) & 1 for n in range(gw)] for m in range(gh)] for j in range(3)]
                # coded planes are the Gray code's bits; a skipped cell is coded as nothing and decodes 0
                gray = [[[0 if sk[m][n] else (grey[m][n] ^ (grey[m][n] >> 1)) >> j & 1 for n in range(gw)] for m in range(gh)] for j in range(3)]
                body = b""
                if hmmr:
                    for j in (2, 1, 0): body += g4(gray[j])
                else:
                    mq = MQ(); ctx = {}
                    at = [(3 if ht <= 1 else 2, -1), (-3, -1), (2, -2), (-2, -2)]
                    for j in (2, 1, 0):
                        generic_encode(mq, ctx, gray[j], ht, at if ht == 0 else at[:1], skip=sk if skip else None)
                    body = mq.flush()
                hflags = int(hmmr) | (ht << 1) | (int(skip) << 3)
                hr = (region_info(W, H, 0, 0, 0) + bytes([hflags]) + struct.pack(">IIiiHH", gw, gh, hx, hy, 4 * 256, 0) + body)
                keep(f"halftone-{'mmr' if hmmr else f't{ht}'}{'-skip' if skip else ''}",
                     P(W, H) + seg(1, 16, pd) + seg(2, 22, hr, refs=(1,)) + EOP, None, reg,
                     ["pattern dictionary", "halftone region", "MMR" if hmmr else f"template {ht}"] + (["HENABLESKIP"] if skip else []))

    # 8. what is refused, and what is cut short
    ref = lambda name, stream, globals_=None, why="": keep(name, stream, globals_, expect=name.split(":")[0], note=why)
    base_g = generic_seg(text, 0)
    ref("UNSUPPORTED:colour extension", P(w, h) + seg(1, 38, base_g[:16] + bytes([base_g[16] | 8]) + base_g[17:]) + EOP)
    ref("UNSUPPORTED:12 adaptive-template pixels", P(w, h) + seg(1, 38, base_g[:17] + bytes([base_g[17] | 0x10]) + base_g[18:]) + EOP)
    ref("UNSUPPORTED:reused bitmap coding contexts", P(260, 260) + EOP, seg(0, 0, struct.pack(">H", 1 << 8) + SDSEG[11 + 2:], page=0))
    ref("UNSUPPORTED:Huffman-coded refinement", P(260, 260) + seg(1, 6, struct.pack(">IIIIB", 10, 10, 0, 0, 0) + struct.pack(">HH", 3, 0) + struct.pack(">I", 0), refs=(0,)) + EOP, SDSEG)
    ref("UNSUPPORTED:a necessary extension segment", P(w, h) + seg(1, 62, struct.pack(">I", 0x80000010)) + seg(2, 38, base_g) + EOP)
    ref("UNSUPPORTED:segment type", P(w, h) + seg(1, 21, b"\0" * 8) + EOP)
    ref("UNSUPPORTED:several pages", P(w, h) + seg(1, 38, base_g) + EOP + seg(3, 48, page_info(w, h), page=2) + seg(4, 38, base_g, page=2))
    ref("UNSUPPORTED:no page", seg(1, 38, base_g))
    tr_full = pages[1][2]
    ref("TRUNCATED:the text region's data cut in half", tr_full[:len(tr_full) // 2], pages[1][3])
    ref("TRUNCATED:a generic region's arithmetic data cut", P(w, h) + seg(1, 38, base_g[:len(base_g) // 2]) + EOP)
    mm = generic_seg(text, mmr=True)
    ref("TRUNCATED:an MMR region cut", P(w, h) + seg(1, 38, mm[:len(mm) // 2]) + EOP)
    ref("TRUNCATED:a segment header cut", P(w, h)[:9])
    ref("CORRUPT:an adaptive pixel not yet decoded", P(w, h) + seg(1, 38, base_g[:18] + at_bytes([(1, 0), (-3, -1), (2, -2), (-2, -2)]) + base_g[26:]) + EOP)
    ref("CORRUPT:a symbol id past the dictionary", P(260, 260) + seg(1, 6, text_seg_arith(260, 260, [(len(dsyms) + 3, 2, 2)], dsyms + [[[1]]] * 4)[0], refs=(0,)) + EOP, SDSEG)

    # 9. the ordinance's own seven pages
    for k, (x, g, s, gl) in enumerate(pages):
        keep(f"ordinance-page-{k + 1}", s, gl, None, ["a production scanner's symbol dictionary and text region"])

    out = {"provenance": f"jbig2dec {subprocess.run(['jbig2dec', '--version'], capture_output=True, text=True).stdout.strip()}, "
                         f"jbig2enc {subprocess.run(['jbig2', '-V'], capture_output=True, text=True).stderr.strip()}, "
                         f"Pillow {Image.__version__} (libtiff G4); digests are jbig2dec's decode unless marked",
           "variants": variants}
    json.dump(out, open(os.path.join(HERE, "jbig2-variants.json"), "w"), indent=0)

    # the one-page document: page 2's exact streams, MediaBox and content
    pg = doc[1]
    x, g, s, gl = pages[1]
    content = doc.xref_stream(pg.get_contents()[0])
    mb = pg.mediabox
    name = re.search(r"/XObject\s*<<\s*/(\S+)\s", doc.xref_object(pg.xref)).group(1)
    pdf = bytearray(b"%PDF-1.6\n%\xe2\xe3\xcf\xd3\n"); offs = []
    def put(body, stream=None):
        offs.append(len(pdf)); pdf.extend(b"%d 0 obj\n" % len(offs))
        pdf.extend(body if stream is None else body + b"\nstream\n" + stream + b"\nendstream")
        pdf.extend(b"\nendobj\n")
    put(b"<< /Type /Catalog /Pages 2 0 R >>")
    put(b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    put(("<< /Type /Page /Parent 2 0 R /MediaBox [0 7057 614 7864] /Resources << /XObject << /%s 5 0 R >> >> "
         "/Contents 4 0 R >>" % name).encode())
    put(b"<< /Length %d >>" % len(content), content)
    put(b"<< /Type /XObject /Subtype /Image /Width 2560 /Height 3360 /ColorSpace /DeviceGray /BitsPerComponent 1 "
        b"/Filter /JBIG2Decode /DecodeParms << /JBIG2Globals 6 0 R >> /Length %d >>" % len(s), s)
    put(b"<< /Length %d >>" % len(gl), gl)
    xr = len(pdf)
    pdf.extend(b"xref\n0 %d\n0000000000 65535 f \n" % (len(offs) + 1))
    for o in offs: pdf.extend(b"%010d 00000 n \n" % o)
    pdf.extend(b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(offs) + 1, xr))
    open(os.path.join(HERE, "jbig2-scan-page.pdf"), "wb").write(pdf)
    print(json.dumps({"variants": len(variants), "ok": sum(v["expect"] == "ok" for v in variants),
                      "scan_page": {"stream_bytes": len(s), "globals_bytes": len(gl), "mediabox": list(mb),
                                    "pdf_sha256": hashlib.sha256(pdf).hexdigest()}}, indent=1))

def components(b, x0, y0, w, h):
    """Connected components (8-neighbour) of a window, as tight bitmaps, largest first, deduplicated."""
    win = crop(b, x0, y0, w, h)
    seen = [[0] * w for _ in range(h)]
    out = []
    for y in range(h):
        for x in range(w):
            if win[y][x] and not seen[y][x]:
                st, pts = [(x, y)], []
                seen[y][x] = 1
                while st:
                    a, c = st.pop(); pts.append((a, c))
                    for da in (-1, 0, 1):
                        for dc in (-1, 0, 1):
                            A, C = a + da, c + dc
                            if 0 <= A < w and 0 <= C < h and win[C][A] and not seen[C][A]:
                                seen[C][A] = 1; st.append((A, C))
                xs, ys = [p[0] for p in pts], [p[1] for p in pts]
                bx, by = min(xs), min(ys)
                g = blank(max(xs) - bx + 1, max(ys) - by + 1)
                for a, c in pts: g[c - by][a - bx] = 1
                if 3 <= len(g) <= 40 and 2 <= len(g[0]) <= 40 and g not in out: out.append(g)
    out.sort(key=lambda g: -len(g) * len(g[0]))
    return out

if __name__ == "__main__":
    main(sys.argv[1])
