"""image-cover's `stripMetadata` fixtures and the reference's hashes (R8, R9).

NOT the subject's output. Each `pixels_sha256` in `strip-cases.json` is PILLOW's decode (libjpeg-turbo for JPEG,
zlib and Pillow's PNG reader, Pillow's GIF reader, libwebp, OpenJPEG) of the ORIGINAL image, as displayed
(`ImageOps.exif_transpose`), in the mode `canon` below (a fully transparent pixel hashed as (0, 0, 0, 0)); `coded` names the coded data the answer must carry byte for
byte (ranges of the original, in order), located here by walking the original, not read from the module. The test decodes each answer and must reach
the same hash. Re-run this, never copy a failing run's "got":

    pip install pillow==12.3.0 numpy
    python3 bio-plane/test/m/image-cover/fixtures/make-strip-fixtures.py

After writing, it also runs the module over every case (node) and checks each answer with Pillow: its decode
equals the original's, and Pillow finds no EXIF beyond the orientation, no ICC profile, no XMP, no comment, no
second frame. That check is the reference's, made once here; the module's answers are not recorded.

The images are synthetic (a gradient scene with noise and a drawn face, no person), each carrying the metadata
its format can hold: EXIF with GPS and a thumbnail, XMP, an ICC profile, comments, text chunks, application
extensions, a second image or trailing bytes; the JPEG 2000 files carry COM markers in the main header and in
tile-part headers (with a TLM marker naming the tile-part lengths), an `xml ` and an EXIF `uuid` box, a `res `
box and an ICC `colr`.
"""
import base64, hashlib, io, json, os, struct, subprocess, sys, zlib
import numpy as np
from PIL import Image, ImageDraw, ImageOps, ImageCms, features

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", ".."))

def scene(w, h, seed, face):
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[0:h, 0:w]
    a = np.stack([90 + 120 * x / w, 140 + 60 * y / h, 200 - 100 * (x + y) / (w + h)], axis=2)
    a += rng.normal(0, 14, a.shape)
    im = Image.fromarray(np.clip(a, 0, 255).astype("uint8"))
    d = ImageDraw.Draw(im)
    d.ellipse(face, fill=(224, 182, 150))
    d.rectangle((w - 40, h - 16, w - 4, h - 4), fill=(250, 250, 240))
    return im

def icc():
    b = bytearray(ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes())
    b[24:36] = struct.pack(">6H", 2026, 10, 8, 0, 0, 0)
    return bytes(b)

# ── EXIF by hand: IFD0 (make, model, orientation, software), an EXIF sub-IFD, GPS, IFD1 with a JPEG thumbnail ──
def tiff(orientation, thumb):
    def ent(tag, typ, cnt, v): return (tag, typ, cnt, v)
    asc = lambda t, s: ent(t, 2, len(s) + 1, s.encode() + b"\0")
    ifd0 = [asc(0x010F, "TestCam"), asc(0x0110, "Phone One"), ent(0x0112, 3, 1, struct.pack(">H", orientation)), asc(0x0131, "PhoneOS 1.0")]
    sub = [asc(0x9003, "2026:10:08 07:00:00")]
    gps = [ent(0x0001, 2, 2, b"N\0"), ent(0x0002, 5, 3, struct.pack(">6I", 37, 1, 48, 1, 3000, 100))]
    ifd1 = [ent(0x0103, 3, 1, struct.pack(">H", 6))]
    size = lambda e: 2 + 12 * len(e) + 4 + sum(len(v) for *_, v in e if len(v) > 4)
    o0 = 8; osub = o0 + size(ifd0) + 24; ogps = osub + size(sub); o1 = ogps + size(gps); othumb = o1 + size(ifd1) + 24
    ifd0 = ifd0 + [ent(0x8769, 4, 1, struct.pack(">I", osub)), ent(0x8825, 4, 1, struct.pack(">I", ogps))]
    ifd1 = ifd1 + [ent(0x0201, 4, 1, struct.pack(">I", othumb)), ent(0x0202, 4, 1, struct.pack(">I", len(thumb)))]
    def write(e, at, nxt):
        e = sorted(e); data_at = at + 2 + 12 * len(e) + 4
        body, extra = bytearray(struct.pack(">H", len(e))), bytearray()
        for tag, typ, cnt, v in e:
            if len(v) <= 4: body += struct.pack(">HHI", tag, typ, cnt) + v.ljust(4, b"\0")
            else: body += struct.pack(">HHII", tag, typ, cnt, data_at + len(extra)); extra += v
        return bytes(body + struct.pack(">I", nxt) + extra)
    return b"MM\0\x2a\0\0\0\x08" + write(ifd0, o0, o1) + write(sub, osub, 0) + write(gps, ogps, 0) + write(ifd1, o1, 0) + thumb

