import json, html, re, os
S = "/tmp/claude-0/-home-user-bio/c4522ba1-57f2-5222-b1d8-fe77a0d83037/scratchpad/"
d = json.load(open(S + "ux-substrate-v2.json"))
x = json.load(open(S + "ux-experience.json")) if os.path.exists(S + "ux-experience.json") else {}
e = lambda s: html.escape(", ".join(map(str, s)) if isinstance(s, list) else str(s if s is not None else ""), quote=True)
C = {c["id"]: c for c in d["constructs"]}
LAYERS = {2: "Record and authority", 3: "Intake and provenance", 4: "Content", 5: "Meaning, bias and retrieval",
          6: "Inquiry and the assistant", 7: "Understanding", 8: "Publication", 9: "Action", 10: "Operations",
          11: "Interface and distribution"}
MAT = {"built": ("built", "Built"), "built, gaps": ("gaps", "Built, with gaps"),
       "specified, not built": ("spec", "Specified, not built"), "beyond MVP": ("beyond", "Beyond MVP")}
RUNG_ORDER = ["irreversible", "attested", "terminal", "reasoned", "reversible", "undetermined", "off-ladder"]
RUNG_WORD = {"irreversible": "Cannot be undone", "attested": "Signed, on the record", "terminal": "Ends something",
             "reasoned": "Needs a stated reason", "reversible": "Can be undone", "undetermined": "Weight not yet set",
             "off-ladder": "Not a record act"}

SUPP = [
 ("document","reading","is read into","extraction Purpose"),
 ("knock","document","may become (not yet designed)","capture R30-R32; Intake Doctrine §2a"),
 ("lead","inquiry","points where a question could look","observation-log R14-R21; queue R18"),
 ("contradiction","passage","flags two that may conflict","contradiction Purpose, R1-R16"),
 ("bias-set","bias-debt","leaves, when its lens changes","bias R33-R43"),
 ("bias-debt","case","hunch debt must be cleared before","case-authoring R12; strength R5"),
 ("aspiration-goal","objective","is pursued through","intent Purpose, R1-R14"),
 ("objective","queue-item","a shortfall becomes","intent R15-R18"),
 ("determination","consequence","a breach may record","consequences Purpose"),
 ("determination","escalation","a nonconformance may start","escalation Purpose"),
 ("action","filing","is prepared as","filings Purpose"),
 ("monitoring","action","watches the deadlines of","monitoring Purpose"),
 ("monitoring","document","checks watched","monitoring Purpose"),
 ("ai-run","leg","finds and proposes","ai-runs Purpose; AI Roles §2-§3"),
 ("ai-run","inquiry","works over","ai-runs Purpose"),
 ("reevaluation","queue-item","arrives as","queue R1; reevaluation Purpose"),
 ("reevaluation","inquiry","names what changed under","reevaluation Purpose"),
 ("review-copy","case","is a private draft of","review Purpose"),
 ("credentials","member","are held by","membership R25-R30"),
 ("credentials","ai-run","let work on the group's behalf","membership R25-R30"),
]
have = {(r["from"], r["to"]) for r in d["relationships"]}
for a, b, v, sr in SUPP:
    if (a, b) not in have and a in C and b in C:
        d["relationships"].append({"from": a, "to": b, "verb": v, "cardinality": "", "src": sr + " (from the definition)"})

def mid(i): return re.sub(r"[^A-Za-z0-9]", "_", i)
def ml(s): return str(s).replace('"', "'").replace("(", "").replace(")", "").replace("[", "").replace("]", "")
def short(i): return C[i]["name"].split(" (")[0] if i in C else i
def src(s): return f'<span class="src">{e(s)}</span>' if s else ""
def basis(b): return f'<span class="pill {"fixed" if b == "fixed" else "open"}">{"Fixed" if b == "fixed" else "Open"}</span>' if b else ""


def bl(v, pills=True):
    """A field that is a string, a list of strings, or a list of {text, basis, src}."""
    if v is None or v == "" or v == []: return ""
    if isinstance(v, str): return e(v)
    if isinstance(v, dict) and "text" not in v:
        return '<ul class="bl">' + "".join(f'<li><b>{e(k[:1].upper() + k[1:])}:</b> {bl(val, pills)}</li>' for k, val in v.items()) + "</ul>"
    if isinstance(v, dict): v = [v]
    items = []
    for it in v:
        if isinstance(it, dict):
            t = it.get("text") or it.get("name") or it.get("act") or json.dumps(it)
            items.append(f'<li>{e(t)} {basis(it.get("basis")) if pills else ""} {src(it.get("src"))}</li>')
        else:
            items.append(f"<li>{e(it)}</li>")
    return '<ul class="bl">' + "".join(items) + "</ul>"

