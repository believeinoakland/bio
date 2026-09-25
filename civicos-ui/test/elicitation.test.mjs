/* NEGATIVE CONTROL: (UI-27's FOUR arms, each broken ALONE, RUN 2026-08-04 by ui27-agent against the 47-assertion suite, `civicos-ui/app.html` restored BYTE-IDENTICALLY after every arm — sha256 compared before and after each and equal to 214610070f1fc24fb6572605d6336e37196bb76487eea618ba2eaeb73c74b81c every time.)
 *   (k) SHOW A STRENGTH BEFORE THE STRUCTURE IS AUTHORED — in `elicPaint`'s authoring branch, ask the record what the question reads at and draw it, exactly as the conclude flow legitimately does: above `const rows = ELIC.legs.map(...)` insert `const __lp = ELIC.__pv || null; if(!ELIC.__pv) livePair(ELIC.id).then(r=>{ if(ELIC){ ELIC.__pv = r; elicPaint(); } }); const preview = (__lp && __lp.ok) ? GRADE_AXES.map(ax=>axisPanel(ax, __lp.pair[ax], ELIC.legs)).join("") : "";` and prepend `preview` to `rows`. RUN: 3 of 47 fail — both authoring phases carry a grade, and the wire carries a strength read before the act. THIS IS DEC-32 CLAUSE 5's WHOLE SUBJECT: *"a member shown the grade first will reorganise legs against it."*
 *       AND THE ARM CORRECTED THE SUITE, which is the most useful thing it did. On its FIRST run only ONE assertion fired — the WIRE one — because the mock had no answer for `op=inquirystrength`, so the preview rendered EMPTY and "no grade appears on this phase" was true whether the surface asked for one or not. An outcome that costs nothing to produce, in the exact shape CLAUDE.md names, and it would have left the markup sweep looking like an instrument for the rest of this file's life. The mock now ANSWERS that op (with the pair the record holds), the arm was re-run against the corrected instrument, and 1 failure became 3. Keep both instruments: not drawn is weaker than not asked, and each catches what the other cannot.
 *   (l) LEAK THE ANALYST'S VOCABULARY ONTO THE SURFACE — in `elicPaint`'s read-back branch, change the set heading `Carries it on its own` to `Ground (OR-related branch)`. RUN: 1 of 47 fails, and it NAMES every hit: four banned patterns on each of three phases (the read-back, the read-back of a revision, and the refusal), 12 in all, with the matched text printed. The sweep is over everything this flow RENDERS in every phase, because DEC-32 clause 1 says *"not even as tooltips"* and a rule that only reads the headings is a rule about headings.
 *   (m) PREFILL THE MEMBER'S EARLIER ANSWERS — in `openElicit`, after `ELIC.standing = elicStanding(fmj);` add `for(const st of ELIC.standing.sets) for(const i of st.ords) ELIC.ans[i] = { holds:true, falls:st.ords.filter(x=>x!==i) };`. RUN: 1 of 47 fails, naming the revision's controls. It looks like a courtesy and it is the one way round the anti-gaming keystone: independent sufficiency would then survive a restructuring BY OMISSION, which is exactly what clause 4 says it must never do — the member would be able to keep a sufficiency claim by clicking past it.
 *   (n) SEND AN ATTRIBUTION — in `doElicit`, add the member's own name and a time to every set: in the `d.partition.map(...)` return, spread `{ asserted_by: (PLANE.me && PLANE.me.member) || "member", at: new Date().toISOString() }` into both branches. RUN: 2 of 47 fail, both on the WIRE. The record stamps both fields and DISCARDS a caller's (REC-45), so this changes nothing the record stores today — which is precisely why it is asserted on the wire: a surface that sends an attribution is a surface that would be believed the day anything downstream stopped discarding one, and an attribution a caller can hand us is one a caller can invent (CLAUDE.md).
 *   UI-75's SIX arms (§12 (c): the shared origin at the read-back), RUN 2026-09-25 by the UI-75 worker against this 61-assertion suite, each broken ALONE, every file restored by `cp` from a per-arm pristine copy and verified by sha256 AND cmp (`civicos-ui/app.html` 712a2e3064bdc76acb48c4146663d5cc2b11260c73b067f1e5a21b725e2642b6 after every arm). Baseline 61/61.
 *   (o) THE ROW'S OWN CONTROL — the mock's `partitionAnswer` returns `shared:[]` (its push replaced by `void common;`). RUN: RED 56/61, failing BY NAME at "UI-75 (the correlated fixture): the two sets that trace to one captured copy are NAMED as sharing it", plus the four arms that read the shared card.
 *   (p) DROP THE RENDERING — `elicOriginsHtml` returns "". RUN: RED 53/61 (8 fail), the correlated-fixture arm, the traced-none arm and the not-told arm among them.
 *   (q) A GATE — `doElicit` returns without writing while a shared origin is on screen. RUN: RED 49/61 (12 fail), "the answers are written UNCHANGED over a shared origin" among them. ITS FIRST RUN FOUND THE INSTRUMENT WRONG: with no body sent, section 4's bare `SENT.grounds[0]` threw and the module ended at tally -1 — a crash, not a named failure. Those reads are now guarded (commented at the site) and the arm re-run to 12 named failures.
 *   (r) A REORDER — `doElicit` reverses the sets when an origin is shared. RUN: RED 58/61, "written UNCHANGED" failing by name. This and (q) are the row's "how a liar passes it".
 *   (s) CACHE NOT TOLD AS AN ANSWER — `elicOriginsLoad` skips on the key alone. RUN: RED 60/61, "after a refusal, returning to the same proposal asks the record again" failing by name.
 *   (t) OVER-STRICTNESS, MUST PASS — send the partition as bare position arrays (the plane files them `part N`) and map `part k+1` back to the member's reasons. RUN: GREEN 61/61: the suite asserts the positions asked about and the words rendered, never one wire spelling of a set's name.
 * Restore after each. */
