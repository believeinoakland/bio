/* NEGATIVE CONTROL: every arm below was RUN on 2026-08-07 by ui47-agent, through `node civicos-ui/test/run.mjs` (the whole harness, never this suite alone), and EVERY RESTORE WAS VERIFIED BY CONTENT AS WELL AS sha256 — an NC harness in this repository once reported a byte-identical restore over a file that had NOT been restored, so the hash alone is not trusted here. Each mutation also passes a "the file really was modified" guard before the harness runs, because UI-46's reach injection became a SILENT NO-OP by being anchored on the very line its defect removes. Clean tree: 70 pass, 0 fail.
   (0) THE ITEM'S OWN — UN-WIRE THE READ. In app.html put `aiSessionRead` back to `return null;` -> 13 FAIL / 48 pass, and every one names what a member can no longer see: W0b (0 chars rendered from the address), W0c (op=airun never called by the surface), W1, W2 (status), W3 (ticks), W4 (both principals), W5 x2 (each bound's allowed/consumed pair), W7, W9, W10 (the condition kind), W11 (the plane's own explanation), N5 (the polarity arm — the run a viewer MAY see stops rendering too). AND `surface-registry.test.mjs` fails INDEPENDENTLY with ARM D4: *"surface 'ai-session' declares read 'airun', which app.html never calls — a described read nothing performs is fiction"*. Two structurally different instruments, neither told about the other.
   (1) MAKE THE PLANE PUBLISH A DIFFERENT BOUND AND THE SURFACE MUST MOVE WITH IT. In bio-plane/src/store.mjs, `aiRunRead`, publish a constant instead of the record: `allowed: 500` -> 6 FAIL / 59 pass: W1b x2 and W1c x2 NAME THE BOUND and print stored-versus-published (*"bound 'fetches' is PUBLISHED as it was STORED — allowed 5246, consumed 1272 (published 500/1272)"*), plus W6 and W7. **THE FIRST RUN OF THIS CONTROL FAILED ONLY 2 ARMS AND THAT IS WHY ARM W1b EXISTS.** W1 compares the render against the wire and reads the wire through the SAME op the surface reads, so when the plane published 500 the surface faithfully rendered 500 and W1 stayed GREEN — both ends of the comparison came from one source, an equality that costs nothing to produce. W1b anchors the far end on what was WRITTEN, so the chain is store -> publish -> render and a break anywhere in it is named.
   (2) A PERCENTAGE, BY ANY ROUTE. In app.html's `aiSessionPairsHtml` append `Math.round(row.consumed/row.allowed*100)+'%'` -> 4 FAIL / 61 pass: D1 x2 naming each computed percentage, D2 (a percent sign at all), and **ARM S5 INDEPENDENTLY** — the sweep catches it as a visible token the record did not publish, without knowing anything about percentages. Two instruments, one defect, no shared assumption.
   (3) TELL THE TWO ABSENCES APART. In app.html's `aiSessionRead`, answer `{id: ans.run, status: "unknown-run"}` when `found === false` -> 2 FAIL / 64 pass: N2 (*the surface invented a notice where the record said nothing*) and N4 (*the read stopped answering null*), plus `surface-registry.test.mjs` ARM Y1c independently. **AND THE CORRECTION THIS CONTROL FORCED IS RECORDED RATHER THAN QUIETLY MADE:** N1 first compared the two panels RAW and went red because the two ADDRESSES differ — a failure with nothing to do with disclosure. It is re-anchored with the caller's own id normalised out, and N1b now states the structural fact the control exposed: **the plane hands the surface nothing to branch on, so the oracle is prevented at the record; what a surface can still do wrong is INVENT a notice, and that is N2's subject.**
   (4) NEUTER A WALK, EACH INDEPENDENTLY. (a) the sweep's function discovery returns [] -> 3 FAIL / 63 pass, all REACH AS A DELTA with the corpus PRINTED (*"0 functions declared", "0 renderers", "0 visible tokens swept"*) — note that S5 itself stays GREEN over the empty corpus, which is exactly why the REACH arms exist. (b) the vocabulary walk's term list emptied -> 2 FAIL / 64 pass: V0 (REACH, *"0 vocabulary terms imported, floor 20"*) and V2 (the polarity arm). **(b)'s FIRST DRAFT WAS `[].concat([...])`, WHICH IS A SILENT NO-OP** — the file changes, the modification guard passes, and every term survives. Recorded because it is the same class as UI-46's anchor and it very nearly went unnoticed here too.
   (5) A SECOND OP ASKED FROM THE BLOCK (DEC-61's real rule). Add `await recR("airunlog", {run:id})` beside the run read -> `surface-registry.test.mjs` ARM Y1 fails (*one call, op=airun, and nothing else*), with ARM Y14's op-set pin behind it.
   (6) THE STALE REGISTRY ENTRY RESTORED — `reads: []` with `pending: {publishers:["IS-6","IS-9"]}` -> `surface-registry.test.mjs` ARM X4b fails: the surface would be advertising a gap that has closed.
   (6b) A SECOND SURFACE RENDERS THE RUN — the CLASS control, and the one that reaches past this single read. Add `function someOtherScreenShowsTheRun(s){ return aiSessionPanelHtml(s, null); }` immediately after the block's END marker -> 1 FAIL / 69 pass: ARM C2, naming that a path outside the swept functions can now put run data in front of a member. `SURFACES["ai-session"].kind` guards the REGISTRY against a second AI-session surface; this guards the CODE, one layer below it.
   (6c) UI-49, 2026-08-07 — **ARM C2 IS SUPERSEDED AND CORRECTED IN PLACE WITH A DATED REASON, NEVER EXEMPTED.** It forbade ANY call to the block's renderers from outside the block, which was true when written — and UI-47's own sweep is what found out WHY: `aiSessionIndicatorHtml` had NO CALL SITE AT ALL, so §14a's promise was undelivered. UI-49 adds exactly the call C2 forbade; left standing it would have made delivering the promise FAIL THE BUILD. The replacement is NARROWER rather than weaker — the outside world may call ONE named door (`aiSessionContextHtml`) and none of the raw renderers — and **ARM C3 is new and is what stops C2 from passing because nothing outside renders a run at all**, which is the state UI-47 measured. **BOTH CONTROLS RUN 2026-08-07 through the whole harness, app.html restored and verified by CONTENT and sha256 after each:** removing the call from BOTH windows -> this suite fails 1 (ARM C3) and `ai-session-context.test.mjs` fails 20 INDEPENDENTLY, naming each window; adding `aiSessionPanelHtml(null, null)` to `openBundle` — a window reaching PAST the door — -> this suite fails 1 (ARM C2) and nothing else in the harness notices, which is exactly the containment this arm exists to hold. ARM V's vocabulary is also WIDENED to include `RUN_STATUS`, because UI-49 gave the indicator's animation a source and the natural wrong way to do that would have been a `=== "running"` inside this block.
   (7) POLARITY was confirmed on every pin: GREEN with the tree intact FIRST, then RED with the defect, never the reverse. ARM N5 and ARM V2 are the in-suite polarity arms and run on every pass.
   (8) OVER-STRICTNESS, IN-SUITE AND ON EVERY RUN: ARM O drives a run record shaped unlike anything this file writes — `{meter, ceiling, spent_so_far}` and `{paid_by, who}` — and requires it to RENDER, judged by the SAME function ARM W used rather than by a second, gentler one.
   (9) THE HAND COPY, IN-SUITE AND ON EVERY RUN: ARM W6 runs a hand-authored record through the SAME `wireFailures` the real record passed, and it must FAIL. It also PRINTS what the hand copy gets for free — measured at 3 of 12 top-level values (`id`, `status`, `ticks`), which are real vocabulary rather than instance data — so the arm names what a hand copy cannot know instead of counting how much it got wrong. */
