"""JPEG 2000 pages for image-codecs' `decodeJpx` past the whole-plane decode's
working set (N75, R4, R6): single-tile page sizes the decode refused before it
was made line-based, each with the picture an independent decoder reads.

    python3 make-jpx-pages.py > jpx-pages.json

Requires opj_compress/opj_decompress (OpenJPEG 2.5.0: `apt-get install
libopenjp2-tools`), Pillow and PyMuPDF. NOT the subject's output: every expected
picture is opj_decompress's decode of the stream, confirmed by PyMuPDF (MuPDF's
own OpenJPEG build) before it is kept; OpenJPEG shares no line with
`pdf-worker/src/jpxdecode.mjs`. Never copy a failing run's output into a digest.

The pictures are real ink: the committed `../../fixtures/jbig2-scan-page.pdf`
(2560x3360, a page of an enacted ordinance) as MuPDF reads it, softened by a
light blur so every bit-plane carries information, and for colour a synthetic
diagonal ramp multiplied in (the ink is the publisher's, the colour is not). The
rates keep each stream small; the decode's size is the page's, whatever the rate.
"""
import base64, hashlib, json, os, re, subprocess, tempfile
from PIL import Image, ImageChops, ImageFilter
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
def opj_version():
    """opj_compress -h names its version in some builds; Debian's does not, so ask its package."""
    m = re.search(r"OpenJPEG version (\S+)", subprocess.run(["opj_compress", "-h"], capture_output=True, text=True).stdout)
    if m: return m.group(1)
    q = subprocess.run(["dpkg-query", "-W", "-f", "${Version}", "libopenjp2-tools"], capture_output=True, text=True).stdout
    return re.match(r"[\d.]+", q).group(0)
VERSION = opj_version()


def page():
    doc = pymupdf.open(os.path.join(HERE, "..", "..", "fixtures", "jbig2-scan-page.pdf"))
    xref = doc[0].get_images()[0][0]
    ink = Image.frombytes("L", (2560, 3360), pymupdf.Pixmap(doc, xref).samples)
    return ink.filter(ImageFilter.GaussianBlur(1.2))


def colour(grey):
    w, h = grey.size
    ramp = Image.linear_gradient("L").resize((w, h))
    ramp = Image.merge("RGB", (ramp.point(lambda v: 255 - v // 2), ramp.transpose(Image.Transpose.ROTATE_90).resize((w, h)).point(lambda v: 90 + v // 2),
                               ramp.transpose(Image.Transpose.FLIP_TOP_BOTTOM).point(lambda v: 60 + v * 3 // 4)))
    return ImageChops.multiply(grey.convert("RGB"), ramp)


def encode(img, args):
    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, "in." + ("pgm" if img.mode == "L" else "ppm"))
        img.save(src)
        out = os.path.join(d, "out.j2k")
        subprocess.run(["opj_compress", "-i", src, "-o", out, *args], check=True, capture_output=True)
        return open(out, "rb").read()


def reference(data):
    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, "in.j2k"); open(src, "wb").write(data)
        subprocess.run(["opj_decompress", "-i", src, "-o", os.path.join(d, "o.png")], check=True, capture_output=True)
        im = Image.open(os.path.join(d, "o.png")); im.load()
    mu = pymupdf.Pixmap(data).samples
    assert bytes(mu) == im.tobytes(), "PyMuPDF's reading differs from opj_decompress's"
    return im


def main():
    grey = page()
    pages = [
        ("page-2550x3300-rgb-9-7", colour(grey.resize((2550, 3300), Image.LANCZOS)), ["-n", "6", "-I", "-r", "300"]),
        ("page-2550x3300-rgb-5-3", colour(grey.resize((2550, 3300), Image.LANCZOS)), ["-n", "6", "-r", "300"]),
        ("page-3500x4600-grey-9-7", grey.resize((3500, 4600), Image.LANCZOS), ["-n", "7", "-I", "-r", "200"]),
        ("page-2551x3301-rgb-9-7-offset-tall-blocks", colour(grey.resize((2551, 3301), Image.LANCZOS)),
         ["-n", "5", "-I", "-r", "300", "-d", "3,5", "-b", "16,256"]),
    ]
    out = []
    for name, img, args in pages:
        data = encode(img, args)
        ref = reference(data)
        w, h = ref.size
        out.append({"name": name, "args": args, "width": w, "height": h, "comps": len(ref.mode),
                    "data_b64": base64.b64encode(data).decode(), "opj_sha256": hashlib.sha256(ref.tobytes()).hexdigest()})
    print(json.dumps({"provenance": f"opj_compress/opj_decompress (OpenJPEG {VERSION}), checked against PyMuPDF {pymupdf.__version__}; "
                                    "digests are sha256 of the interleaved samples", "pages": out}, indent=0))


if __name__ == "__main__":
    main()
