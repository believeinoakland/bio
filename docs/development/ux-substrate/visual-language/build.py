#!/usr/bin/env python3
"""Build civicsmith.css from palette.json (colour tokens) and components.css (DEC-138), then check contrast.
Run from anywhere: python3 docs/development/ux-substrate/visual-language/build.py"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
pal = json.load(open(os.path.join(HERE, 'palette.json')))
def block(t): return '\n'.join(f'  --c-{k}: {v};' for k, v in pal[t].items())
HEAD = open(os.path.join(HERE, 'tokens.head.css')).read()
css = HEAD.replace('/*@LIGHT@*/', block('light')).replace('/*@DARK@*/', block('dark'))
css += open(os.path.join(HERE, 'components.css')).read()
open(os.path.join(HERE, 'civicsmith.css'), 'w').write(css)
sys.exit(subprocess.call([sys.executable, os.path.join(HERE, 'check_contrast.py')], stdout=subprocess.DEVNULL) or 0)
