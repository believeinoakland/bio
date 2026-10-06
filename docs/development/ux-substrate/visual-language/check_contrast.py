#!/usr/bin/env python3
"""Check Civicsmith's colour tokens against WCAG 2.2 AA (DEC-99, DEC-138).

Reads palette.json beside this file; prints every pair with its ratio and exits 1 if any text
pair is below 4.5:1 or any graphic pair below 3:1, in either theme. Also checks that
civicsmith.css carries exactly the palette's values. Run: python3 check_contrast.py
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))

def lum(hexc):
    h = hexc.lstrip('#')
    def ch(v):
        v = int(v, 16) / 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(h[i:i+2]) for i in (0, 2, 4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)

def main():
    pal = json.load(open(os.path.join(HERE, 'palette.json')))
    fails = 0
    out = []
    for theme in ('light', 'dark'):
        t = pal[theme]
        for kind, need in (('text', 4.5), ('graphic', 3.0)):
            for fg, bg in pal['pairs'][kind]:
                r = ratio(t[fg], t[bg])
                ok = r >= need
                fails += not ok
                out.append(f"{theme:5} {kind:7} {fg:>15} on {bg:<14} {r:5.2f}  {'ok' if ok else 'FAIL (needs %.1f)' % need}")
    css = os.path.join(HERE, 'civicsmith.css')
    if os.path.exists(css):
        src = open(css).read()
        blocks = {'light': re.search(r':root\s*\{(.*?)\}', src, re.S).group(1),
                  'dark': re.search(r':root\[data-theme="dark"\][^{]*\{(.*?)\}', src, re.S).group(1)}
        for theme, body in blocks.items():
            found = dict(re.findall(r'--c-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})', body))
            for k, v in pal[theme].items():
                if found.get(k, '').upper() != v.upper():
                    fails += 1
                    out.append(f"{theme:5} css     --c-{k} is {found.get(k)!r}, palette.json says {v}")
    print('\n'.join(out))
    print(f"\n{'FAILED: %d' % fails if fails else 'All pairs meet WCAG 2.2 AA in both themes.'}")
    return 1 if fails else 0

if __name__ == '__main__':
    sys.exit(main())