XMP = b'<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF><rdf:Description PersonInImage="A. Passerby" GPSLatitude="37,48.5N"/></rdf:RDF></x:xmpmeta>'
SECRETS = ["TestCam", "Phone One", "PhoneOS", "2026:10:08", "PersonInImage", "Passerby", "member 7", "face-region", "ICC_PROFILE", "trailing"]

def seg(m, body): return bytes([0xFF, m]) + struct.pack(">H", len(body) + 2) + body
def jpeg_bytes(im, **kw):
    b = io.BytesIO(); im.save(b, "JPEG", **kw); return b.getvalue()

def jpeg_segments(d):
    """(marker, start, end) of every segment up to EOI, scans' data included in the SOS's range."""
    out, p = [], 2
    while True:
        while d[p + 1] == 0xFF: p += 1
        m = d[p + 1]
        if m == 0xD9: out.append((m, p, p + 2)); return out
        if m == 0x01 or 0xD0 <= m <= 0xD7: out.append((m, p, p + 2)); p += 2; continue
        end = p + 2 + struct.unpack(">H", d[p + 2:p + 4])[0]
        if m == 0xDA:
            q = end
            while not (d[q] == 0xFF and d[q + 1] not in (0, 0xFF) and not 0xD0 <= d[q + 1] <= 0xD7): q += 1
            end = q
        out.append((m, p, end)); p = end

