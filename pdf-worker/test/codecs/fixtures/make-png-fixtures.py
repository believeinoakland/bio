"""image-codecs R10 (N853b): the PNG fixtures `png.test.mjs` checks `pngdecode.mjs` against.

NOT the subject's output: every digest here is PILLOW's decode of the bytes
(Pillow's own PNG reader and zlib, which share no line of source with
`pdf-worker/src/pngdecode.mjs`). Re-run this, never copy a failing run's "got":

    pip install pillow==12.3.0
    curl -O http://www.schaik.com/pngsuite/PngSuite-2017jul19.tgz
    python3 pdf-worker/test/codecs/fixtures/make-png-fixtures.py PngSuite-2017jul19.tgz

The tarball must be the suite's 2017-07-19 release (sha256 checked below). Its files
are copied unchanged into `pngsuite/` beside this script (PngSuite's licence lets
anyone copy and distribute them; it is copied with them), and `png-variants.json`
records, for each, its sha256 and Pillow's samples' digest or the refusal this
module owes it.

THE REFERENCE (R10's words, each step Pillow's):
  - grey (colour types 0, 4) answers one component, every other type three;
  - transparency, an alpha channel or a tRNS chunk, is `Image.alpha_composite` over
    opaque white, then `convert("L")` (grey: its three equal channels give the
    same value) or `convert("RGB")`;
  - a sample under 8 bits is Pillow's unpacking (bit replication: "1" to 0/255,
    "L;2" by 85, "L;4" by 17), a 16-bit colour or alpha sample its high byte
    (Pillow's "RGB;16B", "LA;16B", "RGBA;16B");
  - a 16-bit grey image is opened as "I;16", whose `convert("L")` clips rather than
    reducing; its reference is the high byte of each of Pillow's samples.
WHERE PILLOW DEPARTS FROM THE STANDARD, said here rather than hidden, and why the
reference still stands: Pillow ignores a tRNS key on grey under 8 bits (it compares
the raw value with the scaled sample: tbbn0g04) and makes every pixel of a 16-bit
grey image with a tRNS key transparent (tbwn0g16). In both files the key is white,
so a pixel the standard calls transparent is white over white either way: the
reference is Pillow's samples without the key, which is also the standard's answer.
The constructed `trns-*` variants below carry keys that are NOT white, at 8 bits,
where Pillow applies the key as the standard does.
"""
import base64, hashlib, io, json, os, shutil, struct, sys, tarfile, zlib
import PIL
from PIL import Image, features

SUITE_SHA256 = "0294b244c95a8342c01b00010cf34abdcabc7c6a34fd0fe1bd963917537bfdc8"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "pngsuite")

sha = lambda b: hashlib.sha256(b).hexdigest()

def ihdr(b):
    w, h, depth, ct, _, _, il = struct.unpack(">IIBBBBB", b[16:29])
    return w, h, depth, ct, il

def reference(b):
    """Pillow's samples for R10, as (comps, width, height, digest)."""
    im = Image.open(io.BytesIO(b)); im.load()
    _, _, _, ct, _ = ihdr(b)
    grey = ct in (0, 4)
    if im.mode == "I;16":
        data = im.tobytes()                     # little-endian 16-bit samples
        return 1, im.size[0], im.size[1], sha(data[1::2])
    if im.mode in ("LA", "RGBA", "PA") or "transparency" in im.info:
        white = Image.new("RGBA", im.size, (255, 255, 255, 255))
        out = Image.alpha_composite(white, im.convert("RGBA")).convert("L" if grey else "RGB")
    else:
        out = im.convert("L" if grey else "RGB")
    return (1 if grey else 3), out.size[0], out.size[1], sha(out.tobytes())

def pillow_verdict(b):
    try:
        im = Image.open(io.BytesIO(b)); im.load()
        return f"decodes ({im.mode} {im.size[0]}x{im.size[1]})"
    except Exception as e:
        return f"refuses ({type(e).__name__}: {e})"

# What this module owes each damaged file of the suite (its `x` files), with why.
# These are R10's refusal codes, the module's own contract; Pillow's verdict is
# recorded beside each.
DAMAGED = {
    "xs1n0g01.png": ("NOT_A_PNG", "signature byte 1 is 0x10, not 0x89"),
    "xs2n0g01.png": ("NOT_A_PNG", "signature byte 2 is 'Q', not 'P'"),
    "xs4n0g01.png": ("NOT_A_PNG", "signature byte 4 is 'g', not 'G'"),
    "xs7n0g01.png": ("NOT_A_PNG", "signature byte 7 is 0x0A where 0x1A belongs"),
    "xcrn0g04.png": ("NOT_A_PNG", "the signature's line ends were rewritten (a CR added)"),
    "xlfn0g04.png": ("NOT_A_PNG", "the signature's line ends were rewritten (an LF added)"),
    "xhdn0g08.png": ("CORRUPT", "the IHDR chunk's CRC does not match"),
    "xc1n0g08.png": ("CORRUPT", "colour type 1 is not defined"),
    "xc9n2c08.png": ("CORRUPT", "colour type 9 is not defined"),
    "xd0n2c08.png": ("CORRUPT", "bit depth 0 is not defined"),
    "xd3n2c08.png": ("CORRUPT", "bit depth 3 is not defined"),
    "xd9n2c08.png": ("CORRUPT", "bit depth 99 is not defined"),
    "xdtn0g01.png": ("CORRUPT", "there is no IDAT chunk"),
    "xcsn0g01.png": ("CORRUPT", "the IDAT chunk's CRC does not match (Pillow does not check it and decodes the picture)"),
}