/* ai-session-wire.test.mjs — UI-47.
 *
 * THE ITEM IN ONE SENTENCE: UI-38 shipped the once-only running-session surface
 * with field-name-blind renderers and NO OP TO READ, because nothing published a
 * run. IS-6 published one. This wires `aiSessionRead()` to `op=airun` and proves
 * that what a member sees is what the record said.
 *
 * ---- WHY THIS SUITE DRIVES THE REAL PLANE AND MOCKS NOTHING ----
 *
 * IS-6's ARM U already proved the CONTRACT from the other side: it lifted
 * UI-38's real renderers out of `app.html` and fed them the plane's own answer.
 * That is not re-litigated here. But ARM U reached into the answer and handed
 * the renderers `.session` ITSELF — so the one thing UI-47 adds, the READ that
 * has to know where `session` lives inside the plane's answer, was the one thing
 * neither side had exercised. A mock cannot close that: a mock's envelope is
 * this file's OPINION of the plane's shape, and D-173 is nine shipped instances
 * of exactly that opinion being wrong while the suite stayed green. So the plane
 * runs for real, in miniflare, and `app.html`'s own `recR` speaks to it.
 * `intent-write.test.mjs` established the precedent; this follows it.
 *
 * ---- WHY EVERY FIXTURE VALUE IS DRAWN AT RUNTIME ----
 *
 * "A hand copy agrees at ZERO COST" has now cost this project three separate
 * instruments: a sourcing arm went green over a complete hand copy of 131 op
 * names; UI-46's bound arm agreed for free because the surface's ask and the
 * plane's default were both 500; and UI-41's ceiling and its caller matched by
 * coincidence. The structural answer here is that **there is nothing to hand-copy
 * TO**: the allowances, the consumptions, the labels, the skill version and the
 * account references are drawn from `Math.random()` on every run and printed. A
 * literal in `app.html` cannot match a number that did not exist when it was
 * written. That is not a substitute for the hand-copy control — ARM W runs one
 * anyway, in-suite, through the same function — it is what makes the control
 * cheap enough to run on every single pass.
 *
 * ---- THE THREE CONSTRAINTS THAT ARE NOT THIS SURFACE'S TO RELAX ----
 *
 *  - `allowed` and `consumed` are stored and published SEPARATELY and NO
 *    percentage and NO remainder exists anywhere in the record. The pin is over
 *    RENDERED OUTPUT, so a derivation introduced by ANY route fails (ARM D).
 *  - `session: null` answers IDENTICALLY for an unknown run and for one the
 *    viewer may not see. Distinguishing them would be an ORACLE — a way to
 *    enumerate projects you were never invited to by watching which absence you
 *    got. Both are driven for real and their RENDERED OUTPUT is compared (ARM N).
 *  - Where no record exists the surface shows NO INDICATOR, not an invented
 *    "nothing is running". That is UI-38's behaviour and it stays (ARM N).
 *
 * ---- AND THE SWEEP, WHICH IS THE QUESTION BEHIND THE ITEM ----
 *
 * The question is not whether this one read works. It is whether the surface can
 * render ANYTHING THE RECORD DID NOT PUBLISH. Two walks answer it, and neither
 * matches a spelling — UI-46 measured, one item ago, that five capped ops went
 * invisible to the walk built to catch them the moment the spelling changed:
 *
 *   ARM S — every function declared in the block is DISCOVERED from the source
 *     and CLASSIFIED BY DRIVING IT (does it return markup?), never by its name.
 *     Every renderer is then fed the record's OWN SHAPE with every scalar
 *     replaced by a unique sentinel, and every visible token in its output must
 *     be a sentinel or a published KEY. A fallback sentence, an invented label,
 *     a unit word or a computed number is none of those.
 *   ARM V — the plane's run vocabularies are LIVE-IMPORTED and the block is
 *     required to hold no copy of them. ARM S proves nothing extra renders for
 *     the shapes driven; ARM V proves there is no branch that COULD render a
 *     word the record did not send on this run.
 */
import fs from "fs";
import vm from "vm";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
/* THE VOCABULARIES, LIVE-IMPORTED. Not read as text and not copied: if IS-6
   renames a bound, this import moves with it and ARM V keeps meaning the same
   thing. */
import { RUN_BOUNDS, RUN_ENDINGS, OBSERVATION_STATES, OBSERVATION_LEVELS, RUN_STATUS }
  from "../../bio-plane/src/airun.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }
function eq(msg, got, want){ ok(`${msg}${JSON.stringify(got) === JSON.stringify(want) ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`,
                               JSON.stringify(got) === JSON.stringify(want)); }

/* ---- the REAL plane, in miniflare. `miniflare` is bio-plane's dev dependency;
   resolve it from there rather than duplicating a node_modules tree under
   civicos-ui. If it is absent the harness FAILS rather than skipping — a suite
   that quietly stops testing its subject is the defect the negative-control rule
   exists to catch, and this one's whole point is that the read is not mocked. */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("ai-session-wire: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/ (this suite drives the actual plane; the read is never mocked).");
  console.error("  " + String(e && e.message || e));
  process.exit(1);
}

const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui47", MEMBER_TOKEN: "mem-ui47", PROBE_TOKEN: "prb-ui47", VERSION: "test" },
});

const TOK = "mem-ui47";
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* Direct plane calls, for SEEDING and for INDEPENDENT verification only. Every
   call the SURFACE makes goes through the bridged fetch further down. */