def focused(ids, direction="TB"):
    ids = [i for i in ids if i in C]
    L = [f"flowchart {direction}"]
    for i in ids:
        L.append(f'  {mid(i)}["{ml(short(i))}"]:::{MAT.get(C[i]["maturity"], ("gaps",))[0]}')
    for r in d["relationships"]:
        if r["from"] in ids and r["to"] in ids:
            L.append(f'  {mid(r["from"])} -->|{ml(r["verb"])}| {mid(r["to"])}')
    L += ["  classDef built fill:#dcefe4,stroke:#2f7a52,color:#13301f",
          "  classDef gaps fill:#f6ead0,stroke:#a8741a,color:#3a2806",
          "  classDef spec fill:#eceef1,stroke:#6b7280,stroke-dasharray:4 3,color:#262b33"]
    return "\n".join(L)

GROUPS = [
 ("How material becomes evidence", "Documents enter with their provenance, are read, and their passages become what a question can cite. Members can add their own firsthand observations. The record keeps track of who looked where and what they found.",
  ["document", "knock", "firsthand-observation", "capture-request", "reading", "passage", "entity", "connection", "progression", "observation", "lead", "leg", "inquiry"]),
 ("From a question to a published case", "A question rests on supports. A project accepts one account of that support and concludes the question; the concluded question is a finding. Strength and declared bias weigh it. Findings are published as a case, in editions.",
  ["inquiry", "leg", "basis-version", "strength", "bias-set", "bias-debt", "contradiction", "project", "case", "review-copy", "reevaluation"]),
 ("Acting on what was found, and watching", "Once published, a finding can be held against a standard. A determination can lead to an action or a filing with its deadline. Escalation and monitoring follow the government's response. The group's aspirations and objectives set direction.",
  ["case", "standard", "determination", "consequence", "action", "filing", "escalation", "monitoring", "aspiration-goal", "objective"]),
 ("People, permissions and the group's copy", "Each group runs its own copy. A founder claims it, administrators invite members, capabilities say what each may do, and projects decide who sees what.",
  ["group-instance", "member", "administrator", "invitation", "capability", "project", "credentials"]),
 ("What waits on a member, and the assistant", "The queue gathers everything waiting on someone. The assistant works inside a run with limits: it finds, pursues and checks, and never concludes.",
  ["queue-item", "ai-run", "capture-request", "reevaluation", "lead", "monitoring", "objective", "bias-debt", "member"]),
]

spine = """flowchart TB
  subgraph E["1 · Evidence"]
    direction LR
    doc["Document"] --> read["Reading"] --> pas["Passage"] --> leg["Support"]
  end
  subgraph J["2 · Judgement"]
    direction LR
    q["Question"] --> bv["Account of support"] --> prj["Project concludes"] --> fnd["Finding"]
  end
  subgraph P["3 · Publication and action"]
    direction LR
    cs["Case, published"] --> det["Determination against a standard"] --> act["Action or filing"] --> mon["Watching the response"]
  end
  leg --> q
  fnd --> cs
  str["Strength and declared bias"] -.->|weigh| q
  ai["Assistant"] -.->|finds and checks; never concludes| leg
  qu["Queue"] -.->|what waits on each member| prj
"""

# ---------- reference cards ----------
def statechips(states):
    out = []
    for s in states:
        w = s.get("memberWord")
        tag = ' <span class="pill open">working name</span>' if s.get("proposed") else ""
        out.append(f'<li><span class="mw">{e(w or s["name"])}{tag}</span><span class="st">{e(s["name"])}</span><span class="sm">{e(s.get("meaning"))}</span></li>')
    return '<ol class="states">' + "".join(out) + "</ol>"

def rungpill(r):
    k = r or "undetermined"
    return f'<span class="rung r-{e(k)}">{e(RUNG_WORD.get(k, k))}</span>'

