/* UI-12 — S3's ACT BAR, and the CONCLUDE flow.
 *
 * The first act surface built AFTER `op=affordances` exists, and therefore the
 * first that keeps NO surface-side map. This harness drives `openInquiry`'s act
 * bar and the whole conclude motion over a mock plane that answers the six reads
 * and the one write the surface takes — op=image, op=projection, op=backlinks,
 * op=affordances (both shapes), op=inquirystrength (REC-34) and op=conclude
 * (REC-13) — and proves what the item's acceptance names:
 *
 *   (1) EVERY OPTION, LABEL AND RUNG COMES FROM `op=affordances`. Proven twice:
 *       structurally (no published label is spelled in app.html, and the
 *       `DISPOSITIONS` declaration this item deletes is gone) and BEHAVIOURALLY
 *       — the plane's published label and rung are changed mid-run to values
 *       nobody would write down, the bar re-renders, and the surface repeats
 *       them. A surface-side map cannot pass that.
 *
 *   (2) THE PRE-FLIGHT IS THE PLANE'S, IN THE PLANE'S ORDER, AND IT WRITES
 *       NOTHING. `op=conclude` validates fail-closed before its transaction
 *       opens, so the op IS the dry run; the surface sends the member's whole
 *       draft with `target` WITHHELD — the last field a caller supplies that the
 *       store looks at — and a cleared pre-flight is the literal NO_TARGET. The
 *       harness asserts no accepted conclude and no promote ever reaches the
 *       plane during a pre-flight.
 *
 *   (3) THE COMMIT IS ABSENT WHILE THE PLANE REFUSES, never greyed, and the
 *       act is refused WITH THE PLANE'S OWN REASON when the falsifier is empty.
 *
 *   (4) THE CONCLUSION FIELD IS EMPTY, ALWAYS — no value, no placeholder, no
 *       template, and no length rule copied out of the plane.
 *
 *   (5) HARD 2's LIVE PREVIEW RENDERS THE PAIR, AND THE PAIR MOVES
 *       INDEPENDENTLY. Selecting the Grade C CAPTURE leg moves the capture axis
 *       and leaves the connection axis byte-identical. There is no composed
 *       letter anywhere and the surface performs no arithmetic over grades: the
 *       consequence rendered for each selected leg is the PLANE'S own sentence
 *       about that leg on that axis (its `weakest` slot, its `not_load_bearing`
 *       `why`, or its `undetermined_at` `why`), and nothing where the plane
 *       named it nowhere.
 *
 *   (6) DEC-8's ACCEPTANCE CLAUSE: NO REFUSAL STRING ORIGINATES IN THE SURFACE.
 *       Every refusal sentence rendered across every driven path is checked
 *       against the exact set of sentences the mock plane returned. The mock's
 *       wording is deliberately NOT the store's, so a surface that had
 *       transcribed a store sentence would fail here rather than agree with
 *       itself.
 *       ONE STATED EXCEPTION, and it is not a refusal about the record: the
 *       fail-closed guard for a pre-flight the plane ACCEPTED
 *       (`PREFLIGHT_NOT_REFUSED`) is the surface saying its own probe
 *       misbehaved and that nothing was committed. It is UI-13's landed
 *       precedent, it is unreachable while the plane behaves, and it states no
 *       rule of the record's. It is driven below so it is not merely asserted
 *       to be safe.
 *
 *   (7) Q12: a read-only credential sees the whole page and NO act control at
 *       all — absent, not greyed, not narrated per-control.
 *
 * NEGATIVE CONTROL, four arms, RUN 2026-08-04 and restored byte-identical after
 * each — app.html's sha256 was taken before, after the break and after the
 * restore on every arm, and all four returned to
 * 7e4dbee6e98726c9b1432cdcbd27897000158aa781310aa4a63f4bac56c33b75. Each arm is
 * one edit in civicos-ui/app.html, and BOTH suites were re-run under each,
 * because the disposition half of this item is enforced in the other file.
 *
 *   (a) A SURFACE-SIDE OPTION MAP. Reintroduce the deleted literal and have the
 *       dispose flow read it — in the `dispositions` seam, replace
 *         const dispositions = () => actVocab("dispositions");
 *       with
 *         const dispositions = () => ["deferred", "dismissed"];
 *       -> RUN: 2 failures in TWO FILES — here, "no array literal of the
 *       published disposition tokens survives on the question side of app.html"
 *       (1 of 91); and in act-dispose.test.mjs, "before op=affordances answers,
 *       the surface knows NO disposition" (1 of 59). TWO INSTRUMENTS, and each
 *       catches something the other cannot: the structural one catches the
 *       literal, the behavioural one catches the READ that stopped happening.
 *       WORTH KNOWING, and it is why the behavioural arm exists: "the
 *       disposition set the surface offers is the plane's own published array"
 *       STAYED GREEN, because the reintroduced literal happens to equal what
 *       this mock publishes. A suite with only that assertion would have missed
 *       the whole break — an equality that costs nothing is not evidence.
 *
 *   (b) A PREFILLED CONCLUSION. In `concludePaint`, give the conclusion field a
 *       value and a suggested phrasing:
 *         <textarea class="txt" id="cx-concl" rows="4" placeholder="e.g. The fund paid for the marina" onchange="…">The fund paid for the marina.</textarea>
 *       -> RUN: 2 of 91 failed — "the conclusion field is EMPTY: no value
 *       between the tags" and "the conclusion field offers no placeholder, no
 *       template and no suggested wording". Both arms of constraint 1 have
 *       their own assertion, deliberately: a placeholder is a framing even when
 *       the field submits empty, and the two failures are the two different
 *       ways a system writes a member's conclusion for them.
 *
 *   (c) ONE COMPOSED LETTER IN THE LIVE PREVIEW. In `concludePaint`'s preview
 *       branch, prepend a composed badge above the two axis panels:
 *         : `<span class="subj-grade g-est">Grade ${CONCL.pair.capture.grade > CONCL.pair.connection.grade ? CONCL.pair.capture.grade : CONCL.pair.connection.grade}</span>` + GRADE_AXES.map(ax=>{
 *       -> RUN: 3 of 91 failed — "the live preview renders no strength mark
 *       above the first axis" (the positional instrument: a composed letter has
 *       nowhere honest to go), and BOTH count assertions, "with nothing
 *       selected the preview renders exactly the two marks the plane's answer
 *       accounts for" and "the preview renders exactly the grade marks the
 *       plane's own answer accounts for" — the expected counts are DERIVED from
 *       the mock's published pair, so one extra mark of any wording fails.
 *       WORTH KNOWING: "selecting a Grade C capture leg leaves the connection
 *       axis byte-identical" did NOT fail on this arm, and the reason is
 *       instructive rather than a gap — the composed badge sits above BOTH
 *       axes, so it is outside the connection slice. The independence assertion
 *       measures independence; catching the composed letter is the positional
 *       and count instruments' job, and the three are kept separate for exactly
 *       that reason.
 *
 *   (d) A SURFACE-COMPUTED REFUSAL. In `concludePaint`, keep the plane's reason
 *       CODE and substitute a sentence the surface wrote:
 *         : !pf.clear ? `<div class="intent-pf">${actRefusalHtml({reason:pf.refusal.reason, detail:"You must say what would change your mind."})}</div>`
 *       -> RUN: 7 of 91 failed, including "every refusal sentence rendered is
 *       one the plane returned" NAMING the invented sentence three times, "THE
 *       ACT IS REFUSED WITH THE PLANE'S OWN REASON WHEN THE FALSIFIER IS
 *       EMPTY", "the pre-flight refuses NO_CONCLUSION before the member has
 *       written one", "a machine credential's pre-flight carries back the
 *       plane's FIRST refusal" and the fail-closed guard's own sentence. WORTH
 *       KNOWING: the reason CODE was still correct on every one of them, so a
 *       suite that checked only codes would have stayed entirely green. The
 *       provenance check is over the SENTENCE, which is the thing a member
 *       actually reads and the thing DEC-8 is about.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

const APP = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");

/* ================= THE MOCK PLANE =================
   Its refusal SENTENCES are deliberately not the store's. The store's words are
   what a live plane sends; what this harness proves is PROVENANCE — that every
   sentence the member reads came back over the wire — so wording the surface
   could not possibly have transcribed is the right instrument. */
