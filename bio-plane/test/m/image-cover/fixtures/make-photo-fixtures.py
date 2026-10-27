"""image-cover's photo fixtures and the reference's values (R12, R13, R14).

NOT the subject's output. Two kinds of reference are written to `photo-cases.json`:

  redraw   for every plain fixture of this folder: the width, height, component count and the SHA-256 of PILLOW's decode
           (libjpeg-turbo for JPEG; zlib and Pillow's PNG reader for PNG, alpha drawn over white) of the ORIGINAL, in the
           stored orientation. The redrawn picture must decode to the same pixels.
  facts    for each photo built here: the fields written into it, from the values this script chose and wrote (never read
           back from the module), checked here against Pillow's own reading of the EXIF where Pillow reads it.

exiftool is not installed in the build container; Pillow reads the EXIF (and the IFD tags it reads) and the values are
those the script wrote, so the reference is the writer's. Re-run this, never copy a failing run's "got":

    pip install pillow==12.3.0 numpy
    python3 bio-plane/test/m/image-cover/fixtures/make-photo-fixtures.py

The profiles are built here byte by byte: a Display P3 display profile (version 4.3, the three curves one shared tag, as
Apple writes it), and the ones R14's control names (CMYK, input class, a tag pointing past its end, one over the bound).
No fixture holds a place or a person: the photos are a synthetic gradient.
"""
import hashlib, io, json, os, struct, zlib
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
BU = chr(92) + "u"                                  # for the bidi test string, built without writing an escape here


