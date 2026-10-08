"""image-cover's fixtures and the reference's hashes (R5).

NOT the subject's output. Every hash in `cases.json` is PILLOW's decode (libjpeg-turbo for JPEG, zlib and
Pillow's own PNG reader for PNG) of the ORIGINAL photo, as displayed (`ImageOps.exif_transpose`), with the
pixels the cover may change set to zero; the cover's rectangles and block counts are computed here from the
areas and the frame's geometry, not read from the module. The test decodes each answer and must reach the
same hash. Re-run this, never copy a failing run's "got":

    pip install pillow==12.3.0 numpy
    python3 bio-plane/test/m/image-cover/fixtures/make-fixtures.py

After writing, it also runs the module over every case (node) and checks each answer with Pillow: outside the
cover the answer's decode equals the original's, inside it is black, and Pillow finds no EXIF beyond the
orientation, no ICC profile, no text, no second frame. That check is the reference's, made once here; the
module's answers are not recorded.

The photos are synthetic (a gradient scene with noise and a drawn face, no person), built in the shapes a phone
and a screenshot tool write: a JPEG with EXIF (orientation, make, GPS) and its IFD1 thumbnail, XMP, an ICC
profile, an MPF index with a second image (a gain map) after EOI, and trailing bytes; a PNG with text, XMP,
eXIf, iCCP, an APNG second frame and bytes after IEND.
"""
import hashlib, io, json, os, struct, subprocess, sys, zlib
import numpy as np
from PIL import Image, ImageDraw, ImageOps, ImageCms, PngImagePlugin, features

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", ".."))