const CALLS = [];
const SAID = [];                        // every refusal sentence the plane returned

const PUBLISHED = {
  /* op=affordances' `acts`, in the producer's own shape (index.mjs decorateAct):
     id, label, weight, needs, mode, rung, prompt. `conclude` publishes rung
     null — no document assigns it one — and that absence is rendered as an
     absence. */
  conclude: { id:"conclude", label:"Conclude", weight:"single", needs:"contribute",
              mode:"session", rung:null, prompt:null },
  dispose:  { id:"dispose", label:"Dispose (defer or dismiss)", weight:"refuse",
              needs:"contribute", mode:"session", rung:"reasoned", prompt:null },
  divide:   { id:"inquirydivide", label:"Divide (split this question)", weight:"single",
              needs:"contribute", mode:"session", rung:null,
              prompt:"Dividing does not remove anything. Every leg gets a home on one of the children." },
};
/* Mutable, so the behavioural half of "never re-labelled" can move the plane's
   own answer under the surface and watch the surface follow. */
let ACTS_FOR = {
  "INQ-2026-0001": [PUBLISHED.conclude, PUBLISHED.dispose, PUBLISHED.divide],
  "INQ-2026-0005": [PUBLISHED.conclude, PUBLISHED.dispose],
  "INFO-2026-0100": [],
};

const MIXED_LEGS = [
  { target:"INFO-2026-0100", role:"supports",     grade:"A", grade_axis:"capture",    grade_source:"resolution" },
  { target:"INFO-2026-0200", role:"supports",     grade:"C", grade_axis:"capture",    grade_source:"resolution" },
  { target:"INQ-2026-0009",  role:"cuts_against", grade:"B", grade_axis:"connection", grade_source:"inherited" },
  { target:"INFO-2026-0300", role:"supports",     grade:null, grade_axis:null,        grade_source:null },
];

