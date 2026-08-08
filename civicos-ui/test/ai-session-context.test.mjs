/* NEGATIVE CONTROL: every arm below was RUN on 2026-08-07 by ui49-agent through `node civicos-ui/test/run.mjs` (the WHOLE harness, never this suite alone). Each mutation passes a "the anchor exists, matches EXACTLY ONCE, and the bytes really changed" guard BEFORE the harness runs — UI-46's reach injection became a SILENT NO-OP by being anchored on the line its own defect removes, and UI-47's first vocabulary control was `[].concat([...])`, which keeps every term. EVERY RESTORE IS VERIFIED BY CONTENT AS WELL AS sha256: an NC harness in this repository once reported a byte-identical restore over a file that had NOT been restored. Clean tree: 77 pass, 0 fail; whole harness exit 0 at 38 harnesses.
   (1) THE ITEM'S OWN — REMOVE THE CALL SITE AGAIN, ONE WINDOW AT A TIME, so each names ITS OWN WINDOW rather than "the indicator is missing". **THE TWO HALVES ARE DELIBERATELY DIFFERENT MUTATIONS, because "there is a call" and "the call reaches the member" are two facts and a defined-but-uncalled renderer is exactly what this item exists to fix.**
       (1a) drop `${runs}` from `openInquiry`'s rendered template, LEAVING THE CALL IN PLACE -> **9 FAIL / 67 pass**, every one naming THE INQUIRY WINDOW: W1a (the window shows no indicator), W3/W4/W5/W6 (label, status, the status on the DOT, the address), E1/E2/E3 (the ended run and its still dot), and **ARM C4** — *"the answer is INTERPOLATED into what the window renders — a call whose result is dropped is a call site in name only"*. ARM C2 stays GREEN, correctly: the call IS still there. That is why C2 and C4 are two arms.
       (1b) replace `openProjectWorkspace`'s call with `const runs = "";` -> **9 FAIL / 67 pass**, every one naming THE PROJECT WORKSPACE: W2a, W2b (op=airun no longer asked after the gate), W3..W6, **A4 (the polarity arm — the run the owner MAY see stops rendering too)**, and ARM C2/C3 naming the function AND the line (`openProjectWorkspace at app.html:6309`).
   (2) INVENT AN INDICATOR WHERE NO RUN EXISTS. Make `aiSessionContextHtml` answer `<p class="ai-runs">nothing is running</p>` when nothing matched -> 2 FAIL / 74 pass: A2 (*the surface invented a notice where the record said nothing*) and **A2b, which is the sharper one — the window is no longer BYTE-IDENTICAL to the same member's window with an empty roster.** Note which arm did NOT fire and why: ARM B2 covers the OTHER absence path (`if(!ids.length) return ""`), and this mutation is past that early return. Two absences, two arms.
   (3) TELL THE TWO ABSENCES APART. Make `aiSessionRead` answer `{id, status:"unknown-run", context:null}` on `found === false` -> 1 FAIL / 75 pass here (A3, *the read stopped answering null*) **AND `ai-session-wire.test.mjs` fails INDEPENDENTLY with N2 and N4.** Two structurally different instruments, neither told about the other. **AND THE ARM THAT STAYED GREEN IS THE FINDING:** A1, which compares the two RENDERED windows, passed — because the invented record carried no context, so both still rendered nothing. That is UI-47's ARM N1b measured from the other side: the plane hands the surface nothing to branch on, so what a surface can still do wrong is INVENT, and A2/A3 are where that lands.
   (4) NEUTER THE CALL-SITE WALK. Make `bodyOf` answer null for every window -> **10 FAIL / 67 pass, headed by ARM C0b (REACH, AS A DELTA) printing the corpus AS ZERO**: *"the walk LOCATED 0 of 2 windows and read 0 chars of their bodies, floor 2"*, with the corpus line reading `0 of 2 windows LOCATED (none)`. **ARM C5, the polarity arm, fails too — and that is correct: a walk that finds nothing cannot honestly report that `openBundle` has no call site either.**
   (5) A PERCENTAGE, BY EITHER ROUTE, AND THE TWO ROUTES ARE NOT THE SAME.
       (5a) append `Math.round(row.consumed/row.allowed*100)+'%'` to `aiSessionPairsHtml` (the PANEL) -> `ai-session-wire` fails 4 (D1 x2, D2, and **ARM S5 independently**, which knows nothing about percentages); **THIS SUITE STAYS GREEN, and that is right — the indicator renders no budget, so the panel's defect is not this window's.** Recorded rather than smoothed, because a suite failing for a defect it does not cover is how a pin gets "fixed" into uselessness.
       (5b) put the same computation on the INDICATOR itself -> **3 FAIL / 74 pass here** — D1 naming the computed percentage for EACH window separately, and D2 (a percent sign at all, by any route) — plus `ai-session-wire` ARM S5 again, from the other direction.
   (6) POLARITY was confirmed on every pin: GREEN with the tree intact FIRST, then RED with the defect, never the reverse. ARMS B2, A4, C5, P5 and O are the in-suite polarity arms and run on every pass.
   (7) OVER-STRICTNESS, IN-SUITE AND ON EVERY RUN: ARM O drives a run whose status is a word nobody here wrote (`mid-flight-and-unlabelled`) and requires it to render AND to reach the dot — a surface that only accepted the three statuses the plane publishes today would break the day a fourth arrived, and it would break SILENTLY.
   (8) A FINDING FROM RUNNING A CONTROL, not from review: the first draft drove the "may not see" half with the MEMBER CLASS TOKEN and ARM A went RED AGAINST CORRECT BEHAVIOUR. `store.mjs`'s `#bundleGate` documents that a machine credential is DELIBERATELY NOT FILTERED (*"machine: not filtered"*), so the class token saw CAROL's project run and the two absences were not two absences. A real enrolled member (DAVE) is the only credential that can show a real withholding, and the suite says so at his declaration. */