const post = async (op, body, qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${TOK}${qs}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get  = async (op, qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${TOK}&${qs}`)).json());

/* The DURABLE OBJECT, reached directly. This is the ONLY place a chosen viewer
   stamp can be produced at all — the control plane always stamps its own, which
   is the correct posture and is exactly why IS-6's own gate arms are driven
   here too. It is used for ONE thing: to obtain the plane's real answer for a
   run the viewer MAY NOT SEE. */
const ns = await mf.getDurableObjectNamespace("STORE");
const dobj = ns.get(ns.idFromName("bio"));

/* ---- THE FIXTURE VALUES, DRAWN AT RUNTIME. See the header. ---- */
const R = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const tag = () => Math.random().toString(36).slice(2, 10);
/* THE RANGES ARE WIDE AND FOUR-DIGIT ON PURPOSE, AND THE FIRST DRAFT'S NARROW
   ONES ARE THE REASON. With `subsessions` drawn at 5 allowed / 2 consumed, the
   REMAINDER was 3 — and the run's `ticks` was also 3, so ARM D could not tell a
   derivation the surface must never compute from a value the record genuinely
   published. The arm failed against CORRECT behaviour. Four-digit allowances put
   every derivation out of reach of the record's own small integers, and ARM D0b
   below ASSERTS the disjointness rather than trusting it, so nobody removes the
   precaution later as an arbitrary choice of numbers. */
const FETCH_ALLOWED  = R(3001, 6999);
const FETCH_CONSUMED = R(1007, 1499);
const SUBS_ALLOWED   = R(7001, 9973);
const SUBS_CONSUMED  = R(2003, 2999);
const RUNTIME_ALLOWED = R(2, 5);
const LABEL      = `label-${tag()}`;
const MODE       = `mode-${tag()}`;
const CLAUDE_LVL = `project`;                      /* §14a's cascade word; the LEVEL is a real vocabulary, so it is not randomised — the REF beside it is */
const CLAUDE_REF = `acct-${tag()}`;
const SKILL      = `skill-${tag()}`;
console.log(`  fixture drawn at runtime — fetches ${FETCH_CONSUMED}/${FETCH_ALLOWED}, `
  + `subsessions ${SUBS_CONSUMED}/${SUBS_ALLOWED}, label ${LABEL}, ref ${CLAUDE_REF}, skill ${SKILL}`);
console.log(`  (a literal in app.html cannot match a value that did not exist when it was written)`);

/* ---- seed: one inquiry every member can see, one PROJECT nobody was invited
   to. The project is what makes the "may not see" half of ARM N a REAL
   withholding rather than a simulated one. ---- */
const T0 = "2026-08-07T09:00:00Z";
const SHA = "a".repeat(64);
const promote = (id, objectType) => post("promote", {
  bundleId: id, base: null, snapKey: "20260807T090000Z_inbox", author: "ruth",
  meta: { object_type: objectType, group: "believe-in-oakland",
          title: `fixture ${id}`,
          current_state: objectType === "project" ? "forming" : "open",
          created: T0, last_updated: T0 },
  files: [{ path: "bundle.md", text: `---\nid: ${id}\n---\n\n## Question\n\nfixture\n`,
            bytes: 40, sha256: SHA }],
  register: [],
});
const INQ  = "INQ-2026-0807-ui47-running-session";
const PROJ = "PROJ-2026-0807-ui47-uninvited";
await promote(INQ, "inquiry");
await promote(PROJ, "project");

const openRun = (run, contextType, contextId, bounds, extra = {}) => post("airunopen", {
  run, contextType, contextId, label: LABEL, mode: MODE,
  principalClaude: CLAUDE_LVL, principalClaudeRef: CLAUDE_REF, skillVersion: SKILL,
  bounds, ...extra,
});

/* RUN_LIVE — running, ticked, two bounds with their allowed/consumed pairs. */
const RUN_LIVE = "RUN-ui47-live";
await openRun(RUN_LIVE, "inquiry", INQ, [
  { bound: "fetches",     allowed: FETCH_ALLOWED, consumed: 0, unit: "requests" },
  { bound: "subsessions", allowed: SUBS_ALLOWED,  consumed: 0, unit: "sessions" },
]);
await post("airuntick", { run: RUN_LIVE, consume: { fetches: FETCH_CONSUMED, subsessions: SUBS_CONSUMED } });
await post("airuntick", { run: RUN_LIVE, consume: {} });

/* RUN_STOPPED — a run a BOUND stopped, so there is a terminal condition to
   render. `runtime` is used because its condition carries a KIND as well as a
   detail, and the surface must render both verbatim. */
const RUN_STOPPED = "RUN-ui47-stopped";
await openRun(RUN_STOPPED, "inquiry", INQ, [
  { bound: "runtime", allowed: RUNTIME_ALLOWED, consumed: 0, unit: "ceilings" },
]);
await post("airuntick", { run: RUN_STOPPED, consume: { runtime: RUNTIME_ALLOWED } });

/* RUN_PROJ — over the project nobody was invited to. */
const RUN_PROJ = "RUN-ui47-inproject";
await openRun(RUN_PROJ, "project", PROJ, [{ bound: "fetches", allowed: 7, consumed: 1, unit: "requests" }]);

/* ============================================================
   THE SURFACE, RUNNING FOR REAL
   ============================================================ */

/* The DOM stub, the shape UI-4's harness established. */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
    remove(){}, onclick:null, onchange:null };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };
const html = (s) => $$(s)._html;

/* THE BRIDGE — app.html's own fetch, answered by the real plane.
 *
 * `VIEWER` is the one knob, and it exists for ARM N alone. Left null, every call
 * goes through the CONTROL PLANE, which is the caller's only real route (D-43,
 * `op=invitelook`) and which stamps the viewer itself. Set to a member id, the
 * `op=airun` call is routed to the Durable Object with THAT viewer — the only
 * way a "may not see" answer can be produced at all, and the same route IS-6's
 * own gate arms use. The SURFACE cannot tell the difference and is not told:
 * both routes hand it the same `{ok:true, result:…}` envelope, so `aiSessionRead`
 * runs one code path under both. */
let VIEWER = null;
const CALLED = [];
async function bridgeFetch(u, opts){
  const url = new URL(u, "http://x");
  const op = url.searchParams.get("op");
  CALLED.push(op);
  if(VIEWER && op === "airun")
    return dobj.fetch(`http://x/airun?run=${encodeURIComponent(url.searchParams.get("run"))}`
      + `&viewer=${encodeURIComponent(VIEWER)}`);
  return mf.dispatchFetch(url.toString(), opts);
}

const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:bridgeFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE","SURFACES","aiSessionRead","aiSessionOpen","aiSessionPanelHtml","aiSessionIndicatorHtml",
  "aiSessionInContext","aiSessionBudgetHtml","aiSessionPrincipalHtml","aiSessionConditionHtml",
  "aiSessionPairsHtml","aiSessionTranscript","aiSessionRouteFromHash",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.token = TOK;
U.PLANE.base = "";
U.PLANE.session = true;
U.PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };

/* The member's own path: an address, opened. `aiSessionOpen` does the read and
   writes the panel, so everything below inspects what a member would see. */
const openPanel = async (runId) => { $$("#content")._html = ""; await U.aiSessionOpen(runId, true); return html("#content"); };

/* ============================================================
   ARM W · EVERY VALUE COMES FROM THE WIRE
   ============================================================ */
console.log("\n--- ARM W · the run renders, and every value is the record's ---");

/* THE ONE FUNCTION. The real record and the hand-typed one both go through
   THIS, so there is no parallel path in which a hand copy could agree at zero
   cost — the sourcing failure UI-38 measured and fixed structurally. It returns
   the values that did NOT reach the surface, so a failure NAMES them. */

/* DOES THIS VALUE APPEAR ON THE SURFACE AS A VALUE? **ONE matcher, used by ARM W
   to ask whether a published figure arrived and by ARM D to ask whether a
   derived one did.** Two matchers would be two instruments disagreeing about
   what "on the surface" means, and the derive-nothing pin would be judged by a
   different rule from the one the wire pin passed.
      IT IS BOUNDARY-AWARE, AND THE FIRST DRAFT'S PLAIN `includes()` IS WHY. A
   bare `includes("4")` finds a 4 in a timestamp, an id or a longer number, so
   EVERY small integer read as present and a HAND-TYPED `allowed: 4` passed for
   free — the hand copy agreeing at zero cost, inside the arm whose entire
   subject is that hand copies agree at zero cost. Multi-word values (the plane's
   condition sentences) still match as substrings, because a sentence has no
   token boundary to speak of and cannot collide by accident the way `4` can. */