/* op=inquirystrength's answer shape (store.mjs #axisResult): `weakest` is the
   NAMED MEMBER OBJECT, not an id, and every leg the plane can say something
   about on an axis is either the weakest, in `not_load_bearing` with its own
   `why`, or in `undetermined_at` with its own. INFO-2026-0200 is the capture
   axis's weakest at C; on CONNECTION the plane names it inert, in its own
   words. That pair of facts is what makes the axes move independently. */
const PAIR_0001 = {
  ok:true, target:"INQ-2026-0001", depth_bound:6,
  capture: { axis:"capture", state:"graded", grade:"C", determined:true,
    weakest:{ bundle_id:"INQ-2026-0001", ord:1, target_id:"INFO-2026-0200", role:"supports",
              grade:"C", grade_source:"resolution", via:"leg" },
    load_bearing:2, population:3, depth_bound:6,
    not_load_bearing:[{ bundle_id:"INQ-2026-0001", ord:3, target_id:"INFO-2026-0300", role:"supports",
                        grade:null, via:"leg", why:"the leg carries no grade" }],
    detail:"capture C — no stronger than the weakest capture it rests on, which is INFO-2026-0200. Present and not yet load-bearing: INFO-2026-0300." },
  connection: { axis:"connection", state:"graded", grade:"B", determined:true,
    weakest:{ bundle_id:"INQ-2026-0001", ord:2, target_id:"INQ-2026-0009", role:"cuts_against",
              grade:"B", grade_source:"inherited", via:"leg" },
    load_bearing:1, population:4, depth_bound:6,
    not_load_bearing:[
      { bundle_id:"INQ-2026-0001", ord:0, target_id:"INFO-2026-0100", role:"supports", grade:null, via:"leg",
        why:"the leg's grade is on the capture axis" },
      { bundle_id:"INQ-2026-0001", ord:1, target_id:"INFO-2026-0200", role:"supports", grade:null, via:"leg",
        why:"the leg's grade is on the capture axis" },
      { bundle_id:"INQ-2026-0001", ord:3, target_id:"INFO-2026-0300", role:"supports", grade:null, via:"leg",
        why:"the leg carries no grade" }],
    detail:"connection B — no stronger than the weakest connection it rests on, which is INQ-2026-0009. Present and not yet load-bearing: INFO-2026-0100, INFO-2026-0200, INFO-2026-0300." },
};
/* A question resting on nothing: both axes UNRATED, and the plane says so in
   its own words. This is how NO_BASIS is visible before it is refused. */
const PAIR_0005 = {
  ok:true, target:"INQ-2026-0005", depth_bound:6,
  capture: { axis:"capture", state:"unrated", grade:null, determined:false, weakest:null,
    load_bearing:0, population:0, depth_bound:6, not_load_bearing:[],
    detail:"UNRATED on capture: this inquiry rests on nothing on this axis." },
  connection: { axis:"connection", state:"unrated", grade:null, determined:false, weakest:null,
    load_bearing:0, population:0, depth_bound:6, not_load_bearing:[],
    detail:"UNRATED on connection: this inquiry rests on nothing on this axis." },
};
/* A LEG that is itself a question answers with its own pair — the fan-out
   REC-34 named as the thing to watch. */
const PAIR_0009 = {
  ok:true, target:"INQ-2026-0009", depth_bound:6,
  capture: { axis:"capture", state:"graded", grade:"B", determined:true,
    weakest:{ bundle_id:"INQ-2026-0009", ord:0, target_id:"INFO-2026-0900", role:"supports",
              grade:"B", grade_source:"resolution", via:"leg" },
    load_bearing:1, population:1, depth_bound:6, not_load_bearing:[],
    detail:"capture B — no stronger than the weakest capture it rests on, which is INFO-2026-0900." },
  connection: { axis:"connection", state:"unrated", grade:null, determined:false, weakest:null,
    load_bearing:0, population:0, depth_bound:6, not_load_bearing:[],
    detail:"UNRATED on connection: this inquiry rests on nothing on this axis." },
};

const DOCS = {
  "INQ-2026-0001": { state:"open", title:"Did the sewer fund pay for the marina?", legs:MIXED_LEGS,
    q:"Did money from the sewer enterprise fund pay for marina construction?",
    f:"A general-ledger export showing no transfer from fund 601." },
  "INQ-2026-0005": { state:"open", title:"Where did the 2025 surplus go?", legs:[],
    q:"Where did the 2025 general-fund surplus go?", f:"" },
  "INFO-2026-0100": { state:"verified", title:"Sewer fund ledger", legs:[], q:"", f:"", type:"information" },
};

const REF = {
  NO_CONCLUSION:  "the record keeps WHAT was concluded, so a conclusion with nothing in it is refused before anything moves.",
  NO_FALSIFIER:   "a finding states what would OVERTURN it, and a finding nobody can check claims more than it can support.",
  BAD_CONCLUSION: "the record's frontmatter grammar has no escapes, so a quote, a backslash or a line break cannot be written verbatim.",
  NO_TARGET:      "a conclusion answers ONE question, and this call named none.",
  NO_SUCH_BUNDLE: "no question with that name is visible to this credential.",
  NO_BASIS:       "a conclusion rests on something, and this question rests on nothing at all.",
  MACHINE_CANNOT_CONCLUDE: "a machine credential may gather and may never author the answer.",
};
const refuse = (reason, extra) => { SAID.push(REF[reason]); return { ok:false, reason, detail:REF[reason], ...(extra||{}) }; };