def card(c):
    m, mlab = MAT.get(c["maturity"], ("gaps", c["maturity"]))
    acts = "".join(
        f'<tr><td>{e(a["name"])}{(" <code>" + e(a["op"]) + "</code>") if a.get("op") else ""}{("<div class=note>" + e(a["note"]) + "</div>") if a.get("note") else ""}</td>'
        f'<td>{e(a.get("who"))}</td><td>{rungpill(a.get("rung"))}</td><td>{e(a.get("frequency"))}{(" · <b>time-bound</b>") if a.get("urgency") == "time-bound" else ""}</td>'
        f'<td>{e(a.get("surface"))}</td><td>{src(a.get("src"))}</td></tr>' for a in c.get("acts", []))
    rels = [r for r in d["relationships"] if c["id"] in (r["from"], r["to"])]
    rel = "".join(f'<li>{e(short(r["from"]))} <b>{e(r["verb"])}</b> {e(short(r["to"]))} <span class="card">{e(r.get("cardinality"))}</span>{(" · " + e(r["note"])) if r.get("note") else ""} {src(r.get("src"))}</li>' for r in rels)
    return f'''<details class="con" id="c-{e(c["id"])}"><summary><span class="cname">{e(c["name"])}</span><span class="pill {m}">{mlab}</span><span class="cdef">{e(c["plainDefinition"])}</span></summary>
<div class="cbody"><p class="meta">Module <code>{e(c["module"])}</code> {src(c.get("src"))}</p>
{("<p><b>What a member sees:</b> " + e(c.get("keyFields")) + "</p>") if c.get("keyFields") else ""}
{("<p><b>Shown as:</b> " + e(c["shownAs"]) + "</p>") if c.get("shownAs") else ""}
<h4>Lifecycle</h4>{statechips(c.get("states", []))}
{("<h4>Acts</h4><div class=tw><table><thead><tr><th>Act</th><th>Who may</th><th>Weight</th><th>How often</th><th>In the old interface</th><th class=srccol>Source</th></tr></thead><tbody>" + acts + "</tbody></table></div>") if acts else ""}
{("<h4>Relationships</h4><ul class=rels>" + rel + "</ul>") if rel else ""}</div></details>'''

ref = ""
for L in sorted(LAYERS):
    cs = [c for c in d["constructs"] if c["layer"] == L]
    if cs: ref += f'<section class="layer"><h3><span class="ln">{L}</span>{e(LAYERS[L])}</h3>' + "".join(card(c) for c in cs) + "</section>"

# ---------- act weights ----------
allacts = [(c, a) for c in d["constructs"] for a in c.get("acts", [])]
wsec = ""
for r in RUNG_ORDER:
    rows = [(c, a) for c, a in allacts if (a.get("rung") or "undetermined") == r]
    if not rows: continue
    body = "".join(f'<tr><td>{e(a["name"])}</td><td><a href="#c-{e(c["id"])}">{e(short(c["id"]))}</a></td><td>{e(a.get("frequency"))}{(" · <b>time-bound</b>") if a.get("urgency") == "time-bound" else ""}</td><td>{e(a.get("surface"))}</td><td>{src(a.get("rungSrc") or a.get("rungGround"))}</td></tr>' for c, a in rows)
    wsec += f'<details class="wgrp"{" open" if r in ("irreversible","attested","terminal") else ""}><summary>{rungpill(r)} <b>{len(rows)}</b> acts</summary><div class=tw><table><thead><tr><th>Act</th><th>On</th><th>How often</th><th>In the old interface</th><th class=srccol>Why this weight</th></tr></thead><tbody>{body}</tbody></table></div></details>'
n_none = sum(1 for _, a in allacts if str(a.get("surface", "")).startswith("none"))