const RE_ESC = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function appearsAsAValue(rendered, v){
  const s = String(v);
  if(!/^[\w.:@/-]+$/.test(s)) return String(rendered).includes(s);
  return new RegExp(`(^|[^\\w.:@/-])${RE_ESC(s)}([^\\w.:@/-]|$)`).test(String(rendered));
}

function wireFailures(rendered, session){
  const missing = [];
  const seen = (v, what) => {
    if(v === null || v === undefined || v === "") return;
    if(!appearsAsAValue(rendered, v)) missing.push(`${what}=${JSON.stringify(v)}`);
  };
  if(!session || typeof session !== "object") return ["no session record at all"];
  for(const [k, v] of Object.entries(session)){
    if(v === null || typeof v === "object") continue;
    seen(v, `session.${k}`);
  }
  for(const [k, v] of Object.entries(session.principal || {})) seen(v, `principal.${k}`);
  for(const b of Array.isArray(session.budget) ? session.budget : [])
    for(const [k, v] of Object.entries(b || {})) seen(v, `budget[${b.bound}].${k}`);
  if(session.condition) for(const [k, v] of Object.entries(session.condition)) seen(v, `condition.${k}`);
  return missing;
}

const WIRE_LIVE = (await get("airun", `run=${RUN_LIVE}`)).session;
ok("ARM W0: the plane published a run for this suite to render at all — a null here would make every arm below vacuous",
   !!WIRE_LIVE && WIRE_LIVE.id === RUN_LIVE);
const PANEL_LIVE = await openPanel(RUN_LIVE);
ok(`ARM W0b: the surface rendered ${PANEL_LIVE.length} chars from the address alone`, PANEL_LIVE.length > 100);
ok("ARM W0c: and it got there through op=airun, called by the SURFACE and not by this file",
   CALLED.includes("airun"));

const liveMissing = wireFailures(PANEL_LIVE, WIRE_LIVE);
eq("ARM W1: EVERY scalar the record published for this run is on the surface — status, ticks, both principals, "
   + "every bound with its allowed/consumed pair, and nothing the record published is dropped", liveMissing, []);

/* ARM W1b OPENS THE LOOP, AND IT WAS ADDED BECAUSE A NEGATIVE CONTROL SHOWED W1
   COULD NOT SEE THE PLANE LYING. W1 asks *does the surface render what the wire
   answered*, and reads the wire through the SAME op the surface reads — so when
   negative control (1) made `aiRunRead` publish a constant `allowed: 500`
   instead of the record's own, the surface faithfully rendered 500 and W1 stayed
   GREEN. Both ends of that comparison come from one source, which is an equality
   that costs nothing to produce (CLAUDE.md). This arm anchors the far end on what
   was WRITTEN — the values this suite handed `op=airunopen` and `op=airuntick` —
   so the chain is store -> publish -> render and a break anywhere in it is named. */
{
  const written = { fetches: { allowed: FETCH_ALLOWED, consumed: FETCH_CONSUMED },
                    subsessions: { allowed: SUBS_ALLOWED, consumed: SUBS_CONSUMED } };
  for(const [bound, want] of Object.entries(written)){
    const pub = (WIRE_LIVE.budget || []).find(b => b.bound === bound);
    ok(`ARM W1b: bound '${bound}' is PUBLISHED as it was STORED — allowed ${want.allowed}, consumed ${want.consumed} `
       + `(published ${pub ? pub.allowed : "—"}/${pub ? pub.consumed : "—"}). The record's own figures, not the caller's ask`,
       !!pub && pub.allowed === want.allowed && pub.consumed === want.consumed);
    ok(`ARM W1c: and BOTH of '${bound}''s stored figures reach the member's surface, so the whole chain store -> `
       + `publish -> render carries the record rather than a constant anywhere along it`,
       appearsAsAValue(PANEL_LIVE, want.allowed) && appearsAsAValue(PANEL_LIVE, want.consumed));
  }
}
/* The named halves of the acceptance, asserted individually so a failure says
   WHICH one, rather than "the set differs". */
ok(`ARM W2: the run's STATUS (${WIRE_LIVE.status}) renders`, PANEL_LIVE.includes(WIRE_LIVE.status));
ok(`ARM W3: the run's TICKS (${WIRE_LIVE.ticks}) render`, new RegExp(`\\b${WIRE_LIVE.ticks}\\b`).test(PANEL_LIVE));
ok(`ARM W4 (§14a, DEC-27(b)): BOTH principals render — the plane credential (${WIRE_LIVE.principal.plane}) `
   + `and WHICH LEVEL of the Claude-account cascade pays (${WIRE_LIVE.principal.claude})`,
   PANEL_LIVE.includes(WIRE_LIVE.principal.plane) && PANEL_LIVE.includes(WIRE_LIVE.principal.claude));
ok("ARM W4b: and NO TOKEN VALUE is anywhere in what a member sees",
   !PANEL_LIVE.includes(TOK) && !/adm-ui47|prb-ui47/.test(PANEL_LIVE));
for(const b of WIRE_LIVE.budget)
  ok(`ARM W5 (F11): bound '${b.bound}' renders its ALLOWED (${b.allowed}) and its CONSUMED (${b.consumed}) as the `
     + `two separate figures the record stores separately`,
     PANEL_LIVE.includes(String(b.allowed)) && PANEL_LIVE.includes(String(b.consumed)));
ok(`ARM W5b: both bounds the record published are on the surface, not just the first (${WIRE_LIVE.budget.length} published)`,
   WIRE_LIVE.budget.length === 2);

/* THE HAND COPY, THROUGH THE SAME FUNCTION. Currently-correct in shape and
   wrong in its values, which is exactly what a literal written into app.html
   would be the day the record changed. It must FAIL. */
/* AUTHORED FROM SCRATCH, NEVER DERIVED FROM THE WIRE. The first draft built this
   by copying the plane's answer and overwriting four fields, which made the
   free-agreement measurement below meaningless — it counted values that had been
   READ, not values an author could have guessed. This is what somebody would
   actually type into `app.html`: the plane's own key names, entirely plausible
   values, correct in shape and wrong in fact. */
const HAND_TYPED = {
  id: RUN_LIVE,
  label: "the running session",
  mode: "check",
  status: "running",
  ticks: 3,
  created: "2026-08-07T09:00:00Z",
  updated: "2026-08-07T09:04:00Z",
  expires: "2026-08-07T09:30:00Z",
  context: { type: "inquiry", id: INQ },
  principal: { plane: "class:member", claude: "project", ref: "the-operator-account", skill: "v1" },
  budget: [{ bound: "fetches", allowed: 500, consumed: 0, unit: "requests" },
           { bound: "subsessions", allowed: 4, consumed: 1, unit: "sessions" }],
  condition: null,
};
const handMissing = wireFailures(PANEL_LIVE, HAND_TYPED);
/* WHAT THE HAND COPY GETS FOR FREE IS MEASURED AND PRINTED, not assumed away.
   `status`, `ticks`, the plane-credential class and the cascade LEVEL are real
   vocabulary rather than instance data, so a hand copy can name them correctly
   without ever reading the record — exactly the shape UI-46 measured when the
   surface's ask and the plane's default were both 500. The arm therefore names
   the values a hand copy CANNOT know and requires each of them to fail, instead
   of counting. */