/* UI-27 · DEC-32's ELICITATION — the surface that asks a member for
 * CONSEQUENCES and derives the structure from their answers.
 *
 * THE ORGANISING QUESTION, and it is not "does the dialog contain the words".
 * Bob's constraint is that *"the average CivicOS member doesn't have a
 * philosophy degree"* AND that *"we don't want a user to be able to game the
 * system by packaging the legs across different claims to beneficially raise or
 * lower the strength to match their bias"* — both halves, from one design. So
 * this suite is built around the four ways that design could be shipped in name
 * only:
 *
 *   1. IT COULD ASK FOR THE STRUCTURE. Every question this flow puts to a
 *      member is asserted to be about a CONSEQUENCE of their own reasoning, and
 *      the vocabulary sweep runs over everything it renders in every phase.
 *
 *   2. IT COULD SHOW THE STRENGTH FIRST. Asserted in two instruments — the
 *      markup carries no grade, letter or state before the record has answered,
 *      and the WIRE carries no strength read at all before the commit.
 *
 *   3. IT COULD LET SUFFICIENCY ARRIVE BY OMISSION. The conservative default is
 *      driven: one necessary reason and the flow authors NOTHING and offers no
 *      control that would; an unanswered flow reaches no control either; and a
 *      restructuring starts from empty rather than from the member's own
 *      earlier answers.
 *
 *   4. IT COULD BLOCK THE REVISION, or hide it. Restructuring is driven end to
 *      end: refused without a reason IN THE RECORD'S OWN WORDS, accepted with
 *      one, and the receipt carries the record's stamp — which this surface
 *      never sent.
 *
 * WHAT IS DELIBERATELY NOT ASSERTED HERE: the arithmetic. What a partition
 * COMPOSES TO is REC-42's and REC-45's, driven against the real plane in
 * `bio-plane/test/grounds.test.mjs` and `bio-plane/test/inquiryground.test.mjs`.
 * This suite asserts what a member is ASKED, what is DERIVED from their answers,
 * what is SENT, and what is SHOWN BACK — and takes every number in the receipt
 * from the record's own answer without checking its value, because a surface
 * that checked it would be a surface with an opinion about it.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one — ONE implementation, so `bio-plane/test/tally-through-pipe.test.mjs` guards it for
   both estates and a node release closing the private door goes red once instead of half. The
   import is for its SIDE EFFECT and is idempotent. Census: `stdio-census.test.mjs`. */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
/* UI-53: the DEC-32 clause 1 ban family is DERIVED IN ONE PLACE and this suite
   CONSUMES it. It used to hand-write its own `BANNED` list here; four such lists
   existed in this directory, no two agreed, and NOT ONE carried `independently
   sufficient` — the phrase that was actually reaching members. See
   `analyst-vocabulary.mjs` for what the family is derived from and what it
   cannot see. */
import { analystHits, reachLine } from "./analyst-vocabulary.mjs";
/* THE PUBLISHED PROMPT, IMPORTED AND NEVER TRANSCRIBED. `op=affordances` sends
   the act's own wording (DEC-29(b), REC-16's mechanism) and this surface renders
   it verbatim; a suite that typed its own copy would be asserting that the
   surface renders A prompt rather than THE prompt. This is check-semantics'
   discipline applied to one string. */
import { GROUND_PROMPT } from "../../bio-plane/src/affordances.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ============================================================
   THE FIXTURE. Four reasons on one question, shaped as `op=projection`'s
   `fm_json` carries them — the plane's OWN parse of the document's frontmatter,
   which is the read UI-11's page already takes.

   INQ-A is UNGROUPED: nothing in its basis names a set and there is no
   `grounds` key, so the record is in FIRST ANSWER and the act asks for no
   reason. INQ-B already carries an answer, so a further one is a REVISION.
   ============================================================ */
const A = "INQ-2026-7001", B = "INQ-2026-7002", EMPTY = "INQ-2026-7003";
const L1 = "INFO-2026-9001", L2 = "INFO-2026-9002", L3 = "INFO-2026-9003", L4 = "INFO-2026-9004";

const LEGS = [
  { target:L1, role:"supports", grade:"B", grade_axis:"capture",    grade_source:"capture" },
  { target:L2, role:"supports", grade:"D", grade_axis:"capture",    grade_source:"testimony" },
  { target:L3, role:"supports", grade:"A", grade_axis:"connection", grade_source:"resolution" },
  { target:L4, role:"supports", grade:"C", grade_axis:"connection", grade_source:"resolution" },
];
/* The pair the RECORD holds. It is in the fixture ONLY so that the answer to
   `op=inquiryground` can carry a real before/after — nothing before the commit
   may render any of it, which is what this suite is largely about. */
