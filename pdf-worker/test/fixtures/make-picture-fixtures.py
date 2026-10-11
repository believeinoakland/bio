"""make-picture-fixtures.py — the independent expectations for pdf-pixels R42 and R43
(`renderPictureToPixels`), written to `picture-variants.json` beside this file.

Every expected digest is Pillow's, never pdf-pixels' own: the picture is opened by
Pillow, turned by `ImageOps.exif_transpose`, made grey by `convert("L")` and reduced
by `reduce(k)`, and the SHA-256 is taken over the resulting 8-bit samples
(`tobytes()`, rows top to bottom, components interleaved). Run with Pillow 12.3.0:

    python3 -I pdf-worker/test/fixtures/make-picture-fixtures.py

The pictures themselves are drawn here from fixed formulas (no randomness), so a
re-run writes the same file. A PNG is never turned (R43), so its expectation skips
`exif_transpose`; its RGBA case uses only alpha 0 and 255, where "over white" has
one answer.
"""
import base64, hashlib, io, json, math, struct, sys, zlib
from pathlib import Path

import PIL
from PIL import Image, ImageDraw, ImageOps

assert PIL.__version__ == "12.3.0", PIL.__version__
OUT = Path(__file__).with_name("picture-variants.json")


def b64(b):
    return base64.b64encode(b).decode("ascii")


def sha(b):
    return hashlib.sha256(b).hexdigest()


def exif_with(orientation, order="II", typ=3, count=1):
    """An APP1 Exif payload whose IFD0 holds one Orientation entry."""
    e = "<" if order == "II" else ">"
    tiff = order.encode() + struct.pack(e + "HI", 42, 8)
    if typ == 3:
        val = struct.pack(e + "HH", orientation, 0)
    elif typ == 4:
        val = struct.pack(e + "I", orientation)
    else:  # BYTE
        val = bytes([orientation, 0, 0, 0])
    ifd = struct.pack(e + "H", 1) + struct.pack(e + "HHI", 0x0112, typ, count) + val + struct.pack(e + "I", 0)
    return b"Exif\x00\x00" + tiff + ifd