const handFree = Object.entries(HAND_TYPED).filter(([k, v]) => v !== null && typeof v !== "object"
  && appearsAsAValue(PANEL_LIVE, v)).map(([k]) => k);
console.log(`  ARM W6 measurement: a hand copy agrees FOR FREE on ${handFree.length} top-level values (${handFree.join(", ")}) — `
  + `real vocabulary rather than instance data. That is why this arm names what it cannot know rather than counting.`);
for(const cannotKnow of [`principal.ref=${JSON.stringify(CLAUDE_REF)}`, `principal.skill=${JSON.stringify(SKILL)}`,
                         `budget[fetches].allowed=${FETCH_ALLOWED}`, `budget[subsessions].allowed=${SUBS_ALLOWED}`,
                         `budget[subsessions].consumed=${SUBS_CONSUMED}`])
  ok(`ARM W6: A HAND-TYPED RECORD FAILS THIS, AND THIS RUN IS THAT RECORD — it does not carry ${cannotKnow}, `
     + `a value drawn at runtime that no literal could have anticipated`,
     handMissing.some(m => m.startsWith(cannotKnow.split("=")[0] + "=")));
ok(`ARM W6c: and the hand copy fails on ${handMissing.length} values in total, every one of them instance data`,
   handMissing.length >= 5);
ok("ARM W6b: and it fails through the SAME function the real record passed, so there is no second path a hand copy "
   + "could be hidden in — the sourcing defect UI-38 measured and fixed structurally",
   wireFailures.length === 2);

/* THE SURFACE MOVES WITH THE RECORD. Two runs differing only in their published
   numbers must render differently, each carrying its own and NEITHER carrying
   the other's — which is the everyday form of negative control (1). */
const RUN_OTHER = "RUN-ui47-other";
const OTHER_ALLOWED = FETCH_ALLOWED + R(1000, 2000);
const OTHER_CONSUMED = FETCH_CONSUMED + R(1000, 2000);
await openRun(RUN_OTHER, "inquiry", INQ,
  [{ bound: "fetches", allowed: OTHER_ALLOWED, consumed: 0, unit: "requests" }]);
await post("airuntick", { run: RUN_OTHER, consume: { fetches: OTHER_CONSUMED } });
const PANEL_OTHER = await openPanel(RUN_OTHER);
ok(`ARM W7: a DIFFERENT record renders DIFFERENT figures — this run's allowance (${OTHER_ALLOWED}) is on its own panel`,
   PANEL_OTHER.includes(String(OTHER_ALLOWED)));
ok(`ARM W7b: and the OTHER run's allowance (${FETCH_ALLOWED}) is not, so the surface is reading rather than repeating`,
   !PANEL_OTHER.includes(String(FETCH_ALLOWED)));
ok(`ARM W7c: symmetrically, ${OTHER_ALLOWED} is absent from the first run's panel — checked in BOTH directions, `
   + "because a panel that showed everything would pass one of these for free",
   !PANEL_LIVE.includes(String(OTHER_ALLOWED)));

/* THE TERMINAL CONDITION, WHEN ONE EXISTS. */
const WIRE_STOPPED = (await get("airun", `run=${RUN_STOPPED}`)).session;
ok("ARM W8: the plane published a terminal condition for the run a bound stopped",
   !!(WIRE_STOPPED && WIRE_STOPPED.condition && WIRE_STOPPED.condition.kind));
const PANEL_STOPPED = await openPanel(RUN_STOPPED);
eq("ARM W9: every value on the stopped run reaches the surface too, its condition included",
   wireFailures(PANEL_STOPPED, WIRE_STOPPED), []);
ok(`ARM W10: the condition KIND renders verbatim (${WIRE_STOPPED.condition.kind})`,
   PANEL_STOPPED.includes(WIRE_STOPPED.condition.kind));
ok("ARM W11: and the plane's own explanation renders VERBATIM, never paraphrased — this surface holds no copy of "
   + "the condition vocabulary and prints what arrived",
   PANEL_STOPPED.includes(WIRE_STOPPED.condition.detail));
ok("ARM W12: a run that is still running publishes NO condition and the surface renders none — an absent condition "
   + "is a real state and not a gap to fill",
   WIRE_LIVE.condition === null);

/* ============================================================
   ARM D · IT DERIVES NOTHING (F11's pin, over RENDERED OUTPUT)
   ============================================================ */
console.log("\n--- ARM D · no percentage, no remainder, computed by no route ---");
{
  const derived = [];
  for(const b of WIRE_LIVE.budget){
    if(!b.allowed) continue;
    derived.push([`${b.bound} percent`, String(Math.round((b.consumed / b.allowed) * 100))]);
    derived.push([`${b.bound} percent (1dp)`, (Math.round((b.consumed / b.allowed) * 1000) / 10).toFixed(1)]);
    derived.push([`${b.bound} remainder`, String(b.allowed - b.consumed)]);
  }
  console.log(`  corpus: ${PANEL_LIVE.length} chars of RENDERED output; ${derived.length} derivations computed here and looked for`);
  ok(`ARM D0: ${derived.length} candidate derivations were computed to look for — an empty list would make D1 vacuous`,
     derived.length >= 6);
  /* THE INSTRUMENT ARM, AND IT IS HERE BECAUSE THE FIRST DRAFT FAILED AGAINST
     CORRECT BEHAVIOUR. With narrow fixture ranges the `subsessions` REMAINDER
     came out as 3 and the run's `ticks` was also 3, so D1 could not tell a
     forbidden derivation from a published value and went red over a surface
     doing exactly the right thing. A collision makes this arm meaningless in the
     GENEROUS direction just as easily, so the disjointness is ASSERTED rather
     than arranged and forgotten. */
  const publishedScalars = new Set();
  (function scal(v){
    if(Array.isArray(v)) return v.forEach(scal);
    if(v && typeof v === "object") return Object.values(v).forEach(scal);
    if(v !== null && v !== undefined) publishedScalars.add(String(v));
  })(WIRE_LIVE);
  const collisions = derived.filter(([, value]) => publishedScalars.has(value));
  eq("ARM D0b (instrument): no derivation this arm looks for COLLIDES with a value the record actually published — "
     + "a collision would make D1 unable to tell a forbidden derivation from a published figure, in either direction",
     collisions.map(c => c[0]), []);
  for(const [what, value] of derived)
    ok(`ARM D1: the surface does not compute the ${what} (${value}) — both figures are published and a third would be `
       + `this surface's own claim`,
       !appearsAsAValue(PANEL_LIVE, value));
  ok("ARM D2: and no percent sign is rendered at all, by any route",
     !PANEL_LIVE.includes("%") && !PANEL_STOPPED.includes("%") && !PANEL_OTHER.includes("%"));
  ok("ARM D3: nor any of the words a judgement would need — a colour threshold or a 'nearly exhausted' would be the "
     + "same claim in prose",
     !/\b(remaining|remainder|nearly|almost|left over|used up|exhausted|of the)\b/i.test(PANEL_LIVE));
}