# ── the scene ─────────────────────────────────────────────────────────────────
def scene(w, h, seed):
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[0:h, 0:w]
    a = np.stack([90 + 120 * x / w, 140 + 60 * y / h, 200 - 100 * (x + y) / (w + h)], axis=2)
    a += rng.normal(0, 10, a.shape)
    im = Image.fromarray(np.clip(a, 0, 255).astype("uint8"))
    ImageDraw.Draw(im).ellipse((w // 4, h // 4, w // 2, h // 2), fill=(224, 182, 150))
    return im


def jpeg_bytes(im, **kw):
    b = io.BytesIO(); im.save(b, "JPEG", **kw); return b.getvalue()


def png_bytes(im, **kw):
    b = io.BytesIO(); im.save(b, "PNG", **kw); return b.getvalue()


def seg(marker, body):
    return bytes([0xFF, marker]) + struct.pack(">H", len(body) + 2) + body


def split_jpeg(jpeg):
    """(soi, body): Pillow's JPEG without its APP0, as a phone writes none."""
    p = 2
    while jpeg[p] == 0xFF and jpeg[p + 1] == 0xE0:
        p += 2 + struct.unpack(">H", jpeg[p + 2:p + 4])[0]
    return jpeg[:2], jpeg[p:]


# ── ICC profiles, by hand ─────────────────────────────────────────────────────
def s15(x): return struct.pack(">i", round(x * 65536))
def xyz(x, y, z): return b"XYZ " + bytes(4) + s15(x) + s15(y) + s15(z)
def mluc(text):
    t = text.encode("utf-16-be")
    return b"mluc" + bytes(4) + struct.pack(">II", 1, 12) + b"enUS" + struct.pack(">II", len(t), 28) + t
def desc_v2(text):
    a = text.encode("ascii") + b"\x00"
    return b"desc" + bytes(4) + struct.pack(">I", len(a)) + a + bytes(4 + 4 + 2 + 1 + 67)
def para(g): return b"para" + bytes(4) + struct.pack(">HH", 0, 0) + s15(g)


def profile(*, version=(4, 3), klass=b"mntr", space=b"RGB ", name="Display P3", desc=None, shared=True, tags_past_end=False, pad=0, overlap=False):
    """A matrix/TRC RGB display profile. `shared`: rTRC, gTRC and bTRC name one range, as Apple's do."""
    curve = para(2.2)
    data = [("desc", desc if desc is not None else mluc(name)), ("cprt", mluc("no copyright")), ("wtpt", xyz(0.9642, 1.0, 0.8249)),
            ("rXYZ", xyz(0.5151, 0.2412, -0.0011)), ("gXYZ", xyz(0.2920, 0.6922, 0.0419)), ("bXYZ", xyz(0.1571, 0.0666, 0.7841))]
    n = len(data) + 3
    at = 128 + 4 + 12 * n
    table, body, off = b"", b"", at
    for sig, d in data:
        d = d + bytes((-len(d)) % 4)
        table += sig.encode() + struct.pack(">II", off, len(d)); body += d; off += len(d)
    shared_at = off
    for i, sig in enumerate(("rTRC", "gTRC", "bTRC")):
        if shared:
            table += sig.encode() + struct.pack(">II", shared_at, len(curve))
        else:
            table += sig.encode() + struct.pack(">II", shared_at + i * len(curve), len(curve))
    body += curve if shared else curve * 3
    if overlap:   # bTRC begins inside gTRC's range: two different ranges that overlap
        table = table[:-12] + b"bTRC" + struct.pack(">II", shared_at + 4, len(curve))
    if tags_past_end:
        table = table[:12 * 3 + 0] + table[12 * 3:]
        i = 12 * 4
        table = table[:i] + table[i:i + 4] + struct.pack(">II", off + 10000, 40) + table[i + 12:]
    body += bytes(pad)
    size = 128 + 4 + len(table) + len(body)
    hdr = bytearray(128)
    hdr[0:4] = struct.pack(">I", size)
    hdr[8:12] = bytes([version[0], version[1] << 4, 0, 0])
    hdr[12:16] = klass; hdr[16:20] = space; hdr[20:24] = b"XYZ "
    hdr[24:36] = struct.pack(">6H", 2026, 10, 8, 0, 0, 0)
    hdr[36:40] = b"acsp"
    hdr[68:80] = s15(0.9642) + s15(1.0) + s15(0.8249)
    return bytes(hdr) + struct.pack(">I", n) + table + body


# ── EXIF / TIFF, by hand ──────────────────────────────────────────────────────
def tiff(ifd0, sub=None, gps=None, ifd1=None, thumb=b""):
    """Big-endian TIFF. Each IFD is a list of (tag, type, count, value-bytes)."""
    out = bytearray(b"MM\x00\x2a\x00\x00\x00\x08")

    def size(entries):
        return 2 + 12 * len(entries) + 4 + sum(len(v) for _, _, _, v in entries if len(v) > 4)
    off0 = 8
    offs = {"sub": None, "gps": None, "ifd1": None}
    nxt = off0 + size(ifd0) + (12 if sub else 0) + (12 if gps else 0)
    if sub: offs["sub"] = nxt; nxt += size(sub)
    if gps: offs["gps"] = nxt; nxt += size(gps)
    if ifd1 is not None:
        offs["ifd1"] = nxt; nxt += size(ifd1) + 24
        ifd1 = ifd1 + [(0x0201, 4, 1, struct.pack(">I", nxt)), (0x0202, 4, 1, struct.pack(">I", len(thumb)))]
    e0 = list(ifd0)
    if sub: e0.append((0x8769, 4, 1, struct.pack(">I", offs["sub"])))
    if gps: e0.append((0x8825, 4, 1, struct.pack(">I", offs["gps"])))

    def write(entries, at, next_ifd):
        entries = sorted(entries)
        data_at = at + 2 + 12 * len(entries) + 4
        body, extra = bytearray(struct.pack(">H", len(entries))), bytearray()
        for tag, typ, cnt, v in entries:
            if len(v) <= 4: body += struct.pack(">HHI", tag, typ, cnt) + v.ljust(4, b"\x00")
            else:
                body += struct.pack(">HHII", tag, typ, cnt, data_at + len(extra)); extra += v
        return bytes(body + struct.pack(">I", next_ifd) + extra)
    out += write(e0, off0, offs["ifd1"] or 0)
    if sub: out += write(sub, offs["sub"], 0)
    if gps: out += write(gps, offs["gps"], 0)
    if ifd1 is not None: out += write(ifd1, offs["ifd1"], 0); out += thumb
    return bytes(out)


asc = lambda s: (2, len(s.encode()) + 1, s.encode() + b"\x00")
short = lambda v: (3, 1, struct.pack(">H", v))
rat = lambda *ps: (5, len(ps), b"".join(struct.pack(">II", a, b) for a, b in ps))
undef = lambda b: (7, len(b), b)

MAKER_NOTE = bytes((i * 7) % 251 for i in range(600))
GPS_METHOD = b"ASCII\x00\x00\x00GPS"


def full_exif(thumb):
    ifd0 = [(0x010F, *asc("TestCam")), (0x0110, *asc("Phone One")), (0x0112, *short(6)), (0x0131, *asc("PhoneOS 1.0")),
            (0x0132, *asc("2026:10:08 07:05:09")), (0x013B, *asc("A. Photographer")), (0x8298, *asc("(c) 2026 A. Photographer")),
            (0x010E, *asc("The corner at dusk"))]
    sub = [(0x829A, *rat((1, 250))), (0x829D, *rat((28, 10))), (0x8827, *short(200)), (0x9003, *asc("2026:10:08 07:00:00")),
           (0x9209, *short(16)), (0x920A, *rat((52, 10))), (0x927C, *undef(MAKER_NOTE)),
           (0x9286, *undef(b"ASCII\x00\x00\x00hello there")), (0xA420, *asc("abc123def456")), (0xA430, *asc("Pat Owner")),
           (0xA431, *asc("SN-0042")), (0xA434, *asc("Phone One lens")), (0xA435, *asc("LS-77"))]
    gps = [(1, 2, 2, b"N\x00"), (2, *rat((37, 1), (48, 1), (30, 1))), (3, 2, 2, b"W\x00"), (4, *rat((122, 1), (16, 1), (12, 1))),
           (5, 1, 1, b"\x00"), (6, *rat((125, 10))), (7, *rat((7, 1), (0, 1), (0, 1))), (0x11, *rat((90, 1))),
           (0x12, *asc("WGS-84")), (0x1B, *undef(GPS_METHOD)), (0x1D, *asc("2026:10:08"))]
    return tiff(ifd0, sub=sub, gps=gps, ifd1=[(0x0103, *short(6))], thumb=thumb)


def iptc_app13(records):
    iim = b"".join(b"\x1c" + bytes([r, d]) + struct.pack(">H", len(v)) + v for r, d, v in records)
    res = b"8BIM" + struct.pack(">H", 0x0404) + b"\x00\x00" + struct.pack(">I", len(iim)) + iim + (b"\x00" if len(iim) & 1 else b"")
    thumb = b"thumbnail resource " * 3
    res += b"8BIM" + struct.pack(">H", 0x040C) + b"\x00\x00" + struct.pack(">I", len(thumb)) + thumb + (b"\x00" if len(thumb) & 1 else b"")
    return b"Photoshop 3.0\x00" + res


XMP_FULL = (b"http://ns.adobe.com/xap/1.0/\x00<x:xmpmeta xmlns:x=\"adobe:ns:meta/\"><rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" "
            b"xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:photoshop=\"http://ns.adobe.com/photoshop/1.0/\">"
            b"<rdf:Description photoshop:Credit=\"Agency &amp; Co\" photoshop:City=\"Oakland\"><dc:description><rdf:Alt>"
            b"<rdf:li xml:lang=\"fr\">le coin</rdf:li><rdf:li xml:lang=\"x-default\">The XMP caption</rdf:li></rdf:Alt></dc:description>"
            b"<dc:creator><rdf:Seq><rdf:li>XMP Creator</rdf:li></rdf:Seq></dc:creator>"
            b"<dc:rights><rdf:Alt><rdf:li xml:lang=\"x-default\">XMP Rights</rdf:li></rdf:Alt></dc:rights>"
            b"<dc:subject><rdf:Bag><rdf:li>oak</rdf:li><rdf:li>tree</rdf:li></rdf:Bag></dc:subject></rdf:Description></rdf:RDF></x:xmpmeta>")

# the facts the full photo carries: the values written above, in the module's names
FULL_FACTS = {
    "orientation": 6, "make": "TestCam", "model": "Phone One", "software": "PhoneOS 1.0", "time_modified": "2026-10-08T07:05:09",
    "artist": "A. Photographer", "copyright": "(c) 2026 A. Photographer", "description": "The corner at dusk",
    "exposure_time": 0.004, "f_number": 2.8, "iso": 200, "time_taken": "2026-10-08T07:00:00", "flash": 16, "focal_length": 5.2,
    "comments": "hello there", "image_unique_id": "abc123def456", "owner_name": "Pat Owner", "body_serial": "SN-0042",
    "lens": "Phone One lens", "lens_serial": "LS-77",
    "gps_latitude": round(37 + 48 / 60 + 30 / 3600, 7), "gps_longitude": -122.27, "gps_altitude": 12.5, "gps_direction": 90,
    "gps_datum": "WGS-84", "gps_time": "2026-10-08T07:00:00Z",
    "byline": "A. Byline", "credit": "Test Credit", "keywords": ["oak", "tree"], "place_name": "Oakland, USA",
}

files, cases = {}, {"reference": {"pillow": Image.__version__}, "redraw": [], "facts": []}

# 1. a JPEG carrying every kept field, a thumbnail, a maker note, IPTC, XMP, a Display P3 profile, a COM, trailing bytes
base = scene(96, 64, 1)
soi, body = split_jpeg(jpeg_bytes(base, quality=90, subsampling=2))
thumb = jpeg_bytes(base.resize((32, 20)), quality=60)
p3 = profile()
iptc = iptc_app13([(2, 80, b"A. Byline"), (2, 110, b"Test Credit"), (2, 25, b"oak"), (2, 25, b"tree"), (2, 90, b"Oakland"),
                   (2, 101, b"USA"), (2, 120, b"The IPTC caption")])
full = (soi + seg(0xE1, b"Exif\x00\x00" + full_exif(thumb)) + seg(0xE1, XMP_FULL) + seg(0xE2, b"ICC_PROFILE\x00\x01\x01" + p3) +
        seg(0xED, iptc) + seg(0xFE, b"photographer note") + body + b"TRAILER-BYTES")
files["photo-full.jpg"] = full
expected_leftout = {"thumbnail": 2, "maker_note": 1, "xmp": 1, "other_metadata": 1, "after_end": 1}   # the COM stands as `comments`
cases["facts"].append({"file": "photo-full.jpg", "width": 96, "height": 64,
                       "facts": {**FULL_FACTS, "profile_colour_space": "RGB", "profile_description": "Display P3"},
                       "left_out": {"thumbnail": {"count": 2, "bytes": len(thumb) + 57}, "maker_note": {"count": 1, "bytes": 600},
                                    "xmp": {"count": 1, "bytes": len(XMP_FULL) - 29},
                                    "other_metadata": {"count": 2, "bytes": len(GPS_METHOD) + len(b"photographer note")},   # the GPS method; the COM EXIF's UserComment outranked
                                    "after_end": {"count": 1, "bytes": 13}},
                       "profile_bytes_sha256": hashlib.sha256(p3).hexdigest()})
# Pillow reads the EXIF it was given
ex = Image.open(io.BytesIO(full)).getexif()
assert ex[0x010F] == "TestCam" and ex[0x0112] == 6 and ex[0x013B] == "A. Photographer"
assert ex.get_ifd(0x8769)[0x8827] == 200 and ex.get_ifd(0x8825)[2] == (37.0, 48.0, 30.0)

# 2. the same photo's XMP alone fills what EXIF and IPTC did not say; a JFIF thumbnail
soi, body = split_jpeg(jpeg_bytes(base, quality=85, subsampling=0))
xmp_only = soi + seg(0xE1, XMP_FULL) + body
files["photo-xmp.jpg"] = xmp_only
cases["facts"].append({"file": "photo-xmp.jpg", "width": 96, "height": 64,
                       "facts": {"description": "The XMP caption", "artist": "XMP Creator", "copyright": "XMP Rights", "credit": "Agency & Co",
                                 "keywords": ["oak", "tree"], "place_name": "Oakland"},
                       "left_out": {"xmp": {"count": 1, "bytes": len(XMP_FULL) - 29}}})

# 3. a PNG with every text form, eXIf, a Display P3 iCCP, an extra (APNG) frame and bytes after IEND
def chunk(t, body): return struct.pack(">I", len(body)) + t + body + struct.pack(">I", zlib.crc32(t + body))
def png_with(raw, extra_chunks, trailer=b""):
    p, out = 8, bytearray(raw[:8])
    while p < len(raw):
        ln = struct.unpack(">I", raw[p:p + 4])[0]; t = raw[p + 4:p + 8]
        if t == b"IDAT" and extra_chunks:
            for c in extra_chunks: out += c
            extra_chunks = []
        out += raw[p:p + 12 + ln]; p += 12 + ln
    return bytes(out) + trailer
rgb = scene(80, 60, 2)
raw = png_bytes(rgb)
png_exif = tiff([(0x010F, *asc("TestCam")), (0x0112, *short(3))], gps=[(1, 2, 2, b"S\x00"), (2, *rat((33, 1), (30, 1), (0, 1))), (3, 2, 2, b"E\x00"), (4, *rat((151, 1), (0, 1), (0, 1)))])
xmp_png = (b"<x:xmpmeta><rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\">"
           b"<rdf:Description><dc:creator><rdf:Seq><rdf:li>PNG Creator</rdf:li></rdf:Seq></dc:creator></rdf:Description></rdf:RDF></x:xmpmeta>")
itxt = b"XML:com.adobe.xmp\x00\x00\x00\x00\x00" + xmp_png
chunks = [chunk(b"iCCP", b"ICC\x00\x00" + zlib.compress(p3)), chunk(b"eXIf", png_exif), chunk(b"tEXt", b"Author\x00member seven"),
          chunk(b"zTXt", b"Comment\x00\x00" + zlib.compress(b"compressed words")), chunk(b"iTXt", b"Title\x00\x00\x00\x00\x00" + "Café title".encode()),
          chunk(b"iTXt", itxt), chunk(b"pHYs", struct.pack(">IIB", 2835, 2835, 1))]
files["photo-full.png"] = png_with(raw, chunks, b"AFTER-IEND")
cases["facts"].append({"file": "photo-full.png", "width": 80, "height": 60,
                       "facts": {"orientation": 3, "make": "TestCam", "gps_latitude": -33.5, "gps_longitude": 151, "artist": "PNG Creator",
                                 "profile_colour_space": "RGB", "profile_description": "Display P3",
                                 "png_text": [{"keyword": "Author", "text": "member seven"}, {"keyword": "Comment", "text": "compressed words"},
                                              {"keyword": "Title", "text": "Café title"}]},
                       "left_out": {"xmp": {"count": 1, "bytes": len(xmp_png)}, "other_metadata": {"count": 1, "bytes": 9},
                                    "after_end": {"count": 1, "bytes": 10}},
                       "profile_bytes_sha256": hashlib.sha256(p3).hexdigest()})

# an animated PNG (Pillow writes it): the frames after the first are second pictures
frame2 = scene(80, 60, 3)
apng = png_bytes(rgb, save_all=True, append_images=[frame2], duration=100) + b"AFTER-IEND"
fdat = 0
q = 8
while q < len(apng) - 12:
    ln = struct.unpack(">I", apng[q:q + 4])[0]
    if apng[q + 4:q + 8] == b"fdAT": fdat += ln
    q += 12 + ln
    if apng[q - 8:q - 4] == b"IEND": break
files["photo-apng.png"] = apng
cases["facts"].append({"file": "photo-apng.png", "width": 80, "height": 60, "facts": {},
                       "left_out": {"extra_picture": {"count": 1, "bytes": fdat}, "after_end": {"count": 1, "bytes": 10}}})

# 4. the profiles R14's control names, in a JPEG each (and one in a PNG): each is left out and named, the picture drawn without
soi, body = split_jpeg(jpeg_bytes(base, quality=85, subsampling=2))
def with_profile(p): return soi + seg(0xE2, b"ICC_PROFILE\x00\x01\x01" + p) + body
bad = {"cmyk": profile(space=b"CMYK", name="CMYK"), "input": profile(klass=b"scnr", name="Scanner"), "past-end": profile(tags_past_end=True),
       "overlap": profile(overlap=True, shared=False), "version1": profile(version=(1, 0)), "size-lies": None}
for name, p in bad.items():
    if p is None:
        p = bytearray(profile()); p[0:4] = struct.pack(">I", len(p) + 4); p = bytes(p)
    files[f"photo-profile-{name}.jpg"] = with_profile(p)
    said = {"profile_colour_space": "CMYK", "profile_description": "CMYK"} if name == "cmyk" else \
           {"profile_colour_space": "RGB", "profile_description": "Scanner"} if name == "input" else \
           {"profile_colour_space": "RGB", "profile_description": "Display P3"}
    cases["facts"].append({"file": f"photo-profile-{name}.jpg", "width": 96, "height": 64, "facts": said, "left_out": {"profile": {"count": 1, "bytes": len(p)}},
                           "profile_refused": True})
over = profile(pad=1100000)                    # larger than a mebibyte
parts = [over[i:i + 60000] for i in range(0, len(over), 60000)]
files["photo-profile-over-bound.jpg"] = soi + b"".join(seg(0xE2, b"ICC_PROFILE\x00" + bytes([i + 1, len(parts)]) + part) for i, part in enumerate(parts)) + body
cases["facts"].append({"file": "photo-profile-over-bound.jpg", "width": 96, "height": 64, "facts": {}, "left_out": {"profile": {"count": 1, "bytes": len(over)}}, "profile_refused": True})
# a PNG whose profile is a CMYK one
files["photo-profile-cmyk.png"] = png_with(png_bytes(rgb), [chunk(b"iCCP", b"ICC\x00\x00" + zlib.compress(bad["cmyk"]))])
cases["facts"].append({"file": "photo-profile-cmyk.png", "width": 80, "height": 60,
                       "facts": {"profile_colour_space": "CMYK", "profile_description": "CMYK"}, "left_out": {"profile": {"count": 1, "bytes": len(bad["cmyk"])}}, "profile_refused": True})
# a Display P3 profile on a grey photograph is not carried (a grey picture takes no RGB profile)
grey = scene(64, 48, 3).convert("L")
soi_g, body_g = split_jpeg(jpeg_bytes(grey, quality=85))
files["photo-grey-p3.jpg"] = soi_g + seg(0xE2, b"ICC_PROFILE\x00\x01\x01" + p3) + body_g
cases["facts"].append({"file": "photo-grey-p3.jpg", "width": 64, "height": 48,
                       "facts": {"profile_colour_space": "RGB", "profile_description": "Display P3"}, "left_out": {"profile": {"count": 1, "bytes": len(p3)}}, "profile_refused": True})

# 5. a bare photograph: nothing to say, nothing left out
files["photo-bare.jpg"] = jpeg_bytes(base, quality=85, subsampling=2)
cases["facts"].append({"file": "photo-bare.jpg", "width": 96, "height": 64, "facts": {}, "left_out": {}})
files["photo-bare.png"] = png_bytes(rgb)
cases["facts"].append({"file": "photo-bare.png", "width": 80, "height": 60, "facts": {}, "left_out": {}})

# 6. a P3 photograph for the redraw's profile test: the profile's bytes must come out unchanged, the pixels equal
files["photo-p3.jpg"] = with_profile(p3)
files["photo-p3.png"] = png_with(png_bytes(rgb), [chunk(b"iCCP", b"ICC\x00\x00" + zlib.compress(p3))])
cases["p3_sha256"] = hashlib.sha256(p3).hexdigest()

for name, data in files.items():
    open(os.path.join(HERE, name), "wb").write(data)


# ── the redraw's reference: Pillow's pixels of every plain fixture in the folder ──
def pixels(path):
    im = Image.open(path); im.load()
    if path.endswith(".png"):
        if im.mode in ("RGBA", "LA", "P", "PA") or "transparency" in im.info:
            rgba = im.convert("RGBA")
            white = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
            im = Image.alpha_composite(white, rgba)
            im = im.convert("L") if im_is_grey(path) else im.convert("RGB")
        else:
            im = im.convert("L" if im.mode in ("L", "1") else "RGB")
    else:
        im = im.convert("L" if im.mode == "L" else "RGB")
    return im


def im_is_grey(path):
    ct = open(path, "rb").read(26)[25]
    return ct in (0, 4)


for name in sorted(os.listdir(HERE)):
    if not name.endswith((".jpg", ".png")) or "refuse" in name or "progressive" in name or "interlaced" in name or "grey16" in name or "profile" in name:
        continue
    if Image.open(os.path.join(HERE, name)).mode == "CMYK":
        continue
    im = pixels(os.path.join(HERE, name))
    cases["redraw"].append({"file": name, "width": im.width, "height": im.height, "comps": 1 if im.mode == "L" else 3,
                            "pixels_sha256": hashlib.sha256(im.tobytes()).hexdigest()})
json.dump(cases, open(os.path.join(HERE, "photo-cases.json"), "w"), indent=1)
print(len(cases["redraw"]), "redraw cases;", len(cases["facts"]), "fact cases")
