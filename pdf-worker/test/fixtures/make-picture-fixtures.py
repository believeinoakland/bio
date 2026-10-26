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
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

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

# T44 (N868): a 48-megapixel photograph, 8064x6048 colour 4:2:0, decoded while
# reduced. Kept compact: the file holds a SEED, a Pillow-made JPEG 8064 pixels
# wide and SEED_ROWS MCU rows tall with a restart marker after every MCU row, so
# each MCU row is a byte-aligned run of entropy-coded data that starts its DC
# predictions afresh. The 48 MP JPEG is those runs laid out MCU row by MCU row
# (row i takes seed row `seq(i)`), the RSTn markers renumbered, the frame
# height set to 6048 and an Exif orientation inserted; the test assembles the
# same bytes by the same rule and checks their SHA-256 first. Every expected
# digest is Pillow's over the assembled file.
P48_W, P48_H, SEED_ROWS, MCU = 8064, 6048, 8, 16


def seq(i):
    return (5 * i + i // SEED_ROWS) % SEED_ROWS


def split_seed(seed):
    """The seed's header up to its entropy data, and its MCU rows' entropy runs."""
    p = 2
    while True:
        assert seed[p] == 0xFF
        m, ln = seed[p + 1], (seed[p + 2] << 8) | seed[p + 3]
        p += 2 + ln
        if m == 0xDA:
            break
    header, runs, start, q = seed[:p], [], p, p
    while True:
        if seed[q] == 0xFF and 0xD0 <= seed[q + 1] <= 0xD7 or seed[q] == 0xFF and seed[q + 1] == 0xD9:
            runs.append(seed[start:q])
            if seed[q + 1] == 0xD9:
                break
            start = q = q + 2
            continue
        q += 1
    return header, runs


def assemble48(seed, orientation):
    header, runs = split_seed(seed)
    assert len(runs) == SEED_ROWS, len(runs)
    h = bytearray(header)
    sof = h.index(b"\xff\xc0")
    h[sof + 5:sof + 7] = struct.pack(">H", P48_H)
    app1 = exif_with(orientation)
    out = bytearray(h[:2]) + b"\xff\xe1" + struct.pack(">H", len(app1) + 2) + app1 + h[2:]
    n = P48_H // MCU + (1 if P48_H % MCU else 0)
    for i in range(n):
        out += runs[seq(i)]
        if i < n - 1:
            out += bytes([0xFF, 0xD0 + (i & 7)])
    return bytes(out + b"\xff\xd9")


seed_im = picture(P48_W, SEED_ROWS * MCU, 5)
seed48 = jpeg_bytes(seed_im, restart_marker_rows=1)
photo48 = {"seed_b64": b64(seed48), "width": P48_W, "height": P48_H, "seed_rows": SEED_ROWS, "assembled": []}
for o in (1, 3, 6, 8):
    data = assemble48(seed48, o)
    photo48["assembled"].append({
        "orientation": o, "sha256": sha(data),
        "expect": [expect(data, 1568, True, False), expect(data, 2000, False, False)],
    })

# R44: photographed pages, for the preparation. A page of printed text (Pillow's
# built-in font, 11 pt at 220 dpi) is drawn, then "photographed" from formulas:
# turned by a tilt, reduced to a resolution, lit unevenly, flattened in contrast,
# blurred, given noise from a fixed congruential generator, and saved as a JPEG.
# The expectation is the page's own words, read back by the test through the real
# engine; the tilt is the truth the deskew is checked against. A "blank" photograph
# has no text at all; a "big" one has text already tall enough not to be enlarged.
PAGE_A = [
    "CITY COUNCIL REGULAR MEETING AGENDA",
    "Tuesday evening in the council chambers at City Hall.",
    "1. Call to order and roll call of the members present.",
    "2. Approval of the minutes of the previous meeting.",
    "3. Public comment on items not on the agenda today.",
    "4. Consent calendar items approved by a single vote.",
    "5. Report from the finance director on the budget.",
    "6. Resolution authorizing a contract for street repair.",
    "7. Ordinance amending the zoning code for housing.",
    "8. Council member reports and requests for future items.",
    "9. Adjournment of the meeting until the next session.",
]
PAGE_B = [
    "NOTICE OF PUBLIC HEARING ON THE PROPOSED BUDGET",
    "The planning commission will hear public testimony on",
    "the proposed budget for the coming fiscal year at seven",
    "o'clock on the second Thursday of the month. Copies of",
    "the proposal are available at the library, the senior",
    "center and the office of the city clerk. Residents may",
    "speak for three minutes or send a written statement to",
    "the clerk before noon on the day of the hearing today.",
]


# C18 (T51 fix round 2): the walk's hard photograph, a whole page of small print, 231 words, at 110 dpi, tilted, with
# perspective, blurred and noisy; `page-hard-blur` is the same page smaller and blurrier than any engine can read.
HARD_TEXT = [
    "SEAM EAST 12TH STREET BIKEWAY PROJECT STAFF REPORT",
    "From: Director of Transportation to the Public Works Committee",
    "Subject: Authorization of a construction contract for the East 12th Street bikeway and safety improvements",
    "Summary: Staff recommends that the committee approve a contract with the lowest responsive bidder for the construction of protected bike lanes along East 12th Street between Fruitvale Avenue and the Lake Merritt channel. The project includes new curb ramps, signal timing changes, concrete bus boarding islands, drainage repairs and street lighting upgrades at four intersections.",
    "Background: The city adopted its bicycle plan in the previous decade and identified this corridor as a priority because of the number of collisions involving people walking and riding. Community meetings were held over eighteen months and residents asked for physical separation from traffic, better lighting and fewer conflicts at bus stops.",
    "Fiscal impact: Funds for the work are available from the county transportation sales tax, a state active transportation grant and the capital improvement program. No new general fund money is requested. Maintenance costs of about forty thousand dollars a year will be included in the next budget proposal.",
    "Recommendation: Adopt a resolution authorizing the city administrator to award and execute the contract, accept the grant funds and appropriate the amounts shown in the attached schedule. Staff will return to the committee with a progress report after the first six months of construction.",
]


def wrapped(paragraphs, size=30, width=1870):
    """The paragraphs broken into lines that fit `width` in the page font."""
    f = ImageFont.load_default(size)
    d = ImageDraw.Draw(Image.new("L", (10, 10)))
    lines = []
    for para in paragraphs:
        cur = ""
        for w in para.split():
            t = (cur + " " + w).strip()
            if d.textlength(t, font=f) > width - 160:
                lines.append(cur)
                cur = w
            else:
                cur = t
        lines.append(cur)
    return lines


def lcg(seed):
    s = seed
    while True:
        s = (s * 1664525 + 1013904223) & 0xFFFFFFFF
        yield s


def text_page(lines, size=34, width=1870):
    im = Image.new("L", (width, int(size * 1.55) * len(lines) + 80), 238)
    d = ImageDraw.Draw(im)
    f = ImageFont.load_default(size)
    y = 40
    for line in lines:
        d.text((60, y), line, font=f, fill=30)
        y += int(size * 1.55)
    return im


def photographed(lines, tilt=0.0, scale=1.0, noise=0.0, shade=0.0, contrast=1.0, blur=0.0, seed=1, size=34, quality=72, persp=0.0):
    im = text_page(lines, size)
    if tilt:
        im = im.rotate(tilt, resample=Image.BICUBIC, expand=True, fillcolor=200)
    if persp:
        # a keystone: the top edge is nearer the lens' axis than the bottom, so it shrinks by `persp` of the width each side
        W, H = im.size
        a = persp * W
        im = im.transform((W, H), Image.QUAD, (a, 0, 0, H, W, H, W - a, 0), resample=Image.BICUBIC, fillcolor=200)
    if scale != 1.0:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.BILINEAR)
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    W, H = im.size
    px = im.load()
    g = lcg(seed)
    for y in range(H):
        for x in range(W):
            v = 128 + (px[x, y] - 128) * contrast
            if shade:
                v *= 1 - shade * (x / W * 0.6 + y / H * 0.4)
            if noise:
                v += ((next(g) >> 16) / 65535 - 0.5) * 2 * noise * 1.7
            px[x, y] = max(0, min(255, int(v)))
    return jpeg_bytes(im, quality=quality)