def phone_jpeg(im, orientation, between_scans=False, **kw):
    """Pillow's JPEG with its APP0 replaced by a phone's metadata, a COM and APP between scans if asked, an MPF
    second image and a trailer after EOI."""
    base = jpeg_bytes(im, **kw)
    segs = jpeg_segments(base)
    thumb = jpeg_bytes(im.resize((40, 30)), quality=70)
    head = b"\xff\xd8" + seg(0xE1, b"Exif\0\0" + tiff(orientation, thumb)) + seg(0xE1, b"http://ns.adobe.com/xap/1.0/\0" + XMP) \
        + seg(0xE2, b"ICC_PROFILE\0\x01\x01" + icc()) + seg(0xED, b"Photoshop 3.0\0" + b"8BIM\x04\x04\0\0\0\0\0\x10\x1c\x02\x50\0\x0cmember 7 IPTC") \
        + seg(0xFE, b"taken by member 7 near the face")
    body = b""
    scans = 0
    for m, s, e in segs:
        if 0xE0 <= m <= 0xEF: continue
        if m == 0xDA:
            scans += 1
            if between_scans and scans == 2: body += seg(0xFE, b"member 7 between scans") + seg(0xE5, b"face-region:1,2,3,4")
        body += base[s:e]
    second = jpeg_bytes(im.convert("L").resize((im.width // 2, im.height // 2)), quality=80)
    return head + body + second + b"SEFH\0\0\0\x01face-region:120,40;SEFT trailing"

# ── PNG by hand: an Adam7 writer, so the reference's reader (not this writer) decides the pixels ──
def chunk(t, body): return struct.pack(">I", len(body)) + t + body + struct.pack(">I", zlib.crc32(t + body))
ADAM7 = [(0, 0, 8, 8), (4, 0, 8, 8), (0, 4, 4, 8), (2, 0, 4, 4), (0, 2, 2, 4), (1, 0, 2, 2), (0, 1, 1, 2)]
def png_raw(a, ct, depth=8, interlace=False):
    h, w = a.shape[:2]
    bpp_bytes = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ct] * depth // 8
    def rows(sub):
        out = b""
        for r in sub:
            row = r.astype(">u2").tobytes() if depth == 16 else r.astype("uint8").tobytes()
            out += b"\x01" + bytes((row[i] - (row[i - bpp_bytes] if i >= bpp_bytes else 0)) & 255 for i in range(len(row)))
        return out
    if not interlace: data = rows(a)
    else:
        data = b""
        for x0, y0, dx, dy in ADAM7:
            sub = a[y0::dy, x0::dx]
            if sub.size: data += rows(sub)
    return struct.pack(">IIBBBBB", w, h, depth, ct, 0, 0, 1 if interlace else 0), zlib.compress(data, 9)

def exif_tiff_le(orientation):
    ex = Image.Exif(); ex[0x0112] = orientation; ex[0x010F] = "TestCam"; ex[0x0131] = "PhoneOS 1.0"
    t = ex.tobytes()
    return t[6:] if t.startswith(b"Exif\0\0") else t

def rich_png(a, ct, depth=8, interlace=False, orientation=6, plte=None, trns=None):
    ihdr, z = png_raw(a, ct, depth, interlace)
    out = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
    out += chunk(b"iCCP", b"sRGB\0\0" + zlib.compress(icc())) + chunk(b"gAMA", struct.pack(">I", 45455)) + chunk(b"pHYs", struct.pack(">IIB", 2835, 2835, 1))
    out += chunk(b"eXIf", exif_tiff_le(orientation)) + chunk(b"tEXt", b"Author\0member 7")
    out += chunk(b"iTXt", b"XML:com.adobe.xmp\0\0\0\0\0" + XMP) + chunk(b"tIME", struct.pack(">HBBBBB", 2026, 10, 8, 7, 0, 0))
    if plte is not None: out += chunk(b"PLTE", plte)
    if trns is not None: out += chunk(b"tRNS", trns)
    out += chunk(b"bKGD", b"\0\0" if ct in (0, 4) else (b"\0" if ct == 3 else b"\0\0\0\0\0\0"))
    for i in range(0, len(z), 500): out += chunk(b"IDAT", z[i:i + 500])
    out += chunk(b"zTXt", b"Comment\0\0" + zlib.compress(b"the face of member 7")) + chunk(b"IEND", b"")
    return out + b"trailing: face crop follows"

# ── GIF: Pillow's single frame, with a comment, application extensions (NETSCAPE, XMP), a plain-text
#    extension and trailing bytes spliced in ──
def gif_blocks(d):
    """(kind, start, end) of every block after the header, screen descriptor and global table."""
    gct = 3 << ((d[10] & 7) + 1) if d[10] & 0x80 else 0
    p, out = 13 + gct, []
    def sub(q):
        while d[q]: q += 1 + d[q]
        return q + 1
    while d[p] != 0x3B:
        if d[p] == 0x21: e = sub(p + 2); out.append(("ext%02x" % d[p + 1], p, e)); p = e
        else:
            lct = 3 << ((d[p + 9] & 7) + 1) if d[p + 9] & 0x80 else 0
            e = sub(p + 10 + lct + 1); out.append(("image", p, e)); p = e
    return 13 + gct, out, p

def subblocks(b): return b"".join(bytes([len(b[i:i + 255])]) + b[i:i + 255] for i in range(0, len(b), 255)) + b"\0"

def rich_gif(im, transparency=None):
    b = io.BytesIO()
    kw = {"transparency": transparency} if transparency is not None else {}
    im.save(b, "GIF", **kw)
    d = b.getvalue()
    start, blocks, trailer = gif_blocks(d)
    out = d[:start]
    out += b"\x21\xFE" + subblocks(b"taken by member 7")
    out += b"\x21\xFF\x0bNETSCAPE2.0\x03\x01\x00\x00\x00"
    out += b"\x21\xFF\x0bXMP DataXMP" + subblocks(XMP)
    for kind, s, e in blocks: out += d[s:e]
    out += b"\x21\x01\x0c\0\0\0\0\x10\0\x10\0\x08\x08\x01\0" + subblocks(b"face-region") + b"\x21\xFE" + subblocks(b"after the image: member 7")
    return out + b"\x3B" + b"trailing bytes"

# ── JPEG 2000: OpenJPEG's codestream (through Pillow), tiled, with COM markers put into the main header and every
#    tile-part header (each tile-part's Psot grown to match), a TLM naming the tile-part lengths, and a JP2 wrapper
#    holding xml, an EXIF uuid, res and an ICC colr ──
def j2k_parts(cs):
    """The main header's end and each tile-part's (start, psot)."""
    p = 2
    while cs[p + 1] != 0x90: p += 2 + struct.unpack(">H", cs[p + 2:p + 4])[0]
    main_end, parts = p, []
    while cs[p + 1] == 0x90:
        psot = struct.unpack(">I", cs[p + 6:p + 10])[0]; parts.append((p, psot)); p += psot
    assert cs[p:p + 2] == b"\xff\xd9"
    return main_end, parts, p

def com(text): return b"\xff\x64" + struct.pack(">HH", len(text) + 4, 1) + text

def j2k_with_comments(cs):
    main_end, parts, eoc = j2k_parts(cs)
    new_parts = []
    for i, (s, psot) in enumerate(parts):
        c = com(b"tile %d by member 7" % i)
        sot = bytearray(cs[s:s + 12]); sot[6:10] = struct.pack(">I", psot + len(c))
        new_parts.append(bytes(sot) + c + cs[s + 12:s + psot])
    tlm = b"\xff\x55" + struct.pack(">HBB", 4 + 6 * len(parts), 0, 0x60) + b"".join(struct.pack(">HI", i, len(t)) for i, t in enumerate(new_parts))
    # Stlm 0x60: Ttlm 2 bytes (ST=2), Ptlm 4 bytes (SP=1)
    return cs[:main_end] + com(b"OpenJPEG via member 7's laptop") + tlm + b"".join(new_parts) + cs[eoc:]

def box(t, body): return struct.pack(">I", len(body) + 8) + t + body
def jp2_boxes(d, p=0, end=None):
    end = len(d) if end is None else end; out = []
    while p < end:
        ln, t = struct.unpack(">I4s", d[p:p + 8]); ln = ln or end - p
        out.append((t, d[p + 8:p + ln])); p += ln
    return out

def rich_jp2(cs, nc, icc_colr):
    sig = b"\0\0\0\x0cjP  \r\n\x87\n"
    ftyp = box(b"ftyp", b"jp2 \0\0\0\0jp2 ")
    xsiz, ysiz = struct.unpack(">II", cs[8:16])
    ihdr = box(b"ihdr", struct.pack(">IIHBBBB", ysiz, xsiz, nc, 7, 7, 0, 0))
    colr = box(b"colr", b"\x02\0\0" + icc()) if icc_colr else box(b"colr", b"\x01\0\0" + struct.pack(">I", 16 if nc >= 3 else 17))
    res = box(b"res ", box(b"resc", struct.pack(">HHHHBB", 1, 1, 1, 1, 0, 0)))
    jp2h = box(b"jp2h", ihdr + colr + res)
    xml = box(b"xml ", XMP)
    uuid = box(b"uuid", bytes.fromhex("4a706754696666457869662d3e4a5032") + b"Exif\0\0" + tiff(6, b""))
    return sig + ftyp + xml + jp2h + uuid + box(b"jp2c", cs) + box(b"xml ", b"<after>member 7</after>")

def j2k_codestream(im, **kw):
    b = io.BytesIO(); im.save(b, "JPEG2000", no_jp2=True, irreversible=False, **kw); return b.getvalue()

# ── WebP: Pillow's (libwebp) with EXIF, XMP and ICC (extended format), and trailing bytes ──
def webp_bytes(im, **kw):
    b = io.BytesIO(); im.save(b, "WEBP", **kw); return b.getvalue()
def riff_chunks(d):
    p, out = 12, []
    while p < 8 + struct.unpack("<I", d[4:8])[0]:
        t, n = d[p:p + 4], struct.unpack("<I", d[p + 4:p + 8])[0]
        out.append((t, p, p + 8 + n + (n & 1))); p += 8 + n + (n & 1)
    return out

# ── the reference ─────────────────────────────────────────────────────────────
def canon(data):
    """Pillow's decode, as displayed, in one mode per kind: palette images through RGBA; the bytes hashed with the
    mode and size."""
    im = Image.open(io.BytesIO(data)); im.load()
    assert getattr(im, "n_frames", 1) == 1
    im = ImageOps.exif_transpose(im)
    if im.mode in ("P", "PA", "LA", "RGB", "RGBA", "L", "1") and im.mode != "L": im = im.convert("RGBA")
    if im.mode in ("I;16", "I;16B", "I"): im = im.convert("I")
    raw = im.tobytes()
    if im.mode == "RGBA":                     # a fully transparent pixel's colour is not seen: hashed as (0, 0, 0, 0)
        a = np.frombuffer(raw, "uint8").reshape(-1, 4).copy(); a[a[:, 3] == 0] = 0; raw = a.tobytes()
    return im.mode, im.size, hashlib.sha256(im.mode.encode() + struct.pack(">II", *im.size) + raw).hexdigest()

cases, refusals, files = [], [], {}
def add(name, data, fmt, coded, orientation=1, **more):
    """`coded`: the byte ranges [start, end) of the original that the answer must carry unchanged, in order."""
    files[name] = data
    for secret in more.get("secrets", []): assert secret.encode() in data, (name, secret)
    mode, size, h = canon(data)
    cases.append({"file": name, "format": fmt, "mode": mode, "width": size[0], "height": size[1], "pixels_sha256": h,
                  "orientation": orientation, "coded": [[s, e] for s, e in coded], **more})

def refuse(name, data, code):
    files[name] = data
    refusals.append({"file": name, "code": code})

# JPEG: baseline 4:2:0 held sideways; progressive with a COM and APP between scans; CMYK with Adobe's transform 0;
# a JFIF APP0 holding a thumbnail and a JFXX extension; grey optimised. The coded data: every segment from the
# first table to EOI but the APPn and COM ones.
def jpeg_coded(d):
    return [(s, e) for m, s, e in jpeg_segments(d) if not (0xE0 <= m <= 0xEF or m == 0xFE)]
im = scene(203, 157, 41, (120, 30, 175, 95))
d = phone_jpeg(im, 6, quality=88, subsampling=2, restart_marker_rows=2)
add("strip-baseline-o6.jpg", d, "jpeg", jpeg_coded(d), 6, secrets=SECRETS)
d = phone_jpeg(scene(150, 101, 42, (20, 20, 70, 80)), 3, between_scans=True, quality=85, progressive=True)
assert sum(1 for m, *_ in jpeg_segments(d) if m == 0xDA) > 2
add("strip-progressive-o3.jpg", d, "jpeg", jpeg_coded(d), 3, secrets=SECRETS + ["between scans"])
cmyk = jpeg_bytes(scene(64, 48, 43, (10, 10, 40, 40)).convert("CMYK"), quality=90)
d = cmyk[:2] + seg(0xFE, b"member 7") + cmyk[2:] + b"trailing"
assert any(m == 0xEE for m, *_ in jpeg_segments(d))
add("strip-cmyk-adobe.jpg", d, "jpeg", jpeg_coded(d), 1, secrets=["member 7", "trailing"], keeps_adobe=True)
g = jpeg_bytes(scene(97, 131, 44, (30, 40, 70, 90)).convert("L"), quality=80, optimize=True)
thumb_rgb = bytes(np.asarray(scene(8, 6, 45, (1, 1, 5, 5))).tobytes())
jfif_thumb = seg(0xE0, b"JFIF\0\x01\x02\x01\x00\x48\x00\x48\x08\x06" + thumb_rgb) + seg(0xE0, b"JFXX\0\x10" + jpeg_bytes(scene(16, 12, 46, (2, 2, 8, 8)), quality=50))
segs = jpeg_segments(g)
d = g[:2] + jfif_thumb + b"".join(g[s:e] for m, s, e in segs if m != 0xE0)
add("strip-grey-jfif-thumb.jpg", d, "jpeg", jpeg_coded(d), 1, secrets=[], keeps_jfif=True, no_thumbnail=True)

# PNG: interlaced RGBA held upside down; interlaced 16-bit grey; indexed with transparency; one already clean.
def idat_ranges(d):
    out, p = [], 8
    while p < len(d):
        n = struct.unpack(">I", d[p:p + 4])[0]; t = d[p + 4:p + 8]
        if t in (b"IHDR", b"PLTE", b"tRNS", b"IDAT"): out.append((p, p + 12 + n))
        if t == b"IEND": break
        p += 12 + n
    return out
a = np.asarray(scene(61, 43, 47, (10, 5, 40, 35)).convert("RGBA")).copy(); a[..., 3] = np.linspace(40, 255, 61).astype("uint8")
d = rich_png(a, 6, interlace=True, orientation=3)
add("strip-interlaced-rgba-o3.png", d, "png", idat_ranges(d), 3, secrets=["TestCam", "PhoneOS", "PersonInImage", "member 7", "trailing"])
a16 = (np.asarray(scene(33, 29, 48, (5, 5, 20, 20)).convert("L")).astype("uint16") * 257 + np.arange(33, dtype="uint16"))
d = rich_png(a16, 0, depth=16, interlace=True, orientation=1)
add("strip-interlaced-grey16.png", d, "png", idat_ranges(d), 1, secrets=["TestCam", "PhoneOS", "member 7", "trailing"])
q = scene(40, 30, 49, (5, 5, 25, 25)).convert("RGB").quantize(64)
pal = bytes(q.getpalette()[: 3 * 64]); idx = np.asarray(q)
d = rich_png(idx, 3, orientation=8, plte=pal, trns=bytes(range(0, 256, 16)))
add("strip-palette-o8.png", d, "png", idat_ranges(d), 8, secrets=["TestCam", "member 7", "trailing"])
ihdr, z = png_raw(np.asarray(scene(20, 10, 50, (2, 2, 8, 8))), 2)
d = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", z) + chunk(b"IEND", b"")
add("strip-clean.png", d, "png", idat_ranges(d), 1, secrets=[], unchanged=True)

# GIF: one frame, a local palette and transparency, with comments, NETSCAPE and XMP application extensions, a
# plain-text extension and trailing bytes.
gq = scene(48, 36, 51, (8, 8, 30, 30)).convert("RGB").quantize(32)
d = rich_gif(gq, transparency=3)
start, blocks, trailer = gif_blocks(d)
add("strip-one-frame.gif", d, "gif", [(0, start)] + [(s, e) for k, s, e in blocks if k in ("image", "extf9")], 1,
    secrets=["member 7", "NETSCAPE", "XMP Data", "PersonInImage", "face-region", "trailing"])

# WebP: lossy with alpha (VP8X, ALPH, VP8) and lossless (VP8L), each with EXIF (orientation 6), XMP and ICC.
rgba = scene(50, 40, 52, (10, 10, 30, 30)).convert("RGBA"); rgba.putalpha(Image.linear_gradient("L").resize((50, 40)))
for name, kw in (("strip-lossy-alpha-o6.webp", dict(quality=80)), ("strip-lossless-o6.webp", dict(lossless=True))):
    w = webp_bytes(rgba, exif=exif_tiff_le(6), xmp=XMP, icc_profile=icc(), **kw) + b"trailing"
    kinds = [t for t, *_ in riff_chunks(w)]
    assert b"VP8X" in kinds and b"EXIF" in kinds and b"XMP " in kinds and b"ICCP" in kinds, kinds
    add(name, w, "webp", [(s + 8, e) for t, s, e in riff_chunks(w) if t in (b"VP8 ", b"VP8L", b"ALPH")], 6,
        secrets=["TestCam", "PhoneOS", "PersonInImage", "trailing"])

# JPEG 2000: a tiled RGB JP2 with an ICC colr, and a grey J2K codestream, each with COM in every header and a TLM.
cs = j2k_with_comments(j2k_codestream(scene(64, 48, 53, (10, 10, 40, 40)), tile_size=(32, 32)))
main_end, parts, eoc = j2k_parts(cs)
packets = [(s + 12 + struct.unpack(">H", cs[s + 14:s + 16])[0] + 2, s + p) for s, p in parts]   # after SOT and the tile-part's COM
d = rich_jp2(cs, 3, icc_colr=True)
at = d.index(cs)
add("strip-tiled-icc.jp2", d, "jp2", [(at + s, at + e) for s, e in packets], 1,
    secrets=["member 7", "PersonInImage", "Exif", "OpenJPEG via", "TestCam"])
cs = j2k_with_comments(j2k_codestream(scene(40, 40, 54, (5, 5, 30, 30)).convert("L"), tile_size=(20, 20)))
main_end, parts, eoc = j2k_parts(cs)
d = cs + b"trailing"
add("strip-grey.j2k", d, "j2k", [(s + 12 + struct.unpack(">H", cs[s + 14:s + 16])[0] + 2, s + p) for s, p in parts], 1,
    secrets=["member 7", "OpenJPEG via", "trailing"])

# ── refusals ──────────────────────────────────────────────────────────────────
anim = io.BytesIO(); scene(20, 20, 55, (2, 2, 9, 9)).save(anim, "GIF", save_all=True, append_images=[scene(20, 20, 56, (9, 9, 18, 18))], duration=100)
refuse("strip-refuse-animated.gif", anim.getvalue(), "ANIMATED_IMAGE")
anim = io.BytesIO(); scene(20, 20, 57, (2, 2, 9, 9)).save(anim, "WEBP", save_all=True, append_images=[scene(20, 20, 58, (9, 9, 18, 18))], duration=100)
refuse("strip-refuse-animated.webp", anim.getvalue(), "ANIMATED_IMAGE")
anim = io.BytesIO(); scene(20, 20, 59, (2, 2, 9, 9)).save(anim, "PNG", save_all=True, append_images=[scene(20, 20, 60, (9, 9, 18, 18))], duration=100)
refuse("strip-refuse-animated.png", anim.getvalue(), "ANIMATED_IMAGE")
b = io.BytesIO(); scene(20, 20, 61, (2, 2, 9, 9)).save(b, "TIFF"); refuse("strip-refuse.tif", b.getvalue(), "NOT_A_STRIPPABLE_FORMAT")
b = io.BytesIO(); scene(20, 20, 62, (2, 2, 9, 9)).save(b, "BMP"); refuse("strip-refuse.bmp", b.getvalue(), "NOT_A_STRIPPABLE_FORMAT")
pj = files["strip-progressive-o3.jpg"]; refuse("strip-refuse-truncated.jpg", pj[: len(pj) // 2], "TRUNCATED_IMAGE_DATA")
lw = files["strip-lossless-o6.webp"]; refuse("strip-refuse-truncated.webp", lw[: len(lw) // 2], "TRUNCATED_IMAGE_DATA")
jp = files["strip-tiled-icc.jp2"]; refuse("strip-refuse-truncated.jp2", jp[: len(jp) - 400], "TRUNCATED_IMAGE_DATA")
gf = files["strip-one-frame.gif"]; refuse("strip-refuse-truncated.gif", gf[: len(gf) // 2], "TRUNCATED_IMAGE_DATA")
bad = bytearray(files["strip-interlaced-rgba-o3.png"]); i = bytes(bad).index(b"IDAT") + 30; bad[i] ^= 0xFF
refuse("strip-refuse-crc.png", bytes(bad), "IMAGE_DATA_CORRUPT")
bad = bytearray(files["strip-grey.j2k"]); _, parts, _ = j2k_parts(bytes(bad)); bad[parts[1][0] + 6:parts[1][0] + 10] = struct.pack(">I", 5)
refuse("strip-refuse-psot.j2k", bytes(bad), "IMAGE_DATA_CORRUPT")

for name, data in files.items():
    with open(os.path.join(HERE, name), "wb") as f: f.write(data)
ref = {"pillow": Image.__version__, "libjpeg_turbo": features.version("libjpeg_turbo"), "zlib": features.version("zlib"),
       "libwebp": features.version("webp"), "openjpeg": features.version("jpg_2000")}
with open(os.path.join(HERE, "strip-cases.json"), "w") as f:
    json.dump({"reference": ref, "cases": cases, "refusals": refusals}, f, indent=1); f.write("\n")
print(f"wrote {len(files)} files, {len(cases)} cases, {len(refusals)} refusals; reference {ref}")

# ── the reference's check of the module's answers (made here, once; nothing recorded) ──
runner = """
import { stripMetadata } from "%s";
import { readFileSync } from "node:fs";
const dir = process.argv.at(-1), { cases } = JSON.parse(readFileSync(dir + "/strip-cases.json", "utf8"));
const out = {};
for (const c of cases) { const r = stripMetadata(readFileSync(dir + "/" + c.file)); out[c.file] = r.ok ? { ...r, bytes: Buffer.from(r.bytes).toString("base64") } : r; }
process.stdout.write(JSON.stringify(out));
""" % os.path.join(REPO, "bio-plane", "src", "image-cover", "index.mjs")
answers = json.loads(subprocess.run(["node", "--input-type=module", "-e", runner, HERE], check=True, capture_output=True, text=True).stdout)
for c in cases:
    a = answers[c["file"]]
    assert a.get("ok"), (c["file"], a)
    data = base64.b64decode(a["bytes"])
    assert canon(data)[2] == c["pixels_sha256"], c["file"]
    im = Image.open(io.BytesIO(data)); im.load()
    assert getattr(im, "n_frames", 1) == 1
    assert "icc_profile" not in im.info and "xmp" not in im.info and "XML:com.adobe.xmp" not in im.info and "comment" not in im.info, (c["file"], im.info.keys())
    ex = im.getexif()
    assert set(ex.keys()) <= {0x0112} and ex.get(0x0112, 1) == c["orientation"], (c["file"], dict(ex))
    for s in c["secrets"]: assert s.encode() not in data, (c["file"], s)
print("the reference agrees with every answer")
