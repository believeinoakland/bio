"""CCITT fixtures for image-codecs' `ccittDecode` (R2, R6): each raw stream with
the picture an independent decoder, libtiff through Pillow, reads from it.

    python3 make-ccitt-fixtures.py > ccitt-variants.json

Requires Pillow built with libtiff. Every stream but the scan's is written by
libtiff from a picture drawn here, and kept only when libtiff reads it back to
exactly that picture; the scan's stream (a council resolution, 3300x2550, K=-1,
84,797 B) is taken byte for byte from `../../fixtures/scan-ccitt-g4-page.pdf`.
The expected picture is libtiff's decode of the stream wrapped in a one-strip
TIFF, packed 1 bit a pixel, rows padded to a byte with 0 bits, SET BIT = WHITE, which is
`ccittDecode`'s packing. Never copy a failing run's output into a digest."""
import base64, hashlib, io, json, random, struct
import PIL
from PIL import Image, ImageDraw, features

assert features.check("libtiff"), "Pillow must be built with libtiff"
COMPRESSION = {"group4": 4, "group3": 3, "tiff_ccitt": 2}


def tiff_around(data, w, h, compression, t4=0):
    """A little-endian, one-strip, WhiteIsZero TIFF holding `data` as is."""
    tags = [(256, 4, w), (257, 4, h), (258, 3, 1), (259, 3, compression), (262, 3, 0),
            (273, 4, 0), (277, 3, 1), (278, 4, h), (279, 4, len(data))]
    if compression == 3: tags.append((292, 4, t4))
    if compression == 4: tags.append((293, 4, 0))
    ifd_at = 8
    data_at = ifd_at + 2 + 12 * len(tags) + 4
    out = bytearray(b"II*\x00" + struct.pack("<I", ifd_at) + struct.pack("<H", len(tags)))
    for tag, typ, val in tags:
        if tag == 273: val = data_at
        out += struct.pack("<HHI", tag, typ, 1) + (struct.pack("<HH", val, 0) if typ == 3 else struct.pack("<I", val))
    out += struct.pack("<I", 0) + data
    return bytes(out)


def libtiff_reads(data, w, h, compression, t4=0):
    im = Image.open(io.BytesIO(tiff_around(data, w, h, compression, t4)))
    im.load()
    assert im.mode == "1" and im.size == (w, h), (im.mode, im.size)
    return im.tobytes()


def encode(im, compression):
    """libtiff codes a 0 bit as white whatever the TIFF's photometric tag, and
    Pillow writes a "1" image BlackIsZero, so the picture is handed over as its
    negative: the stream's white runs are then the picture's white."""
    buf = io.BytesIO()
    Image.frombytes("1", im.size, bytes(~b & 0xff for b in im.tobytes())).save(buf, "TIFF", compression=compression, strip_size=1 << 30)
    t = Image.open(io.BytesIO(buf.getvalue()))
    offs, counts = t.tag_v2[273], t.tag_v2[279]
    assert len(offs) == 1, "one strip"
    t4 = t.tag_v2.get(292, 0)
    return buf.getvalue()[offs[0]:offs[0] + counts[0]], t4


def picture(w, h, seed, kind):
    random.seed(seed)
    im = Image.new("1", (w, h), 1)
    d = ImageDraw.Draw(im)
    if kind == "text":            # lines of glyph-sized marks, as a typed page
        for y in range(8, h - 12, 18):
            x = 6
            while x < w - 12:
                gw = random.randint(3, 9)
                if random.random() < 0.85: d.rectangle([x, y, x + gw, y + random.randint(6, 11)], fill=0)
                x += gw + random.randint(2, 6)
    elif kind == "shapes":
        for _ in range(60):
            x, y = random.randrange(w), random.randrange(h)
            d.ellipse([x, y, x + random.randint(4, 120), y + random.randint(4, 90)], outline=0, width=random.randint(1, 4))
            d.line([random.randrange(w), random.randrange(h), random.randrange(w), random.randrange(h)], fill=0, width=2)
    elif kind == "noise":         # isolated pixels: every run short, every mode used
        px = im.load()
        for y in range(h):
            for x in range(w):
                if random.random() < 0.3: px[x, y] = 0
    elif kind == "bands":         # runs past 2560, which need the extended make-up codes
        d.rectangle([0, h // 3, w - 1, 2 * h // 3], fill=0)
        d.rectangle([w // 5, 0, w // 5 + 2600, h // 4], fill=0)
    return im


variants = []
for name, w, h, seed, kind in [("text-1728", 1728, 220, 1, "text"), ("shapes-odd-width", 997, 301, 2, "shapes"),
                               ("noise-narrow", 61, 47, 3, "noise"), ("bands-wide", 5200, 40, 4, "bands"),
                               ("one-column", 1, 9, 5, "noise"), ("all-white", 640, 12, 6, "blank")]:
    im = picture(w, h, seed, kind)
    src = im.tobytes()
    for comp, K, align in [("group4", -1, False), ("group3", 0, False), ("tiff_ccitt", 0, True)]:
        data, t4 = encode(im, comp)
        if comp == "group3": assert t4 & 1 == 0, "one-dimensional G3"
        ref = libtiff_reads(data, w, h, COMPRESSION[comp], t4)
        assert ref == src, f"{name}/{comp}: libtiff does not read back the picture encoded"
        variants.append({"name": f"{name}-{comp}", "coding": comp, "K": K, "columns": w, "rows": h, "byteAlign": align,
                         "data_b64": base64.b64encode(data).decode(), "rows_expected": h,
                         "libtiff_sha256": hashlib.sha256(ref).hexdigest(),
                         "white": sum(bin(b).count("1") for b in ref)})

pdf = open(__file__.rsplit("/", 1)[0] + "/../../fixtures/scan-ccitt-g4-page.pdf", "rb").read()
at = pdf.index(b"stream\n", pdf.index(b"/CCITTFaxDecode")) + 7
scan = pdf[at:at + 84797]
assert pdf[at + 84797:at + 84797 + 10].strip().startswith(b"endstream")
ref = libtiff_reads(scan, 3300, 2550, 4)
variants.append({"name": "scan-page-group4", "coding": "group4", "K": -1, "columns": 3300, "rows": 2550, "byteAlign": False,
                 "data_b64": base64.b64encode(scan).decode(), "rows_expected": 2550,
                 "libtiff_sha256": hashlib.sha256(ref).hexdigest(),
                 "white": sum(bin(b).count("1") for b in ref)})

print(json.dumps({"provenance": f"libtiff {features.version('libtiff')} through Pillow {PIL.__version__}; digests are sha256 of "
                                "libtiff's decode packed 1 bit a pixel, rows padded to a byte, set bit = white",
                  "variants": variants}, indent=1))