/* ai-session-context.test.mjs — UI-49.
 *
 * THE ITEM IN ONE SENTENCE: `INVESTIGATIVE-SESSION.md` §14a promises that *any
 * window focused on an inquiry or a project shows an animated indicator that a
 * job is running*, and until this item `aiSessionIndicatorHtml` appeared
 * EXACTLY ONCE in `app.html` — its own definition. UI-38 built the surface,
 * UI-47 wired its read, and neither reached anybody. This suite pins the CALL,
 * from the two windows the promise names.
 *
 * ---- WHY THE PIN IS ON THE CALL AND NOT ON THE FUNCTION ----
 *
 * A defined-but-uncalled renderer is EXACTLY what this item exists to fix, and
 * UI-38's and UI-47's suites both went green over one — every arm they hold
 * drives `aiSessionIndicatorHtml` directly, which is why neither could see that
 * nothing else did. So the arms here DRIVE THE WINDOWS: `openInquiry` and
 * `openProjectWorkspace` are called for real, against the real plane, and the
 * indicator is looked for in what a member would be shown. An arm that reached
 * into the block would repeat the blind spot it was written to close.
 *
 * ---- WHY THE PLANE IS REAL AND NOTHING IS MOCKED ----
 *
 * `ai-session-wire.test.mjs` established the precedent and its reason holds
 * here twice over: a mock's envelope is this file's OPINION of the plane's
 * shape (D-173, nine shipped instances), and the whole claim of this item is
 * that what a member sees came from the record. The plane runs in miniflare,
 * `app.html`'s own `recR` speaks to it, real members are ENROLLED and LOGGED IN
 * because the project workspace's first read is a real gate, and the project is
 * promoted by its own owner's session so the plane stamps her.
 *
 * ---- WHAT THE DEVICE SUPPLIES, AND IT IS ONE THING ----
 *
 * **NO OP ANSWERS "WHICH RUNS ARE IN THIS CONTEXT."** `op=airun` and
 * `op=airunlog` are both keyed by run id, so a window cannot ask. The seam
 * therefore reads the ADDRESSES this device has already opened — the member's
 * own word — and asks the record about each. THE DEVICE SUPPLIES AN ADDRESS AND
 * NOTHING ELSE: the label, the status and WHETHER THE RUN BELONGS TO THIS
 * WINDOW are the record's answers. ARM W3 is the arm that proves it, by putting
 * a run in the roster whose context is a DIFFERENT inquiry and requiring the
 * window to show nothing — the device could not have known that.
 *
 * ---- WHY EVERY FIXTURE VALUE IS DRAWN AT RUNTIME ----
 *
 * "A hand copy agrees at ZERO COST" has cost this project four instruments now.
 * Every label, allowance and consumption below comes from `Math.random()` and is
 * PRINTED, so a literal in `app.html` cannot match a value that did not exist
 * when it was written. The ranges are four-digit and DISJOINT BY ASSERTION
 * (ARM D0b), because UI-47's first draft had a remainder collide with a
 * published `ticks` and an arm failed against correct behaviour.
 *
 * ---- AND THE MATCHER IS BOUNDARY-AWARE ----
 *
 * `includes("4")` finds a 4 in any timestamp, so every small integer reads as
 * present and a hand-typed value passes for free. One matcher, shared by the
 * wire pin and the derive-nothing pin, so the two cannot be judged by different
 * rules.
 */
import fs from "fs";
import vm from "vm";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";
/* LIVE-IMPORTED, NEVER COPIED. `RUN_STATUS` is the plane's own status
   vocabulary and ARM P pins the ONE place this application writes one of its
   words — a CSS attribute selector — against it, so a rename in the plane fails
   the build instead of silently killing the animation. */
import { RUN_STATUS } from "../../bio-plane/src/airun.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }
function eq(msg, got, want){
  const same = JSON.stringify(got) === JSON.stringify(want);
  ok(`${msg}${same ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`, same);
}

/* ---- the REAL plane, in miniflare. Resolved from bio-plane's own dependency
   tree rather than duplicated under civicos-ui. If it is absent the harness
   FAILS rather than skipping: a suite that quietly stops testing its subject is
   the defect the negative-control rule exists to catch. ---- */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("ai-session-context: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/ (this suite drives the actual plane; the windows are never mocked).");
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
  bindings: { ADMIN_TOKEN: "adm-ui49", MEMBER_TOKEN: "mem-ui49", PROBE_TOKEN: "prb-ui49", VERSION: "test" },
});

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* Direct plane calls, for SEEDING and for INDEPENDENT verification only. Every
   call the WINDOWS make goes through the bridged fetch further down. */
const post = async (op, body, tok = "mem-ui49") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-ui49") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ---- REAL ENROLLED MEMBERS. The project workspace's FIRST read is a real gate
   (7.9: an uninvited member cannot see that a project exists), and a class token
   has no member behind it — probed, not assumed: `op=whoami` on the member
   token answers `member: null`. So the owner is enrolled and logged in, and she
   promotes her own project so the plane stamps her the owner.
   `intent-write.test.mjs`'s arrangement, on this surface's side. ---- */