let AS_MACHINE = false;              // the control plane stamps the author; this simulates a machine one
let PREFLIGHT_ACCEPTS = false;       // arm (6)'s fail-closed guard: a plane that accepts an incomplete check

function md(d){
  return `---\nobject_type: ${d.type||"inquiry"}\ncurrent_state: ${d.state}\ntitle: ${d.title}\n---\n`
    + (d.type==="information" ? `## Summary\n\nA ledger.\n`
      : `## Question\n\n${d.q}\n\n## What Would Falsify This\n\n${d.f}\n\n## Session Log\n\n- promoted\n`);
}

function mockFetch(u){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  const p = Object.fromEntries(url.searchParams.entries());
  CALLS.push({ op, params:p });
  const R = o => ({ ok:true, json:async()=>o });
  const W = r => R({ ok:true, result:r });      // the envelope the plane really sends (D-173)

  if(op==="image"){
    const d = DOCS[p.id]; if(!d) return W(null);
    return W({ "bundle.md": md(d) });
  }
  if(op==="projection"){
    const d = DOCS[p.id]; if(!d) return W(null);
    return W({ bundle_id:p.id, object_type:d.type||"inquiry", title:d.title,
               current_state:d.state, fm_json:JSON.stringify({ basis:d.legs }) });
  }
  if(op==="backlinks") return W({ ok:true, target:p.target, backlinks:[] });
  if(op==="affordances"){
    if(!p.target)
      return W({ target:null, catalog:Object.values(PUBLISHED),
                 vocabularies:{ action_kind:["request_for_comment"],
                                dispositions:["deferred","dismissed"],
                                subject_positions:["no_notice_given"] } });
    const acts = ACTS_FOR[p.target];
    if(!acts) return W(refuse("NO_SUCH_BUNDLE", { target:p.target }));
    const d = DOCS[p.target] || {};
    return W({ target:p.target, object_type:d.type||"inquiry", current_state:d.state, acts,
               vocabularies:{ dispositions:["deferred","dismissed"] } });
  }
  if(op==="inquirystrength"){
    if(p.id==="INQ-2026-0001") return W(PAIR_0001);
    if(p.id==="INQ-2026-0005") return W(PAIR_0005);
    if(p.id==="INQ-2026-0009") return W(PAIR_0009);
    /* A document is not a question and the plane says so in its own words. */
    SAID.push("a document has no basis to derive a strength from.");
    return W({ ok:false, reason:"NOT_AN_INQUIRY", target:p.id,
               detail:"a document has no basis to derive a strength from." });
  }
  if(op==="conclude"){
    /* THE STORE'S OWN ORDER (store.mjs conclude()), mirrored exactly, because
       the order is the thing the pre-flight design turns on. */
    if(PREFLIGHT_ACCEPTS && !p.target) return W({ ok:true, target:null, from:"open", to:"concluded" });
    if(AS_MACHINE) return W(refuse("MACHINE_CANNOT_CONCLUDE"));
    const c = String(p.conclusion||"").trim(), f = String(p.falsifier||"").trim();
    if(!c) return W(refuse("NO_CONCLUSION"));
    if(!f) return W(refuse("NO_FALSIFIER"));
    if(/["\\\r\n]/.test(c) || /["\\\r\n]/.test(f)) return W(refuse("BAD_CONCLUSION"));
    if(!p.target) return W(refuse("NO_TARGET"));
    const d = DOCS[p.target];
    if(!d) return W(refuse("NO_SUCH_BUNDLE", { target:p.target }));
    if((d.legs||[]).length < 1) return W(refuse("NO_BASIS", { target:p.target }));
    d.state = "concluded";
    return W({ ok:true, target:p.target, from:"open", to:"concluded", conclusion:c, falsifier:f,
               basis_legs:d.legs.length, author:"m_alice", at:"2026-08-04T18:22:00Z", weight:"single" });
  }
  return R({ ok:false, error:"unexpected op "+op });
}

/* ---- a DOM stub good enough for innerHTML inspection ---- */
const els = new Map();
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
  querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }

const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
    hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:async(u,opts)=>mockFetch(u,opts) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() +
  ";globalThis.__PLANE=PLANE;globalThis.__openInquiry=openInquiry;globalThis.__openConclude=openConclude;" +
  "globalThis.__toggle=concludeToggle;globalThis.__author=concludeAuthor;globalThis.__do=doConclude;" +
  "globalThis.__loadActSource=loadActSource;globalThis.__dispositions=dispositions;" +
  "globalThis.__actsFor=actsFor;globalThis.__CONCL=()=>CONCL;globalThis.__ACTS=()=>CONCLUDE_ACTS;" +
  "globalThis.__PROJ_CACHE=PROJ_CACHE;globalThis.__IMG_CACHE=IMG_CACHE;", ctx);

ctx.__PLANE.session = true;
ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };

const page = () => els.get("#content")._html;
const dlg  = () => els.get("#dlg")._html;
async function openPage(id){ ctx.__PROJ_CACHE.clear(); ctx.__IMG_CACHE.clear(); await ctx.__openInquiry(id); return page(); }
/* The live preview's own slice of the dialog, between its heading and the next. */
function preview(html){
  const a = html.indexOf("What that reads at");
  const b = html.indexOf("What would falsify it");
  return (a === -1 || b === -1) ? "" : html.slice(a, b);
}
const marks = h => [...h.matchAll(/class="subj-grade[^"]*">([^<]*)</g)].map(m=>m[1]);

/* ============ (0) STRUCTURAL: THE SURFACE-SIDE MAP IS GONE ============ */
ok("the DISPOSITIONS declaration this item deletes no longer exists in app.html",
   !/const\s+DISPOSITIONS\s*=/.test(APP));
/* SCOPED, and the scope is stated. Everything up to the PROPOSALS flow (anchored on its own PROP_DISPOSE_VERB table) — the
   inquiry page, the act bar, the conclude flow and the question's dispose
   dialog — carries no disposition array literal at all. The proposals screen
   (REC-7's op=proposedispose, a NON_ACT whose set op=affordances does not
   publish) still holds its own two-token literal; that is a SECOND map for a
   DIFFERENT op, it is UI-14's ground as the proposals screen folds into the
   queue, and it is reported rather than asserted away. */
const QUESTION_SIDE = APP.slice(0, APP.indexOf("PROP_DISPOSE_VERB"));
ok("no array literal of the published disposition tokens survives on the question side of app.html",
   !/\[\s*"deferred"\s*,\s*"dismissed"\s*\]/.test(QUESTION_SIDE)
   && !/\[\s*'deferred'\s*,\s*'dismissed'\s*\]/.test(QUESTION_SIDE));
/* The two multi-word published labels are the ones a transcription would be
   visible in; the behavioural half below covers every label including short ones. */
for(const a of [PUBLISHED.dispose, PUBLISHED.divide])
  ok(`the published label "${a.label}" is nowhere in app.html`, !APP.includes(a.label));
ok("the act's published PROMPT is nowhere in app.html (DEC-29(b): it rides the act)",
   !APP.includes(PUBLISHED.divide.prompt));
/* The store's own refusal REASONS are never rendered from a table here. The only
   reason code this file may know is the one it WITHHOLDS a field to provoke.
   SCOPED TO CONCLUDE'S OWN REFUSALS, and the scope is stated rather than quietly
   chosen: `disposePreflight` (UI-2, built before DEC-8 and before
   op=affordances existed) still COMPUTES its own NO_REASON / BAD_REASON /
   ILLEGAL_TRANSITION and words them itself. That is a real residue of the same
   class this item closes, it is act-dispose's ground rather than this region's,
   and it is reported rather than asserted away here. */
for(const code of ["NO_CONCLUSION", "NO_FALSIFIER", "NO_BASIS", "MACHINE_CANNOT_CONCLUDE"])
  ok(`app.html names no ${code} refusal of its own`, !new RegExp(`reason:\\s*"${code}"`).test(APP));
ok("the ONE reason code the surface knows is the field it withholds (NO_TARGET), and it is a read not a render",
   APP.includes('a.refusal.reason === "NO_TARGET"'));

/* ============ (1) THE ACT BAR: EVERY ACT, LABEL AND RUNG IS THE PLANE'S ============ */
const p1 = await openPage("INQ-2026-0001");
ok("op=affordances was asked for the question's own acts",
   CALLS.some(c=>c.op==="affordances" && c.params.target==="INQ-2026-0001"));
ok("the act bar names what can be done here", /What can be done here/.test(p1));
ok("the bar renders the producer's own label for the act it carries", p1.includes(PUBLISHED.conclude.label));
ok("an act the record publishes and this page cannot carry is NAMED, with the producer's label",
   p1.includes(PUBLISHED.dispose.label) && p1.includes(PUBLISHED.divide.label));
ok("a named-but-uncarried act gets NO control", !new RegExp(`<button[^>]*>${PUBLISHED.dispose.label}`).test(p1));
ok("the bar adds no act the plane did not publish",
   (p1.match(/actGo\(/g)||[]).length === 1);
/* THE BEHAVIOURAL HALF, and it is the one a surface-side map cannot survive:
   move the plane's own label and rung to values nobody would write down. */
ACTS_FOR["INQ-2026-0001"] = [{ ...PUBLISHED.conclude, label:"Set this question down as answered",
                               rung:"terminal" }, PUBLISHED.dispose, PUBLISHED.divide];
const p1b = await openPage("INQ-2026-0001");
ok("the surface repeats a label it has never seen before, because it reads it",
   p1b.includes("Set this question down as answered"));
ok("and the old label is gone — nothing here remembers a name of its own",
   !p1b.includes(`>${PUBLISHED.conclude.label}&hellip;<`));
ACTS_FOR["INQ-2026-0001"] = [PUBLISHED.conclude, PUBLISHED.dispose, PUBLISHED.divide];

/* the published VOCABULARIES reach the surface too — the deleted map's replacement */
await ctx.__loadActSource(true);
ok("the disposition set the surface offers is the plane's own published array",
   JSON.stringify(ctx.__dispositions()) === JSON.stringify(["deferred","dismissed"]));

/* a question the credential may not see: the plane refuses, and its words stand */
const nope = await ctx.__actsFor("INQ-NOPE");
ok("an act question about an invisible object is refused by the plane",
   nope.ok===false && nope.refusal.reason==="NO_SUCH_BUNDLE");

/* ============ (2) Q12: A READ-ONLY CREDENTIAL SEES NO CONTROL AT ALL ============ */
ctx.__PLANE.me = { member:"m_vera", session:true, administer:false, capabilities:["view"] };
const ro = await openPage("INQ-2026-0001");
ok("a read-only credential still sees the whole page", ro.includes("INFO-2026-0200"));
ok("a read-only credential is offered NO act control", !/<button/.test(ro));
ok("and no control is greyed instead of omitted", !/disabled/.test(ro));
ok("no control is narrated per-control", !/you (can|may) not|not permitted|insufficient/i.test(ro));
ok("the acts the record publishes are still NAMED to a reader",
   ro.includes(PUBLISHED.conclude.label) && ro.includes(PUBLISHED.dispose.label));
ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };
await openPage("INQ-2026-0001");

/* ============ (3) THE FLOW: AUTHOR EMPTY, PRE-FLIGHT REFUSES, COMMIT ABSENT ============ */
const beforeFlow = CALLS.length;
await ctx.__openConclude("INQ-2026-0001", DOCS["INQ-2026-0001"].title, PUBLISHED.conclude);
let d0 = dlg();
ok("the dialog opens under the producer's own label", d0.includes(PUBLISHED.conclude.label));
/* (4) THE CONCLUSION FIELD IS EMPTY, ALWAYS */
const conclField = /<textarea[^>]*id="cx-concl"[^>]*>([\s\S]*?)<\/textarea>/.exec(d0);
ok("the conclusion field exists", !!conclField);
ok("the conclusion field is EMPTY: no value between the tags", conclField && conclField[1] === "");
ok("the conclusion field offers no placeholder, no template and no suggested wording",
   conclField && !/placeholder/.test(conclField[0]));
ok("the conclusion field copies no length rule out of the plane", conclField && !/maxlength/.test(conclField[0]));
/* THE PLANE'S FIRST REFUSAL, IN ITS ORDER AND ITS WORDS */
ok("the pre-flight refuses NO_CONCLUSION before the member has written one", d0.includes(REF.NO_CONCLUSION));
ok("the refusal carries the plane's own reason code", /NO_CONCLUSION/.test(d0));
ok("THE COMMIT IS ABSENT while the plane refuses — not present-and-disabled",
   !/id="cx-go"/.test(d0) && !/disabled/.test(d0));
/* ...and the pre-flight WROTE NOTHING */
const pf = CALLS.slice(beforeFlow).filter(c=>c.op==="conclude");
ok("the pre-flight asked op=conclude", pf.length >= 1);
ok("every pre-flight WITHHELD the target — so nothing could move",
   pf.every(c=>!c.params.target));
ok("no promote and no accepted write reached the plane during the pre-flight",
   !CALLS.slice(beforeFlow).some(c=>c.op==="promote") && DOCS["INQ-2026-0001"].state === "open");

/* AUTHOR the conclusion; the plane's SECOND refusal appears, in its order */
await ctx.__author("conclusion", "The sewer fund paid for marina construction in the 2024 cycle.");
let d1 = dlg();
ok("with a conclusion authored, the plane's NEXT refusal in its own order appears",
   d1.includes(REF.NO_FALSIFIER) && !d1.includes(REF.NO_CONCLUSION));
ok("THE ACT IS REFUSED WITH THE PLANE'S OWN REASON WHEN THE FALSIFIER IS EMPTY",
   /NO_FALSIFIER/.test(d1) && d1.includes(REF.NO_FALSIFIER));
ok("the commit is still ABSENT", !/id="cx-go"/.test(d1));
ok("the member's own words survived the repaint and were never rewritten",
   ctx.__CONCL().conclusion === "The sewer fund paid for marina construction in the 2024 cycle.");

/* ============ (5) HARD 2: THE SELECTION, AND THE PAIR MOVING INDEPENDENTLY ============ */
ok("the basis is offered as a SELECTION over the legs the record already holds",
   MIXED_LEGS.every(l=>d1.includes(l.target)) && /type="checkbox"/.test(d1));
ok("the live pair is read from the record, both axes, before anything is selected",
   CALLS.some(c=>c.op==="inquirystrength" && c.params.id==="INQ-2026-0001"));

const pv0 = preview(d1);
const axisMark = h => [...h.matchAll(/<span class="k">(Documents|Links)<\/span><span class="v plain">\s*<span class="subj-grade [^"]*">Grade ([ABCD])</g)]
                        .map(m=>[m[1], m[2]]);
ok("the preview renders EXACTLY two axis strengths, one per axis", axisMark(pv0).length === 2);
ok("the two axis grades in the preview are the plane's own two values, unmodified",
   JSON.stringify(axisMark(pv0)) === JSON.stringify([["Documents","C"],["Links","B"]]));
ok("the live preview renders no strength mark above the first axis",
   pv0.indexOf("subj-grade") > pv0.indexOf("Documents"));
ok("no prose in the preview claims a single overall strength",
   !/\boverall\b|\bcomposite\b|\bthe strength is\b/i.test(pv0));
ok("no score, percentage, average or bar anywhere in the preview",
   !/\d\s*%/.test(pv0) && !/\bscore\b|\baverage\b|\bmean\b|\bweighted\b/i.test(pv0) && !/<progress|<meter/.test(pv0));
ok("with nothing selected the preview renders exactly the two marks the plane's answer accounts for",
   marks(pv0).length === 2);

/* Slice the two axis panels apart so "moved" and "did not move" are measurable
   independently — which is the whole mechanism this item exists to build. */
function axes(html){
  const pv = preview(html);
  const at = pv.indexOf("Links &middot;");
  return { capture: pv.slice(0, at), connection: pv.slice(at) };
}
const before = axes(d1);

/* SELECT THE GRADE C CAPTURE LEG. The plane names it the capture axis's weakest
   at C; on connection the plane names it inert, in its own words. */
await ctx.__toggle("INFO-2026-0200");
const d2 = dlg();
const after = axes(d2);
ok("selecting a leg re-asks the record what the question reads at (live, per selection)",
   CALLS.filter(c=>c.op==="inquirystrength" && c.params.id==="INQ-2026-0001").length >= 2);
ok("selecting a leg also asks the record about THAT leg — the fan-out REC-34 named",
   CALLS.some(c=>c.op==="inquirystrength" && c.params.id==="INFO-2026-0200"));
ok("THE CAPTURE AXIS MOVED: the consequence of the selection is rendered under it",
   after.capture.length > before.capture.length && after.capture.includes("INFO-2026-0200"));
ok("and it carries the plane's own grade for that axis (C), not one composed here",
   /INFO-2026-0200[\s\S]*?Grade C/.test(after.capture));
ok("and the plane's own sentence about it", after.capture.includes(PAIR_0001.capture.detail));
ok("THE CONNECTION AXIS DID NOT MOVE: its own strength is byte-identical",
   axisMark(after.connection).length===1 && axisMark(after.connection)[0][1] === "B");
ok("the connection consequence carries NO grade for this leg — the plane says it is inert there",
   after.connection.includes("the leg's grade is on the capture axis")
   && !/INFO-2026-0200[\s\S]{0,200}?Grade [ABCD]/.test(after.connection.slice(after.connection.indexOf("cx-sel"))));
ok("the two axis grades are STILL the plane's own two values after the selection",
   JSON.stringify(axisMark(preview(d2))) === JSON.stringify([["Documents","C"],["Links","B"]]));
ok("the preview renders exactly the grade marks the plane's own answer accounts for",
   marks(preview(d2)).length === 3);   /* two axes + this leg's own weakest mark on capture */

/* A leg that is itself a QUESTION brings back its own pair — two grades, never
   one, and the surface renders both without combining them. */
await ctx.__toggle("INQ-2026-0009");
const d3 = dlg();
ok("a selected leg that is itself a question is asked for its OWN pair",
   CALLS.some(c=>c.op==="inquirystrength" && c.params.id==="INQ-2026-0009"));
ok("that leg's own answer renders as a PAIR, never as one letter",
   /INQ-2026-0009[\s\S]*?Documents[\s\S]*?Links/.test(d3));
ok("and where its own answer is UNRATED the word is UNRATED (D-160)", d3.includes("UNRATED"));
await ctx.__toggle("INQ-2026-0009");

/* THE FALSIFIER: the selection NAMES the legs, and the member's words follow */
ok("the selected leg is named in what will be recorded as the falsifier",
   dlg().includes("Recorded verbatim as:") && dlg().includes("INFO-2026-0200"));
await ctx.__author("falsifier", "or a signed approval naming a different fund");
const d4 = dlg();
ok("the falsifier is the member's selection and the member's words, joined by a separator and nothing else",
   ctx.__CONCL().sel.join(", ") === "INFO-2026-0200"
   && d4.includes("INFO-2026-0200 · or a signed approval naming a different fund"));
/* Scoped to WHAT WILL BE RECORDED, which is the only text that becomes the
   member's act. The surrounding prompt is a question put TO the member and is
   not written into the record. */
const recorded = /Recorded verbatim as: <span class="mono">([^<]*)</.exec(d4);
ok("what will be recorded is exactly the selection and the member's words, and nothing else",
   !!recorded && recorded[1] === "INFO-2026-0200 · or a signed approval naming a different fund");

/* ============ (6) THE PRE-FLIGHT CLEARS, AND ONLY THEN IS THERE A COMMIT ============ */
ok("with both requirements met the plane's LAST outstanding refusal is the field this surface withheld",
   ctx.__CONCL().pf.clear === true);
ok("and ONLY THEN does the commit control exist", /id="cx-go"/.test(d4));
ok("the commit control carries the producer's own label", new RegExp(`id="cx-go"[^>]*>${PUBLISHED.conclude.label}<`).test(d4));
ok("nothing has been written yet", DOCS["INQ-2026-0001"].state === "open");
/* THE RUNG: conclude publishes none, and an absence renders as an absence */
ok("the ladder shows all four rungs", ["reversible","reasoned","terminal","attested"].every(r=>d4.includes(r)));
ok("no rung is MARKED, because the record declares none for this act", !/wl-rung on/.test(d4));
ok("and the absence is stated rather than read as lightness", /declares no weight for this act/.test(d4));

/* ============ (7) THE ACT, AND THE RECEIPT — THE PLANE'S TRANSITION AND ITS STAMP ============ */
await ctx.__do();
const rc = dlg();
const commit = CALLS.filter(c=>c.op==="conclude").pop();
ok("the commit named the target — the one field every pre-flight withheld", commit.params.target === "INQ-2026-0001");
ok("the commit sent the member's own conclusion, unmodified",
   commit.params.conclusion === "The sewer fund paid for marina construction in the 2024 cycle.");
ok("the browser never sends an author (the plane stamps it)",
   !("author" in commit.params) && !("actor" in commit.params));
ok("RECEIPT: the plane's own transition", /from <b>open<\/b> to <b>concluded<\/b>/.test(rc));
ok("RECEIPT: the SERVER-STAMPED actor, said to be the record's stamp",
   rc.includes("m_alice") && /the record's own stamp, not this page's/.test(rc));
ok("RECEIPT: the plane's own count of what it rests on", /rests on 4 legs/.test(rc));
ok("the record actually moved", DOCS["INQ-2026-0001"].state === "concluded");

/* ============ (8) NO_BASIS: THE RESIDUE THE PROBE CANNOT REACH ============ */
const p5 = await openPage("INQ-2026-0005");
ok("a question resting on nothing still publishes the act (the state machine permits the move)",
   p5.includes(PUBLISHED.conclude.label));
await ctx.__openConclude("INQ-2026-0005", DOCS["INQ-2026-0005"].title, PUBLISHED.conclude);
ok("its live pair says, in the PLANE'S words, that it rests on nothing",
   dlg().includes("this inquiry rests on nothing on this axis"));
ok("and UNRATED is the word", /UNRATED/.test(preview(dlg())));
await ctx.__author("conclusion", "The surplus went to the marina.");
await ctx.__author("falsifier", "a ledger showing otherwise");
ok("the pre-flight clears — NO_BASIS is BELOW the withheld field in the store's order and cannot be probed",
   ctx.__CONCL().pf.clear === true);
await ctx.__do();
ok("so the plane refuses at commit, and ITS words are what appear",
   dlg().includes(REF.NO_BASIS) && /NO_BASIS/.test(dlg()));
ok("no receipt is rendered for a refused act", !/from <b>/.test(dlg()));
ok("and the question is untouched", DOCS["INQ-2026-0005"].state === "open");

/* ============ (9) A MACHINE CREDENTIAL IS REFUSED BY THE PLANE, IN ITS WORDS ============ */
AS_MACHINE = true;
await ctx.__author("conclusion", "The surplus went to the marina.");
ok("a machine credential's pre-flight carries back the plane's FIRST refusal, above every other",
   dlg().includes(REF.MACHINE_CANNOT_CONCLUDE));
ok("and the commit is absent", !/id="cx-go"/.test(dlg()));
AS_MACHINE = false;

/* ============ (10) THE FAIL-CLOSED GUARD, DRIVEN ============ */
PREFLIGHT_ACCEPTS = true;
await ctx.__author("conclusion", "anything at all");
ok("a plane that ACCEPTS an incomplete check fails the pre-flight CLOSED",
   ctx.__CONCL().pf.clear === false && ctx.__CONCL().pf.refusal.reason === "PREFLIGHT_NOT_REFUSED");
ok("the commit is absent, and the surface says nothing was committed",
   !/id="cx-go"/.test(dlg()) && /Nothing was committed from this surface/.test(dlg()));
PREFLIGHT_ACCEPTS = false;

/* ============ (11) DEC-8: NO REFUSAL STRING ORIGINATES IN THE SURFACE ============
   Every refusal sentence this suite rendered, checked against the exact set the
   mock plane returned. The ONE named exception is the fail-closed guard driven
   just above — the surface saying its OWN probe misbehaved and that nothing was
   committed, which states no rule of the record's. */
const SURFACE_OWN = "The record accepted a check that was supposed to be incomplete. "
                  + "Nothing was committed from this surface.";
const RENDERED = [];
for(const html of [d0, d1, d4, rc, dlg(), p1, p5])
  for(const m of html.matchAll(/<div class="intent-ref-why">([^<]*)<\/div>/g)) RENDERED.push(m[1]);
ok("the suite actually rendered refusals to check", RENDERED.length >= 3);
const invented = RENDERED.filter(s=>s !== SURFACE_OWN && !SAID.includes(s));
ok(`every refusal sentence rendered is one the plane returned${invented.length?` — invented: ${JSON.stringify(invented)}`:""}`,
   invented.length === 0);
ok("and none of the plane's sentences is written down in app.html",
   Object.values(REF).every(s=>!APP.includes(s)));

if(fails.length){ console.error(`conclude-act: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`conclude-act: ${n} assertions, all green — every act, label and rung read from op=affordances (proven by moving the plane's answer), the pre-flight the plane's own in the plane's own order with the target withheld and nothing written, the commit ABSENT while it refuses, an empty conclusion field, the live PAIR moving independently as legs are selected, and no refusal string originating in the surface`);
