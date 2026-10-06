#!/usr/bin/env python3
"""Build and check the screen registry and the Civicsmith wizard library (design phase step 5, DEC-139).

Writes registry.json and library.json from registry.src.py and library.src.py, then checks:
  the registry: every act is an op already declared in the requirements (op=...), a requirement function whose op is
    declared by its lowercased name, or an `owed:` act citing the ruling that owes it; anything else fails;
  the library: wizard-scripts R1, R2 and R12 as far as they can be judged without the plane: at least one step; a known
    screen; an act the screen lists, or none; `what` and `why` of 1-300 characters; a draft of one of R2's three kinds;
    no draft placed on an act the machine is refused (affordances R7); `start` is the first step's screen; `required`
    only in the Civicsmith library; a side trip names a script in the library; R12's warnings (one step; duplicates).
Usage: python3 check_library.py [--ref origin/tranche/T33]   (the git ref whose build/requirements is read)
Exit 1 on any failure.
"""
import json, os, re, subprocess, sys, tarfile, io
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], cwd=HERE, text=True).strip()

# affordances R7: the acts whose method refuses a machine by name; a script's draft is never placed on one (R12)
MACHINE_REFUSALS = {'release', 'conclude', 'withdrawconclusion', 'reopen', 'publish', 'inquirydivide', 'inquiryground',
                    'actionmove', 'actioncorrespond', 'actionlaws', 'actionrisktier', 'versionaccept', 'versionreject',
                    'versionconsider', 'versionrevert', 'versionhide', 'versioncurrent', 'contradictionresolve'}
MACHINE_DRAFTS = {'whatchangedpropose', 'escalationreasondraft'}  # wizard-scripts R13

def op_universe(ref):
    try:
        data = subprocess.check_output(['git', 'archive', ref, 'build/requirements'], cwd=ROOT)
    except subprocess.CalledProcessError:
        ref = 'HEAD'
        data = subprocess.check_output(['git', 'archive', ref, 'build/requirements'], cwd=ROOT)
    declared, functions = {}, {}
    with tarfile.open(fileobj=io.BytesIO(data)) as t:
        for m in t.getmembers():
            if not m.name.endswith('.md'): continue
            mod = os.path.basename(m.name)[:-3]
            txt = t.extractfile(m).read().decode('utf-8', 'replace')
            for o in re.findall(r'op=([a-z]+)', txt): declared.setdefault(o, set()).add(mod)
            for f in re.findall(r'\b([a-z][a-zA-Z0-9]+)\(\{', txt): functions.setdefault(f.lower(), set()).add(mod)
    return ref, declared, functions

def load(src, name):
    g = {}
    exec(compile(open(os.path.join(HERE, src)).read(), src, 'exec'), g)
    return g[name]