/* ============================================================
   ARM N · THE TWO ABSENCES ARE ONE ABSENCE
   ============================================================ */
console.log("\n--- ARM N · unknown and unviewable render identically, and no record means NO INDICATOR ---");
{
  /* (a) A RUN THAT DOES NOT EXIST, through the control plane. */
  VIEWER = null;
  const PANEL_UNKNOWN = await openPanel("RUN-ui47-does-not-exist");
  /* (b) A RUN THAT DOES EXIST, over a project this member was never invited to.
     Driven at the Durable Object because that is the only place a chosen viewer
     stamp can be produced — the control plane always stamps its own. */
  VIEWER = "member:m_nobody";
  const PANEL_UNVIEWABLE = await openPanel(RUN_PROJ);
  VIEWER = null;

  /* First the plane's own halves, so a failure says WHICH layer moved. */
  const ansUnknown = await get("airun", `run=RUN-ui47-does-not-exist`);
  const ansUnviewable = rP(await (await dobj.fetch(
    `http://x/airun?run=${RUN_PROJ}&viewer=member:m_nobody`)).json());
  eq("ARM N0: the PLANE answers the two identically — apart from echoing back the id the caller itself supplied, "
     + "which is the caller's own word and discloses nothing",
     { ...ansUnknown, run: null }, { ...ansUnviewable, run: null });
  ok("ARM N0b: and the withholding is REAL — the same run answers when the viewer may see it, so N1 is not passing "
     + "because the fixture is broken",
     rP(await (await dobj.fetch(`http://x/airun?run=${RUN_PROJ}&viewer=class:member`)).json()).found === true);

  /* THE ID THE CALLER ITSELF TYPED IS NORMALISED OUT OF BOTH, AND THAT
     CORRECTION CAME FROM RUNNING THE CONTROL. The first cut compared the two
     panels raw, so it went red under negative control (3) because the two
     ADDRESSES differ — not because anything was disclosed. An arm that fails for
     a reason unrelated to its subject is an arm that will be "fixed" into
     uselessness later, so it is re-anchored on the claim: after removing the id
     the member themselves asked for, ANY remaining difference is a tell. */
  const norm = (h, id) => String(h).split(id).join("<THE ID THE CALLER ASKED FOR>");
  eq("ARM N1: THE SURFACE RENDERS THE TWO IDENTICALLY, once the address the member typed is set aside. Telling an "
     + "unknown run from one the viewer may not see would be an ORACLE — a way to enumerate projects nobody invited "
     + "you to by watching which absence you got",
     norm(PANEL_UNKNOWN, "RUN-ui47-does-not-exist"), norm(PANEL_UNVIEWABLE, RUN_PROJ));
  /* AND THE STRUCTURAL HALF, WHICH IS WHY N1 CAN NEVER BE THE WHOLE ARM: the
     surface cannot build an oracle out of an answer that carries no distinction,
     and N0 has just measured that it carries none. What a surface CAN still do
     wrong is INVENT a notice — and that is N2's subject, which is why negative
     control (3) lands there rather than here. Recorded as a measurement rather
     than left looking like a gap. */
  ok("ARM N1b: the plane hands the surface NOTHING to branch on — the two answers carry the same keys and the same "
     + "values apart from the caller's own echo, so the oracle is prevented at the record and cannot be re-introduced "
     + "here by accident",
     JSON.stringify(Object.keys(ansUnknown).sort()) === JSON.stringify(Object.keys(ansUnviewable).sort()));
  eq("ARM N2: and what it renders is NOTHING — not an invented \"nothing is running\", which would be a claim about "
     + "the record made by a surface that asked and was told nothing (UI-39's and UI-40's class)",
     PANEL_UNKNOWN, "");
  eq("ARM N3: no session record means NO INDICATOR either", U.aiSessionIndicatorHtml(null, { type:"inquiry", id:INQ }), "");
  eq("ARM N4: the read itself answers null for both, so the two collapse BEFORE anything renders — by construction "
     + "rather than by two render paths that happen to agree",
     [await (async()=>{ VIEWER=null; return U.aiSessionRead({ session:"RUN-ui47-does-not-exist" }); })(),
      await (async()=>{ VIEWER="member:m_nobody"; const r = await U.aiSessionRead({ session:RUN_PROJ }); VIEWER=null; return r; })()],
     [null, null]);
  /* AND THE POLARITY, which is what stops N1..N4 from passing because the
     surface renders nothing ever. */
  VIEWER = "class:member";
  const PANEL_VIEWABLE = await openPanel(RUN_PROJ);
  VIEWER = null;
  ok("ARM N5 (polarity): the SAME run, read by a viewer who may see it, renders — so the identical nothing above is "
     + "the gate working and not the surface being inert",
     PANEL_VIEWABLE.length > 100 && PANEL_VIEWABLE.includes(RUN_PROJ));
}

/* ============================================================
   ARM S · THE SWEEP — can the surface render anything the record did not publish?
   ============================================================ */
