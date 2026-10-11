"""image-codecs R1, R6, R11 (T44, N868): JPEG fixtures at the sizes where the
strip-wise decode has edges the 63x47 crops of `../../fixtures/dct-variants.json`
never reach: images one or two chroma samples wide (libjpeg's plain replication
instead of its fancy filter), one row tall, one MCU row tall, a height ending
inside an MCU row and exactly on one, and restart intervals of one block and of
one MCU row.

NOT the subject's output: every digest is PILLOW's decode of the bytes (Pillow
reaches libjpeg-turbo, which shares no line with `pdf-worker/src/dctdecode.mjs`).
Re-run this, never copy a failing run's "got":

    pip install pillow==12.3.0
    python3 pdf-worker/test/codecs/fixtures/make-dct-edges.py

The pictures are synthetic and say so: a diagonal colour ramp with a seeded
pattern of sharp marks, so chroma varies between neighbouring samples and every
upsampling filter's arithmetic shows in the result. Writes `dct-edges.json`.
"""
import base64, hashlib, io, json, os, random
import PIL
from PIL import Image, features

HERE = os.path.dirname(os.path.abspath(__file__))
SUB = {"4:4:4": 0, "4:2:2": 1, "4:2:0": 2}

def picture(w, h, seed):
    random.seed(seed)
    im = Image.new("RGB", (w, h))
    px = [((x * 37 + y * 11) % 256, (200 - x * 13 + y * 29) % 256, (40 + x * 7 + y * 53) % 256) for y in range(h) for x in range(w)]
    for _ in range(max(1, w * h // 6)):
        i = random.randrange(w * h)
        px[i] = tuple(random.randrange(256) for _ in range(3))
    im.putdata(px)
    return im

def jpeg(im, **kw):
    b = io.BytesIO(); im.save(b, "JPEG", quality=92, **kw); return b.getvalue()

def reference(data):
    im = Image.open(io.BytesIO(data)); im.load()
    return im.mode, im.size, hashlib.sha256(im.tobytes()).hexdigest()

SIZES = [(1, 1), (2, 3), (3, 17), (4, 16), (5, 33), (17, 1), (33, 15), (40, 49), (24, 32)]
variants = []
for k, (w, h) in enumerate(SIZES):
    im = picture(w, h, k)
    cases = [(f"rgb-{s}", jpeg(im, subsampling=SUB[s])) for s in SUB] + [("grey", jpeg(im.convert("L")))]
    for label, data in cases:
        mode, size, digest = reference(data)
        variants.append({"name": f"{w}x{h}-{label}", "jpeg_b64": base64.b64encode(data).decode(),
                         "mode": mode, "width": size[0], "height": size[1], "pillow_sha256": digest})
im = picture(40, 49, 99)
for label, kw in [("rgb-4:2:0-restart-1-block", {"subsampling": 2, "restart_marker_blocks": 1}),
                  ("rgb-4:2:2-restart-1-row", {"subsampling": 1, "restart_marker_rows": 1}),
                  ("grey-restart-1-block", {"restart_marker_blocks": 1})]:
    data = jpeg(im.convert("L") if label.startswith("grey") else im, **kw)
    assert b"\xff\xdd" in data, f"{label}: no DRI written"
    mode, size, digest = reference(data)
    variants.append({"name": f"40x49-{label}", "jpeg_b64": base64.b64encode(data).decode(),
                     "mode": mode, "width": size[0], "height": size[1], "pillow_sha256": digest})

out = {"provenance": f"Pillow {PIL.__version__} (libjpeg-turbo {features.version('libjpeg_turbo')}), written by "
                     "make-dct-edges.py; digests are sha256 over Pillow's Image.tobytes() of each file, unrotated",
       "variants": variants}
with open(os.path.join(HERE, "dct-edges.json"), "w") as f:
    json.dump(out, f, indent=1)
    f.write("\n")
print(f"{len(variants)} variants")
