# Test-side only: Pillow encodes a picture as another kind, and compares two pictures' pixels.
#   pictures.py encode <in> <out> <kind> [lossless]
#   pictures.py diff <a> <b>     -> JSON {a: [w, h], b: [w, h], mean}  (mean absolute difference per RGB sample, 0-255)
#   pictures.py turn <in> <out> <degrees>  (counter-clockwise, lossless PNG out)
import sys, json
from PIL import Image

cmd = sys.argv[1]
if cmd == 'encode':
    src, out, kind = sys.argv[2], sys.argv[3], sys.argv[4]
    im = Image.open(src).convert('RGB')
    if kind == 'jpeg':
        im.save(out, 'JPEG', quality=95)
    elif kind == 'webp':
        im.save(out, 'WEBP', lossless=True)
    elif kind == 'avif':
        im.save(out, 'AVIF', quality=95)
    elif kind == 'jp2':
        im.save(out, 'JPEG2000', irreversible=False)
    elif kind == 'tiff':
        im.save(out, 'TIFF', compression='tiff_deflate')
    elif kind == 'png':
        im.save(out, 'PNG')
    else:
        raise SystemExit('unknown kind ' + kind)
elif cmd == 'diff':
    a = Image.open(sys.argv[2]).convert('RGB')
    b = Image.open(sys.argv[3]).convert('RGB')
    out = {'a': [a.width, a.height], 'b': [b.width, b.height], 'mean': None}
    if a.size == b.size:
        da, db = a.tobytes(), b.tobytes()
        out['mean'] = sum(abs(x - y) for x, y in zip(da, db)) / len(da)
    print(json.dumps(out))
elif cmd == 'turn':
    Image.open(sys.argv[2]).convert('RGB').rotate(int(sys.argv[4]), expand=True).save(sys.argv[3], 'PNG')
