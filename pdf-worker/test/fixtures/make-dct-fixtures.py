"""D-320: the JPEG fixtures `pagepixels.test.mjs` checks `dctdecode.mjs` against.

NOT the subject's output: every digest here is PILLOW's decode of the bytes
(Pillow reaches libjpeg-turbo, which shares no line of source with
`pdf-worker/src/dctdecode.mjs`). Re-run this, never copy a failing run's "got":

    pip install pillow==11.3.0 pypdf && apt-get install libjpeg-turbo-progs
    python3 pdf-worker/test/fixtures/make-dct-fixtures.py <exhibit.pdf>

`<exhibit.pdf>` is Oakland Legistar attachment 15721260 (View.ashx?M=F&ID=15721260),
sha256 edf19669…f83c when fetched 2026-09-25. Its page 4 (index 3) is a 3300x2550
`DCTDecode` scan at `/Rotate 270`, 4:2:0 with restart markers; the variants are
CROPS of that scan re-encoded, so their pixels are real ink rather than a gradient.

Writes `dct-variants.json` (the small variants, base64) and `scan-dct-page.pdf`
(the page's EXACT DCT stream, byte for byte, in a minimal one-page document with a
real xref and `/Rotate 270` preserved — the CCITT fixture's construction).
"""
import base64, hashlib, io, json, subprocess, sys, tempfile, os
import pypdf, PIL
from PIL import Image, features

ROT = {0: None, 90: Image.Transpose.ROTATE_270, 180: Image.Transpose.ROTATE_180,
       270: Image.Transpose.ROTATE_90}   # PDF /Rotate is CLOCKWISE; PIL's constants are counter-clockwise

def pillow_digest(jpeg, rotate=0):
    im = Image.open(io.BytesIO(jpeg)); im.load()
    if ROT[rotate % 360]: im = im.transpose(ROT[rotate % 360])
    return im.mode, im.size, hashlib.sha256(im.tobytes()).hexdigest()

def cjpeg(img, *args):
    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, "in.ppm" if img.mode == "RGB" else "in.pgm")
        img.save(src)
        return subprocess.run(["cjpeg", *args, src], check=True, capture_output=True).stdout

def pil(img, **kw):
    b = io.BytesIO(); img.save(b, "JPEG", **kw); return b.getvalue()

r = pypdf.PdfReader(sys.argv[1])
page = r.pages[3]
im0 = page["/Resources"]["/XObject"]["/Im0"].get_object()
assert im0["/Filter"] == "/DCTDecode"
raw = im0._data
scan = Image.open(io.BytesIO(raw)); scan.load()
# 63x47: odd both ways. The window is the one with the most INK in the scan
# (highest luminance standard deviation over a 63x47 grid, 92.2) — an earlier
# draft cropped blank paper and every variant hashed alike, which proves nothing.
ink = scan.crop((2772, 658, 2835, 705))
grey = ink.convert("L")
# The scan is grey ink on paper, so its chroma is nearly flat and would exercise
# no upsampling filter. A diagonal colour ramp is MULTIPLIED in: the ink is the
# publisher's, the colour is synthetic, and that is said here rather than hidden.
ramp = Image.new("RGB", ink.size)
ramp.putdata([(255 - 3 * x, 80 + 3 * y, 40 + 2 * x + 2 * y) for y in range(ink.size[1]) for x in range(ink.size[0])])
from PIL import ImageChops
crop = ImageChops.multiply(ink, ramp)