const AXIS = (axis, grade, weakest) => ({ axis, state:"graded", grade, weakest:{ target_id:weakest },
  load_bearing:2, population:2, detail:`${axis} ${grade} — no stronger than the weakest ${axis} it rests on, which is ${weakest}.` });
const BEFORE = { capture:AXIS("capture","D",L2), connection:AXIS("connection","C",L4) };
const AFTER  = { capture:AXIS("capture","B",L1), connection:AXIS("connection","A",L3) };

/* INQ-B's standing answer, in the document's own shape: a label on every leg
   plus one attributed row per label. */
const B_LEGS = LEGS.map((l,i)=>({ ...l, ground: i < 2 ? "reasons 1 2" : "reasons 3 4" }));
const B_ROWS = [
  { ground:"reasons 1 2", asserted_by:"carol", at:"2026-08-03T10:00:00Z" },
  { ground:"reasons 3 4", asserted_by:"carol", at:"2026-08-03T10:00:00Z" },
];

const ACT = { id:"inquiryground", label:"Group what this rests on", weight:"single",
              needs:"contribute", mode:"session", rung:null, prompt:GROUND_PROMPT };

const DOCS = {
  [A]:     { legs:LEGS,   rows:null,   state:"investigating", title:"Was the sewer transfer authorised?" },
  [B]:     { legs:B_LEGS, rows:B_ROWS, state:"investigating", title:"Who approved the transfer?" },
  [EMPTY]: { legs:[],     rows:null,   state:"open",          title:"Where did the surplus go?" },
};

/* UI-75 · WHERE EACH REASON'S MATERIAL CAME FROM, in `#independenceOf`'s own
   prefixes. L1 and L3 were captured from ONE copy — the correlated pair the row's
   acceptance names — and L2 and L4 share nothing with anything. The mock derives
   `shared` from THIS and from the partition the page actually SENT, so a page
   that sent the wrong grouping reads a different answer; it does not hand back a
   constant a page could pass without asking. */
const SHARED_SHA = "a".repeat(16);
const ORIGIN_OF = {
  [L1]: [`bundle:${L1}`, `capture:${SHARED_SHA}`],
  [L2]: [`bundle:${L2}`, `address:https://example.test/memo`],
  [L3]: [`bundle:${L3}`, `capture:${SHARED_SHA}`],
  [L4]: [`bundle:${L4}`],
};
let PI_REFUSE_NEXT = false; // the record refuses the next origins read
function partitionAnswer(inq, raw){
  const legs = (DOCS[inq] || { legs:[] }).legs;
  const groups = (Array.isArray(raw) ? raw : []).map((g,k)=>{
    const named = g && typeof g === "object" && !Array.isArray(g);
    return { label: named ? String(g.label) : `part ${k+1}`, ords: named ? g.legs : g };
  });
  const sets = groups.map(g => [g.label, new Set(g.ords.flatMap(o => ORIGIN_OF[legs[o].target] || []))]);
  const shared = [];
  for(let i=0;i<sets.length;i++) for(let j=i+1;j<sets.length;j++){
    const common = [...sets[i][1]].filter(o => sets[j][1].has(o));
    if(common.length) shared.push({ a:sets[i][0], b:sets[j][0], through:common });
  }
  return { ok:true, inquiry:inq, partition:groups.map(g=>({ label:g.label, legs:g.ords })), wrote:false,
           independence:{ checked: groups.length > 1, parts: groups.length, shared, complete:true, limit:50 },
           /* PLANTED, and the plane sends no such key (REC-161: "shows NO STRENGTH").
              It is here so that "only `independence` is kept" is MEASURED: if the
              page drew anything else from this answer, the grade sweep over the
              read-back would find this pair's letters. */
           strength: AFTER };
}

/* ---------------- the mock plane ---------------- */
const WIRE = [];
let SENT = null;            // the LAST body posted to op=inquiryground
let REFUSE_NEXT = null;     // a refusal the record is to answer with