def picture(w, h, seed=0, fine=True):
    """A colour picture with edges and gradients, and fine detail unless `fine` is
    false (the photograph, kept small enough to commit), from formulas."""
    im = Image.new("RGB", (w, h))
    px = im.load()
    for y in range(h):
        for x in range(w):
            px[x, y] = (
                (x * 255 // max(1, w - 1) + seed * 37) & 255,
                (y * 255 // max(1, h - 1) + 3 * seed) & 255,
                ((x * 7 + y * 13 + (x * y) % 29) * 3 + seed) & 255 if fine else ((x + 2 * y) // 16 + seed) & 255,
            )
    d = ImageDraw.Draw(im)
    d.rectangle([w // 5, h // 6, w // 2, h // 2], fill=(250, 20, 40))
    d.ellipse([w // 2, h // 3, w - 2, h - 2], outline=(10, 10, 200), width=max(1, w // 40))
    d.line([0, h - 1, w - 1, 0], fill=(0, 0, 0), width=max(1, w // 60))
    return im


def jpeg_bytes(im, exif=None, **kw):
    buf = io.BytesIO()
    args = dict(quality=88)
    args.update(kw)
    if exif is not None:
        args["exif"] = exif
    im.save(buf, "JPEG", **args)
    return buf.getvalue()


def png_bytes(im, **kw):
    buf = io.BytesIO()
    im.save(buf, "PNG", **kw)
    return buf.getvalue()


def k_for(w, h, max_edge):
    return max(1, math.ceil(max(w, h) / max_edge))


def expect(data, max_edge, grey, is_png, exif_only=False):
    im = Image.open(io.BytesIO(data))
    im.load()
    src = {"format": "png" if is_png else "jpeg", "width": im.width, "height": im.height}
    if exif_only:
        # R43 reads EXIF only; Pillow would also take an XMP tiff:Orientation
        # (K2701), so this expectation is Pillow's picture left as stored.
        assert im.getexif().get(0x0112) is not None, "Pillow reads the XMP orientation"
        orientation = 1
    elif not is_png:
        orientation = im.getexif().get(0x0112, 1)
        im = ImageOps.exif_transpose(im)
    else:
        orientation = 1
        if im.mode == "RGBA":  # alpha only 0 or 255 here: over white
            white = Image.new("RGBA", im.size, (255, 255, 255, 255))
            im = Image.alpha_composite(white, im).convert("RGB")
        elif im.mode == "P":
            im = im.convert("RGB")
    if grey:
        im = im.convert("L")
    elif im.mode != "L":
        im = im.convert("RGB")
    k = k_for(im.width, im.height, max_edge)
    if k > 1:
        im = im.reduce(k)
    return {
        "max_edge": max_edge, "grey": grey, "orientation": orientation if orientation in range(1, 9) else 1,
        "reduced_by": k, "width": im.width, "height": im.height, "mode": im.mode,
        "pillow_sha256": sha(im.tobytes()), "source": src,
    }


variants = []


def add(name, data, cases, is_png=False, exif_only=False):
    variants.append({
        "name": name, "b64": b64(data),
        "expect": [expect(data, m, g, is_png, exif_only) for (m, g) in cases],
    })


# R43: each orientation, on a picture whose sides are odd and unequal, so every
# turn and mirror shows; grey and colour; no reduction and a reduction.
base = picture(37, 23, 1)
for o in range(1, 9):
    add(f"orient-{o}", jpeg_bytes(base, exif_with(o)), [(64, True), (64, False), (10, True), (10, False)])
add("orient-none", jpeg_bytes(base), [(64, True), (10, True)])
add("orient-6-big-endian", jpeg_bytes(base, exif_with(6, "MM")), [(64, True)])
add("orient-8-long", jpeg_bytes(base, exif_with(8, typ=4)), [(64, True)])
add("orient-0", jpeg_bytes(base, exif_with(0)), [(64, True)])
add("orient-9", jpeg_bytes(base, exif_with(9)), [(64, True)])
add("orient-6-count-2", jpeg_bytes(base, exif_with(6, count=2)), [(64, True)])
XMP = (b'<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
       b'<rdf:Description xmlns:tiff="http://ns.adobe.com/tiff/1.0/" tiff:Orientation="6"/></rdf:RDF></x:xmpmeta>')
add("orient-xmp-6-only", jpeg_bytes(base, xmp=XMP), [(64, True)], exif_only=True)
add("orient-exif-cut", jpeg_bytes(base, exif_with(6)[:14]), [(64, True)])

# R42: the integer reduction, every factor Pillow computes on its own path
# (2x2, 3x3, 4x4, 5x5 and NxN), with partial edge boxes on both edges.
red = picture(101, 67, 2)
red_jpeg = jpeg_bytes(red, exif_with(1))
add("reduce", red_jpeg, [(101, True), (60, True), (40, True), (30, True), (21, True), (17, True), (12, True), (9, True),
                         (60, False), (30, False), (17, False), (9, False)])
add("grey-jpeg", jpeg_bytes(red.convert("L"), exif_with(6)), [(200, True), (30, True), (30, False)])
add("reduce-444", jpeg_bytes(red, subsampling=0), [(30, True), (17, False)])

# PNGs: never turned, even with an eXIf chunk saying 6.
add("png-rgb", png_bytes(red), [(200, True), (30, True), (17, False)], True)
add("png-grey", png_bytes(red.convert("L")), [(200, True), (30, True)], True)
add("png-palette", png_bytes(red.convert("P", palette=Image.Palette.ADAPTIVE, colors=16)), [(30, True), (30, False)], True)
rgba = red.convert("RGBA")
a = rgba.getchannel("A").point(lambda v: 0).copy()
ImageDraw.Draw(a).rectangle([10, 5, 80, 50], fill=255)
rgba.putalpha(a)
add("png-rgba", png_bytes(rgba), [(30, True), (30, False)], True)
add("png-exif-6", png_bytes(red, exif=exif_with(6)), [(200, True)], True)

# The photograph R42's test names: 4032x3024, colour, Orientation 6 (a phone held upright).
photo = picture(4032, 3024, 3, fine=False)
photo_jpeg = jpeg_bytes(photo, exif_with(6))
add("photo-4032x3024-o6", photo_jpeg, [(1568, True)])

# Codec refusals, each beside a control that is accepted.
add("refuse-progressive", jpeg_bytes(base, progressive=True), [])
cmyk = jpeg_bytes(base.convert("CMYK"))
add("refuse-cmyk", cmyk, [])
add("refuse-truncated", red_jpeg[: len(red_jpeg) // 2], [])

OUT.write_text(json.dumps({
    "made_by": "make-picture-fixtures.py",
    "pillow": PIL.__version__,
    "python": sys.version.split()[0],
    "variants": variants,
}, indent=1) + "\n")
print(OUT, OUT.stat().st_size, "bytes,", len(variants), "variants")