# ---------- surfaces ----------
def links(ids): return ", ".join('<a href="#c-%s">%s</a>' % (e(i), e(short(i))) for i in ids)
EX = {"yes": "Exists today", "partial": "Partly exists", "no": "Not built"}
surf_tbl = "".join(f'<tr><td><b>{e(s["name"])}</b><div class=note>{e(s["purpose"])}</div></td><td><span class="pill ex-{e(s.get("existsInOldUI"))}">{EX.get(s.get("existsInOldUI"), e(s.get("existsInOldUI")))}</span></td><td>{links(s.get("constructsShown", []))}</td><td>{src(s.get("src"))}</td></tr>' for s in d["surfaces"])
surf = ""
for r in x.get("surfaceRules", []):
    surf += f'''<details class="surf"><summary><span class="cname">{e(r["surface"])}</span><span></span><span class="cdef">{bl(r.get("purpose"), False)}</span></summary><div class="cbody">
<h4>Must show</h4>{bl(r.get("mustShow"))}<h4>Must never show or do</h4>{bl(r.get("mustNeverShowOrDo"))}<h4>States to design</h4>{bl(r.get("statesToDesign"))}
{("<h4>Primary acts</h4>" + bl(r.get("primaryActs"))) if r.get("primaryActs") else ""}{("<h4>Access and language</h4>" + bl(r.get("accessibilityAndLanguage"))) if r.get("accessibilityAndLanguage") else ""}<p>{src(r.get("src"))}</p></div></details>'''
# ---------- experience sections ----------
aud = "".join(f'''<article class="aud"><h3>{e(a["name"])}</h3>{bl(a.get("whoTheyAre"))}<h4>Goals</h4>{bl(a.get("goals"))}<h4>Already knows</h4>{bl(a.get("whatTheyAlreadyKnow"))}<h4>Context</h4>{bl(a.get("context"))}
<h4>Trust concerns</h4>{bl(a.get("trustConcerns"))}<h4>Must never see or do</h4>{bl(a.get("whatTheyMustNeverSee"))}<p>{basis(a.get("basis"))} {src(a.get("src"))}</p></article>''' for a in x.get("audiences", []))
uc_rows = "".join(f'<tr><td><span class=note>{e(u.get("id"))}</span> <b>{e(u.get("name"))}</b><div class=note>{e(u.get("goal"))}</div></td><td>{e(u.get("audience") or u.get("audiences"))}</td><td>{e(u.get("trigger"))}</td><td>{e(u.get("outcome"))}</td><td><span class="cov cov-{e(str(u.get("coveredByRequirements","")).split(" ")[0])}">{e(u.get("coveredByRequirements"))}</span></td><td>{src(u.get("src"))}</td></tr>' for u in x.get("useCases", []))
ucs = x.get("useCases", [])
uc_no = [u for u in ucs if str(u.get("coveredByRequirements", "")).startswith("no")]
jx = ""
for j in x.get("journeyExperience", []):
    steps = j.get("steps", [])
    li = "".join(f'''<li><div class="who">{e(s.get("whoIsActing"))}{(" · " + e(s.get("howLong"))) if s.get("howLong") else ""}</div><div class="what">{e(s.get("step"))}</div>
<dl><dt>Knows</dt><dd>{bl(s.get("whatTheyKnow"))}</dd><dt>Decides</dt><dd>{bl(s.get("decisionTheyMake"))}</dd><dt>Can go wrong</dt><dd>{bl(s.get("whatCanGoWrong"))}</dd>
{("<dt>Hands to</dt><dd>" + bl(s.get("handoffTo")) + "</dd>") if s.get("handoffTo") else ""}{("<dt>Trust risk</dt><dd>" + bl(s.get("feelingRisk")) + "</dd>") if s.get("feelingRisk") else ""}{("<dt>Open here</dt><dd>" + bl(s.get("openInThisStep")) + "</dd>") if s.get("openInThisStep") else ""}</dl><p>{basis(s.get("basis"))} {src(s.get("src"))}</p></li>''' for s in steps)
    jx += f'<details class="jx"><summary><b>{e(j.get("journey") or j.get("name"))}</b> · {len(steps)} steps</summary><ol class="steps">{li}</ol></details>'
oq = "".join(f'<li><b>{e(q.get("question"))}</b><div>{bl(q.get("whyItMatters"))}</div>{("<div class=note>Where the canon stops: " + bl(q.get("whereTheCanonStops")) + "</div>") if q.get("whereTheCanonStops") else ""}<div class=note>Use cases: {e(q.get("relatedUseCases"))}</div></li>' for q in x.get("openQuestions", []))

gl = "".join(f'<tr><th scope=row>{e(g["term"])}</th><td>{e(g["plain"])}</td><td><code>{e(g.get("internalNames"))}</code></td><td>{e(g.get("avoidConfusionWith"))}</td></tr>' for g in d["glossary"])
prims = "".join(f'<div class="prim"><h4>{e(p["name"])}</h4><p>{e(p["meaning"])}</p><p class="where"><b>Where:</b> {e(p.get("where"))}</p>{src(p.get("src"))}</div>' for p in d["displayPrimitives"])
roles = "".join(f'<tr><th scope=row>{e(r["name"])}</th><td><ul>{"".join("<li>"+e(v)+"</li>" for v in r.get("can", []))}</ul></td><td><ul>{"".join("<li>"+e(v)+"</li>" for v in r.get("cannot", []))}</ul></td><td>{src(r.get("src"))}</td></tr>' for r in d["roles"])
flux = "".join(f'<tr><td>{e(f["what"])}</td><td>{e(f.get("why"))}</td><td>{src(f.get("ids"))}</td></tr>' for f in d["inFlux"])

BOBQ = [
 ("What does “rung” mean to a member?", "The design documents use “rung ladder” for the path to publication (release, stand behind, ground, conclude, accept, ratify, publish). The requirements use it for how heavy each act is (can be undone, needs a reason, ends something, signed, cannot be undone). A member sees the second on every button.",
  "Keep “rung” for the weight of an act. Call the sequence the <b>path to publication</b>. I correct System Design and Publication to match."),
 ("What does “finding” mean to a member?", "In Case Making a finding is a concluded question. In the queue, “FINDING” is a class of item: something the record noticed that nobody has judged yet.",
  "Keep <b>finding</b> for a concluded question. Show the queue class to members as <b>Noticed</b>. Only the word a member sees changes."),
 ("Does a project show its stage?", "State Rules §4.3 gives a project four stages (forming, investigating, matured, closed) and a readiness for its work products. No requirement carries them, so no screen can show them today.",
  "Add the four stages to the project's requirements in T12, computed from the questions it holds and what it has published, not set by hand. The redesign will want a project's stage on its home screen."),
]
bobq = "".join(f'<article class="q bob"><h3>{t}</h3><p>{w}</p><p class="rec"><b>Recommendation:</b> {r}</p></article>' for t, w, r in BOBQ)