const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, "adm-ui49");
  if(!add || !add.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await post("enroll", { invite:add.invite, handle:id, password:`${id}-passphrase-1` });
  if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role:`member:${id}`, password:`${id}-passphrase-1` });
  if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await member("ruth", ["contribute"], "admin");   /* 4.2/4.3: the first two roster */
await member("gus",  ["contribute"], "admin");   /* members must be administrators */
const CAROL = await member("carol", ["contribute", "create_projects"]);
/* DAVE IS THE MEMBER NOBODY INVITED, and he exists because of a MEASUREMENT
   this suite made rather than an arrangement it copied. The first draft drove
   the "a run the viewer may not see" half with the MEMBER CLASS TOKEN and ARM A
   went red against correct behaviour: `#bundleGate` documents that a machine
   credential (`scope === "member"`) is DELIBERATELY NOT FILTERED — *"machine:
   not filtered"*, store.mjs — so the class token saw CAROL's project run and
   the two absences were not two absences at all. A real enrolled member is the
   only credential that can show a real withholding. */
const DAVE = await member("dave", ["contribute"]);

/* ---- THE FIXTURE VALUES, DRAWN AT RUNTIME. See the header. ---- */
const R = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const tag = () => Math.random().toString(36).slice(2, 10);
const INQ_ALLOWED   = R(3001, 3999);
const INQ_CONSUMED  = R(1007, 1499);
const PROJ_ALLOWED  = R(5001, 5999);
const PROJ_CONSUMED = R(2003, 2499);
const OTHER_ALLOWED = R(8001, 8999);
const LABEL_INQ   = `label-${tag()}`;
const LABEL_PROJ  = `label-${tag()}`;
const LABEL_OTHER = `label-${tag()}`;
const LABEL_DONE  = `label-${tag()}`;
console.log(`  fixture drawn at runtime — inquiry run ${INQ_CONSUMED}/${INQ_ALLOWED} '${LABEL_INQ}', `
  + `project run ${PROJ_CONSUMED}/${PROJ_ALLOWED} '${LABEL_PROJ}', elsewhere '${LABEL_OTHER}', ended '${LABEL_DONE}'`);
console.log(`  (a literal in app.html cannot match a value that did not exist when it was written)`);

/* ---- seed: two inquiries every member can see, and ONE PROJECT CAROL OWNS ---- */
const T0 = "2026-08-07T09:00:00Z";
const sha = (s) => createHash("sha256").update(s).digest("hex");
const promote = (id, objectType, tok = "mem-ui49") => {
  const md = `---\nid: ${id}\n---\n\n## Question\n\nfixture\n`;
  return post("promote", {
    bundleId: id, base: null, snapKey: "20260807T090000Z_inbox", author: "ruth",
    meta: { object_type: objectType, group: "believe-in-oakland",
            title: `fixture ${id}`,
            current_state: objectType === "project" ? "forming" : "open",
            created: T0, last_updated: T0 },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [],
  }, tok);
};
const INQ   = "INQ-2026-0807-ui49-watched";
const INQ2  = "INQ-2026-0807-ui49-elsewhere";
const PROJ  = "PROJ-2026-0807-ui49-carols";
await promote(INQ,  "inquiry");
await promote(INQ2, "inquiry");
await promote(PROJ, "project", CAROL);

const openRun = (run, contextType, contextId, label, bounds, tok = "mem-ui49") => post("airunopen", {
  run, contextType, contextId, label, mode: `mode-${tag()}`,
  /* CORRECTED 2026-08-08 BY SK-1, NOT EXEMPTED: `skill-<tag>` names a version and
     no PACK, and SK-1's C-22.7 requires the run to say which pack it is a
     version OF — two AI features write this one column. Still drawn at runtime. */
  principalClaude: "project", principalClaudeRef: `acct-${tag()}`, skillVersion: `pack-${tag()}@${tag()}`,
  bounds,
}, tok);

const RUN_INQ = "RUN-ui49-on-the-inquiry";
await openRun(RUN_INQ, "inquiry", INQ, LABEL_INQ,
  [{ bound: "fetches", allowed: INQ_ALLOWED, consumed: 0, unit: "requests" }]);
await post("airuntick", { run: RUN_INQ, consume: { fetches: INQ_CONSUMED } });

const RUN_PROJ = "RUN-ui49-on-the-project";
await openRun(RUN_PROJ, "project", PROJ, LABEL_PROJ,
  [{ bound: "fetches", allowed: PROJ_ALLOWED, consumed: 0, unit: "requests" }], CAROL);
await post("airuntick", { run: RUN_PROJ, consume: { fetches: PROJ_CONSUMED } }, CAROL);

/* A run in a DIFFERENT context, put in the device's roster on purpose. This is
   the arm that proves the device supplies an ADDRESS and not a claim. */
const RUN_OTHER = "RUN-ui49-somewhere-else";
await openRun(RUN_OTHER, "inquiry", INQ2, LABEL_OTHER,
  [{ bound: "fetches", allowed: OTHER_ALLOWED, consumed: 0, unit: "requests" }]);

/* A run in THIS inquiry that has ENDED. §14a promises an animated indicator
   that a job is RUNNING; this is the record that would make an unconditional
   animation a claim the record does not support. */
const RUN_DONE = "RUN-ui49-already-over";
await openRun(RUN_DONE, "inquiry", INQ, LABEL_DONE,
  [{ bound: "fetches", allowed: 7, consumed: 1, unit: "requests" }]);
await post("airunclose", { run: RUN_DONE, bound: "completed" });