variants = [
  ("grey-baseline",          pil(grey, quality=85), 0, "ok"),
  ("rgb-444",                pil(crop, quality=90, subsampling="4:4:4"), 0, "ok"),
  ("rgb-422-h2v1",           pil(crop, quality=90, subsampling="4:2:2"), 0, "ok"),
  ("rgb-420-h2v2",           pil(crop, quality=90, subsampling="4:2:0"), 0, "ok"),
  ("rgb-420-rotate90",       pil(crop, quality=90, subsampling="4:2:0"), 90, "ok"),
  ("rgb-420-rotate180",      pil(crop, quality=90, subsampling="4:2:0"), 180, "ok"),
  ("rgb-420-rotate270",      pil(crop, quality=90, subsampling="4:2:0"), 270, "ok"),
  ("grey-rotate270",         pil(grey, quality=85), 270, "ok"),
  ("rgb-h1v2-cjpeg",         cjpeg(crop, "-sample", "1x2,1x1,1x1"), 0, "ok"),
  ("rgb-420-restart-cjpeg",  cjpeg(crop, "-restart", "1B"), 0, "ok"),
  ("rgb-adobe-no-transform", cjpeg(crop, "-rgb"), 0, "ok"),
  ("grey-optimized-cjpeg",   cjpeg(grey, "-optimize", "-quality", "40"), 0, "ok"),
  ("refuse-progressive",     pil(crop, quality=90, progressive=True), 0, "UNSUPPORTED_PROCESS"),
  ("refuse-arithmetic",      cjpeg(crop, "-arithmetic"), 0, "UNSUPPORTED_PROCESS"),
  ("refuse-cmyk",            pil(crop.convert("CMYK"), quality=90), 0, "UNSUPPORTED_COMPONENTS"),
]
full = pil(crop, quality=90, subsampling="4:2:0")
variants.append(("refuse-truncated", full[: len(full) // 2] + b"\xff\xd9", 0, "TRUNCATED"))

out = {
  "provenance": f"Pillow {PIL.__version__} (libjpeg-turbo {features.version('libjpeg_turbo')}), "
                f"pypdf {pypdf.__version__}, cjpeg from libjpeg-turbo-progs; digests are Pillow's "
                f"decode rotated CLOCKWISE by `rotate`, sha256 over Image.tobytes()",
  "variants": [],
}
for name, jpeg, rot, expect in variants:
  v = {"name": name, "rotate": rot, "expect": expect, "jpeg_b64": base64.b64encode(jpeg).decode()}
  if expect == "ok":
    mode, size, dig = pillow_digest(jpeg, rot)
    v.update(mode=mode, width=size[0], height=size[1], pillow_sha256=dig)
  out["variants"].append(v)
here = os.path.dirname(os.path.abspath(__file__))
json.dump(out, open(os.path.join(here, "dct-variants.json"), "w"), indent=1)

# The page itself: the exact stream, the page's own /Rotate and MediaBox.
mb = [float(x) for x in page.mediabox]
objs = [
  b"<< /Type /Catalog /Pages 2 0 R >>",
  b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  ("<< /Type /Page /Parent 2 0 R /MediaBox [%g %g %g %g] /Rotate 270 "
   "/Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>" % tuple(mb)).encode(),
]
content = page.get_contents().get_data()
pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"); offs = []
def put(body, stream=None, head=None):
  offs.append(len(pdf)); n = len(offs)
  pdf.extend(b"%d 0 obj\n" % n)
  if stream is None: pdf.extend(body + b"\n")
  else: pdf.extend(head + b"\nstream\n" + stream + b"\nendstream\n")
  pdf.extend(b"endobj\n")
for o in objs: put(o)
put(None, content, b"<< /Length %d >>" % len(content))
put(None, raw, b"<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace /DeviceRGB "
               b"/BitsPerComponent 8 /Filter /DCTDecode /Length %d >>" % (im0["/Width"], im0["/Height"], len(raw)))
x = len(pdf)
pdf.extend(b"xref\n0 %d\n0000000000 65535 f \n" % (len(offs) + 1))
for o in offs: pdf.extend(b"%010d 00000 n \n" % o)
pdf.extend(b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(offs) + 1, x))
open(os.path.join(here, "scan-dct-page.pdf"), "wb").write(pdf)
mode, size, dig = pillow_digest(raw, 270)
print(json.dumps({"page_stream_bytes": len(raw), "stream_sha256": hashlib.sha256(raw).hexdigest(),
                  "upright": {"mode": mode, "size": size, "pillow_sha256": dig},
                  "unrotated_pillow_sha256": pillow_digest(raw, 0)[2],
                  "content": content.decode("latin1"), "mediabox": mb,
                  "provenance": out["provenance"]}, indent=1))
for v in out["variants"]: print(v["name"], v["expect"], v.get("pillow_sha256", "")[:16], len(v["jpeg_b64"]))
