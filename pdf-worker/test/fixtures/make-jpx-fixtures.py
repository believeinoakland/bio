"""D-622: the JPEG 2000 fixtures `jpx.test.mjs` checks `jpxdecode.mjs` against.

NOT the subject's output. Every expected picture here is OPJ_DECOMPRESS's decode
(OpenJPEG 2.5.0, sharing no line with `pdf-worker/src/jpxdecode.mjs`), and each
is checked against a second reading, PyMuPDF's (MuPDF's own OpenJPEG build),
before it is kept. Re-run this, never copy a failing run's "got":

    apt-get install libopenjp2-tools jbig2dec && pip install pillow pymupdf
    python3 pdf-worker/test/fixtures/make-jpx-fixtures.py

The pictures are real ink: the committed `jbig2-scan-page.pdf` (a page of an
enacted ordinance) decoded by jbig2dec, cropped, and for colour a diagonal ramp
multiplied in (the ink is the publisher's, the colour is synthetic, and that is
said here rather than hidden). The streams are opj_compress's, over the options
a PDF's JPEG 2000 images use: both wavelets, every progression order, layers,
precincts, code-block sizes and modes, tiles, tile-parts, image and tile
offsets, SOP/EPH, POC, ROI, PLT/TLM, JP2 and bare codestreams.

Writes `jpx-variants.json` and `jpx-scan-page.pdf` (the page, grey, 1280x1680,
one irreversible JPEG 2000 image, the size class a scanner writes).
"""
import base64, hashlib, io, json, os, re, struct, subprocess, sys, tempfile
from PIL import Image, ImageChops
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
OPJ = subprocess.run(["opj_decompress", "-h"], capture_output=True, text=True).stdout
OPJ_VERSION = re.search(r"OpenJPEG version (\S+)", OPJ + subprocess.run(["opj_compress", "-h"], capture_output=True, text=True).stdout)

def opj_samples(data, ext):
    """opj_decompress's samples, interleaved, or (None, why)."""
    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, "in." + ext)
        open(src, "wb").write(data)
        r = subprocess.run(["opj_decompress", "-i", src, "-o", os.path.join(d, "o.png")], capture_output=True, text=True)
        outs = [f for f in os.listdir(d) if f.startswith("o")]
        if r.returncode != 0 or not outs:
            return None, (r.stderr + r.stdout).strip().splitlines()[-1:] or ["failed"]
        if len(outs) > 1:
            return None, [f"opj_decompress wrote {len(outs)} files (components of different sizes)"]
        im = Image.open(os.path.join(d, outs[0])); im.load()
        return (im.mode, im.size, im.tobytes()), None

def mupdf_samples(data):
    try:
        return pymupdf.Pixmap(data).samples
    except Exception:          # MuPDF will not read it either
        return None

def encode(img, args, ext):
    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, "in." + ("pgm" if img.mode == "L" else "ppm" if img.mode == "RGB" else "png"))
        img.save(src)
        out = os.path.join(d, "out." + ext)
        r = subprocess.run(["opj_compress", "-i", src, "-o", out, *args], capture_output=True, text=True)
        if r.returncode != 0: raise RuntimeError(f"opj_compress {args}: {r.stderr or r.stdout}")
        return open(out, "rb").read()