cnt = {k: sum(1 for c in d["constructs"] if c["maturity"] == k) for k in MAT}
sx = {k: sum(1 for s in d["surfaces"] if s.get("existsInOldUI") == k) for k in ("yes", "partial", "no")}
props = sum(1 for c in d["constructs"] for s in c.get("states", []) if s.get("proposed"))
fixed_open = ""
if x:
    allb = [i.get("basis") for k in ("audiences", "useCases", "surfaceRules") for i in x.get(k, [])] + [s.get("basis") for j in x.get("journeyExperience", []) for s in j.get("steps", [])]
    fixed_open = f'{allb.count("fixed")} lines fixed by the canon, {allb.count("open")} open for design'

focus = "".join(f'<figure class="fig"><figcaption><h3>{e(t)}</h3><p>{e(p)}</p></figcaption><div class="diagram"><pre class="mermaid">{e(focused(ids))}</pre></div></figure>' for t, p, ids in GROUPS)

exp_block = ""
if x:
    exp_block = f'''
<h2 id="audiences">Who meets it</h2>
<p>Everyone who uses CivicOS or reads what it produces, inside and outside the group: what they want, what they already know, the conditions they meet it in, and what they must never see or be able to do.</p>
<div class="auds">{aud}</div>
<h2 id="usecases">Use cases</h2>
<p>The full catalogue: every function the Functional Architecture says a group needs, and what the construct designs add. <b>{len(ucs)}</b> use cases; <b>{len(uc_no)}</b> have no requirement behind them yet, so no module builds them.</p>
<div class="tw"><table class="uc"><thead><tr><th>Use case</th><th>Who</th><th>Starts when</th><th>Ends with</th><th>Covered</th><th class=srccol>Source</th></tr></thead><tbody>{uc_rows}</tbody></table></div>
<h2 id="experience">The experience, step by step</h2>
<p>The long paths through the work, as the person taking each step meets it: what they know at that moment, what they decide, what can go wrong, how long it takes, who they hand it to, and where trust is at risk.</p>
{jx}
<h2 id="open">Open questions for the design</h2>
<p>What the canon leaves open. These are the design's to answer, and where one turns out to change a requirement, it comes back to Bob.</p>
<ol class="oq">{oq}</ol>'''