# ── the scene ─────────────────────────────────────────────────────────────────
def scene(w, h, seed, face):
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[0:h, 0:w]
    a = np.stack([90 + 120 * x / w, 140 + 60 * y / h, 200 - 100 * (x + y) / (w + h)], axis=2)
    a += rng.normal(0, 14, a.shape)
    im = Image.fromarray(np.clip(a, 0, 255).astype("uint8"))
    d = ImageDraw.Draw(im)
    fx0, fy0, fx1, fy1 = face
    d.ellipse(face, fill=(224, 182, 150))
    ex = (fx1 - fx0) // 4
    d.ellipse((fx0 + ex - 3, fy0 + (fy1 - fy0) // 3 - 3, fx0 + ex + 3, fy0 + (fy1 - fy0) // 3 + 3), fill=(30, 30, 60))
    d.ellipse((fx1 - ex - 3, fy0 + (fy1 - fy0) // 3 - 3, fx1 - ex + 3, fy0 + (fy1 - fy0) // 3 + 3), fill=(30, 30, 60))
    d.arc((fx0 + ex, fy0 + (fy1 - fy0) // 2, fx1 - ex, fy1 - (fy1 - fy0) // 6), 20, 160, fill=(150, 40, 40), width=3)
    d.rectangle((w - 60, h - 26, w - 8, h - 8), fill=(250, 250, 240))
    d.text((w - 56, h - 24), "7ABC123", fill=(10, 10, 10))
    return im

def icc():
    """An sRGB profile with its creation time (header bytes 24-35) fixed, so a re-run writes the same fixtures."""
    b = bytearray(ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes())
    b[24:36] = struct.pack(">6H", 2026, 10, 8, 0, 0, 0)
    return bytes(b)

# ── EXIF / TIFF, by hand (Pillow writes no IFD1 thumbnail) ────────────────────
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
        thumb_off = nxt
        ifd1 = ifd1 + [(0x0201, 4, 1, struct.pack(">I", thumb_off)), (0x0202, 4, 1, struct.pack(">I", len(thumb)))]
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

asc = lambda s: (2, len(s) + 1, s.encode() + b"\x00")
short = lambda v: (3, 1, struct.pack(">H", v))
rat = lambda *ps: (5, len(ps), b"".join(struct.pack(">II", a, b) for a, b in ps))

def phone_exif(orientation, thumb):
    return tiff(
        [(0x010F, *asc("TestCam")), (0x0110, *asc("Phone One")), (0x0112, *short(orientation)),
         (0x0131, *asc("PhoneOS 1.0"))],
        sub=[(0x9003, *asc("2026:10:08 07:00:00"))],
        gps=[(0x0001, 2, 2, b"N\x00"), (0x0002, *rat((37, 1), (48, 1), (3000, 100))), (0x0003, 2, 2, b"W\x00"),
             (0x0004, *rat((122, 1), (16, 1), (1200, 100)))],
        ifd1=[(0x0103, *short(6))], thumb=thumb)

def seg(marker, body):
    return bytes([0xFF, marker]) + struct.pack(">H", len(body) + 2) + body

def strip_app(jpeg):
    """Pillow's JPEG without its APP0 (a phone writes none): SOI + everything from the first non-APP0 segment."""
    p = 2
    while jpeg[p] == 0xFF and jpeg[p + 1] == 0xE0:
        p += 2 + struct.unpack(">H", jpeg[p + 2:p + 4])[0]
    return jpeg[:2], jpeg[p:]

def jpeg_bytes(im, **kw):
    b = io.BytesIO(); im.save(b, "JPEG", **kw); return b.getvalue()

def phone_jpeg(im_stored, orientation, *, quality=88, subsampling=2, restart_rows=None, extra=True, optimize=False):
    kw = dict(quality=quality, subsampling=subsampling, optimize=optimize)
    if restart_rows: kw["restart_marker_rows"] = restart_rows
    soi, body = strip_app(jpeg_bytes(im_stored, **kw))
    thumb = jpeg_bytes(im_stored.resize((80, 60)), quality=70)
    segs = [seg(0xE1, b"Exif\x00\x00" + phone_exif(orientation, thumb))]
    if extra:
        xmp = (b'http://ns.adobe.com/xap/1.0/\x00<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF><rdf:Description '
               b'PersonInImage="A. Passerby" GPSLatitude="37,48.5N"/></rdf:RDF></x:xmpmeta>')
        segs.append(seg(0xE1, xmp))
        segs.append(seg(0xE2, b"ICC_PROFILE\x00\x01\x01" + icc()))
        segs.append(seg(0xFE, b"taken by member 7 near the face"))
    second = jpeg_bytes(im_stored.convert("L").resize((im_stored.width // 2, im_stored.height // 2)), quality=80)
    if extra:
        # MPF (CIPA DC-007): the index names a second image (a gain map) that follows this one's EOI.
        mp_entries = 2
        def mpf(main_len, tiff_at):
            entries = struct.pack(">IIIHH", 0x20030000, main_len, 0, 0, 0) + \
                      struct.pack(">IIIHH", 0x00000000, len(second), max(0, main_len - tiff_at), 0, 0)
            t = b"MM\x00\x2a\x00\x00\x00\x08" + struct.pack(">H", 3) + \
                struct.pack(">HHI", 0xB000, 7, 4) + b"0100" + \
                struct.pack(">HHII", 0xB001, 4, 1, mp_entries) + \
                struct.pack(">HHII", 0xB002, 7, 16 * mp_entries, 8 + 2 + 3 * 12 + 4) + struct.pack(">I", 0) + entries
            return seg(0xE2, b"MPF\x00" + t)
        head = soi + b"".join(segs)
        tiff_at = len(head) + 8                      # the MPF TIFF header: after FF E2, the length and "MPF\0"
        mlen = len(head) + len(mpf(0, tiff_at)) + len(body)
        main = head + mpf(mlen, tiff_at) + body
        return main + second + b"SEFH\x00\x00\x00\x01face-region:120,40,60,60;SEFT"
    return soi + b"".join(segs) + body

# ── the expected cover, computed from the geometry (not the module) ───────────
def to_stored(dx, dy, W, H, o):
    return {1: (dx, dy), 2: (W - 1 - dx, dy), 3: (W - 1 - dx, H - 1 - dy), 4: (dx, H - 1 - dy), 5: (dy, dx),
            6: (dy, H - 1 - dx), 7: (W - 1 - dy, H - 1 - dx), 8: (W - 1 - dy, dx)}[o]

def to_displayed(sx, sy, W, H, o):
    return {1: (sx, sy), 2: (W - 1 - sx, sy), 3: (W - 1 - sx, H - 1 - sy), 4: (sx, H - 1 - sy), 5: (sy, sx),
            6: (H - 1 - sy, sx), 7: (H - 1 - sy, W - 1 - sx), 8: (sy, W - 1 - sx)}[o]

def rect_map(r, fn):
    (ax, ay), (bx, by) = fn(r[0], r[1]), fn(r[2] - 1, r[3] - 1)
    return [min(ax, bx), min(ay, by), max(ax, bx) + 1, max(ay, by) + 1]

def expected(W, H, o, areas, cell_w, cell_h, blocks_per_cell):
    DW, DH = (H, W) if o >= 5 else (W, H)
    cells, rects = set(), []
    for x0, y0, x1, y1 in areas:
        c = [max(0, x0), max(0, y0), min(DW, x1), min(DH, y1)]
        s = rect_map(c, lambda x, y: to_stored(x, y, W, H, o))
        g = [s[0] // cell_w, s[1] // cell_h, (s[2] - 1) // cell_w + 1, (s[3] - 1) // cell_h + 1]
        for cy in range(g[1], g[3]):
            for cx in range(g[0], g[2]): cells.add((cx, cy))
        snapped = [g[0] * cell_w, g[1] * cell_h, min(W, g[2] * cell_w), min(H, g[3] * cell_h)]
        rects.append(rect_map(snapped, lambda x, y: to_displayed(x, y, W, H, o)))
    return DW, DH, len(cells) * blocks_per_cell, rects

def mask_of(DW, DH, rects, grow):
    m = np.zeros((DH, DW), bool)
    for x0, y0, x1, y1 in rects: m[max(0, y0 - grow):y1 + grow, max(0, x0 - grow):x1 + grow] = True
    return m

def reference(data, mode):
    im = Image.open(io.BytesIO(data)); im.load()
    im = ImageOps.exif_transpose(im)
    return np.asarray(im.convert(mode))

def outside_sha(arr, m):
    a = arr.copy(); a[m] = 0
    return hashlib.sha256(a.tobytes()).hexdigest()

# ── the cases ─────────────────────────────────────────────────────────────────
cases, files = [], {}
def darkest_opaque(png):
    """The cover a full palette with no opaque black takes: its darkest opaque entry (Rec. 601 luma)."""
    im = Image.open(io.BytesIO(png)); pal = im.getpalette()[: 3 * 256]
    trns = im.info.get("transparency", b"")
    alpha = lambda i: trns[i] if isinstance(trns, bytes) and i < len(trns) else 255
    i = min(range(len(pal) // 3), key=lambda i: ((255 - alpha(i)) * 10**6 + pal[3*i] * 299 + pal[3*i+1] * 587 + pal[3*i+2] * 114, i))
    return [pal[3 * i], pal[3 * i + 1], pal[3 * i + 2], alpha(i)]

def add(name, data, kind, areas, cover=None, **geo):
    files[name] = data
    c = {"file": name, "areas": areas}
    if kind == "jpeg":
        im = Image.open(io.BytesIO(data))
        o = im.getexif().get(0x0112, 1)
        layers = im.layer                                   # [(id, h, v, tq)]
        hmax, vmax = max(l[1] for l in layers), max(l[2] for l in layers)
        single = len(layers) == 1
        cw, ch = (8, 8) if single else (8 * hmax, 8 * vmax)
        bpc = 1 if single else sum(l[1] * l[2] for l in layers)
        mode = "L" if single else "RGB"
        bleed = 0 if single or (hmax == 1 and vmax == 1) else 1
        DW, DH, covered, rects = expected(im.width, im.height, o, areas, cw, ch, bpc)
        cover = [0] if single else [0, 0, 0]
    else:
        im = Image.open(io.BytesIO(data))
        o = im.getexif().get(0x0112, 1)
        DW, DH, covered, rects = expected(im.width, im.height, o, areas, 1, 1, 1)
        mode, bleed, cover = "RGBA", 0, cover or [0, 0, 0, 255]
    ref = reference(data, mode)
    assert ref.shape[:2] == (DH, DW)
    c.update(format=kind, width=DW, height=DH, covered=covered, cover_rects=rects, bleed=bleed, mode=mode,
             cover=cover, outside_sha256=outside_sha(ref, mask_of(DW, DH, rects, bleed)), **geo)
    cases.append(c)

# 1. a phone's 4:2:0 JPEG held sideways (orientation 6), restart markers, every kind of metadata, MPF, trailer.
#    Stored 203x157 (odd both ways, partial MCUs); displayed 157x203. The face is drawn in stored coordinates.
st = scene(203, 157, 1, (120, 30, 175, 95))
ph = phone_jpeg(st, 6, restart_rows=1)
add("phone-420-o6.jpg", ph, "jpeg", [[60, 120, 130, 176], [0, 0, 9, 9]])
# 2. 4:4:4, upside down (orientation 3), overlapping areas, one partly outside the picture.
st = scene(150, 101, 2, (20, 20, 70, 80))
add("444-o3.jpg", phone_jpeg(st, 3, subsampling=0), "jpeg", [[70, 20, 130, 85], [100, 40, 400, 60], [-30, -30, 5, 5]])
# 3. grey, orientation 8, optimised Huffman tables (only the symbols the photo used).
st = scene(97, 131, 3, (30, 40, 70, 90)).convert("L")
add("grey-o8-optimised.jpg", phone_jpeg(st, 8, optimize=True, extra=False), "jpeg", [[40, 20, 90, 70]])
# 4. 4:2:2 (h2v1), transposed (orientation 5), restart markers every row.
st = scene(170, 90, 4, (60, 10, 110, 70))
add("422-o5.jpg", phone_jpeg(st, 5, subsampling=1, restart_rows=1), "jpeg", [[10, 60, 70, 110]])
# 5. quality 100 (DC quantiser 1), upright, nothing to cover: the copy is still clean (R1 empty areas, R2).
st = scene(64, 48, 5, (10, 10, 40, 40))
add("q100-upright-empty.jpg", phone_jpeg(st, 1, quality=100), "jpeg", [])
# 6. quality 100 with a cover (the cover's DC difference at its 8-bit limit).
add("q100-upright.jpg", phone_jpeg(st, 1, quality=100, optimize=True), "jpeg", [[8, 8, 41, 41]])

# 7. the orientations not yet met (2, 4, 7), each a plain 4:2:0 JPEG and an RGB PNG with only its eXIf.
for o in (2, 3, 4, 5, 7, 8):
    st = scene(70, 50, 20 + o, (30, 5, 60, 40))
    if o in (2, 4, 7): add(f"o{o}.jpg", phone_jpeg(st, o, extra=False), "jpeg", [[3, 7, 21, 29]])
    ex = Image.Exif(); ex[0x0112] = o
    b = io.BytesIO(); st.save(b, "PNG", exif=ex.tobytes())
    add(f"o{o}.png", b.getvalue(), "png", [[3, 7, 21, 29]])

# 8. an Adobe APP14 (transform 1, YCbCr) in place of JFIF: the answer keeps the flag that decides the colour.
st = scene(48, 40, 30, (10, 10, 30, 30))
soi, body = strip_app(jpeg_bytes(st, quality=85, subsampling=0))
add("adobe-ycc.jpg", soi + seg(0xEE, b"Adobe\x00\x64\x00\x00\x00\x00\x01") + body, "jpeg", [[0, 0, 16, 16]])

# PNG: a screenshot tool's RGBA with text, XMP, eXIf (orientation 6, GPS), iCCP, an APNG second frame, trailer.
def png_bytes(im, **kw):
    b = io.BytesIO(); im.save(b, "PNG", **kw); return b.getvalue()
st = scene(121, 87, 6, (60, 10, 110, 70)).convert("RGBA")
info = PngImagePlugin.PngInfo()
info.add_text("Author", "member 7"); info.add_text("Comment", "the face at 60,10", zip=True)
info.add_itxt("XML:com.adobe.xmp", '<x:xmpmeta><rdf:Description PersonInImage="A. Passerby"/></x:xmpmeta>')
exif = Image.Exif(); exif[0x0112] = 6; exif[0x010F] = "TestCam"
frame2 = scene(121, 87, 7, (10, 10, 60, 70)).convert("RGBA")
apng = png_bytes(st, pnginfo=info, exif=exif.tobytes(), icc_profile=icc(),
                 save_all=True, append_images=[frame2], duration=500, default_image=False)
add("screenshot-rgba-o6.png", apng + b"trailing: face crop follows" + png_bytes(st.crop((60, 10, 110, 70))), "png",
    [[10, 60, 70, 100]])
# RGB, its IDAT split into many small chunks.
st = scene(77, 55, 8, (20, 10, 50, 45)).convert("RGB")
raw = png_bytes(st)
def rechunk(png, n):
    out, p, idat = bytearray(png[:8]), 8, b""
    while p < len(png):
        ln = struct.unpack(">I", png[p:p + 4])[0]; t = png[p + 4:p + 8]; body = png[p + 8:p + 8 + ln]
        if t == b"IDAT": idat += body
        else:
            if idat:
                for i in range(0, len(idat), n):
                    part = idat[i:i + n]; out += struct.pack(">I", len(part)) + b"IDAT" + part + struct.pack(">I", zlib.crc32(b"IDAT" + part))
                idat = b""
            out += png[p:p + 12 + ln]
        p += 12 + ln
    return bytes(out)
add("rgb-many-idat.png", rechunk(raw, 97), "png", [[20, 10, 51, 46]])
# indexed, 200 colours and transparency: room for an added black entry.
st = scene(64, 64, 9, (10, 10, 50, 50)).convert("RGB").quantize(200)
add("palette-room.png", png_bytes(st, transparency=bytes(range(0, 250, 25))), "png", [[10, 10, 50, 50]])
# indexed, a full 256-colour palette with no black: the darkest opaque entry covers.
st = scene(64, 64, 10, (10, 10, 50, 50)).convert("RGB").quantize(256)
full = png_bytes(st)
assert len(Image.open(io.BytesIO(full)).getpalette()) == 768 and [0, 0, 0] not in [Image.open(io.BytesIO(full)).getpalette()[i:i + 3] for i in range(0, 768, 3)]
add("palette-full.png", full, "png", [[0, 30, 64, 40]], cover=darkest_opaque(full))
# grey and grey with alpha.
st = scene(45, 33, 11, (5, 5, 30, 30))
add("grey.png", png_bytes(st.convert("L")), "png", [[5, 5, 30, 30]])
add("grey-alpha.png", png_bytes(st.convert("LA")), "png", [[0, 0, 45, 1], [44, 0, 45, 33]])

# ── refusals (R3): the bytes, the expected code ───────────────────────────────
base = files["444-o3.jpg"]
def with_sof(data, marker, precision=None):
    b = bytearray(data); p = 2
    while True:
        m, ln = b[p + 1], struct.unpack(">H", b[p + 2:p + 4])[0]
        if m in (0xC0, 0xC1):
            b[p + 1] = marker
            if precision is not None: b[p + 4] = precision
            return bytes(b)
        p += 2 + ln
refusals = []
def refuse(name, data, code, areas=None):
    files[name] = data
    refusals.append({"file": name, "code": code, "areas": areas if areas is not None else [[0, 0, 10, 10]]})
refuse("refuse-progressive.jpg", jpeg_bytes(scene(40, 30, 12, (5, 5, 20, 20)), progressive=True), "UNSUPPORTED_JPEG_PROCESS")
refuse("refuse-arithmetic.jpg", with_sof(base, 0xC9), "UNSUPPORTED_JPEG_PROCESS")
refuse("refuse-lossless.jpg", with_sof(base, 0xC3), "UNSUPPORTED_JPEG_PROCESS")
refuse("refuse-12bit.jpg", with_sof(base, 0xC1, 12), "UNSUPPORTED_JPEG_PROCESS")
refuse("refuse-truncated.jpg", base[: len(base) * 2 // 3], "TRUNCATED_IMAGE_DATA")
refuse("refuse-heic.heic", b"\x00\x00\x00\x18ftypheic\x00\x00\x00\x00mif1heic" + bytes(64), "NOT_A_COVERABLE_FORMAT")
png_rgb = files["rgb-many-idat.png"]
def ihdr_set(png, i, v):
    b = bytearray(png); b[16 + i] = v
    b[29:33] = struct.pack(">I", zlib.crc32(bytes(b[12:29]))); return bytes(b)
refuse("refuse-interlaced.png", ihdr_set(raw, 12, 1), "PNG_INTERLACED")
refuse("refuse-16bit.png", png_bytes(Image.fromarray((np.arange(30 * 20, dtype=np.uint16).reshape(20, 30) * 90))), "NOT_A_COVERABLE_FORMAT")
refuse("refuse-truncated.png", png_rgb[: len(png_rgb) // 2], "TRUNCATED_IMAGE_DATA")
bad = bytearray(raw); bad[raw.index(b"IDAT") + 20] ^= 0xFF
refuse("refuse-crc.png", bytes(bad), "IMAGE_DATA_CORRUPT")
refuse("444-o3.jpg", base, "AREA_OUTSIDE", [[0, 0, 10, 10], [150, 0, 160, 10]])

# ── R4's strip: 4032 x 64, 4:2:0, a restart interval of one MCU row (252 MCUs), photo-dense texture. The test
#    tiles its four restart segments into a 4032 x 3024 (12 MP) and an 8064 x 6048 (48 MP) phone JPEG. ───────
rng = np.random.default_rng(48)
y, x = np.mgrid[0:64, 0:4032]
tex = np.stack([120 + 60 * np.sin(x / 37.0) + 30 * np.sin(y / 5.0), 110 + 50 * np.cos(x / 23.0 + y / 11.0),
                100 + 70 * np.sin((x + 3 * y) / 51.0)], axis=2) + rng.normal(0, 18, (64, 4032, 3))
strip = Image.fromarray(np.clip(tex, 0, 255).astype("uint8"))
files["strip-4032x64.jpg"] = jpeg_bytes(strip, quality=90, restart_marker_blocks=252)

for name, data in files.items():
    with open(os.path.join(HERE, name), "wb") as f: f.write(data)
ref_versions = {"pillow": Image.__version__, "libjpeg_turbo": features.version("libjpeg_turbo"), "zlib": features.version("zlib")}
with open(os.path.join(HERE, "cases.json"), "w") as f:
    json.dump({"reference": ref_versions, "cases": cases, "refusals": refusals}, f, indent=1)
    f.write("\n")
print(f"wrote {len(files)} files, {len(cases)} cases, {len(refusals)} refusals; reference {ref_versions}")

# ── the reference's check of the module's answers (made here, once; nothing recorded) ──
runner = """
import { coverAreas } from "%s";
import { readFileSync } from "node:fs";
const { cases } = JSON.parse(readFileSync(process.argv.at(-1) + "/cases.json", "utf8"));
const out = {};
for (const c of cases) {
  const r = await coverAreas(readFileSync(process.argv.at(-1) + "/" + c.file), { areas: c.areas });
  out[c.file] = r.ok ? { b64: Buffer.from(r.bytes).toString("base64"), covered: r.covered, width: r.width, height: r.height } : r;
}
process.stdout.write(JSON.stringify(out));
""" % os.path.join(REPO, "bio-plane", "src", "image-cover", "index.mjs")
answers = json.loads(subprocess.run(["node", "--input-type=module", "-e", runner, HERE], check=True, capture_output=True, text=True).stdout)
for c in cases:
    a = answers[c["file"]]
    assert "b64" in a, (c["file"], a)
    data = __import__("base64").b64decode(a["b64"])
    im = Image.open(io.BytesIO(data)); im.load()
    assert (a["width"], a["height"], a["covered"]) == (c["width"], c["height"], c["covered"]), (c["file"], a, c)
    assert set(im.info) <= {"exif", "jfif", "jfif_version", "jfif_unit", "jfif_density", "dpi", "adobe", "adobe_transform", "transparency"}, (c["file"], im.info.keys())
    ex = im.getexif()
    assert set(ex.keys()) <= {0x0112} and not ex.get_ifd(0x8769) and not ex.get_ifd(0x8825), (c["file"], dict(ex))
    assert getattr(im, "n_frames", 1) == 1
    arr = reference(data, c["mode"])
    assert outside_sha(arr, mask_of(c["width"], c["height"], c["cover_rects"], c["bleed"])) == c["outside_sha256"], c["file"]
    inner = np.zeros(arr.shape[:2], bool)
    g = c["bleed"]
    for x0, y0, x1, y1 in c["cover_rects"]: inner[y0 + g:y1 - g, x0 + g:x1 - g] = True
    assert (arr[inner] == np.array(c["cover"] if c["mode"] != "L" else c["cover"][0])).all(), c["file"]
print("the reference agrees with every answer")