console.log("\n--- ARM S · the sweep: every visible token is a published value or a published key ---");
{
  const app = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const blockM = /\/\*__AI_SESSION_START__\*\/([\s\S]*?)\/\*__AI_SESSION_END__\*\//.exec(app);
  ok("ARM S0: the AI_SESSION block markers were found", !!blockM);
  const block = blockM ? blockM[1] : "";
  const stripped = block.replace(/\/\*[\s\S]*?\*\//g, "");

  /* THE WALK — DISCOVERED, NEVER TYPED, AND CLASSIFIED BY DRIVING. UI-46
     measured that a walk matching a SPELLING goes blind the moment the spelling
     changes; five capped ops vanished from a roster that way one item ago. So
     the corpus is every function DECLARED in the block, and what each one IS is
     decided by CALLING it and looking at what comes back. */
  const declared = [...stripped.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]);
  console.log(`  ARM S corpus: ${stripped.length} chars of comment-stripped block, ${declared.length} functions declared — ${declared.join(", ")}`);
  ok(`ARM S1 (REACH): the walk found ${declared.length} functions in the block, floor 8 — a walk over nothing passes everything`,
     declared.length >= 8);
  /* RESOLVED FROM THE VM CONTEXT, NOT FROM THIS FILE'S EXPORT LIST. A top-level
     `function` in the app script becomes a property of the context, so a
     renderer added to the block tomorrow is discovered AND driveable without
     anybody remembering to name it here. That is the difference between a walk
     that maintains itself and the hand-kept list UI-46 watched go blind. */
  const fromContext = declared.filter(name => typeof ctx[name] === "function");
  eq(`ARM S1b: every function the walk discovered resolves FROM THE VM CONTEXT, so the classification below runs over `
     + `the real functions and this file keeps no list that could fall behind them`,
     fromContext.length, declared.length);

  /* THE SENTINEL RECORD. Built from the PLANE'S OWN ANSWER — the record's exact
     shape, its exact keys, its exact nesting — with every scalar replaced by a
     token that exists nowhere else in the universe. Anything else that comes out
     of a renderer is something the surface contributed. */
  const SENT = [];
  let sc = 0;
  const sentinelise = (v) => {
    if(Array.isArray(v)) return v.map(sentinelise);
    if(v && typeof v === "object"){
      const o = {}; for(const [k, x] of Object.entries(v)) o[k] = sentinelise(x); return o;
    }
    if(v === null || v === undefined) return v;
    const s = `zqsentinel${sc++}zq`; SENT.push(s); return s;
  };
  const SENTINEL_SESSION = sentinelise(WIRE_STOPPED);
  const PUBLISHED_KEYS = new Set();
  (function keys(v){
    if(Array.isArray(v)) return v.forEach(keys);
    if(v && typeof v === "object") for(const [k, x] of Object.entries(v)){ PUBLISHED_KEYS.add(k.toLowerCase()); keys(x); }
  })(WIRE_STOPPED);
  console.log(`  ARM S sentinels: ${SENT.length} scalar values replaced; ${PUBLISHED_KEYS.size} published keys`);
  ok(`ARM S2 (REACH): ${SENT.length} scalars were sentinelised, floor 12 — a record with nothing in it would make S5 vacuous`,
     SENT.length >= 12);

  /* Member-visible text: the text between tags, PLUS the values of attributes a
     member actually reads. Everything else is structure. */
  const visibleText = (h) => {
    const attrs = [...String(h).matchAll(/\b(?:title|alt|aria-label|placeholder)="([^"]*)"/g)].map(m => m[1]);
    return String(h).replace(/<[^>]*>/g, " ") + " " + attrs.join(" ");
  };
  const tokens = (s) => s.split(/[^A-Za-z0-9%._:@\/-]+/).filter(Boolean);

  /* CLASSIFY BY DRIVING. A renderer is a function that returns markup when it is
     given a record — a PROPERTY of what it does, not of what it is called. */
  const renderers = [], others = [];
  for(const name of declared){
    const f = ctx[name] || U[name];
    let out;
    try{ out = await f(SENTINEL_SESSION, { type: SENTINEL_SESSION.context.type, id: SENTINEL_SESSION.context.id }); }
    catch(_){ out = undefined; }
    if(typeof out === "string" && /<[a-z]/i.test(out)) renderers.push([name, out]);
    else others.push([name, out === undefined ? "undefined" : typeof out]);
  }
  console.log(`  ARM S classification (by driving, not by name): ${renderers.length} renderers — ${renderers.map(r=>r[0]).join(", ")}`);
  console.log(`  ARM S classification: ${others.length} non-renderers — ${others.map(o=>`${o[0]}:${o[1]}`).join(", ")}`);
  ok(`ARM S3 (REACH): ${renderers.length} functions returned markup for the record's own shape, floor 4`,
     renderers.length >= 4);
  eq("ARM S3b: every function in the block is CLASSIFIED — a function that is neither a renderer nor a non-renderer "
     + "would be one this sweep cannot see, which is how five capped ops went invisible one item ago",
     renderers.length + others.length, declared.length);

  let swept = 0;
  const strays = [];
  for(const [name, out] of renderers){
    for(const tk of tokens(visibleText(out))){
      swept++;
      if(SENT.includes(tk)) continue;
      if(PUBLISHED_KEYS.has(tk.toLowerCase())) continue;
      strays.push(`${name} renders '${tk}', which the record did not publish`);
    }
  }
  console.log(`  ARM S swept: ${swept} visible tokens across ${renderers.length} renderers`);
  ok(`ARM S4 (REACH): ${swept} visible tokens were swept, floor 20 — a sweep over an empty corpus reports clean`,
     swept >= 20);
  eq("ARM S5: THE SURFACE RENDERS NOTHING THE RECORD DID NOT PUBLISH. Every visible token is a value the record sent "
     + "or a key it named — a fallback sentence, an invented label, a unit word or a computed number is none of those",
     strays, []);
  /* THE SWEEP'S OWN CONTROL, IN-SUITE. A sweep that cannot go red is not a
     sweep, and this one is proved able to on every run rather than only when
     somebody remembers to break something. */
  const plantedStrays = tokens(visibleText(`<div>${SENT[0]} an-invented-word</div>`))
    .filter(tk => !SENT.includes(tk) && !PUBLISHED_KEYS.has(tk.toLowerCase()));
  eq("ARM S6 (the sweep's own polarity): a planted word that the record did not publish IS caught by the same "
     + "classifier the real corpus went through", plantedStrays, ["an-invented-word"]);
}

/* ============================================================
   ARM V · THE SURFACE HOLDS NO COPY OF THE PLANE'S VOCABULARY
   ============================================================ */