def blank_photograph(w=935, h=320, seed=9):
    im = Image.new("L", (w, h))
    px = im.load()
    g = lcg(seed)
    for y in range(h):
        for x in range(w):
            px[x, y] = max(0, min(255, int(150 - 40 * x / w + ((next(g) >> 16) / 65535 - 0.5) * 28)))
    return jpeg_bytes(im, quality=72)


# name, lines, the options of `photographed`, the tilt truth (degrees; the page turned counter-clockwise)
PAGES = [
    ("page-clean", PAGE_A, dict(), 0.0),
    ("page-tilt-2.4", PAGE_A, dict(tilt=2.4, scale=0.68), 2.4),
    ("page-110dpi", PAGE_A, dict(scale=0.5), 0.0),
    ("page-noise-shade", PAGE_A, dict(scale=0.5, noise=18, shade=0.35, contrast=0.55), 0.0),
    ("page-combined-a", PAGE_A, dict(tilt=2.4, scale=0.5, noise=14, shade=0.3, contrast=0.6, blur=0.6, seed=2), 2.4),
    ("page-combined-b", PAGE_B, dict(tilt=-3.1, scale=0.5, noise=14, shade=0.3, contrast=0.6, blur=0.6, seed=3), -3.1),
    ("page-big-text", PAGE_A[:3], dict(scale=1.75, size=34), 0.0),
    ("page-hard", wrapped(HARD_TEXT), dict(tilt=2.4, scale=0.5, noise=16, shade=0.3, contrast=0.6, blur=1.0, seed=4, size=30, quality=60, persp=0.04), 2.4),
    ("page-hard-blur", wrapped(HARD_TEXT), dict(tilt=-2.8, scale=0.43, noise=20, shade=0.3, contrast=0.6, blur=1.3, seed=5, size=30, quality=60), -2.8),
]
pages = []
for name, lines, kw, tilt in PAGES:
    data = photographed(lines, **kw)
    im = Image.open(io.BytesIO(data))
    pages.append({"name": name, "b64": b64(data), "words": " ".join(HARD_TEXT if name.startswith("page-hard") else lines), "tilt_deg": tilt,
                  "width": im.width, "height": im.height, "options": kw})
pages.append({"name": "page-blank", "b64": b64(blank_photograph()), "words": "", "tilt_deg": 0.0,
              "width": 935, "height": 320, "options": {}})

OUT.write_text(json.dumps({
    "made_by": "make-picture-fixtures.py",
    "pillow": PIL.__version__,
    "python": sys.version.split()[0],
    "variants": variants,
    "photo48": photo48,
    "pages": pages,
}, indent=1) + "\n")
print(OUT, OUT.stat().st_size, "bytes,", len(variants), "variants")