def main():
    # the page, from the committed JBIG2 fixture, through jbig2dec
    doc = pymupdf.open(os.path.join(HERE, "jbig2-scan-page.pdf"))
    xs = [x for x in range(1, doc.xref_length()) if "/JBIG2Decode" in doc.xref_object(x)]
    img_x = xs[0]
    g_x = int(re.search(r"/JBIG2Globals (\d+)", doc.xref_object(img_x)).group(1))
    with tempfile.TemporaryDirectory() as d:
        open(os.path.join(d, "g"), "wb").write(doc.xref_stream_raw(g_x))
        open(os.path.join(d, "p"), "wb").write(doc.xref_stream_raw(img_x))
        subprocess.run(["jbig2dec", "-q", "-e", "-t", "pbm", "-o", os.path.join(d, "o.pbm"), os.path.join(d, "g"), os.path.join(d, "p")], check=True)
        page = Image.open(os.path.join(d, "o.pbm")).convert("L")
    page.load()
    # a window dense with type, greyed by a light blur so every bit-plane carries information
    from PIL import ImageFilter
    soft = page.filter(ImageFilter.GaussianBlur(1.2))
    win = max(((x, y) for y in range(300, 2900, 150) for x in range(150, 2300, 150)),
              key=lambda p: -sum(soft.crop((p[0], p[1], p[0] + 97, p[1] + 61)).getdata()))
    grey = soft.crop((win[0], win[1], win[0] + 97, win[1] + 61))
    ramp = Image.new("RGB", grey.size)
    ramp.putdata([(255 - 2 * x, 70 + 3 * y, 40 + x + 2 * y) for y in range(grey.size[1]) for x in range(grey.size[0])])
    colour = ImageChops.multiply(grey.convert("RGB"), ramp)

    variants = []
    def keep(name, data, ext, features, expect="ok", note=""):
        v = {"name": name, "features": features, "expect": expect, "data_b64": base64.b64encode(data).decode(), "container": ext}
        if note: v["note"] = note
        ref, why = opj_samples(data, ext)
        if expect == "ok":
            assert ref is not None, f"{name}: opj_decompress refused it: {why}"
            mode, (w, h), px = ref
            mu = mupdf_samples(data)
            assert mu is not None and bytes(mu) == px, f"{name}: PyMuPDF's reading differs from opj_decompress's"
            v.update(width=w, height=h, comps=len(mode), opj_sha256=hashlib.sha256(px).hexdigest())
        else:
            v["opj_decompress"] = "refused" if ref is None else "decoded"
        variants.append(v)

    options = [
        ("5-3-levels-0", ["-n", "1"]), ("5-3-levels-2", ["-n", "3"]), ("5-3-levels-5", ["-n", "6"]),
        ("9-7-levels-2", ["-n", "3", "-I"]), ("9-7-levels-5", ["-n", "6", "-I"]),
        ("9-7-lossy-layers", ["-n", "4", "-I", "-r", "60,20,8,3"]), ("5-3-lossy-layers", ["-n", "4", "-r", "40,10,3"]),
        ("cblk-4x4", ["-n", "3", "-b", "4,4"]), ("cblk-8x64", ["-n", "3", "-b", "8,64"]), ("cblk-64x8", ["-n", "3", "-b", "64,8", "-I"]),
        ("precincts", ["-n", "3", "-c", "[32,32],[16,16],[8,8]", "-b", "4,4"]),
    ]
    for p in ("LRCP", "RLCP", "RPCL", "PCRL", "CPRL"):
        options.append((f"progression-{p}", ["-n", "3", "-c", "[32,32],[16,16]", "-b", "8,8", "-p", p, "-r", "30,5"]))
        options.append((f"progression-{p}-offsets-tiles", ["-d", "5,3", "-t", "40,30", "-T", "3,1", "-n", "3", "-c", "[16,16],[8,8]", "-b", "4,4", "-p", p]))
    for m, nm in ((1, "bypass"), (2, "reset"), (4, "termall"), (8, "vsc"), (16, "pterm"), (32, "segsym"), (63, "all")):
        options.append((f"mode-{nm}", ["-n", "3", "-b", "16,16", "-M", str(m), "-r", "30,5"]))
        options.append((f"mode-{nm}-9-7", ["-n", "3", "-b", "16,16", "-M", str(m), "-r", "30,5", "-I"]))
    options += [
        ("sop-eph", ["-SOP", "-EPH", "-n", "3", "-r", "30,5", "-c", "[32,32],[16,16]"]),
        ("tiles", ["-t", "40,30", "-n", "2"]), ("tiles-9-7", ["-t", "40,30", "-n", "2", "-I"]),
        ("tile-parts", ["-t", "40,30", "-n", "3", "-TP", "R"]),
        ("image-offset", ["-d", "3,5", "-n", "3"]), ("image-offset-9-7", ["-d", "3,5", "-n", "3", "-I"]),
        ("poc", ["-n", "3", "-r", "30,5", "-POC", "T0=0,0,1,4,3,RPCL/T0=0,0,2,4,3,LRCP"]),
        ("roi", ["-n", "3", "-ROI", "c=0,U=3"]), ("roi-9-7", ["-n", "3", "-I", "-ROI", "c=0,U=5"]),
        ("plt-tlm", ["-n", "3", "-PLT", "-TLM"]),
        ("no-colour-transform", ["-n", "3", "-I", "-mct", "0"]),
    ]
    for name, args in options:
        for label, img in (("grey", grey), ("rgb", colour)):
            if "-ROI" in args and label == "rgb": continue
            ext = "jp2" if label == "rgb" else "j2k"
            keep(f"{name}-{label}", encode(img, args, ext), ext, args)
    # small and odd-sized images, where a line is one or two samples long
    for (w, h) in ((1, 1), (1, 9), (9, 1), (3, 2), (2, 17)):
        for args in (["-n", "1"], ["-n", "2", "-d", "1,1"], ["-n", "2", "-d", "1,3", "-I"], ["-n", "2", "-d", "3,1", "-I"]):
            try: data = encode(grey.crop((10, 10, 10 + w, 10 + h)), args, "j2k")
            except RuntimeError: continue
            keep(f"tiny-{w}x{h}-{'-'.join(args[1:])}", data, "j2k", args)
    # the same picture from Pillow's writer (a different caller of OpenJPEG's encoder)
    for label, img, kw in (("pillow-lossless-grey", grey, {}), ("pillow-lossy-rgb", colour, {"quality_mode": "rates", "quality_layers": [30, 10], "irreversible": True})):
        buf = io.BytesIO(); img.save(buf, "JPEG2000", **kw)
        keep(label, buf.getvalue(), "jp2", ["Pillow"])

    # what is refused, and what is cut short
    base = encode(grey, ["-n", "3"], "j2k")
    rgb_jp2 = encode(colour, ["-n", "3"], "jp2")
    siz = base.index(b"\xff\x51")
    ht = bytearray(base); ht[siz + 4:siz + 6] = struct.pack(">H", 0x4000)
    keep("UNSUPPORTED:high-throughput coding", bytes(ht), "j2k", [], expect="UNSUPPORTED")
    p2 = bytearray(base); p2[siz + 4:siz + 6] = struct.pack(">H", 0x8000)
    keep("UNSUPPORTED:an extended capability", bytes(p2), "j2k", [], expect="UNSUPPORTED")
    def jp2_boxes(data):
        out, p = [], 0
        while p < len(data):
            n, t = struct.unpack(">I4s", data[p:p + 8]); out.append((t, data[p + 8:p + n])); p += n
        return out
    def jp2_join(bs): return b"".join(struct.pack(">I", len(b) + 8) + t + b for t, b in bs)
    bs = jp2_boxes(rgb_jp2)
    def with_header(extra_or_fn):
        out = []
        for t, b in bs:
            if t == b"jp2h":
                hb = jp2_boxes(b)
                hb = extra_or_fn(hb)
                b = jp2_join(hb)
            out.append((t, b))
        return jp2_join(out)
    pclr = struct.pack(">HB", 2, 1) + bytes([7]) + bytes([0, 255])
    keep("UNSUPPORTED:a JP2 palette", with_header(lambda hb: hb + [(b"pclr", pclr)]), "jp2", [], expect="UNSUPPORTED")
    keep("UNSUPPORTED:sYCC colour", with_header(lambda hb: [(t, (b[:3] + struct.pack(">I", 18)) if t == b"colr" else b) for t, b in hb]),
         "jp2", [], expect="UNSUPPORTED")
    keep("UNSUPPORTED_SAMPLES:16-bit samples", encode_raw(grey, 16, "u"), "j2k", [], expect="UNSUPPORTED_SAMPLES")
    keep("UNSUPPORTED_SAMPLES:signed samples", encode_raw(grey, 8, "s"), "j2k", [], expect="UNSUPPORTED_SAMPLES")
    keep("UNSUPPORTED_SAMPLES:4 components", encode(colour.convert("RGBA"), ["-n", "2"], "j2k"), "j2k", [], expect="UNSUPPORTED_SAMPLES")
    keep("UNSUPPORTED_SAMPLES:a sub-sampled component", encode_raw(colour, 8, "u", sub=True), "j2k", [], expect="UNSUPPORTED_SAMPLES")
    keep("TRUNCATED:the codestream cut in half", base[:len(base) // 2], "j2k", [], expect="TRUNCATED")
    keep("TRUNCATED:a JP2 file with no codestream box", jp2_join([(t, b) for t, b in bs if t != b"jp2c"]), "jp2", [], expect="TRUNCATED")
    keep("CORRUPT:neither a codestream nor a JP2 file", b"\x00\x01\x02\x03" * 16, "j2k", [], expect="CORRUPT")
    bad = bytearray(base); bad[siz + 30:siz + 34] = b"\x00\x00\x10\x00"   # XTOsiz past XOsiz
    keep("CORRUPT:a tile geometry the standard does not allow", bytes(bad), "j2k", [], expect="CORRUPT")

    json.dump({"provenance": f"opj_compress/opj_decompress (OpenJPEG {OPJ_VERSION.group(1) if OPJ_VERSION else '2.5.0'}), "
                             f"checked against PyMuPDF {pymupdf.__version__}; digests are sha256 of the interleaved samples",
               "variants": variants}, open(os.path.join(HERE, "jpx-variants.json"), "w"), indent=0)

    # the page, as a scanner writing JPEG 2000 would store it: grey, 1280x1680, 9/7
    big = soft.resize((1280, 1680), Image.LANCZOS)
    data = encode(big, ["-n", "6", "-I", "-r", "20"], "jp2")
    ref, why = opj_samples(data, "jp2")
    assert ref, why
    content = b"q 614 0 0 807 0 0 cm /Im0 Do Q"
    pdf = bytearray(b"%PDF-1.7\n%\xe2\xe3\xcf\xd3\n"); offs = []
    def put(body, stream=None):
        offs.append(len(pdf)); pdf.extend(b"%d 0 obj\n" % len(offs))
        pdf.extend(body if stream is None else body + b"\nstream\n" + stream + b"\nendstream")
        pdf.extend(b"\nendobj\n")
    put(b"<< /Type /Catalog /Pages 2 0 R >>")
    put(b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    put(b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 614 807] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>")
    put(b"<< /Length %d >>" % len(content), content)
    put(b"<< /Type /XObject /Subtype /Image /Width 1280 /Height 1680 /ColorSpace /DeviceGray /BitsPerComponent 8 "
        b"/Filter /JPXDecode /Length %d >>" % len(data), data)
    xr = len(pdf)
    pdf.extend(b"xref\n0 %d\n0000000000 65535 f \n" % (len(offs) + 1))
    for o in offs: pdf.extend(b"%010d 00000 n \n" % o)
    pdf.extend(b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(offs) + 1, xr))
    open(os.path.join(HERE, "jpx-scan-page.pdf"), "wb").write(pdf)
    print(json.dumps({"variants": len(variants), "ok": sum(v["expect"] == "ok" for v in variants),
                      "scan_page": {"jpx_bytes": len(data), "opj_sha256": hashlib.sha256(ref[2]).hexdigest(),
                                    "pdf_sha256": hashlib.sha256(pdf).hexdigest()}}, indent=1))

def encode_raw(img, bits, sign, sub=False):
    """opj_compress over raw samples, for what Pillow cannot write (16-bit, signed, sub-sampled)."""
    w, h = img.size
    comps = [img] if img.mode == "L" else list(img.split())
    raw = bytearray()
    dims = []
    for k, c in enumerate(comps):
        if sub and k > 0:
            c = c.resize(((w + 1) // 2, (h + 1) // 2)); dims.append("2x2")
        else: dims.append("1x1")
        vals = list(c.getdata())
        for v in vals:
            if bits == 16: raw += struct.pack(">H", v * 257)
            elif sign == "s": raw += struct.pack("b", v - 128)
            else: raw += bytes([v])
    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, "in.raw"); open(src, "wb").write(raw)
        out = os.path.join(d, "out.j2k")
        fmt = f"{w},{h},{len(comps)},{bits},{sign}@" + ":".join(dims)
        r = subprocess.run(["opj_compress", "-i", src, "-o", out, "-F", fmt, "-n", "2"], capture_output=True, text=True)
        if r.returncode != 0: raise RuntimeError(r.stderr or r.stdout)
        return open(out, "rb").read()

if __name__ == "__main__":
    main()