console.log("\n--- ARM V · no branch could render a word the record did not send ---");
{
  const app = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const blockM = /\/\*__AI_SESSION_START__\*\/([\s\S]*?)\/\*__AI_SESSION_END__\*\//.exec(app);
  const stripped = (blockM ? blockM[1] : "").replace(/\/\*[\s\S]*?\*\//g, "");
  /* Live-imported, never copied: rename a bound in the plane and this walk moves
     with it.

     SCOPED TO THE BLOCK, AND THE SCOPE IS A MEASUREMENT RATHER THAN A
     CONVENIENCE. Widening this walk to the whole of `app.html` was tried and is
     WRONG: the plane's vocabulary KEYS collide with unrelated, entirely
     legitimate strings elsewhere in the file — `"lease"` is `recR("lease", …)`,
     a different op about the query lease; `"cancelled"` is a meeting status in
     the docprofile code; and `"meaning"`, `"content"`, `"document"` and
     `"internet"` are `SURFACE_LEVELS`, this application's own vocabulary and not
     IS-6's. A whole-file walk would match a SPELLING across four unrelated
     domains, which is UI-46's failure mode running in the other direction —
     false alarms instead of blind spots, and a walk that cries wolf gets
     widened's opposite done to it soon enough. The containment that makes the
     narrow scope SOUND is not assumed either: ARM C measures that nothing
     outside the block can render run data at all. */
  /* `RUN_STATUS` ADDED 2026-08-07 (UI-49). The item gave the indicator's
     animation a SOURCE — the record's own status word, carried verbatim into a
     `data-status` attribute — and the natural wrong way to do that would have
     been `if(session.status === "running")` inside this block. Widening the walk
     is what makes the right way structural rather than remembered: the word
     lives in one CSS rule and `ai-session-context.test.mjs` pins THAT against
     this same live export, so the plane renaming it fails the build. */
  const terms = [
    ...Object.keys(RUN_BOUNDS), ...Object.values(RUN_BOUNDS),
    ...Object.keys(RUN_ENDINGS), ...Object.values(RUN_ENDINGS),
    ...Object.keys(OBSERVATION_STATES), ...Object.values(OBSERVATION_STATES),
    ...Object.keys(OBSERVATION_LEVELS), ...Object.values(OBSERVATION_LEVELS),
    ...Object.keys(RUN_STATUS),
  ];
  console.log(`  ARM V corpus: ${stripped.length} chars of comment-stripped block against ${terms.length} live-imported vocabulary terms`);
  ok(`ARM V0 (REACH): ${terms.length} vocabulary terms were imported live from the plane, floor 20 — an empty `
     + `vocabulary would make V1 vacuous`, terms.length >= 20);
  /* ONE FUNCTION, TWO CORPORA. The real block and the planted one below both go
     through this, so the polarity check cannot pass against a matcher the real
     run never used. */
  const heldBy = (corpus) => terms.filter(t => corpus.includes(`"${t}"`) || corpus.includes(`'${t}'`)
                                            || corpus.includes("`" + t + "`"));
  const held = heldBy(stripped);
  eq("ARM V1: the running-session block holds NO COPY of the plane's run vocabulary. It prints what arrived; a copy "
     + "here would be a word the surface could render on a run that never sent it, and it would go stale silently "
     + "the day IS-6 renamed a bound", held, []);
  const planted = heldBy(`const BOUNDS = ["${Object.keys(RUN_BOUNDS)[0]}"]; const E = '${Object.keys(RUN_ENDINGS)[0]}';`);
  eq("ARM V2 (polarity): the SAME walk finds a vocabulary copy when there is one to find — a matcher that finds "
     + "nothing passes everything, so V1's clean answer is a measurement rather than a silence",
     planted.sort(), [Object.keys(RUN_BOUNDS)[0], Object.keys(RUN_ENDINGS)[0]].sort());
}

/* ============================================================
   ARM C · CONTAINMENT — the sweep's answer BEYOND this one read
   ============================================================ */
console.log("\n--- ARM C · nothing outside the block can render run data ---");
{
  const app = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const script = /<script>\n([\s\S]*?)\n<\/script>/.exec(app)[1];
  const blockM = /\/\*__AI_SESSION_START__\*\/([\s\S]*?)\/\*__AI_SESSION_END__\*\//.exec(script);
  const outside = script.replace(blockM[0], "").replace(/\/\*[\s\S]*?\*\//g, "");
  const whole = script.replace(/\/\*[\s\S]*?\*\//g, "");
  console.log(`  ARM C corpus: ${whole.length} chars of comment-stripped script, of which ${outside.length} lie OUTSIDE the running-session block`);
  ok(`ARM C0 (REACH): the outside-the-block corpus is ${outside.length} chars, floor 100000 — a corpus that collapsed `
     + `to nothing would make C1 and C2 vacuous`, outside.length > 100000);

  /* (a) NO OTHER SURFACE ASKS FOR A RUN. If a second screen starts reading the
     run record, the "designed ONCE for every AI feature" rule has been broken in
     code while `SURFACES["ai-session"].kind` still says otherwise — the
     mirror-and-drift class arriving one layer below the registry that guards it. */
  const runOpsOutside = [...outside.matchAll(/\b(?:recR|recPostR|rec|recPost|api|apiR|apiQ|actAsk|intentAsk)\(\s*"(airun[a-z]*)"/g)]
    .map(m => m[1]);
  eq("ARM C1: NO surface outside the running-session block asks the plane for a run. A second screen reading `op=airun` "
     + "would be a second AI-session surface grown in code while the registry still asserted there was one",
     runOpsOutside, []);

  /* (b) NO OTHER FUNCTION RENDERS ONE — AND ARM C2 IS CORRECTED 2026-08-07
     (UI-49), NOT EXEMPTED, BECAUSE IT WAS RIGHT WHEN WRITTEN AND IS NOW THE
     WRONG RULE.

     It read: none of the block's renderers is called from outside the block.
     That was true, and UI-47's own sweep is what discovered WHY — the indicator
     had NO CALL SITE AT ALL, so §14a's actual promise (*any window focused on an
     inquiry or project shows an animated indicator that a job is running*) was
     undelivered. UI-49 exists to add exactly the call this arm forbade. Left
     standing it would have made delivering the promise FAIL THE BUILD, which is
     the inversion CLAUDE.md's correct-superseded-tests rule exists to prevent.

     WHAT REPLACES IT KEEPS THE CONTAINMENT AND IS NARROWER RATHER THAN WEAKER:
     the outside world may call ONE named entry point, `aiSessionContextHtml`,
     and NONE of the raw renderers. Everything a member can see still goes
     through the functions this suite sweeps, because that one door composes
     them; what changes is that there is now a door at all, and it is named. A
     window reaching past it to `aiSessionPanelHtml` — the shape that would let
     run data onto a screen this sweep never drove — still fails. */
  const DOOR = "aiSessionContextHtml";
  const rendererNames = ["aiSessionRead", "aiSessionPanelHtml", "aiSessionIndicatorHtml", "aiSessionBudgetHtml",
                         "aiSessionPrincipalHtml", "aiSessionConditionHtml"];
  const calledOutside = rendererNames.filter(f => new RegExp(`\\b${f}\\s*\\(`).test(outside));
  eq("ARM C2 (corrected 2026-08-07, UI-49): none of the block's RAW renderers is called from outside it — every path "
     + "that can put run data in front of a member goes through the functions this suite swept, and since UI-49 it "
     + "reaches them through ONE named door rather than not at all", calledOutside, []);
  ok(`ARM C2b (polarity): the same matcher DOES find those calls inside the block — ${rendererNames.filter(f => new RegExp(`\\b${f}\\s*\\(`).test(blockM[1])).length} of ${rendererNames.length} — so C2's empty answer is a measurement rather than a broken regex`,
     rendererNames.filter(f => new RegExp(`\\b${f}\\s*\\(`).test(blockM[1])).length >= 4);
  /* AND THE DOOR IS REAL, WHICH IS WHAT STOPS C2 FROM PASSING BECAUSE NOTHING
     OUTSIDE RENDERS A RUN AT ALL — the state UI-47 measured and UI-49 fixed.
     `ai-session-context.test.mjs` names WHICH WINDOWS call it; this arm only
     requires that the containment has an opening rather than being a wall. */
  ok(`ARM C3 (UI-49): the one door '${DOOR}' IS called from outside the block — a containment arm that passed because `
     + `nothing outside renders a run is exactly the undelivered promise UI-47's sweep found, and it must not read as clean`,
     new RegExp(`\\b${DOOR}\\s*\\(`).test(outside));
  ok(`ARM C3b: and the door is DECLARED inside the block, so the composition it performs is swept with everything else`,
     new RegExp(`function\\s+${DOOR}\\s*\\(`).test(blockM[1]));
}

/* ============================================================
   ARM O · OVER-STRICTNESS — a correct alternative must PASS
   ============================================================ */
console.log("\n--- ARM O · a record shaped unlike anything this file wrote must render ---");
{
  const alien = { id: "AIS-alien", context: { type: "inquiry", id: INQ },
    budget: [ { meter: "wall-clock-across-resumptions", ceiling: "18m", spent_so_far: "4m" } ],
    principal: { paid_by: "member", who: "MEM-3" },
    condition: { kind: "some-kind-nobody-here-wrote", detail: "a sentence this file never saw" } };
  const panel = U.aiSessionPanelHtml(alien, null);
  for(const frag of ["wall-clock-across-resumptions", "18m", "4m", "MEM-3", "some-kind-nobody-here-wrote"])
    ok(`ARM O1: a record named nothing like the plane's or this file's still renders its '${frag}'`, panel.includes(frag));
  eq("ARM O2: and the same values reach the surface, judged by the SAME function ARM W used — the over-strictness "
     + "arm is not a second, gentler instrument", wireFailures(panel, alien), []);
}

console.log(`\nai-session-wire: ${n - fails.length} pass, ${fails.length} fail`);
if(fails.length){ console.error(`ai-session-wire: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
process.exit(0);