def main():
    ref = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else 'origin/tranche/T33'
    ref, declared, functions = op_universe(ref)
    screens, lib = load('registry.src.py', 'S'), load('library.src.py', 'L')
    fails, warns, owed = [], [], {}
    acts_of, kinds = {}, {'declared': 0, 'function': 0, 'owed': 0}
    for s in screens:
        acts_of[s['id']] = {a['op'] for a in s['acts']}
        for a in s['acts']:
            op = a['op']
            if op.startswith('owed:'):
                if not re.search(r'\b(DEC|K)-?\d+', op): fails.append(f"registry {s['id']}: {op} names no ruling")
                kinds['owed'] += 1; owed.setdefault(op, set()).add(s['id']); a['status'] = 'owed'
            elif op in declared: kinds['declared'] += 1; a['status'] = 'declared'; a['modules'] = sorted(declared[op])
            elif op in functions: kinds['function'] += 1; a['status'] = 'function'; a['modules'] = sorted(functions[op])
            else: fails.append(f"registry {s['id']}: act {op!r} is no op or requirement function at {ref}")
    if len({s['id'] for s in screens}) != len(screens): fails.append('registry: duplicate screen id')
    names = {w['name'] for w in lib}
    seen_lists = {}
    for w in lib:
        steps = w['versions'][0]['steps']
        tag = f"wizard {w['name']!r}"
        if not steps: fails.append(f'{tag}: WIZARD_NO_STEPS'); continue
        if len(steps) == 1: warns.append(f'{tag}: WIZARD_TRIVIAL')
        if w['start'] != steps[0]['screen']: fails.append(f"{tag}: start {w['start']!r} is not its first step's screen")
        if w['required'] and w['origin'] != 'civicsmith': fails.append(f'{tag}: required outside the Civicsmith library')
        if not 1 <= len(w['name']) <= 200: fails.append(f'{tag}: WIZARD_NAME_REFUSED')
        pairs = tuple((st['screen'], st['act']) for st in steps)
        if pairs in seen_lists: warns.append(f"{tag}: WIZARD_DUPLICATE of {seen_lists[pairs]!r}")
        seen_lists[pairs] = w['name']
        for i, st in enumerate(steps, 1):
            at = f'{tag} step {i}'
            if st['screen'] not in acts_of: fails.append(f"{at}: WIZARD_SCREEN_UNKNOWN {st['screen']!r}"); continue
            if st['act'] is not None and st['act'] not in acts_of[st['screen']]: fails.append(f"{at}: WIZARD_ACT_UNKNOWN {st['act']!r} on {st['screen']!r}")
            for k in ('what', 'why'):
                if not 1 <= len(st[k]) <= 300: fails.append(f'{at}: {k} is {len(st[k])} characters (1-300)')
            if not st['why'].strip(): fails.append(f'{at}: WIZARD_STEP_NO_WHY')
            d = st.get('draft')
            if d is not None:
                if len(d) != 1 or next(iter(d)) not in ('text', 'template', 'machine'): fails.append(f'{at}: WIZARD_DRAFT_REFUSED {d}')
                elif 'text' in d and len(d['text']) > 4000: fails.append(f'{at}: draft text over 4,000 characters')
                elif 'machine' in d and d['machine'] not in MACHINE_DRAFTS: fails.append(f'{at}: WIZARD_DRAFT_REFUSED machine {d["machine"]!r}')
                act = (st['act'] or '')
                if act in MACHINE_REFUSALS and not ('machine' in d and d['machine'] in MACHINE_DRAFTS): fails.append(f'{at}: WIZARD_STEP_CONCLUDES on {act!r}')
            if st.get('via') and st['via'] not in names: fails.append(f"{at}: side trip to unknown wizard {st['via']!r}")
            if st['act'] and st['act'].startswith('owed:'): owed.setdefault(st['act'], set()).add('wizard: ' + w['name'])
    json.dump({'_note': 'GENERATED by check_library.py from registry.src.py (DEC-139). The screen registry wizard-scripts R13 registers: '
               'each act is declared (an op), function (a requirement function whose op BOB declares by its lowercased name) or owed (a ruling owes it).',
               'checkedAgainst': ref, 'screens': screens}, open(os.path.join(HERE, 'registry.json'), 'w'), indent=1, ensure_ascii=False)
    json.dump({'_note': 'GENERATED by check_library.py from library.src.py (DEC-139). The Civicsmith wizard library (DEC-121 (9)); '
               'each script in wizard-scripts R1/R2 shape; `via` (a side trip) and `journeys`/`note` are owed additions to R2 and design notes.',
               'scripts': lib}, open(os.path.join(HERE, 'library.json'), 'w'), indent=1, ensure_ascii=False)
    print(f"checked against {ref}: {len(screens)} screens, {sum(len(s['acts']) for s in screens)} acts "
          f"({kinds['declared']} declared ops, {kinds['function']} requirement functions, {kinds['owed']} owed); "
          f"{len(lib)} wizards, {sum(len(w['versions'][0]['steps']) for w in lib)} steps, {sum(w['required'] for w in lib)} required")
    for o, where in sorted(owed.items()): print(f'  owed: {o}  ({", ".join(sorted(where))})')
    for x in warns: print('  warning:', x)
    for x in fails: print('  FAIL:', x)
    print('FAILED' if fails else 'All checks pass.')
    return 1 if fails else 0

if __name__ == '__main__':
    sys.exit(main())
