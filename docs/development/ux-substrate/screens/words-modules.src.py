# DEC-252 (BOB's N1075; T49 plan rule 6): the modules' own keyed word rows, adopted into the design's words file under
# their own keys, so every module reads every member-facing sentence by key. A key the design already has keeps the
# design's words (its own row is listed in words-modules.json's `differs` for the module to take up). Spellings are
# conformed to American English (DEC-221). Input: the dump of words-modules.dump.mjs; output: words-modules.json,
# which build_words.mjs reads.
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
dump = json.load(open(sys.argv[1]))
design = {}
def entries(o):
    if isinstance(o, list):
        for x in o:
            if isinstance(x, dict) and 'key' in x: yield x
            else: yield from entries(x)
    elif isinstance(o, dict):
        for v in o.values(): yield from entries(v)
# the design's own keys, before this file is added (words.json less any earlier adoption)
prev = set()
p = os.path.join(HERE, 'words-modules.json')
if os.path.exists(p): prev = {x['key'] for x in json.load(open(p))['adopted']}
for e in entries(json.load(open(os.path.join(HERE, 'words.json')))):
    if e['key'] not in prev: design[e['key']] = e['en']
US = [(r'\blabelled\b', 'labeled'), (r'\blabelling\b', 'labeling'), (r'\bauthorised\b', 'authorized'), (r'\bauthorising\b', 'authorizing'),
      (r'\borganisation', 'organization'), (r'\bOrganisation', 'Organization'), (r'\bjudgement', 'judgment'), (r'\blicences\b', 'licenses'),
      (r'\blicence\b', 'license'), (r'\brecognised\b', 'recognized'), (r'\bcentre\b', 'center'), (r'\bcolour', 'color'), (r'\bbehaviour', 'behavior')]
def us(s):
    for a, b in US: s = re.sub(a, b, s)
    return s
adopted, differs = [], []
for mod, r in dump.items():
    for x in r.get('rows', []):
        k = x['key']
        if k in design:
            if design[k] != x['en']: differs.append(dict(module=mod, key=k, module_en=x['en'], design_en=design[k]))
            continue
        adopted.append(dict(key=k, en=us(x['en']), protected=bool(x.get('prot')), module=mod))
json.dump(dict(adopted=adopted, differs=differs), open(p, 'w'), indent=1, ensure_ascii=False)
by = {}
for x in adopted: by[x['module']] = by.get(x['module'], 0) + 1
print(f'words-modules.json: {len(adopted)} adopted, {len(differs)} differ from the design; ' + ', '.join(f'{m} {n}' for m, n in by.items()))