page = f'''<title>CivicOS UX Substrate</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Public+Sans:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Layout: three parts in reading order: plain overview for Bob, design inputs, reference. Sticky index; sources hidden until asked for. */
:root {{
  --bg:#f3f5f4; --panel:#ffffff; --ink:#18212b; --muted:#566271; --rule:#d5dbe0; --accent:#1d5b8a; --accent-2:#e3edf5;
  --built:#2f7a52; --built-bg:#dcefe4; --gaps:#9a6a14; --gaps-bg:#f6ead0; --spec:#5f6772; --spec-bg:#eceef1;
  --bob:#9b3b24; --bob-bg:#f7e4dd; --open:#6d4fa3; --open-bg:#ebe4f5;
  --f-display:"Bricolage Grotesque","Segoe UI",system-ui,sans-serif; --f-body:"Public Sans","Segoe UI",system-ui,sans-serif; --f-mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg:#121820; --panel:#19212b; --ink:#e4e9ee; --muted:#9aa6b3; --rule:#2c3643; --accent:#7fb3dc; --accent-2:#1f2d3b;
  --built:#7cc79e; --built-bg:#183326; --gaps:#e0b25c; --gaps-bg:#3a2d12; --spec:#a9b1bb; --spec-bg:#262d36;
  --bob:#f09a82; --bob-bg:#3d2019; --open:#b9a1e6; --open-bg:#2b2240; color-scheme:dark }} }}
:root[data-theme="dark"] {{
  --bg:#121820; --panel:#19212b; --ink:#e4e9ee; --muted:#9aa6b3; --rule:#2c3643; --accent:#7fb3dc; --accent-2:#1f2d3b;
  --built:#7cc79e; --built-bg:#183326; --gaps:#e0b25c; --gaps-bg:#3a2d12; --spec:#a9b1bb; --spec-bg:#262d36;
  --bob:#f09a82; --bob-bg:#3d2019; --open:#b9a1e6; --open-bg:#2b2240; color-scheme:dark }}
body {{ background:var(--bg); color:var(--ink); font:15px/1.55 var(--f-body) }}
.wrap {{ max-width:1180px; margin:0 auto; padding-inline:20px; padding-block:28px 64px }}
h1,h2,h3 {{ font-family:var(--f-display); text-wrap:balance; line-height:1.15 }}
h1 {{ font-size:clamp(28px,4vw,42px); margin:0 0 6px; font-weight:700 }}
.part {{ font:600 12px var(--f-body); text-transform:uppercase; letter-spacing:.12em; color:var(--accent); margin:64px 0 0 }}
.part + h2 {{ margin-top:6px }}
h2 {{ font-size:25px; margin:44px 0 8px; font-weight:700; border-top:2px solid var(--ink); padding-top:14px }}
h3 {{ font-size:18px; margin:0 0 6px; font-weight:600 }}
h4 {{ font:600 12px/1.3 var(--f-body); text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin:14px 0 4px }}
p {{ max-width:74ch }} .lede {{ font-size:17px; color:var(--muted) }}
code {{ font:12.5px var(--f-mono); word-break:break-word }}
.src {{ font:12px/1.4 var(--f-mono); color:var(--muted) }}
body:not(.show-src) .src, body:not(.show-src) .srccol {{ display:none }}
.bar {{ position:sticky; top:env(safe-area-inset-top,0px); z-index:5; background:var(--bg); border-bottom:1px solid var(--rule); padding:10px 0; display:flex; flex-wrap:wrap; gap:6px 16px; align-items:center; font-weight:600; font-size:14px }}
.bar a {{ color:var(--accent); text-decoration:none }} .bar a:hover, .bar a:focus-visible {{ text-decoration:underline }}
.bar label {{ margin-left:auto; font-weight:500; color:var(--muted); display:flex; gap:6px; align-items:center; cursor:pointer }}
.readme {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)); gap:12px; margin:18px 0 }}
.readme div {{ background:var(--panel); border:1px solid var(--rule); padding:12px 14px; border-radius:4px }}
.readme b {{ display:block; font-family:var(--f-display); font-size:16px }}
.stats {{ display:flex; flex-wrap:wrap; gap:8px; margin:14px 0 }}
.pill {{ display:inline-block; font:600 11px/1 var(--f-body); letter-spacing:.06em; text-transform:uppercase; padding:5px 8px; border-radius:3px; white-space:nowrap }}
.pill.built,.pill.ex-yes {{ background:var(--built-bg); color:var(--built) }} .pill.gaps,.pill.ex-partial {{ background:var(--gaps-bg); color:var(--gaps) }}
.pill.spec,.pill.ex-no {{ background:var(--spec-bg); color:var(--spec); outline:1px dashed var(--spec) }}
.pill.askb {{ background:var(--bob-bg); color:var(--bob) }} .pill.open {{ background:var(--open-bg); color:var(--open) }} .pill.fixed {{ background:var(--accent-2); color:var(--accent) }}
.rung {{ display:inline-block; font:600 12px/1.2 var(--f-body); padding:3px 7px; border-radius:3px; border:1px solid var(--rule); white-space:nowrap }}
.r-irreversible {{ background:var(--bob-bg); color:var(--bob); border-color:var(--bob) }} .r-attested {{ background:var(--open-bg); color:var(--open) }}
.r-terminal {{ background:var(--gaps-bg); color:var(--gaps) }} .r-reasoned {{ background:var(--accent-2); color:var(--accent) }}
.r-reversible {{ background:var(--built-bg); color:var(--built) }} .r-undetermined {{ border-style:dashed; color:var(--muted) }} .r-off-ladder {{ color:var(--muted) }}
.diagram {{ background:var(--panel); border:1px solid var(--rule); padding:14px; overflow-x:auto; margin:8px 0 }}
.diagram pre {{ margin:0 }}
.figs {{ display:grid; gap:28px }} .fig {{ margin:0 }} figcaption p {{ color:var(--muted); margin:2px 0 6px }}
.layer {{ margin-top:22px }} .layer h3 {{ display:flex; align-items:baseline; gap:10px }}
.ln {{ font:500 13px var(--f-mono); color:var(--accent); border:1px solid var(--accent); padding:1px 6px; border-radius:3px }}
details.con, details.surf, details.jx, details.wgrp {{ background:var(--panel); border:1px solid var(--rule); border-radius:4px; margin:8px 0 }}
details > summary {{ cursor:pointer; padding:12px 14px; list-style:none }}
details.con > summary, details.surf > summary {{ display:grid; grid-template-columns:1fr auto; gap:4px 12px }}
details > summary::-webkit-details-marker {{ display:none }}
details > summary:focus-visible {{ outline:2px solid var(--accent); outline-offset:2px }}
details[open] > summary {{ border-bottom:1px solid var(--rule) }}
.cname {{ font-weight:600; font-size:16px }} .cdef {{ grid-column:1/-1; color:var(--muted); font-size:14px }}
.cbody {{ padding:4px 14px 16px; min-width:0 }} .meta {{ font-size:13px; color:var(--muted) }}
ol.states {{ list-style:none; padding:0; margin:0; display:flex; flex-wrap:wrap; gap:6px }}
ol.states li {{ display:flex; flex-direction:column; border:1px solid var(--rule); border-radius:3px; padding:6px 9px; max-width:270px; background:var(--bg) }}
.mw {{ font-weight:600 }} .st {{ font:12px var(--f-mono); color:var(--muted) }} .sm {{ font-size:12.5px; color:var(--muted) }}
.tw {{ overflow-x:auto; margin-top:6px }}
table {{ border-collapse:collapse; width:100%; font-size:13.5px }} th,td {{ text-align:left; vertical-align:top; padding:7px 8px; border-bottom:1px solid var(--rule) }}
thead th {{ font:600 11px var(--f-body); text-transform:uppercase; letter-spacing:.07em; color:var(--muted) }}
td ul {{ margin:0; padding-left:18px }} .note {{ font-size:12.5px; color:var(--muted) }}
ul.rels {{ margin:0; padding-left:18px; font-size:14px }} .card {{ font:12px var(--f-mono); color:var(--muted) }}
.q {{ background:var(--panel); border:1px solid var(--rule); border-left:4px solid var(--bob); padding:14px 16px; border-radius:3px; margin:10px 0 }}
.rec {{ background:var(--accent-2); padding:10px 12px; border-radius:3px; max-width:none }}
.prims,.auds {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr)); gap:12px }}
.prim,.aud {{ border-top:3px solid var(--accent); background:var(--panel); padding:12px 14px; min-width:0 }}
.prim h4 {{ color:var(--ink); text-transform:none; letter-spacing:0; font-size:15px; margin:0 0 4px }} .prim p {{ margin:4px 0; font-size:14px }} .where {{ color:var(--muted) }}
dl {{ display:grid; grid-template-columns:max-content 1fr; gap:3px 12px; margin:8px 0; font-size:14px }} dt {{ font-weight:600; color:var(--muted) }} dd {{ margin:0 }}
ol.steps {{ margin:0; padding:10px 14px 14px 40px; display:grid; gap:14px }} ol.steps li::marker {{ font:600 13px var(--f-mono); color:var(--accent) }}
.who {{ font:600 12px var(--f-body); text-transform:uppercase; letter-spacing:.06em; color:var(--muted) }} .what {{ font-weight:600 }}
ol.oq {{ display:grid; gap:10px; padding-left:24px }} ol.oq div {{ font-size:14px }}
ul.bl {{ margin:2px 0; padding-left:18px }} ul.bl li {{ margin:2px 0 }}
.cov {{ font-weight:600 }} .cov-no {{ color:var(--bob) }} .cov-partial {{ color:var(--gaps) }} .cov-yes {{ color:var(--built) }}
@media (max-width:560px) {{ dl {{ grid-template-columns:1fr }} details.con > summary, details.surf > summary {{ grid-template-columns:1fr }} .bar label {{ margin-left:0 }} }}
</style>
<div class="wrap">
<header>
<p class="src" style="display:block">CivicOS · tranche/T10 · {e(d["meta"].get("written"))}</p>
<h1>The UX substrate</h1>
<p class="lede">What a CivicOS member sees and works with, as the approved requirements define it, and everything a designer needs to build its experience on: who uses it, for what, what they meet at each step, and what each screen must and must never do.</p>
<div class="readme">
<div><b>Part 1 · Overview</b>For Bob: what the product is to a member, in plain words and a few diagrams, and three questions for you.</div>
<div><b>Part 2 · Design inputs</b>For the UX work: audiences, use cases, the experience step by step, screens and their rules, how heavy each act is, and the words. Each line is marked <span class="pill fixed">Fixed</span> by the canon or <span class="pill open">Open</span> for design.</div>
<div><b>Part 3 · Reference</b>Every construct with its lifecycle and acts, who may act, what is still changing. Turn on “Show sources” to see the requirement behind each line.</div>
</div>
<div class="stats"><span class="pill built">{cnt["built"]} built</span><span class="pill gaps">{cnt["built, gaps"]} built, with gaps</span><span class="pill spec">{cnt["specified, not built"]} not built</span><span class="pill askb">3 questions for Bob</span>{f'<span class="pill open">{fixed_open}</span>' if fixed_open else ""}</div>
</header>
<nav class="bar" aria-label="Sections"><a href="#overview">Overview</a><a href="#bob">For Bob</a>{'<a href="#audiences">Audiences</a><a href="#usecases">Use cases</a><a href="#experience">Experience</a>' if x else ""}<a href="#screens">Screens</a><a href="#weights">Act weights</a><a href="#words">Words</a>{'<a href="#open">Open questions</a>' if x else ""}<a href="#constructs">Constructs</a><a href="#roles">Who may act</a><a href="#flux">In flux</a>
<label for="srcToggle"><input type="checkbox" id="srcToggle"> Show sources</label></nav>

<p class="part">Part 1 · Overview</p>
<h2 id="overview">What a member does with CivicOS</h2>
<p>A group runs its own copy of CivicOS to investigate how a government is meeting its obligations. Members bring documents in with a record of where each came from. They ask questions and support each answer with passages from those documents. A project concludes a question on the support it accepts, and the concluded question becomes a finding. The group publishes findings as a case. It then holds them against the standards that apply and acts: a request, a complaint, a filing with its deadline. Afterwards it watches for the response.</p>
<p>Three things run through all of it. The record always says what is not known and why. It keeps track of who looked where and what they found. And an assistant can help find and check, but a person always makes the judgement.</p>
<div class="diagram"><pre class="mermaid">{e(spine)}</pre></div>
<p class="legend">In the diagrams below, colour shows how far each thing is built: <span class="pill built">Built</span> <span class="pill gaps">Built, with gaps</span> <span class="pill spec">Not built</span></p>
<div class="figs">{focus}</div>
<h3 style="margin-top:28px">How much of it has a screen today</h3>
<p>The requirements imply <b>{len(d["surfaces"])}</b> screens. In the old interface <b>{sx["yes"]}</b> exist, <b>{sx["partial"]}</b> exist in part, and <b>{sx["no"]}</b> were never built. Of the <b>{len(allacts)}</b> acts a member or administrator can take, <b>{n_none}</b> have no control in the old interface. The redesign starts from the requirements, not from the old screens.</p>

<h2 id="bob">Three questions for Bob</h2>
<p>The design documents and the requirements disagree on these, and each changes what members read. The other differences I found are mine to settle and are listed under “In flux”.</p>
{bobq}

<p class="part">Part 2 · Design inputs</p>
{exp_block}
<h2 id="screens">Screens and their rules</h2>
<p>The rules for each main screen: what it must show, what it must never show or do, and every state it must be designed for. Then the full list of screens the requirements imply, and whether the old interface has each one.</p>
{surf}
<h3 style="margin-top:22px">Every screen the requirements imply</h3>
<div class="tw"><table><thead><tr><th>Screen</th><th>Today</th><th>Shows</th><th class=srccol>Source</th></tr></thead><tbody>{surf_tbl}</tbody></table></div>
<h2 id="weights">How heavy each act is</h2>
<p>Every act carries a weight. It decides how much friction the act deserves: a confirmation, a reason box, a signature. Weights come from the affordances module. <b>Weight not yet set</b> marks acts still waiting to be graded, which T11 and later settle; the design should expect those weights to arrive.</p>
{wsec}
<h2 id="words">Words</h2>
<p>The product's own terms, in plain words, with the internal names behind them and the words they are easily confused with. Each state in Part 3 shows its member-facing word first. {props} of those are working names proposed from the definitions, marked <span class="pill open">working name</span>, for the design to settle.</p>
<div class="tw"><table><thead><tr><th>Term</th><th>Plain meaning</th><th>Internal names</th><th>Easily confused with</th></tr></thead><tbody>{gl}</tbody></table></div>
<h2 id="display">Display primitives</h2>
<p>The few ways the product shows certainty, absence, weight and restriction. Each should look the same wherever it appears.</p>
<div class="prims">{prims}</div>

<p class="part">Part 3 · Reference</p>
<h2 id="constructs">Constructs</h2>
<p>Open any construct for its lifecycle (member-facing word first, internal state name below it), its acts with their weight, how often they come up and whether the old interface offers them, and what it relates to.</p>
{ref}
<h2 id="roles">Who may act</h2>
<div class="tw"><table><thead><tr><th>Role</th><th>Can</th><th>Cannot</th><th class=srccol>Source</th></tr></thead><tbody>{roles}</tbody></table></div>
<h2 id="flux">In flux</h2>
<p>What could still change what a member sees.</p>
<div class="tw"><table><thead><tr><th>What</th><th>Why</th><th class=srccol>Ids</th></tr></thead><tbody>{flux}</tbody></table></div>
</div>
<script>
(function(){{ var t=document.getElementById("srcToggle"); function set(v){{ document.body.classList.toggle("show-src", v); t.checked=v; }}
try {{ set(localStorage.getItem("ux-src")==="1"); }} catch(_ ) {{ set(false); }}
t.addEventListener("change", function(){{ set(t.checked); try {{ localStorage.setItem("ux-src", t.checked?"1":"0"); }} catch(_ ) {{}} }}); }})();
</script>'''
open(S + "ux-substrate.html", "w").write(page)
print(len(page), "exp" if x else "no-exp")