function mockFetch(u, opts){
  const url = new URL(String(u), "https://plane.test");
  const op = url.searchParams.get("op");
  const body = (opts && opts.body) ? JSON.parse(opts.body) : null;
  WIRE.push({ op, id:url.searchParams.get("id"), target:url.searchParams.get("target"), body });
  const R = o => ({ ok:true, json:async()=>o });
  /* WRAPPED, every one of them: these reach the browser through index.mjs's
     generic passthrough, so the answer is {ok:true, result:<the store's own
     return>} and a mock that answered flat would prove nothing (D-173). */
  if(op === "projection"){
    const d = DOCS[url.searchParams.get("id")];
    if(!d) return R({ ok:true, result:null });
    const fm = { basis:d.legs, ...(d.rows ? { grounds:d.rows } : {}) };
    return R({ ok:true, result:{ bundle_id:url.searchParams.get("id"), object_type:"inquiry",
      title:d.title, current_state:d.state, fm_json:JSON.stringify(fm) } });
  }
  if(op === "affordances"){
    const t = url.searchParams.get("target");
    if(!t) return R({ ok:true, result:{ target:null, catalog:[ACT], vocabularies:{} } });
    const d = DOCS[t];
    if(!d) return R({ ok:true, result:{ ok:false, reason:"NO_SUCH_BUNDLE", target:t } });
    return R({ ok:true, result:{ target:t, object_type:"inquiry", current_state:d.state,
      acts: d.legs.length ? [ACT] : [], vocabularies:{} } });
  }
  if(op === "image"){
    const d = DOCS[url.searchParams.get("id")];
    if(!d) return R({ ok:true, result:null });
    return R({ ok:true, result:{ "bundle.md":
      `---\nobject_type: inquiry\ncurrent_state: ${d.state}\ntitle: ${d.title}\n---\n## The Question\n\nA question.\n` } });
  }
  if(op === "backlinks") return R({ ok:true, result:{ ok:true, target:url.searchParams.get("target"), backlinks:[] } });
  /* THE PLANE ANSWERS THIS ONE, AND THAT IS DELIBERATE. Nothing in this flow may
     ask it before the act — which is exactly why the mock must be able to
     ANSWER it. A mock that refused would make "no grade is rendered" an outcome
     that costs nothing to produce (CLAUDE.md): the letters would be absent
     because the record said nothing, not because the surface asked nothing.
     Negative control (k) measured precisely that on its first run. */
  if(op === "inquirystrength") return R({ ok:true, result:{ ok:true, ...BEFORE } });
  if(op === "whoami") return R({ ok:true, result:{ member:"carol", session:true, capabilities:["contribute"] } });
  if(op === "partitionindependence"){
    if(PI_REFUSE_NEXT){ PI_REFUSE_NEXT = false;
      return R({ ok:true, result:{ ok:false, reason:"PARTITION_INDEPENDENCE_UNREADABLE", code:"PARTITION_INDEPENDENCE_UNREADABLE",
        detail:"pass partition=<JSON>" } }); }
    return R({ ok:true, result: partitionAnswer(url.searchParams.get("id"), body && body.partition) });
  }
  if(op === "inquiryground"){
    SENT = body;
    if(REFUSE_NEXT){ const r = REFUSE_NEXT; REFUSE_NEXT = null; return R({ ok:true, result:r }); }
    const rows = (body.grounds || []).map(g => ({ ground:g.ground, legs:g.legs,
      statement:g.statement ?? null, asserted_by:"carol", at:"2026-08-04T12:00:00Z",
      carried_forward:false }));
    return R({ ok:true, result:{ ok:true, target:body.target,
      act: DOCS[body.target] && DOCS[body.target].rows ? "restructured" : "authored",
      grouped: rows.length > 0, grounds:rows, legs:(DOCS[body.target]||{legs:[]}).legs.length,
      reason: body.reason ?? null, asserted_by:"carol", at:"2026-08-04T12:00:00Z", weight:"single",
      bundleSha:"f".repeat(64),
      strength:{ before:BEFORE, after: rows.length ? AFTER : BEFORE } } });
  }
  return R({ ok:false, error:"unexpected op " + op });
}

/* ---- a DOM stub good enough for innerHTML inspection ---- */
const els = new Map();
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, open:false, addEventListener(){},
  querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }

const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
    hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:async(u,opts)=>mockFetch(u,opts) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() +
  ";globalThis.__PLANE=PLANE;globalThis.__openInquiry=openInquiry;globalThis.__ACT_FLOW=ACT_FLOW;" +
  "globalThis.__actGo=actGo;globalThis.__openElicit=openElicit;globalThis.__ELIC=()=>ELIC;" +
  "globalThis.__elicAnswer=elicAnswer;globalThis.__elicWith=elicWith;globalThis.__elicPhase=elicPhase;" +
  "globalThis.__elicSay=elicSay;globalThis.__doElicit=doElicit;globalThis.__elicAgain=elicAgain;" +
  "globalThis.__TEST=ELIC_OPERATIONAL_TEST;", ctx);

ctx.__PLANE.session = true;
ctx.__PLANE.token = "t";
ctx.__PLANE.me = { member:"carol", session:true, administer:false, capabilities:["contribute"] };

const dlg = () => els.get("#dlg")._html;
const strip = h => String(h).replace(/<[^>]*>/g, " ").replace(/&middot;/g, "·").replace(/&mdash;/g, "—")
  .replace(/&amp;/g, "&").replace(/&hellip;/g, "…").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&rsquo;/g, "'").replace(/\s+/g, " ").trim();

/* EVERY PHASE THIS FLOW RENDERS, kept for the sweep at the end. The sweep is
   the item's acceptance clause and it must see the WHOLE flow, not the phase
   that happened to be on screen when it ran. */
const SURFACES = [];
const keep = (where) => { SURFACES.push([where, dlg()]); return dlg(); };

console.log("\n--- elicitation (UI-27 / DEC-32) ---");

