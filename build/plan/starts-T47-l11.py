# Writes L11's START bodies (T47) from the plan, the requirements marks, reading-sets.py and starts-T47-l11.json (K3134, after starts-T46-l11.py).
# Re-run at L11's START, after PR #33's head is merged into the tranche (K3127), so the measures and the commit are current:
#   python3 build/plan/starts-T47-l11.py build/plan/starts-T47-l11.json <commit of the PR #33 merge>
import re,json,subprocess,sys
plan=open('build/plan/current.md').read()
order=re.search(r'\*\*L11 merge order:\*\* (.*)',plan).group(1).rstrip('.')
pr33=sys.argv[2] if len(sys.argv)>2 else '<PR #33 merge commit>'
rs={}
for l in subprocess.run(['python3','build/plan/reading-sets.py'],capture_output=True,text=True).stdout.splitlines()[1:]:
    p=l.split()
    if p and p[0].isdigit(): rs[p[1]]=(int(p[0]),int(p[4])//1000,int(p[7]))
def entry(m):
    for l in plan.splitlines():
        mm=re.match(r'- \*\*(T47-\d+) · '+re.escape(m)+r'\*\*(?: \([^)]*\))? · (.*)',l)
        if mm: return mm.group(1),mm.group(2)
def marks(m):
    cur=None;out=[]
    for l in open(f'build/requirements/{m}.md'):
        a=re.match(r'- \*\*(R\d+)\*\*',l)
        if a: cur=a.group(1)
        if 'not yet met: T47' in l and cur and cur not in out: out.append(cur)
    return sorted(out,key=lambda r:int(r[1:]))
def body(m,v):
    t,e=entry(m); kb,pub,nu=rs[m]; mk=marks(m)
    s=f"Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, {m}: **{t} · {m}** · {e}\n"
    s+=f"Your requirements: `build/requirements/{m}.md` (read whole). Marked `*(not yet met: T47)*`: {', '.join(mk) if mk else 'none (your entry retires or re-states ids)'}; folded at K3062, K3100, K3104, K3114, K3122, K3127.\n"
    s+=f"Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START ({pr33}; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.\n"
    s+="BOB's notes for this job: "+(" ".join(v.get('notes',[])) or "none beyond your entry.")+"\n"
    if v.get('new'): s+="You are a new module: `modules.json` lists you with empty `paths` and `tests` (K1043). Name every file you add, code and tests, in your COMPLETE; BOB adds them before the ownership check. Build under `bio-plane/src/<module>/` and `bio-plane/test/m/<module>/` unless your requirements say otherwise.\n"
    else: s+="Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).\n"
    s+="Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.\n"
    s+="Inherited reds: the plan's \"Rules at the opening\" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133)"+(f"; yours to clear: {v['reds']}" if v.get('reds') else "; none is yours unless named in your entry")+".\n"
    s+="Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).\n"
    if kb>600: s+=f"Reading set (mechanics §17): measured at this START: {kb} KB with your tests (K2700; used public parts {pub} KB across {nu} modules, an upper bound), over the 600 KB limit. Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it (the later L11 jobs in the merge order that use your services), have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.\n"
    else: s+=f"Reading set (mechanics §17): measured at this START: {kb} KB with your tests, within the 600 KB limit: read it all whole.\n"
    s+="Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).\n"
    s+=f"L11 merge order: {order}. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).\n"
    open(f'build/plan/starts-T47/{m}.txt','w').write(s)
S=json.load(open(sys.argv[1]))
for m,v in S.items(): body(m,v)
print(len(S),'START bodies written')
