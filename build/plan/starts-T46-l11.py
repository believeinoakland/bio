# Writes L11's START bodies (K2975) from the plan, the requirements marks, reading-sets.py and starts-T46-l11.json; re-run at L11's START so the measures are current: python3 build/plan/starts-T46-l11.py build/plan/starts-T46-l11.json
import re,json,subprocess,sys
plan=open('build/plan/current.md').read()
order="wizard-scripts, op-grades, affordances, action-producers, notice-producers, setup-words, instance-setup, setup-page (after instance-setup, doubt 14), op-declarations, answer-envelope, interface-assets, interface-shell, screens-settings, screens-intake, screens-daily, screens-inquiry, control-plane, installer, stewards, plane last"
rs={}
for l in subprocess.run(['python3','build/plan/reading-sets.py'],capture_output=True,text=True).stdout.splitlines()[1:]:
    p=l.split()
    if not p[0].isdigit(): continue
    rs[p[1]]=(int(p[0]),int(p[4])//1000,int(p[7]))
def entry(m):
    for l in plan.splitlines():
        mm=re.match(r'- \*\*(T46-\d+) · '+re.escape(m)+r'\*\*(?: \(new\))? · (.*)',l)
        if mm: return mm.group(1),mm.group(2)
def marks(m):
    cur=None;out=[]
    for l in open(f'build/requirements/{m}.md'):
        a=re.match(r'- \*\*(R\d+)\*\*',l)
        if a: cur=a.group(1)
        if 'not yet met: T46' in l and cur and cur not in out: out.append(cur)
    return sorted(out,key=lambda r:int(r[1:]))
def body(m,special,new=False):
    t,e=entry(m); kb,pub,nu=rs[m]
    s=f"Depth 2. Your entry: `build/plan/current.md` (T46), layer 11, {m}: {t} · {e}\n"
    s+=f"Your requirements: `build/requirements/{m}.md` (read whole). Marked `*(not yet met: T46)*`: {', '.join(marks(m))} (folded K2960, reviewed). The sources the entry names (interface = `build/plan/draft-T46-interface.md`, trial = `build/plan/draft-T46-trial.md`, study = `build/plan/study-T46-assistant.md`; words.json, registry.json, library.json and `mock-acts.js` on `main` @ 3f40899950, which `main` still is) are read for the sections named.\n"
    for x in special: s+=x+"\n"
    if new: s+="You are a new module: `modules.json` lists you with empty `paths` and `tests` (K1043). Name every file you add, code and tests, in your COMPLETE; BOB adds them before the ownership check. Build under `bio-plane/src/<module>/` and `bio-plane/test/m/<module>/` unless your requirements say otherwise.\n"
    else: s+="Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).\n"
    s+="Every new id needs an explicit test naming it (K874: an id older tests already name reads green wrongly); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.\n"
    s+="Inherited reds: the plan's \"Rules at the opening\" rule 5 as it stands at your START, and those named in K2924–K2974 (with L9's and L10's merge rulings as they land); none is yours unless named here.\n"
    s+="Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).\n"
    if kb>600:
        s+=f"Reading set (mechanics §17): measured at this START: {kb} KB with your tests (K2700; used public parts {pub} KB across {nu} modules, an upper bound), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entries and what follows them (the later L11 jobs in the merge order below that use your services), have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.\n"
    else:
        s+=f"Reading set (mechanics §17): measured at this START: {kb} KB with your tests, within the 600 KB limit: read it all whole.\n"
    s+="Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).\n"
    s+=f"Merge order in L11: {order}. A provider merges before its users; a job that uses an L11 job's new service merges `tranche/T46` into its branch when BOB announces that merge (a CHANGE); each that uses no unmerged L11 job may merge as soon as it is complete.\n"
    open(f'build/plan/starts-T46/{m}.txt','w').write(s)
S=json.load(open(sys.argv[1]))
for m,v in S.items(): body(m,v.get('special',[]),v.get('new',False))