/* ============ 1. THE ACT IS REACHED THROUGH THE RECORD'S OWN PUBLICATION ============ */
{
  await ctx.__openInquiry(A);
  ok("the flow is registered for the act the plane publishes, and under the plane's own name for it",
     typeof ctx.__ACT_FLOW.inquiryground === "function");
  /* REACHABLE BY A CALLER, not merely present in a map. A flow nobody can open
     from the page is a feature nobody has (CLAUDE.md's "test through the op",
     one layer up), and the control it is opened by carries the PRODUCER'S label
     rather than one written here. */
  {
    const page = els.get("#content")._html;
    ok("the question's own act bar offers it, under the record's own label for it",
       /What can be done here/.test(page)
       && /onclick="actGo\(&quot;inquiryground&quot;/.test(page) && page.includes(ACT.label));
  }
  ctx.__actGo("inquiryground", A, DOCS[A].title);
  await new Promise(r => setTimeout(r, 0));
  const d = keep("authoring, first answer");
  ok("opening it reads the plane's own parse of the document and nothing else about strength",
     WIRE.some(w => w.op === "projection" && w.id === A));
  ok("the act's published LABEL is rendered verbatim and is not re-worded here", d.includes(ACT.label));
  ok("the act's published PROMPT is rendered verbatim — the wording rides the act (DEC-29(b))",
     strip(d).includes(strip(GROUND_PROMPT)));
}

/* ============ 2. ONE CONSEQUENCE QUESTION PER LEG, AND IT IS THE MECHANISM ============ */
{
  const d = dlg();
  const asked = [...d.matchAll(/data-consequence="1"[^>]*>([\s\S]*?)<\/p>/g)].map(m => strip(m[1]));
  ok("every reason the question rests on is asked about, one at a time", asked.length === LEGS.length);
  /* DEC-32 clause 2, VERBATIM. This is the whole elicitation: the member is
     asked what FOLLOWS if the reason went the other way, never what the reason
     IS to the argument. */
  ok("and the question asked is the consequence question, in the ruling's own words",
     asked.every(q => q === "If this turned out to be wrong, would your answer still hold?"));
  ok("the two answers offered are consequences and not relationships",
     /No &mdash; my answer falls with it\./.test(d) && /Yes &mdash; my answer still holds\./.test(d));
  /* NOTHING IS PREFILLED and nothing is defaulted: a member who has answered
     nothing has claimed nothing, and reaches no control. */
  ok("no answer is preselected for the member",
     !/checked/.test(d) && !/name="h0"[^>]*checked/.test(d));
  ok("and with nothing answered there is no control at all — not a greyed one, absent",
     !/id="el-read"/.test(d) && !/id="el-go"/.test(d));
}

/* ============ 3. THE STRUCTURE IS DERIVED, NEVER ASKED FOR ============ */
{
  /* The member says their answer survives each of the four, and that reasons 1
     and 2 fall together, as do 3 and 4. Nobody was asked how many sets there
     are, what they are called, or how they relate. */
  ctx.__elicAnswer(0, true); ctx.__elicAnswer(1, true);
  ctx.__elicAnswer(2, true); ctx.__elicAnswer(3, true);
  const withOthers = keep("authoring, the follow-up");
  ok("saying the answer survives opens ONE follow-up, and it is also a consequence question",
     /Which of the others stop carrying your answer the moment this one does\?/.test(withOthers));
  ctx.__elicWith(0, 1); ctx.__elicWith(2, 3);
  ok("with every reason answered the read-back becomes reachable", /id="el-read"/.test(dlg()));
  ok("UI-75: nothing about shared origins was asked while the member was still answering (DEC-69: once, at the act)",
     !WIRE.some(w => w.op === "partitionindependence"));
  const asking = ctx.__elicPhase("readback");
  /* THE READ-BACK AS FIRST PAINTED, before the record has answered: the control
     is ALREADY there. Waiting on the origins read would make it a gate. */
  const early = dlg();
  ok("UI-75: while the origins read is in flight the page says it is asking, and the control to record is already offered",
     /data-elic="origins-asking"/.test(early) && /id="el-go"/.test(early));
  await asking;
  const rb = keep("the read-back");
  /* THE DERIVED FALSIFIER, SHOWN BACK IN THE RULING'S OWN TWO SHAPES. */
  const fals = strip((/data-falsifier="1">([\s\S]*?)<\/div>/.exec(rb) || [,""])[1]);
  ok("the derived falsifier is shown back in plain words, in the ALL shape the ruling names",
     fals.startsWith("Your answer fails only if ALL of these fail:")
     && fals.includes(L1) && fals.includes(L2) && fals.includes(L3) && fals.includes(L4));
  ok("and it is one compound falsifier, never one per set",
     (rb.match(/data-falsifier="1"/g) || []).length === 1);
  ok("the derivation produced two sets from four consequence answers, and named neither of them for the member",
     (rb.match(/data-set="/g) || []).length === 2
     && /data-set="reasons 1 2"/.test(rb) && /data-set="reasons 3 4"/.test(rb));
  /* DEC-32's OPERATIONAL TEST, rendered VERBATIM against each set — the test a
     member can apply without the reasoning behind it. */
  ok("DEC-32's operational test is rendered verbatim, against each set",
     ctx.__TEST === "Would refuting this alone change your conclusion?"
     && (rb.match(/data-optest="1"/g) || []).length === 2
     && strip(rb).includes(ctx.__TEST));
  ok("the member can go back and correct an answer — the read-back is a check, not a confirmation step",
     /elicPhase\('author'\)/.test(rb));

  /* ---- UI-75 · §12 (c): THE SHARED ORIGIN, NAMED BEFORE ANYTHING IS WRITTEN ---- */
  const asked = WIRE.filter(w => w.op === "partitionindependence");
  ok("UI-75: the read-back asked the RECORD, once, about the partition as proposed — by position, for this question",
     asked.length === 1 && asked[0].id === A && asked[0].body
     && JSON.stringify(asked[0].body.partition.map(g => Array.isArray(g) ? g : g.legs)) === JSON.stringify([[0,1],[2,3]]));
  const shared = (/data-elic="origins-shared"[\s\S]*?(?=data-set=)/.exec(rb) || [""])[0];
  const said = [...rb.matchAll(/data-elic="origin">([\s\S]*?)<\/div>/g)].map(m => strip(m[1]));
  ok("UI-75 (the correlated fixture): the two sets that trace to one captured copy are NAMED as sharing it, in the member's own reasons",
     said.length === 1 && said[0].includes(L1) && said[0].includes(L2) && said[0].includes(L3) && said[0].includes(L4)
     && said[0].includes("the same captured copy, fingerprint " + SHARED_SHA));
  ok("UI-75: and it is said ONCE, beside the falsifier it qualifies and above the sets",
     (rb.match(/data-elic="origins-shared"/g) || []).length === 1
     && rb.indexOf('data-falsifier="1"') < rb.indexOf('data-elic="origins-shared"')
     && rb.indexOf('data-elic="origins-shared"') < rb.indexOf('data-set='));
  ok("UI-75: it informs and does not stop — the page says so, and the control to record is still offered",
     /This does not stop you\./.test(strip(shared)) && /id="el-go"/.test(rb));
  ok("UI-75: no set name the record filed the question under is shown instead of the member's reasons",
     !/reasons 1 2 shares|reasons 3 4/.test(strip(shared)));
  /* INFORM ONCE is also a property of the WIRE: re-painting the read-back, or
     returning to it with the SAME answers, does not ask again. */
  ctx.__elicPhase("author"); await ctx.__elicPhase("readback");
  ok("UI-75: returning to the same read-back with the same answers does not ask the record again",
     WIRE.filter(w => w.op === "partitionindependence").length === 1
     && /data-elic="origins-shared"/.test(dlg()));
  /* CLAUSE 5, INSTRUMENT ONE: no strength anywhere, in any phase, before the
     record has answered. */
  for(const [where, html] of SURFACES){
    const t = strip(html);
    ok(`no grade, letter or state appears on ${where}`,
       !/subj-grade|pub-grade/.test(html) && !/\bGrade [ABCD]\b/.test(t)
       && !/\bUNRATED\b/.test(t) && !/undetermined/i.test(t));
  }
  /* CLAUSE 5, INSTRUMENT TWO, and it is the one that cannot be got round: the
     strength was never even ASKED for. */
  ok("and no strength read was made at all before the act — not drawn is weaker than not asked",
     !WIRE.some(w => ["inquirystrength","strength","basis"].includes(w.op)));
}

/* ============ 4. WHAT IS SENT, AND WHAT IS NOT ============ */
{
  ctx.__elicSay("reasons 1 2", "the ledger and the memo carry this without the resolution.");
  await ctx.__doElicit();
  ok("the act went through op=inquiryground and through nothing else",
     WIRE.filter(w => w.op === "inquiryground").length === 1);
  ok("the partition travels in the BODY, addressed by POSITION and never by target id",
     SENT && SENT.target === A && Array.isArray(SENT.grounds) && SENT.grounds.length === 2
     && JSON.stringify(SENT.grounds.map(g => g.legs)) === JSON.stringify([[0,1],[2,3]])
     && !JSON.stringify(SENT.grounds).includes(L1));
  /* THE ATTRIBUTION IS THE RECORD'S. REC-45 stamps `asserted_by` and `at` from
     the session and the clock and DISCARDS a caller's — so a surface that sent
     them would be sending something that is only ignored until it is not. */
  ok("no name and no time is sent for any set — the record stamps both",
     !JSON.stringify(SENT).includes("asserted_by") && !JSON.stringify(SENT).includes('"at"')
     && !JSON.stringify(SENT).includes("carol"));
  ok("an optional statement is sent when the member wrote one, and is absent when they did not",
     /* GUARDED 2026-09-25 (UI-75's control arm q): with NO body sent, the bare
        `SENT.grounds[0]` threw a TypeError that ended the module before its tally
        (-1), so a page that silently wrote nothing read as a crash rather than as
        these assertions failing by name. */
     !!(SENT && Array.isArray(SENT.grounds) && SENT.grounds.length === 2)
     && SENT.grounds[0].statement === "the ledger and the memo carry this without the resolution."
     && SENT.grounds[1].statement === undefined);
  ok("no reason is sent on a FIRST answer: there is no earlier answer for it to be a revision of",
     !!SENT && SENT.reason === undefined);   /* guarded: UI-75 arm q, as above */
}

/* ============ 5. THE RECEIPT — AND THE FIRST STRENGTH THIS FLOW HAS SHOWN ============ */
{
  const r = keep("the receipt");
  const t = strip(r);
  ok("the receipt shows BOTH strengths, from the record's own two axis objects",
     /Documents/.test(t) && /Links/.test(t) && (r.match(/subj-grade/g) || []).length >= 2);
  ok("it shows what the pair was BEFORE and what it is now, both the record's own",
     /Before/.test(t) && /Now/.test(t) && /Grade D/.test(t) && /Grade B/.test(t));
  ok("and it says WHY the strength is only here — the order is the mechanism",
     /This is the first time this page has shown you a strength/.test(t));
  ok("the attribution rendered is the RECORD'S stamp and is named as such",
     /carol/.test(t) && /2026-08-04T12:00:00Z/.test(t)
     && /the record's own stamp, not this page's, and not anything this page sent it/.test(t));
  ok("each set is shown with the name and the time the record put on it",
     (r.match(/Asserted by carol on 2026-08-04T12:00:00Z/g) || []).length === 2);
  /* CLAUSE 6's ROUTE, offered at the one moment it matters: the member has now
     seen what their answers reached. */
  ok("the route back is offered here, after the strength, and is not a warning",
     /id="el-again"/.test(r) && /That is allowed, it is not refused, and it is recorded/.test(t));
}

/* ============ 6. RESTRUCTURING: RECORDED AND ATTRIBUTED, NEVER BLOCKED ============ */
{
  /* A question that ALREADY carries an answer. The record decides that this is
     a revision — from the document, never from a parameter — and this surface
     reads the same document. */
  ctx.__actGo("inquiryground", B, DOCS[B].title);
  await new Promise(r => setTimeout(r, 0));
  const d = keep("authoring, a revision");
  ok("what the record already holds is read back in plain words",
     /You have answered this before/.test(strip(d))
     && strip(d).includes(L1) && strip(d).includes(L3));
  /* THE ANTI-GAMING KEYSTONE. The earlier answers are NOT restored: a
     sufficiency claim may never survive by omission. */
  ok("and the member's earlier answers are NOT filled in — sufficiency is claimed again or not at all",
     !/checked/.test(d)
     && /saying that something carries your answer on its own is a thing you say each time you say it/.test(strip(d)));
  ctx.__elicAnswer(0, true); ctx.__elicAnswer(1, true);
  ctx.__elicAnswer(2, true); ctx.__elicAnswer(3, true);
  ctx.__elicWith(0, 2);
  await ctx.__elicPhase("readback");
  const rb = keep("the read-back, a revision");
  /* THE SAME TWO REASONS NOW SIT IN ONE SET, so nothing is shared BETWEEN sets —
     and the page says the record traced and found none, rather than saying
     nothing (which would read as not asked). */
  ok("UI-75: over a partition whose sets share nothing, the page says the record traced and found none shared",
     /data-elic="origins-none"/.test(rb) && !/data-elic="origins-shared"/.test(rb)
     && /found none of it shared between them/.test(strip(rb)));
  ok("the reason field is present because the record requires one for a change, and says whose rule that is",
     /id="el-why"/.test(rb) && /The record requires this whenever you change an answer you already recorded/.test(strip(rb)));
  /* REFUSED WITHOUT A REASON, IN THE RECORD'S OWN WORDS — this surface composes
     none of it and does not decide in advance that it would be refused. */
  REFUSE_NEXT = { ok:false, reason:"NO_REASON", target:B, restructure:true,
    detail:"this question already carries an authored structure, so changing it is a REVISION and records WHY." };
  await ctx.__doElicit();
  const ref = keep("the record's refusal");
  ok("a change with no reason is refused BY THE RECORD, and the refusal is rendered in its own words",
     /NO_REASON/.test(ref) && /so changing it is a REVISION and records WHY/.test(strip(ref)));
  ok("and nothing about the refusal was computed here — the act was ASKED",
     WIRE.filter(w => w.op === "inquiryground").length === 2);
  ctx.__elicSay("reason", "the resolution turned out to rest on the same memo, so it never stood on its own.");
  await ctx.__doElicit();
  const done = keep("the receipt, a revision");
  ok("with a reason it is RECORDED, never blocked — and the reason is kept beside it",
     /Changed/.test(strip(done)) && /it never stood on its own/.test(strip(done)));
  ok("the reason reached the record, and only the reason: the name and the time are still the record's",
     !!SENT && SENT.reason === "the resolution turned out to rest on the same memo, so it never stood on its own."
     && !JSON.stringify(SENT).includes("asserted_by"));
}

/* ============ 7. THE CONSERVATIVE DEFAULT, DRIVEN ============ */
{
  /* One necessary reason and the whole basis stays together. This is the
     keystone reached through the ANSWERS: the record holds a partition whole or
     not at all, and the honest whole is the one that claims least. */
  ctx.__actGo("inquiryground", A, DOCS[A].title);
  await new Promise(r => setTimeout(r, 0));
  ctx.__elicAnswer(0, false); ctx.__elicAnswer(1, true);
  ctx.__elicAnswer(2, true);  ctx.__elicAnswer(3, true);
  ctx.__elicWith(1, 2);
  ctx.__elicPhase("readback");
  const rb = keep("the read-back, one necessary reason");
  const fals = strip((/data-falsifier="1">([\s\S]*?)<\/div>/.exec(rb) || [,""])[1]);
  ok("the derived falsifier takes the ANY shape the ruling names for a basis nothing stands apart from",
     fals.startsWith("Your answer fails if ANY of these fails:"));
  ok("no set is derived at all, and the page says the record keeps them together",
     !/data-set="/.test(rb) && /the record keeps them together/.test(strip(rb))
     && /which is the reading that claims least/.test(strip(rb)));
  ok("and there is NO control: an act that would be refused is not offered, greyed or explained away",
     !/id="el-go"/.test(rb)
     && /there is nothing to write and this page offers no control that would write it/.test(strip(rb)));
  const before = WIRE.filter(w => w.op === "inquiryground").length;
  ok("nothing was sent", WIRE.filter(w => w.op === "inquiryground").length === before);
  ok("UI-75: with no sets there is nothing to trace between, so the origins read is not made and nothing is said of it",
     !/data-elic="origins-/.test(rb) && WIRE.filter(w => w.op === "partitionindependence").length === 2);
}

/* ============ 7a. UI-75 · NOT TOLD IS NOT CLEAN, AND THE ANSWERS ARE WRITTEN UNCHANGED ============ */
{
  /* The record refuses the origins read. The page must say it was NOT TOLD —
     never that nothing is shared — and must still write exactly what the member
     answered. */
  ctx.__actGo("inquiryground", A, DOCS[A].title);
  await new Promise(r => setTimeout(r, 0));
  ctx.__elicAnswer(0, true); ctx.__elicAnswer(1, true);
  ctx.__elicAnswer(2, true); ctx.__elicAnswer(3, true);
  ctx.__elicWith(0, 1); ctx.__elicWith(2, 3);
  PI_REFUSE_NEXT = true;
  await ctx.__elicPhase("readback");
  const rb = keep("the read-back, origins not told");
  ok("UI-75: a refused origins read renders as NOT TOLD, never as traced-and-clean",
     /data-elic="origins-untold"/.test(rb) && !/data-elic="origins-none"/.test(rb)
     && /That is not the same as being told they do not\./.test(strip(rb)));
  /* NOT TOLD IS NOT AN ANSWER, so it is not kept: coming back to the same
     proposal asks again (an ANSWER is kept — section 3's last arm). Then THE
     ACCEPTANCE CLAUSE'S SECOND HALF, driven with a SHARED origin on screen: the
     body must be the one a page with no origins read would send. */
  const before = WIRE.filter(w => w.op === "partitionindependence").length;
  ctx.__elicPhase("author"); await ctx.__elicPhase("readback");
  ok("UI-75: after a refusal, returning to the same proposal asks the record again, and this time it is told the origin is shared",
     WIRE.filter(w => w.op === "partitionindependence").length === before + 1
     && /data-elic="origins-shared"/.test(dlg()));
  await ctx.__doElicit();
  ok("UI-75: the answers are written UNCHANGED over a shared origin — the same sets, in the same order, nothing held back",
     SENT && SENT.target === A
     && JSON.stringify(SENT.grounds) === JSON.stringify([{ ground:"reasons 1 2", legs:[0,1] }, { ground:"reasons 3 4", legs:[2,3] }])
     && /Recorded/.test(strip(dlg())));
}

/* ============ 8. A QUESTION THAT RESTS ON NOTHING ============ */
{
  ctx.__openElicit(EMPTY, DOCS[EMPTY].title, ACT);
  await new Promise(r => setTimeout(r, 0));
  const d = keep("a question resting on nothing");
  ok("a question with no reasons says so and offers nothing to answer",
     /This question rests on nothing yet/.test(strip(d)) && !/data-consequence/.test(d));
}

/* ============ 9. THE SWEEP — DEC-32 CLAUSE 1, OVER EVERY PHASE ============
   *"NEVER show AND / OR / disjunction / grounds — not even as tooltips."* The
   sweep runs over everything this flow rendered in every phase above, and it is
   the item's acceptance clause rather than a spot check. The patterns are the
   ones REC-45 holds its own published prompt and label to, so the act and its
   surface are judged by one rule.

   CORRECTED 2026-08-09 (UI-53), never exempted, and the old list was not merely
   shorter — IT WAS WRONG ABOUT ITS OWN SCOPE. It carried five patterns and the
   comment above claimed the act and its surface were judged by ONE rule, but
   THREE other suites in this directory carried their own lists and NO TWO
   AGREED: this one had no `partition` (three others did) and, like all four, no
   `independently sufficient` — the phrase `Store.#axisResult` was rendering to
   members and freezing into signed `bundle.md` frontmatter (D-269). The rule is
   now literally one rule: `analyst-vocabulary.mjs` derives it from DEC-32 clause
   1's own sentence and this sweep consumes it. NOTHING ELSE IN THIS SECTION
   MOVED — same corpus, same phases, same wire-name arm. */
{
  console.log("  " + reachLine());
  const hits = [];
  for(const [where, html] of SURFACES){
    const t = strip(html);
    for(const h of analystHits(t)) hits.push(`${where}: ${h.token} — ${h.why}`);
  }
  ok("not one analyst word reaches the member on any surface this flow renders: " + (hits.join(" | ") || "clean"),
     hits.length === 0);
  ok("and the sweep actually saw the whole flow rather than one phase of it",
     SURFACES.length >= 8 && SURFACES.every(([, h]) => String(h).length > 0));
  /* POLARITY, ADDED BY UI-53 — this suite had NONE. Three of the four sweeps
     carried a planted witness and this one did not, so a family that silently
     matched nothing would have read exactly like a clean surface here. */
  ok("INSTRUMENT: the derived family DOES fire on a planted analyst sentence, so the arm above is a measurement rather than a silence",
     analystHits("the ground partition of this OR-related set is independently sufficient").length > 0);
  /* THE WIRE NAME IS NOT A SURFACE, and the distinction is the ruling's own:
     the act is reached by its published id and that id is never printed. */
  ok("the act's wire name is used to reach it and is never rendered to the member",
     SURFACES.every(([, h]) => !strip(h).includes("inquiryground")));
}

console.log(`elicitation: ${n - fails.length}/${n} assertions`);
if(fails.length){ console.error(`elicitation: ${fails.length} FAILED`); process.exit(1); }