/* ============================================================
   THE APPLICATION, RUNNING FOR REAL
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

/* THE DEVICE. A real store rather than the null stub, because the roster this
   item adds IS device state and a stub that answers null would make every
   indicator arm below vacuous — the shape of failure this project has measured
   three times. */
const DEVICE = new Map();
const localStorageStub = {
  getItem: (k) => DEVICE.has(k) ? DEVICE.get(k) : null,
  setItem: (k, v) => { DEVICE.set(k, String(v)); },
  removeItem: (k) => { DEVICE.delete(k); },
};
/* THE ROSTER IS SEEDED THE WAY THE APPLICATION WRITES IT — through
   `aiSessionOpen`, below — and NOT by this file typing the key. A test that
   wrote the key itself would be pinning its own opinion of the storage format,
   and the format would then be free to drift. */

const CALLED = [];
async function bridgeFetch(u, opts){
  const url = new URL(u, "http://x");
  CALLED.push(url.searchParams.get("op"));
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
  localStorage: localStorageStub, window:{ addEventListener(){}, open:()=>null },
  fetch:bridgeFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE","openInquiry","openProjectWorkspace","aiSessionOpen","aiSessionContextHtml",
  "aiSessionSeen","aiSessionRemember","aiSessionIndicatorHtml","aiSessionRead",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.base = "";
U.PLANE.session = true;
const asMember = (tok, handle) => {
  U.PLANE.token = tok;
  U.PLANE.me = { member:`m_${handle}`, handle, session:true, administer:false, capabilities:["contribute"] };
};
asMember("mem-ui49", "alice");

/* DOES THIS VALUE APPEAR ON THE SURFACE AS A VALUE? ONE matcher, used by the
   wire pin (ARM W) and by the derive-nothing pin (ARM D) alike — two matchers
   would be two instruments disagreeing about what "on the surface" means.
   BOUNDARY-AWARE: a bare `includes("4")` finds a 4 in a timestamp or an id, so
   every small integer reads as present and a hand-typed value passes for free. */
const RE_ESC = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function appearsAsAValue(rendered, v){
  const s = String(v);
  if(!/^[\w.:@/-]+$/.test(s)) return String(rendered).includes(s);
  return new RegExp(`(^|[^\\w.:@/-])${RE_ESC(s)}([^\\w.:@/-]|$)`).test(String(rendered));
}

/* THE TWO WINDOWS, DRIVEN. Named so every arm below can say WHICH ONE. */
const WINDOWS = [
  { name: "the inquiry window (openInquiry)", open: async () => { $$("#content")._html = ""; await U.openInquiry(INQ, true); return html("#content"); } },
  { name: "the project workspace (openProjectWorkspace)", open: async () => { $$("#content")._html = ""; await U.openProjectWorkspace(PROJ, true); return html("#content"); } },
];

/* ============================================================
   ARM B · THE BASELINE — the windows render at all, and show NO INDICATOR
   while this device holds no address. This runs FIRST, before anything is
   remembered, because "no record means NO INDICATOR" is only a measurement
   while the roster is genuinely empty.
   ============================================================ */
console.log("\n--- ARM B · with nothing remembered, the windows carry no indicator ---");
const BEFORE = {};
{
  eq("ARM B0: this device holds NO run addresses before anything is opened — an arm that started with a seeded "
     + "roster could not tell 'no indicator' from 'no window'", U.aiSessionSeen(), []);
  for(const w of WINDOWS){
    asMember(w.name.includes("project") ? CAROL : "mem-ui49", w.name.includes("project") ? "carol" : "alice");
    const out = await w.open();
    BEFORE[w.name] = out;
    ok(`ARM B1: ${w.name} RENDERED (${out.length} chars) — every arm below is about what this window shows, so a `
       + `window that rendered nothing would make all of them vacuous`, out.length > 200);
    ok(`ARM B2: and ${w.name} shows NO INDICATOR while nothing is running that this device knows of — not an `
       + `invented "nothing is running", which would be a claim about the record made by a surface that was told nothing`,
       !out.includes("ai-run"));
  }
}

/* ============================================================
   ARM W · THE INDICATOR RENDERS FROM THE WINDOW, AND EVERY VALUE IS THE
   RECORD'S. This is the item.
   ============================================================ */
console.log("\n--- ARM W · the indicator, rendered BY THE WINDOW, carrying the record's own values ---");

/* THE ROSTER IS FILLED THE WAY THE APPLICATION FILLS IT. Each address is opened
   through `aiSessionOpen`, exactly as a member following a `#session/<id>` link
   would — so this suite never writes the storage key and cannot pin a format
   that has drifted. */
asMember("mem-ui49", "alice");
await U.aiSessionOpen(RUN_INQ, true);
await U.aiSessionOpen(RUN_OTHER, true);
await U.aiSessionOpen(RUN_DONE, true);
asMember(CAROL, "carol");
await U.aiSessionOpen(RUN_PROJ, true);
asMember("mem-ui49", "alice");
{
  const seen = U.aiSessionSeen();
  ok(`ARM W0: the device remembered ${seen.length} addresses through the application's own path, floor 4 — a roster `
     + `this file wrote by hand would be pinning its own opinion of the format`, seen.length >= 4);
  eq("ARM W0b: and it remembered ADDRESSES only — no context, no label, no status. A device that remembered a run's "
     + "CONTEXT could claim a run belonged to a window the record never put it in; this one holds nothing to claim with",
     seen.every(x => typeof x === "string"), true);
}

const WIRE_INQ  = (await get("airun", `run=${RUN_INQ}`)).session;
const WIRE_PROJ = (await get("airun", `run=${RUN_PROJ}`, CAROL)).session;
ok("ARM W0c: the plane published the inquiry's run for the window to render at all", !!WIRE_INQ && WIRE_INQ.id === RUN_INQ);
ok("ARM W0d: and the project's, read by its owner", !!WIRE_PROJ && WIRE_PROJ.id === RUN_PROJ);

const PANELS = {};
{
  asMember("mem-ui49", "alice");
  CALLED.length = 0;
  PANELS.inquiry = await WINDOWS[0].open();
  ok("ARM W1a: THE INQUIRY WINDOW SHOWS THE RUNNING INDICATOR. §14a: any window focused on an inquiry shows an "
     + "animated indicator that a job is running — until UI-49 `aiSessionIndicatorHtml` had no call site anywhere, "
     + "so this is the arm that would go red if the CALL were removed again, naming THIS WINDOW",
     PANELS.inquiry.includes("ai-run"));
  ok("ARM W1b: and the inquiry window reached the plane for it — op=airun called BY THE WINDOW, not by this file",
     CALLED.includes("airun"));

  asMember(CAROL, "carol");
  CALLED.length = 0;
  PANELS.project = await WINDOWS[1].open();
  ok("ARM W2a: THE PROJECT WORKSPACE SHOWS THE RUNNING INDICATOR — the second window §14a names, asserted "
     + "separately so a failure says WHICH window lost its call site rather than 'the indicator is missing'",
     PANELS.project.includes("ai-run"));
  ok("ARM W2b: and the project workspace reached the plane for it, AFTER its own visibility gate cleared",
     CALLED.includes("airun") && CALLED.indexOf("projectparticipants") < CALLED.indexOf("airun"));
  asMember("mem-ui49", "alice");
}

/* EVERY VALUE ON THE INDICATOR IS THE WIRE'S. The label and the status are
   drawn at runtime and read back from the plane, so a literal could not match
   them. The id is the one thing the DEVICE supplied, and it is asserted
   separately for exactly that reason. */
for(const [wname, panel, wire] of [["the inquiry window", () => PANELS.inquiry, () => WIRE_INQ],
                                   ["the project workspace", () => PANELS.project, () => WIRE_PROJ]]){
  const p = panel(), w = wire();
  ok(`ARM W3 (${wname}): the run's LABEL is on the window (${w.label}), a value drawn at runtime that no literal in `
     + `app.html could have anticipated`, appearsAsAValue(p, w.label));
  ok(`ARM W4 (${wname}): the run's STATUS is on the window (${w.status}), the record's own word — the surface does `
     + `not decide whether a job is running`, appearsAsAValue(p, w.status));
  ok(`ARM W5 (${wname}): and the status reaches the DOT as the record wrote it, so the animation is the record's `
     + `claim rather than this surface's — an unconditional pulse over an ended run would be an overclaim`,
     p.includes(`data-status="${w.status}"`));
  ok(`ARM W6 (${wname}): the run's ADDRESS is on the window (${w.id})`, appearsAsAValue(p, w.id));
}

/* THE HAND COPY, THROUGH THE SAME MATCHER. What somebody would actually type
   into app.html: the right shape, plausible values, wrong in fact. It must NOT
   be found on the window. */
{
  const HAND_TYPED = { label: "the running session", status: "running", allowed: 500, consumed: 4 };
  const found = Object.entries(HAND_TYPED).filter(([, v]) => appearsAsAValue(PANELS.inquiry, v)).map(([k]) => k);
  /* `status` is REAL VOCABULARY rather than instance data, so a hand copy names
     it correctly for free — measured and printed rather than assumed away, the
     way UI-47's ARM W6 does. The arm therefore names what a hand copy CANNOT
     know and requires each of those to be absent. */
  console.log(`  ARM W7 measurement: a hand copy agrees FOR FREE on ${found.length} of 4 values (${found.join(", ") || "none"}) — `
    + `vocabulary rather than instance data, which is why this arm names what it cannot know`);
  for(const [what, v] of [["the label", HAND_TYPED.label], ["a plausible allowance", HAND_TYPED.allowed],
                          ["a plausible consumption", HAND_TYPED.consumed]])
    ok(`ARM W7: A HAND-TYPED VALUE FAILS THIS — ${what} (${JSON.stringify(v)}) is NOT on the window, because the `
       + `window prints the record and the record says something else`, !appearsAsAValue(PANELS.inquiry, v));
}

/* ============================================================
   ARM X · THE DEVICE SUPPLIES AN ADDRESS AND NOTHING ELSE
   ============================================================ */
console.log("\n--- ARM X · the record decides which window a run belongs to, not the device ---");
{
  ok(`ARM X0: the roster DOES hold the run over the other inquiry (${RUN_OTHER}) — without that, X1 would pass `
     + `because the device knew nothing rather than because the record decided`, U.aiSessionSeen().includes(RUN_OTHER));
  ok(`ARM X1: and the watched inquiry's window does NOT show it. Its label (${LABEL_OTHER}) is absent, so the context `
     + `match is the RECORD's answer through op=airun and not the device's claim`,
     !appearsAsAValue(PANELS.inquiry, LABEL_OTHER));
  ok(`ARM X1b: nor its allowance (${OTHER_ALLOWED}), checked as a second, independent value in case a label collided`,
     !appearsAsAValue(PANELS.inquiry, String(OTHER_ALLOWED)));
  ok(`ARM X2: symmetrically, the project workspace does not show the INQUIRY's run (${LABEL_INQ}) — checked in BOTH `
     + `directions, because a window that showed everything would pass one of these for free`,
     !appearsAsAValue(PANELS.project, LABEL_INQ));
  ok(`ARM X2b: and the inquiry window does not show the PROJECT's run (${LABEL_PROJ})`,
     !appearsAsAValue(PANELS.inquiry, LABEL_PROJ));
  /* THE CONTEXT TYPE, NOT ONLY THE ID. */
  eq("ARM X3: a run whose context TYPE differs shows nothing, even when the id matches — the record publishes both "
     + "and the surface compares both",
     U.aiSessionIndicatorHtml({ id:"R", label:"L", status:"running", context:{ type:"project", id:INQ } },
                              { type:"inquiry", id:INQ }), "");
}

/* ============================================================
   ARM E · THE RUN THAT ENDED — the animation is sourced, not assumed
   ============================================================ */
console.log("\n--- ARM E · a run that ended is still the record's to report, and it does not pulse ---");
{
  const WIRE_DONE = (await get("airun", `run=${RUN_DONE}`)).session;
  ok(`ARM E0: the plane published the ended run with a status of its own (${WIRE_DONE && WIRE_DONE.status}) — a run `
     + `still 'running' here would make E1 vacuous`, !!WIRE_DONE && WIRE_DONE.status !== "running");
  ok(`ARM E1: the ended run's status (${WIRE_DONE.status}) is on the window, VERBATIM — this surface reports what the `
     + `record says rather than hiding a run it has decided is uninteresting`,
     appearsAsAValue(PANELS.inquiry, WIRE_DONE.status));
  ok(`ARM E2: and its dot carries THAT word, so the CSS animates the running one and leaves this one still. The `
     + `failure direction is the safe one: an unrecognised status renders a still dot, never a false pulse`,
     PANELS.inquiry.includes(`data-status="${WIRE_DONE.status}"`));
  ok("ARM E3: both runs are on the window at once, each with its own word — so E2 is not passing because only one "
     + "indicator rendered",
     PANELS.inquiry.includes(`data-status="${WIRE_INQ.status}"`) && WIRE_INQ.status !== WIRE_DONE.status);
}

/* ============================================================
   ARM P · THE ONE PLACE THIS APPLICATION WRITES THE PLANE'S STATUS WORD
   ============================================================ */
console.log("\n--- ARM P · the animation's word is pinned to the plane's own vocabulary ---");
{
  const appSrc = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const sel = [...appSrc.matchAll(/\.ai-run\s+\.dot\[data-status="([^"]+)"\]/g)].map(m => m[1]);
  const statuses = Object.keys(RUN_STATUS);
  console.log(`  ARM P corpus: ${statuses.length} statuses live-imported from the plane (${statuses.join(", ")}); `
    + `${sel.length} data-status selector(s) in app.html (${sel.join(", ") || "none"})`);
  ok(`ARM P0 (REACH): ${statuses.length} statuses were imported live from the plane, floor 3 — an empty vocabulary `
     + `would make P2 vacuous`, statuses.length >= 3);
  eq("ARM P1: the animation is keyed on EXACTLY ONE status word — a second selector would be a second rule about "
     + "what counts as running, and the two would drift", sel.length, 1);
  ok(`ARM P2: and that word ('${sel[0]}') IS one the PLANE publishes, resolved against its live RUN_STATUS export `
     + `rather than against this file's opinion. Rename it in the plane and this arm goes red, which is what turns a `
     + `copy that would go stale silently into one that fails the build`, statuses.includes(sel[0]));
  /* AND THE BLOCK ITSELF HOLDS NO COPY. `ai-session-wire.test.mjs` ARM V is the
     general form of this, widened by UI-49 to include RUN_STATUS; this arm is
     the specific one, so a failure says which file and which word. */
  const blockM = /\/\*__AI_SESSION_START__\*\/([\s\S]*?)\/\*__AI_SESSION_END__\*\//.exec(appSrc);
  const stripped = (blockM ? blockM[1] : "").replace(/\/\*[\s\S]*?\*\//g, "");
  ok(`ARM P3 (REACH): the running-session block is ${stripped.length} comment-stripped chars, floor 1000`,
     stripped.length > 1000);
  const held = statuses.filter(s => stripped.includes(`"${s}"`) || stripped.includes(`'${s}'`) || stripped.includes("`"+s+"`"));
  eq("ARM P4: the JS block holds NO status word at all — it carries whatever arrived into an attribute and lets the "
     + "stylesheet decide. A comparison here would be a branch that could render one state as another", held, []);
  const planted = ["running", "finished"].filter(s => `const S = "${statuses[0]}";`.includes(`"${s}"`));
  eq("ARM P5 (polarity): the SAME matcher finds a status word when there is one to find — a matcher that finds "
     + "nothing passes everything", planted, [statuses[0]].filter(s => ["running","finished"].includes(s)));
}

/* ============================================================
   ARM A · THE TWO ABSENCES ARE ONE ABSENCE, AND NEITHER IS A NOTICE
   ============================================================ */
console.log("\n--- ARM A · unknown and unviewable render identically, and neither renders a notice ---");
{
  /* (a) AN ADDRESS THAT RESOLVES TO NOTHING. (b) AN ADDRESS THE VIEWER MAY NOT
     SEE — a real withholding: the run is over CAROL's project and DAVE was
     never invited to it, which the plane answers identically to (a). Both are
     put in the roster, then DAVE's window is driven and the two compared.
     DRIVEN AS DAVE THROUGHOUT — see his declaration above for why the member
     class token cannot show this. */
  const KEY = "ai-runs-seen";
  const savedRoster = DEVICE.get(KEY);

  DEVICE.delete(KEY);
  asMember(DAVE, "dave");
  /* DAVE'S OWN EMPTY-ROSTER BASELINE, taken here rather than borrowed from ARM
     B: the window carries the reader's own credential sentence, so comparing
     DAVE's window against ALICE's would fail for a reason with nothing to do
     with disclosure — UI-47 recorded exactly that correction one item ago. */
  const DAVE_BASE = await WINDOWS[0].open();

  /* The plane's own halves first, so a failure says WHICH layer moved. */
  const ansUnknown = await get("airun", `run=RUN-ui49-does-not-exist`, DAVE);
  const ansUnviewable = await get("airun", `run=${RUN_PROJ}`, DAVE);
  eq("ARM A0: the PLANE answers the two identically, apart from echoing back the id the caller itself supplied — "
     + "which is the caller's own word and discloses nothing",
     { ...ansUnknown, run: null }, { ...ansUnviewable, run: null });
  ok("ARM A0b: and the withholding is REAL — the SAME run answers for the member who may see it, so A1 is not "
     + "passing because the fixture is broken",
     !!(await get("airun", `run=${RUN_PROJ}`, CAROL)).session);

  /* (a) */
  DEVICE.set(KEY, JSON.stringify(["RUN-ui49-does-not-exist"]));
  const OUT_UNKNOWN = await WINDOWS[0].open();
  /* (b) */
  DEVICE.set(KEY, JSON.stringify([RUN_PROJ]));
  const OUT_UNVIEWABLE = await WINDOWS[0].open();

  eq("ARM A1: THE WINDOW RENDERS THE TWO IDENTICALLY. Telling an unknown run from one the viewer may not see would "
     + "be an ORACLE — a way to enumerate projects nobody invited you to by watching which absence you got",
     OUT_UNKNOWN, OUT_UNVIEWABLE);
  ok("ARM A2: and what it renders in place of the indicator is NOTHING — not an invented \"nothing is running\", "
     + "which would be a claim about the record made by a surface that asked and was told nothing",
     !OUT_UNKNOWN.includes("ai-run") && !OUT_UNKNOWN.includes("ai-runs"));
  ok("ARM A2b: the window is byte-identical to the same member's window with NOTHING in the roster, so the absence "
     + "is an absence and not a differently-shaped notice", OUT_UNKNOWN === DAVE_BASE);
  eq("ARM A3: the read itself answers null for both, so the two collapse BEFORE anything renders — by construction "
     + "rather than by two render paths that happen to agree",
     [await U.aiSessionRead({ session: "RUN-ui49-does-not-exist" }), await U.aiSessionRead({ session: RUN_PROJ })],
     [null, null]);
  ok("ARM A4 (polarity): the SAME address, read by the member who MAY see it, DOES render on her window — so the "
     + "identical nothing above is the gate working and not the surface being inert",
     await (async () => {
       asMember(CAROL, "carol");
       const out = await WINDOWS[1].open();
       return out.includes("ai-run") && appearsAsAValue(out, LABEL_PROJ);
     })());

  asMember("mem-ui49", "alice");
  DEVICE.set(KEY, savedRoster);
}

/* ============================================================
   ARM D · IT DERIVES NOTHING, ASSERTED OVER THE WINDOW'S OWN OUTPUT
   ============================================================ */
console.log("\n--- ARM D · no percentage, no remainder, computed by no route, on the WINDOWS ---");
{
  const derived = [];
  for(const [where, wire] of [["inquiry", WIRE_INQ], ["project", WIRE_PROJ]])
    for(const b of (wire.budget || [])){
      if(!b.allowed) continue;
      derived.push([`${where} ${b.bound} percent`, String(Math.round((b.consumed / b.allowed) * 100))]);
      derived.push([`${where} ${b.bound} percent (1dp)`, (Math.round((b.consumed / b.allowed) * 1000) / 10).toFixed(1)]);
      derived.push([`${where} ${b.bound} remainder`, String(b.allowed - b.consumed)]);
    }
  console.log(`  ARM D corpus: ${PANELS.inquiry.length} + ${PANELS.project.length} chars of RENDERED window output; `
    + `${derived.length} derivations computed here and looked for`);
  ok(`ARM D0 (REACH): ${derived.length} candidate derivations were computed, floor 6 — an empty list would make D1 vacuous`,
     derived.length >= 6);
  /* THE INSTRUMENT ARM. A derivation that COLLIDES with a value the record
     published would make D1 unable to tell the two apart, in either direction —
     UI-47's first draft failed against correct behaviour that way when a
     remainder and a `ticks` were both 3. The disjointness is ASSERTED rather
     than arranged and forgotten, so nobody removes the four-digit ranges later
     as an arbitrary choice of numbers. */
  const publishedScalars = new Set();
  (function scal(v){
    if(Array.isArray(v)) return v.forEach(scal);
    if(v && typeof v === "object") return Object.values(v).forEach(scal);
    if(v !== null && v !== undefined) publishedScalars.add(String(v));
  })([WIRE_INQ, WIRE_PROJ]);
  const collisions = derived.filter(([, value]) => publishedScalars.has(value));
  eq("ARM D0b (instrument): no derivation this arm looks for COLLIDES with a value the record actually published — "
     + "a collision would make D1 unable to tell a forbidden derivation from a published figure",
     collisions.map(c => c[0]), []);
  for(const [what, value] of derived)
    for(const [wname, out] of [["the inquiry window", PANELS.inquiry], ["the project workspace", PANELS.project]])
      ok(`ARM D1: ${wname} does not compute the ${what} (${value}) — both figures are published separately and a `
         + `third would be this surface's own claim`, !appearsAsAValue(out, value));
  ok("ARM D2: and no percent sign is rendered by either window, by any route",
     !PANELS.inquiry.includes("%") && !PANELS.project.includes("%"));
}

/* ============================================================
   ARM C · THE CALL SITE, WALKED — so a failure names the WINDOW and the FILE
   ============================================================ */
console.log("\n--- ARM C · the call sites, read out of app.html by window ---");
{
  const appSrc = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const lines = appSrc.split("\n");
  /* THE FUNCTION'S OWN BODY, brace-matched out of the source, so this walk
     cannot be satisfied by a call somewhere else in the file. UI-46 measured
     that a walk matching a SPELLING goes blind the moment the spelling changes;
     this one matches a STRUCTURE — the window's own declaration. */
  function bodyOf(name){
    const i = appSrc.indexOf(`async function ${name}(`);
    if(i < 0) return null;
    let depth = 0, started = false;
    for(let p = appSrc.indexOf("{", i); p < appSrc.length; p++){
      const c = appSrc[p];
      if(c === "{"){ depth++; started = true; }
      else if(c === "}"){ depth--; if(started && depth === 0) return { text: appSrc.slice(i, p + 1), at: i }; }
    }
    return null;
  }
  const lineOf = (idx) => appSrc.slice(0, idx).split("\n").length;
  const SITES = [["openInquiry", "the inquiry window", `{ type:"inquiry", id }`],
                 ["openProjectWorkspace", "the project workspace", `{ type:"project", id }`]];
  const FOUND = SITES.map(([fn]) => [fn, bodyOf(fn)]);
  const located = FOUND.filter(([, b]) => !!b);
  console.log(`  ARM C corpus: app.html ${appSrc.length} chars across ${lines.length} lines; `
    + `${located.length} of ${SITES.length} windows LOCATED (${located.map(([f, b]) => `${f}@${lineOf(b.at)}:${b.text.length} chars`).join(", ") || "none"})`);
  ok(`ARM C0 (REACH): the walk read ${appSrc.length} chars, floor 500000 — a corpus that collapsed to nothing would `
     + `make every arm below vacuous`, appSrc.length > 500000);
  ok(`ARM C0b (REACH, AS A DELTA): the walk LOCATED ${located.length} of ${SITES.length} windows and read `
     + `${located.reduce((a, [, b]) => a + b.text.length, 0)} chars of their bodies, floor 2 windows — a walk that `
     + `found no window would report every call site clean, which is the shape three walks in this project have `
     + `already failed in`, located.length >= 2);
  for(const [fn, wname, ctxLit] of SITES){
    const b = bodyOf(fn);
    ok(`ARM C1 (${wname}): '${fn}' was located in app.html — a walk that could not find the window cannot say `
       + `anything about it`, !!b);
    const body = b ? b.text : "";
    ok(`ARM C2 (${wname}): ${fn} at app.html:${b ? lineOf(b.at) : "?"} CALLS aiSessionContextHtml. §14a promises the `
       + `indicator in THIS window; before UI-49 the renderer existed and NOTHING called it, which is the state this `
       + `item was raised to end`, /\baiSessionContextHtml\s*\(/.test(body));
    ok(`ARM C3 (${wname}): and it asks about ITS OWN context (${ctxLit}) — a window asking about the wrong object `
       + `would render an indicator that belongs somewhere else`, body.includes(ctxLit));
    ok(`ARM C4 (${wname}): and the answer is INTERPOLATED into what the window renders — a call whose result is `
       + `dropped is a call site in name only, which is this item's own defect wearing different clothes`,
       /\$\{runs\}/.test(body));
  }
  /* POLARITY: the same walk must NOT find the call in a window that has none. */
  const b3 = bodyOf("openBundle");
  ok(`ARM C5 (polarity): the same walk finds NO such call in openBundle, a window §14a does not name — so C2's `
     + `answers are measurements rather than a regex that matches anything`,
     !!b3 && !/\baiSessionContextHtml\s*\(/.test(b3.text));
}

/* ============================================================
   ARM O · OVER-STRICTNESS — a correct alternative must PASS
   ============================================================ */
console.log("\n--- ARM O · a record shaped unlike anything this file wrote must still show ---");
{
  const alien = { id: "AIS-alien", label: "a caption nobody here composed", status: "mid-flight-and-unlabelled",
                  context: { type: "inquiry", id: INQ } };
  const h = U.aiSessionIndicatorHtml(alien, { type: "inquiry", id: INQ });
  for(const frag of ["AIS-alien", "a caption nobody here composed", "mid-flight-and-unlabelled"])
    ok(`ARM O1: a run named nothing like the plane's or this file's still shows its '${frag}'`, h.includes(frag));
  ok("ARM O2: and an UNRECOGNISED status still reaches the dot, so the stylesheet — not this block — is what decides "
     + "whether it pulses. The surface renders the record it got, including one it has no word for",
     h.includes(`data-status="mid-flight-and-unlabelled"`));
}

await mf.dispose().catch(()=>{});
console.log(`\nai-session-context: ${n - fails.length} pass, ${fails.length} fail`);
if(fails.length){
  console.error(`ai-session-context: ${fails.length} of ${n} assertions FAILED`);
  for(const f of fails) console.error("  - " + f);
  process.exit(1);
}
process.exit(0);