def constructed():
    """Pictures Pillow writes and Pillow decodes, for what the suite leaves thin:
    the composite's arithmetic over every (sample, alpha) pair, and tRNS keys that
    are not white."""
    v = []
    def add(name, im, note, **save):
        b = io.BytesIO(); im.save(b, "PNG", **save); data = b.getvalue()
        comps, w, h, digest = reference(data)
        v.append({"name": name, "note": note, "data_b64": base64.b64encode(data).decode(),
                  "width": w, "height": h, "comps": comps, "colour_type": ihdr(data)[3], "bit_depth": ihdr(data)[2],
                  "expect": "ok", "pillow_sha256": digest})
    rgba = Image.new("RGBA", (256, 256))
    rgba.putdata([(x, 255 - x, (x * 7 + y) & 255, y) for y in range(256) for x in range(256)])
    add("composite-rgba8-every-pair", rgba, "colour type 6: every sample value at every alpha (x the sample, y the alpha)")
    la = Image.new("LA", (256, 256))
    la.putdata([(x, y) for y in range(256) for x in range(256)])
    add("composite-la8-every-pair", la, "colour type 4: every grey value at every alpha")
    grey = Image.new("L", (64, 64))
    grey.putdata([(x * 4 + y) & 255 for y in range(64) for x in range(64)])
    add("trns-grey8-key-128", grey, "colour type 0 with a tRNS key of 128 (mid grey): those pixels white", transparency=128)
    rgb = Image.new("RGB", (64, 64))
    rgb.putdata([((x * 4) & 255, (y * 4) & 255, 30 if (x + y) % 3 else 200) for y in range(64) for x in range(64)])
    add("trns-rgb8-key-coloured", rgb, "colour type 2 with a tRNS key (0, 0, 200): those pixels white", transparency=(0, 0, 200))
    pal = Image.new("P", (64, 64))
    pal.putpalette([c for i in range(256) for c in (i, 255 - i, (i * 3) & 255)])
    pal.putdata([(x * 4 + y) & 255 for y in range(64) for x in range(64)])
    add("trns-palette8-alphas", pal, "colour type 3 with a tRNS alpha for each of the first 200 entries",
        transparency=bytes((i * 37) & 255 for i in range(200)))
    # A picture past one IDAT chunk, as a photograph is: Pillow's encoder starts a new
    # IDAT for each 64 KB it writes, and chooses each row's filter adaptively.
    big = Image.new("RGB", (640, 480))
    big.putdata([((x * 255) // 639, (y * 255) // 479, ((x * y) >> 4) & 255) for y in range(480) for x in range(640)])
    add("gradient-rgb8-several-idat", big, "colour type 2, 640x480, written by Pillow in several IDAT chunks", compress_level=1)
    return v

def main(tgz):
    if sha(open(tgz, "rb").read()) != SUITE_SHA256:
        sys.exit(f"{tgz} is not PngSuite 2017jul19 (sha256 {SUITE_SHA256})")
    if os.path.isdir(OUT_DIR): shutil.rmtree(OUT_DIR)
    os.makedirs(OUT_DIR)
    with tarfile.open(tgz) as t:
        for m in t.getmembers():
            if m.isfile() and os.path.basename(m.name) == m.name and (m.name.endswith(".png") or m.name.startswith("PngSuite.")):
                with open(os.path.join(OUT_DIR, m.name), "wb") as f: f.write(t.extractfile(m).read())
    suite = []
    for name in sorted(os.listdir(OUT_DIR)):
        if not name.endswith(".png"): continue
        b = open(os.path.join(OUT_DIR, name), "rb").read()
        e = {"name": name, "file_sha256": sha(b), "pillow": pillow_verdict(b)}
        if name in DAMAGED:
            e["expect"], e["why"] = DAMAGED[name]
        else:
            w, h, depth, ct, il = ihdr(b)
            e.update({"colour_type": ct, "bit_depth": depth})
            if il:
                e.update({"expect": "UNSUPPORTED", "feature": "interlaced"})
            else:
                comps, w, h, digest = reference(b)
                e.update({"expect": "ok", "width": w, "height": h, "comps": comps, "pillow_sha256": digest})
        suite.append(e)
    out = {
        "provenance": f"Pillow {PIL.__version__} (zlib {features.version('zlib')}) over PngSuite 2017jul19 "
                      f"(sha256 {SUITE_SHA256}), written by make-png-fixtures.py",
        "suite": suite,
        "variants": constructed(),
    }
    with open(os.path.join(HERE, "png-variants.json"), "w") as f:
        json.dump(out, f, indent=1)
        f.write("\n")
    ok = sum(1 for e in suite if e["expect"] == "ok")
    print(f"{len(suite)} suite files ({ok} decoded, {len(suite) - ok} refused), {len(out['variants'])} constructed")

if __name__ == "__main__":
    main(sys.argv[1])
